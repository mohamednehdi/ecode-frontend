import { Component } from '@angular/core';

import { Router } from '@angular/router';
import { FormBuilder, FormGroup , Validators, AbstractControl, FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  imagePath: string = 'assets/signup-image.jpg';
  signupForm: FormGroup;


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.signupForm = this.formBuilder.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(3)]),
      re_pass: new FormControl('', [Validators.required, Validators.minLength(3)]),
      //agree_term: new FormControl(false, [Validators.requiredTrue])
    });
  }


onSubmit() {
      if (this.signupForm.valid) {
        const { first_name, last_name, email, password, re_pass } = this.signupForm.value;
        
        if (password !== re_pass) {
          console.log('Passwords do not match');
          return;
        }
  
        this.authService.register(first_name , last_name, email, password).subscribe(
          response => {
            console.log('Registration successful', response);
            this.router.navigate(['/login']);
          },
          error => {
            if (error.status === 400) {
              console.log('User already exists');
            } else {
              console.log('An error occurred:', error);
            }
          }
        );
      } else {
        console.log('Form is invalid');
      }
    }
  
}
