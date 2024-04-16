import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AppConfig } from '../../../app.config';
import { Service } from '../models/service';

@Injectable()
export class ServiceService{
    private serviceUrl = AppConfig.backendUrl + 'service';

    constructor(
        private httpClient: HttpClient,
    ) {}

    index(): Observable<Service[]> {
        return this.httpClient.get<Service[]>(this.serviceUrl).pipe(
            map(res => {
                return res;
            }),
          catchError(error => {
                return throwError(error.error);
          })
        );
    }

    indexOffline(): Observable<Service[]> {
        return this.httpClient.get<Service[]>(this.serviceUrl + '/offline').pipe(
            map(res => {
                return res;
            }),
          catchError(error => {
                return throwError(error.error);
          })
        );
    }

    indexOnline(): Observable<Service[]> {
        return this.httpClient.get<Service[]>(this.serviceUrl + '/online').pipe(
            map(res => {
                return res;
            }),
          catchError(error => {
                return throwError(error.error);
          })
        );
    }

    view(serviceId: string): Observable<Service> {
        return this.httpClient.get<Service>(this.serviceUrl + '/' + serviceId).pipe(
            map(res => {
                return res;
            }),
          catchError(error => {
                return throwError(error.error);
          })
        );
    }
}
