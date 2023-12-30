import { map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { 
    ActivatedRouteSnapshot, 
    CanActivate, 
    CanActivateChild, 
    Router, 
    RouterStateSnapshot, 
    UrlTree 
  } from '@angular/router';

import { AuthService } from "./auth.service";


@Injectable({
  providedIn: 'root'
})
export class AuthPrivatesiteGuard implements CanActivate, CanActivateChild {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}
  

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    let privateSiteName = route.params.siteName ? route.params.siteName : route.params.id;
    return this.authService.checkPrivateSiteStatus(privateSiteName).toPromise().then(response => {
      if (response["data"]["isActive"]) {
        return true;
      } else {
        this.router.navigateByUrl("/privatesites/" + privateSiteName + "/deactivated");
        return false;
      }
    });
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    return this.canActivate(route, state);
  }

}
