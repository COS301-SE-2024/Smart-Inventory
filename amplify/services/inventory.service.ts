// inventory.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = 'https://tt5uju7o6j.execute-api.us-east-1.amazonaws.com/default/Inventory-getItems';

  constructor(private http: HttpClient) { }

  getInventoryItems(tenantId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?tenentId=${tenantId}`);
  }
}