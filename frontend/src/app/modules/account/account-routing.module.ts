import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { RequestResetPasswordComponent } from './components/request-reset-password.component';
import { ResetPasswordComponent } from './components/reset-password.component';
import { SendResetPasswordComponent } from './components/send-request-password';

import { AccountLayoutComponent } from '../../layout/account-layout/account-layout.component';

const accountRoutes: Routes = [
  {
    path: 'account',
    component: AccountLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'request-reset-password', component: RequestResetPasswordComponent },
      { path: 'reset-password/:token', component: ResetPasswordComponent },
      { path: 'send-request-reset-password', component: SendResetPasswordComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(accountRoutes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
