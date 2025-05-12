import { Component, OnDestroy, OnInit } from '@angular/core';
import { FileUploadService } from '../../file-upload.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
@Component({
  selector: 'app-upload-history',
  templateUrl: './upload-history.component.html',
  styleUrl: './upload-history.component.css'
})
export class UploadHistoryComponent implements OnInit , OnDestroy {
  history: any[] = [];

  constructor(private http: HttpClient,private router : Router , private sidebarService :SidebarService) {}



  ngOnDestroy(): void {
    this.sidebarService.setSidebarVisibility(false);
  }
  viewDetails(item: any) {
    this.router.navigate(['/history-detail'], { state: { barcode: item } });
  }

  ngOnInit(): void {
    this.sidebarService.setSidebarVisibility(true);
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found in localStorage');
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get('http://localhost:5000/api/history', {
      headers,
      withCredentials: true
    }).subscribe({
      next: (res: any) => {
        console.log('Scan history:', res);
        this.history = res;
      },
      error: (err) => {
        console.error('Error fetching scan history:', err);
      }
    });
  }
}
