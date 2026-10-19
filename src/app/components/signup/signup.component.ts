import { Component } from '@angular/core';

import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  imagePath: string = 'assets/signup-image.jpg';
  signupForm: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.signupForm = this.formBuilder.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      re_pass: new FormControl('', [Validators.required]),
    });
  }

  onSubmit() {
    this.errorMessage = '';
    if (this.signupForm.invalid) {
      this.errorMessage = 'Remplissez tous les champs (mot de passe : 8 caractères minimum).';
      return;
    }

    const { first_name, last_name, email, password, re_pass } = this.signupForm.value;
    if (password !== re_pass) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.authService.register(first_name, last_name, email, password).subscribe({
      next: () => {
        this.successMessage = 'Compte créé ! Un administrateur doit le valider avant votre première connexion.';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: error => {
        if (error.status === 400 && error.error?.message === 'User already exists') {
          this.errorMessage = 'Un compte existe déjà avec cet email.';
        } else {
          this.errorMessage = error.error?.message || 'Serveur injoignable, réessayez plus tard.';
        }
      }
    });
  }
}
