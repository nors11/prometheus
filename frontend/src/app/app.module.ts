import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AccountModule } from './modules/account/account.module';
import { ProductsModule } from './modules/products/products.module';
import { DistributorsModule } from './modules/distributors/distributors.module';
import { UsersModule } from './modules/users/users.module';
import { PharmaciesModule } from './modules/pharmacies/pharmacies.module';
import { ErrorsModule } from './modules/errors/errors.module';
import { ProductModelsModule } from './modules/product-models/product-models.module';
import { AnimationsModule } from './modules/animations/animations.module';

import { RequestInterceptor } from './interceptors/request.interceptor';

import { AccountLayoutComponent } from './layout/account-layout/account-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { NavigationLayoutComponent } from './layout/navigation-layout/navigation-layout.component';
import { PageNotFoundComponent } from './components/page-not-found.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastsComponent } from './components/toasts.component';
import { ToastService } from './services/toast.service';
import { ImageService } from './services/image.service';

// Import locals locales
import localeEs from '@angular/common/locales/es';
registerLocaleData(localeEs, 'es');

@NgModule({
  declarations: [
    AppComponent,
    AccountLayoutComponent,
    MainLayoutComponent,
    NavigationLayoutComponent,
    PageNotFoundComponent,
    ToastsComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AccountModule,
    ProductModelsModule,
    AnimationsModule,
    PharmaciesModule,
    ProductsModule,
    DistributorsModule,
    UsersModule,
    ErrorsModule,
    AppRoutingModule,
    FormsModule,
    RouterModule,
    NgbModule
  ],
  providers: [
    ToastService,
    ImageService,
    { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'es'},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
