import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonButton, IonInput, IonContent, provideIonicAngular } from '@ionic/angular/standalone';

import { AppRoutingModule } from './app-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LoginCreateAccountComponent } from './pages/loginCreateAccount/loginCreateAccount.component';
import { AppComponent } from './app.component';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';

addIcons(allIcons);

import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';

addIcons(allIcons);

@NgModule({
    declarations: [AppComponent, LoginCreateAccountComponent],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        ReactiveFormsModule,
        AppRoutingModule,
        IonButton,
        IonContent,
        IonInput,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        FormsModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatSnackBarModule,
    ],
    providers: [
        provideIonicAngular(),
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        provideAnimationsAsync(),
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
