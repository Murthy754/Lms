import { Injectable } from "@angular/core";
import {
  CanActivate,
  CanActivateChild,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from "@angular/router";

import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuarder implements CanActivate {
  constructor(
    public _authService: AuthService,
    private _router: Router
  ) {}

  canActivate(){
    const userId = localStorage.getItem('userId');
    if(userId){
      return true
    }
    this._router.navigateByUrl('/login');
    return false;
}
}
