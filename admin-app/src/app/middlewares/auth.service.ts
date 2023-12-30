import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
  private cookieService: CookieService
  ) {}

  isLoggedIn() {
    if (localStorage.getItem("userId")) {
      return true;
    }
    else {
      return false;
    }
  }

  public clearAllCookies() {
    this.cookieService.deleteAll();
  }

  public setAuthToken(token: any): void {
    this.cookieService.set('x-header-authtoken', token);
  }

  public getAuthToken(): string {
    return this.cookieService.get('x-header-authtoken');
  }
}
