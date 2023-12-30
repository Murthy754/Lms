import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private cookieService: CookieService) { }

  public setAuthToken(token): void {
    const today = new Date();
    const currentMonth = today.getMonth();
    today.setMonth(currentMonth + 1);
    let url = window.location.href;
    let domain = new URL(url).hostname;
    this.cookieService.set('x-header-authToken', token, today, "/", domain);
  }

  public getAuthToken(): string {
    return this.cookieService.get('x-header-authToken');
  }

  public setRefreshToken(token): void {
    const today = new Date();
    const currentMonth = today.getMonth();
    today.setMonth(currentMonth + 1);
    let url = window.location.href;
    let domain = new URL(url).hostname;
    this.cookieService.set('x-header-refreshToken', token, today, "/", domain);
  }

  public getRefreshToken(): string {
    return this.cookieService.get('x-header-refreshToken');
  }k

  public clearAllCookies() {
    let url = window.location.href;
    let domain = new URL(url).hostname;
    this.cookieService.delete('x-header-authToken', "/", domain);
    this.cookieService.delete('x-header-refreshToken', "/", domain);
    this.cookieService.delete('x-header-refreshToken', "/privatesites", domain);
    this.cookieService.delete('x-header-refreshToken', "/privatesites", domain);

  }

}
