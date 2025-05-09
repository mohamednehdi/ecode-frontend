import { Component } from '@angular/core';
import { Location } from '@angular/common';
@Component({
  selector: 'app-upload-history-detail',
  templateUrl: './upload-history-detail.component.html',
  styleUrl: './upload-history-detail.component.css'
})
export class UploadHistoryDetailComponent {
  barcode: any;

  constructor(private location: Location) {
    const nav = history.state;
    this.barcode = nav.barcode;
  }

  goBack() {
    this.location.back();
  }
}
