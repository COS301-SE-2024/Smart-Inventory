// submission-deadline.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface SubmissionDeadlineResponse {
  quoteId: string;
  submissionDeadline: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubmissionDeadlineService {
  private apiUrl = 'https://y16smanxa3.execute-api.us-east-1.amazonaws.com/prod';

  constructor(private http: HttpClient) { }

  getSubmissionDeadline(quoteId: string): Observable<Date> {
    return this.http.get<SubmissionDeadlineResponse>(`${this.apiUrl}/submission-deadline/${quoteId}`)
      .pipe(
        map(response => new Date(response.submissionDeadline))
      );
  }
}