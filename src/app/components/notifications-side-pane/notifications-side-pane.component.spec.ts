import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsSidePaneComponent } from './notifications-side-pane.component';

describe('NotificationsSidePaneComponent', () => {
  let component: NotificationsSidePaneComponent;
  let fixture: ComponentFixture<NotificationsSidePaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsSidePaneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationsSidePaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
