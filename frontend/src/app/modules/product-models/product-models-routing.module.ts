import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NavigationLayoutComponent } from '../../layout/navigation-layout/navigation-layout.component';
import { ProductModelsComponent } from './components/product-models/product-models.component'; 
import { NewProductModelComponent } from './components/product-models/new-product-model.component';
import { AuthGuard } from '../../services/auth-guard.service';
import { UserRole } from '../account/models/account';

const mainRoutes: Routes = [
    {
        path: 'product-models',
        canActivate: [AuthGuard],
        component: NavigationLayoutComponent, 
        children: [
            { path: '', canActivate: [AuthGuard], component: ProductModelsComponent, data: { roles: [UserRole.admin] } },
            { path: 'new', canActivate: [AuthGuard], component: NewProductModelComponent, data: { roles: [UserRole.admin] } },
            { path: ':id_model', canActivate: [AuthGuard], component: NewProductModelComponent, data: { roles: [UserRole.admin] } },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(mainRoutes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})
export class ModelsRoutingModule {}
