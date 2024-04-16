import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Components
import { LoginComponent } from './components/login.component';
import { RequestResetPasswordComponent } from './components/request-reset-password.component';
import { ResetPasswordComponent } from './components/reset-password.component';
import { SendResetPasswordComponent } from './components/send-request-password';

// Srvice
import { AuthenticationService } from './services/authentication.service';
import { PasswordService } from './services/password.service';
import { UserService } from './services/user.service';

import { RequestInterceptor } from '../../interceptors/request.interceptor';

import { AccountRoutingModule } from './account-routing.module';

@NgModule({
  imports: [
    BrowserModule,
    AccountRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  declarations: [
    LoginComponent,
    RequestResetPasswordComponent,
    ResetPasswordComponent,
    SendResetPasswordComponent
  ],
  exports: [

  ],
  providers: [
    AuthenticationService,
    PasswordService,
    UserService,
    { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true }
  ],
})
export class AccountModule { }
