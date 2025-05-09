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

import { AdminGuard } from './services/admin.guard';
import { authGuard } from './services/auth.guard';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { WaitingForAcceptanceComponent } from './components/waiting-for-acceptance/waiting-for-acceptance.component';
import { UsersComponent } from './components/users/users.component';
import { UploadHistoryComponent } from './components/upload-history/upload-history.component';
import { UploadHistoryDetailComponent } from './components/upload-history-detail/upload-history-detail.component';

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
  {path:'history',component: UploadHistoryComponent},
  {path:'history-detail',component: UploadHistoryDetailComponent},

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboardComponent, children: [
    { path: 'users', component: UsersComponent },
    { path: 'waiting-for-acceptance', component: WaitingForAcceptanceComponent }
  ]},
  { path: '', redirectTo: '/dashboard/users', pathMatch: 'full' }, // Default route
  { path: '**', redirectTo: '/dashboard/users' }, // Wildcard route
  { path: '**', redirectTo: '/login' } ,// Catch-all for invalid routes
  

  

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
