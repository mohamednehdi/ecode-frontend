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

  constructor(private router: Router,
    private fb: FormBuilder, 
    private authService: AuthService,
    private sharedService: SharedService) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    const email = this.resetForm.value.email;
    this.authService.requestResetPassword(email).subscribe(
      response => {
        // Store the email in the shared service
        this.sharedService.setToken(response.token);
        console.log('Email sent successfully', 200);
        // Navigate to verify code component
        this.router.navigate(['/verify-code']);
      },
      error => {
        // Handle error
        console.error('Error requesting password reset', error);
      }
    );
  }
}
