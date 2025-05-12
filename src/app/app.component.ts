import { Component, OnInit } from '@angular/core';
import { SidebarService } from './services/sidebar.service'; // adjust path

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showSidebar = false;

  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {
    this.sidebarService.showSidebar$.subscribe((visible) => {
      this.showSidebar = visible;
    });
  }
}
 