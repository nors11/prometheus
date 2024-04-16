import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AppConfig } from '../../../app.config';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {

    private serviceUrl = AppConfig.backendUrl + 'provider';

    constructor(
        private httpClient: HttpClient,
    ) {}
  
    indexSequencesActionParametersDrawings(): Observable<[]> {
        return this.httpClient.get(this.serviceUrl + '/sequence/action/drawing').pipe(
            map((res:[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }
  
    indexSequencesActionParametersEffects(): Observable<[]> {
        return this.httpClient.get(this.serviceUrl + '/sequence/action/effect').pipe(
            map((res:[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }
  
    indexSequencesActionParametersFontSizes(): Observable<[]> {
        return this.httpClient.get(this.serviceUrl + '/sequence/action/font').pipe(
            map((res:[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }
  
    indexSequencesActionParametersRows(): Observable<[]> {
        return this.httpClient.get(this.serviceUrl + '/sequence/action/row').pipe(
            map((res:[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }
  
    indexSequencesActionParametersSpeeds(): Observable<[]> {
        return this.httpClient.get(this.serviceUrl + '/sequence/action/speed').pipe(
            map((res:[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }
  
    indexSequencesActionParametersPauses(): Observable<[]> {
        return this.httpClient.get(this.serviceUrl + '/sequence/action/pause').pipe(
            map((res:[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    indexSequencesActionParametersAnimations(): Observable<[]> {
        return this.httpClient.get(this.serviceUrl + '/sequence/action/animation').pipe(
            map((res:[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    indexSequencesActionParametersColors(): Observable<[]> {
        return this.httpClient.get(this.serviceUrl + '/sequence/action/color').pipe(
            map((res:[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    indexProductTypes(): Observable<[]> {
        return this.httpClient.get(this.serviceUrl + '/product-type').pipe(
            map((res:[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }

    indexFringes(): Observable<[]> {
        return this.httpClient.get(this.serviceUrl + '/fringe').pipe(
            map((res:[]) => {
                return res;
            }),
            catchError(error => {
                return throwError(error.error);
            })
        );
    }
}
