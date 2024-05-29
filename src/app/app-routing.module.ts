import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginCreateAccountComponent } from './pages/loginCreateAccount/loginCreateAccount.component';

const routes: Routes = [
    {
        path: '',
        component: LoginCreateAccountComponent,
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
