import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { TeamComponent } from './pages/team/team.component';
import { SuppliersComponent } from './pages/suppliers/suppliers.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { HelpComponent } from './pages/help/help.component';
import { GridComponent } from './components/grid/grid.component';
import { SupplierFormComponent } from './components/supplier-form/supplier-form.component';
import { InventoryReportComponent } from './components/reports/inventory-report/inventory-report.component';
import { OrderReportComponent } from './components/reports/order-report/order-report.component';
import { SupplierReportComponent } from './components/reports/supplier-report/supplier-report.component';
import { ActivityReportComponent } from './components/reports/activity-report/activity-report.component';
import { ContactSupportComponent } from './components/contact-support/contact-support.component';
import { StockRequestReportComponent } from './components/stock-request-report/stock-request-report.component';
import { InventorySummaryComponent } from './pages/inventory-summary/inventory-summary.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { SettingsOverhaulComponent } from './components/settings-overhaul/settings-overhaul.component';

export const routes: Routes = [
    { path: '', redirectTo: '/landing', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'inventory', component: InventoryComponent },
    { path: 'reports', component: ReportsComponent },
    { path: 'supplierReport', component: SupplierReportComponent },
    { path: 'orderReport', component: OrderReportComponent },
    { path: 'team', component: TeamComponent },
    { path: 'suppliers', component: SuppliersComponent },
    { path: 'orders', component: OrdersComponent },
    { path: 'help', component: HelpComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'inventoryReport', component: InventoryReportComponent },
    { path: 'orderReport', component: OrderReportComponent },
    { path: 'grid', component: GridComponent },
    { path: 'supplierReport/:supplierID/:orderID', component: SupplierReportComponent },
    { path: 'activityReport', component: ActivityReportComponent },
    { path: 'contact-support', component: ContactSupportComponent },
    { path: 'stock-requests-report', component: StockRequestReportComponent },
    { path: 'inventory-summary', component: InventorySummaryComponent },
    { path: '', redirectTo: '/landing', pathMatch: 'full' },
    { path: 'landing', component: LandingPageComponent },
    { path: 'supplier-form/:supplierID/:quoteID/:deliveryID/:tenentId', component: SupplierFormComponent },
    { path: 'settings-new', component: SettingsOverhaulComponent },
];
