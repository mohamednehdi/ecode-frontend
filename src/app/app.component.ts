import { Component, OnInit } from '@angular/core';
import { Router , NavigationEnd} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title(title: any) {
    throw new Error('Method not implemented.');
  }
  uploadedImage: string | null = null;
  processedImage: string | null = null;
  barcodes: { type: string; data: string }[] = [];
  fileUploaded: boolean = false; // State to track if file is uploaded
  showSidebar = false;
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Listen to route changes
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Show the sidebar for 'users' or 'waiting-for-acceptance' routes
        const currentUrl = this.router.url;
        this.showSidebar = currentUrl.includes('users') || currentUrl.includes('waiting-for-acceptance');
      }
    });
  }



  handleFileProcessed(data: any): void {
    this.processedImage = data.image;
    this.barcodes = data.barcodes;
    this.fileUploaded = true; // Set state to true to show the upload-handler component
  }


  
}
