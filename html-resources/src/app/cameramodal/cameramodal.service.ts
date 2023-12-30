import { Injectable } from "@angular/core";
import * as S3 from "aws-sdk/clients/s3";
import { HttpClient } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";
import { environment } from 'src/environments/environment'
@Injectable({
  providedIn: "root"
})
export class CameramodalService {
  constructor(private _http: HttpClient) {}

  private recordingState = new BehaviorSubject<string>("");

  status = this.recordingState.asObservable();

  changeState(state) {
    this.recordingState.next(state);
  }

}
