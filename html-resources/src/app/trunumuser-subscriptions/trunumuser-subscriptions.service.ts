import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from 'src/environments/environment'
@Injectable({
  providedIn: "root"
})
export class TrunumuserSubscriptionsService {
  constructor(private _http: HttpClient) {}
  checkExistingInviteUser(emailObj) {
    return this._http.post(
      environment.url+"api/subscription/checkInviteSubscriber",
      emailObj
    );
  }
  sendInvitatios(mailData) {
    return this._http.post(
      environment.url+"api/subscription/sendSubscribeInvivatiions",
      mailData
    );
  }
  getUsers() {
    return this._http.get(environment.url+"api/user/getusers");
  }
  // getSubscriptionsByCountry
  // getAllSubscriptions
  // getSubscribersByCountry
  // getAllSubscribers
}
