import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UploadComponent } from './upload.component';
import { API_URL } from '../../api.config';

describe('UploadComponent (free public page)', () => {
  let component: UploadComponent;
  let http: HttpTestingController;

  const choose = (file: File) => component.onFileSelected({ target: { files: [file], value: 'x' } } as unknown as Event);
  const png = () => new File([new Uint8Array([1, 2, 3])], 'photo.png', { type: 'image/png' });
  const pageOf = (n: number, barcodes: any[] = [], unread: any[] = []) => ({ page: n, image: 'AAAA', barcodes, unread });
  const code = (page: number) => ({ page, type: 'QRCODE', data: 'HELLO' });
  const region = (page: number) => ({ page, score: 0.95, coordinates: { x: 1, y: 2, w: 30, h: 40 } });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
    component = TestBed.createComponent(UploadComponent).componentInstance;
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('refuses a file type the service does not read, without calling the server', () => {
    choose(new File(['x'], 'notes.txt', { type: 'text/plain' }));
    expect(component.errorMessage).toBe('Format non supporté (PDF, PNG ou JPG uniquement).');
    http.expectNone(`${API_URL}/public/extract`);
  });

  it('refuses a file over 10 MB, without calling the server', () => {
    choose(new File([new ArrayBuffer(11 * 1024 * 1024)], 'big.png', { type: 'image/png' }));
    expect(component.errorMessage).toContain('trop volumineux');
    http.expectNone(`${API_URL}/public/extract`);
  });

  it('sends the file to the public route and shows the codes that were read', () => {
    choose(png());
    expect(component.loading).toBeTrue();
    const req = http.expectOne(`${API_URL}/public/extract`);
    expect(req.request.method).toBe('POST');
    expect((req.request.body as FormData).get('file')).toBeTruthy();
    req.flush({ barcodes: [code(1)], unread: [], pages: [pageOf(1, [code(1)])] });
    expect(component.loading).toBeFalse();
    expect(component.barcodes.length).toBe(1);
    expect(component.errorMessage).toBe('');
    expect(component.page?.page).toBe(1);
  });

  it('opens the first page of a PDF that has a code', () => {
    choose(new File(['%PDF'], 'doc.pdf', { type: 'application/pdf' }));
    http.expectOne(`${API_URL}/public/extract`).flush({
      barcodes: [code(3)], unread: [], pages: [pageOf(1), pageOf(2), pageOf(3, [code(3)])]
    });
    expect(component.isPdf).toBeTrue();
    expect(component.currentPage).toBe(2);
  });

  it('keeps the unreadable regions and does not say "no code found" when there are some', () => {
    choose(png());
    http.expectOne(`${API_URL}/public/extract`).flush({ barcodes: [], unread: [region(1)], pages: [pageOf(1, [], [region(1)])] });
    expect(component.unread.length).toBe(1);
    expect(component.errorMessage).toBe('');
  });

  it('says so when the image holds no code at all', () => {
    choose(png());
    http.expectOne(`${API_URL}/public/extract`).flush({ barcodes: [], unread: [], pages: [pageOf(1)] });
    expect(component.errorMessage).toBe('Aucun code-barres détecté dans cette image.');
  });

  it('shows the message of the server when the upload fails', () => {
    choose(png());
    http.expectOne(`${API_URL}/public/extract`).flush({ error: 'Trop de requêtes' }, { status: 429, statusText: 'Too Many' });
    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('Trop de requêtes');
  });

  it('only goes to a page that exists', () => {
    choose(new File(['%PDF'], 'doc.pdf', { type: 'application/pdf' }));
    http.expectOne(`${API_URL}/public/extract`).flush({ barcodes: [code(1)], unread: [], pages: [pageOf(1, [code(1)]), pageOf(2)] });
    component.goToPage(1);
    expect(component.currentPage).toBe(1);
    component.goToPage(5);
    component.goToPage(-1);
    expect(component.currentPage).toBe(1);
  });
});
