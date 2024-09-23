import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private sampleUrl = 'https://7tn45k7d02.execute-api.us-east-1.amazonaws.com/default/myFunction';

  constructor(private http: HttpClient) { }


}