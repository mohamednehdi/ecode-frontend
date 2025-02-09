import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  // Ensure we are in the browser before accessing localStorage
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token');

    if (token) {
      return true; // Allow access if the token exists
    } else {
      router.navigate(['/login']);
      return false; // Redirect to login if the token does not exist
    }
  }

  // If on the server, deny access
  return false;
};




// import { CanActivateFn, Router } from '@angular/router';

// export const authGuard: CanActivateFn = (route, state) => {
//   const token = localStorage.getItem('token');
//   const router = new Router();

//   if (token) {
//     return true;
//   } else {
//     router.navigate(['/login']);
//     return false;
//   }

  
// };
