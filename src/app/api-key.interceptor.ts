import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export function apiKeyInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  if (environment.apiKey) {
    const apiReq = req.clone({
      headers: req.headers.set('X-Api-Key', environment.apiKey)
    });
    return next(apiReq);
  }
  return next(req);
}