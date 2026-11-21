import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, provideRouter } from '@angular/router';

import { RequestResetPasswordComponent } from './request-reset-password.component';
import { SharedService } from '../../services/shared.service';
import { API_URL } from '../../api.config';

describe('RequestResetPasswordComponent', () => {
  let component: RequestResetPasswordComponent;
  let http: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestResetPasswordComponent],
      imports: [ReactiveFormsModule, RouterModule],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();
    component = TestBed.createComponent(RequestResetPasswordComponent).componentInstance;
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });
  afterEach(() => http.verify());

  it('needs a well-formed email address', () => {
    component.resetForm.setValue({ email: '' });
    expect(component.resetForm.valid).toBeFalse();
    component.resetForm.setValue({ email: 'x@y.com' });
    expect(component.resetForm.valid).toBeTrue();
  });

  it('keeps the "verify" token and goes to the code page once the code is emailed', () => {
    component.resetForm.setValue({ email: 'x@y.com' });
    component.onSubmit();
    expect(component.loading).toBeTrue();
    http.expectOne(`${API_URL}/auth/request-password-reset`).flush({ token: 'verify-token' });
    expect(TestBed.inject(SharedService).getToken()).toBe('verify-token');
    expect(router.navigate).toHaveBeenCalledWith(['/verify-code']);
    expect(component.loading).toBeFalse();
  });

  it('shows the message of the server when the request fails', () => {
    component.resetForm.setValue({ email: 'x@y.com' });
    component.onSubmit();
    http.expectOne(`${API_URL}/auth/request-password-reset`).flush({ error: 'Trop de demandes' }, { status: 429, statusText: 'Too Many' });
    expect(component.errorMessage).toBe('Trop de demandes');
    expect(component.loading).toBeFalse();
  });
});
