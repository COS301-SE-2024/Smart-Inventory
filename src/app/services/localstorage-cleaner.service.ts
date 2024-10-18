import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageCleanerService {
  private sensitiveKeys = [
    'accessToken',
    'idToken',
    'refreshToken',
    'clockDrift',
    'lastAuthUser',
    'signInDetails'
  ];
  readonly cacheName = 'secure-app-cache';

  async moveToCache(): Promise<void> {
    const cache = await caches.open(this.cacheName);

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && this.isSensitiveKey(key)) {
        const value = localStorage.getItem(key);
        if (value) {
          await cache.put(new Request(key), new Response(value));
          localStorage.removeItem(key);
          console.warn(`Moved sensitive data to cache: ${key}`);
        }
      }
    }
  }

  async getFromCache(key: string): Promise<string | null> {
    const cache = await caches.open(this.cacheName);
    const response = await cache.match(new Request(key));
    return response ? await response.text() : null;
  }

  private isSensitiveKey(key: string): boolean {
    return this.sensitiveKeys.some(sensitiveKey =>
      key.toLowerCase().includes(sensitiveKey.toLowerCase())
    );
  }
}