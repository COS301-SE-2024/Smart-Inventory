import { Component, Input } from '@angular/core';
import { MaterialModule } from 'app/components/material/material.module';

@Component({
    selector: 'app-metric-card',
    standalone: true,
    imports: [MaterialModule],
    template: `
        <mat-card class="dashboard-card">
            <div class="card-content">
                <div class="left-content">
                    <div class="icon-container">
                        <mat-icon>{{ icon }}</mat-icon>
                    </div>
                    <div class="info-container">
                        <h3 class="card-title">{{ title }}</h3>
                        <p class="card-value">{{ formatValue(value, type) }}</p>
                    </div>
                </div>
                <div class="right-content">
                    <div class="progress-ring" [style.background-image]="getProgressRingStyle(change, color)">
                        <span class="change-value"> {{ change > 0 ? '+' : '' }}{{ change }}% </span>
                    </div>
                </div>
            </div>
        </mat-card>
    `,
    styles: [
        `
            .dashboard-card {
                height: 100%;
            }
            .card-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .left-content {
                display: flex;
                align-items: center;
            }
            .icon-container {
                margin-right: 16px;
            }
            .info-container {
                display: flex;
                flex-direction: column;
            }
            .card-title {
                margin: 0;
                font-size: 16px;
            }
            .card-value {
                margin: 0;
                font-size: 24px;
                font-weight: bold;
            }
            .progress-ring {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .change-value {
                font-size: 14px;
                font-weight: bold;
            }
        `,
    ],
})
export class MetricCardComponent {
    @Input() title: string = '';
    @Input() value: number | string = 0;
    @Input() icon: string = '';
    @Input() type: string = '';
    @Input() change: number = 0;
    @Input() color: string = '';

    formatValue(value: number | string, type: string): string {
        if (typeof value === 'number') {
            if (type === 'currency') {
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
            } else if (type === 'percentage') {
                return `${value}%`;
            }
            return value.toLocaleString();
        }
        return value;
    }

    getColor(color: string): string {
        const colorMap: { [key: string]: string } = {
            green: 'text-green-500',
            red: 'text-red-500',
            yellow: 'text-yellow-500',
        };
        return colorMap[color] || 'text-gray-500';
    }

    getProgressRingStyle(change: number, color: string): string {
        const absChange = Math.abs(change);
        const degree = (absChange / 100) * 360;
        return `conic-gradient(${this.getColorHex(color)} 0deg ${degree}deg, #f0f0f0 ${degree}deg 360deg)`;
    }

    getColorHex(color: string): string {
        const colorMap: { [key: string]: string } = {
            green: '#4CAF50',
            red: '#F44336',
            yellow: '#FFC107',
        };
        return colorMap[color] || '#9E9E9E';
    }
}
