import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import {
  CanActivate,
  CanActivateChild,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from "@angular/router";

import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuarder implements CanActivate, CanActivateChild {
  constructor(
    public authService: AuthService,
    private router: Router,
    private cookieService: CookieService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    let url: string = state.url;
    return this.checkLogin(url);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.canActivate(route, state);
  }

  checkLogin(url: string): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    this.cookieService.set("isopen", "open");
    if (this.cookieService.get('userHomeTabLocation') && this.cookieService.get('userHomeLocation')) {
      let userHomeTabLocation = this.cookieService.get('userHomeTabLocation');
      let userHomeLocation = this.cookieService.get('userHomeLocation');
      this.router.navigateByUrl("/home/"+ userHomeTabLocation + "?location=" + userHomeLocation);
    } else if (this.cookieService.get('userHomeTabLocation')) {
      let userHomeTabLocation = this.cookieService.get('userHomeTabLocation');
      this.router.navigateByUrl("/home/"+ userHomeTabLocation + "?location=world");
    } else {
      this.router.navigateByUrl("/home/top?location=world");
    }
    return false;
  }
}
