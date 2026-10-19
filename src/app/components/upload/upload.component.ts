import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SidebarService } from '../../services/sidebar.service';
import { API_URL } from '../../api.config';

const ALLOWED_TYPES = ['image/png', 'image/jpeg'];
const MAX_SIZE_MB = 10;

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent implements OnInit, OnDestroy {
  uploadedImage: string | ArrayBuffer | null = null;
  processedImage: string | ArrayBuffer | null = null;
  barcodes: { type: string, data: string }[] = [];
  errorMessage = '';
  loading = false;

  constructor(private http: HttpClient, private sidebarService: SidebarService) { }

  ngOnInit(): void {
    this.sidebarService.setSidebarVisibility(true);
  }

  ngOnDestroy(): void {
    this.sidebarService.setSidebarVisibility(false);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];

    this.errorMessage = '';
    this.processedImage = null;
    this.barcodes = [];

    // Same checks as the backend, so the user gets an immediate message
    if (!ALLOWED_TYPES.includes(file.type)) {
      this.errorMessage = 'Format non supporté (PNG ou JPG uniquement).';
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      this.errorMessage = `Fichier trop volumineux (max ${MAX_SIZE_MB} Mo).`;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => this.uploadedImage = reader.result;
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('file', file);

    this.loading = true;
    this.http.post<any>(`${API_URL}/scans/upload`, formData).subscribe({
      next: res => {
        this.loading = false;
        this.processedImage = 'data:image/jpeg;base64,' + res.image;
        this.barcodes = res.barcodes;
        if (!res.barcodes.length) {
          this.errorMessage = 'Aucun code-barres détecté dans cette image.';
        }
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.error || "Erreur lors de l'envoi du fichier.";
      }
    });
    input.value = '';  // allows choosing the same file again
  }
}
