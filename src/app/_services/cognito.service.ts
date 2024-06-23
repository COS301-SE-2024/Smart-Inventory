// cognito.service.ts
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { 
  fetchAuthSession, 
  updatePassword, 
  deleteUser, 
  getCurrentUser,
  fetchUserAttributes,
  updateUserAttributes,
  FetchUserAttributesOutput,
  UpdateUserAttributesOutput
} from 'aws-amplify/auth';

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

  getCurrentUserAttributes(): Observable<FetchUserAttributesOutput> {
    return from(fetchUserAttributes());
  }

  updateUserAttribute(userAttributes: Record<string, string>): Observable<UpdateUserAttributesOutput> {
    return from(updateUserAttributes({ userAttributes }));
  }

  getCurrentUser(): Observable<any> {
    return from(getCurrentUser());
  }
}