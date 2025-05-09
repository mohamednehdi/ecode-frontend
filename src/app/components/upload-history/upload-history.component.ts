import { Component } from '@angular/core';
import { FileUploadService } from '../../file-upload.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
@Component({
  selector: 'app-upload-history',
  templateUrl: './upload-history.component.html',
  styleUrl: './upload-history.component.css'
})
export class UploadHistoryComponent {
  history: any[] = [];

  constructor(private http: HttpClient,private router : Router ) {}

  viewDetails(item: any) {
    this.router.navigate(['/history-detail'], { state: { barcode: item } });
  }

  ngOnInit(): void {
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
