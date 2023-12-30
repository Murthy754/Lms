import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as S3 from "aws-sdk/clients/s3";
import { Socket } from "ngx-socket-io";
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: "root"
})
export class PolldetailsService {
  constructor(private _http: HttpClient, private socket: Socket) {}
  public getPollDetails(data) {
    return this._http.post(environment.url+"api/poll/getpolldetails", data);
  }
  public getPrivatePollDetails(data) {
    return this._http.post(environment.url+"api/poll/getprivatepolldetails", data);
  }
  public getPrivateSubscriberPollDetails(data) {
    return this._http.post(environment.url+"api/poll/getprivatesubscriberpolldetails", data);
  }
  public updatePollExpire(data) {
    return this._http.post(environment.url+"api/poll/updatePollExpire", data);
  }
  postcomment(data){
    return this._http.post(
      environment.url+"api/comment/postcomment",data
    );
  }
  postbroadcast(data){
    return this._http.post(
      environment.url+"api/broadcast/savebroadcast",data
    );
  }
  deleteArtile(article){
    return this._http.put(
      environment.url+"api/poll/deleteArticle",article
    );
  }
  postbroadcastreply(data){
    return this._http.post(environment.url+"api/broadcast/savebroadcastreply",data)
  }
  getbroadcastrepliesthread(data){
    return this._http.post(
      environment.url+"api/broadcast/getbroadcastsreplies",
      data
    );
  }
  getbroadcastrepliesthreadall(data){
    return this._http.post(
      environment.url+"api/broadcast/getbroadcastsrepliesall",
      data
    );
  }
  sendNotifcation(data) {
    this.socket.emit('Notifcation', data);
  }
  sendComment(data){
    this.socket.emit('Comment',data);
  }
  sendCommentReply(data){
    this.socket.emit('CommentReply',data)
  }
  saveNofication(data){
    return this._http.post(environment.url+"api/notification/savenotifcation",data)
  }
  incrementReplyCount(data){
    return this._http.post(
      environment.url+"api/broadcast/incremntreplybroadcastcount",
      data
    );
  }
  decrementReplyCount(data){
    return this._http.post(
      environment.url+"api/broadcast/decremntreplybroadcastcount",
      data
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
  getcommments(data){
    return this._http.post(
      environment.url+"api/comment/getcomments",data
    );
  }
  getPrivatecommments(data){
    return this._http.post(
      environment.url+"api/comment/getprivatecomments",data
    );
  }
  getPrivateSubscribercommments(data){
    return this._http.post(
      environment.url+"api/comment/getprivatesubscribercomments",data
    );
  }
  getbroadcasts(data){
    return this._http.post(
      environment.url+"api/broadcast/getbroadcasts",data
    );
  }
  getprivatebroadcasts(data){
    return this._http.post(
      environment.url+"api/broadcast/getprivatebroadcasts",data
    );
  }
  getcommentreplies(data){
    return this._http.post(
      environment.url+"api/comment/getcommentsreply",
      data
    );
  }getcommentrepliesthread(data){
    return this._http.post(
      environment.url+"api/comment/getcommentrepliesthread",
      data
    );
  }
  deletecomment(id){
    return this._http.delete(
      environment.url+"api/comment/deletecomment/"+id);
  }
  deletereplycomment(id){
    return this._http.delete(
      environment.url+"api/comment/deletereplycomment/"+id);
  }
  decrementcommentcount(data){
    return this._http.put(environment.url+'api/comment/decremntcommentcount',data)
  }
  decrementreplycommentcount(data){
    return this._http.put(environment.url+'api/comment/decremntreplycommentcount',data)
  }
  postcommentreply(data){
    return this._http.post(
      environment.url+"api/comment/postcommentreply",data
    );
  }
  incrementcommentcount(data){
    return this._http.put(environment.url+'api/comment/incremntcommentcount',data)
  }
  incrementreplycommentcount(data){
    return this._http.put(environment.url+'api/comment/incremntreplycommentcount',data)
  }
}
