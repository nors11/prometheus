import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AppConfig } from '../../../app.config';
import { CrossCalendar } from '../models/cross-calendar';


@Injectable()
export class CrossCalendarService {
    private serviceUrl = AppConfig.backendUrl + 'cross-calendar';

    constructor(
        private httpClient: HttpClient,
    ) {}

    index(crossId: string): Observable<CrossCalendar[]> {
        return this.httpClient.get(this.serviceUrl + '/cross/' + crossId).pipe(
            map((res:CrossCalendar[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    createBulk(crossCalendar: CrossCalendar): Observable<CrossCalendar[]> {
        return this.httpClient.post<CrossCalendar[]>(this.serviceUrl + '/bulk', crossCalendar).pipe(
            map((res: CrossCalendar[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    patch(crossCalendarId: string, params): Observable<CrossCalendar> {
        return this.httpClient.patch<CrossCalendar>(this.serviceUrl + '/' + crossCalendarId, params).pipe(
            map((res:CrossCalendar) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    delete(crossCalendarId: string): Observable<CrossCalendar> {
        return this.httpClient.delete<CrossCalendar>(this.serviceUrl + '/' + crossCalendarId).pipe(
            map((res:CrossCalendar) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }
}
