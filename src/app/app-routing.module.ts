import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginCreateAccountComponent } from './pages/loginCreateAccount/loginCreateAccount.component';

const routes: Routes = [
  {
    path: '',
    component: LoginCreateAccountComponent,
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsPageModule)
  },
  {
    path: 'help',
      loadChildren: () => import('./pages/help/help.module').then(m => m.HelpPageModule)
  
  },
  {
    path: 'report',
      loadChildren: () => import('./pages/reports/reports.module').then(m => m.ReportsPageModule)
  
  },
  {
    path: 'orders',
      loadChildren: () => import('./pages/orders/orders.module').then(m => m.OrdersPageModule)
  
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
