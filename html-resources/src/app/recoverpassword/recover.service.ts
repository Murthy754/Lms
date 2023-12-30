import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class RecoverService {

  constructor(private _http: HttpClient) { }
  public sendForgotPassowordMail(userObj)
  {
      return this._http.put(environment.url+'api/admin/recoverPassword', userObj);
  }
}
