import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as S3 from "aws-sdk/clients/s3";
import { Socket } from "ngx-socket-io";
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: "root"
})
export class PollinfoService {
  constructor(private _http: HttpClient, private socket: Socket) {}
  updaeteSubscrptionStatus(id, status) {
    return this._http.put(
      environment.url+"api/subscription/updateSubscrptionStatus/" + id,
      status
    );
  }
  deletePoll(pollid) {
    return this._http.put(environment.url+"api/poll/deletepoll/", pollid);
  }
  updatepollCastCountByAnswer(data, id) {
    return this._http.put(
      environment.url+"api/poll/updatepollCastCountByAnswer/" + id,
      data
    );
  }
  sendNotifcation(msg) {
    this.socket.emit('Notifcation', msg);
  }
  sendComment(data){
    this.socket.emit('Comment',data);
  }
  sendCommentReply(data){
    this.socket.emit('CommentReply',data)
  }
  saveNofication(data) {
    return this._http.post(
      environment.url+"api/notification/savenotifcation",
      data
    );
  }
  updateBoth(data, id) {
    return this._http.put(environment.url+"api/poll/updateBoth/" + id, data);
  }
  updatePollResult(data, id) {
    return this._http.put(
      environment.url+"api/poll/updatePollResult/" + id,
      data
    );
  }
  postcomment(data) {
    return this._http.post(environment.url+"api/comment/postcomment", data);
  }
  postcommentreply(data) {
    return this._http.post(
      environment.url+"api/comment/postcommentreply",
      data
    );
  }
  incrementcommentcount(data) {
    return this._http.put(
      environment.url+"api/comment/incremntcommentcount",
      data
    );
  }
  incrementreplycommentcount(data) {
    return this._http.put(
      environment.url+"api/comment/incremntreplycommentcount",
      data
    );
  }
  decrementcommentcount(data) {
    return this._http.put(
      environment.url+"api/comment/decremntcommentcount",
      data
    );
  }
  decrementreplycommentcount(data) {
    return this._http.put(
      environment.url+"api/comment/decremntreplycommentcount",
      data
    );
  }
  getcommments(data) {
    return this._http.post(environment.url+"api/comment/getcomments", data);
  }
  getcommentreplies(data) {
    return this._http.post(
      environment.url+"api/comment/getcommentsreply",
      data
    );
  }
  getcommentrepliesthread(data) {
    return this._http.post(
      environment.url+"api/comment/getcommentrepliesthread",
      data
    );
  }
  deletecomment(id) {
    return this._http.delete(
      environment.url+"api/comment/deletecomment/" + id
    );
  }
  deletereplycomment(id) {
    return this._http.delete(
      environment.url+"api/comment/deletereplycomment/" + id
    );
  }
  insertPollResult(data) {
    return this._http.post(environment.url+"api/poll/pollResult/", data);
  }
  voteBoth(data, id) {
    return this._http.put(environment.url+"api/poll/voteByBoth/" + id, data);
  }
  votepollCastCountByAnswer(data, id) {
    return this._http.put(
      environment.url+"api/poll/votepollCastCountByAnswer/" + id,
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
  retruthTopic(data) {
    return this._http.post(environment.url+"api/poll/retruthtopic", data);
  }
  deleteretruthtopic(data) {
    return this._http.delete(environment.url+"api/poll/retruthtopic/" + data);
  }
  removeUserToRetruth(data) {
    return this._http.put(
      environment.url+"api/poll/removeUserToRetruth",
      data
    );
  }
  feedOptionUpdateOnSubscription(id, feedOptions) {
    return this._http.put(
      environment.url+"api/subscription/updateFeedOption/" + id,
      feedOptions
    );
  }
  addUserToRetruth(data) {
    return this._http.put(environment.url+"api/poll/addUserToRetruth", data);
  }
  public addSubscriber(data) {
    return this._http.post(
      environment.url+"api/subscription/sendSubscribeRequest",
      data
    );
  }
  public getPollsterDetails(id) {
    return this._http.get(environment.url + "api/profile/getPollsterData/" + id)
  }
  getMetaData(url) {
    return this._http.get(environment.url + "api/poll/getmetadata?url=" + url,{ headers: { "hideLoader": "true" }});
  }
  getUserProfileDetails(id) {
    return this._http.get(environment.url + "api/profile/getUserProfileDetails/" + id);
  }

  insertVerifiedVoter(requestData) {
    return this._http.post(environment.url + "api/poll/insertVerifiedVoter", requestData);
  }

  searchTags(request) {
    return this._http.post(environment.url + "api/poll/search/tag", request);
  }
}
