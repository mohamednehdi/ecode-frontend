import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { provideHttpClient, withFetch } from '@angular/common/http';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UploadComponent } from './components/upload/upload.component';
import { UploadHeaderComponent } from './upload-header/upload-header.component';
import { UploadHandlerComponent } from './upload-handler/upload-handler.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { AuthService } from './services/auth.service';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RequestResetPasswordComponent } from './components/request-reset-password/request-reset-password.component';
import { VerifyCodeComponent } from './components/verify-code/verify-code.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { WaitingForAcceptanceComponent } from './components/waiting-for-acceptance/waiting-for-acceptance.component';
import { RouterModule } from '@angular/router';
import { UsersComponent } from './components/users/users.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UploadHistoryComponent } from './components/upload-history/upload-history.component';
import { UploadHistoryDetailComponent } from './components/upload-history-detail/upload-history-detail.component';



@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    UploadHeaderComponent,
    UploadHandlerComponent,
    LoginComponent,
    SignupComponent,
    RequestResetPasswordComponent,
    VerifyCodeComponent,
    ResetPasswordComponent,
    AdminDashboardComponent,
    WaitingForAcceptanceComponent,
    UsersComponent,
    SidebarComponent,
    UploadHistoryComponent,
    UploadHistoryDetailComponent
  ],
  imports: [
    
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule ,
    MatSnackBarModule,
    BrowserAnimationsModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    FontAwesomeModule
    
    


  ],
  providers: [
    AuthService,
    // provideClientHydration(),
    provideHttpClient(withFetch())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor() {
    library.add(faBars, faTimes); // Add the icons you need
  }
}
