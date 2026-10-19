import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { API_URL } from '../../api.config';

@Component({
  selector: 'app-upload-history',
  templateUrl: './upload-history.component.html',
  styleUrl: './upload-history.component.css'
})
export class UploadHistoryComponent implements OnInit, OnDestroy {
  history: any[] = [];

  constructor(private http: HttpClient, private router: Router, private sidebarService: SidebarService) {}

  ngOnDestroy(): void {
    this.sidebarService.setSidebarVisibility(false);
  }

  viewDetails(item: any) {
    this.router.navigate(['/history-detail'], { state: { barcode: item } });
  }

  ngOnInit(): void {
    this.sidebarService.setSidebarVisibility(true);

    // Authorization header is added by authInterceptor
    this.http.get<any[]>(`${API_URL}/scans/history`).subscribe({
      next: res => this.history = res,
      error: err => console.error('Error fetching scan history:', err)
    });
  }
}
