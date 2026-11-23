import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, provideRouter } from '@angular/router';

import { LoginComponent } from './login.component';
import { API_URL } from '../../api.config';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let http: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule, RouterModule],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();
    component = TestBed.createComponent(LoginComponent).componentInstance;
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });
  afterEach(() => { http.verify(); localStorage.clear(); });

  const submit = (email: string, password: string) => {
    component.loginForm.setValue({ email, password });
    component.onSubmit();
  };

  it('asks for both fields without calling the server', () => {
    submit('', '');
    expect(component.errorMessage).toBe('Veuillez saisir votre email et votre mot de passe.');
    http.expectNone(`${API_URL}/auth/login`);
  });

  it('refuses a badly written email address in the form', () => {
    component.loginForm.setValue({ email: 'not-an-email', password: 'x' });
    expect(component.loginForm.valid).toBeFalse();
  });

  it('says so when the email or the password is wrong (401)', () => {
    submit('a@b.com', 'wrong');
    http.expectOne(`${API_URL}/auth/login`).flush({ error: 'bad' }, { status: 401, statusText: 'Unauthorized' });
    expect(component.errorMessage).toBe('Email ou mot de passe incorrect.');
  });

  it('shows the lockout message of the server after too many failed attempts (429)', () => {
    submit('a@b.com', 'wrong');
    http.expectOne(`${API_URL}/auth/login`).flush(
      { error: 'x', message: 'Trop de tentatives de connexion. Réessayez dans 12 minute(s).', retry_after: 700 },
      { status: 429, statusText: 'Too Many Requests' });
    expect(component.errorMessage).toBe('Trop de tentatives de connexion. Réessayez dans 12 minute(s).');
  });

  it('has a default lockout message when the server sends none', () => {
    submit('a@b.com', 'wrong');
    http.expectOne(`${API_URL}/auth/login`).flush({}, { status: 429, statusText: 'Too Many Requests' });
    expect(component.errorMessage).toBe('Trop de tentatives de connexion. Réessayez plus tard.');
  });

  it('says the back office is for administrators when a normal account logs in (403)', () => {
    submit('a@b.com', 'goodpassword');
    http.expectOne(`${API_URL}/auth/login`).flush({}, { status: 403, statusText: 'Forbidden' });
    expect(component.errorMessage).toBe('Accès réservé aux administrateurs.');
  });

  it('says the server is unreachable when it does not answer', () => {
    submit('a@b.com', 'goodpassword');
    http.expectOne(`${API_URL}/auth/login`).error(new ProgressEvent('error'));
    expect(component.errorMessage).toBe('Serveur injoignable, réessayez plus tard.');
  });

  it('keeps the session and opens the back office after a successful login', () => {
    submit('admin@b.com', 'goodpassword');
    http.expectOne(`${API_URL}/auth/login`).flush({ access_token: 'tok123', role: 'admin' });
    expect(localStorage.getItem('token')).toBe('tok123');
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual({ role: 'admin' });
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    http.expectOne(`${API_URL}/auth/me`).flush({ role: 'admin' });         // the user's name is loaded right after
    expect(component.errorMessage).toBe('');
  });
});
