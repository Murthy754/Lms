import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SignUpService {

  constructor(private _http: HttpClient) { }
  getCurrentIpLocation(): Observable<any> {
    return this._http.get(environment.url+'api/getmyloc');

  }
  public getJSON(): Observable<any> {
    return this._http.get("../assets/countries.json");
  }
  public createUser(mailObj)
  {
      return this._http.post(environment.url+'api/create', mailObj);
  }

  public getUserNames() {
    return this._http.get(environment.url+'api/user/getUserNames');
  }

  sendOtp(requestData) {
    return this._http.post(environment.url + "api/user/sendOtpToSignUp", requestData);
  }
}
