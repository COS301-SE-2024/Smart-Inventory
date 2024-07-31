import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplatechartComponent } from './templatechart.component';

describe('TemplatechartComponent', () => {
  let component: TemplatechartComponent;
  let fixture: ComponentFixture<TemplatechartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplatechartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplatechartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
