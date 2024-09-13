import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    constructor() {}

    private theme: string = localStorage.getItem('theme') || 'light';

    setTheme(theme: string): void {
        this.theme = theme;
        localStorage.setItem('theme', theme);
        document.body.setAttribute('data-theme', theme);
    }

    getTheme(): string {
        return this.theme;
    }
}
