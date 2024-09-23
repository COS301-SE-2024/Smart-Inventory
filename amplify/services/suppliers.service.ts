import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {
  private sampleUrl = 'https://7tn45k7d02.execute-api.us-east-1.amazonaws.com/default/myFunction';
  private getSuppliersUrl = 'https://ckfitxu8sc.execute-api.us-east-1.amazonaws.com/default/getSuppliers';

  constructor(private http: HttpClient) { }

  getSuppliers(tenantId: string): Observable<any> {
    return this.http.get(`${this.getSuppliersUrl}?tenentId=${tenantId}`);
  }


}