import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private apiUrl = 'https://lihyo4ki5h.execute-api.us-east-1.amazonaws.com/prod';

  constructor(private http: HttpClient) { }

  getDeliveryInfo(tenentId: string, deliveryInfoID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/deliveryInfo/${tenentId}/${deliveryInfoID}`)
      .pipe(
        tap(response => console.log('Delivery Info API Response:', response))
      );
  }
}