import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AppConfig } from '../../../app.config';
import { Cross } from '../models/cross';

@Injectable()
export class CrossService{
    private serviceUrl = AppConfig.backendUrl + 'cross';

    constructor(
        private httpClient: HttpClient,
    ) {}

    index(query?): Observable<Cross[]> {
        const queryParams = (query) ? `?name=${query}` : '';
        return this.httpClient.get(`${this.serviceUrl}${queryParams}`).pipe(
            map((res:Cross[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    count(): Observable<number> {
        return this.httpClient.get<number>(`${this.serviceUrl}/count`).pipe(
            map((res) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }
    
    indexByPharmacy(PharmacyID, query?): Observable<Cross[]> {
        const queryParams = (query) ? `?name=${query}` : '';
        return this.httpClient.get<any>(this.serviceUrl + '/pharmacy/' + PharmacyID + queryParams).pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }
    
    countByPharmacy(PharmacyID): Observable<number> {
        return this.httpClient.get<number>(this.serviceUrl + '/pharmacy/' + PharmacyID + '/count').pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    indexByDistributor(DistributorID, query?): Observable<Cross[]> {
        const queryParams = (query) ? `?name=${query}` : '';
        return this.httpClient.get<any>(this.serviceUrl + '/distributor/' + DistributorID + queryParams).pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    countByDistributor(DistributorID): Observable<number> {
        return this.httpClient.get<number>(this.serviceUrl + '/distributor/' + DistributorID + '/count').pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    getNumberPlate(number_plate): Observable<Cross[]> {
        return this.httpClient.get<any>(this.serviceUrl + '/number_plate/' + number_plate).pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    getSsid(ssid): Observable<Cross[]> {
        return this.httpClient.get<any>(this.serviceUrl + '/newssid/' + ssid).pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    indexWeekly(crossId: string): Observable<[]> {
        return this.httpClient.get(this.serviceUrl + '/' + crossId + '/weekly').pipe(
            map((res:[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    view(crossId: string): Observable<Cross> {
        return this.httpClient.get<Cross>(this.serviceUrl + '/' + crossId).pipe(
            map(res => { 
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    update(crossId, params): Observable<Cross> {
        return this.httpClient.put<Cross>(this.serviceUrl + '/' + crossId, params).pipe(
            map(res => { 
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    updateServices(crossId, params): Observable<Cross> {
        return this.httpClient.put<Cross>(this.serviceUrl + '/' + crossId + '/services', params).pipe(
            map(res => { 
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    patchWeekly(crossId: string, params: any): Observable<[]> {
        return this.httpClient.patch(this.serviceUrl + '/' + crossId + '/weekly', params).pipe(
            map((res:[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    putMode(crossId: string, mode: string): Observable<Cross>{
        return this.httpClient.put(this.serviceUrl + '/' + crossId + '/mode/' + mode, null).pipe(
            map((res:Cross) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }
    
    create(params): Observable<Cross[]> {
        return this.httpClient.post(this.serviceUrl, params).pipe(
            map((res:Cross[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    indexWithErrors(): Observable<Cross[]> {
        return this.httpClient.get(this.serviceUrl + '/alerts/errors').pipe(
            map((res:Cross[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    delete(crossId): Observable<any> {
        return this.httpClient.delete<any>(`${this.serviceUrl}/${crossId}`).pipe(
            map(res => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }
}
