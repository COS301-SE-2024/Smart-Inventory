// inventory.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private getItemsUrl = 'https://tt5uju7o6j.execute-api.us-east-1.amazonaws.com/default/Inventory-getItems';
  private updateItemUrl = 'https://ss0lx1hku8.execute-api.us-east-1.amazonaws.com/default/Inventory-updateItem';
  private createItemUrl = 'https://17thrdnx8a.execute-api.us-east-1.amazonaws.com/default/Inventory-CreateItem';
  private removeItemUrl = 'https://320riyj8x3.execute-api.us-east-1.amazonaws.com/default/Inventory-removeItem';
  private getInventoryItemUrl = 'https://ay5r2tyq98.execute-api.us-east-1.amazonaws.com/default/getInventoryItem';
  private inventorySummaryUpdateItemUrl = 'https://ite07edpdc.execute-api.us-east-1.amazonaws.com/default/inventorySummary-updateItem';
  private inventorySummaryGetItemsUrl = 'https://d53ot717bg.execute-api.us-east-1.amazonaws.com/default/inventorySummary-getItems';
  private inventorySummaryGetItemUrl = 'https://dqpvi3r6m9.execute-api.us-east-1.amazonaws.com/default/inventorySummary-getItem';
  private runEoqRopCalculationUrl = 'https://your-api-gateway-url.amazonaws.com/default/EOQ_ROP_Calculations';

  constructor(private http: HttpClient) { }

  // EOQ ROP ABC analysis
  runEoqRopCalculation(tenentId: string): Observable<any> {
    return this.http.post(this.runEoqRopCalculationUrl, { tenentId });
  }

  getInventoryItems(tenentId: string): Observable<any> {
    return this.http.get(`${this.getItemsUrl}?tenentId=${tenentId}`);
  }

  updateInventoryItem(updatedData: any): Observable<any> {
    return this.http.post(this.updateItemUrl, updatedData);
  }

  createInventoryItem(formData: any): Observable<any> {
    return this.http.post(this.createItemUrl, formData);
  }

  removeInventoryItem(inventoryID: string, tenentId: string): Observable<any> {
    return this.http.delete(this.removeItemUrl, { body: { inventoryID, tenentId } });
  }

  getInventoryItem(inventoryID: string, tenantId: string): Observable<any> {
    return this.http.get(`${this.getInventoryItemUrl}?inventoryID=${inventoryID}&tenantId=${tenantId}`);
  }

  inventorySummaryUpdateItem(updatedData: any): Observable<any> {
    return this.http.post(this.inventorySummaryUpdateItemUrl, updatedData);
  }

  inventorySummaryGetItems(params?: any): Observable<any> {
    return this.http.get(this.inventorySummaryGetItemsUrl, { params });
  }

  inventorySummaryGetItem(tenentId: string, sku: string): Observable<any> {
    return this.http.post(this.inventorySummaryGetItemUrl, { tenentId, sku });
  }

}