import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-request-reset-password',
  templateUrl: './request-reset-password.component.html',
  styleUrl: './request-reset-password.component.css'
})
export class RequestResetPasswordComponent {

  resetForm: FormGroup;
  errorMessage = '';
  loading = false;

  constructor(private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private sharedService: SharedService) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    this.errorMessage = '';
    this.loading = true;
    this.authService.requestResetPassword(this.resetForm.value.email).subscribe({
      next: response => {
        this.loading = false;
        // "verify" token: only allows submitting the emailed code
        this.sharedService.setToken(response.token);
        this.router.navigate(['/verify-code']);
      },
      error: error => {
        this.loading = false;
        this.errorMessage = error.error?.error || 'Serveur injoignable, réessayez plus tard.';
      }
    });
  }
}
