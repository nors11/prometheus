import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AppConfig } from '../../../app.config';
import { AttributeOption } from '../../product-models/models/model-attribute';

@Injectable()
export class AttributeService{
    private serviceUrl = AppConfig.backendUrl + 'attribute';

    constructor(
        private httpClient: HttpClient,
    ) {}

    indexOptionsByTpe(type:string): Observable<AttributeOption[]> {
        return this.httpClient.get(`${this.serviceUrl}/type/${type}/option`).pipe(
            map((res:AttributeOption[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    createAttributeOptionByType(type, params): Observable<AttributeOption[]> {
        return this.httpClient.post(`${this.serviceUrl}/type/${type}/option`, params).pipe(
            map((res:AttributeOption[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }
}
