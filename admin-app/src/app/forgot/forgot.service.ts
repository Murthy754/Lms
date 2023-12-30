import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ForgotService {

  constructor(private _http: HttpClient) { }

  public sendForgotMail(mailObj: any) {
    return this._http.post(environment.url + 'api/admin/forgot/username', mailObj);
  }

  public sendForgotPasswordMail(mailObj: any) {
    return this._http.post(environment.url + 'api/admin/forgot/password', mailObj);
  }

  public updatePassword(requestData: any) {
    return this._http.put(environment.url + 'api/admin/recoverPassword', requestData);
  }
}
