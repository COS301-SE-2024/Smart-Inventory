import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { TeamComponent } from './pages/team/team.component';
import { SuppliersComponent } from './pages/suppliers/suppliers.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { HelpComponent } from './pages/help/help.component';
import { InventoryReportComponent } from './components/reports/inventory-report/inventory-report.component';
import { OrderReportComponent } from './components/reports/order-report/order-report.component';
import { SupplierReportComponent } from './components/reports/supplier-report/supplier-report.component';
import { ActivityReportComponent } from './components/reports/activity-report/activity-report.component';

export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'inventory', component: InventoryComponent },
    { path: 'reports', component: ReportsComponent },
    { path: 'team', component: TeamComponent },
    { path: 'suppliers', component: SuppliersComponent },
    { path: 'orders', component: OrdersComponent },
    { path: 'help', component: HelpComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'inventoryReport', component: InventoryReportComponent },
    { path: 'orderReport', component: OrderReportComponent },
    { path: 'supplierReport', component: SupplierReportComponent },
    { path: 'activityReport', component: ActivityReportComponent },
];