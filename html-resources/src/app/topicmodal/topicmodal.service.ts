import { Injectable } from "@angular/core";
import * as S3 from "aws-sdk/clients/s3";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from 'src/environments/environment'
@Injectable({
  providedIn: "root"
})
export class TopicmodalService {
  constructor(private _http: HttpClient) {}
  saveQuickTopic(pollObj) {
    return this._http.post(environment.url+"api/poll/createPoll", pollObj);
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
  getCurrentIpLocation(): Observable<any> {
    return this._http.get(environment.url+"api/getmyloc");
  }
  public getJSON(): Observable<any> {
    return this._http.get("../assets/countries.json");
  }
}
