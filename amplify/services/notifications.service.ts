import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private createNotificationUrl = 'https://ve1oryesx0.execute-api.us-east-1.amazonaws.com/prod/createNotification';
  private getNotificationsUrl = 'https://hzo8w0o8vg.execute-api.us-east-1.amazonaws.com/default/getNotifications';
  private readNotificationUrl = 'https://rst34lvuo1.execute-api.us-east-1.amazonaws.com/default/readNotification';

  constructor(private http: HttpClient) { }

  createNotification(notificationData: {
    tenentId: string,
    timestamp: string,
    notificationId: string,
    type: string,
    message: string,
    isRead: boolean
  }): Observable<any> {
    return this.http.post(this.createNotificationUrl, notificationData);
  }


  getNotifications(tenentId: string, limit: number = 10, lastEvaluatedKey?: string): Observable<any> {
    let params: any = { tenentId, limit };
    if (lastEvaluatedKey) {
      params.lastEvaluatedKey = lastEvaluatedKey;
    }
    return this.http.get(this.getNotificationsUrl, { params });
  }

  markNotificationAsRead(tenentId: string, notificationId: string): Observable<any> {
    return this.http.post(this.readNotificationUrl, { tenentId, notificationId });
  }

  markAllNotificationsAsRead(tenentId: string): Observable<any> {
    return this.http.post(this.readNotificationUrl, { tenentId, markAllAsRead: true });
  }

}