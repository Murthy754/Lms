import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: "root"
})
export class HomeService {
  constructor(private _http: HttpClient) {}
  getUsers() {
    return this._http.get(environment.url+"api/user/getusers");
  }
  public getJSON(): Observable<any> {
    return this._http.get("../assets/countries.json");
  }
  getCurrentIpLocation(): Observable<any> {
    return this._http.get(environment.url+"api/getmyloc");
  }
  getCountUrls(index,location) {
    if(location !=='world')
    {
      if (index == 0) return "topcount";
      else if (index == 1) return "trendingcount";
      else if (index == 2) return "recentcount";
    }
    else
    {
      if (index == 0) return "topcountbyworld";
      else if (index == 1) return "trendingcountbyworld";
      else if (index == 2) return "recentcountbyworld";
    }
  
  }
  public getCategories() {
    return this._http.get(environment.url+"api/categories/getAllCategories");
  }
  getPolllsData(data, index) {
    return this._http.post(
      environment.url+"api/poll/" + this.getUrls(index),
      data
    );
  }
  getUrls(index) {
    if (index == 0) return "gettoppolls";
    else if (index == 1) return "gettrendingpolls";
    else if (index == 2) return "getpollinfo";
  }
  getWorldPollData(data, index) {
    return this._http.post(
      environment.url+"api/poll/" + this.getUrls(index) + "byworld",
      data,{headers: { "hideLoader": "true" }}
    );
  }
  getNewPollsCount(data,tabno,params){
    // console.log(this.getCountUrls(tabno,params));
    return this._http.post(environment.url+"api/poll/"+this.getCountUrls(tabno,params),data);
  }
  getfourtop() {
    return this._http.get(environment.url+"api/poll/fourtop");
  }
  getfourtrending() {
    return this._http.get(environment.url+"api/poll/fourtrending");
  }
  getfourrecent() {
    return this._http.get(environment.url+"api/poll/fourrecent");
  }
  getAllSubscriptions(countryObj) {
    return this._http.post(
      environment.url+"api/subscription/getAllSubscriptions",
      countryObj
    );
  }
}
