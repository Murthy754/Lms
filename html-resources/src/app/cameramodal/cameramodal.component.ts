import { Component, OnInit } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { CameramodalService } from "./cameramodal.service";
import { DomSanitizer } from "@angular/platform-browser";
import { CookieService } from "ngx-cookie-service";
import { WebcamImage } from 'ngx-webcam';

var Grapheme = require("grapheme-splitter");
declare var $: any;


@Component({
  selector: "app-cameramodal",
  templateUrl: "./cameramodal.component.html",
  styleUrls: ["./cameramodal.component.scss"]
})
export class CameramodalComponent implements OnInit {

  public webcamImage: WebcamImage = null;
  constraints = {
    video: {
      facingMode: "environment",
      width: 500,
      height: 400
    }
  };
  videoHeight;
  videoWidth;
  cam = 0;
  videoAudio = 0;
  onClose: any;
  fileURL;
  webcamVideo;
  searchData = "";
  squestion: any;
  WordLength = 0;
  saveValidity: boolean = true;
  FilesArray = [];
  countries: any;
  urls: any;
  FinishUpload = 0;
  minDate = new Date();
  Ccode;
  maxFileError = false;
  maxFileCount = false;
  country;
  loading = false;
  camType;
  disableCancel: boolean = false;


  constructor(
    private bsRef: BsModalRef,
    private cameraModalService: CameramodalService,
    private cService: CookieService,
    private sanitizer: DomSanitizer,
  ) {
   }


  ngOnInit() {
    this.camType = this.cService.get('camType'); 
    this.cameraModalService.status.subscribe(status => {
      if (status === "Started") {
        this.disableCancel = true;
      } else if (status === "Stopped") {
        this.disableCancel = false;
      }
    })
  }
  handleImage(webcamImage: WebcamImage) {
    this.saveValidity = false;
    this.webcamImage = webcamImage;
    var imageJson = this.webcamImage;
    // Replace extension according to your media type
    // const imageName = date + '.' + text + '.jpeg';
    const imageName = new Date().getTime()+".jpeg";
    var base64 = imageJson['_imageAsDataUrl'].replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    // call method that creates a blob from dataUri
    const imageBlob = this.dataURItoBlob(base64);
    const imageFile = new File([imageBlob], imageName, { type: 'image/jpeg' });
    this.fileURL = imageFile;
  }

  handleVideoAudio(data: any) {
    this.saveValidity = false;
    this.webcamVideo = this.sanitizer.bypassSecurityTrustUrl(data);
    const imageName = new Date().getTime()+".mp4";
    const videoBlob = data;
    let videoFile;
    if (this.camType === "audio") {
      videoFile = new File([videoBlob], imageName, { type: 'audio/mp3' });
    } else {
      videoFile = new File([videoBlob], imageName, { type: 'video/mp4' });
    }
    this.fileURL = videoFile;
  }

  dataURItoBlob(dataURI) {
    const byteString = atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpeg' });
    return blob;
  }

  blobToDataURI(blob) {
    const fr = new FileReader();
    const dataURI = fr.readAsDataURL(blob);
    console.log(dataURI);
    return dataURI;
  }
  handleError(error) {
    console.log('Error: ', error);
  }
  cancel() {
    this.bsRef.hide();
  }
  close() {
    this.onClose(this.fileURL);
  }
}
