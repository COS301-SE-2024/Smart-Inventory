import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineBarComponent } from './line-bar.component';

describe('LineBarComponent', () => {
  let component: LineBarComponent;
  let fixture: ComponentFixture<LineBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LineBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
