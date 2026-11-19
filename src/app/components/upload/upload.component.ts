import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SidebarService } from '../../services/sidebar.service';
import { API_URL } from '../../api.config';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];

interface Barcode { page: number; type: string; data: string; }
interface ScanPage { page: number; image: string; barcodes: Barcode[]; }
const MAX_SIZE_MB = 10;

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent implements OnInit, OnDestroy {
  uploadedImage: string | ArrayBuffer | null = null;
  uploadedFileName = '';
  isPdf = false;
  pages: ScanPage[] = [];
  currentPage = 0;  // index in `pages`
  barcodes: Barcode[] = [];
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
    this.uploadedImage = null;
    this.pages = [];
    this.currentPage = 0;
    this.barcodes = [];

    // Same checks as the backend, so the user gets an immediate message
    if (!ALLOWED_TYPES.includes(file.type)) {
      this.errorMessage = 'Format non supporté (PDF, PNG ou JPG uniquement).';
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      this.errorMessage = `Fichier trop volumineux (max ${MAX_SIZE_MB} Mo).`;
      return;
    }

    this.uploadedFileName = file.name;
    this.isPdf = file.type === 'application/pdf';
    if (!this.isPdf) {
      const reader = new FileReader();
      reader.onload = () => this.uploadedImage = reader.result;
      reader.readAsDataURL(file);
    }

    const formData = new FormData();
    formData.append('file', file);

    this.loading = true;
    this.http.post<any>(`${API_URL}/scans/upload`, formData).subscribe({
      next: res => {
        this.loading = false;
        this.pages = res.pages;
        this.barcodes = res.barcodes;
        // Open the first page that has a barcode
        const first = this.pages.findIndex(p => p.barcodes.length);
        this.currentPage = first >= 0 ? first : 0;
        if (!res.barcodes.length) {
          this.errorMessage = this.isPdf
            ? 'Aucun code-barres détecté dans ce document.'
            : 'Aucun code-barres détecté dans cette image.';
        }
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.error || "Erreur lors de l'envoi du fichier.";
      }
    });
    input.value = '';  // allows choosing the same file again
  }

  get page(): ScanPage | null {
    return this.pages[this.currentPage] ?? null;
  }

  goToPage(index: number): void {
    if (index >= 0 && index < this.pages.length) this.currentPage = index;
  }
}
