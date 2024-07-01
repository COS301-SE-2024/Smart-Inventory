import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BubblechartComponent } from './bubblechart.component';

describe('BubblechartComponent', () => {
    let component: BubblechartComponent;
    let fixture: ComponentFixture<BubblechartComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BubblechartComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(BubblechartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
