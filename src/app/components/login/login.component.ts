import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  imagePath: string = 'assets/signin-image.jpg';
  loginForm: FormGroup;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService) {
      this.loginForm = this.formBuilder.group({
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required, Validators.minLength(3)]),
      });
  }

  onSubmit() {
    const user = this.loginForm.value;
  
    const email: string = user.email?.toString() ?? '';
    const password: string = user.password?.toString() ?? '';
  
    if (email && password) {
      this.authService.login(email, password).subscribe(response => {
        console.log('Full response:', response.body);  // Log the full response to see its structure
  
        if (response.status === 200 && response.body.access_token) {
          const token = response.body.access_token;
          localStorage.setItem('token', token);  // Store token in local storage
          console.log('Token:', token);

          // const testToken = this.authService.getToken(); // Retrieve the token from local storage
          // console.log('Test Token:', testToken); // Log the retrieved token
  

          const userRole = response.body.role;
          localStorage.setItem('user', JSON.stringify({ role: userRole })); // Store user data
          
          console.log('User Role:', userRole);
  
          // Check the role and redirect accordingly
          if (userRole === 'admin') {
            this.router.navigate(['/admin']);  // Redirect to the admin page if the user is an admin
          } else {
            this.router.navigate(['/upload']);  // Redirect to the normal user page
          }
  
          console.log('Login successful', 200);
        }
      }, error => {
        if (error.status === 401) {
          console.log('Login failed', 401);
        } else {
          console.log('An error occurred:', error);
        }
      });
    } else {
      console.log('Login failed: Email or password is missing.');
    }
  }
  
}




