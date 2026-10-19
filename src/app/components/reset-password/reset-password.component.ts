import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  token: string | null = null;  // "reset" token received after the code was verified
  showSuccessMessage = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private sharedService: SharedService
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.token = this.sharedService.getToken();
    if (!this.token) {
      this.router.navigate(['/request-reset-password']);
    }
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mustMatch: true };
  }

  onSubmit() {
    if (!this.token) return;
    this.errorMessage = '';

    this.authService.resetPassword(this.token, this.resetPasswordForm.value.password).subscribe({
      next: () => {
        this.sharedService.clearToken();
        this.showSuccessMessage = true;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: error => {
        this.errorMessage = error.error?.error || 'Erreur lors de la réinitialisation.';
      }
    });
  }

  closePopup() {
    this.showSuccessMessage = false;
  }
}
