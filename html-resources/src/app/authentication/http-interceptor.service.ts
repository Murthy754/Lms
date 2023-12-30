import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { AuthService as _authService } from '../auth.service';
import { CookieService } from "ngx-cookie-service";
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { ModalComponent } from "../modal/modal.component";
import { LoaderService } from '../shared-services/loader.service';
@Injectable({
  providedIn: 'root'
})
export class HttpInterceptorService implements HttpInterceptor {
  private httpCount = 0;
  bsModalRef: BsModalRef;
  constructor(
    private authService: AuthService,
    private router: Router,
    private authenticationService: _authService,
    private cookieService: CookieService,
    private modalService: BsModalService,
    private loaderService: LoaderService
  ) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    let hideLoader = request.headers.get('hideLoader') == 'true' ? true : false;
    if(!hideLoader) {
      this.httpCount++;
      this.loaderService.changeLoadingVisibility(true);
    }
    request = request.clone({
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        "x-header-authtoken": this.authService.getAuthToken(),
        "x-header-refreshtoken":this.authService.getRefreshToken(),
      })
    });

    return next.handle(request).pipe(
      map((res: HttpResponse<any>) => {
        if (res && res['type'] !== 0) {
          if (res.body && res.body.tokens) {
            this.authService.clearAllCookies();
            this.authService.setAuthToken(res.body.tokens.authToken);
            this.authService.setRefreshToken(res.body.tokens.refreshToken);
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
          this.httpCount = 0;
          this.loaderService.changeLoadingVisibility(false);
          this.authService.clearAllCookies();
          localStorage.clear();
          this.authenticationService.isPrivateSite = "No";
          this.router.navigateByUrl('/home/top?location=world');
          const initialState = {
            title: "Modal with component",
            backdrop: 'static',
            ignoreBackdropClick: true
          };
          this.bsModalRef = this.modalService.show(ModalComponent, {
            initialState
          });
          this.bsModalRef.content.alertTitle = "Alert";
          this.bsModalRef.content.isCancel = true;
          this.bsModalRef.content.content =
            "Your Session Expired. Please login again.";
          this.bsModalRef.content.onClose = myData => {
            this.bsModalRef.hide();
          };
        }
        return throwError(error);
      })
    );
  }

}
