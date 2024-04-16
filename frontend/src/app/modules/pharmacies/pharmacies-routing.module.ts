import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NavigationLayoutComponent } from '../../layout/navigation-layout/navigation-layout.component';
import { MainLayoutComponent } from '../../layout/main-layout/main-layout.component';
import { AuthGuard } from '../../services/auth-guard.service';

import { PharmaciesComponent } from './components/pharmacies/pharmacies.component';
import { NewPharmaciesComponent } from './components/pharmacies/new-pharmacies.component';

import { PharmacyComponent } from './components/pharmacy/pharmacy.component'
import { UserRole } from '../account/models/account';

const mainRoutes: Routes = [
    {
        path: 'pharmacies',
        canActivate: [AuthGuard],
        component: NavigationLayoutComponent,
        data: { roles: [UserRole.admin, UserRole.distributor] },
        children: [
            { path: '', canActivate: [AuthGuard], component: PharmaciesComponent },
            { path: 'new', canActivate: [AuthGuard], component: NewPharmaciesComponent },
        ]
    },
    {
        path: 'pharmacy/:id_pharmacy',
        canActivate: [AuthGuard],
        component: MainLayoutComponent,
        data: { roles: [UserRole.admin, UserRole.distributor, UserRole.pharmacy] },
        children: [
            { path: '', component: PharmacyComponent},
        ]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(mainRoutes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})
export class PharmaciesRoutingModule {}
