import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  constructor() { }

  private loading = new BehaviorSubject<boolean>(false);
  public readonly isLoading$ = this.loading.asObservable();

  setLoading(isLoading: boolean): void {
    this.loading.next(isLoading);
  }
}
