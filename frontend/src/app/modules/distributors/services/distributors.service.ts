import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AppConfig } from '../../../app.config';

@Injectable()
export class DistributorsService {
    private serviceUrl = AppConfig.backendUrl + 'distributor';

    constructor(
        private httpClient: HttpClient,
    ) {}

    index(query?): Observable<any> {
        const queryParams = (query) ? `?name=${query}` : '';
        return this.httpClient.get(`${this.serviceUrl}${queryParams}`).pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    count(): Observable<number> {
        return this.httpClient.get<number>(`${this.serviceUrl}/count`).pipe(
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

    update(params, distributorID): Observable<any> {
        return this.httpClient.put<any>(`${this.serviceUrl}/${distributorID}`, params).pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    remove(distributorID): Observable<any> {
        return this.httpClient.delete<any>(`${this.serviceUrl}/${distributorID}`).pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }
}
