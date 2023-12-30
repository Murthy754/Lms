import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { LoaderService } from '../shared-service/loader.service';

@Injectable({
  providedIn: 'root'
})
export class HttpInterceptorService implements HttpInterceptor {
  private httpCount = 0;
  constructor(
    private authService: AuthService,
    private router: Router,
    private loaderService: LoaderService
  ) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {

    this.httpCount++;
    this.loaderService.changeLoadingVisibility(true);

    request = request.clone({
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        "x-header-authtoken": this.authService.getAuthToken()
      })
    });

    

    return next.handle(request).pipe(
      map((res: any) => {
        if (res && res['type'] !== 0) {
          if (res.body && res.body.tokens) {
            this.authService.clearAllCookies();
            this.authService.setAuthToken(res.body.tokens.authToken);
            delete res.body.tokens;
          }
          if (this.httpCount > 0) {
            this.httpCount -= 1;
          }
          if (this.httpCount === 0) {
            this.loaderService.changeLoadingVisibility(false);
          }
          return res;
        }
      }),
      catchError((error: any) => {
        if (this.httpCount > 0) {
          this.httpCount -= 1;
        }
        if (this.httpCount === 0) {
          this.loaderService.changeLoadingVisibility(false);
        }
        if (error.status === 401 || error.name === 'UnauthorizedError' || (error.error && error.error.message === 'invalid token')) {
          this.authService.clearAllCookies();
          localStorage.clear();
          this.router.navigateByUrl('/login');
        }
        return throwError(error);
      })
    );
  }

}
