import { Component , OnInit} from '@angular/core';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  isSidebarOpen = false;
  faBars = faBars;
  faTimes = faTimes;
  isAdmin = false; // Set this based on your authentication logic

    constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkIfAdmin();
    this.router.events.subscribe(() => {
      this.checkIfAdmin();
    });
  }

    checkIfAdmin(): void {
    const url = this.router.url;
    this.isAdmin = url.startsWith('/dashboard'); // adjust if needed
  }
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  
}
