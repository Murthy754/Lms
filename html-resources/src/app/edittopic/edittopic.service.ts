import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: "root"
})
export class EdittopicService {
  constructor(private _http: HttpClient) {}
  public getPollInfo(id) {
    return this._http.get(environment.url+"api/poll/getpollinfobyid/" + id);
  }
  public getPrivatePollInfo(id) {
    return this._http.get(environment.url+"api/poll/getprivatepollinfobyid/" + id);
  }
  public upDatePoll(data, id) {
    return this._http.put(environment.url+"api/poll/updatepoll/" + id, data);
  }
}
