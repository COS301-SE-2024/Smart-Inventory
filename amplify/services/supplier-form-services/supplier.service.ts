import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private apiUrl = 'https://hwkrvpjd3a.execute-api.us-east-1.amazonaws.com/prod';
  constructor(private http: HttpClient) { }

  getSupplierInfo(tenentId: string, supplierID: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/suppliers/${tenentId}/${supplierID}`)
      .pipe(
        tap(response => console.log('Supplier API Response:', response))
      );
  }
}