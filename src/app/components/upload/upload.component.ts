import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent implements OnInit , OnDestroy {
  uploadedImage: string | ArrayBuffer | null = null;
  processedImage: string | ArrayBuffer | null = null;
  barcodes: { type: string, data: string }[] = [];

  constructor(private http: HttpClient,private router: Router,private sidebarService : SidebarService ) { }
  
  ngOnInit(): void {
    this.sidebarService.setSidebarVisibility(true);
  }

  ngOnDestroy(): void {
    this.sidebarService.setSidebarVisibility(false);
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.uploadedImage = reader.result;
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('file', file);


      // ✅ Get token from localStorage
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.post('http://localhost:5000/api/upload', formData, { headers,withCredentials:true }).subscribe({
        next: (res: any) => {
          console.log('Upload success:', res);
          this.processedImage = 'data:image/jpeg;base64,' + res.image;
          this.barcodes = res.barcodes;
        },
        error: (err) => {
          console.error('Upload failed:', err);
        }
      });
    
    }
  }

  
  logout(): void {
    // Clear session or token
    localStorage.clear(); // or sessionStorage.clear(); if you use sessionStorage
    // Redirect to login page
    this.router.navigate(['/login']);
  }

  // ngOnInit(): void {
  //   // Prevent back navigation after logout
  //   history.pushState(null, '', location.href);
  //   window.onpopstate = () => {
  //     history.pushState(null, '', location.href);
  //   };
  // }
}
