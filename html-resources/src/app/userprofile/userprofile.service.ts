import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Socket } from "ngx-socket-io";
import { environment } from 'src/environments/environment'
@Injectable({
  providedIn: "root"
})
export class UserprofileService {
  constructor(private _http: HttpClient,private socket:Socket) {}
  public getUserProfile(userObj) {
    return this._http.post(
      environment.url+"api/user/getuserprofile",
      userObj
    );
  }
  public getMyPolls(data) {
    return this._http.post(environment.url+"api/poll/getprofilepoll", data);
  }
  saveNofication(data){
    return this._http.post(environment.url+"api/notification/savenotifcation",data)
  }
  sendNotifcation(msg) {
    this.socket.emit('Notifcation', msg);
  }
  public addSubscriber(data) {
    return this._http.post(
      environment.url+"api/subscription/sendSubscribeRequest",
      data
    );
  }
  public addMessageRequest(data) {
    return this._http.post(
      environment.url+"api/message/sendMessageRequest",
      data
    );
  }
  public getSubscrptionStatus(data) {
    return this._http.post(
      environment.url+"api/subscription/userSubscription",
      data
    );
  }
  updaeteSubscrptionStatus(id, status) {
    return this._http.put(
      environment.url+"api/subscription/updateSubscrptionStatus/" + id,
      status
    );
  }
  getAllPrivateSites(id) {
    return this._http.get(environment.url + "api/profile/user/privateSites/" + id);
  }

  public getPrivateSiteDetails(id) {
    return this._http.get(environment.url+"api/profile/getPrivateSiteDetails/" + id);
  }
}
