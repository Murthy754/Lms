import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: "root"
})
export class SearchResultsService {
  constructor(private _http: HttpClient) {}
  public getSearchUser() {
    return this._http.get(environment.url+"api/user/getUsers");
  }
  public getSearchPolls(data) {
    return this._http.post(environment.url+"api/poll/searchPolls/", data);
  }

  public getSearchTags(request) {
    return this._http.post(environment.url + "api/poll/search/tag", request);
  }
}
