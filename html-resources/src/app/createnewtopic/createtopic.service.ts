import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import * as S3 from "aws-sdk/clients/s3";
import { environment } from 'src/environments/environment';
import { reject } from 'q';
@Injectable({
  providedIn: "root"
})
export class CreatetopicService {
  constructor(private _http: HttpClient) {}
  getCurrentIpLocation(): Observable<any> {
    return this._http.get(environment.url+"api/getmyloc");
   
  }
  public getCategories() {
    return this._http.get(environment.url+"api/categories/getAllCategories/");
  }
  public getJSON(): Observable<any> {
    return this._http.get("../assets/countries.json");
  }
  public createUser(mailObj) {
    return this._http.post(environment.url+"create", mailObj);
  }
  saveQuickTopic(pollObj) {
    return this._http.post(environment.url+"api/poll/createPoll", pollObj);
  }
  saveVideoToYoutube(files){
    let promise=new Promise((resolve,reject)=>{
        this._http.post(environment.url+"uploadVideo",files).toPromise().then(res=>{
              resolve(res);
        });
    });
    return promise;
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

    return new Promise<any>((resolve, reject) => {
      bucket.upload(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          data["type"] = file.type;
          resolve(data);
        }
      });
    });
  }
  getUserProfileDetails(id) {
    return this._http.get(environment.url + "api/profile/getUserProfileDetails/" + id);
  }

  getTags(request) {
    return this._http.post(environment.url + "api/poll/tags", request);
  }
}
