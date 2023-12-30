import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ForgotService {

  constructor(private _http: HttpClient) { }
  public sendForgotMail(mailObj)
  {
      return this._http.post(environment.url+'api/forgotUserName', mailObj);
  }
  public sendForgotPassowordMail(mailObj)
  {
      return this._http.put(environment.url+'api/forgotPassword', mailObj);
  }
}
