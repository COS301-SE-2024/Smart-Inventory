// filter.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class FilterService {
    private filterSource = new BehaviorSubject<string>('year');
    currentFilter = this.filterSource.asObservable();

    constructor() {}

    changeFilter(filter: string) {
        this.filterSource.next(filter);
    }
}
