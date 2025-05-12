import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { SidebarService } from '../../services/sidebar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload-history-detail',
  templateUrl: './upload-history-detail.component.html',
  styleUrl: './upload-history-detail.component.css'
})
export class UploadHistoryDetailComponent {
  barcode: any;

  constructor(private location: Location,private router: Router,private sidebarService : SidebarService ) {
    const nav = history.state;
    this.barcode = nav.barcode;
  }
  ngOnInit(): void {
    this.sidebarService.setSidebarVisibility(true);
  }

  ngOnDestroy(): void {
    this.sidebarService.setSidebarVisibility(false);
  }  

  goBack() {
    this.location.back();
  }
}
