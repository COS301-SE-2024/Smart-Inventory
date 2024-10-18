// src/app/services/secure-data.service.ts

import { Injectable } from '@angular/core';
import { LocalStorageCleanerService } from './localstorage-cleaner.service';

@Injectable({
  providedIn: 'root'
})
export class SecureDataService {
  constructor(private localStorageCleaner: LocalStorageCleanerService) {}

  async getSecureItem(key: string): Promise<string | null> {
    const localValue = localStorage.getItem(key);
    if (localValue) {
      await this.localStorageCleaner.moveToCache();
      return localValue;
    }
    return this.localStorageCleaner.getFromCache(key);
  }

  async setSecureItem(key: string, value: string): Promise<void> {
    const cache = await caches.open(this.localStorageCleaner.cacheName);
    await cache.put(new Request(key), new Response(value));
  }
}