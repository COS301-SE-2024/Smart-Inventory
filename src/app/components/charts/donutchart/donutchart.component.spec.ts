import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonutchartComponent } from './donutchart.component';

describe('DonutchartComponent', () => {
    let component: DonutchartComponent;
    let fixture: ComponentFixture<DonutchartComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DonutchartComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(DonutchartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
