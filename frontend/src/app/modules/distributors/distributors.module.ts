import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DistributorsComponent } from './components/distributors/distributors.component';
import { NewDistributorsComponent } from './components/distributors/new-distributors.component';

import { RequestInterceptor } from '../../interceptors/request.interceptor';

// Routing
import { DistributorsRoutingModule } from './distributors-routing.module';

// Import NgBootstrap module
import { NgbModule, NgbNav } from '@ng-bootstrap/ng-bootstrap';

// Import FulCalendar module
import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

import {DragDropModule} from '@angular/cdk/drag-drop';

import { DistributorsService } from './services/distributors.service';
import { AuthenticationService } from '../../modules/account/services/authentication.service';

FullCalendarModule.registerPlugins([ 
  interactionPlugin,
  dayGridPlugin,
  timeGridPlugin
]);

@NgModule({
  declarations: [
    DistributorsComponent,
    NewDistributorsComponent
  ],
  imports: [
    BrowserModule,
    DistributorsRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    FullCalendarModule,
    DragDropModule
  ],
  providers: [
    DistributorsService,
    AuthenticationService,
    DatePipe,
    NgbNav,
    { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true }
  ],
})
export class DistributorsModule { }
