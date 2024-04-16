import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { AppConfig } from '../../../app.config';
import { map, catchError } from 'rxjs/operators';
import { Account } from '../models/account';

@Injectable()
export class AuthenticationService {

  private serviceUrl = AppConfig.backendUrl + 'auth';
  private currentAccountSubject: BehaviorSubject<Account>;
  public currentAccount: Observable<Account>;

  constructor(
    private httpClient: HttpClient,
    private router: Router,
  ) {
    this.currentAccountSubject = new BehaviorSubject<Account>(JSON.parse(localStorage.getItem('currentAccount')));
    this.currentAccount = this.currentAccountSubject.asObservable();
  }

  public get currentAccountValue(): Account {
    return this.currentAccountSubject.value;
  }

  login(params): Observable<any> {
    return this.httpClient.post<any>(`${this.serviceUrl}/login`, params)
        .pipe(map(user => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('currentAccount', JSON.stringify(user));
        this.currentAccountSubject.next(user);
        return user;
    }),
    catchError(error => {
        return throwError(error.error);
      })
    );
  }

  register(params): Observable<any> {
    return this.httpClient.post<any>(`${this.serviceUrl}/register`, params).pipe(
        map(res => {
            return res;
        }),
        catchError(error => {
            return throwError(error.error);
        })
    );
}

  logout(): void {
    localStorage.clear();
    this.currentAccountSubject.next(null);
    this.router.navigate(['/account/login']);
  }

}
