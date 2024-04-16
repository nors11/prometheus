import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AttributeService } from './services/attribute.service';
import { AnimationsComponent } from './components/animations.component';
import { NewAnimationComponent } from './components/new-animation.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RequestInterceptor } from '../../interceptors/request.interceptor';
import { BrowserModule } from '@angular/platform-browser'

// Routing
import { AnimationsRoutingModule } from './animations-routing.module';

@NgModule({
  declarations: [
    AnimationsComponent,
    NewAnimationComponent
  ],
  imports: [
    BrowserModule,
    AnimationsRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    AttributeService,
    { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true }
  ],
})
export class AnimationsModule { }
