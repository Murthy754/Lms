import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrivatesiteHeaderService {

  refreshPrivateSiteHeader = new Subject<string>();

  constructor(private _http:HttpClient) { }
  getPollList(id) {
    return this._http.get(environment.url+"api/privatepoll/getpollinfo/"+id);
  }
  getUsers(countryObj) {
    return this._http.post(
      environment.url+"api/subscription/getAllSubscribers",
      countryObj
    );
  }
  set RefreshPrivateSiteHeader(value) {
    this.refreshPrivateSiteHeader.next(value);
  }
  getSubscriberUsers() {
    return this._http.get(environment.url + "api/user/getusers");
  }

  getPrivateSiteUsers(id){
    return this._http.get(environment.url + "api/user/getprivatesiteusers/"+id);
  }

  getAllPrivateSites(id) {
    return this._http.get(environment.url + "api/profile/user/privateSites/" + id);
  }
}
