import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, provideRouter } from '@angular/router';

import { ResetPasswordComponent } from './reset-password.component';
import { SharedService } from '../../services/shared.service';
import { API_URL } from '../../api.config';

describe('ResetPasswordComponent', () => {
  let http: HttpTestingController;
  let router: Router;
  let shared: SharedService;

  const create = (tokenInStore: string | null) => {
    if (tokenInStore) shared.setToken(tokenInStore);
    const component = TestBed.createComponent(ResetPasswordComponent).componentInstance;
    component.ngOnInit();
    return component;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResetPasswordComponent],
      imports: [ReactiveFormsModule, RouterModule],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    shared = TestBed.inject(SharedService);
    spyOn(router, 'navigate').and.resolveTo(true);
  });
  afterEach(() => http.verify());

  it('sends the visitor back to the first step when there is no reset token', () => {
    create(null);
    expect(router.navigate).toHaveBeenCalledWith(['/request-reset-password']);
  });

  it('wants at least 8 characters and two identical passwords', () => {
    const component = create('r1');
    component.resetPasswordForm.setValue({ password: 'short', confirmPassword: 'short' });
    expect(component.resetPasswordForm.valid).toBeFalse();
    component.resetPasswordForm.setValue({ password: 'longenough1', confirmPassword: 'different11' });
    expect(component.resetPasswordForm.hasError('mustMatch')).toBeTrue();
    component.resetPasswordForm.setValue({ password: 'longenough1', confirmPassword: 'longenough1' });
    expect(component.resetPasswordForm.valid).toBeTrue();
  });

  it('changes the password, forgets the token, confirms, then goes to the login page', fakeAsync(() => {
    const component = create('r1');
    component.resetPasswordForm.setValue({ password: 'longenough1', confirmPassword: 'longenough1' });
    component.onSubmit();
    const req = http.expectOne(`${API_URL}/auth/reset-password`);
    expect(req.request.body).toEqual({ token: 'r1', password: 'longenough1' });
    req.flush({});
    expect(shared.getToken()).toBeNull();
    expect(component.showSuccessMessage).toBeTrue();
    tick(2000);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('shows the message of the server when the reset is refused', () => {
    const component = create('r1');
    component.resetPasswordForm.setValue({ password: 'longenough1', confirmPassword: 'longenough1' });
    component.onSubmit();
    http.expectOne(`${API_URL}/auth/reset-password`).flush({ error: 'Lien expiré' }, { status: 400, statusText: 'Bad Request' });
    expect(component.errorMessage).toBe('Lien expiré');
  });
});
