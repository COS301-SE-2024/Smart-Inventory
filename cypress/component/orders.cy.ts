import { OrdersComponent } from '../../src/app/pages/orders/orders.component';
import { MatDialogModule } from '@angular/material/dialog';
import { TitleService } from '../../src/app/components/header/title.service';
import { MaterialModule } from '../../src/app/components/material/material.module';
import { CommonModule } from '@angular/common';
describe('OrdersComponent', () => {
    beforeEach(() => {
        cy.mount(OrdersComponent, {
            imports: [MaterialModule, CommonModule, MatDialogModule],
            providers: [MatDialogModule, TitleService],
        });
    });
    it('should be expanded when menu clicked', () => {});
});
