import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private renderer: Renderer2;
    private colorScheme: 'dark' | 'light' | 'auto';
    private colorSchemeSubject = new BehaviorSubject<'dark' | 'light' | 'auto'>('auto');

    constructor(rendererFactory: RendererFactory2) {
        this.renderer = rendererFactory.createRenderer(null, null);
        this.colorScheme = 'auto';
    }

    detectColorScheme(): void {
        const savedScheme = localStorage.getItem('color-scheme') as 'dark' | 'light' | 'auto' | null;
        if (savedScheme) {
            this.setColorScheme(savedScheme);
        } else {
            this.setColorScheme('auto');
        }
    }

    setColorScheme(scheme: 'dark' | 'light' | 'auto'): void {
        this.colorScheme = scheme;
        localStorage.setItem('color-scheme', scheme);

        this.applyColorScheme();
        this.colorSchemeSubject.next(scheme);
    }

    private applyColorScheme(): void {
        if (this.colorScheme === 'auto') {
            this.renderer.removeAttribute(document.documentElement, 'data-theme');
        } else {
            this.renderer.setAttribute(document.documentElement, 'data-theme', this.colorScheme);
        }
    }

    toggleColorScheme(): void {
        const schemes: ('dark' | 'light' | 'auto')[] = ['light', 'dark', 'auto'];
        const currentIndex = schemes.indexOf(this.colorScheme);
        const nextScheme = schemes[(currentIndex + 1) % schemes.length];
        this.setColorScheme(nextScheme);
    }

    getColorScheme() {
        return this.colorSchemeSubject.asObservable();
    }
}