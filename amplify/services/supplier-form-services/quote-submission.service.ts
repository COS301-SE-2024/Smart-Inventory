// quote-submission.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuoteSubmissionService {
  private apiUrl = 'https://uzs5y0bgri.execute-api.us-east-1.amazonaws.com/prod';

  constructor(private http: HttpClient) { }

  submitQuote(quoteData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/submitSupplierQuote`, quoteData);
  }
}