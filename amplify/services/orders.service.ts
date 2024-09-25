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
  private addEmailTemplateUrl = 'https://kntgbohhfa.execute-api.us-east-1.amazonaws.com/default/addEmailTemplate';
  private sendSupplierEmailsUrl = 'https://n6ipwus5x9.execute-api.us-east-1.amazonaws.com/default/sendSupplierEmails';
  private getDeliveryIDUrl = 'https://jogw3ubi9k.execute-api.us-east-1.amazonaws.com/default/getDeliveryID';
  private getDeliveryDetailsUrl = 'https://83protl4jl.execute-api.us-east-1.amazonaws.com/default/getDeliveryDetails';
  private updateDeliveryInfoUrl = 'https://jbx7zo94aj.execute-api.us-east-1.amazonaws.com/default/updateDeliveryInfo';
  private getSupplierQuoteSummariesUrl = 'https://q3gigjwz01.execute-api.us-east-1.amazonaws.com/default/getSupplierQuoteSummaries';
  private getSupplierQuoteDetailsUrl = 'https://2ws3cl90j7.execute-api.us-east-1.amazonaws.com/default/getSupplierQuoteDetails';
  private acceptQuoteUrl = 'https://u4eziwz5vc.execute-api.us-east-1.amazonaws.com/default/acceptQuote';
  private sendRenegotiationEmailUrl = 'https://a4vbh87wj2.execute-api.us-east-1.amazonaws.com/default/sendRenegotiationEmail';

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

  sendSupplierEmails(emailData: any[]): Observable<any> {
    return this.http.post(this.sendSupplierEmailsUrl, { emailData });
  }

  getDeliveryID(tenentId: string): Observable<any> {
    return this.http.get(`${this.getDeliveryIDUrl}?tenentId=${tenentId}`);
  }

  getDeliveryDetails(tenentId: string): Observable<any> {
    return this.http.get(`${this.getDeliveryDetailsUrl}?tenentId=${tenentId}`);
  }

  updateDeliveryInfo(deliveryInfo: any): Observable<any> {
    return this.http.post(this.updateDeliveryInfoUrl, deliveryInfo);
  }

  getSupplierQuoteSummaries(quoteId: string, tenentId: string): Observable<any> {
    return this.http.get(`${this.getSupplierQuoteSummariesUrl}?quoteId=${quoteId}&tenentId=${tenentId}`);
  }

  getSupplierQuoteDetails(quoteID: string, supplierID: string, tenentId: string): Observable<any> {
    return this.http.get(`${this.getSupplierQuoteDetailsUrl}?quoteID=${quoteID}&supplierID=${supplierID}&tenentId=${tenentId}`);
  }

  acceptQuote(quoteData: any): Observable<any> {
    return this.http.post(this.acceptQuoteUrl, quoteData);
  }

  sendRenegotiationEmail(emailData: any): Observable<any> {
    return this.http.post(this.sendRenegotiationEmailUrl, emailData);
  }


}