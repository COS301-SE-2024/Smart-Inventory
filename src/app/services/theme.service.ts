import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private darkMode = new BehaviorSubject<boolean>(false);

    isDarkMode$ = this.darkMode.asObservable();

    constructor() {
        this.loadDarkModePreference();
    }

    toggleDarkMode() {
        this.darkMode.next(!this.darkMode.value);
        this.saveDarkModePreference();
    }

    private loadDarkModePreference() {
        const darkMode = localStorage.getItem('darkMode');
        if (darkMode) {
            this.darkMode.next(JSON.parse(darkMode));
        }
    }

    private saveDarkModePreference() {
        localStorage.setItem('darkMode', JSON.stringify(this.darkMode.value));
    }
}