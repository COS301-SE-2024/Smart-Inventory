import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme: string;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.loadAppTheme();
    this.currentTheme = localStorage.getItem('appTheme') || 'light'; // Initialize currentTheme here
  }

  setAppTheme(theme: string) {
    this.currentTheme = theme;
    localStorage.setItem('appTheme', theme);
    this.updateTheme();
  }

  public loadAppTheme() {
    this.currentTheme = localStorage.getItem('appTheme') || 'light';
    this.updateTheme();
  }

  private updateTheme() {
    if (this.currentTheme === 'dark') {
      this.renderer.addClass(document.body, 'dark-theme');
      this.renderer.removeClass(document.body, 'light-theme');
    } else {
      this.renderer.addClass(document.body, 'light-theme');
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }
}
