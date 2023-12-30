import { Component, OnInit, ViewChild, AfterViewInit, Output,Input, EventEmitter, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CountupTimerService } from "ngx-timer";
import { CameramodalService } from '../cameramodal/cameramodal.service';

let RecordRTC = require('recordrtc/RecordRTC.min');
let getSeekableBlob = require('recordrtc').getSeekableBlob;

@Component({
    selector: 'record-rtc',
    templateUrl: './record-rtc.component.html',
    styleUrls: ['./record-rtc.component.scss']
})
export class RecordRTCComponent implements AfterViewInit {
  @Input() mediaValues: any;
  webcamVideo = null;
  recording = 'stop';
  recordingDisable = false;
    @Output()
    public videoAudioTaken = new EventEmitter<any>();

    private stream: MediaStream;
    private recordRTC: any;

    @ViewChild('video', null) video: any

    constructor(
        private sanitizer: DomSanitizer,
        private timer: CountupTimerService,
        private cameraModalService: CameramodalService
    ) {
        // Do stuff
    }

    ngAfterViewInit() {
        // set the initial state of the video
        if (this.video) {
            let video: HTMLVideoElement = this.video.nativeElement;
            video.muted = false;
            video.controls = true;
            video.autoplay = false;
        }
    }

    toggleControls() {
        if (this.video) {
            let video: HTMLVideoElement = this.video.nativeElement;
            video.muted = !video.muted;
            video.controls = !video.controls;
            video.autoplay = !video.autoplay;
        }
    }

    successCallback(stream: MediaStream) {
        this.cameraModalService.changeState("Started");
        this.recordingDisable = true;
        this.recording = 'start';
        var options = {
            mimeType: 'video/webm', // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
            audioBitsPerSecond: 128000,
            videoBitsPerSecond: 128000,
            bitsPerSecond: 128000 // if this line is provided, skip above two
        };
        this.stream = stream;
        this.recordRTC = RecordRTC(stream, options);
        this.recordRTC.startRecording();
        this.timer.startTimer();
        if (this.video) {
            let video: HTMLVideoElement = this.video.nativeElement;
            video.srcObject = stream;
        }
        this.toggleControls(); 
    }

    errorCallback() {
        alert("Please grant permissions to record");
    }

    processVideo(audioVideoWebMURL) {
            let video: HTMLVideoElement = this.video.nativeElement;
            let recordRTC = this.recordRTC;
            video.src = audioVideoWebMURL;
            this.toggleControls();
            // recordRTC.getDataURL((dataURL)=> {
            //     this.videoAudioTaken.emit(dataURL);
            // });
    }

    startRecording() {
        var mediaConstraints;
        if(this.mediaValues && this.mediaValues==='audio'){
            mediaConstraints = {
                video:false,
                audio: true
            };
        }else{
            mediaConstraints = {
                video: {
                    width:50,
                    height:50
                },
                audio: true
            };
        }
        
        navigator.mediaDevices
            .getUserMedia(mediaConstraints)
            .then(this.successCallback.bind(this), this.errorCallback.bind(this));
    }

    stopRecording() {
        this.cameraModalService.changeState("Stopped");
        this.recordingDisable = true;
        this.recording = "null";
        if (this.recordRTC) {
            let recordRTC = this.recordRTC;
            recordRTC.stopRecording(this.processVideo.bind(this));
            this.timer.stopTimer();
            let stream = this.stream;
            stream.getAudioTracks().forEach(track => track.stop());
            stream.getVideoTracks().forEach(track => track.stop());
            let video = this.recordRTC.getDataURL(dataURL => {
                if (this.mediaValues === 'video') {
                    var base64 = dataURL.replace(/^data:video\/x-matroska;codecs=avc1,opus;base64,/, 'data:video/webm;base64,');
                } else {
                    var base64 = dataURL.replace(/^data:audio\/webm;codecs=opus;base64,/, 'data:audio/wav;base64,'); 
                }
                // To get seekable video/audio file.
                let blob = recordRTC.getBlob();
                getSeekableBlob(blob, (seekableBlob) => {
                    let seekableAudioVideo = URL.createObjectURL(seekableBlob);
                    this.video.nativeElement.src = seekableAudioVideo;
                    this.webcamVideo = this.sanitizer.bypassSecurityTrustResourceUrl(seekableAudioVideo);
                    this.videoAudioTaken.emit(seekableBlob);
                });
            });
        }
    }

    download() {
        if (this.recordRTC) {
            this.recordRTC.save('video.webm');
        }
    }
}