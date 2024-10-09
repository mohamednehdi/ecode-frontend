import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UploadComponent } from './components/upload/upload.component';
import { UploadHeaderComponent } from './upload-header/upload-header.component';
import { UploadHandlerComponent } from './upload-handler/upload-handler.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { RequestResetPasswordComponent } from './components/request-reset-password/request-reset-password.component';
import { VerifyCodeComponent } from './components/verify-code/verify-code.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {path:'upload',component: UploadComponent},
  {path:'upload-header',component: UploadHeaderComponent},
  {path:'upload-handler',component:UploadHandlerComponent},
  {path:'login',component:LoginComponent},
  {path:'signup',component:SignupComponent},
  {path:'request-reset-password',component:RequestResetPasswordComponent},
  {path:'verify-code',component:VerifyCodeComponent},
  {path: 'reset-password', component: ResetPasswordComponent },
  

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
