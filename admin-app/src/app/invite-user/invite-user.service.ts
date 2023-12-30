import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class InviteUserService {

  constructor(
    private _http: HttpClient
  ) { }

  sendInvite(requestData: any) {
    return this._http.post(environment.url + "api/admin/invite", requestData);
  }
}
