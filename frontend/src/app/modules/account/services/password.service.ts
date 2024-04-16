import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AppConfig } from '../../../app.config';

@Injectable()
export class PasswordService {
    private serviceUrl = AppConfig.backendUrl + 'user/forgot-password';
    private serviceUrlResetPassword = AppConfig.backendUrl + 'user/reset-password';

    constructor(
        private httpClient: HttpClient,
    ) {}


    forgotPassword(params): Observable<any> {
        return this.httpClient.get<any>(this.serviceUrl + '/' + params.email).pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    resetPassword(params): Observable<any> {
        return this.httpClient.post<any>(this.serviceUrlResetPassword, params).pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }
}
