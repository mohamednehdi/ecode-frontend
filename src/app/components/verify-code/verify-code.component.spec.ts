import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, provideRouter } from '@angular/router';

import { VerifyCodeComponent } from './verify-code.component';
import { SharedService } from '../../services/shared.service';
import { API_URL } from '../../api.config';

describe('VerifyCodeComponent', () => {
  let http: HttpTestingController;
  let router: Router;
  let shared: SharedService;

  const create = (tokenInStore: string | null) => {
    if (tokenInStore) shared.setToken(tokenInStore);
    const component = TestBed.createComponent(VerifyCodeComponent).componentInstance;
    component.ngOnInit();
    return component;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerifyCodeComponent],
      imports: [ReactiveFormsModule, RouterModule],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    shared = TestBed.inject(SharedService);
    spyOn(router, 'navigate').and.resolveTo(true);
  });
  afterEach(() => http.verify());

  it('sends the visitor back to the first step when there is no token', () => {
    create(null);
    expect(router.navigate).toHaveBeenCalledWith(['/request-reset-password']);
  });

  it('accepts only a 6-digit code', () => {
    const component = create('t1');
    for (const bad of ['', '12345', '1234567', 'abcdef', '12 456']) {
      component.verifyForm.setValue({ code: bad });
      expect(component.verifyForm.valid).withContext(bad).toBeFalse();
    }
    component.verifyForm.setValue({ code: '123456' });
    expect(component.verifyForm.valid).toBeTrue();
  });

  it('swaps the verify token for the reset token and goes to the last step', () => {
    const component = create('t1');
    component.verifyForm.setValue({ code: '123456' });
    component.onSubmit();
    const req = http.expectOne(`${API_URL}/auth/verify-code`);
    expect(req.request.body).toEqual({ token: 't1', code: '123456' });
    req.flush({ reset_token: 'reset-token' });
    expect(shared.getToken()).toBe('reset-token');
    expect(router.navigate).toHaveBeenCalledWith(['/reset-password']);
  });

  it('tells how many attempts are left after a wrong code', () => {
    const component = create('t1');
    component.verifyForm.setValue({ code: '000000' });
    component.onSubmit();
    http.expectOne(`${API_URL}/auth/verify-code`).flush({ error: 'x', attempts_left: 3 }, { status: 400, statusText: 'Bad Request' });
    expect(component.errorMessage).toBe('Code incorrect. Il vous reste 3 tentative(s).');
    expect(component.mustRestart).toBeFalse();
  });

  it('asks to start again when the code is burned or expired', () => {
    const component = create('t1');
    component.verifyForm.setValue({ code: '000000' });
    component.onSubmit();
    http.expectOne(`${API_URL}/auth/verify-code`).flush({ error: 'Code expiré' }, { status: 400, statusText: 'Bad Request' });
    expect(component.errorMessage).toBe('Code expiré');
    expect(component.mustRestart).toBeTrue();
    component.restart();
    expect(shared.getToken()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/request-reset-password']);
  });
});
