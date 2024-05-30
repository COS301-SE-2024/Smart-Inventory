import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginCreateAccountComponent } from './pages/loginCreateAccount/loginCreateAccount.component';

const routes: Routes = [
    {
        path: '',
        component: LoginCreateAccountComponent,
    },  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },

];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
