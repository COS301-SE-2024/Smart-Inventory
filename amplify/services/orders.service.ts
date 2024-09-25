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
  private getQuoteItemsUrl = 'https://gfrc699s45.execute-api.us-east-1.amazonaws.com/prod/quotes';
  private orderAutomationUrl = 'https://rb9wh1dnqh.execute-api.us-east-1.amazonaws.com/default/orderAutomation';
  private getAutomationSettingsUrl = 'https://vgv9dlglg6.execute-api.us-east-1.amazonaws.com/default/getAutomationSettings';
  private updateAutomationSettingsUrl = 'https://fox1dnu2d2.execute-api.us-east-1.amazonaws.com/default/updateAutomationSettings';
  private getEmailTemplateUrl = 'https://ard5rjpzn0.execute-api.us-east-1.amazonaws.com/default/getEmailTemplate';
  private addEmailTemplateUrl = 'https://kntgbohhfa.execute-api.us-east-1.amazonaws.com/default/addEmailTemplate';

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

  getQuoteItems(tenentId: string, quoteID: string): Observable<any> {
    return this.http.get(`${this.getQuoteItemsUrl}/${tenentId}/${quoteID}`);
  }

  orderAutomation(tenentId: string): Observable<any> {
    return this.http.post(this.orderAutomationUrl, { tenentId });
  }

  getAutomationSettings(tenentId: string): Observable<any> {
    return this.http.get(`${this.getAutomationSettingsUrl}?tenentId=${tenentId}`);
  }

  updateAutomationSettings(tenentId: string, settings: any): Observable<any> {
    return this.http.post(this.updateAutomationSettingsUrl, { tenentId, settings });
  }

  addEmailTemplate(tenentId: string, emailBody: string): Observable<any> {
    return this.http.post(this.addEmailTemplateUrl, { tenentId, emailBody });
  }

  getEmailTemplate(tenentId: string): Observable<any> {
    return this.http.get(`${this.addEmailTemplateUrl}?tenentId=${tenentId}`);
  }

  saveEmailTemplate(tenentId: string, emailBody: string): Observable<any> {
    return this.http.post(this.addEmailTemplateUrl, { tenentId, emailBody });
  }

}