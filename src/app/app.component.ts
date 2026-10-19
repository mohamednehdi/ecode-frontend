import { Component, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { SidebarService } from './services/sidebar.service'; // adjust path
import { Router, NavigationEnd ,Event} from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { filter } from 'rxjs/operators';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from './services/user.service'; // Add this
import { AuthService } from './services/auth.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  showLayout = true;
  isAdmin = false;
  // isSidebarOpen = true;
  username: string = '';
  faTimes = faTimes; // Close icon
  faBars = faBars; 
  isSidebarCollapsed = false;
  dropdownOpen = false;
 


  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: any, private userService: UserService, private authService: AuthService) {}



@ViewChild('dropdown', { static: false }) dropdownRef!: ElementRef;

@HostListener('document:click', ['$event'])
handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.user-info')) {
    this.dropdownOpen = false;
  }
}


toggleDropdown() {
  this.dropdownOpen = !this.dropdownOpen;
}
closeDropdown() {
  setTimeout(() => {
    this.dropdownOpen = false;
  }, 200); // small delay so the click event can register
}

logout() {
  // Revokes the token on the server and clears the local session
  this.authService.logout();
}

  
ngOnInit() {
    // Handle route-based layout display
    this.router.events
      .pipe(filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)) // ✅ Type guard
      .subscribe((event: NavigationEnd) => {
        const authRoutes = ['/login', '/signup', '/request-reset-password', '/verify-code', '/reset-password'];
        this.showLayout = !authRoutes.includes(event.urlAfterRedirects);
      });

    // Listen to user role and name changes
    this.userService.isAdmin$.subscribe(val => this.isAdmin = val);
    this.userService.username$.subscribe(name => this.username = name);

    // Call to load user info after login or app start
    this.userService.loadUserInfo();    
  }
   


  toggleSidebar() {
    // this.isSidebarOpen = !this.isSidebarOpen;
    this.isSidebarCollapsed = !this.isSidebarCollapsed; // Toggle the collapsed state
  }
}

 