import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { GridsterItem } from 'angular-gridster2';

export interface ChartConfig {
    type: string;
    data: any;
    title: string;
    component: string;
}

export interface CardData {
    title: string;
    value: string | number;
    icon: string;
    type: 'currency' | 'number' | 'percentage' | 'string';
    change?: number;
    color: string;
}

export interface DashboardItem extends GridsterItem {
    cardId?: string;
    name?: string;
    component?: string;
    chartConfig?: any;
}
@Injectable({
    providedIn: 'root',
})
export class DashboardService {
    private saveTrigger = new Subject<void>();
    private dashboardSubject: BehaviorSubject<DashboardItem[]>;
    public dashboard$: Observable<DashboardItem[]>;

    constructor() {
        const savedDashboard = this.loadState();
        this.dashboardSubject = new BehaviorSubject<DashboardItem[]>(savedDashboard);
        this.dashboard$ = this.dashboardSubject.asObservable();
    }

    getDashboard(): DashboardItem[] {
        return this.dashboardSubject.getValue();
    }

    saveState() {
        this.saveTrigger.next();
    }

    addWidget(chartConfig: ChartConfig): void {
        const newItem: GridsterItem = {
            cols: 6,
            rows: 2,
            y: 0,
            x: 0,
            cardId: chartConfig.title.toLowerCase().replace(' ', '-'),
            name: chartConfig.title,
            component: chartConfig.component,
            chartConfig: chartConfig,
        };
        const currentDashboard = this.getDashboard();
        const updatedDashboard = [...currentDashboard, newItem];
        this.dashboardSubject.next(updatedDashboard);
        this.persistState(updatedDashboard);
        this.saveState();
    }

    removeWidget(widget: DashboardItem): DashboardItem[] {
        const currentDashboard = this.getDashboard();
        const updatedDashboard = currentDashboard.filter((item) => item !== widget);
        this.dashboardSubject.next(updatedDashboard);
        this.persistState(updatedDashboard);
        this.saveState();
        return updatedDashboard;
    }

    // this.updateWidget(newItem, {
    //     categories: ['Jan', 'Feb', 'Mar'],
    //     values: [100, 10, 15],
    // });
    updateWidget(updatedWidget: DashboardItem): void {
        const currentDashboard = this.getDashboard();
        const updatedDashboard = currentDashboard.map((widget) =>
            widget.cardId === updatedWidget.cardId ? updatedWidget : widget,
        );
        this.dashboardSubject.next(updatedDashboard);
        this.persistState(updatedDashboard);
    }

    updateDashboard(dashboard: DashboardItem[]) {
        this.dashboardSubject.next(dashboard);
        this.persistState(dashboard);
        this.saveState();
    }

    initializeDashboard(): DashboardItem[] {
        const cardData: CardData[] = [
            {
                title: 'Total Revenue',
                value: 1250000,
                icon: 'attach_money',
                type: 'currency',
                change: 15.2,
                color: 'green',
            },
            {
                title: 'New Customers',
                value: 847,
                icon: 'person_add',
                type: 'number',
                change: 5.6,
                color: 'green',
            },
            {
                title: 'Customer Satisfaction',
                value: 92,
                icon: 'sentiment_satisfied',
                type: 'percentage',
                change: -2.1,
                color: 'yellow',
            },
            {
                title: 'Orders Processed',
                value: 1532,
                icon: 'shopping_cart',
                type: 'number',
                change: 8.3,
                color: 'green',
            },
        ];
    
        const initialDashboard: DashboardItem[] = cardData.map((data, index) => ({
            cols: 3,
            rows: 1,
            y: 0,
            x: index * 3,
            cardData: data,
        }));

        initialDashboard.push(
            // First full-width item
            {
                cols: 12,
                rows: 3,
                y: 2,
                x: 0,
                cardId: 'sales-chart',
                name: 'Sales Chart',
                component: 'SaleschartComponent',
            },
            // Second full-width item(0)
            {
                cols: 12,
                rows: 3,
                y: 4,
                x: 0,
                cardId: 'bar-chart',
                name: 'Bar Chart',
                component: 'BarchartComponent',
            },
            // First half-width item
            {
                cols: 6,
                rows: 3,
                y: 6,
                x: 0,
                cardId: 'bubble-chart',
                name: 'Bubble Chart',
                component: 'BubblechartComponent',
            },
            // Second half-width item
            {
                cols: 6,
                rows: 4,
                y: 6,
                x: 6,
                cardId: 'donut-chart',
                name: 'Donut Chart',
                component: 'DonutchartComponent',
            },
        )
    
        this.updateDashboard(initialDashboard);
        return initialDashboard;
    }

    persistState(dashboard: DashboardItem[]): void {
        localStorage.setItem('dashboardState', JSON.stringify(dashboard));
    }

    loadState(): DashboardItem[] {
        const savedState = localStorage.getItem('dashboardState');
        return savedState ? JSON.parse(savedState) : [];
    }

    getTrigger() {
        return this.saveTrigger;
    }

    getState() {
        return localStorage.getItem('dashboardState');
    }
}
