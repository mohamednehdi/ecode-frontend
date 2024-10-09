import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
@Component({
  selector: 'app-verify-code',
  templateUrl: './verify-code.component.html',
  styleUrl: './verify-code.component.css'
})
export class VerifyCodeComponent {

  verifyForm: FormGroup;
  token: string | null = null;


  constructor(
    private fb: FormBuilder,
    private authService: AuthService, 
    private router :Router,
    private sharedService :SharedService
    ) {
    this.verifyForm = this.fb.group({
      code: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Retrieve the email from the shared service
    this.token = this.sharedService.getToken();
    if (!this.token) {
      // If no email is found, navigate back to request reset password component
      this.router.navigate(['/request-reset-password']);
      console.log(this.token);
    }
  }

  onSubmit() {
    const code = this.verifyForm.value.code;
    if (this.token) {
      this.authService.verifyCode(this.token, code).subscribe(
        response => {
          // Navigate to reset password component
          console.log(this.token);
          console.log('Verification code is valid', 200);
          console.log(code);
          this.router.navigate(['/reset-password']);

        },
        error => {
          // Handle error
          
          console.error('Error verifying code', error);
        }
      );
    }
  }
}
