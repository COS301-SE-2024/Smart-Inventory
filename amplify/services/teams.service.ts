import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamsService {
  private getUsersUrl = 'https://7tn45k7d02.execute-api.us-east-1.amazonaws.com/default/getUsersV2';

  constructor(private http: HttpClient) { }

  getUsers(userPoolId: string, tenentId: string): Observable<any> {
    return this.http.post(this.getUsersUrl, { userPoolId, tenentId });
  }


}