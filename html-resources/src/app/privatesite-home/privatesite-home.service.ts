import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class PrivatesiteHomeService {

  constructor(private _http:HttpClient) { }
  public getCategories(){
    return this._http.get(environment.url+'api/categories/getAllCategories');
  }
  public getJSON(): Observable<any> {
    return this._http.get("../assets/countries.json");
  }
  getUrls(location,tab){
      if(location==='world')
        return 'api/privatepoll/get'+tab+'pollsbyworld'
      else
        return 'api/privatepoll/get'+tab+'polls'
  }
  getPolls(data,location,tab){
    return this._http.post(environment.url+this.getUrls(location,tab),data)
  }
  getNonUserPolls(data,location,tab){
    return this._http.post(environment.url+"api/privatepoll/getsubscriberrecentpolls",data)
  }
  getNonUserPollsByWorld(data,location,tab){
    return this._http.post(environment.url+"api/privatepoll/getsubscriberrecentpollsbyworld",data)
  }
  getCurrentIpLocation(): Observable<any> {
    return this._http.get(environment.url+"api/getmyloc");
  }
  getAllRecentPolls(data): Observable<any> {
    return this._http.get(environment.url +"api/privatepoll/recent",{params : data, headers: { "hideLoader": "true" }});
  }

  getAllTrendingPolls(data) {
    return this._http.get(environment.url +"api/privatepoll/trending",{params : data, headers: { "hideLoader": "true" }});
  }

  getAllTopPolls(data) {
    return this._http.get(environment.url +"api/privatepoll/top",{params : data , headers: { "hideLoader": "true" }});
  }
  getCountUrls(location,tab){
    if(location==='world')
        return 'api/privatepoll/get'+tab+'countworld'
      else
        return 'api/privatepoll/get'+tab+'count'
  }
  getCount(data,location,tab){
    return this._http.post(environment.url+this.getCountUrls(location,tab),data)
  }
  getPrivateSiteFromURL(id) {
    return this._http.get(environment.url+"api/profile/getPrivateSite/"+ id);
  }
}
