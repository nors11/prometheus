import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AppConfig } from '../../../app.config';

@Injectable()
export class TimezoneService{
    private serviceUrl = AppConfig.backendUrl + 'timezone';

    constructor(
        private httpClient: HttpClient,
    ) {}

    index(): Observable<any> {
        return this.httpClient.get(this.serviceUrl).pipe(
            map(res => {
                return res;
            }),
          catchError(error => {
                return throwError(error.error);
          })
        );
    }
}
