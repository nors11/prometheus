import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found.component';
import { UsersComponent } from './modules/users/components/users/users.component';
import { AuthGuard } from './services/auth-guard.service';
import { UserRole } from './modules/account/models/account';

const routes: Routes = [
    {
        path: '', 
        redirectTo: '/account/login', pathMatch: 'full',
    },
    { path: '**', component: PageNotFoundComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
