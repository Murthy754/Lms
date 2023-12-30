import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private _http: HttpClient
  ) { }

  login(requestData: any) {
    return this._http.post(environment.url + "api/admin/login", requestData);
  }
}
