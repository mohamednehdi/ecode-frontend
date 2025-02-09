import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

export const AdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const userData = localStorage.getItem('user'); // Get user data from local storage
  const user = userData ? JSON.parse(userData) : null; // Parse JSON if exists
  if (user && user.role === 'admin') {
    return true; // Allow access to the route
  }

  // If the user is not an admin, redirect them to the login page or any other page
  router.navigate(['/login']);
  return false;
};
