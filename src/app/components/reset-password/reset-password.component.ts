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
  token: string | null = null;
  showSuccessMessage = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private sharedService: SharedService
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },{ validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Retrieve the token from the shared service
    this.token = this.sharedService.getToken();
    if (!this.token) {
      // If no token is found, navigate back to request reset password component
      this.router.navigate(['/request-reset-password']);
    }
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mustMatch: true };
  }

  onSubmit() {
    const password = this.resetPasswordForm.value.password;
    if (this.token) {
      this.authService.resetPassword(this.token, password).subscribe(
        response => {
          // Clear the token from the shared service
          this.sharedService.clearToken();
          this.showSuccessMessage = true;
          // Handle success, perhaps navigate to login page
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error => {
          // Handle error
          console.error('Error resetting password', error);
        }
      );
    }
  }

  closePopup() {
    this.showSuccessMessage = false;
  }
}
