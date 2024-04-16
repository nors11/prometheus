import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ProductsComponent } from './components/products/products.component';
import { NewProductComponent } from './components/products/new-product.component';
import { CrossComponent } from './components/cross/cross.component';
import { SequencesComponent } from './components/sequences/sequences.component';
import { ActionsComponent } from './components/actions/actions.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { WeeklyComponent } from './components/weekly/weekly.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ServicesComponent } from './components/services/services.component';

import { CrossService } from './services/cross.service';
import { DistributorService } from './services/distributor.service';
import { PharmacyService } from './services/pharmacy.service';
import { SequenceService } from './services/sequence.service';
import { ProviderService } from './services/provider.service';
import { ServiceService } from './services/service.services';
import { TimezoneService } from './services/timezone.service';
import { ProductModelService } from '../product-models/services/product-model.service';
import { SequenceHelper } from './helpers/sequence.helper';
import { WeeklyHelper } from './helpers/weekly.helper';

import { RequestInterceptor } from '../../interceptors/request.interceptor';

// Routing
import { ProductsRoutingModule } from './products-routing.module';

// Import NgBootstrap module
import { NgbModule, NgbNav } from '@ng-bootstrap/ng-bootstrap';

// Import FulCalendar module
import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { CrossCalendarService } from './services/cross-calendar.service';

import { ModeAbbreviationPipe, LanguageAbbreviationPipe } from './models/cross';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SharedModule } from '../shared/shared.module';

FullCalendarModule.registerPlugins([ 
  interactionPlugin,
  dayGridPlugin,
  timeGridPlugin
]);

@NgModule({
  declarations: [
    ProductsComponent,
    NewProductComponent,
    CrossComponent,
    SequencesComponent,
    ActionsComponent,
    CalendarComponent,
    WeeklyComponent,
    SettingsComponent,
    ServicesComponent,
    ModeAbbreviationPipe,
    LanguageAbbreviationPipe
  ],
  imports: [
    BrowserModule,
    ProductsRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    FullCalendarModule,
    DragDropModule,
    SharedModule
  ],
  exports: [
    ProductsComponent
  ],
  providers: [
    DatePipe,
    CrossService,
    DistributorService,
    PharmacyService,
    SequenceService,
    ProviderService,
    CrossCalendarService,
    ServiceService,
    TimezoneService,
    ProductModelService,
    SequenceHelper,
    WeeklyHelper,
    NgbNav,
    { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true }
  ],
})
export class ProductsModule { }
