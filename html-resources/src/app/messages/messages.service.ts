import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Subject } from "rxjs";
import { Socket } from "ngx-socket-io";


@Injectable({
  providedIn: "root"
})
export class MessagesService {
  itemValue = new Subject<string>();
  constructor(private _http: HttpClient,private socket: Socket) {}
 
  public saveGroup(data){
    this.itemValue.next(data);
    return this._http.post(environment.url+"api/groups/createGroup", data);

  }
  
  public updateGroup(data){
    this.itemValue.next(data);
    return this._http.put(environment.url+"api/groups/updateGroup", data);

  }
  public saveMessage(data){
    this.itemValue.next(data);
    return this._http.post(environment.url+"api/message/createMessage", data);

  }
  public forwardMessage(data){
    this.itemValue.next(data);
    return this._http.post(environment.url+"api/message/forwardMessage", data);
  }
  public updateMessage(data,id){
    this.itemValue.next(data);
    return this._http.put(environment.url+"api/message/updateMessage/"+id, data);
  }
  sendMessage (data){
    this.socket.emit('Message',data);
  }
  // sendUserStatus(data){
  //   this.socket.emit('UserStatus',data)
  // }
  sendNotifcation(msg) {
    this.socket.emit('Notifcation', msg);
  }
  saveNofication(data) {
    return this._http.post(
      environment.url+"api/notification/savenotifcation",
      data
    );
  }
  saveGroupNofication(data) {
    return this._http.post(
      environment.url+"api/notification/saveGroupNotifcation",
      data
    );
  }
  getMessages(id){
    return this._http.get(environment.url+"api/message/getMessages/"+id);
  }
  getAllMessages(){
    return this._http.get(environment.url+"api/message/getAllMessages");
  }
  getPrivateSiteUsersForMessaging(data) {
    return this._http.post(environment.url + "api/message/getPrivateSiteSubscribers", data);
  }
  getPrivateSiteOwnerForMessaging(data) {
    return this._http.post(environment.url + "api/message/getOwner", data);
  }
  getOtherSubscribersForMessaging(data) {
    return this._http.post(environment.url + "api/message/getOtherSubscribersForMessaging", data);
  }
  getUsers() {
    return this._http.get(environment.url+"api/user/getusers");
  }
  getMessageUsers(user){
    return this._http.post(environment.url+"api/message/getMessageUsers",user);
  }
  getMessageUsersBy(user){
    return this._http.post(environment.url+"api/message/getMessageUsersBy",user);
    
  }
  getGroups() {
    return this._http.get(environment.url+"api/groups/getgroups");
  }
  
  getMyGroups(userId, siteId){
    return this._http.get(environment.url+"api/groups/getMyGroups/"+userId+"/"+siteId);
  }
  getMyPrivateGroups(userId, siteId){
    return this._http.get(environment.url+"api/groups/getMyPrivateGroups/"+userId+"/"+siteId);
  }
  deleteGroupMessages(id){
    return this._http.put(environment.url+"api/message/deleteGroupMessages", id);
  }
  deleteMessage(id){
    return this._http.put(environment.url+"api/message/deleteMessage", id);

  }
  leaveGroup(id){
    return this._http.put(environment.url+"api/message/leaveGroup", id);
  }
  getMessagesBetweenMembers(memberId, userId){
    return this._http.get(environment.url+"api/message/getMessagesBetweenMembers/"+memberId+"/"+userId);
  }
  getMessagesBetweenMembersOfPrivateSite(memberId, userId, siteId){
    return this._http.get(environment.url+"api/message/getMessagesBetweenMembersInPrivateSite/"+memberId+"/"+userId+"/"+siteId);
  }
  makeAdmin(memberId,groupId){
    var obj={
     
      data:memberId
    };
    return this._http.put(environment.url+"api/groups/makeAdmin/"+groupId, obj);
  }
  removeAdmin(memberId, groupId) {
    let obj ={
      data: memberId
    };
    return this._http.put(environment.url + "api/groups/removeAdmin/"+ groupId, obj);
  }
  removeUserFromGroup(memberId,groupId){
    var obj={
      data:memberId
    };
    return this._http.put(environment.url+"api/groups/removeUserFromGroup/"+groupId, obj);
  }
  addMembersToGroup(groupId,members){
    return this._http.put(environment.url+"api/groups/addMembersToGroup/"+groupId, members);

  }
  updateBlockUser(id, flag, blockedById){
    const params = new HttpParams().set('id', id).set('flag', flag).set('blockedBy', blockedById)
    return this._http.put(environment.url+"api/message/updateBlock", {params});
  }
  acceptAutomaticMessageRequest(data) {
    return this._http.post(environment.url + "api/message/acceptAutomaticMessageRequest", data);
  }
  getMessageSubscriptionStatus(id, userId, privateSiteId) {
    let params: any = { "privateSiteId": privateSiteId };
    return this._http.get(environment.url + "api/message/getMessageSubscriptionStatus/" + id + "/" + userId, { params: params });
  }
  removeMessaging(requestData) {
    return this._http.put(environment.url + "api/message/removeMessaging", requestData);
  }
}
