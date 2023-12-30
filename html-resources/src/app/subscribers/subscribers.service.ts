import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Socket } from "ngx-socket-io";
import { environment } from 'src/environments/environment'
@Injectable({
  providedIn: "root"
})
export class SubscribersService {
    constructor(private _http: HttpClient,private socket: Socket) {}
  getSubscriptionsByCountry(countryObj) {
    return this._http.post(
      environment.url+"api/subscription/getSubscriptionsByCountry",
      countryObj
    );
  }
  public getJSON(): Observable<any> {
    return this._http.get("../assets/countries.json");
  }
  getAllSubscriptions(countryObj) {
    return this._http.post(
      environment.url+"api/subscription/getAllSubscriptions",
      countryObj
    );
  }
  saveNofication(data) {
    return this._http.post(
      environment.url+"api/notification/savenotifcation",
      data
    );
  }
  sendNotifcation(msg) {
    this.socket.emit('Notifcation', msg);
  }
  getSubscribersByCountry(countryObj) {
    return this._http.post(
      environment.url+"api/subscription/getSubscribersByCountry",
      countryObj
    );
  }
  getAllSubscribers(countryObj) {
    return this._http.post(
      environment.url+"api/subscription/getAllSubscribers",
      countryObj
    );
  }
  getPrivateSiteSubscribers(countryObj) {
    return this._http.post(
      environment.url+"api/subscription/getPrivateSiteSubscribers",
      countryObj
    );
  }
  getMessageRequestByCountry(countryObj) {
    return this._http.post(
      environment.url+"api/message/getMessageRequestByCountry",
      countryObj
    );
  }
  
  getAllVirtualSubscribers(countryObj) {
    return this._http.post(
      environment.url+"api/subscription/getAllVirtualSubscribers",
      countryObj
    );
  }
  getSentRequestByCountry(countryObj) {
    return this._http.post(
      environment.url+"api/message/getSentRequestByCountry",
      countryObj
    );
  }

  getAllMessageRequest(countryObj) {
    return this._http.post(
      environment.url+"api/message/getAllMessageRequest",
      countryObj
    );
  }
  getAllSentRequestByCountry(countryObj){
    return this._http.post(
      environment.url+"api/message/getAllSentMessageRequest",
      countryObj
    );
  }
  feedOptionUpdateOnSubscription(id, feedOptions) {
    return this._http.put(
      environment.url+"api/subscription/updateFeedOption/" + id,
      feedOptions
    );
  }
  updaeteSubscrptionStatus(id, status) {
    return this._http.put(
      environment.url+"api/subscription/updateSubscrptionStatus/" + id,
      status
    );
  }
  updateMessageRequestStatus(id, status) {
    return this._http.put(
      environment.url+"api/message/updateMessageRequestStatus/" + id,
      status
    );
  }

  removeMessageSubscription(requestData) {
    return this._http.put(environment.url + "api/message/removeMessageSubscription", requestData);
  }

  public acceptSubscriber(data) {
    return this._http.post(
      environment.url+"api/subscription/acceptsubcriber",
      data
    );
  }
  
  public acceptAutomaticSubscriber(id) {
    return this._http.put(
      environment.url+"api/subscription/acceptautomaticsubcriber/" + id, status
    );
  }
  public acceptMessageRequest(data) {
    return this._http.post(
      environment.url+"api/message/acceptMessageRequest",
      data
    );
  }
  public getCountries(): Observable<any> {
    return this._http.get("../assets/countries.json");
  }
  public removeSubscription(data) {
    return this._http.put(environment.url+"api/subscription/removeSubscription", data);
  }
}
