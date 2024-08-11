import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedQuotesSidePaneComponent } from './received-quotes-side-pane.component';

describe('ReceivedQuotesSidePaneComponent', () => {
  let component: ReceivedQuotesSidePaneComponent;
  let fixture: ComponentFixture<ReceivedQuotesSidePaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivedQuotesSidePaneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivedQuotesSidePaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
