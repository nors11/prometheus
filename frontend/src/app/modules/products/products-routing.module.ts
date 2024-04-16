import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NavigationLayoutComponent } from '../../layout/navigation-layout/navigation-layout.component';
import { MainLayoutComponent } from '../../layout/main-layout/main-layout.component';
import { ProductsComponent } from './components/products/products.component';
import { NewProductComponent } from './components/products/new-product.component';
import { CrossComponent } from './components/cross/cross.component';
import { ActionsComponent } from './components/actions/actions.component';
import { AuthGuard } from '../../services/auth-guard.service';
import { UserRole } from '../account/models/account';

const mainRoutes: Routes = [
    {
        path: 'products',
        canActivate: [AuthGuard],
        component: NavigationLayoutComponent, 
        children: [
            { path: '', canActivate: [AuthGuard], component: ProductsComponent, data: { roles: [UserRole.admin, UserRole.distributor] } },
            { path: 'new', canActivate: [AuthGuard], component: NewProductComponent, data: { roles: [UserRole.admin, UserRole.distributor, UserRole.pharmacy] } },
        ]
    },
    {
        path: 'cross/:id_cross',
        canActivate: [AuthGuard],
        component: MainLayoutComponent,
        children: [
            { path: '', canActivate: [AuthGuard], component: CrossComponent },
            { path: 'sequence/:id_sequence/actions', canActivate: [AuthGuard], component: ActionsComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(mainRoutes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})
export class ProductsRoutingModule {}
