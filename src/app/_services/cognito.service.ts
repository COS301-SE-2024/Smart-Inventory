// cognito.service.ts
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { fetchAuthSession, updatePassword, deleteUser } from 'aws-amplify/auth';

@Injectable({
  providedIn: 'root'
})
export class CognitoService {
  constructor() {}

  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    return from(updatePassword({ oldPassword, newPassword }));
  }

  verifyCurrentPassword(email: string, password: string): Observable<boolean> {
    return from(fetchAuthSession().then(() => true).catch(() => false));
  }

  deleteAccount(): Observable<void> {
    return from(deleteUser());
  }
}