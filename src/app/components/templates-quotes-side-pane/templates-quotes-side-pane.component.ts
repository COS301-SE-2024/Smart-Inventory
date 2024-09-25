import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TemplateQuoteModalComponent } from '../template-quote-modal/template-quote-modal.component';

interface TemplateQuote {
  id: string;
  title: string;
  items: number;
  supplier: string;
  nextOrderDate: string;
  frequency: string;
}

@Component({
  selector: 'app-templates-quotes-side-pane',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatAutocompleteModule,
    MatTooltipModule
  ],
  templateUrl: './templates-quotes-side-pane.component.html',
  styleUrls: ['./templates-quotes-side-pane.component.css']
})
export class TemplatesQuotesSidePaneComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Output() closed = new EventEmitter<void>();

  sortedTemplates: TemplateQuote[] = [];
  paneWidth = 800;
  private resizing = false;
  searchQuery: string = '';
  filteredOptions: string[] = [];

  templates: TemplateQuote[] = [
    {
      id: '1',
      title: 'Monthly Office Supplies',
      items: 10,
      supplier: 'Office Depot',
      nextOrderDate: '2024-04-01',
      frequency: 'Monthly'
    },
    {
      id: '2',
      title: 'Quarterly IT Equipment',
      items: 5,
      supplier: 'TechSupplies Inc.',
      nextOrderDate: '2024-06-15',
      frequency: 'Quarterly'
    }
  ];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && this.isOpen) {
      this.sortedTemplates = [...this.templates];
    }
  }

  close() {
    this.closed.emit();
  }

  onSearch() {
    this.sortedTemplates = this.templates.filter(template =>
      template.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      template.supplier.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.updateFilteredOptions();
  }

  private updateFilteredOptions() {
    const allValues = this.templates.flatMap(template => [template.title, template.supplier]);
    const uniqueValues = Array.from(new Set(allValues));
    this.filteredOptions = uniqueValues.filter(value =>
      value.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  openTemplateQuoteModal() {
    const dialogRef = this.dialog.open(TemplateQuoteModalComponent, {
      width: '600px',
      maxWidth: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addNewTemplate(result);
      }
    });
  }

  addNewTemplate(templateData: any) {
    const newTemplate: TemplateQuote = {
      id: (this.templates.length + 1).toString(),
      title: templateData.title,
      items: templateData.items.length,
      supplier: templateData.supplier,
      nextOrderDate: this.calculateNextOrderDate(templateData.frequency),
      frequency: templateData.frequency
    };

    this.templates.push(newTemplate);
    this.sortedTemplates = [...this.templates];
    this.snackBar.open('New template added successfully', 'Close', { duration: 3000 });
  }

  removeTemplate(templateId: string) {
    const index = this.templates.findIndex(t => t.id === templateId);
    if (index !== -1) {
      this.templates.splice(index, 1);
      this.sortedTemplates = [...this.templates];
      this.snackBar.open('Template removed successfully', 'Close', { duration: 3000 });
    }
  }

  calculateNextOrderDate(frequency: string): string {
    const today = new Date();
    switch (frequency) {
      case 'Weekly':
        today.setDate(today.getDate() + 7);
        break;
      case 'Monthly':
        today.setMonth(today.getMonth() + 1);
        break;
      case 'Quarterly':
        today.setMonth(today.getMonth() + 3);
        break;
      case 'Yearly':
        today.setFullYear(today.getFullYear() + 1);
        break;
    }
    return today.toISOString().split('T')[0];
  }

  startResize(event: MouseEvent) {
    this.resizing = true;
    event.preventDefault();
    document.addEventListener('mousemove', this.resize);
    document.addEventListener('mouseup', this.stopResize);
  }

  private resize = (event: MouseEvent) => {
    if (this.resizing) {
      const newWidth = window.innerWidth - event.clientX;
      if (newWidth > 400 && newWidth < 1200) {
        this.paneWidth = newWidth;
      }
    }
  }

  private stopResize = () => {
    this.resizing = false;
    document.removeEventListener('mousemove', this.resize);
    document.removeEventListener('mouseup', this.stopResize);
  }

  ngOnDestroy() {
    this.stopResize();
  }
}