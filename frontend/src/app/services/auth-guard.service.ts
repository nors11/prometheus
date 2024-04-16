import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserRole } from '../modules/account/models/account';

import { AuthenticationService } from '../modules/account/services/authentication.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    public userRole = UserRole;
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) {}

    canActivate(activatedRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const currentAccount = this.authenticationService.currentAccountValue;

        if(currentAccount){
            if (currentAccount.role == this.userRole.admin) {
                return true;
            }
            else{
                if(activatedRoute.data['roles']){
                    let authorized = false;
                    activatedRoute.data['roles'].forEach(role => {
                        if(currentAccount.role == role){
                            authorized = true;
                        }
                    });
                    if(authorized){
                        return true;
                    }
                }
                else{
                    return true;
                }
            }
        }
        
        // not logged in so redirect to login page with the return url
        const extras = (state.url != '/') ? { queryParams: { returnUrl: state.url } } : { queryParams: {} };
        this.router.navigate(['/account/login'], extras);

        return false; 
    }
}
