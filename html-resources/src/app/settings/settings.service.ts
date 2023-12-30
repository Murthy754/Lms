import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class SettingsService {
  itemValue = new Subject<string>();
  constructor(private _http: HttpClient) {}
  public getYoutubeSettings(id) {
    return this._http.get(environment.url+"api/profile/getProfile/" + id);
  }
  public getPrivateSettings(id) {
    return this._http.get(environment.url+"api/profile/getPrivateProfile/" + id);
  }

  public getSiteSettings(site) {
    return this._http.get(environment.url+"api/privatesite/settings/" + site);
  }

  public checkPrivateSiteName(name) {
    return this._http.get(environment.url+"api/user/checkPrivateSiteName/" + name);
  }
  
  public setYoutbeSettings(youtubeData) {
    return this._http.put(
      environment.url+"api/user/youtubeSettingsOldUsers/",
      youtubeData
    );
  }
  userLogin(userobj){
    return this._http.post(environment.url+'api/login',userobj);
  }
  public updateProfilePassword(profileData) {
    return this._http.put(environment.url+"api/updatepassword/", profileData);
  }
  public deActivateAccount(id) {
    return this._http.put(environment.url+"api/user/deactivate/" + id, null);
  }
  public savePrivateSiteSettings(data){
    this.itemValue.next(data);
    return this._http.put(environment.url+"api/profile/savePrivateSiteSettings", data);
  }
  public updatePrivateSiteSettings(data){
    this.itemValue.next(data);
    return this._http.put(environment.url+"api/profile/updatePrivateSiteSettings", data);
  }
  public updatePrivateSite(data){
    this.itemValue.next(data);
    return this._http.put(environment.url+"api/profile/updatePrivateSite", data);
  }
  public sendForgotSocialPassowordMail(mailObj)
  {
      return this._http.put(environment.url+'api/forgotSocialPassword', mailObj);
  }
  public updatePollToPrivate(data){
    this.itemValue.next(data);
    return this._http.put(environment.url+'api/poll/updatePollToPrivate', data);
  }
  public getUserProfileDetails(id) {
    return this._http.get(environment.url+"api/profile/getUserProfileDetails/" + id);
  }
  public getVirtualUserProfileDetails(id) {
    return this._http.get(environment.url+"api/profile/getVirtualUserProfileDetails/" + id);
  }
  public getPrivateSiteDetails(id) {
    return this._http.get(environment.url+"api/profile/getPrivateSiteDetails/" + id);
  }
  public getPrivateSiteSettings(id) {
    return this._http.get(environment.url+"api/profile/getPrivateSiteSettings/" + id);
  }
  public makePrivateSiteAdmin(data) {
    return this._http.put(environment.url+"api/profile/makePrivateSiteAdmin", data);
  }
  public removePrivateSiteAdmin(data) {
    return this._http.put(environment.url+"api/profile/removePrivateSiteAdmin", data);
  }

  public gePrivateSites(id) {
    return this._http.get(environment.url + "api/user/privatesite/" + id);
  }
}
