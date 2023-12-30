import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as S3 from "aws-sdk/clients/s3";
import { Observable } from "rxjs";
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: "root"
})
export class ProfileService {
  constructor(private _http: HttpClient) {}
  getCurrentIpLocation(): Observable<any> {
    return this._http.get(environment.url+"api/getmyloc");
  }
  public getJSON(): Observable<any> {
    return this._http.get("../assets/countries.json");
  }
  public getMyInfo(id) {
    return this._http.get(environment.url+"api/me/" + id);
  }
  public getCategories(){
    return this._http.get(environment.url+'api/categories/getAllCategories');
  }
  public updateProfile(userData) {
    return this._http.put(
      environment.url+"api/profile/updateProfile/",
      userData
    );
  }
  getAllSubscriptions(countryObj) {
    return this._http.post(
      environment.url+"api/subscription/getAllSubscriptions",
      countryObj
    );
  }
  getOwnerSubscription(countryObj) {
    return this._http.post(
      environment.url+"api/subscription/getOwnerSubscription",
      countryObj
    )
  }
  getSubscriptionsByCountry(countryObj) {
    return this._http.post(
      environment.url+"api/subscription/getSubscriptionsByCountry",
      countryObj
    );
    
  }
  getSubscribersByCountry(countryObj) {
    return this._http.post(
      environment.url+"api/subscription/getSubscribersByCountry",
      countryObj
    );
  }
  getPrivateSubscribersByCountry(countryObj) {
    return this._http.post(
      environment.url+"api/subscription/getPrivateSubscribersByCountry",
      countryObj
    );
  }
  getAllSubscribers(countryObj) {
    return this._http.post(
      environment.url+"api/subscription/getAllSubscribers",
      countryObj
    );
  }
  uploadFile(file) {
    const contentType = file.type;
    const bucket = new S3({
      accessKeyId: "AKIAITJVDOIP34FVFOIQ",
      secretAccessKey: "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",
      region: "us-east-1"
    });

    const params = {
      Bucket: "trunums-dev",
      Key: file.name,
      Body: file,
      ACL: "public-read",
      ContentType: contentType
    };

    return new Promise<any>(function(resolve, reject) {
      bucket.upload(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
  public getmyTopics(data) {
    return this._http.post(environment.url+"api/poll/getprofilepoll", data);
  }
  public getmyvotes(data) {
    return this._http.post(environment.url+"api/poll/getpollresult/", data);
  }
  public getmyprivatevotes(data) {
    return this._http.post(environment.url+"api/poll/getprivatepollresult/", data);
  }
  public getprivatesubscriberpollresult(data) {
    return this._http.post(environment.url+"api/poll/getprivatesubscriberpollresult/", data);
  }
  public getmyfeed(data) {
    return this._http.post(environment.url+"api/poll/getprofilepoll", data);
  }
  public getretruthpolls(data) {
    return this._http.post(
      environment.url+"api/retruth/getretruthpolls",
      data
    );
  }
  public getSubswithFeed(data) {
    return this._http.post(
      environment.url+"api/poll/getprofilefeedpollbyworld",
      data
    );
  }
  public getOwnerPolls(data) {
    return this._http.post(
      environment.url+"api/poll/getownerfeedpollbyworld",
      data
    );
  }
  getFeedDataByCountry(data) {
    return this._http.post(
      environment.url+"api/poll/getprofilefeedpoll",
      data
    );
  }
  getPrivateFeedDataByCountry(data) {
    return this._http.post(
      environment.url+"api/poll/getprivateprofilfeedpoll",
      data
    );
  }
  getPrivateOwnerFeedDataByCountry(data) {
    return this._http.post(
      environment.url+"api/poll/getprivateprofilefeedpollbycountry",
      data
    );
  }
  getProfileTopics(data){
    return this._http.post(
      environment.url+"api/poll/getprofiletopics",
      data
    );
  }
  getPrivateSubscriberProfileTopics(data) {
    return this._http.post(
      environment.url+"api/poll/getprivatesubscriberprofiletopics",
      data
    );
  }
  getPrivateSubscriberProfileOwnerTopics(data) {
    return this._http.post(
      environment.url+"api/poll/getprivatesubscriberownerprofiletopics",
      data
    );
  }
  getPrivateSubscriberProfileTopicsByWorld(data) {
    return this._http.post(
      environment.url+"api/poll/getprivatesubscriberprofiletopicsByWorld",
      data
    );
  }
  getPrivateSubscriberProfileOwnerTopicsByWorld(data) {
    return this._http.post(
      environment.url+"api/poll/getprivatesubscriberownerprofiletopicsbyworld",
      data
    );
  }
  getPrivatePorfileTopics(data){
    return this._http.post(
      environment.url+"api/poll/getprivateprofiletopics",
      data
    );
  }
  getProfileTopicsByWorld(data){
    return this._http.post(
      environment.url+"api/poll/getprofiletopicsbyworld",
      data
    );
  }
  getOwnerPorfileTopicsByWorld(data){
    return this._http.post(
      environment.url+"api/poll/getownerprofiletopicsbyworld",
      data
    );
  }
  getmyvotesbyworld(data) {
    return this._http.post(
      environment.url+"api/poll/getpollresultbyworld", data
    );
  }
  getmyprivatevotesbyworld(data) {
    return this._http.post(
      environment.url+"api/poll/getprivatepollresultbyworld", data
    );
  }
  followTopic(data) {
    return this._http.put(environment.url+"api/poll/followTopic", data);
  }
  unfollowTopic(data) {
    return this._http.put(environment.url+"api/poll/unfollowTopic", data);
  }
  flagTopic(data) {
    return this._http.put(environment.url+"api/poll/flagTopic", data);
  }
  unflagTopic(data) {
    return this._http.put(environment.url+"api/poll/unflagTopic", data);
  }
  getfeedcount(data) {
    return this._http.post(
      environment.url+"api/poll/getprofilefeedcount",
      data
    );
  }
  getfeedcountybyworld(data) {
    return this._http.post(
      environment.url+"api/poll/getprofilefeedcountbyworld",
      data
    );
  }
  getpollcount(data) {
    return this._http.post(
      environment.url+"api/poll/getprofiletopiccount",
      data
    );
  }
  getpollcountybyworld(data) {
    return this._http.post(
      environment.url+"api/poll/getprofiletopiccountbyworld",
      data
    );
  }
  deletePhoneNumber(requestData) {
    return this._http.post(
      environment.url + "api/user/deletePhoneNumber", requestData
    );
  }
}
