import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from 'src/environments/environment';
import { Socket } from "ngx-socket-io";

@Injectable({
  providedIn: "root"
})
export class HeaderService {
  constructor(private _http: HttpClient,private socket: Socket) { }
  getUsers() {
    return this._http.get(environment.url + "api/user/getusers");
  }

  getCurrentIpLocation(): Observable<any> {
    return this._http.get(environment.url + "api/getmyloc");
  }

  getPrivatePollList() {
    return this._http.get(environment.url + "api/poll/getPrivatePollInfo");
  }
  getNotifications(data) {
    return this._http.post(environment.url + 'api/notification/getallnotifications', data);
  }
  gePrivateSubNotifications(data) {
    return this._http.post(environment.url + 'api/notification/getsubscribernotifications', data);
  }
  
  getPrivateNotifications(data) {
    return this._http.post(environment.url + 'api/notification/getallprivatenotifications', data);
  }

  markAsViewd(data) {
    return this._http.put(environment.url + 'api/notification/markasviewd', data);
  }
  markAsAllViewd(data) {
    return this._http.put(environment.url + 'api/notification/markasallviewd', data);
  }
  markAsAllPrivateViewd(data) {
    return this._http.put(environment.url + 'api/notification/markasallviewdprivate', data);

  }
  isPollDeleted(pollid) {
    return this._http.get(environment.url + 'api/poll/ispolldeleted/' + pollid);
  }
  userLogout(id){
    return this._http.post(environment.url+'api/logout',id);
  }
  sendUserStatus (data){
    this.socket.emit('UserStatus',data);
  }
  searchTags(request) {
    return this._http.post(environment.url + "api/poll/search/tag", request);
  }

  changePrivatesiteStatus(data: object){
    return this._http.put(environment.url + "api/privatesite/status" , data);
  }
}
