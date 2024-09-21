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

  constructor(private http: HttpClient) { }

  getInventoryItems(tenantId: string): Observable<any> {
    return this.http.get(`${this.getItemsUrl}?tenentId=${tenantId}`);
  }

  updateInventoryItem(updatedData: any): Observable<any> {
    return this.http.post(this.updateItemUrl, updatedData);
  }
}