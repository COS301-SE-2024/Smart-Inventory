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
  private getUsersUrl = 'https://7tn45k7d02.execute-api.us-east-1.amazonaws.com/default/getUsersV2';
  private createItemUrl = 'https://17thrdnx8a.execute-api.us-east-1.amazonaws.com/default/Inventory-CreateItem';
  private getSuppliersUrl = 'https://ckfitxu8sc.execute-api.us-east-1.amazonaws.com/default/getSuppliers';
  private removeItemUrl = 'https://320riyj8x3.execute-api.us-east-1.amazonaws.com/default/Inventory-removeItem';
  private createReportUrl = 'https://pb9r6g083a.execute-api.us-east-1.amazonaws.com/default/Report-createItem';
  private getInventoryItemUrl = 'https://ay5r2tyq98.execute-api.us-east-1.amazonaws.com/default/getInventoryItem';

  constructor(private http: HttpClient) { }

  getInventoryItems(tenentId: string): Observable<any> {
    return this.http.get(`${this.getItemsUrl}?tenentId=${tenentId}`);
  }

  updateInventoryItem(updatedData: any): Observable<any> {
    return this.http.post(this.updateItemUrl, updatedData);
  }

  getUsers(userPoolId: string, tenentId: string): Observable<any> {
    return this.http.post(this.getUsersUrl, { userPoolId, tenentId });
  }

  createInventoryItem(formData: any): Observable<any> {
    return this.http.post(this.createItemUrl, formData);
  }

  getSuppliers(tenantId: string): Observable<any> {
    return this.http.get(`${this.getSuppliersUrl}?tenentId=${tenantId}`);
  }

  removeInventoryItem(inventoryID: string, tenentId: string): Observable<any> {
    return this.http.delete(this.removeItemUrl, { body: { inventoryID, tenentId } });
  }

  getInventoryItem(inventoryID: string, tenantId: string): Observable<any> {
    return this.http.get(`${this.getInventoryItemUrl}?inventoryID=${inventoryID}&tenantId=${tenantId}`);
  }

}