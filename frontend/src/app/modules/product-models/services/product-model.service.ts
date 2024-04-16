import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AppConfig } from '../../../app.config';
import { ProductModel } from '../models/product-model';
import { Service } from '../../products/models/service';

@Injectable()
export class ProductModelService{
    private serviceUrl = AppConfig.backendUrl + 'product-model';

    constructor(
        private httpClient: HttpClient,
    ) {}

    index(query?:string): Observable<ProductModel[]> {
        const queryParams = (query) ? `?${query}` : '';
        return this.httpClient.get(`${this.serviceUrl}${queryParams}`).pipe(
            map((res:ProductModel[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    create(params): Observable<ProductModel> {
        return this.httpClient.post(this.serviceUrl, params).pipe(
            map((res:ProductModel) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    viewByCross(modelID: string): Observable<ProductModel> {
        return this.httpClient.get<ProductModel>(this.serviceUrl + '/' + modelID).pipe(
            map(res => { 
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    update(productModelId, params): Observable<ProductModel> {
        return this.httpClient.put<ProductModel>(this.serviceUrl + '/' + productModelId, params).pipe(
            map(res => { 
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    delete(id: string): Observable<any> {
        return this.httpClient.delete<any>(this.serviceUrl + '/' + id).pipe(
            map((res:any[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    getModelActionOptions(modelID: string): Observable<Object> {
        return this.httpClient.get<Object>(this.serviceUrl + '/options/' + modelID).pipe(
            map(res => { 
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }
    
    indexOfflineServices(modelID: string): Observable<Service[]> {
        return this.httpClient.get<Service[]>(this.serviceUrl + '/offline-services/' + modelID).pipe(
            map(res => {
                return res;
            }),
          catchError(error => {
                return throwError(error.error);
          })
        );
    }

    indexOnlineServices(modelID: string): Observable<Service[]> {
        return this.httpClient.get<Service[]>(this.serviceUrl + '/online-services/' + modelID).pipe(
            map(res => {
                return res;
            }),
          catchError(error => {
                return throwError(error.error);
          })
        );
    }
}
