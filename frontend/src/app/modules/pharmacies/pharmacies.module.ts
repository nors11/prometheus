import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RequestInterceptor } from '../../interceptors/request.interceptor';

// Routing
import { PharmaciesRoutingModule } from './pharmacies-routing.module';

// Import NgBootstrap module
import { NgbModule, NgbNav } from '@ng-bootstrap/ng-bootstrap';

// Import FulCalendar module
import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

import {DragDropModule} from '@angular/cdk/drag-drop';

import { AuthenticationService } from '../account/services/authentication.service';

import { PharmaciesComponent } from './components/pharmacies/pharmacies.component';
import { NewPharmaciesComponent } from './components/pharmacies/new-pharmacies.component';
import { PharmacyComponent } from './components/pharmacy/pharmacy.component';

import { PharmacyService } from './services/pharmacy.service';
import { UserService } from '../account/services/user.service';

import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';

FullCalendarModule.registerPlugins([ 
  interactionPlugin,
  dayGridPlugin,
  timeGridPlugin
]);

@NgModule({
  declarations: [
    PharmaciesComponent,
    NewPharmaciesComponent,
    PharmacyComponent
  ],
  imports: [
    ProductsModule,
    UsersModule,
    BrowserModule,
    PharmaciesRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    FullCalendarModule,
    DragDropModule
  ],
  providers: [
    AuthenticationService,
    PharmacyService,
    UserService,
    DatePipe,
    NgbNav,
    { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true }
  ]
})
export class PharmaciesModule { }
