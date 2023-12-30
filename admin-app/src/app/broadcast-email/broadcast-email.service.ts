import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BroadcastEmailService {

  constructor(
    private _http: HttpClient
  ) { }

  getActiveUsers() {
    return this._http.get(environment.url + "api/admin/users/active");
  }

  sendBroadcastEmail(requestData: any) {
    return this._http.post(environment.url + "api/admin/broadcast/email", requestData);
  }
}
