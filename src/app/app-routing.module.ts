import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UploadComponent } from './components/upload/upload.component';
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

  // Public pages
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'request-reset-password', component: RequestResetPasswordComponent },
  { path: 'verify-code', component: VerifyCodeComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // Logged-in users
  { path: 'upload', component: UploadComponent, canActivate: [authGuard] },
  { path: 'history', component: UploadHistoryComponent, canActivate: [authGuard] },
  { path: 'history-detail', component: UploadHistoryDetailComponent, canActivate: [authGuard] },

  // Admins
  {
    path: 'dashboard', component: AdminDashboardComponent, canActivate: [AdminGuard], children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: UsersComponent },
      { path: 'waiting-for-acceptance', component: WaitingForAcceptanceComponent }
    ]
  },

  // Anything else
  { path: '**', redirectTo: '/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
