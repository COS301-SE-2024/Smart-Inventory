import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {
  private getSuppliersUrl = 'https://ckfitxu8sc.execute-api.us-east-1.amazonaws.com/default/getSuppliers';
  private editSupplierUrl = 'https://sv62goilj1.execute-api.us-east-1.amazonaws.com/default/editSupplier';
  private addSupplierUrl = 'https://tkrmia0vb9.execute-api.us-east-1.amazonaws.com/default/addSupplier';
  private deleteSupplierUrl = 'https://37xay8kw21.execute-api.us-east-1.amazonaws.com/default/deleteSupplier';

  constructor(private http: HttpClient) { }

  getSuppliers(tenantId: string): Observable<any> {
    return this.http.get(`${this.getSuppliersUrl}?tenentId=${tenantId}`);
  }

  editSupplier(supplierData: any): Observable<any> {
    return this.http.put(this.editSupplierUrl, supplierData);
  }

  addSupplier(supplierData: any): Observable<any> {
    return this.http.post(this.addSupplierUrl, supplierData);
  }

  deleteSupplier(supplierID: string, tenentId: string): Observable<any> {
    return this.http.delete(this.deleteSupplierUrl, { body: { supplierID, tenentId } });
  }
  
}