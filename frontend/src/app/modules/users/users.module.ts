import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RequestInterceptor } from '../../interceptors/request.interceptor';

// Routing
import { UsersRoutingModule } from './users-routing.module';

// Import NgBootstrap module
import { NgbModule, NgbNav } from '@ng-bootstrap/ng-bootstrap';

// Import FulCalendar module
import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

import {DragDropModule} from '@angular/cdk/drag-drop';

import { AuthenticationService } from '../account/services/authentication.service';

import { UserService } from '../account/services/user.service';
import { UsersComponent } from './components/users/users.component';
import { NewUserComponent } from './components/users/new-user.component';
import { RoleAbbreviationPipe } from '../account/models/account';

FullCalendarModule.registerPlugins([ 
  interactionPlugin,
  dayGridPlugin,
  timeGridPlugin
]);

@NgModule({
  declarations: [
    UsersComponent,
    NewUserComponent,
    RoleAbbreviationPipe
  ],
  imports: [
    BrowserModule,
    UsersRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    FullCalendarModule,
    DragDropModule
  ],
  exports: [
    UsersComponent
  ],
  providers: [
    AuthenticationService,
    UserService,
    DatePipe,
    NgbNav,
    { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true }
  ],
})
export class UsersModule { }
