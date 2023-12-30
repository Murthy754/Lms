import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Subject } from "rxjs";
import { environment } from 'src/environments/environment'
@Injectable({
  providedIn: "root"
})
export class AuthService {
  itemValue = new Subject<string>();
  privateSite = new Subject<string>();
  getNewPolls = new Subject<string>();

  public status: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  constructor(private _http: HttpClient) {}
  public checkLogIn() {
    return this._http.get(environment.url+"checkCache");
  }
  public checkCookie() {
    return this._http.get(environment.url+"cook/authenticate");
  }
  public deleteCookie() {
    return this._http.get(environment.url+"cook/disableauth");
  }
  display(value: boolean) {
    this.status.next(value);
  }
  isLoggedIn() {
    if (localStorage.getItem("userId")) {
      return true;
    }
    else {
      return false;
    }
  }
  set currentUser(user) {
    this.itemValue.next(user);
    localStorage.setItem('userId', user);
  }
  
  get currentUser() {
    return localStorage.getItem('userId');
  }
  set isPrivateSite(value) {
    this.privateSite.next(value);
  }
  set newPOlls(value){
    this.getNewPolls.next(value);
  }

  checkPrivateSiteStatus(site: string) {
   return this._http.get(environment.url+"api/privatesite/settings/" + site)
  }
}
