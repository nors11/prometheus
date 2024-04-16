import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../modules/account/services/authentication.service';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with jwt token if available
        let currentAccount = this.authenticationService.currentAccountValue;
        if (currentAccount && currentAccount.accessToken) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${currentAccount.accessToken}`
                }
            });
        }

        return next.handle(request);
    }
}
