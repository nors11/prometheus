import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ErrorsComponent } from './components/errors.component'

import { RequestInterceptor } from '../../interceptors/request.interceptor';

import { CategoryAbbreviationPipe } from './models/error';

// Routing
import { ErrorsRoutingModule } from './errors-routing.module';

// Import NgBootstrap module
import { NgbModule, NgbNav } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    ErrorsComponent,
    CategoryAbbreviationPipe
  ],
  imports: [
    BrowserModule,
    ErrorsRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
  ],
  providers: [
    DatePipe,
    NgbNav,
    { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true }
  ],
})
export class ErrorsModule { }
