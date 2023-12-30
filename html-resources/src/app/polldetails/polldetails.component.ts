import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { PolldetailsService } from "./polldetails.service";
import * as moment from "moment";
import * as _ from "lodash";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { forkJoin } from "rxjs";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ModalComponent } from "../modal/modal.component";
import { DomSanitizer } from "@angular/platform-browser";
import { Socket } from "ngx-socket-io";
import { AuthService } from "../auth.service";
import { SignupComponent } from "../signupmodal/signupmodal.component";
import { CookieService } from "ngx-cookie-service";
import { EmbedVideoService } from "ngx-embed-video";
import { PollinfoService } from "../pollinfo/pollinfo.service";
import { UserprofileService } from "../userprofile/userprofile.service";
import { PrivatesiteHomeService } from "../privatesite-home/privatesite-home.service";
import { UploadService } from "../shared-services/upload.service";
import { SharedService } from "../shared-services/shared.service";

@Component({
  selector: "app-polldetails",
  templateUrl: "./polldetails.component.html",
  styleUrls: ["./polldetails.component.scss"],
  preserveWhitespaces: false
})
export class PolldetailsComponent implements OnInit {
  displayAds: Boolean = false;
  displayArticleFiles = [];
  polldata;
  minDate;
  BroadCastisCollapsed = true;
  userId;
  date;
  location = "current";
  country;
  displayFiles: any = [];
  isExpiryEditable = false;
  activeTab = "MORE_INFO";
  urls: any = [];
  FileUrls = [];
  broadcastInfo: any = [];
  FilesArray = [];
  bsModalRef: BsModalRef;
  commentForm: FormGroup;
  replyForm: FormGroup;
  broadcastDescription = "";
  Comments: any = [];
  maxFileError = false;
  maxFileCount = false;
  broadcastSuccess = false;
  broadcastError;
  broadcastPopup = false;
  siteName: string;
  constructor(
    private route: ActivatedRoute,
    private pService: PolldetailsService,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private sanitizer: DomSanitizer,
    public _router: Router,
    private socket: Socket,
    private embedService: EmbedVideoService,
    private cookieService: CookieService,
    public auth: AuthService,
    private pollInfoService: PollinfoService,
    private userProfileService: UserprofileService,
    private privateSiteHomeService: PrivatesiteHomeService,
    private uploadService: UploadService,
    private sharedService: SharedService
  ) {
    this.socket.fromEvent<any>("Comment").subscribe(data => {
      if (
        this.polldata._id === data.poll &&
        data.user._id != localStorage.getItem("userId")
      ) {
        var regex = "^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+";
          if ((data.comment).replace(/\s/g, "").match(regex)){
            data.youtubeUrl=this.embedService.embed(data.comment.replace(/\s/g, ""));
          }
          this.Comments.unshift(data);
          this.polldata.pollCommentCount+=1;
      }
    },
    (error=>{
      console.log(error);
    }));
    this.socket.fromEvent<any>("CommentReply").subscribe(data => {
      if (
        this.polldata._id === data.poll &&
        data.user._id != localStorage.getItem("userId")
      ) {
        var index = this.Comments.map(function(x) {
          return x._id;
        }).indexOf(data.comment);
        if(index<0)
          return;
          var regex = "^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+";
          if ((data.replycomment).replace(/\s/g, "").match(regex)){
            data.youtubeUrl=this.embedService.embed(data.replycomment.replace(/\s/g, ""));
          }
            if (data.type === "Public") {
              if (index >= 0) this.Comments[index].replyComments.unshift(data);
            }
            else if(data.type==="Private" && this.userId === data.pollster ){
              if (index >= 0) this.Comments[index].replyComments.unshift(data);

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
              else if(data.commentType==="Thread"){
                var GroupIndex=this.Comments[index].replyCommentsGroup.map(function(x){return x.thread}).indexOf(data.thread)
                this.Comments[index].replyCommentsGroup[GroupIndex].values.unshift(data);
              }
            }
            else if(data.type==="Private" && this.userId !== data.pollster && data.commentType==="Thread" && data.thread === localStorage.getItem('userId'))
            {
              var GroupIndex=this.Comments[index].replyCommentsGroup.map(function(x){return x.thread}).indexOf(data.thread)
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
    if (link[1] === 'privatesites') {
      this.siteName = link[2];
    }
    this.commentForm = this.fb.group({
      homeComment: ["", Validators.required],
      broadcastComment: ["", Validators.required],
      replyBroadcast: ["", Validators.required]
    });
    this.replyForm = this.fb.group({
      replyComment: ["", Validators.required],
      replyCommentPrivate: ["", Validators.required]
    });
     
    this.minDate = new Date();
    this.userId = localStorage.getItem("userId");
    if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
      this.userId = localStorage.getItem(this.siteName + '_privateSiteUserId');
    }
    if (link.length > 1 && (link[3] === "poll")) {
      var pollId = link[4];
      this.privateSiteHomeService.getPrivateSiteFromURL(link[2]).subscribe(data => {
        if (localStorage.getItem('userId') === data[0]['ownerId']){
          localStorage.setItem(this.siteName + '_privateSiteName', data[0]['settings']['siteName'])
          localStorage.setItem(this.siteName + '_privateSiteLogo', data[0]['settings']['siteLogo'])
          localStorage.setItem(this.siteName + '_privateSiteDesc', data[0]['settings']['siteDescription']);
          localStorage.setItem(this.siteName + '_privateSiteContact', data[0]['settings']['siteContact']);
          localStorage.setItem(this.siteName + '_privateSiteUserId', data[0]['virtualUser']);
          localStorage.setItem(this.siteName + '_privateSiteOwnerId', data[0]['ownerId']);
          localStorage.setItem(this.siteName + '_privateSiteUsername', localStorage.getItem('userName'));
          localStorage.setItem('messagePermission', "true");
          localStorage.setItem('privateSite', "true");
          localStorage.setItem(this.siteName + '_siteOwnerId', data[0]['ownerId']);
          localStorage.setItem(this.siteName + '_privateSiteOwner', data[0]['firstName'] + " " + data['lastName']);
          localStorage.setItem(this.siteName + '_siteUserId', data[0]['virtualUser']);
          this.auth.isPrivateSite = "Yes";
        } else {
            var id = data["_id"];
            localStorage.setItem(this.siteName + '_privateSiteName', data[0]['settings']['siteName'])
            localStorage.setItem(this.siteName + '_privateSiteLogo', data[0]['settings']['siteLogo'])
            localStorage.setItem(this.siteName + '_privateSiteDesc', data[0]['settings']['siteDescription']);
            localStorage.setItem(this.siteName + '_privateSiteContact', data[0]['settings']['siteContact']);
            localStorage.setItem(this.siteName + '_siteUserId', data[0]['virtualUser']);
            localStorage.setItem(this.siteName + '_siteOwnerId', data[0]['ownerId']);
            localStorage.setItem('messagePermission', "true");
            localStorage.setItem('privateSite', "true");
            this.auth.isPrivateSite = "Yes";
            let subscriptionObj = {
              id: localStorage.getItem("userId"),
              userid: data[0]["virtualUser"],
              privateSiteId: data[0]["virtualUser"]
            };
  
            this.userProfileService.getSubscrptionStatus(subscriptionObj).subscribe(subscriptionStatus => {
              if (subscriptionStatus['result'] === false) {
                this._router.navigateByUrl("/privatesites/" + localStorage.getItem(this.siteName + '_privateSiteName'));
              } else if (subscriptionStatus["data"][0]["status"] === ("PENDING" || "CANCELLED" || "UNSUBSCRIBE")) {
                this._router.navigateByUrl("/privatesites/" + localStorage.getItem(this.siteName + '_privateSiteName'));
              }
            });
        }
        if (localStorage.getItem("userId") === localStorage.getItem(this.siteName + '_siteOwnerId')) {
          var pollinfo = {
            pollid: pollId,
            id: localStorage.getItem("userId")
          };
          if (this.privateSiteCheck()) {
            if (localStorage.getItem('userId') === localStorage.getItem(this.siteName + '_privateSiteOwnerId')) {
              pollinfo.id = localStorage.getItem(this.siteName + "_privateSiteUserId");
            } else {
              pollinfo.id = localStorage.getItem("userId");
            }
          }
          if (this.activeTab === "MORE_INFO") {
            this.getData1(pollinfo);
          } else {
            this.getData2(pollinfo);
          }
        } else {
          // Get subscription status
          var subscriptionObj = {
            id: localStorage.getItem("userId"),
            userid: data[0]["virtualUser"],
            privateSiteId: data[0]["virtualUser"]
          };

          this.userProfileService.getSubscrptionStatus(subscriptionObj).subscribe(subscriptionStatus => {
            if (subscriptionStatus["result"] === true) {
              this.auth.isPrivateSite = "Yes";
              var pollinfo = {
                pollid: pollId,
                id: localStorage.getItem("userId")
              };
              if (this.privateSiteCheck()) {
                if (localStorage.getItem('userId') === localStorage.getItem(this.siteName + '_privateSiteOwnerId')) {
                  pollinfo.id = localStorage.getItem(this.siteName + "_privateSiteUserId");
                } else {
                  pollinfo.id = localStorage.getItem("userId");
                }
              }
              if (this.activeTab === "MORE_INFO") {
                this.getData1(pollinfo);
              } else {
                this.getData2(pollinfo);
              }
            } else {
              this._router.navigate(["/privatesites/" + data[0]['settings']['siteName']], { state: {id: data[0]["_id"]}});
            }
          });
        }
      });
    } else {
      if (localStorage.getItem(this.siteName + "_privateSiteUserId")) {
        this.userId = localStorage.getItem(this.siteName + "_privateSiteUserId");
      }
      this.route.params.subscribe(data => {
        if (this.cookieService.get("type")) {
          this.activeTab=this.cookieService.get('type');
          this.cookieService.delete("type");
        }
        var pollinfo = {
          pollid: data.id,
          id: localStorage.getItem("userId")
        };
        if (this.privateSiteCheck()) {
          if (localStorage.getItem('userId') === localStorage.getItem(this.siteName + '_privateSiteOwnerId')) {
            pollinfo.id = localStorage.getItem(this.siteName + "_privateSiteUserId");
          } else {
            pollinfo.id = localStorage.getItem("userId");
          }
        }
        if (this.activeTab === "MORE_INFO") {
          this.getData1(pollinfo);
        } else {
          this.getData2(pollinfo);
        }
      },
      (error=>{
        console.log(error);
      }));
    }

    // Get global configurations for settings
    let configurations = {};
    configurations = this.sharedService.getConfigurations()
    if (configurations != {}) {
      this.displayAds = (configurations["show_google_ads"]) ? configurations["show_google_ads"] : this.displayAds;
    }
  }
  converUrl(url){
    return this.embedService.embed(url.replace(/\s/g, ""))
  }
  setHeader(){
    if(localStorage.getItem("privateSite")==="true"){
      this.auth.isPrivateSite="Yes";
    }else{
      this.auth.isPrivateSite="No";
      
    }
  }
  getData1(pollinfo) {
    this.displayArticleFiles = [];
    if (this.privateSiteCheck()) {
      return forkJoin(
        this.pService.getPrivatePollDetails(pollinfo),
        this.pService.getPrivatecommments(pollinfo),
        this.pService.getPrivateSubscriberPollDetails(pollinfo)
      ).subscribe(data => {
        var docs: any;
        if (data[0][0] === undefined) {
          docs = data[2];
        } else {
          docs = data[0];
        }
        if(docs[0].privateSite)
          this.setHeader();  

         
        this.polldata = docs[0];
        this.country = this.polldata.country;
        this.date = moment(this.polldata.expires).format("MM-DD-YYYY");
        if (this.minDate <= this.date) this.minDate = this.date;
        if (this.polldata.articleInfo != null) {
          this.polldata.articleInfo.forEach(element => {
            if (element.files && element.files.length > 0) {
              Array.prototype.push.apply(this.displayFiles, element.files);
            }
            if (element.description != null && element.description != undefined) {
              var regex = "^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+";
              var text='\">';            
              if(element.description.indexOf("href") !=-1){
                  element.description = element.description.substring(
                   element.description.indexOf("=") + 2, 
                   element.description.lastIndexOf(text)
                  );
              }
              if (element.description.match(regex)) {
                var obj = {
                  url: element.description,
                  type: "youtube"
                };
                this.displayFiles.push(obj)
                element.youtubeUrl = this.converUrl(element.description);
              } else {
                var regex = "^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$";
                if (element.description.match(regex)) {
                  return new Promise((res, rej) => {
                    this.pollInfoService.getMetaData(element.description).subscribe(response => {
                       
                      if (response["result"]) {
                        let ogObj = {};
                        if (response['data']['image']) {
                          ogObj["image"] = response['data']['image']['url'];
                        } else {
                          ogObj["image"] = "";
                        }
                        ogObj["title"] = response['data']["title"];
                        ogObj["description"] = response['data']["description"];
                        ogObj["url"] = response['data']["url"];
                        this.displayArticleFiles.push(ogObj);
                      } else {
                        let ogObj = {};
                        ogObj["image"] = ""
                        ogObj["title"] = ""
                        ogObj["description"] = ""
                        ogObj["url"] = element.description;
                        this.displayArticleFiles.push(ogObj)
                      }
                    })
                  });
                } else {
                  let ogObj = {};
                  ogObj["image"] = ""
                  ogObj["title"] = ""
                  ogObj["description"] =element.description;
                  ogObj["url"] = ""
                  this.displayArticleFiles.push(ogObj);
                }
              }
            }
          });
        }

         
        this.Comments = data[1];
        this.Comments.forEach(element => {
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

          if (localStorage.getItem("privateSite") === "true") {
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
    } else {
      return forkJoin(
        this.pService.getPollDetails(pollinfo),
        this.pService.getcommments(pollinfo)
      ).subscribe(data => {
        var docs:any = data[0];
        if(docs[0].privateSite)
          this.setHeader();      
         
        this.polldata = docs[0];
        this.country = this.polldata.country;
        this.date = moment(this.polldata.expires).format("MM-DD-YYYY");
        if (this.minDate <= this.date) this.minDate = this.date;
        if (this.polldata.articleInfo != null) {
          this.polldata.articleInfo.forEach(element => {
            if (element.files && element.files.length > 0) {
              Array.prototype.push.apply(this.displayFiles, element.files);
            }
            if (element.description != null && element.description != undefined) {
              var regex = "^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+";
              var text='\">';            
              if(element.description.indexOf("href") !=-1){
                  element.description = element.description.substring(
                   element.description.indexOf("=") + 2, 
                   element.description.lastIndexOf(text)
                  );
              }
              if (element.description.match(regex)) {
                var obj = {
                  url: element.description,
                  type: "youtube"
                };
                this.displayFiles.push(obj);
                element.youtubeUrl = this.converUrl(element.description);
              } else {
                var regex = "^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$";
                if (element.files.length === 0) {
                  if (element.description.match(regex)) {
                    return new Promise((res, rej) => {
                       
                      this.pollInfoService.getMetaData(element.description).subscribe(response => {
                         
                        if (response["result"]) {
                          let ogObj = {};
                          if (response['data']['image']) {
                            ogObj["image"] = response['data']['image']['url'];
                          } else {
                            ogObj["image"] = "";
                          }
                          ogObj["title"] = response['data']["title"];
                          ogObj["description"] = response['data']["description"];
                          ogObj["url"] = response['data']["url"];
                          this.displayArticleFiles.push(ogObj);
                        } else {
                          let ogObj = {};
                          ogObj["image"] = ""
                          ogObj["title"] = ""
                          ogObj["description"] = ""
                          ogObj["url"] = element.description;
                          this.displayArticleFiles.push(ogObj);
                        }
                      })
                    });
                  } else {
                    let ogObj = {};
                    ogObj["image"] = ""
                    ogObj["title"] = ""
                    ogObj["description"] = element.description;
                    ogObj["url"] = "";
                    if (element.description.length > 0) {
                      this.displayArticleFiles.push(ogObj);
                    }
                  }
                }
              }
            }
          });
        }
         
        this.Comments = data[1];
        this.Comments.forEach(element => {
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
        });
        // console.log(this.Comments);
      },
      (error=>{
        console.log(error);
      }));
    }
    
  }
  getData2(pollinfo) {
    return forkJoin(
      this.pService.getPollDetails(pollinfo),
      this.pService.getbroadcasts(pollinfo),
      this.pService.getprivatebroadcasts(pollinfo),
      this.pService.getPrivatePollDetails(pollinfo),
    ).subscribe(data => {
      // console.log(data);
      var docs:any = data[0];
      var broad = data[1];
      if (docs[0] !== undefined) {
        if(docs[0].privateSite)
        this.setHeader()
      }
      this.broadcastInfo = data[1];
      // this.broadcastInfo = this.broadcastInfo.concat(data[2]);
      this.broadcastInfo.forEach(element => {
        element.broadcastReplies = [];
        element.isCollapsed = true;
        element.broadcastRepliesGruop = [];
      });
       
        if (docs[0] !== undefined) {
          this.polldata = docs[0];
          this.country = this.polldata.country;
          this.date = moment(this.polldata.expires).format("MM-DD-YYYY");
          if (this.minDate <= this.date) this.minDate = this.date;
           
        } else {
          return;
        }
    },
    (error=>{
      console.log(error);
    }));
  }
  onFileChange(event) {
    this.maxFileCount = false;
    this.maxFileError = false;
    this.urls = [];
    if (event.target.files.length >= 11) {
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
    if (event.target.files.length >= 11) {
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
      notifyTo: this.polldata.pollster._id,
      pollId: this.polldata._id,
      createdBy: this.userProfile(),
      message: "",
      isRead: false,
      isViewed: false,
      privateSite:false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    var privateSite=localStorage.getItem("privateSite");
    if(privateSite){
      notifcation.privateSite=true;
    }
    if(this.polldata.pollster.id===localStorage.getItem('userId')){
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
          files: this.FileUrls,
          isCollapsed: true,
          youtubeUrl:"",
          urls: [],
          FileUrls: [],
          FilesArray: [],
          replyComments: [],
          replyCommentsGroup: []
        };
        var regex = "^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+";
        if ((this.commentForm.controls["homeComment"].value).replace(/\s/g, "").match(regex)) {
          tempComment.youtubeUrl=this.embedService.embed((this.commentForm.controls["homeComment"].value).replace(/\s/g, ""))
        }
        this.pService.sendComment(tempComment);
        this.commentForm.controls["homeComment"].setValue("");
        this.urls = [];
        this.FileUrls = [];
        this.FilesArray = [];
        this.Comments.unshift(tempComment);
        this.polldata.pollCommentCount += 1;
         
      },
      (error=>{
        console.log(error);
      }));
    }
    else{
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
          youtubeUrl:"",
          urls: [],
          FileUrls: [],
          FilesArray: [],
          replyComments: [],
          replyCommentsGroup: []
        };
        var regex = "^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+";
        if ((this.commentForm.controls["homeComment"].value).replace(/\s/g, "").match(regex)) {
          tempComment.youtubeUrl=this.embedService.embed((this.commentForm.controls["homeComment"].value).replace(/\s/g, ""))
        }
        this.pService.sendComment(tempComment);
        this.commentForm.controls["homeComment"].setValue("");
        this.urls = [];
        this.FileUrls = [];
        this.FilesArray = [];
        this.Comments.unshift(tempComment);
        this.polldata.pollCommentCount += 1;
         
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
        data.userName = "";
      }
    }
    return data;
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
  addCommentt(pollid) {
    if(!this.auth.isLoggedIn())
    {
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
  extendExpiry() {
    if (this.isExpiryEditable) {
      this.date = moment(this.polldata.expires).format("MM-DD-YYYY");
      var data = {
        id: this.polldata._id,
        expires: this.polldata.expires
      };
      this.pService.updatePollExpire(data).subscribe(docs => {
      },
      (error=>{
        console.log(error);
      }));
    }
    this.isExpiryEditable = !this.isExpiryEditable;
  }
  closeThisDialog(poll) {
    if (localStorage.getItem('privateSite') === "true") {
      this.auth.isPrivateSite = "Yes";
      this._router.navigateByUrl("/privatesites/" + localStorage.getItem(this.siteName + '_privateSiteName'))
    } else {
      if(this.cookieService.get('navtype')==='privatesite')
        this._router.navigateByUrl("/privatesites/" + localStorage.getItem(this.siteName + '_privateSiteName'))
      else  {
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
    }
    
  }
  cleararticleModal(index) {
    const initialState = {
      title: "Modal with component"
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.content.alertTitle = "Alert";
    this.bsModalRef.content.content =
      "Are you sure? Do you want to delete this article ?";
    this.bsModalRef.content.onClose = myData => {
      this.bsModalRef.hide();
      this.displayFiles.pop();
      this.polldata.articleInfo.splice(index,1);
      var dataDelete={
        id:this.polldata._id,
        article:this.polldata.articleInfo
      }
      this.pService.deleteArtile(dataDelete).subscribe(data=>{
      },
      (error=>{
        console.log(error);
      }));
    };
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
        this.polldata.pollCommentCount -= 1;
      },
      (error=>{
        console.log(error);
      }));
    };
  }
  replyCommentData1(comment) {
    if(!this.auth.isLoggedIn())
    {
      this.openModalWithComponent(false);
      return;
    }
    var data = {
      commentid: comment._id
    };
    if (!comment.isCollapsed) {
       
      this.pService.getcommentreplies(data).subscribe(data => {
         
        comment.replyComments = data;
        comment.replyComments.forEach(element => {
          var regex = "^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+";
              if ((element.replycomment).replace(/\s/g, "").match(regex)){
                element.youtubeUrl=this.embedService.embed(element.replycomment.replace(/\s/g, ""));
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
      pollId: this.polldata._id,
      createdBy: this.userProfile(),
      message: "",
      isRead: false,
      isViewed: false,
      privateSite:false,
      createdAt: new Date(),
      commentId: comment._id,
      updatedAt: new Date()
    };
    var privateSite=localStorage.getItem("privateSite");
    
    if(privateSite){
      notifcation.privateSite=true;
    }
    if(comment.user._id===localStorage.getItem('userId')){
      return forkJoin(
        this.pService.postcommentreply(commentObj),
        this.pService.incrementreplycommentcount(incobj),
      ).subscribe(data => {
        var docs: any = data;
        var tempComment = {
          _id: docs[0]._id,
          user: this.userProfile(),
          replycomment: this.replyForm.controls["replyComment"].value,
          youtubeUrl:"",
          poll: pollid,
          thread: localStorage.getItem("userId"),
          comment: comment._id,
          createdAt: new Date(),
          updatedAt: new Date(),
          type:"Public",
          files: comment.FileUrls,
        };
        var regex = "^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+";
        if ((this.replyForm.controls["replyComment"].value).replace(/\s/g, "").match(regex)) {
          tempComment.youtubeUrl=this.embedService.embed((this.replyForm.controls["replyComment"].value).replace(/\s/g, ""))
        }
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
    else{
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
          youtubeUrl:"",
          updatedAt: new Date(),
          type:"Public",
          files: comment.FileUrls,
        };
        var regex = "^(http(s)?://)?((w){3}.)?youtu(be|.be)?(.com)?/.+";
        if ((this.replyForm.controls["replyComment"].value).replace(/\s/g, "").match(regex)) {
          tempComment.youtubeUrl=this.embedService.embed((this.replyForm.controls["replyComment"].value).replace(/\s/g, ""))
        }
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
    if(!this.auth.isLoggedIn()){
      this.openModalWithComponent(false);
      return
    }
    comment.isCollapsed=!comment.isCollapsed
    var data = {
      commentid: comment._id,
      thread: localStorage.getItem("userId")
    };
    if (comment.isCollapsed) {
      if (this.polldata.pollster._id === this.userId) {
         
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
  nextCommentPage(poll_id) {}
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
      pollId: this.polldata._id,
      createdBy: this.userProfile(),
      message: "",
      isRead: false,
      isViewed: false,
      createdAt: new Date(),
      privateSite:true,
      commentId: comment._id,
      updatedAt: new Date()
    };
    if(comment.user._id===localStorage.getItem('userId'))
    {
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
          type:"Private",
          commentType:"Initiate",
          files: comment.FileUrls
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
    else{
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
          type:"Private",
          commentType:"Initiate",
          files: comment.FileUrls
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
  deleteReply(article, comment, main, ind) {
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
      pollId: this.polldata._id,
      createdBy: this.userProfile(),
      message: "",
      isRead: false,
      isViewed: false,
      createdAt: new Date(),
      privateSite:true,
      commentId: comment._id,
      updatedAt: new Date()
    };
    if(comment.user._id===localStorage.getItem('userId')){
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
          type:"Private",
          commentType:"Thread",
          files: comment.FileUrls
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
    else{
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
          type:"Private",
          commentType:"Thread",
          files: comment.FileUrls
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
  clearFiles() {
    this.FileUrls = [];
    this.FilesArray = [];
    this.urls = [];
  }
  popoverControls() {
    this.broadcastPopup = !this.broadcastPopup;
  }
  UploadFilesBoradCast() {
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
            this.postBoradCast(true);
          }
        },
        err => {
          this.postBoradCast(false);
        }
      );
    }
  }
  postBoradCast(flag) {
    var polldata = this.polldata;
    var url = null;
    var type = null;
    if (this.FileUrls.length > 0) {
      (url = this.FileUrls[0].url), (type = this.FileUrls[0].type);
    }
    var broadcastdata = {
      pollster: polldata.pollster._id,
      poll: polldata._id,
      broadcast: {
        description: this.broadcastDescription,
        url: url,
        type: type
      },
      createdAt: new Date(),
      status: "Open"
    };
    forkJoin(
      this.pService.postbroadcast(broadcastdata),
    ).subscribe(data => {
      this.broadcastPopup = false;
      this.broadcastSuccess = true;
       
      var doc: any = data[0];
      doc.isCollapsed = true;
      this.broadcastInfo.unshift(doc);
      this.broadcastDescription = "";
      this.clearFiles();
      const initialState = {
        title: "Modal with component"
      };
      this.bsModalRef = this.modalService.show(ModalComponent, {
        initialState
      });
      this.bsModalRef.content.alertTitle = "Alert";
      this.bsModalRef.content.isCancel = true;
      this.bsModalRef.content.content =
        "Your broadcast message has been sent successfully";
      this.bsModalRef.content.onClose = myData => {
        this.bsModalRef.hide();
      };
    },
    (error=>{
      console.log(error);
    }));
  }
  initiateBroadcastReply(article) {
    var broadcastreply = {
      poll: this.polldata._id,
      broadcast: article._id,
      thread: localStorage.getItem("userId"),
      user: localStorage.getItem("userId"),
      comment: this.commentForm.controls["broadcastComment"].value,
      replytype: "initiator",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    var notifcation = {
      type: "BROADCAST_REPLY",
      notifyTo: this.polldata.pollster._id,
      pollId: this.polldata._id,
      createdBy: this.userProfile(),
      message: "",
      isRead: false,
      broadcastId: article._id,
      isViewed: false,
      privateSite:false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    var privateSite=localStorage.getItem("privateSite");
    
    if(privateSite){
      notifcation.privateSite=true;
    }
  this.pService.sendNotifcation(notifcation);
    forkJoin(this.pService.postbroadcastreply(broadcastreply),this.pService.saveNofication(notifcation)).subscribe(docs=>{
      var result: any = docs[1];
      var broadcastreplies = {
        _id: result._id,
        poll: this.polldata._id,
        broadcast: article._id,
        thread: localStorage.getItem("userId"),
        user: this.userProfile(),
        comment: this.commentForm.controls["broadcastComment"].value,
        replytype: "initiator",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      article.broadcastReplies.push(broadcastreplies);
      var groups = new Set(article.broadcastReplies.map(item => item.thread));
      article.broadcastRepliesGroup = [];
      groups.forEach(g =>
        article.broadcastRepliesGroup.push({
          thread: g,
          values: article.broadcastReplies.filter(i => i.thread === g)
        })
      );
      article.broadcastRepliesGroup.forEach(element => {
        element.values.reverse();
      });
      this.commentForm.controls["broadcastComment"].setValue("");
    });
  }
  addBroadcastReplyInThread(artile, comment, main) {
    var broadcastreply = {
      poll: this.polldata._id,
      broadcast: artile._id,
      thread: comment.thread,
      user: localStorage.getItem("userId"),
      comment: this.commentForm.controls["replyBroadcast"].value,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    var notifcation = {
      type: "BROADCAST_REPLY",
      notifyTo: this.polldata.pollster._id,
      pollId: this.polldata._id,
      createdBy: this.userProfile(),
      message: "",
      isRead: false,
      broadcastId: artile._id,
      isViewed: false,
      privateSite:false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    var privateSite=localStorage.getItem("privateSite");
    if(privateSite){
      notifcation.privateSite=true;
    }
  this.pService.sendNotifcation(notifcation);
    forkJoin(this.pService.postbroadcastreply(broadcastreply),this.pService.saveNofication(notifcation)).subscribe(docs => {
      var result: any = docs[1];
      var broadcastreplies = {
        _id: result._id,
        poll: this.polldata._id,
        broadcast: artile._id,
        thread: comment.thread,
        user: this.userProfile(),
        comment: this.commentForm.controls["replyBroadcast"].value,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      artile.broadcastRepliesGroup[main].values.push(broadcastreplies);
      this.commentForm.controls["replyBroadcast"].setValue("");
    });
  }
  openImageModal(url){

  }
  saveBroadcast() {
    this.broadcastSuccess = false;
    this.popoverControls();
     
    if (this.FilesArray.length === 0) {
      this.postBoradCast(true);
    } else this.UploadFilesBoradCast();
  }
  isFollow() {
    var FollowTopicArray = [];
    FollowTopicArray = this.polldata.pollSubscription.filter(item => {
      return item.includes(localStorage.getItem("userId"));
    });
    if (FollowTopicArray.length > 0) return true;
    return false;
  }
  navtoMyProfle() {
    this._router.navigate(["/profile/mytopics"]);
  }
  // navtoMyProfle() {
  //   this._router.navigate(["/userprofile/" + localStorage.getItem("userName")]);
  // }
  navtoUserProfle(user) {
    this._router.navigate(["/userprofile/" + user.userName]);
  }
  editButton;
  getBroadcastReplies(artcle) {
    var broadcast = {
      broadcast: artcle._id,
      pollster: localStorage.getItem("userId")
    };
    if (artcle.pollster._id === localStorage.getItem("userId")) {
      this.pService.getbroadcastrepliesthreadall(broadcast).subscribe(data => {
        artcle.broadcastReplies = data;
        var groups = new Set(artcle.broadcastReplies.map(item => item.thread));
        artcle.broadcastRepliesGroup = [];
        groups.forEach(g =>
          artcle.broadcastRepliesGroup.push({
            thread: g,
            values: artcle.broadcastReplies.filter(i => i.thread === g)
          })
        );
        artcle.broadcastRepliesGroup.forEach(element => {
          element.values.reverse();
        });
      },
      (error=>{
        console.log(error);
      }));
    } else {
      this.pService.getbroadcastrepliesthread(broadcast).subscribe(data => {
        artcle.broadcastReplies = data;
        var groups = new Set(artcle.broadcastReplies.map(item => item.thread));
        artcle.broadcastRepliesGroup = [];
        groups.forEach(g =>
          artcle.broadcastRepliesGroup.push({
            thread: g,
            values: artcle.broadcastReplies.filter(i => i.thread === g)
          })
        );
        artcle.broadcastRepliesGroup.forEach(element => {
          element.values.reverse();
        });
      },
      (error=>{
        console.log(error);
      }));
    }
  }
  changeTab() {
    this.BroadCastisCollapsed = false;
    var polldata = {
      pollid: this.polldata._id
    };
    this.clearFiles();
    if (this.activeTab === "BROADCAST") {
      this.activeTab="MORE_INFO";
      this.getData1(polldata);
      this.cookieService.set('type',"MORE_INFO");

    }
    else{
      this.activeTab=this.cookieService.get('type');
      this.activeTab="BROADCAST";
      this.cookieService.set('type',"BROADCAST");
      this.getData2(polldata);
    }
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
}
