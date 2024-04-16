import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NavigationLayoutComponent } from '../../layout/navigation-layout/navigation-layout.component';
import { AuthGuard } from '../../services/auth-guard.service';
import { UserRole } from '../account/models/account';
import { ErrorsComponent } from './components/errors.component';

const mainRoutes: Routes = [
    {
        path: 'errors',
        canActivate: [AuthGuard],
        component: NavigationLayoutComponent, 
        children: [
            { path: '', canActivate: [AuthGuard], component: ErrorsComponent, data: { roles: [UserRole.admin, UserRole.distributor] } }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(mainRoutes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})
export class ErrorsRoutingModule {}
