import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'
@Injectable({
  providedIn: 'root'
})
export class SocialsignupService {

  constructor(private _http:HttpClient) { }
  createSocialUser(userObj){
    return this._http.post(environment.url+'api/signup/social',userObj);
  }
  getCurrentIpLocation(): Observable<any> {
    return this._http.get(environment.url+'api/getmyloc');

  }
  public getJSON(): Observable<any> {
    return this._http.get("../assets/countries.json");
  }
}
