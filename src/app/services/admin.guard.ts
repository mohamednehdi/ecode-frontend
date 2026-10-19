import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

// Hides admin pages from non-admins. The real protection is on the backend
// (@admin_required), this guard only improves navigation.
export const AdminGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  // localStorage doesn't exist during server-side rendering
  if (!isPlatformBrowser(platformId)) {
    return false;
  }

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  if (localStorage.getItem('token') && user?.role === 'admin') {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
