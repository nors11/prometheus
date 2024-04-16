import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ProductModelService } from './services/product-model.service';
import { ModelAttributeService } from './services/model-attribute.service';
import { ModelSequenceService } from './services/model-sequence.service';
import { ProductModelsComponent } from './components/product-models/product-models.component';
import { NewProductModelComponent } from './components/product-models/new-product-model.component';

import { RequestInterceptor } from '../../interceptors/request.interceptor';

// Routing
import { ModelsRoutingModule } from './product-models-routing.module';

// Import NgBootstrap module
import { NgbModule, NgbNav } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '../shared/shared.module';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    ProductModelsComponent,
    NewProductModelComponent
  ],
  imports: [
    BrowserModule,
    ModelsRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    DragDropModule,
    SharedModule
  ],
  exports: [
    ProductModelsComponent,
    NewProductModelComponent
  ],
  providers: [
    DatePipe,
    NgbNav,
    ProductModelService,
    ModelAttributeService,
    ModelSequenceService,
    { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true }
  ],
})
export class ProductModelsModule { }
