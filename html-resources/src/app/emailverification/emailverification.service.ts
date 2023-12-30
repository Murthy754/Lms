import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class EmailverificationService {

  constructor(private _http:HttpClient) { }
  public emailVerfication(tokenId){
    return this._http.get(environment.url+'emailverify/'+tokenId);
  }
}
