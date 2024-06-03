import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';

describe('AppComponent', () => {


  beforeEach(async () => {

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [RouterModule.forRoot([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  xit('should have menu labels if defined', () => {
    const menuLabels = component.menuLabels;
    if (menuLabels) {
      expect(menuLabels.length).toEqual(12); // Adjust the expected number of menu labels
    } else {
      expect(menuLabels).toBeUndefined();
    }
  });

  xit('should have urls if defined', () => {
    const urls = component.urls;
    if (urls) {
      expect(urls.length).toEqual(12); // Adjust the expected number of URLs
    } else {
      expect(urls).toBeUndefined();
    }
  });

});
