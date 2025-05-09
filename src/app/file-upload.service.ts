import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private baseUrl = 'http://localhost:5000/api/'; // Replace with your actual upload URL
  // private uploadUrl = 'http://localhost:5001/upload'; // Replace with your actual upload URL

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<any>(`${this.baseUrl}/upload`, formData).pipe(
      map(response => {
        return {
          image: 'data:image/jpeg;base64,' + response.image,
          barcodes: response.barcodes
        };
      })
    );
  }
  getHistory(): Observable<any> {
    let token = '';
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      token = localStorage.getItem('token')!;
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    return this.http.get(`${this.baseUrl}/history`, { headers });
  }
  
}
