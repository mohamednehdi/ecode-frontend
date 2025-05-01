import { Component } from '@angular/core';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  isSidebarOpen = false;
  faBars = faBars;
  faTimes = faTimes;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  
}
