import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AppConfig } from '../../../app.config';

@Injectable()
export class UserService {
    private serviceUrl = AppConfig.backendUrl + 'user';

    constructor(
        private httpClient: HttpClient,
    ) {}

    index(query?): Observable<any> {
        const queryParams = (query) ? `?name=${query}` : '';
        return this.httpClient.get<any>(`${this.serviceUrl}`+ queryParams).pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    create(params): Observable<any> {
        return this.httpClient.post<any>(`${this.serviceUrl}`, params).pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    update(userId, params): Observable<any> {
        return this.httpClient.put<any>(`${this.serviceUrl}/${userId}`, params).pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    delete(userId): Observable<any> {
        return this.httpClient.delete<any>(`${this.serviceUrl}/delete/${userId}`).pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    validateEmail(email): Observable<any> {
        return this.httpClient.get<any>(`${this.serviceUrl}/email/${email}`).pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    
    findUsersByPharmacy(PharmacyID, query?): Observable<any> {
        const queryParams = (query) ? `?name=${query}` : '';
        return this.httpClient.get<any>(`${this.serviceUrl}/pharmacy/${PharmacyID}`+ queryParams).pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }
}
