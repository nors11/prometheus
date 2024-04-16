import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NavigationLayoutComponent } from '../../layout/navigation-layout/navigation-layout.component';
import { AuthGuard } from '../../services/auth-guard.service';
import { UsersComponent } from './components/users/users.component';
import { NewUserComponent } from './components/users/new-user.component';
import { UserRole } from '../account/models/account';

const mainRoutes: Routes = [
    {
        path: 'users',
        canActivate: [AuthGuard],
        component: NavigationLayoutComponent,
        children: [
            { path: '', canActivate: [AuthGuard], component: UsersComponent, data: { roles: [UserRole.admin] }  },
            { path: 'new', canActivate: [AuthGuard], component: NewUserComponent, data: { roles: [UserRole.admin, UserRole.pharmacy, UserRole.distributor]} },      
        ]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(mainRoutes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})
export class UsersRoutingModule {}
