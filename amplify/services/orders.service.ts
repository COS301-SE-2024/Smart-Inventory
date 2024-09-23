import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private getOrdersUrl = 'https://fuo5nfhks9.execute-api.us-east-1.amazonaws.com/default/getOrders';
  private getQuoteDetailsUrl = 'https://ir85e243m6.execute-api.us-east-1.amazonaws.com/default/getQuoteDetails';

  constructor(private http: HttpClient) { }

  getOrders(tenentId: string): Observable<any> {
    return this.http.get(`${this.getOrdersUrl}?tenentId=${tenentId}`);
  }

  getQuoteDetails(tenentId: string, quoteId: string): Observable<any> {
    return this.http.get(`${this.getQuoteDetailsUrl}?tenentId=${tenentId}&quoteId=${quoteId}`);
  }
}