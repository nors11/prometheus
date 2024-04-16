import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AppConfig } from '../../../app.config';
import { ModelAttribute } from '../models/model-attribute';

@Injectable()
export class ModelAttributeService{
    private serviceUrl = AppConfig.backendUrl + 'model-attribute';

    constructor(
        private httpClient: HttpClient,
    ) {}

    create(params): Observable<ModelAttribute[]> {
        return this.httpClient.post(this.serviceUrl, params).pipe(
            map((res:ModelAttribute[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    viewByProductModelId(productModelId: string): Observable<ModelAttribute[]> {
        return this.httpClient.get<ModelAttribute[]>(this.serviceUrl + '/model/' + productModelId).pipe(
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
            map((res:ModelAttribute[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }
}
