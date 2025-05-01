import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { SidebarService } from '../../services/sidebar.service';
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit, OnDestroy{

  faTimes = faTimes; // Close icon
  faBars = faBars; 
  constructor(private sidebarService: SidebarService) {}
  ngOnInit(): void {
    this.sidebarService.setSidebarVisibility(true);
  }

  ngOnDestroy(): void {
    this.sidebarService.setSidebarVisibility(false);
  }

logout() {
throw new Error('Method not implemented.');
}
isSidebarOpen = false;

toggleSidebar() {
  this.isSidebarOpen = !this.isSidebarOpen;
}
}
