import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AppConfig } from '../../../app.config';
import { ModelSequence } from '../models/model-sequence'
import { ModelAttribute } from '../models/model-attribute';

@Injectable()
export class ModelSequenceService{
    private serviceUrl = AppConfig.backendUrl + 'model-sequence';

    constructor(
        private httpClient: HttpClient,
    ) {}

    indexDefault(modelAttributes:ModelAttribute[]): Observable<ModelSequence[]> {
        return this.httpClient.post(`${this.serviceUrl}/default`, modelAttributes).pipe(
            map((res:ModelSequence[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    indexDefaultByProductModelId(productModelId: string, modelAttributes:ModelAttribute[]): Observable<ModelSequence[]> {
        return this.httpClient.post(`${this.serviceUrl}/default/model/${productModelId}`, modelAttributes).pipe(
            map((res:ModelSequence[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    create(params): Observable<ModelSequence[]> {
        return this.httpClient.post(this.serviceUrl, params).pipe(
            map((res:ModelSequence[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    viewByProductModelId(productModelId: string): Observable<ModelSequence[]> {
        return this.httpClient.get<ModelSequence[]>(this.serviceUrl + '/model/' + productModelId).pipe(
            map(res => { 
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    deleteByProductModelId(productModelId: string): Observable<any> {
        return this.httpClient.delete<any>(this.serviceUrl + '/model/' + productModelId).pipe(
            map((res:any) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }
}
