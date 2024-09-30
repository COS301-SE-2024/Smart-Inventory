import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarHorizontalComponent } from './bar-horizontal.component';

describe('BarHorizontalComponent', () => {
  let component: BarHorizontalComponent;
  let fixture: ComponentFixture<BarHorizontalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarHorizontalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarHorizontalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
