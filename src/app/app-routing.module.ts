import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UploadComponent } from './components/upload/upload.component';
import { LoginComponent } from './components/login/login.component';
import { RequestResetPasswordComponent } from './components/request-reset-password/request-reset-password.component';
import { VerifyCodeComponent } from './components/verify-code/verify-code.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ApiTokensComponent } from './components/api-tokens/api-tokens.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { AuditComponent } from './components/audit/audit.component';
import { AdminGuard } from './services/admin.guard';

const routes: Routes = [
  // Free public page: upload a PDF/image and see the extracted barcodes (no account needed)
  { path: '', component: UploadComponent, pathMatch: 'full' },

  // Administrator login and password reset
  { path: 'login', component: LoginComponent },
  { path: 'request-reset-password', component: RequestResetPasswordComponent },
  { path: 'verify-code', component: VerifyCodeComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // Back office (administrators only)
  {
    path: 'dashboard', canActivate: [AdminGuard], children: [
      { path: '', redirectTo: 'api-tokens', pathMatch: 'full' },
      { path: 'api-tokens', component: ApiTokensComponent },
      { path: 'statistics', component: StatisticsComponent },
      { path: 'audit', component: AuditComponent }
    ]
  },

  // Anything else
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
