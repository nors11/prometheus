import { Component, OnInit } from '@angular/core';
import { Account, UserRole } from 'src/app/modules/account/models/account';
import { AuthenticationService } from 'src/app/modules/account/services/authentication.service';
import {environment} from '../../../environments/environment.prod';

@Component({
  selector: 'app-navigation-layout',
  templateUrl: './navigation-layout.component.html'
})
export class NavigationLayoutComponent implements OnInit {
  
  public currentAccount: Account;
  public userRole = UserRole;
  public currentApplicationVersion = environment.appVersion;
  
  constructor(
    private authenticationService: AuthenticationService,
  ) { }

  ngOnInit(): void {
    this.currentAccount = this.authenticationService.currentAccountValue;
  }
  logout(): void {
    this.authenticationService.logout();
  }

}
