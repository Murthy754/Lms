import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Headers ,RequestOptions} from '@angular/http'
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Socket } from "ngx-socket-io";

@Injectable({
  providedIn: 'root'
})
export class SignupmodalService {
  itemValue = new Subject<string>();
  allowCreate = new Subject<string>();
  getNewPolls = new Subject<string>();
  isNotifications= new Subject<string>();
  set newPOlls(value){
    this.getNewPolls.next(value);
  }
  constructor(private _http:HttpClient,private socket: Socket) { 
    
  } 
  sendUserStatus (data){
    this.socket.emit('UserStatus',data);
  }
  createSocialUser(userObj){
    return this._http.post(environment.url+'api/signup/social',userObj);
  }
  userFind(values){
        return this._http.post(environment.url+'api/user/find',values);
  }
  userLogin(userobj){
        return this._http.post(environment.url+'api/login',userobj);
  }
  privateSite = new Subject<string>();
  userSession(){
    var headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Accept', 'application/json');    
  let options = new RequestOptions({ headers: headers, withCredentials: true });
    return this._http.get(environment.url+'cook/setuser');
  }
  set currentUser(user) {
    this.itemValue.next(user);
    localStorage.setItem('userId', user);
  }
  set isPrivateSite(value) {
    this.privateSite.next(value);
  }
  set AllowCreate(key){
    this.allowCreate.next(key);
  }
  set isNotificationsExists(key){
    this.isNotifications.next(key);
  }
  get currentUser() {
    return localStorage.getItem('userId');
  }
  activateUserId(id){
    return this._http.put(environment.url+'api/user/activate/'+id,null);
  }

}
