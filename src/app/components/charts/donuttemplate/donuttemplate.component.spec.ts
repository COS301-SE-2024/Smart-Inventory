import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CombochartComponent } from './donuttemplate.component';

describe('CombochartComponent', () => {
  let component: CombochartComponent;
  let fixture: ComponentFixture<CombochartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CombochartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CombochartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
