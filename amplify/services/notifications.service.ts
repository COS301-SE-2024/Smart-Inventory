import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private createNotificationUrl = 'https://ve1oryesx0.execute-api.us-east-1.amazonaws.com/prod/createNotification';

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
}