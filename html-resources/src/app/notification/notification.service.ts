import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private _http:HttpClient) { }
  getNotifications(data){
      return this._http.post(environment.url+'api/notification/getallnotifications',data);
  }
  markAsViewd(data){    
    return this._http.put(environment.url+'api/notification/markasviewd',data);
  }
  getPrivateNotifications(data) {
    return this._http.post(environment.url + 'api/notification/getallprivatenotifications', data);
  }
  markAsAllViewd(data){
    return this._http.put(environment.url+'api/notification/markasallread',data);
  }
  isPollDeleted(pollid){
    return this._http.get(environment.url+'api/poll/ispolldeleted/'+pollid);
  }
}
