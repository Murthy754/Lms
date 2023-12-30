import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment'
@Injectable({
  providedIn: 'root'
})
export class SpecificSubscribersService {

  constructor(private _http:HttpClient) {    
   }
   getSubscribers(userId)
   {
      return this._http.post(environment.url+'api/subscription/getAllSubscribers',userId);
   }
}
