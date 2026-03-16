import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import { AuthService } from './auth.service';
import {Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) return next(req);

  const isApiCall = req.url.startsWith('/api/');
  const isLoginCall = req.url.startsWith('/api/auth/login');

  if (!isApiCall || isLoginCall) return next(req);

  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.token();

  const request = token
    ? req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }) : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.logout();
        router.navigateByUrl('/login');
      }
      return throwError(()=> error);
    })
  );
};
