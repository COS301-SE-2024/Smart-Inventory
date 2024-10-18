import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppWrapperComponent } from 'app/components/app-wrapper/app-wrapper.component';
import '@angular/compiler';
import { enableProdMode } from '@angular/core';

bootstrapApplication(AppWrapperComponent, appConfig).catch((err) => console.error(err));
