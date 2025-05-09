import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadHistoryDetailComponent } from './upload-history-detail.component';

describe('UploadHistoryDetailComponent', () => {
  let component: UploadHistoryDetailComponent;
  let fixture: ComponentFixture<UploadHistoryDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadHistoryDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadHistoryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
