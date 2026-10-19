import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-verify-code',
  templateUrl: './verify-code.component.html',
  styleUrl: './verify-code.component.css'
})
export class VerifyCodeComponent implements OnInit {

  verifyForm: FormGroup;
  token: string | null = null;
  errorMessage = '';
  mustRestart = false;  // true when the code is burned or the link expired

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private sharedService: SharedService
  ) {
    this.verifyForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit() {
    this.token = this.sharedService.getToken();
    if (!this.token) {
      this.router.navigate(['/request-reset-password']);
    }
  }

  onSubmit() {
    if (!this.token) return;
    this.errorMessage = '';

    this.authService.verifyCode(this.token, this.verifyForm.value.code).subscribe({
      next: response => {
        // Replace the "verify" token with the "reset" token: only it allows changing the password
        this.sharedService.setToken(response.reset_token);
        this.router.navigate(['/reset-password']);
      },
      error: error => {
        const body = error.error || {};
        if (body.attempts_left !== undefined && body.attempts_left > 0) {
          this.errorMessage = `Code incorrect. Il vous reste ${body.attempts_left} tentative(s).`;
        } else {
          this.errorMessage = body.error || 'Code invalide ou expiré.';
          this.mustRestart = true;
        }
      }
    });
  }

  restart() {
    this.sharedService.clearToken();
    this.router.navigate(['/request-reset-password']);
  }
}
