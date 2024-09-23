import { Injectable, Type } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { GridsterItem } from 'angular-gridster2';

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

    addWidget(chartConfig: any): void {
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

    updateWidget(updatedWidget: DashboardItem): void {
        const currentDashboard = this.getDashboard();
        const updatedDashboard = currentDashboard.map((widget) =>
            widget.cardId === updatedWidget.cardId ? updatedWidget : widget,
        );
        this.dashboardSubject.next(updatedDashboard);
        this.persistState(updatedDashboard);
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
