import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-received-quotes-side-pane',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './received-quotes-side-pane.component.html',
  styleUrls: ['./received-quotes-side-pane.component.css']
})
export class ReceivedQuotesSidePaneComponent {
  @Input() isOpen: boolean = false;
  @Input() selectedOrder: any;
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }
}