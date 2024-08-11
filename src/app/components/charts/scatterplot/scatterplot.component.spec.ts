import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScatterplotComponent } from './scatterplot.component';

describe('ScatterplotComponent', () => {
  let component: ScatterplotComponent;
  let fixture: ComponentFixture<ScatterplotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScatterplotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScatterplotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
