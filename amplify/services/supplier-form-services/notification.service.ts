// notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'https://ve1oryesx0.execute-api.us-east-1.amazonaws.com/prod';

  constructor(private http: HttpClient) { }

  createNotification(notificationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/createNotification`, notificationData);
  }
}