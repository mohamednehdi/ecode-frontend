import { Component, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { SidebarService } from './services/sidebar.service'; // adjust path
import { Router, NavigationEnd ,Event} from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { filter } from 'rxjs/operators';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from './services/user.service'; // Add this
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Add this



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
 


  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: any,private userService: UserService, private http:HttpClient) {}



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
  // ✅ Get token from localStorage
  const token = localStorage.getItem('token'); // adjust the key if needed
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  this.http.post('http://localhost:5000/auth/logout', {}, { headers, withCredentials: true }).subscribe({
    next: () => {
      localStorage.removeItem('token'); // adjust if you're storing a user object instead
      this.router.navigate(['/login']);
      console.log('Logout successful');
      
    },
    error: (err) => {
      console.error('Logout failed:', err);
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    }
  });
}

  
ngOnInit() {
    // Handle route-based layout display
    this.router.events
      .pipe(filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)) // ✅ Type guard
      .subscribe((event: NavigationEnd) => {
        const authRoutes = ['/login', '/signup'];
        this.showLayout = !authRoutes.includes(event.urlAfterRedirects);
      });

    // Listen to user role and name changes
    this.userService.isAdmin$.subscribe(val => this.isAdmin = val);
    this.userService.username$.subscribe(name => {
      this.username = name;
      console.log('Username:', this.username);  // <-- Add this to debug

    });

    // Call to load user info after login or app start
    this.userService.loadUserInfo();    
  }
   


  toggleSidebar() {
    // this.isSidebarOpen = !this.isSidebarOpen;
    this.isSidebarCollapsed = !this.isSidebarCollapsed; // Toggle the collapsed state
  }
}

 