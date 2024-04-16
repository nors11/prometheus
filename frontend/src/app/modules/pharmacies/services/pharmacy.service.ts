import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AppConfig } from '../../../app.config';

@Injectable()
export class PharmacyService {
    private serviceUrl = AppConfig.backendUrl + 'pharmacy';

    constructor(
        private httpClient: HttpClient,
    ) {}

    index(query?): Observable<any> {
        const queryParams = (query) ? `?name=${query}` : '';
        return this.httpClient.get<any>(`${this.serviceUrl}${queryParams}`).pipe(
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

    indexByDistributor(DistributorID): Observable<any> {
        return this.httpClient.get<any>(this.serviceUrl + '/distributor/' + DistributorID).pipe(
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

    update(params, PharmacyID): Observable<any> {
        return this.httpClient.put<any>(`${this.serviceUrl}/${PharmacyID}`, params).pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    remove(PharmacyID): Observable<any> {
        return this.httpClient.delete<any>(`${this.serviceUrl}/${PharmacyID}`).pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    view(PharmacyID): Observable<any> {
        return this.httpClient.get<any>(`${this.serviceUrl}/${PharmacyID}`).pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }
}
