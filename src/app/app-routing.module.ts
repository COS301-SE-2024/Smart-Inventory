import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginCreateAccountComponent } from './pages/loginCreateAccount/loginCreateAccount.component';

const routes: Routes = [
    {
        path: '',
        component: LoginCreateAccountComponent,
    },  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then( m => m.SettingsPageModule)
  },

];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
