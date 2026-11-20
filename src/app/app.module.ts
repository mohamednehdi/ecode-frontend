import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './services/auth.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UploadComponent } from './components/upload/upload.component';
import { LoginComponent } from './components/login/login.component';
import { AuthService } from './services/auth.service';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RequestResetPasswordComponent } from './components/request-reset-password/request-reset-password.component';
import { VerifyCodeComponent } from './components/verify-code/verify-code.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ApiTokensComponent } from './components/api-tokens/api-tokens.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { BarChartComponent } from './components/charts/bar-chart.component';
import { LineChartComponent } from './components/charts/line-chart.component';
import { HBarChartComponent } from './components/charts/hbar-chart.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    LoginComponent,
    RequestResetPasswordComponent,
    VerifyCodeComponent,
    ResetPasswordComponent,
    ApiTokensComponent,
    StatisticsComponent,
    BarChartComponent,
    LineChartComponent,
    HBarChartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
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
    provideHttpClient(withFetch(), withInterceptors([authInterceptor]))
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
    library.add(faBars, faTimes); // Add the icons you need
  }
}
