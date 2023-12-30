import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "../auth.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { CreatetopicService } from '../createnewtopic/createtopic.service';
import { DomSanitizer } from "@angular/platform-browser";
import { MessagesService } from "./messages.service";
import { Component, OnInit, Renderer2, NgZone, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { WebcamImage } from 'ngx-webcam';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ModalComponent } from "../modal/modal.component";
import { CameramodalComponent } from '../cameramodal/cameramodal.component';
import { CookieService } from 'ngx-cookie-service';
import { ToasterService } from '../toast/toaster.service';
import { Socket } from "ngx-socket-io";
import { forkJoin } from "rxjs";
import { SubscribersService } from "../subscribers/subscribers.service";
import { saveAs as importedSaveAs } from "file-saver";
import { UploadFileModalComponent } from '../uploadFileModal/uploadFileModal.component';
import { MatDialog } from "@angular/material";
import { UploadService } from "../shared-services/upload.service";

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, AfterViewChecked {

  @ViewChild("scroll", {static: false}) public scroll: ElementRef;
  public webcamImage: WebcamImage = null;
  constraints = {
    video: {
      facingMode: "environment",
      width: { ideal: 4096 },
      height: { ideal: 2160 }
    }
  };
  @ViewChild('scrollBottom', {static: false}) scrollBottom: ElementRef;
  showDiv = false;
  videoHeight;
  videoWidth;

  isPrivateSite = "No";
  leftMenu = "groups";
  groupForm: FormGroup;
  editGroupForm: FormGroup;
  messageForm: FormGroup;
  groupLogoPic;
  groupLogoFile;
  saveValidity = false;
  usersList: any;
  trunumsUsersList: any;
  mainUsersList: any;
  addMemberList: any;
  mainGroupList: any;
  groupMembers = [];
  memberArray = [];
  groupsList: any;
  siderbarOne: boolean = false;
  groupId;
  fileDescription: string;
  siteOwnerId;
  messageInfo: any = [];
  searchedMessages: any;
  groupData: any = [];
  activeClass = false;
  loginUser;
  msgType;
  replyMessage;
  replyMsgId;
  selectedId;
  blocked: Boolean;
  selectedUserId;
  preview;
  maxFileError = false;
  maxFileCount = false;
  urls: any = [];
  FileUrls = [];
  FilesArray = [];
  bsModalRef: BsModalRef;
  memberMessage = false;
  selectedGroupName;
  blockedUsers: any = [];
  selectedType = null;
  messageData: any;
  showType = "view";
  displayType = "all";
  viewToast: boolean = false;
  liked = false;
  searchMsg = false;
  error: any;
  privateMemberSubscribers: any = [];
  groupedit = false;
  searchText;
  filterVal;
  fileUploaded: boolean;
  subscriptionList;
  me;
  selectedUserName: string;
  enableChatOption: boolean;
  blockedBy;
  enableForward: boolean = false;
  messageMobile: any;
  disableScrollDown: boolean = false;
  siteName: string;
  selectedProfilePicture: String = "";
  constructor(
    private router: Router,
    public authserve: AuthService,
    private cService: CreatetopicService,
    private sanitizer: DomSanitizer,
    private messageService: MessagesService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private modalService: BsModalService,
    private cookieService: CookieService,
    private toaster: ToasterService,
    private socket: Socket,
    private sService: SubscribersService,
    private dialog: MatDialog,
    readonly ngZone: NgZone,
    private uploadService: UploadService
  ) {
    authserve.privateSite.subscribe(isPrivateSite => {
      if (isPrivateSite || isPrivateSite === 'Yes') {
        this.isPrivateSite = isPrivateSite;
      }
      else {
        this.isPrivateSite = "No";
      }
    });


    this.socket.fromEvent<any>("Message").subscribe(data => {
      if (this.groupId === data["groupId"]) {
        this.messageInfo.push(data);
      } else if (data["userId"] === this.me && data["user"]["userName"] === this.selectedUserName && data["privateSite"] === localStorage.getItem('privateSite') && this.groupId === undefined || null ) {
        this.messageInfo.push(data);
      } else if ((data['user']['userName'] === localStorage.getItem('userName')) && this.groupId === undefined || null) {
        this.messageInfo.push(data);
      }
    },
      (error => {
        console.error(error);
      }));
    this.socket.fromEvent<any>("UserStatus").subscribe(data => {
      // this.messageInfo.push(data);
    },
      (error => {
        console.error(error);
      }));


  }

  ngOnInit() {
    this.onInit();
  }

  onInit() {
     
    let link = window.location.pathname.split('/');
    if (this.privateSiteCheck()) {
      this.siteName = link[2];
    }
    // this.viewToast = false;
    this.leftMenu = "groups";
    this.loginUser = localStorage.getItem('userId');
    if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
      this.loginUser = localStorage.getItem(this.siteName + '_privateSiteUserId');
    }
    if (this.privateSiteCheck()) {
      this.authserve.isPrivateSite = "Yes";
    } else {
      this.authserve.isPrivateSite = "No";
    }

    // Check if it is private site
    if (this.privateSiteCheck()) {
      // Check if user is owner
      if (localStorage.getItem('userId') === localStorage.getItem(this.siteName + '_siteOwnerId')) {
        var userData = {
          userId: localStorage.getItem(this.siteName + '_privateSiteUserId'),
          privateSiteId: localStorage.getItem(this.siteName + '_privateSiteUserId')
        };
        this.messageService.getPrivateSiteUsersForMessaging(userData).subscribe(res => {
          var result = Object.assign([], res);
          this.trunumsUsersList = result;
          this.mainUsersList = result;
          this.mainUsersList = result;
          this.usersList = result;
          this.addMemberList = this.trunumsUsersList;

          this.usersList = this.usersList.map(item => item.user);
          this.trunumsUsersList = this.usersList;
          this.subscriptionList = result;
          var sublength = this.subscriptionList.length;
          for (var i = 0; i < sublength; i++) {
            if (this.subscriptionList[i].isBlocked === true) {
              this.blockedUsers.push(this.subscriptionList[i].user._id);
            }
          }
        });
      } else {
        var user = {
          id: localStorage.getItem('userId'),
          privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
        };
        forkJoin(
        this.messageService.getMessageUsers(user),
        this.messageService.getMessageUsersBy(user),
        this.messageService.getPrivateSiteOwnerForMessaging(user)).subscribe((res: any) => {
           
          if (res[2] && res[2].length > 0) {
            var siteAdmin = res[2];
            siteAdmin[0]["user"]["firstName"] = localStorage.getItem(this.siteName + '_privateSiteName');
            siteAdmin[0]["user"]["lastName"] = "(Site Admin)";
            siteAdmin[0]["user"]["profilePicture"] = localStorage.getItem(this.siteName + '_privateSiteLogo');
            Array.prototype.push.apply(res[0], siteAdmin);
          }
          Array.prototype.push.apply(res[0], res[1]);
          this.mainUsersList = res[0];
          this.usersList = res[0];
          this.subscriptionList = res[0];
          var sublength = this.subscriptionList.length;
          for (var i = 0; i < sublength; i++) {
            if (this.subscriptionList[i].isBlocked === true) {
              this.blockedUsers.push(this.subscriptionList[i].user._id);
            }
            /* else {
              this.blockedUsers[i] = "";
            } */
          }
          this.usersList = this.usersList.map(item => item.user);
          this.trunumsUsersList = this.usersList;
          this.addMemberList = this.trunumsUsersList;
          if (localStorage.getItem('privateSite') === "false" && localStorage.getItem('userId') !== localStorage.getItem(this.siteName + '_privateSiteUserId')) {
            // this.trunumsUsersList = this.usersList.map(item => item.user);
            this.trunumsUsersList = this.usersList;
          }
        });
      }
    }

    if (this.privateSiteCheck()) {
      this.messageService.getMyPrivateGroups(this.loginUser, localStorage.getItem(this.siteName + '_siteUserId')).subscribe(data => {
         
        this.groupsList = data;
        this.mainGroupList = data;
        // if (this.groupsList && this.groupsList.length > 0) {
        //   this.groupDetails(data[0]._id, data);
        //   this.getMessagesForGroup(data[0]._id);
        // }
      });
      this.groupForm = this.fb.group({
        groupName: ['', [Validators.required]],
        // groupMembers: ['', [Validators.required]],
      });
      this.editGroupForm = this.fb.group({
        groupName: ['', [Validators.required]],
        // groupMembers: ['', [Validators.required]],
      });
      this.messageForm = this.fb.group({
        message: ['', [Validators.required]],
      })
    } else {
      this.messageService.getMyGroups(this.loginUser, localStorage.getItem(this.siteName + '_siteUserId')).subscribe(data => {
         
        var result = [];
        this.groupsList = [];
        this.mainGroupList = [];
        result = Object.assign([], data);
        result.forEach(element => {
          if (element.privateSiteId === null) {
            this.groupsList.push(element)
            this.mainGroupList.push(element);
          } else {
            return;
          }
        });
      });
      this.groupForm = this.fb.group({
        groupName: ['', [Validators.required]],
        // groupMembers: ['', [Validators.required]],
      });
      this.editGroupForm = this.fb.group({
        groupName: ['', [Validators.required]],
        // groupMembers: ['', [Validators.required]],
      });
      this.messageForm = this.fb.group({
        message: ['', [Validators.required]],
      })
    }

    // Display subscribers if user is private user and message permission true
    if (localStorage.getItem('privateSite') === null) {
      forkJoin(
        this.messageService.getMessageUsers({ id: localStorage.getItem('userId') }),
        this.messageService.getMessageUsersBy({ id: localStorage.getItem('userId') })
      ).subscribe(data => {
         
        Array.prototype.push.apply(data[0], data[1]);
        // this.usersList=(data[0]).concat(data[1]);
        this.mainUsersList = data[0];
        this.usersList = data[0];
        // this.trunumsUsersList = this.usersList;
        this.subscriptionList = data[0];
        var sublength = this.subscriptionList.length;
        for (var i = 0; i < sublength; i++) {
          if (this.subscriptionList[i].isBlocked === true) {
            this.blockedUsers.push(this.subscriptionList[i].user._id);
          }
          /* else {
            this.blockedUsers[i] = "";
          } */
        }
        this.usersList = this.usersList.map(item => {
          let user = item.user;
          user["blocked"] = item["isBlocked"];
          user["blockedBy"] = item["blockedBy"];
          return user;
        });
        this.trunumsUsersList = this.usersList;
        this.addMemberList = this.trunumsUsersList;
        if (localStorage.getItem('privateSite') === "false" && localStorage.getItem('userId') !== localStorage.getItem(this.siteName + '_privateSiteUserId')) {
          // this.trunumsUsersList = this.usersList.map(item => item.user);
          this.trunumsUsersList = this.usersList;
        }

      });
    }
  }

  ngAfterViewChecked() {
   this.scrollToBottom();
  }

  showSuccessToaster() {
    this.viewToast = true;
    this.toaster.show('success', '', 'Forwarded message successfully', 1500);
  }

  takePhoto() {
    const initialState = {  // Opens camera modal popup
      list: [
        "Open a modal with component",
        "Pass your data",
        "Do something else",
        "..."
      ],
      title: "Modal with component"
    };
    this.cookieService.set('camType', "photo");
    let config = {
      backdrop: true,
      ignoreBackdropClick: true
    };

    this.bsModalRef = this.modalService.show(CameramodalComponent, config);
    this.bsModalRef.setClass("my-modal");
    this.bsModalRef.content.closeBtnName = "Close";
    this.bsModalRef.content.onClose = myData => {
      // Do something with myData and then hide
      this.bsModalRef.hide();
       
      this.FilesArray.push(myData);
      var singledata = {
        url: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(myData)),
        type: myData.type
      };
      this.UploadFiles();
      this.urls.push(singledata);
    };

  }


  takeVideoAudio(type) {
    const initialState = {
      list: [
        "Open a modal with component",
        "Pass your data",
        "Do something else",
        "..."
      ],
      title: "Modal with component"
    };
    this.cookieService.set('camType', type);
    let config = {
      backdrop: true,
      ignoreBackdropClick: true
    };

    this.bsModalRef = this.modalService.show(CameramodalComponent, config);
    this.bsModalRef.setClass("my-modal");
    this.bsModalRef.content.closeBtnName = "Close";
    this.bsModalRef.content.onClose = myData => {
      // Do something with myData and then hide
      this.bsModalRef.hide();
      this.FilesArray.push(myData);
      var singledata = {
        url: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(myData)),
        type: myData.type
      };
      this.UploadFiles();
      this.urls.push(singledata);
    };
  }

  onPaste(event: any) {
    this.maxFileCount = false;
    this.maxFileError = false;
    this.urls = [];
    if (event.clipboardData.files.length >= 11) {
      this.maxFileCount = true;
      return;
    }
    this.FilesArray = event.clipboardData.files;
    for (var file of this.FilesArray) {
      if (file.size / Math.pow(1024, 2) >= 500) {
        this.maxFileError = true;
        return;
      }
      var singledata = {
        url: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file)),
        type: file.type,
        name: file.name
      };
      this.urls.push(singledata);
      const dialogRef = this.dialog.open(UploadFileModalComponent, {
        width: "600px",
        // height: "520px",
        data: {
          url: this.urls
        }
      });
      dialogRef.afterClosed().subscribe(res => {
        if (res.event === "save") {
          if (res.description != undefined) {
            this.fileDescription = res.description
            this.addMessage();
          } else {
            this.fileDescription = "";
            this.addMessage();
          }
        } else {
        }
      });
    }
  }
  dataURItoBlobType(dataURI) {
    const byteString = atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpeg' });
    return blob;
  }

  //edit group settings
  editGroup() {
    this.groupedit = true;
    this.editGroupForm.controls["groupName"].setValue(this.selectedGroupName);
  }

  //delete single message
  openDeleteModal(message) {
    const initialState = {
      title: "Modal with component"
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.content.alertTitle = "Alert";
    this.bsModalRef.content.content =
      "Are you sure? Do you want to Delete this Message ?";
    this.bsModalRef.content.onClose = myData => {
      this.bsModalRef.hide();
      var id = {
        id: message._id
      };
      this.viewToast = true;
      this.messageService.deleteMessage(id).subscribe(data => {
        var a = this.messageInfo.indexOf(message);
        this.messageInfo.splice(a, 1);
        this.toaster.show('success', '', 'Deleted message successfully', 1500);

      },
        (error => {
          console.log(error);
        }));
    };
  }
  getMessagesForGroup(groupId) {
    this.replyMsgId = null;
    this.replyMessage = "";
    this.enableChatOption = true;
    this.groupId = groupId;
    //get messages wrt groupid
    if (this.groupId) {
      this.messageService.getMessages(this.groupId).subscribe(data => {
        this.messageInfo = data;

        // Dispalying Replied for
        // write ng for if replyFor exits
        //create a new object for ReplyData
        //push the message Object in ReplyData having replyFor id
        // let temp = Object.assign([], data);
        //   temp.forEach(messageData => {
        //     if (messageData["user"]["_id"] === localStorage.getItem('siteOwnerId')) {
        //       messageData["user"]["firstName"] = localStorage.getItem('privateSiteName');
        //       messageData["user"]["lastName"] = "(Site Admin)";
        //       messageData["user"]["profilePicture"] = localStorage.getItem('privateSiteLogo');
        //     }
        //   });
        //   this.messageInfo = temp;
        if (this.messageInfo) {
          this.messageInfo.forEach(element => {
            if (this.privateSiteCheck()) {
              if (element.user._id === localStorage.getItem(this.siteName + "_siteOwnerId")) {
                if (element["user"]["_id"] === localStorage.getItem(this.siteName + '_siteOwnerId')) {
                  element["user"]["firstName"] = localStorage.getItem(this.siteName + '_privateSiteName');
                  element["user"]["lastName"] = "(Site Admin)";
                  element["user"]["profilePicture"] = localStorage.getItem(this.siteName + '_privateSiteLogo');
                }
              }
            }

            if (element.replyFor) {
              element.replyData = this.messageInfo.find((message) => {
                return message._id = element.replyFor;
              });
            }
          });
        }
      })
    }
  }
  getMessage() {
    return "Reply";
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
        data._id = localStorage.getItem(this.siteName + '_privateSiteUserId');
      }
    }
    // if (localStorage.getItem('privateSiteUserId')) {
    //   data._id = localStorage.getItem('privateSiteUserId');
    // }
    return data;
  }
  groupDetails(id, data) {
    this.selectedUserId = "";
    this.selectedType = "group";
    this.activeClass = true;
    this.groupId = id;
    this.selectedGroupName = data[0].groupName;
    this.groupData = data[0];
    this.selectedId = id;
    // this.router.navigate(["groups/" + id]);
  }
  shareOrFollow(data, type) {
    var strWindowFeatures =
      "location=yes,height=570,width=520,scrollbars=yes,status=yes";
    var url = window.location.origin;
    var shareurl;
    // var text=data;
    var text, imgUrl;
    if (type === "twitter") {
      if (data.files && data.files.length > 0) {
        imgUrl = data.files[0].url;
        text = data.message;
        shareurl = "https://twitter.com/intent/tweet?&text=" + text + "&url=" + imgUrl;

      } else {
        text = data.message;
        shareurl = "https://twitter.com/intent/tweet?&text=" + text;

      }
      // shareurl = "https://twitter.com/intent/tweet?&url=" + url;

    }
    else if (type === "facebook") {
      // shareurl = "https://www.facebook.com/sharer/sharer.php?u=" + url;
      if (data.files && data.files.length > 0) {
        imgUrl = data.files[0].url;
        shareurl = "https://www.facebook.com/sharer/sharer.php?u=" + imgUrl;
      } else {
        shareurl = "https://www.facebook.com/sharer/sharer.php?u=" + text;

      }
      // shareurl = "https://www.facebook.com/sharer/feed?caption=" + text;


    } else if (type === "whatsapp") {
      // shareurl = "whatsapp://send?url=" + url;
      shareurl = "whatsapp://send?url=" + url;

      return shareurl;
    } else if (type === "envelope") {
      text = data.message;
      // shareurl = "mailto:?Subject=" + text;
      // if (data.files && data.files.length > 0) {
      //   imgUrl = data.files[0].url;
      //   window.location.href = "mailto:?Subject=" + text + "&body=<img src='" + imgUrl + "'>";

      // } else {
      window.location.href = "mailto:?Subject=" + text;
      // }
      return;
    }
    window.open(shareurl, "_blank", strWindowFeatures);
  }
  getgroupDetails(id, data) {
    this.selectedUserId = "";
    this.selectedType = "group";
    this.activeClass = true;
    this.groupId = id;
    this.selectedGroupName = data.groupName;
    this.selectedProfilePicture = (data.groupIcon) ? data.groupIcon : null;
    this.groupData = data;
    this.selectedId = id;
    this.getMessagesForGroup(id);
    this.memberMessage = false;

  }
  enableSave() {
    this.saveValidity = false;
  }
  replyToMessage(msgId, message) {
    this.replyMsgId = msgId;
    this.msgType = "reply";
    this.replyMessage = [message];
  }
  addMember(user) {
    if (this.memberArray.indexOf(user._id) === -1) {
      if (user.userName === localStorage.getItem(this.siteName + '_privateSiteUsername')) {
        this.memberArray.push(localStorage.getItem(this.siteName + '_siteUserId'));
        user._id = localStorage.getItem(this.siteName + '_siteUserId');
        this.groupMembers.push(user);
      } else {
        this.memberArray.push(user._id);
        this.groupMembers.push(user)
      }
    }
    event.stopPropagation();
  }
  addForwardMember(user) {
    this.groupMembers.push(user._id);
    this.memberArray.push(user._id);
    event.stopPropagation();
  }
  removeForwardMember(i) {
    this.groupMembers.splice(i, 1);
    this.memberArray.splice(i, 1);
    event.stopPropagation();
  }
  removeMember(i) {
    this.groupMembers.splice(i, 1);
    this.memberArray.splice(i, 1);
    event.stopPropagation();
  }

  onFileChange(event) {
    this.groupLogoFile = event.target.files[0];
    if (this.groupLogoFile) {
      this.groupLogoPic = this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(this.groupLogoFile)
      );
    }
  }
  onMessageFileChange(event) {
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
        type: file.type,
        name: file.name
      };
      this.urls.push(singledata);
      const dialogRef = this.dialog.open(UploadFileModalComponent, {
        width: "600px",
        // height: "520px",
        data: {
          url: this.urls
        }
      });
      dialogRef.afterClosed().subscribe(res => {
        if (res.event === "save") {
          if (res.description != undefined) {
            this.fileDescription = res.description
            this.addMessage();
          } else {
            this.fileDescription = "";
            this.addMessage();
          }
        } else {
        }
      });
    }
  }
  downloadFile(data) {
    importedSaveAs(data.url, new Date().getTime() + data.type);
    // FileSaver.saveAs(data, new  Date().getTime() + data.type);
  }
  removeFile(i, ind) {
    this.FilesArray = [];
    this.urls.splice(ind, 1);
  }
  creategroupFun(value) {
    this.leftMenu = value;
    this.memberArray = [];
    this.groupMembers = [];
    this.disableForwardOption();
    // this.leftMenu.subscribe(isPrivateSite => {
    // });
  }
  addNewGroup() {
     
    if (this.groupLogoFile === undefined) {
      // this.error = "Upload logo";
      this.groupLogoFile = "";
      // return;
    }
    if (this.groupForm.valid && this.groupLogoFile) {
      this.uploadService.uploadFile(this.groupLogoFile).then(
        pased => {
          this.saveGroup(pased.Location)
        },
        err => {
          console.log(err);
        }
      );
    }
    else if (this.groupForm.valid && (this.groupLogoFile === "")) {
      this.saveGroup(this.groupLogoPic)
    }
    else {
       
    }
  }

  addMembersToGroup(group) {
     
    var groupMembers = this.groupMembers;
    this.messageService.addMembersToGroup(group._id, groupMembers).subscribe(docs => {
       
      // this.groupData.groupMembers.push(groupMembers);
      Array.prototype.push.apply(this.groupData.groupMembers, groupMembers);
      this.groupMembers = [];
      this.saveValidity = true;
      this.showType = "view";
    })


  }

  createGroupWithPeople() {
    var selectedUser = this.trunumsUsersList.filter(item => {
      if (item._id === this.selectedUserId) {
        return item;
      }
    })
    this.groupMembers.push(selectedUser[0]);
    var names = this.groupMembers.map(item => item.firstName);
    let checkGroupName = this.checkGroup(names.toString(), this.groupMembers);
    if (checkGroupName.groupFound) {
       
      this.saveValidity = true;
      this.groupMembers = [];
      this.memberArray = [];
      this.leftMenu = "groups";
      this.getgroupDetails(checkGroupName.groupData['_id'], checkGroupName.groupData);
    } else {
      var admins = [localStorage.getItem('userId')];
      if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
        admins = [localStorage.getItem(this.siteName + '_privateSiteUserId')];
      }
      //get user data for selected id and login user add it in group members
      var groupData = {
        groupSettings: {
          groupName: names.toString(),
          groupMembers: this.groupMembers,
          createdBy: this.loginUser,
          admins: admins,
          privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
        }
      }
      this.messageService.saveGroup(groupData).subscribe(docs => {
         
        var dataa: any = docs;
        this.saveValidity = true;
        this.leftMenu = "groups";
        this.groupsList.push(dataa);
        this.getgroupDetails(dataa._id, dataa);
        this.groupMembers = [];
        this.memberArray = [];
      });
    }
  }

  checkGroup(groupName, groupMembers) {
    var result = {
      groupFound: false,
      groupData: ""
    };
    if (this.groupsList.length > 0) {
      for (var element of this.groupsList) {
        if (groupName === element.groupName) {
          result.groupFound = true;
          result.groupData = element;
          break;
        }
      }
    }
    return result;
  }

  likeMessage(msg) {
    var obj = { likeCount: 1, userId: localStorage.getItem('userId') };
    this.messageService.updateMessage(obj, msg._id).subscribe(docs => {
       
      msg.likedBy.push(this.loginUser);
    });
  }

  saveMessageDescriptionForGroup(flag) {
    //get group data
    var messageData = {
      message: this.fileDescription,
      files: this.FileUrls,
      groupId: this.groupId,
      createdBy: localStorage.getItem('userId'),
      replyFor: null,
      sendTo: null,
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    }
    var groupdata = this.groupsList.filter(item => {
      if (item._id === this.groupId) {
        return item;
      }
    })
    var notifications = [];
    var notifcation = {
      type: "MESSAGE",
      createdBy: this.userProfile(),

      message: "has sent a message",
      isRead: false,
      isViewed: false,
      privateSite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      notifyTo: "",
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    };
    //loop group members
    groupdata[0].groupMembers.forEach(element => {
      notifcation.notifyTo = element._id;
      notifications.push(notifcation);
      this.messageService.sendNotifcation(notifcation);

    });
    return forkJoin(
      this.messageService.saveMessage(messageData),
      this.messageService.saveGroupNofication(notifications)
    ).subscribe(data => {
       
      this.saveValidity = true;
      var tempMessage = {
        userId: this.selectedUserId,
        message: this.fileDescription,
        user: this.userProfile(),
        groupId: this.groupId,
        privateSite: localStorage.getItem('privateSite'),
        createdAt: new Date(),
        files: this.FileUrls
      };
      this.messageService.sendMessage(tempMessage);

      this.messageForm.controls["message"].setValue("");
      this.urls = [];
      this.FileUrls = [];
      this.FilesArray = [];
      this.disableScrollDown = false;
    });
  }

  saveGroupMessage(flag) {
    //get group data
    var messageData = {
      message: this.messageForm.controls['message'].value,
      files: this.FileUrls,
      groupId: this.groupId,
      createdBy: localStorage.getItem('userId'),
      replyFor: null,
      sendTo: null,
      createdAt: new Date()
    }
    if (messageData.message === "" && messageData.files.length === 0) {
      throw new Error();
    }
    var groupdata = this.groupsList.filter(item => {
      if (item._id === this.groupId) {
        return item;
      }
    })
    var notifications = [];
    var notifcation = {
      type: "MESSAGE",
      createdBy: this.userProfile(),

      message: "has sent a message",
      isRead: false,
      isViewed: false,
      privateSite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      notifyTo: ""
    };
    //loop group members
    groupdata[0].groupMembers.forEach(element => {
      if (element._id !== localStorage.getItem(this.siteName + '_privateSiteUserId')) {
        notifcation.notifyTo = element._id;
        notifications.push(notifcation);
        this.messageService.sendNotifcation(notifcation);
      }
    });
    return forkJoin(
      this.messageService.saveMessage(messageData),
      this.messageService.saveGroupNofication(notifications)
    ).subscribe(data => {
       
      this.saveValidity = true;
      var tempMessage = {
        // _id: docs[0]._id,
        message: this.messageForm.controls["message"].value,
        user: this.userProfile(),
        groupId: this.groupId,
        createdAt: new Date(),
        files: this.FileUrls
      };
      // this.messageInfo.push(tempMessage);
      this.messageService.sendMessage(tempMessage);

      this.messageForm.controls["message"].setValue("");
      this.urls = [];
      this.FileUrls = [];
      this.FilesArray = [];
      this.disableScrollDown = false;
    });
  }

  saveMessageDescription(flag) {
    //get group data
    var messageData = {
      message: this.fileDescription,
      files: this.FileUrls,
      groupId: this.groupId,
      createdBy: localStorage.getItem('userId'),
      replyFor: null,
      sendTo: null,
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    }
    var notifcation;
    if (this.memberMessage === true) {
      messageData.sendTo = this.selectedUserId;
      messageData.groupId = null;
      notifcation = {
        type: "MESSAGE",
        notifyTo: messageData.sendTo,
        createdBy: this.userProfile(),
        message: "has sent a message",
        isRead: false,
        isViewed: false,
        privateSite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
      };
      this.messageService.sendNotifcation(notifcation);
    }
    if (this.msgType === "reply") {
      messageData.replyFor = this.replyMsgId;
      notifcation = {
        type: "MESSAGE",
        notifyTo: messageData.replyFor,
        createdBy: this.userProfile(),
        message: "has sent a message",
        isRead: false,
        isViewed: false,
        privateSite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.messageService.sendNotifcation(notifcation);
    }
    return forkJoin(
      this.messageService.saveMessage(messageData),
      this.messageService.saveNofication(notifcation)
    ).subscribe(data => {
       
      this.saveValidity = true;
      var tempMessage = {
        privateSite: localStorage.getItem('privateSite'),
        userId: this.selectedUserId,
        message: this.fileDescription,
        user: this.userProfile(),
        groupId: this.groupId,
        createdAt: new Date(),
        files: this.FileUrls
      };
      this.messageService.sendMessage(tempMessage);

      this.messageForm.controls["message"].setValue("");
      this.urls = [];
      this.FileUrls = [];
      this.FilesArray = [];
      this.disableScrollDown = false;
    });
  }
  saveMessage(flag) {
    //get group data

    var messageData = {
      message: this.messageForm.controls['message'].value,
      files: this.FileUrls,
      groupId: this.groupId,
      createdBy: localStorage.getItem('userId'),
      replyFor: null,
      sendTo: null,
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId'),
      createdAt: new Date()
    }
    if (messageData.message === "" && messageData.files.length === 0) {
      throw new Error();
    }
    var notifcation;
    if (this.memberMessage === true) {
      messageData.sendTo = this.selectedUserId;
      messageData.groupId = null;
      notifcation = {
        type: "MESSAGE",
        notifyTo: messageData.sendTo,
        createdBy: this.userProfile(),
        message: "has sent a message",
        isRead: false,
        isViewed: false,
        privateSite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
      };
      if (this.privateSiteCheck()) {
        notifcation.privateSite = true;
      }
      this.messageService.sendNotifcation(notifcation);
    }
    if (this.msgType === "reply") {
      messageData.replyFor = this.replyMsgId;
      notifcation = {
        type: "MESSAGE",
        notifyTo: messageData.replyFor,
        createdBy: this.userProfile(),
        message: "has sent a message",
        isRead: false,
        isViewed: false,
        privateSite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
      };
      if (this.privateSiteCheck()) {
        notifcation.privateSite = true;
      }
      this.messageService.sendNotifcation(notifcation);
    }
    return forkJoin(
      this.messageService.saveMessage(messageData),
      this.messageService.saveNofication(notifcation)
    ).subscribe(data => {
       
      this.replyMessage = [""];
      this.saveValidity = true;

      this.replyMsgId = null;
      var tempMessage = {
        _id: data[0]["_id"],
        userId: this.selectedUserId,
        message: this.messageForm.controls["message"].value,
        user: this.userProfile(),
        groupId: this.groupId,
        createdAt: new Date(),
        privateSite: localStorage.getItem('privateSite'),
        files: this.FileUrls,
        replyFor: null,
        replyData: null
      }

      if (data && data[0]) {
        if (data[0]["replyFor"]) {
          tempMessage.replyFor = data[0]["replyFor"];
          tempMessage.replyData = this.messageInfo.find((message) => {
            return message._id = data[0]["replyFor"];
          });
        }
      }

      // this.messageInfo.push(tempMessage);
      this.messageService.sendMessage(tempMessage);

      this.messageForm.controls["message"].setValue("");
      this.urls = [];
      this.FileUrls = [];
      this.FilesArray = [];
      this.disableScrollDown = false;
    });
  }
  saveFakeMessage(flag) {
    var messageData = {
      message: this.messageForm.controls['message'].value,
      files: this.FileUrls,
      groupId: this.groupId,
      createdBy: localStorage.getItem('userId'),
      replyFor: null,
      sendTo: null
    }

    // return forkJoin(
    //   this.messageService.saveMessage(messageData),
    // ).subscribe(data => {
       
      this.saveValidity = true;
      var tempMessage = {
        userId: this.selectedUserId,
        message: this.messageForm.controls["message"].value,
        privateSite: localStorage.getItem('privateSite'),
        user: this.userProfile(),
        groupId: this.groupId,
        createdAt: new Date(),
        files: this.FileUrls
      };
      // this.messageInfo.push(tempMessage);
      // this.messageService.sendMessage(tempMessage);
      // this.messageInfo = tempMessage;
      this.messageForm.controls["message"].setValue("");
      this.urls = [];
      this.FileUrls = [];
      this.FilesArray = [];
      this.disableScrollDown = false;
    // });
  }
  UploadFiles() {
     
    for (var i = 0; i < this.FilesArray.length; i++) {
      var type = this.FilesArray[i].type;
      var size = this.FilesArray[i].size;
      this.uploadService.uploadFile(this.FilesArray[i]).then(
        pased => {
          var single = {
            name: pased.key,
            url: pased.Location,
            type: type,
            size: size
          };
          this.FileUrls.push(single);
          if (this.FilesArray.length === this.FileUrls.length) {
            if (this.memberMessage === true) {
              this.saveMessageDescription(true)
            } else {
              this.saveMessageDescriptionForGroup(true);
            }
          }
        },
        err => {
          this.saveMessageDescriptionForGroup(false);
        }
      );
    }
  }
  addFilter(filterVal) {
    this.filterVal = filterVal;
    var searchMessages = this.searchedMessages;
    var searchedUsers;
    var searchedGroups;
    if (filterVal === 'people') {
      searchedUsers = this.usersList.filter(item => {
        if ((item.firstName.toLowerCase()).indexOf(this.searchText.toLowerCase()) !== -1) {
          return item;
        }
      })
      this.usersList = searchedUsers;
      this.displayType = "people";

    }
    else if (filterVal === 'group') {
      // console.log(this.groupsList);
      searchedGroups = this.groupsList.filter(item => {
        if ((item.groupName.toLowerCase()).indexOf(this.searchText.toLowerCase()) !== -1) {
          return item;
        }
      })
      this.groupsList = searchedGroups;
      this.displayType = "groups";
    } else {
      // this.messageInfo = this.messageInfo;
      // this.searchMsg = false;
      // this.showType = "view";
      this.searchText = "";
      this.usersList = this.mainUsersList.filter(item => item.name);
      this.groupsList = this.mainGroupList;
      this.displayType = "all";
      this.filterVal = "";

    }
  }
  searchMessages(searchText: String) {
    // ..get all messages
    this.searchText = searchText;
    this.showType = "filter";
    if (searchText.length > 0) {
      this.searchMsg = true;
      this.messageService.getAllMessages().subscribe(data => {
        this.messageData = data;
        this.messageInfo = this.messageData.filter(item => {
          return (
            item.message
              .toLowerCase()
              .includes(searchText.toLowerCase())
          );
        });
        this.searchedMessages = this.messageInfo;
      });
      //groups search

      var searchedGroups;
      var searchedUsers;

      searchedUsers = this.usersList.filter(item => {
        if ((item.firstName.toLowerCase()).indexOf(this.searchText.toLowerCase()) !== -1 || (item.lastName.toLowerCase()).indexOf(this.searchText.toLowerCase()) !== -1) {
          return item;
        }
      })
      this.usersList = searchedUsers;
      searchedGroups = this.groupsList.filter(item => {
        if ((item.groupName.toLowerCase()).indexOf(this.searchText.toLowerCase()) !== -1) {
          return item;
        }
      })
      this.groupsList = searchedGroups;


      //people search




    } else {
      this.searchMsg = false;
      this.usersList = this.mainUsersList.map(item => item.user);
      this.groupsList = this.mainGroupList;
      this.displayType = "all";

    }

    // this.subscriberlist = this.MainSubscriberList.filter(item => {
    //   return (
    //     item.subscriber.firstName
    //       .toLowerCase()
    //       .includes(searchText.toLowerCase()) ||
    //     item.subscriber.lastName
    //       .toLowerCase()
    //       .includes(searchText.toLowerCase()) ||
    //     (
    //       item.subscriber.firstName.toLowerCase() +
    //       " " +
    //       item.subscriber.lastName.toLowerCase()
    //     ).includes(searchText.toLowerCase())
    //   );
    // });
  }
  addMessage() {
     
    if (this.FilesArray.length > 0) {
      if (this.blockedUsers.length > 0) {
        return;
      } else {
        this.UploadFiles();
      }
    } else {
      this.FileUrls = [];
      if (this.blockedUsers.length > 0) {
        var temp = this.blockedUsers.length
        for (var i = 0; i < temp; i++) {
          if (this.selectedUserId === this.blockedUsers[i]) {
            this.saveFakeMessage(true);
          }
          else {
            try {
              this.saveMessage(true);
            } catch(err) {
               
            }
          }
        }
      } else if (this.msgType === "reply" || this.memberMessage === true) {
        try {
          this.blocked = false
          this.saveMessage(true);
        } catch(err) {
           
        }
      } else {
        try {
          this.saveGroupMessage(true);
        } catch(err) {
           
        }
      }
    }
  }
  forwardMessage(messageId) {
    var forwardData = {
      messageId: messageId,
      forwardTo: this.groupMembers,
      forwardedBy: localStorage.getItem('userId'),
      privateSiteId: localStorage.getItem(this.siteName + "_siteUserId")
    }
    this.messageService.forwardMessage(forwardData).subscribe(docs => {
      this.enableChatOption = true;
      this.groupMembers = [];
      this.memberArray = [];
      this.enableForward = false;
      this.showSuccessToaster();
      this.disableForwardOption();
      //success/failure message in toaster
    });
  }
  addMemberToGroup(groupMembers) {
    this.showType = "add";
    //dont display already added members in group
    // const results = (this.mainUsersList).filter(({ _id: id1 }) => !groupMembers.some(({ _id: id2 }) => id2 === id1));
    const results = (this.trunumsUsersList).filter(({ _id: id1 }) => !groupMembers.some(({ _id: id2 }) => id2 === id1));
    // const results = (this.addMemberList).filter(({ _id: id1 }) => !groupMembers.some(({ _id: id2 }) => id2 === id1));
    this.addMemberList = results;
    // this.usersList = results;
  }
  cancelAdd() {
    this.showType = "view";
    // this.usersList = this.mainUsersList.map(item => item.user);
    // console.log(this.usersList);
  }
  cancelFilter() {
    this.showType = "view";
    this.searchText = "";
    this.usersList = this.mainUsersList;
    this.groupsList = this.mainGroupList;
    this.addFilter("message");
  }
  saveGroup(url) {
    var admins = [localStorage.getItem('userId')];
    if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
      admins = [localStorage.getItem(this.siteName + '_privateSiteUserId')];
    }
    var groupData = {
      groupSettings: {
        groupName: this.groupForm.controls['groupName'].value,
        groupIcon: url,
        groupMembers: this.groupMembers,
        createdBy: localStorage.getItem('userId'),
        admins: admins,
        privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
      }
    }
    if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
      groupData.groupSettings.createdBy = localStorage.getItem(this.siteName + '_privateSiteUserId');
    }

    this.messageService.saveGroup(groupData).subscribe(docs => {
       

      this.saveValidity = true;
      this.leftMenu = "groups";
      this.groupForm.controls["groupName"].setValue("");
      this.groupMembers = [];
      this.memberArray = [];
      this.groupsList.push(docs);
    })
  }
  updateGroup(url) {
    var groupData;
    if (url) {
      groupData = {
        groupName: this.editGroupForm.controls['groupName'].value,
        groupIcon: url,
        id: this.groupId
      }
    } else {
      groupData = {
        groupName: this.editGroupForm.controls['groupName'].value,
        id: this.groupId
      }
    }
    this.messageService.updateGroup(groupData).subscribe(docs => {
       
      this.groupedit = false;
      this.groupData = docs;
      this.onInit();
      this.saveValidity = true;
      this.leftMenu = "groups";
    })
  }

  editGroupData(groupData) {
     
    if (this.groupLogoFile === undefined && !groupData.groupIcon) {
      // this.error = "Upload logo";
      this.groupLogoFile = "";
      // return;
    }
    if (this.editGroupForm.valid && this.groupLogoFile) {
      this.uploadService.uploadFile(this.groupLogoFile).then(
        pased => {
          this.updateGroup(pased.Location)
        },
        err => {
          console.log(err);
        }
      );
    } else if (groupData.groupIcon !== undefined) {
      this.updateGroup(groupData.groupIcon)
       

    }
    // else {
    //   console.log("else");
    //   this.updateGroup(this.groupLogoPic)
    //    
    // }
  }

  deleteAllMessagesModal(groupid) {
    const initialState = {
      title: "Modal with component"
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.content.alertTitle = "Alert";
    this.bsModalRef.content.content =
      "Are you sure? Do you want to Delete this Chat ?";
    this.bsModalRef.content.onClose = myData => {
      this.bsModalRef.hide();
      var id = {
        id: groupid
      };
      this.messageService.deleteGroupMessages(id).subscribe(data => {
        this.messageInfo = undefined;
      });
    };
  }
  leaveGroupModal(groupid, group) {
    const initialState = {
      title: "Modal with component"
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.content.alertTitle = "Alert";
    this.bsModalRef.content.content =
      "Are you sure? Do you want to Leave from this Group ?";
    this.bsModalRef.content.onClose = myData => {
      this.bsModalRef.hide();
      var id = {
        id: groupid,
        userId: localStorage.getItem('userId')
      };
      if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
        id.userId = localStorage.getItem(this.siteName + '_privateSiteUserId');
      }
      group['admins'].forEach((element) => {
        if (element == id.userId) {
          id["admin"] = id.userId;
        }
      });

      this.messageService.leaveGroup(id).subscribe(data => {
        this.onInit();
        this.messageInfo = [];
      });
    };
  }
  updateBlock(id, flag, userId) {
    this.ngZone.run(() => {
      this.messageService.updateBlockUser(id, flag, this.loginUser).subscribe(data => {
        if (flag) {
          let userIndex = this.usersList.findIndex(user => user._id === userId);
          let subscriptionIndex = this.subscriptionList.findIndex(subscription => subscription._id === id);
          this.subscriptionList[subscriptionIndex]["isBlocked"] = false;
          this.subscriptionList[subscriptionIndex]["blockedBy"] = null;
          this.usersList[userIndex]["blocked"] = false;
          this.usersList[userIndex]["blockedBy"] = null;
          this.enableChatOption = true;
          this.blockedBy = null;
        } else {
          let userIndex = this.usersList.findIndex(user => user._id === userId);
          let subscriptionIndex = this.subscriptionList.findIndex(subscription => subscription._id === id);
          this.subscriptionList[subscriptionIndex]["isBlocked"] = true;
          this.subscriptionList[subscriptionIndex]["blockedBy"] = this.loginUser;
          this.usersList[userIndex]["blocked"] = true;
          this.usersList[userIndex]["blockedBy"] = this.loginUser;
          this.enableChatOption = false;
          this.blockedBy = this.loginUser;
        }
      });
    });
  }
  makeAdmin(userId, groupId) {
    this.viewToast = true;
    this.messageService.makeAdmin(userId, groupId).subscribe(data => {
      this.toaster.show('success', '', 'Make admin successfully', 1500);
      this.onInit();
    });
  }
  removeAdmin(userId, groupId) {
    this.viewToast = true;
    this.messageService.removeAdmin(userId, groupId).subscribe(data => {
      this.toaster.show('success', '', 'Remove admin successfully', 1500);
      this.onInit();
    });
  }
  removeUserFromGroup(userId, groupId) {
    this.viewToast = true;
    this.messageService.removeUserFromGroup(userId, groupId).subscribe(data => {
      this.toaster.show('success', '', 'User removed from group successfully', 1500);
      this.onInit();
    })
  }
  //people conversations
  messageBetweenMembers(user) {
    this.replyMsgId = null;
    this.replyMessage = "";
     
    this.ngZone.run(() => {
      if (user.blocked) {
        this.enableChatOption = false;
        this.blockedBy = user.blockedBy;
      } else {
        this.enableChatOption = true;
      }
      this.selectedUserId = user._id;
      this.me = localStorage.getItem('userId');
      this.selectedUserName = user.userName;
      this.selectedId = "";
      this.groupId = undefined;
      this.memberMessage = true;
      this.selectedGroupName = user.firstName + " " + user.lastName;
      this.selectedProfilePicture = user.profilePicture;
      this.selectedType = "people";
      if (this.privateSiteCheck()) {
        let userId = localStorage.getItem("userId");
        this.messageService.getMessagesBetweenMembersOfPrivateSite(user._id, userId, localStorage.getItem(this.siteName + '_siteUserId')).subscribe(data => {
           
          let temp = Object.assign([], data);
          temp.forEach(messageData => {
            if (messageData["user"]["_id"] === localStorage.getItem(this.siteName + '_siteOwnerId')) {
              messageData["user"]["firstName"] = localStorage.getItem(this.siteName + '_privateSiteName');
              messageData["user"]["lastName"] = "(Site Admin)";
              messageData["user"]["profilePicture"] = localStorage.getItem(this.siteName + '_privateSiteLogo');
              this.selectedProfilePicture = localStorage.getItem(this.siteName + '_privateSiteLogo');
            }
          });
          this.messageInfo = temp;
        });
      } else {
        this.messageService.getMessagesBetweenMembers(user._id, localStorage.getItem('userId')).subscribe((data: any) => {
           
          this.messageInfo = data;
          if (data && data.length > 0) {
            data.forEach((message) => {
              if (message.replyFor) {
                message.replyData = this.messageInfo.find((msg) => {
                  return msg._id = message["replyFor"];
                });
              }
            })
          }
          this.messageInfo = data;
        });
      }
    });
  }

  openImageFullScreen(url) {
    const dialogRef = this.dialog.open(UploadFileModalComponent, {
      width: "600px",
      data: {
        url: url
      }
    })
  }

  enableForwardOption() {
    this.enableForward = true;
  }

  disableForwardOption() {
    this.enableForward = false;
  }

  getMessageDetails(message) {
    this.messageMobile = message;
  }

  goToHomeScreen() {
    this.selectedType = null;
    this.messageMobile = null;
  }

  scrollToBottom() {
    if (this.disableScrollDown) {
      return
    }
    try {
        window.scrollTo(0, this.scroll.nativeElement.scrollHeight);
    } catch(err) { }
  }

  onScroll() {
    let element = this.scroll.nativeElement;
    let atBottom = (element.scrollTop+200) >= (element.scrollHeight - element.offsetHeight);
    if (atBottom) {
        this.disableScrollDown = true;
    } else {
        this.disableScrollDown = false;
    }
  }

  // Checks if user is in private site
  privateSiteCheck() {
    let httpLink = window.location.pathname.split('/');
    if (localStorage.getItem("privateSite") === "true" && httpLink[1] === "privatesites") {
      return true;
    }
    return false;
  }
}
