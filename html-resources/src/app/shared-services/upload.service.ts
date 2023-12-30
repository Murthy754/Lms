import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { LoaderService } from './loader.service';
const AWS = require("aws-sdk");

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(
    private _http: HttpClient,
    private _loaderService: LoaderService
  ) { }

  // Uploads file to Wasabi cloud
  uploadFile(file) {
    this._loaderService.changeLoadingVisibility(true);
    // S3 authentication
    const s3 = new AWS.S3({
      correctClockSkew: true,
      endpoint: "https://s3.us-west-1.wasabisys.com",
      accessKeyId: environment.wasabiAccessKeyId,
      secretAccessKey: environment.wasabisecretAccessKey,
      region: "us-west-1"
    });

    // Assigning params
    const uploadRequest = new AWS.S3.ManagedUpload({
      params: { 
        Bucket: 'trunums', 
        Key: file.name, 
        Body: file, 
        ACL: "public-read"
      },
      service: s3
    });

    return new Promise<any>((resolve, reject) => {
      uploadRequest.send((error, data) => {
      this._loaderService.changeLoadingVisibility(false);
        if (error) {
          console.log('UPLOAD ERROR: ' + JSON.stringify(error, null, 2));
          reject(error);
        } else {
          data["type"] = file.type;
          resolve(data);
        }
      })
    })
  }

}
