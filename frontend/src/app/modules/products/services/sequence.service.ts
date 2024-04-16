import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AppConfig } from '../../../app.config';
import { Sequence } from '../models/sequence';

@Injectable()
export class SequenceService {
    private serviceUrl = AppConfig.backendUrl + 'sequence';

    constructor(
        private httpClient: HttpClient,
    ) {}

    indexGroupedByCategory(crossId:string): Observable<Sequence[]> {
        return this.httpClient.get(this.serviceUrl + '/category/' + crossId).pipe(
            map((res:Sequence[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    } 

    indexCategoriesList() {
        return this.httpClient.get(this.serviceUrl + '/categories').pipe(
            map((res:[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    indexActionTypesList(crossId) {
        return this.httpClient.get(this.serviceUrl + '/action/types/' + crossId).pipe(
            map((res:[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    create(sequence: Sequence): Observable<any> {
        return this.httpClient.post<any>(this.serviceUrl, sequence).pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    view(sequenceId: string): Observable<Sequence> {
        return this.httpClient.get<Sequence>(this.serviceUrl + '/' + sequenceId).pipe(
            map(res => { 
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    patch(sequenceId: string, params): Observable<Sequence> {
        return this.httpClient.patch<Sequence>(this.serviceUrl + '/' + sequenceId, params).pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }
    
    delete(sequenceId: string): Observable<Sequence> {
        return this.httpClient.delete<Sequence>(this.serviceUrl + '/' + sequenceId).pipe(
            map((res:Sequence) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }
}
