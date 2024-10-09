import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyCodeComponent } from './verify-code.component';

describe('RequestResetPasswordComponent', () => {
  let component: VerifyCodeComponent;
  let fixture: ComponentFixture<VerifyCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerifyCodeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerifyCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});