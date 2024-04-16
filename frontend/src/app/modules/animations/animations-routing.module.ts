import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NavigationLayoutComponent } from '../../layout/navigation-layout/navigation-layout.component';
import { AnimationsComponent } from './components/animations.component';
import { NewAnimationComponent } from './components/new-animation.component';
import { AuthGuard } from '../../services/auth-guard.service';

import { UserRole } from '../account/models/account';

const mainRoutes: Routes = [
    {
        path: 'animations',
        canActivate: [AuthGuard],
        component: NavigationLayoutComponent, 
        children: [
            { path: '', canActivate: [AuthGuard], component: AnimationsComponent, data: { roles: [UserRole.admin] } },
            { path: 'new', canActivate: [AuthGuard], component:  NewAnimationComponent, data: { roles: [UserRole.admin] } }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(mainRoutes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})
export class AnimationsRoutingModule {}
