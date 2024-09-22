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

}