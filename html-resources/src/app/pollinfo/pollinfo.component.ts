import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import { PollinfoService } from "./pollinfo.service";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ModalComponent } from "../modal/modal.component";
import { EmbedVideoService } from "ngx-embed-video";
import { RetruthModalComponent } from "../retruth-modal/retruth-modal.component";
import { forkJoin } from "rxjs";
import { Options } from "ng5-slider";
import { CookieService } from "ngx-cookie-service";
import { DomSanitizer } from "@angular/platform-browser";
import { AuthService } from "../auth.service";
import { SignupComponent } from "../signupmodal/signupmodal.component";
import { Socket } from "ngx-socket-io";
import { UploadFileModalComponent } from '../uploadFileModal/uploadFileModal.component';
import { HttpClient } from "@angular/common/http";
import { UploadService } from "../shared-services/upload.service";
import {
  FormGroup,
  FormBuilder,
  Validators
} from "@angular/forms";
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material';
import { VerifiedVoteModalComponent  } from "./verified-vote-modal/verified-vote-modal.component";
import { FilePreviewComponent } from "../file-sharing/preview/file-preview/file-preview.component";
import { SharedService } from "../shared-services/shared.service";

declare var $: any;
@Component({
  selector: "app-pollinfo",
  templateUrl: "./pollinfo.component.html",
  styleUrls: ["./pollinfo.component.scss"],
  preserveWhitespaces: false
})
export class PollinfoComponent implements OnInit {
  @Input() poll: any;
  @Input() urlLocation: any;
  @Input() coutry: any;
  displayAds: Boolean = false;
  userId;
  privateSite;
  maxFileError = false;
  maxFileCount = false;
  urls: any = [];
  FileUrls = [];
  FilesArray = [];
  config = {
    class: "retruth-modal"
  };
  phone: string;
  isCollapsed = true;
  subscptionstatusArray = [];
  displayFiles = [];
  displayArticleFiles = [];
  subscriptionStatus;
  FlagTopicArray = [];
  FollowTopicArray = [];
  bsModalRef: BsModalRef;
  isVoted = [];
  valueForSlider = 1;
  isreTruth = [];
  optionForSlider1;
  Comments: any = [];
  optionForSlider2 = 0;
  commentForm: FormGroup;
  replyForm: FormGroup;
  siteName: string;
  options: Options = {
    showTicksValues: true,
    stepsArray: [
      { value: 1 },
      { value: 2 },
      { value: 3 },
      { value: 4 },
      { value: 5 },
      { value: 6 },
      { value: 7 },
      { value: 8 },
      { value: 9 },
      { value: 10 }
    ],
    // ticksTooltip: value => {
    //   return `People Voted for: ${value}`;
    // }
  };
  constructor(
    private _http: HttpClient,
    private dialog: MatDialog,
    public _router: Router,
    private pService: PollinfoService,
    private modalService: BsModalService,
    private embedService: EmbedVideoService,
    private cookieService: CookieService,
    private sanitizer: DomSanitizer,
    public auth: AuthService,
    private fb: FormBuilder,
    private socket: Socket,
    private uploadService: UploadService,
    private sharedService: SharedService
  ) {
    this.socket.fromEvent<any>("Comment").subscribe(data => {
      if (
        this.poll._id === data.poll &&
        data.user._id != localStorage.getItem("userId")
      ) {
        var regex = "^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+";
        if ((data.comment).replace(/\s/g, "").match(regex)) {
          data.youtubeUrl = this.embedService.embed(data.comment.replace(/\s/g, ""));
        }
        this.Comments.unshift(data);
        this.poll.pollCommentCount += 1;
      }
    },
    (error=>{
      console.log(error);
    }));
    this.socket.fromEvent<any>("CommentReply").subscribe(data => {
      if (
        this.poll._id === data.poll &&
        data.user._id != localStorage.getItem("userId")
      ) {
        var index = this.Comments.map(function (x) {
          return x._id;
        }).indexOf(data.comment);
        if (index < 0)
          return;
        var regex = "^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+";
        // console.log(data);
        if ((data.replycomment).replace(/\s/g, "").match(regex)) {
          data.youtubeUrl = this.embedService.embed(data.replycomment.replace(/\s/g, ""));
        }
        if (data.type === "Public") {
          if (index >= 0) this.Comments[index].replyComments.unshift(data);
        }
        else if (data.type === "Private" && this.userId === data.pollster) {

          this.Comments[index].replyComments.unshift(data);

          if (data.commentType === "Initiate") {
            var groups = new Set(
              this.Comments[index].replyComments.map(item => item.thread)
            );
            this.Comments[index].replyCommentsGroup = [];
            groups.forEach(g =>
              this.Comments[index].replyCommentsGroup.push({
                thread: g,
                values: this.Comments[index].replyComments.filter(
                  i => i.thread === g
                )
              })
            );
          }
          else if (data.commentType === "Thread") {

            var GroupIndex = this.Comments[index].replyCommentsGroup.map(function (x) { return x.thread }).indexOf(data.thread)
            this.Comments[index].replyCommentsGroup[GroupIndex].values.unshift(data);
          }
          // this.Comments[index].replyComments=[];
        }
        else if (data.type === "Private" && this.userId !== data.pollster && data.commentType === "Thread" && data.thread === localStorage.getItem('userId')) {
          var GroupIndex = this.Comments[index].replyCommentsGroup.map(function (x) { return x.thread }).indexOf(data.thread)
          this.Comments[index].replyCommentsGroup[GroupIndex].values.unshift(data);
        }
      }
    },
    (error=>{
      console.log(error);
    }));
  }

  ngOnInit() {
    let link = window.location.pathname.split('/');
    if (this.privateSiteCheck()) {
      this.siteName = link[2];
    }
    this.commentForm = this.fb.group({
      homeComment: ["", Validators.required]
    });
    this.replyForm = this.fb.group({
      replyComment: ["", Validators.required],
      replyCommentPrivate: ["", Validators.required]
    });
    $(document).ready(function () {
      $('[data-toggle="tooltip"]').tooltip();
      $('[data-toggle1="tooltip1"]').tooltip();
    });
    if (this.poll._id) {
      this.poll.displayAllComments = false;
      if (this.poll.pollresult[0]) {
        this.optionForSlider1 = this.poll.pollresult[0].result;
      }
      if (this.poll.articleInfo && this.poll.articleInfo.length > 0) {
        this.poll.articleInfo.forEach(element => {
          if (element.files && element.files.length > 0) {
            Array.prototype.push.apply(this.displayFiles, element.files); 
          }
          if (element.description != null && element.description != undefined) {
            var regex = "^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+";
            var text = '\">'
            var youtubeUrl = "";
            if (element.description.indexOf("href") != -1) {
              youtubeUrl = element.description.substring(
                element.description.indexOf("=") + 2,
                element.description.lastIndexOf(text)
              );
            }
            else
              youtubeUrl = element.description
            if (youtubeUrl.match(regex)) {
              var obj = {
                url: this.embedService.embed(youtubeUrl.replace(/\s/g, "")),
                type: "youtube"
              };
              this.displayFiles.push(obj);
            } else {
              var regex = "^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$";
               
              if (element.description.match(regex)) {
                return new Promise((res, rej) => {
                  this.pService.getMetaData(element.description).subscribe(response => {
                    if (response["result"]) {
                      let ogObj = {};
                      if (response['data']['image']) {
                        ogObj["image"] = response['data']['image']['url'];
                      } else {
                        ogObj["image"] = "";
                      }
                      ogObj["title"] = response['data']['title'];
                      ogObj["description"] = response['data']["description"];
                      ogObj["url"] = response['data']["url"];
                      this.displayArticleFiles.push(ogObj);
                    } else {
                      let ogObj = {};
                      ogObj["image"] = ""
                      ogObj["title"] = ""
                      ogObj["description"] = ""
                      ogObj["url"] = element.description
                      this.displayArticleFiles.push(ogObj);
                    }
                     
                  }, (error) => {
                    console.log(error);
                     
                  });
                });
              } else {
                let ogObj = {};
                ogObj["image"] = ""
                ogObj["title"] = ""
                ogObj["description"] = element.description
                ogObj["url"] = ""
                if (element.description.length > 0) {
                  this.displayArticleFiles.push(ogObj);
                }
              }
            }
          }
        });
      }

       
      if (this.poll.subscriptionStatus && this.poll.subscriptionStatus.length > 0) {
        this.subscriptionStatus = this.poll.subscriptionStatus[0];
      }
      if (
        this.poll.flagPollByUserIds &&
        this.poll.flagPollByUserIds.length > 0
      ) {
        this.FlagTopicArray = this.poll.flagPollByUserIds.filter(item => {
          return item.includes(localStorage.getItem("userId"));
        });
      }
      if (this.poll.pollSubscription && this.poll.pollSubscription.length > 0) {
        this.FollowTopicArray = this.poll.pollSubscription.filter(item => {
          return item.includes(localStorage.getItem("userId"));
        });
      }
    }
    this.userId = localStorage.getItem("userId");
    if (this.userId === localStorage.getItem(this.siteName + '_siteOwnerId')) {
      this.userId = localStorage.getItem(this.siteName + '_siteUserId');
    }
    if (this.privateSiteCheck()) {
      this.privateSite = localStorage.getItem("privateSite");
    } else {
      this.privateSite = false;
    }

    // Get global configurations for settings
    let configurations = {};
    configurations = this.sharedService.getConfigurations()
    if (configurations != {}) {
      this.displayAds = (configurations["show_google_ads"]) ? configurations["show_google_ads"] : this.displayAds;
    }
  }
  openModalWithComponent(bool) {
    const initialState = {
      list: [
        "Open a modal with component",
        "Pass your data",
        "Do something else",
        "..."
      ],
      title: "Modal with component"
    };
    this.bsModalRef = this.modalService.show(SignupComponent, { initialState });
    this.bsModalRef.setClass("my-modal");
    this.bsModalRef.content.closeBtnName = "Close";
    this.bsModalRef.content.showSignup = bool;
  }
  getYoutubeUrl(url) {
    return this.embedService.embed(url.replace(/\s/g, ""));
  }
  openImageModal(url) {

  }
  openDeleteModal(poll) {
    const initialState = {
      title: "Modal with component"
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.content.alertTitle = "Alert";
    this.bsModalRef.content.content =
      "Are you sure? Do you want to Delete this Topic ?";
    this.bsModalRef.content.onClose = myData => {
       
      this.bsModalRef.hide();
      var id = {
        id: poll._id
      };
      this.pService.deletePoll(id).subscribe(data => {
        this.poll = undefined;
         
        if (this.privateSiteCheck()) {
          this._router.navigateByUrl("/privatesites/" + localStorage.getItem(this.siteName + '_privateSiteName'));
        } else {
          if (this.cookieService.get('userHomeTabLocation') && this.cookieService.get('userHomeLocation')) {
            let userHomeTabLocation = this.cookieService.get('userHomeTabLocation');
            let userHomeLocation = this.cookieService.get('userHomeLocation');
            this._router.navigateByUrl("/home/"+ userHomeTabLocation + "?location=" + userHomeLocation);
          } else if (this.cookieService.get('userHomeTabLocation')) {
            let userHomeTabLocation = this.cookieService.get('userHomeTabLocation');
            this._router.navigateByUrl("/home/"+ userHomeTabLocation + "?location=world");
          } else {
            this._router.navigateByUrl("/home/top?location=world");
          }
        }
      },
      (error=>{
         
        console.log(error);
      }));
    };
  }
  toSubscribeupDate(id) {
     
    var status = {
      status: "PENDING"
    };
    var privateSite=localStorage.getItem("privateSite");
    var notifcation = {
      type: "SUBSCRIBE",
      notifyTo: this.poll.pollster._id,
      pollId: this.poll._id,
      createdBy: this.userProfile(),
      message: "has sent you a subscriber request",
      isRead: false,
      subscribeId: localStorage.getItem("userId"),
      isViewed: false,
      createdAt: new Date(),
      privateSite:false,
      updatedAt: new Date(),
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    };
    if(privateSite){
      notifcation.privateSite=true;
      notifcation["privateSiteId"]=localStorage.getItem(this.siteName + '_siteUserId');
    }
    this.pService.sendNotifcation(notifcation);
    forkJoin(
      this.pService.updaeteSubscrptionStatus(id, status),
      this.pService.saveNofication(notifcation)
    ).subscribe(data => {
       
      this.subscriptionStatus.status = "PENDING";
    });
  }
  toSubscribe(pollster) {
     
    var notifcation = {
      type: "SUBSCRIBE",
      notifyTo: this.poll.pollster._id,
      pollId: this.poll._id,
      createdBy: this.userProfile(),
      message: "has sent you a subscriber request",
      subscribeId: localStorage.getItem("userId"),
      isRead: false,
      isViewed: false,
      privateSite:false,
      createdAt: new Date(),
      updatedAt: new Date(),
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    };
    var privateSite=localStorage.getItem("privateSite");
    if(privateSite){
      notifcation.privateSite=true;
    }
    var data = {
      recipientname: pollster.firstName + " " + pollster.lastName,
      recipientid: pollster._id,
      senderid: localStorage.getItem("userId"),
      sendername:
        localStorage.getItem("userFirstName") +
        " " +
        localStorage.getItem("userLastName"),
      country: localStorage.getItem("country"),
      tomail: pollster.email,
      profilePicture: localStorage.getItem("profilePicture"),
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    }; 
    if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
      data.senderid = localStorage.getItem(this.siteName + '_privateSiteUserId');
      data.sendername = localStorage.getItem(this.siteName + "_privateSiteName");
      data.profilePicture = localStorage.getItem(this.siteName + '_privateSiteLogo');
    }
    this.pService.sendNotifcation(notifcation);
    forkJoin(
      this.pService.addSubscriber(data),
      this.pService.saveNofication(notifcation)
    ).subscribe(data => {
       
      var dataa: any = data[0];
      var obj = {
        feedOption: "start",
        status: "PENDING",
        subscriber: dataa.subscriber,
        _id: dataa._id
      };
      this.subscriptionStatus = obj;

      const initialState = {
        title: "Modal with component"
      };
      this.bsModalRef = this.modalService.show(ModalComponent, {
        initialState
      });
      this.bsModalRef.content.alertTitle = "Alert";
      this.bsModalRef.content.isCancel = true;
      this.bsModalRef.content.content =
        "Once the user accepts the request you will be notified";
      this.bsModalRef.content.onClose = myData => {
        this.bsModalRef.hide();
      };




    },
    (error=>{
      console.log(error);
    }));
  }
  changeEvent(event) {
    if (!this.auth.isLoggedIn()) {
      this.valueForSlider = 0;
      this.openModalWithComponent(false);
    }
    this.vote(event.value, this.poll);
  }
  followpoll(poll) {
    if (!this.auth.isLoggedIn()) {
      this.openModalWithComponent(false);
      return;
    }
    var data = {
      id: poll._id,
      userid: localStorage.getItem("userId")
    };
     
    var notifcation = {
      type: "POLL_FOLLOWER",
      notifyTo: this.poll.pollster._id,
      pollId: this.poll._id,
      createdBy: this.userProfile(),
      message: "",
      isRead: false,
      isViewed: false,
      privateSite:false,
      createdAt: new Date(),
      updatedAt: new Date(),
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    };
    var privateSite=localStorage.getItem("privateSite");
    if(privateSite){
      notifcation.privateSite=true;
    }
    this.pService.sendNotifcation(notifcation);
    forkJoin(
      this.pService.followTopic(data),
      this.pService.saveNofication(notifcation)
    ).subscribe(data => {
       
      this.FollowTopicArray.push(localStorage.getItem("userId"));
    },
    (error=>{
      console.log(error);
    }));
  }
  Unfollow(poll) {
    if (!this.auth.isLoggedIn()) {
      this.openModalWithComponent(false);
      return;
    }
    var data = {
      id: poll._id,
      userid: localStorage.getItem("userId")
    };
     
    this.pService.unfollowTopic(data).subscribe(data => {
       
      this.FollowTopicArray.pop();
    },
    (error=>{
      console.log(error);
    }));
  }
  updateSlider(event) {
    if (!this.auth.isLoggedIn()) {
      this.valueForSlider = 0;
      this.openModalWithComponent(false);
      return
    }
     
    this.vote(event.value, this.poll);
  }
  checkFlagModal(poll) {
    if (!this.auth.isLoggedIn()) {
      this.openModalWithComponent(false);
      return;
    }
    var popupString;
    if (this.FlagTopicArray.length > 0) {
      popupString = "Are you sure? Do you want to UnFlag this Topic ?";
    } else {
      popupString = "Are you sure? Do you want to Flag this Topic ?";
    }
    const initialState = {
      title: "Modal with component"
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.content.alertTitle = "Alert";
    this.bsModalRef.content.content = popupString;
    this.bsModalRef.content.onClose = myData => {
       
      var flagData = {
        id: poll._id,
        userid: localStorage.getItem("userId")
      };
      if (
        this.FlagTopicArray.length === 0 &&
        this.FollowTopicArray.length > 0
      ) {
        this.flagWhenFollow(flagData);
      } else if (this.FlagTopicArray.length > 0) {
        this.pService.unflagTopic(flagData).subscribe(data => {
           
          this.FlagTopicArray.pop();
        },
        (error=>{
          console.log(error);
        }));
      } else {
        this.pService.flagTopic(flagData).subscribe(data => {
           
          this.FlagTopicArray.push(localStorage.getItem("userId"));
        },
        (error=>{
          console.log(error);
        }));
      }
      this.bsModalRef.hide();
       
    };
  }
  navtoMyProfle() {
    var siteName = localStorage.getItem(this.siteName + "_privateSiteName");
    if (siteName && siteName!="" && localStorage.getItem(this.siteName + '_siteUserId')) {
      this._router.navigate(["privatesites/" + siteName + "/profile/mytopics"]);
    } else {
      this.removeItems();
      this._router.navigate(["/profile/mytopics"]);
    }

  }
  navtoUserProfle(user) {
    if (this.privateSiteCheck()) {
      if (user._id === localStorage.getItem(this.siteName + "_siteUserId")) {
        return;
      }
      var siteName = localStorage.getItem(this.siteName + "_privateSiteName");
      this._router.navigate(["privatesites/" + siteName +"/userprofile/" + user.userName]);
    } else {
      this._router.navigate(["/userprofile/" + user.userName]);
    }
  }
  editButton(pollid) {
    if (this.privateSiteCheck()) {
      if (localStorage.getItem(this.siteName + "_privateSiteName")) {
        var siteName = localStorage.getItem(this.siteName + "_privateSiteName");
        this._router.navigate(["privatesites/" + siteName + "/poll/edit/start/" + pollid]);
      } else {
        this._router.navigate(["poll/edit/start/" + pollid]);
      }
    } else {
      this._router.navigate(["poll/edit/start/" + pollid]);
    }
  }
  flagWhenFollow(flagData) {
    return forkJoin(
      this.pService.flagTopic(flagData),
      this.pService.unfollowTopic(flagData)
    ).subscribe(data => {
      this.FollowTopicArray.pop();
      this.FlagTopicArray.push(localStorage.getItem("userId"));
    },
    (error=>{
      console.log(error);
    }));
  }
  vote(Option, poll) {
    if (!this.auth.isLoggedIn()) {
      this.openModalWithComponent(false);
      return;
    }
     
    if (!poll.verifiedVote || (this.userId === poll.pollster._id)) {
      this.voteConfirmed(Option, poll);
    } else  {
        // Verify phone
        this.pService.getUserProfileDetails(localStorage.getItem('userId')).subscribe((userDetails) => {
          let user = userDetails;
          if (user) {
            if (this.privateSiteCheck()) {
              let numbersList = user[0].verifiedNumbersList;
              if (numbersList.length > 0) {
                var verified = false;
                var phone = "";
                for (let i=0; i < numbersList.length; i++) {
                  if (localStorage.getItem(this.siteName + "_siteUserId") === numbersList[i].privateSiteId) {
                    if (numbersList[i].phoneVerified) {
                      verified = true;
                      phone = numbersList[i].phone;
                    }
                  }
                }

                if (verified) {
                  const dialogRef = this.dialog.open(VerifiedVoteModalComponent, {
                    width: '400px',
                    data: {
                      'phone': phone,
                      "title": "VERIFIED VOTE",
                      "label": "This is a verified poll. Verify your phone to vote",
                      "numberConfirmation": "We'll send a code to ",
                      "attempt": "second"
                    }
                  });
    
                  dialogRef.afterClosed().subscribe(result => {
                    if (result === 'verified') {
                      let requestData = {
                        "userId": localStorage.getItem('userId'),
                        "pollId": poll._id
                      }
                      this.pService.insertVerifiedVoter(requestData).subscribe(data => { }, (error) => {
                         
                        console.error(error);
                      });
                      this.voteConfirmed(Option, poll);
                    } else {
                       
                      return;
                    }
                  });
                } else {
                  const dialogRef = this.dialog.open(VerifiedVoteModalComponent, {
                    width: '400px',
                    data: {
                      "phone": "",
                      "title": "VERIFIED VOTE",
                      "label": "This is a verified poll. Verify your phone to vote",
                      "attempt": "first"
                    }
                  });
    
                  dialogRef.afterClosed().subscribe(result => {
                    if (result === 'verified') {
                      let requestData = {
                        "userId": localStorage.getItem('userId'),
                        "pollId": poll._id
                      }
                      this.pService.insertVerifiedVoter(requestData).subscribe(data => { }, (error) => {
                         
                        console.error(error);
                      });
                      this.voteConfirmed(Option, poll);
                    } else {
                       
                      return;
                    }
                  });
                }
              } else {
                const dialogRef = this.dialog.open(VerifiedVoteModalComponent, {
                  width: '400px',
                  data: {
                    "phone": "",
                    "title": "VERIFIED VOTE",
                    "label": "This is a verified poll. Verify your phone to vote",
                    "attempt": "first"
                  }
                });
  
                dialogRef.afterClosed().subscribe(result => {
                  if (result === 'verified') {
                    let requestData = {
                      "userId": localStorage.getItem('userId'),
                      "pollId": poll._id
                    }
                    this.pService.insertVerifiedVoter(requestData).subscribe(data => { }, (error) => {
                       
                      console.error(error);
                    });
                    this.voteConfirmed(Option, poll);
                  } else {
                     
                    return;
                  }
                });
              }
            } else if (user[0]['phone'] !== null && user[0]['phoneVerified']) {
              const dialogRef = this.dialog.open(VerifiedVoteModalComponent, {
                width: '400px',
                data: {
                  'phone': user[0]['phone'],
                  "title": "VERIFIED VOTE",
                  "label": "This is a verified poll. Verify your phone to vote",
                  "numberConfirmation": "We'll send a code to ",
                  "attempt": "second"
                }
              });

              dialogRef.afterClosed().subscribe(result => {
                if (result === 'verified') {
                  let requestData = {
                    "userId": localStorage.getItem('userId'),
                    "pollId": poll._id
                  }
                  this.pService.insertVerifiedVoter(requestData).subscribe(data => { }, (error) => {
                     
                    console.error(error);
                  });
                  this.voteConfirmed(Option, poll);
                } else {
                   
                  return;
                }
              });
            } else {
              const dialogRef = this.dialog.open(VerifiedVoteModalComponent, {
                width: '400px',
                data: {
                  "phone": "",
                  "title": "VERIFIED VOTE",
                  "label": "This is a verified poll. Verify your phone to vote",
                  "attempt": "first"
                }
              });

              dialogRef.afterClosed().subscribe(result => {
                if (result === 'verified') {
                  let requestData = {
                    "userId": localStorage.getItem('userId'),
                    "pollId": poll._id
                  }
                  this.pService.insertVerifiedVoter(requestData).subscribe(data => { }, (error) => {
                     
                    console.error(error);
                  });
                  this.voteConfirmed(Option, poll);
                } else {
                   
                  return;
                }
              });
            }
          }
        });
    }
   
  }

  voteConfirmed(Option, poll) {
     
    if (poll.pollresult && poll.pollresult.length > 0) {
      var pollresltupdate = {
        result: {
          result: Option
        },
        id: poll.pollresult[0]._id
      };
      var pollCastCountByAnswer = this.poll.pollCastCountByAnswer;
      if (pollCastCountByAnswer[Option]) {
        pollCastCountByAnswer[Option] += 1;
      } else {
        pollCastCountByAnswer[Option] = 1;
      }
      pollCastCountByAnswer[poll.pollresult[0].result] -= 1;
      if (this.coutry === poll.country) {
        var targetCountryCountByAnswer = poll.targetCountryCountByAnswer;
        if (targetCountryCountByAnswer[Option]) {
          targetCountryCountByAnswer[Option] += 1;
        } else targetCountryCountByAnswer[Option] = 1;
        targetCountryCountByAnswer[poll.pollresult[0].result] -= 1;
        var data = {
          pollCastCountByAnswer: pollCastCountByAnswer,
          targetCountryCountByAnswer: targetCountryCountByAnswer
        };

        this.updateBothVotes(data, pollresltupdate);
      } else {
        var data2 = {
          pollCastCountByAnswer: pollCastCountByAnswer
        };
        this.updateSingleVote(data2, pollresltupdate);
      }
      poll.pollresult[0].result = Option;
    } else {
       
      if (this.urlLocation != "world") poll.targetCountryCount += 1;
      poll.pollCastCount += 1;
      var voteData = {
        pinc: Option,
        tinc: Option,
        pollresult: {
          poll: this.poll._id,
          user: localStorage.getItem("userId"),
          coutry: this.poll.country,
          result: Option
        }
      };
      if (localStorage.getItem(this.siteName + "_privateSiteUserId")) {
        voteData.pollresult.user = localStorage.getItem(this.siteName + "_privateSiteUserId");
      }
      if (this.coutry === poll.country) {
        this.insertBothVotes(voteData);
      } else {
        this.insertSingleVote(voteData);
      }
    }
  }

  checkcondtiton(subscriptionStatus) {
    if (this.subscriptionStatus.feedoption === "stop") {
      this.subscriptionStatus.feedoption = "start";
    } else {
      this.subscriptionStatus.feedoption = "stop";
    }
    var feedoptions = {
      feedoption: this.subscriptionStatus.feedoption
    };
     
    this.pService
      .feedOptionUpdateOnSubscription(subscriptionStatus._id, feedoptions)
      .subscribe(data => {
        if (data) {
           
        }
      },
      (error=>{
        console.log(error);
      }));
  }
  getComments(poll, event) {
    poll.displayAllComments = true;
    var data = {
      pollid: poll._id
    };
    if (this.isCollapsed) {
       
      this.pService.getcommments(data).subscribe(data => {
         
        this.Comments = data;
        this.Comments.forEach(element => {
          // console.log(element.comment);
          var regex = "^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+";
          if ((element.comment).replace(/\s/g, "").match(regex)) {
            element.youtubeUrl = this.embedService.embed(element.comment.replace(/\s/g, ""));
          }
          element.urls = [];
          element.FileUrls = [];
          element.FilesArray = [];
          element.isCollapsed = true;
          element.replyComments = [];
          element.replyCommentsGroup = [];
          if (element.replyCount > 0) element.showInitReply = true;
          else element.showInitReply = true;

          if (this.privateSiteCheck()) {
            if (element.user._id === localStorage.getItem(this.siteName + "_siteOwnerId")) {
              element.user.firstName = localStorage.getItem(this.siteName + "_privateSiteName");
              element.user.lastName = "(Site Admin)";
              element.user.profilePicture = localStorage.getItem(this.siteName + "_privateSiteLogo")
            }
          }
        });
      },
      (error=>{
        console.log(error);
      }));
    }
  }
  pollOverlay(id, type) {
    var siteName = localStorage.getItem(this.siteName + "_privateSiteName");
    if (siteName) {
      this.cookieService.set("navtype", "privatesite");

      this._router.navigate(["/privatesites/" + siteName + "/poll/" + id]);

    } else {
      this.cookieService.set("navtype", "turnumssite");

      this._router.navigate(["/poll/" + id]);
    }


    // this._router.navigate(["/poll/" + id]);
  }
  reTruthmodal(poll) {
    const initialState = {
      title: "Modal with component",
      poll: poll
    };
    this.bsModalRef = this.modalService.show(RetruthModalComponent, {
      class: "my-modal-dialog retruth-modal",
      initialState
    });
    this.bsModalRef.content.alertTitle = "Alert";
    this.bsModalRef.content.content = "Retruth this topic to your subscribers";
    this.bsModalRef.content.onClose = myData => {
       
      var retruthdata = {
        user_id: localStorage.getItem("userId"),
        poll_id: this.poll._id,
        retruth_reason: myData
      };
      var username =
        localStorage.getItem("userFirstName") +
        " " +
        localStorage.getItem("userLastName");
      var pollretruth = {
        pollid: this.poll._id,
        username: username,
        userid: localStorage.getItem('userId')
      };

      if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
        retruthdata.user_id = localStorage.getItem(this.siteName + '_privateSiteUserId');
        pollretruth.userid = localStorage.getItem(this.siteName + '_privateSiteUserId');
      }
      return forkJoin(
        this.pService.retruthTopic(retruthdata),
        this.pService.addUserToRetruth(pollretruth)
      ).subscribe(data => {
         
        this.bsModalRef.hide();
        if (data) {
          this.poll.retruthtopic.push(data[0]);
          this.poll.pollRetruthCount += 1;
        }
      },
      (error=>{
        console.log(error);
      }));
    };
  }
  cancelRetruthModal(poll) {
    const initialState = {
      title: "Modal with component"
    };
    var username =
      localStorage.getItem("userFirstName") +
      " " +
      localStorage.getItem("userLastName");
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.content.alertTitle = "Alert";
    this.bsModalRef.content.content =
      "Are you sure? Do you want to Cancel this Retruth ?";
    this.bsModalRef.content.onClose = myData => {
      var data = {
        pollid: this.poll._id,
        username: username,
        userid: localStorage.getItem('userId')
      };
      if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
        data.userid = localStorage.getItem(this.siteName + '_privateSiteUserId');
      }
      return forkJoin(
        this.pService.deleteretruthtopic(this.poll.retruthtopic[0]._id),
        this.pService.removeUserToRetruth(data)
      ).subscribe(data => {
         
        this.bsModalRef.hide();
        if (data) {
          this.poll.retruthtopic.pop();
          this.poll.pollRetruthCount -= 1;
        }
      },
      (error=>{
        console.log(error);
      }));
    };
  }
  updateBothVotes(data, poll) {
    return forkJoin(
      this.pService.updateBoth(data, this.poll._id),
      this.pService.updatePollResult(poll.result, poll.id)
    ).subscribe(result => {
      var res: any = result;
      this.poll.pollCastCountByAnswer = res[0].pollCastCountByAnswer;
      this.poll.targetCountryCountByAnswer = res[0].targetCountryCountByAnswer;
      this.poll.pollresult.pop();
      this.poll.pollresult.push(res[1]);
       
    },
    (error=>{
      console.log(error);
    }));
  }
  updateSingleVote(data, poll) {
    return forkJoin(
      this.pService.updatepollCastCountByAnswer(
        data.pollCastCountByAnswer,
        this.poll._id
      ),
      this.pService.updatePollResult(poll.result, poll.id)
    ).subscribe(result => {
      var res: any = result;
      this.poll.pollresult.pop();
      this.poll.pollresult.push(res[1]);
      this.poll.pollCastCountByAnswer = res[0].pollCastCountByAnswer;
       
    },
    (error=>{
      console.log(error);
    }));
  }
  insertBothVotes(data) {
    return forkJoin(
      this.pService.voteBoth(data, this.poll._id),
      this.pService.insertPollResult(data.pollresult)
    ).subscribe(result => {
      var res: any = result;
      this.poll.pollCastCountByAnswer = res[0].pollCastCountByAnswer;
      this.poll.targetCountryCountByAnswer = res[0].targetCountryCountByAnswer;
      this.poll.targetCountryCount = res[0].targetCountryCount;
      this.poll.pollCastCount = res[0].pollCastCount;
      this.poll.pollresult.push(res[1]);
      // console.log(this.poll);
      this.optionForSlider1 = this.poll.pollresult[0].result;
       
    },
    (error=>{
      console.log(error);
    }));
  }
  insertSingleVote(data) {
    return forkJoin(
      this.pService.votepollCastCountByAnswer(
        data,
        this.poll._id
      ),
      this.pService.insertPollResult(data.pollresult)
    ).subscribe(result => {
      var res: any = result;
      this.poll.pollresult.push(res[1]);
      this.poll.pollCastCountByAnswer = res[0].pollCastCountByAnswer;
      this.poll.pollCastCount = res[0].pollCastCount;
       
      this.optionForSlider1 = this.poll.pollresult[0].result;
    },
    (error=>{
      console.log(error);
    }));
  }
  shareOrFollow(id, type, question) {
    var strWindowFeatures =
      "location=yes,height=570,width=520,scrollbars=yes,status=yes";
    var url = window.location.origin + "/poll/" + id;
    if (this.privateSiteCheck()) {
      url = window.location.origin + "/privatesites/" + localStorage.getItem(this.siteName + "_privateSiteName") + "/poll/" + id;
    }
    var shareurl;
    if (type === "twitter") {
      shareurl = "https://twitter.com/intent/tweet?&url=" + url;
    } else if (type === "facebook") {
      shareurl = "https://www.facebook.com/dialog/share?app_id=" + environment.facebook_app_id + "&display=popup&quote= " + question + "&href=" + url + "&redirect_uri=" + url; 
    } else if (type === "whatsapp") {
      shareurl = "https://api.whatsapp.com/send?text=" + url;
    } else if (type === "envelope") {
      shareurl = "mailto:?Subject=" + url;
      window.location.href = "mailto:?Subject=" + url;
      return;
    }
    window.open(shareurl, "_blank", strWindowFeatures);
  }
  onFileChange(event) {
    this.maxFileCount = false;
    this.maxFileError = false;
    this.urls = [];
    if (event.target.files && event.target.files.length >= 11) {
      this.maxFileCount = true;
      return;
    }
    this.FilesArray = event.target.files;
    for (var file of this.FilesArray) {
      if (file.size / Math.pow(1024, 2) >= 500) {
        this.maxFileError = true;
        return;
      }
      var singledata = {
        url: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file)),
        type: file.type
      };
      this.urls.push(singledata);
    }
  }
  onFileChangeReply(event, comment) {
    this.maxFileCount = false;
    this.maxFileError = false;
    comment.urls = [];
    if (event.target.files && event.target.files.length >= 11) {
      this.maxFileCount = true;
      return;
    }
    comment.FilesArray = event.target.files;
    for (var file of comment.FilesArray) {
      if (file.size / Math.pow(1024, 2) >= 500) {
        this.maxFileError = true;
        return;
      }
      var singledata = {
        url: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file)),
        type: file.type
      };
      comment.urls.push(singledata);
    }
  }
  removeFile(index) {
    var TempFileArray = [];
    this.urls.splice(index, 1);
    for (var i = 0; i < this.FilesArray.length; i++) {
      if (i !== index) {
        TempFileArray.push(this.FilesArray[i]);
      }
    }
    this.FilesArray = TempFileArray;
  }
  removeFileReply(comment, index) {
    var TempFileArray = [];
    comment.urls.splice(index, 1);
    for (var i = 0; i < comment.FilesArray.length; i++) {
      if (i !== index) {
        TempFileArray.push(comment.FilesArray[i]);
      }
    }
    comment.FilesArray = TempFileArray;
  }
  SaveComment(flag, pollid) {
    var commentObj = {
      comment: this.commentForm.controls["homeComment"].value,
      user: localStorage.getItem("userId"),
      poll: pollid,
      createdAt: new Date(),
      updatedAt: new Date(),
      files: this.FileUrls
    };
    var incObj = {
      pollid: pollid
    };
    var notifcation = {
      type: "COMMENT",
      notifyTo: this.poll.pollster._id,
      pollId: this.poll._id,
      createdBy: this.userProfile(),
      message: this.commentForm.controls["homeComment"].value,
      isRead: false,
      isViewed: false,
      privateSite:false,
      createdAt: new Date(),
      updatedAt: new Date(),
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    };
    var privateSite = localStorage.getItem("privateSite");
    if (privateSite === "true") {
      notifcation.privateSite = true;
    }
    if (localStorage.getItem('userId') === this.poll.pollster._id) {
      return forkJoin(
        this.pService.postcomment(commentObj),
        this.pService.incrementcommentcount(incObj),
      ).subscribe(data => {
        var docs: any = data;
        var tempComment = {
          _id: docs[0]._id,
          comment: this.commentForm.controls["homeComment"].value,
          user: this.userProfile(),
          poll: pollid,
          createdAt: new Date(),
          updatedAt: new Date(),
          youtubeUrl: "",
          files: this.FileUrls,
          isCollapsed: true,
          urls: [],
          FileUrls: [],
          FilesArray: [],
          replyComments: [],
          replyCommentsGroup: []
        };
        var regex = "^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+";
        if ((this.commentForm.controls["homeComment"].value).replace(/\s/g, "").match(regex)) {
          tempComment.youtubeUrl = this.embedService.embed((this.commentForm.controls["homeComment"].value).replace(/\s/g, ""))
        }
        this.pService.sendComment(tempComment);
        this.commentForm.controls["homeComment"].setValue("");
        this.urls = [];
        this.FileUrls = [];
        this.FilesArray = [];
        this.Comments.unshift(tempComment);
        this.poll.pollCommentCount += 1;
         
      },
      (error=>{
        console.log(error);
      }));
    }
    else {
      this.pService.sendNotifcation(notifcation);
      return forkJoin(
        this.pService.postcomment(commentObj),
        this.pService.incrementcommentcount(incObj),
        this.pService.saveNofication(notifcation)
      ).subscribe(data => {
        var docs: any = data;
        var tempComment = {
          _id: docs[0]._id,
          comment: this.commentForm.controls["homeComment"].value,
          user: this.userProfile(),
          poll: pollid,
          createdAt: new Date(),
          updatedAt: new Date(),
          files: this.FileUrls,
          isCollapsed: true,
          urls: [],
          FileUrls: [],
          youtubeUrl: "",
          FilesArray: [],
          replyComments: [],
          replyCommentsGroup: []
        };
        var regex = "^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+";
        if ((this.commentForm.controls["homeComment"].value).replace(/\s/g, "").match(regex)) {
          tempComment.youtubeUrl = this.embedService.embed((this.commentForm.controls["homeComment"].value).replace(/\s/g, ""))
        }
        this.pService.sendComment(tempComment);
        this.commentForm.controls["homeComment"].setValue("");
        this.urls = [];
        this.FileUrls = [];
        this.FilesArray = [];
        this.Comments.unshift(tempComment);
        this.poll.pollCommentCount += 1;
         
      },
      (error=>{
        console.log(error);
      }));
    }
  }
  userProfile() {
    var data = {
      firstName: localStorage.getItem("userFirstName"),
      lastName: localStorage.getItem("userLastName"),
      userName: localStorage.getItem("userName"),
      profilePicture: localStorage.getItem("profilePicture"),
      _id: localStorage.getItem("userId")
    };
    if (localStorage.getItem(this.siteName + "_privateSiteUserId")) {
      if (localStorage.getItem(this.siteName + "_siteOwnerId") === localStorage.getItem("userId")) {
        data.firstName = localStorage.getItem(this.siteName + "_privateSiteName");
        data.lastName = "(Site Admin)";
        data.profilePicture = localStorage.getItem(this.siteName + "_privateSiteLogo");
        // data.userName = "";
      }
    }
    return data;
  }
  addCommentt(pollid) {
    if (!this.auth.isLoggedIn()) {
      this.openModalWithComponent(false);
      return;
    }
     
    if (this.FilesArray.length > 0) this.UploadFiles(pollid);
    else {
      if (/\S/.test(this.commentForm.controls["homeComment"].value)) {
        this.FileUrls = [];
        this.SaveComment(true, pollid);
      } else {
         
      }
    }
  }
  UploadFiles(pollid) {
    for (var i = 0; i < this.FilesArray.length; i++) {
      var type = this.FilesArray[i].type;
      this.uploadService.uploadFile(this.FilesArray[i]).then(
        pased => {
          var single = {
            url: pased.Location,
            type: type
          };
          this.FileUrls.push(single);
          if (this.FilesArray.length === this.FileUrls.length) {
            this.SaveComment(true, pollid);
          }
        },
        err => {
          this.SaveComment(false, pollid);
        }
      );
    }
  }
  UploadFilesReplyComments(comment, pollid) {
    for (var i = 0; i < comment.FilesArray.length; i++) {
      var type = comment.FilesArray[i].type;
      this.uploadService.uploadFile(comment.FilesArray[i]).then(
        pased => {
          var single = {
            url: pased.Location,
            type: type
          };
          comment.FileUrls.push(single);
          if (comment.FilesArray.length === comment.FileUrls.length) {
            this.saveReplyComment(true, comment, pollid);
          }
        },
        err => {
          this.saveReplyComment(false, comment, pollid);
        }
      );
    }
  }
  deleteCommentModal(comment, poll) {
    const initialState = {
      title: "Modal with component"
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.content.alertTitle = "Alert";
    this.bsModalRef.content.content =
      "Are you sure? Do you want to Delete this Comment ?";
    this.bsModalRef.content.onClose = myData => {
      this.bsModalRef.hide();
      var incobj = {
        pollid: poll._id
      };
      forkJoin(
        this.pService.decrementcommentcount(incobj),
        this.pService.deletecomment(comment._id)
      ).subscribe(data => {
        var a = this.Comments.indexOf(comment);
        this.Comments.splice(a, 1);
        this.poll.pollCommentCount -= 1;
      },
      (error=>{
        console.log(error);
      }));
    };
  }
  replyCommentData1(comment) {
    if (!this.auth.isLoggedIn()) {
      this.openModalWithComponent(false);
      return;
    }
    comment.isCollapsed = !comment.isCollapsed
    var data = {
      commentid: comment._id
    };
    if (!comment.isCollapsed) {
       
      this.pService.getcommentreplies(data).subscribe(data => {
         
        comment.replyComments = data;
        comment.replyComments.forEach(element => {
          var regex = "^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+";
          if ((element.replycomment).replace(/\s/g, "").match(regex)) {
            element.youtubeUrl = this.embedService.embed(element.replycomment.replace(/\s/g, ""));
          }

          if (this.privateSiteCheck()) {
            if (element.user._id === localStorage.getItem(this.siteName + "_siteOwnerId")) {
              element.user.firstName = localStorage.getItem(this.siteName + "_privateSiteName");
              element.user.lastName = "(Site Admin)";
              element.user.profilePicture = localStorage.getItem(this.siteName + "_privateSiteLogo")
            }
          }
        });
        var beta: any = data;
      },
      (error=>{
        console.log(error);
      }));
    }
  }
  initiatePublicCommentReply(comment, poll) {
     
    if (comment.FilesArray.length > 0)
      this.UploadFilesReplyComments(comment, poll._id);
    else {
      this.FileUrls = [];
      this.saveReplyComment(true, comment, poll._id);
    }
  }
  saveReplyComment(flag, comment, pollid) {
    var commentObj = {
      replycomment: this.replyForm.controls["replyComment"].value,
      user: localStorage.getItem("userId"),
      poll: pollid,
      thread: localStorage.getItem("userId"),
      comment: comment._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      files: comment.FileUrls
    };
    var incobj = {
      commentid: comment._id
    };
    var notifcation = {
      type: "COMMENT_REPLY",
      notifyTo: comment.user._id,
      pollId: this.poll._id,
      createdBy: this.userProfile(),
      message: "",
      isRead: false,
      isViewed: false,
      createdAt: new Date(),
      privateSite:false,
      commentId: comment._id,
      updatedAt: new Date(),
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    };
    var privateSite=localStorage.getItem("privateSite");
    if(privateSite){
      notifcation.privateSite=true;
    }
    if (comment.user._id === localStorage.getItem('userId')) {
      return forkJoin(
        this.pService.postcommentreply(commentObj),
        this.pService.incrementreplycommentcount(incobj),
      ).subscribe(data => {
        var docs: any = data;
        var tempComment = {
          _id: docs[0]._id,
          user: this.userProfile(),
          replycomment: this.replyForm.controls["replyComment"].value,
          poll: pollid,
          thread: localStorage.getItem("userId"),
          comment: comment._id,
          createdAt: new Date(),
          updatedAt: new Date(),
          files: comment.FileUrls,
          youtubeUrl: "",
          pollster: this.poll.pollster._id,
          type: "Public"
        };
        var regex = "^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+";
        if ((this.replyForm.controls["replyComment"].value).replace(/\s/g, "").match(regex)) {
          tempComment.youtubeUrl = this.embedService.embed((this.replyForm.controls["replyComment"].value).replace(/\s/g, ""))
        }
        // this.pService.sendCommentReply(tempComment);
        this.pService.sendCommentReply(tempComment);
        this.replyForm.controls["replyComment"].setValue("");
        comment.urls = [];
        comment.FileUrls = [];
        comment.FilesArray = [];
        comment.replyComments.unshift(tempComment);
         
      },
      (error=>{
        console.log(error);
      }));
    }
    else {
      this.pService.sendNotifcation(notifcation);
      return forkJoin(
        this.pService.postcommentreply(commentObj),
        this.pService.incrementreplycommentcount(incobj),
        this.pService.saveNofication(notifcation)
      ).subscribe(data => {
        var docs: any = data;
        var tempComment = {
          _id: docs[0]._id,
          user: this.userProfile(),
          replycomment: this.replyForm.controls["replyComment"].value,
          poll: pollid,
          thread: localStorage.getItem("userId"),
          comment: comment._id,
          createdAt: new Date(),
          updatedAt: new Date(),
          files: comment.FileUrls,
          youtubeUrl: "",
          pollster: this.poll.pollster._id,
          type: "Public"
        };
        var regex = "^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+";
        if ((this.replyForm.controls["replyComment"].value).replace(/\s/g, "").match(regex)) {
          tempComment.youtubeUrl = this.embedService.embed((this.replyForm.controls["replyComment"].value).replace(/\s/g, ""))
        }
        // this.pService.sendCommentReply(tempComment);
        this.pService.sendCommentReply(tempComment);
        this.replyForm.controls["replyComment"].setValue("");
        comment.urls = [];
        comment.FileUrls = [];
        comment.FilesArray = [];
        comment.replyComments.unshift(tempComment);
         
      },
      (error=>{
        console.log(error);
      }));
    }
  }
  getCommentReplies_pollinfo(comment) {
    if (!this.auth.isLoggedIn()) {
      this.openModalWithComponent(false);
      return
    }
    comment.isCollapsed = !comment.isCollapsed;
    var data = {
      commentid: comment._id,
      thread: localStorage.getItem("userId")
    };
    if (comment.isCollapsed) {
      if (this.poll.pollster._id === this.userId) {
         
        this.pService.getcommentreplies(data).subscribe(data => {
          comment.replyComments = data;
          var groups = new Set(comment.replyComments.map(item => item.thread));
          comment.replyCommentsGroup = [];
          groups.forEach(g =>
            comment.replyCommentsGroup.push({
              thread: g,
              values: comment.replyComments.filter(i => i.thread === g)
            })
          );
           
        },
        (error=>{
          console.log(error);
        }));
      } else {
        this.pService.getcommentrepliesthread(data).subscribe(data => {
          comment.replyComments = data;
          var groups = new Set(comment.replyComments.map(item => item.thread));
          comment.replyCommentsGroup = [];
          groups.forEach(g =>
            comment.replyCommentsGroup.push({
              thread: g,
              values: comment.replyComments.filter(i => i.thread === g)
            })
          );
           
        },
        (error=>{
          console.log(error);
        }));
      }
    }
  }
  nextCommentPage(poll_id) { }
  deleteReplyModal(rcomment, comment, poll) {
    const initialState = {
      title: "Modal with component"
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.content.alertTitle = "Alert";
    this.bsModalRef.content.content =
      "Are you sure? Do you want to Delete this Reply ?";
    this.bsModalRef.content.onClose = myData => {
      this.bsModalRef.hide();
      var commentObj = {
        commentid: comment._id
      };
      forkJoin(
        this.pService.deletereplycomment(rcomment._id),
        this.pService.decrementreplycommentcount(commentObj)
      ).subscribe(data => {
        var index = comment.replyComments.indexOf(rcomment);
        comment.replyComments.splice(index, 1);
        comment.replyCount -= 1;
      },
      (error=>{
        console.log(error);
      }));
    };
  }
  UploadFilesPrivateReplyComments(comment, pollid) {
    for (var i = 0; i < comment.FilesArray.length; i++) {
      var type = comment.FilesArray[i].type;
      this.uploadService.uploadFile(comment.FilesArray[i]).then(
        pased => {
          var single = {
            url: pased.Location,
            type: type
          };
          comment.FileUrls.push(single);
          if (comment.FilesArray.length === comment.FileUrls.length) {
            this.savePrivateReplyComment(true, comment, pollid);
          }
        },
        err => {
          this.savePrivateReplyComment(false, comment, pollid);
        }
      );
    }
  }
  initiateCommentReply_pollinfo(comment, poll) {
     
    if (comment.FilesArray.length > 0)
      this.UploadFilesPrivateReplyComments(comment, poll._id);
    else {
      this.FileUrls = [];
      this.savePrivateReplyComment(true, comment, poll._id);
    }
  }
  savePrivateReplyComment(flag, comment, pollid) {
    var commentObj = {
      replycomment: this.replyForm.controls["replyCommentPrivate"].value,
      user: localStorage.getItem("userId"),
      poll: pollid,
      thread: localStorage.getItem("userId"),
      comment: comment._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      files: comment.FileUrls
    };
    var incobj = {
      commentid: comment._id
    };
    var notifcation = {
      type: "COMMENT_REPLY",
      notifyTo: comment.user._id,
      pollId: this.poll._id,
      createdBy: this.userProfile(),
      message: "",
      isRead: false,
      isViewed: false,
      createdAt: new Date(),
      commentId: comment._id,
      privateSite:true,
      updatedAt: new Date(),
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    };
    if (comment.user._id === localStorage.getItem('userId')) {
      return forkJoin(
        this.pService.postcommentreply(commentObj),
        this.pService.incrementreplycommentcount(incobj),
      ).subscribe(data => {
        var docs: any = data;
        var tempComment = {
          _id: docs[0]._id,
          user: this.userProfile(),
          replycomment: this.replyForm.controls["replyCommentPrivate"].value,
          poll: pollid,
          thread: localStorage.getItem("userId"),
          comment: comment._id,
          createdAt: new Date(),
          updatedAt: new Date(),
          files: comment.FileUrls,
          pollster: this.poll.pollster._id,
          type: "Private",
          commentType: "Initiate"
        };
        this.pService.sendCommentReply(tempComment);
        this.replyForm.controls["replyCommentPrivate"].setValue("");
        comment.urls = [];
        comment.FileUrls = [];
        comment.FilesArray = [];
        comment.replyComments.unshift(tempComment);
        comment.showInitReply = true;
        var groups = new Set(comment.replyComments.map(item => item.thread));
        comment.replyCommentsGroup = [];
        groups.forEach(g =>
          comment.replyCommentsGroup.push({
            thread: g,
            values: comment.replyComments.filter(i => i.thread === g)
          })
        );
         
      },
      (error=>{
        console.log(error);
      }));
    }
    else {
      this.pService.sendNotifcation(notifcation);
      return forkJoin(
        this.pService.postcommentreply(commentObj),
        this.pService.incrementreplycommentcount(incobj),
        this.pService.saveNofication(notifcation)
      ).subscribe(data => {
        var docs: any = data;
        var tempComment = {
          _id: docs[0]._id,
          user: this.userProfile(),
          replycomment: this.replyForm.controls["replyCommentPrivate"].value,
          poll: pollid,
          thread: localStorage.getItem("userId"),
          comment: comment._id,
          createdAt: new Date(),
          updatedAt: new Date(),
          files: comment.FileUrls,
          pollster: this.poll.pollster._id,
          type: "Private",
          commentType: "Initiate"
        };
        this.pService.sendCommentReply(tempComment);
        this.replyForm.controls["replyCommentPrivate"].setValue("");
        comment.urls = [];
        comment.FileUrls = [];
        comment.FilesArray = [];
        comment.replyComments.unshift(tempComment);
        comment.showInitReply = true;
        var groups = new Set(comment.replyComments.map(item => item.thread));
        comment.replyCommentsGroup = [];
        groups.forEach(g =>
          comment.replyCommentsGroup.push({
            thread: g,
            values: comment.replyComments.filter(i => i.thread === g)
          })
        );
         
      },
      (error=>{
        console.log(error);
      }));
    }

  }
  deleteCommentReply_pollinfo(comment, rcomment) {
    const initialState = {
      title: "Modal with component"
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.content.alertTitle = "Alert";
    this.bsModalRef.content.content =
      "Are you sure? Do you want to Delete this Reply ?";
    this.bsModalRef.content.onClose = myData => {
      this.bsModalRef.hide();
      var commentObj = {
        commentid: comment._id
      };
      forkJoin(
        this.pService.deletereplycomment(rcomment._id),
        this.pService.decrementreplycommentcount(commentObj)
      ).subscribe(data => {
        var index = comment.replyComments.indexOf(rcomment);
        comment.replyComments.splice(index, 1);
        comment.replyCount -= 1;
        var groups = new Set(comment.replyComments.map(item => item.thread));
        comment.replyCommentsGroup = [];
        groups.forEach(g =>
          comment.replyCommentsGroup.push({
            thread: g,
            values: comment.replyComments.filter(i => i.thread === g)
          })
        );
      },
      (error=>{
        console.log(error);
      }));
    };
  }
  UploadFilesPrivateReplyCommentsThread(comment, pollid, rcomment) {
    for (var i = 0; i < comment.FilesArray.length; i++) {
      var type = comment.FilesArray[i].type;
      this.uploadService.uploadFile(comment.FilesArray[i]).then(
        pased => {
          var single = {
            url: pased.Location,
            type: type
          };
          comment.FileUrls.push(single);
          if (comment.FilesArray.length === comment.FileUrls.length) {
            this.savePrivateReplyCommentThead(true, comment, pollid, rcomment);
          }
        },
        err => {
          this.savePrivateReplyCommentThead(false, comment, pollid, rcomment);
        }
      );
    }
  }
  addCommentReplyInThread_pollinfo(comment, poll, rcomment) {
     
    if (comment.FilesArray.length > 0)
      this.UploadFilesPrivateReplyCommentsThread(comment, poll._id, rcomment);
    else {
      this.FileUrls = [];
      this.savePrivateReplyCommentThead(true, comment, poll._id, rcomment);
    }
  }
  savePrivateReplyCommentThead(flag, comment, pollid, rcomment) {
    var commentObj = {
      replycomment: this.replyForm.controls["replyCommentPrivate"].value,
      user: localStorage.getItem("userId"),
      poll: pollid,
      thread: rcomment.thread,
      comment: comment._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      files: comment.FileUrls
    };
    var incobj = {
      commentid: comment._id
    };
    var notifcation = {
      type: "COMMENT_REPLY",
      notifyTo: comment.user._id,
      pollId: this.poll._id,
      createdBy: this.userProfile(),
      message: "",
      isRead: false,
      isViewed: false,
      createdAt: new Date(),
      privateSite:true,
      commentId: comment._id,
      updatedAt: new Date()
    };
    if (comment.user._id === localStorage.getItem('userId')) {
      return forkJoin(
        this.pService.postcommentreply(commentObj),
        this.pService.incrementreplycommentcount(incobj),
      ).subscribe(data => {
        var docs: any = data;
        var tempComment = {
          _id: docs[0]._id,
          user: this.userProfile(),
          replycomment: this.replyForm.controls["replyCommentPrivate"].value,
          poll: pollid,
          thread: rcomment.thread,
          comment: comment._id,
          createdAt: new Date(),
          updatedAt: new Date(),
          files: comment.FileUrls,
          pollster: this.poll.pollster._id,
          type: "Private",
          commentType: "Thread"
        };
        this.pService.sendCommentReply(tempComment);
        this.replyForm.controls["replyCommentPrivate"].setValue("");
        comment.urls = [];
        comment.FileUrls = [];
        comment.FilesArray = [];
        comment.replyComments.unshift(tempComment);
        comment.showInitReply = true;
        var index = this.Comments.map((x) => {
          return x._id;
        }).indexOf(comment._id);
        var GroupIndex = this.Comments[index].replyCommentsGroup.map(function (x) { return x.thread }).indexOf(tempComment.thread)
        this.Comments[index].replyCommentsGroup[GroupIndex].values.unshift(tempComment);
         
      },
      (error=>{
        console.log(error);
      }));
    }
    else {
      this.pService.sendNotifcation(notifcation);
      return forkJoin(
        this.pService.postcommentreply(commentObj),
        this.pService.incrementreplycommentcount(incobj),
        this.pService.saveNofication(notifcation)
      ).subscribe(data => {
        var docs: any = data;
        var tempComment = {
          _id: docs[0]._id,
          user: this.userProfile(),
          replycomment: this.replyForm.controls["replyCommentPrivate"].value,
          poll: pollid,
          thread: rcomment.thread,
          comment: comment._id,
          createdAt: new Date(),
          updatedAt: new Date(),
          files: comment.FileUrls,
          pollster: this.poll.pollster._id,
          type: "Private",
          commentType: "Thread"
        };
        this.pService.sendCommentReply(tempComment);
        this.replyForm.controls["replyCommentPrivate"].setValue("");
        comment.urls = [];
        comment.FileUrls = [];
        comment.FilesArray = [];
        comment.replyComments.unshift(tempComment);
        comment.showInitReply = true;
        var index = this.Comments.map(function (x) {
          return x._id;
        }).indexOf(comment._id);
        var GroupIndex = this.Comments[index].replyCommentsGroup.map(function (x) { return x.thread }).indexOf(tempComment.thread)
        this.Comments[index].replyCommentsGroup[GroupIndex].values.unshift(tempComment);
         
      },
      (error=>{
        console.log(error);
      }));
    }

  }

  removeItems() {
    localStorage.removeItem(this.siteName + '_privateSiteName')
    localStorage.removeItem(this.siteName + '_privateSiteLogo')
    localStorage.removeItem(this.siteName + '_privateSiteDesc');
    localStorage.removeItem(this.siteName + '_privateSiteContact');
    localStorage.removeItem(this.siteName + '_privateSiteUserId');
    localStorage.removeItem(this.siteName + '_privateSiteOwnerId');
    localStorage.removeItem(this.siteName + '_privateSiteUsername');
    localStorage.removeItem(this.siteName + '_privateSiteId');
    localStorage.removeItem('messagePermission');
    localStorage.removeItem('privateSite');
    localStorage.removeItem(this.siteName + '_siteOwnerId');
    localStorage.removeItem(this.siteName + '_privateSiteOwner')
    localStorage.removeItem(this.siteName + '_siteUserId');
    this.auth.isPrivateSite = "No";
  }

  openImageFullScreen(url) {
    let files = [
      {
        id: "",
        source: url,
        name: "",
        type: "image",
      }
    ]

    this.dialog.open(FilePreviewComponent, {
      data: {
        files: files,
        index: 0
      },
      panelClass: 'file-preview',
      disableClose: true
    });

  }

  goToLink(link) {
    if (link === "") {
      return;
    }
    window.open(link, "_blank");
  }

  // Checks if user is in private site
  privateSiteCheck() {
    let httpLink = window.location.pathname.split('/');
    if (localStorage.getItem("privateSite") === "true" && httpLink[1] === "privatesites") { // Checks localStorage and parses current page link
      return true;
    }
    return false;
  }

  getTagPolls(tag) {
    if (this.privateSiteCheck()) {
      this._router.navigateByUrl("/privatesites/" + this.siteName +"/search/tag?query=" + tag);
      return;
    }
    this._router.navigateByUrl("/search/tag?query=" + tag);
  }
}
