import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  constructor(
    private _http: HttpClient
  ) { }

  getUsers() {
    return this._http.get(environment.url + "api/admin/users");
  }

  getUserPrivateSites(data: any) {
    return this._http.get(environment.url+ "api/admin/getUserPrivateSitesStorage", {params : {id:data}})
  }
}
