// quote.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private apiUrl = 'https://gfrc699s45.execute-api.us-east-1.amazonaws.com/prod';

  constructor(private http: HttpClient) { }

  getQuoteItems(quoteID: string, tenentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/quotes/${tenentId}/${quoteID}`)
      .pipe(
        tap(response => console.log('Quote Items API Response:', response)),
        map(this.transformQuoteItems)
      );
  }

  private transformQuoteItems(response: any): any[] {
    // Assuming the response is an array of items
    return response.map((item: any) => ({
      upc: item.UPC,
      description: item.Description,
      sku: item.ItemSKU,
      requestedQuantity: item.Quantity,
      isAvailable: true,
      availableQuantity: item.Quantity,
      unitCost: 0,
      totalCost: 0,
      discount: 0,
      totalPrice: 0
    }));
  }
}