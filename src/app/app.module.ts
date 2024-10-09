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
    ResetPasswordComponent
  ],
  imports: [
    
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule ,
    MatSnackBarModule
    


  ],
  providers: [
    AuthService,
    // provideClientHydration(),
    provideHttpClient(withFetch())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
