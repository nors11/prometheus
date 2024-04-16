import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NavigationLayoutComponent } from '../../layout/navigation-layout/navigation-layout.component';
import { AuthGuard } from '../../services/auth-guard.service';

import { DistributorsComponent } from './components/distributors/distributors.component';
import { NewDistributorsComponent } from './components/distributors/new-distributors.component';
import { UserRole } from '../account/models/account';

const mainRoutes: Routes = [
    {
        path: 'distributors',
        canActivate: [AuthGuard],
        component: NavigationLayoutComponent,
        data: { roles: [UserRole.admin] },
        children: [
            { path: '', canActivate: [AuthGuard], component: DistributorsComponent },
            { path: 'new', canActivate: [AuthGuard], component: NewDistributorsComponent },
        ]
    },
];

@NgModule({
    imports: [RouterModule.forRoot(mainRoutes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})
export class DistributorsRoutingModule {}
