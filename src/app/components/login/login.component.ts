import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  imagePath: string = 'assets/signin-image.jpg';
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private router: Router,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private authService: AuthService) {
      this.loginForm = this.formBuilder.group({
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required]),
      });
  }

  onSubmit() {
    this.errorMessage = '';
    const email: string = this.loginForm.value.email?.toString() ?? '';
    const password: string = this.loginForm.value.password?.toString() ?? '';

    if (!email || !password) {
      this.errorMessage = 'Veuillez saisir votre email et votre mot de passe.';
      return;
    }

    this.authService.login(email, password).subscribe({
      next: response => {
        const { access_token, role } = response.body;
        this.authService.saveSession(access_token, role);
        this.userService.loadUserInfo();
        this.router.navigate(['/dashboard']);
      },
      error: error => {
        if (error.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect.';
        } else if (error.status === 429) {
          // too many failed attempts: the server says for how long
          this.errorMessage = error.error?.message || 'Trop de tentatives de connexion. Réessayez plus tard.';
        } else if (error.status === 403) {
          this.errorMessage = error.error?.message || 'Accès réservé aux administrateurs.';
        } else {
          this.errorMessage = 'Serveur injoignable, réessayez plus tard.';
        }
      }
    });
  }
}
