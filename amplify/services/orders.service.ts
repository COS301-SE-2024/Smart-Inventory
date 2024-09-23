import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private getOrdersUrl = 'https://fuo5nfhks9.execute-api.us-east-1.amazonaws.com/default/getOrders';
  private getQuoteDetailsUrl = 'https://ir85e243m6.execute-api.us-east-1.amazonaws.com/default/getQuoteDetails';
  private updateQuoteDetailsUrl = 'https://w36e9kw5vj.execute-api.us-east-1.amazonaws.com/default/updateQuoteDetails';
  private createOrderUrl = 'https://nalaz32x49.execute-api.us-east-1.amazonaws.com/default/createOrder';
  private deleteOrderUrl = 'https://z4wpc8urf5.execute-api.us-east-1.amazonaws.com/default/deleteOrder';
  private receiveOrderUrl = 'https://pjxkk0m4ug.execute-api.us-east-1.amazonaws.com/default/receiveOrder';

  constructor(private http: HttpClient) { }

  getOrders(tenentId: string): Observable<any> {
    return this.http.get(`${this.getOrdersUrl}?tenentId=${tenentId}`);
  }

  getQuoteDetails(tenentId: string, quoteId: string): Observable<any> {
    return this.http.get(`${this.getQuoteDetailsUrl}?tenentId=${tenentId}&quoteId=${quoteId}`);
  }

  updateQuoteDetails(tenentId: string, quoteId: string, updatedQuote: any): Observable<any> {
    const url = `${this.updateQuoteDetailsUrl}?tenentId=${tenentId}&quoteId=${quoteId}`;
    return this.http.post(url, updatedQuote);
  }

  createOrder(orderData: any): Observable<any> {
    return this.http.post(this.createOrderUrl, orderData);
  }

  deleteOrder(tenentId: string, orderId: string, quoteId: string): Observable<any> {
    return this.http.delete(`${this.deleteOrderUrl}?tenentId=${tenentId}&orderId=${orderId}&quoteId=${quoteId}`);
  }

  receiveOrder(orderID: string, orderDate: string): Observable<any> {
    return this.http.post(this.receiveOrderUrl, { orderID, orderDate });
  }
}