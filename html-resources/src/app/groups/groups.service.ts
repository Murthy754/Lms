import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class GroupsService {
  itemValue = new Subject<string>();
  constructor(private _http: HttpClient) {}

  public saveGroup(data){
    this.itemValue.next(data);
    return this._http.post(environment.url+"api/groups/createGroup", data);

  }
  
  
  getUsers() {
    return this._http.get(environment.url+"api/user/getusers");
  }
  getGroups() {
    return this._http.get(environment.url+"api/groups/getgroups");
  }
}
