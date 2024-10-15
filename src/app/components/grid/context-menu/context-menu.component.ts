import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    Renderer2,
    NgZone,
} from '@angular/core';
import { GridApi } from 'ag-grid-community';
import { MatIconModule } from '@angular/material/icon';

interface MenuItem {
    title: string;
    action: string;
    icon?: string;
    disabled?: boolean;
}

@Component({
    selector: 'app-context-menu',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    template: `
        <div class="context-menu" [style.left.px]="adjustedX" [style.top.px]="adjustedY" *ngIf="isDisplayMenu">
            <ul>
                <li *ngFor="let item of menuItems" (click)="onMenuItemClick(item)" [class.disabled]="item.disabled">
                    <mat-icon *ngIf="item.icon">{{ item.icon }}</mat-icon>
                    <span>{{ item.title }}</span>
                </li>
            </ul>
        </div>
    `,
    styles: [
        `
            .context-menu {
                position: fixed;
                background: white;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                border-radius: 4px;
                padding: 8px 0;
                z-index: 1000;
            }
            ul {
                list-style-type: none;
                padding: 0;
                margin: 0;
            }
            li {
                padding: 8px 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
            }
            li:hover {
                background-color: #f0f0f0;
            }
            li.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            mat-icon {
                margin-right: 8px;
            }
        `,
    ],
})
export class ContextMenuComponent implements OnInit {
    @Input() x: number = 0;
    @Input() y: number = 0;
    @Input() menuItems: MenuItem[] = [];
    @Input() gridApi!: GridApi;

    @Output() menuItemClicked = new EventEmitter<string>();

    isDisplayMenu = false;
    adjustedX: number = 0;
    adjustedY: number = 0;

    constructor(
        private renderer: Renderer2,
        private elementRef: ElementRef,
        private ngZone: NgZone,
    ) {}

    ngOnInit() {
        this.ngZone.runOutsideAngular(() => {
            setTimeout(() => {
                this.calculateMenuPosition();
                this.ngZone.run(() => {
                    this.isDisplayMenu = true;
                });
            }, 0);
        });
    }

    calculateMenuPosition() {
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        // Estimate menu dimensions based on number of items
        const estimatedMenuHeight = this.menuItems.length * 40; // Assuming each item is about 40px high
        const estimatedMenuWidth = 200; // Assuming a fixed width of 200px

        this.adjustedX = this.x;
        this.adjustedY = this.y;

        if (this.x + estimatedMenuWidth > windowWidth) {
            this.adjustedX = windowWidth - estimatedMenuWidth;
        }

        if (this.y + estimatedMenuHeight > windowHeight) {
            this.adjustedY = windowHeight - estimatedMenuHeight;
        }
    }

    @HostListener('window:resize')
    onWindowResize() {
        this.calculateMenuPosition();
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.closeMenu();
        }
    }

    @HostListener('document:keydown.escape', ['$event'])
    onEscapePress(event: KeyboardEvent) {
        this.closeMenu();
    }

    onMenuItemClick(item: MenuItem) {
        if (!item.disabled) {
            this.menuItemClicked.emit(item.action);
            this.closeMenu();
        }
    }

    closeMenu() {
        this.isDisplayMenu = false;
    }
}
