import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { SignupComponent } from "../signupmodal/signupmodal.component";
import { TopicmodalComponent } from "../topicmodal/topicmodal.component";
import { forkJoin } from "rxjs";
import { SignupmodalService } from '../signupmodal/signupmodal.service';
import { Socket } from 'ngx-socket-io';
import { HeaderService } from '../header/header.service';
import { CookieService } from "ngx-cookie-service";
import { PrivatesiteHeaderService } from './privatesite-header.service';
import { AuthService } from '../auth.service';
import { ModalComponent } from '../modal/modal.component';
import { SettingsService } from '../settings/settings.service';
import { UserprofileService } from "../userprofile/userprofile.service";
import { SubscribersService } from "../subscribers/subscribers.service";
import { FileSharingService } from "../file-sharing/file-sharing.service";
import { SharedService } from "../shared-services/shared.service";

@Component({
  selector: 'app-privatesite-header',
  templateUrl: './privatesite-header.component.html',
  styleUrls: ['./privatesite-header.component.scss']
})
export class PrivatesiteHeaderComponent implements OnInit {
  @Input() name: string;
  maxvalue = 10;
  privateSiteName;
  popupText;
  privateSiteLogo;
  privateSite;
  privateSites = [];
  UsersList: any = [];
  PollList: any = [];
  SearchInfo: Array<any> = [];
  userId = "";
  privateUserId;
  loginId;
  newNotifications = false;
  notifications: any = [];
  PollSearchList = [];
  searchtext = "";
  disableCreateTopic = true;
  subscriptionObj;
  isOwner: boolean = false;
  isSubscriber = false;
  searchType = "poll";
  showSignup: boolean;
  unreadCount = 0;
  bsModalRef: BsModalRef;
  isAdmin: boolean = false;
  siteName;
  userData = {
    userId: "",
    userName: "",
    userMail: "",
    profilePicture: ""
  };
  hasFileAccess: boolean = false;
  tagSearch: Boolean = false;
  styleBlock: boolean = false;

  constructor(
    private modalService: BsModalService,
    public router: Router,
    private hservice: HeaderService,
    public _signUpModelService: SignupmodalService,
    private cService: CookieService,
    private soc: Socket,
    private _authService: AuthService,
    private pService: PrivatesiteHeaderService,
    private settingsService: SettingsService,
    private uService: UserprofileService,
    private subscriptionService: SubscribersService,
    private fileSharingService: FileSharingService,
    private _sharedService: SharedService,
    private activatedRoute: ActivatedRoute
  ) {
    this.pService.refreshPrivateSiteHeader.subscribe(refresh => {
      this.ngOnInit()
    })
    let link = window.location.pathname.split('/');
    if (link[1] === "privatesites") {
      this.siteName = link[2];
    }
    this.siteName = link[2];
    this.soc.fromEvent<any>('Notifcation').subscribe(data => {
      var notification: any = data;
      if (notification.notifyTo === localStorage.getItem('userId')) {
        this.notifications.unshift(data);
        this.unreadCount += 1;
        this.newNotifications = true;
      } else if ((notification.notifyTo === localStorage.getItem(this.siteName + '_privateSiteUserId')) && (notification["createdBy"]["_id"] !== localStorage.getItem(this.siteName + '_privateSiteUserId'))) {
        this.notifications.unshift(data);
        this.unreadCount += 1;
        this.newNotifications = true;
      }
    },
      (error => {
        console.log(error);
      }))
      _signUpModelService.itemValue.subscribe(currentUser => {
      if (currentUser) {
        this.ngOnInit();
      }
    },
      (error => {
        console.log(error);
      }))
      // _authService.privateSite.subscribe(currentUser => {
      //   if (currentUser) {
      //     this.ngOnInit();
      //   }
      // },
      // (error => {
      //   console.log(error);
      // }))
      _signUpModelService.allowCreate.subscribe(currentUser => {
      if (currentUser === 'create') {
        this.disableCreateTopic = false;
        // this.ngOnInit();
      }
    },
      (error => {
        console.log(error);
      }))
    settingsService.itemValue.subscribe(data => {
      if (data) {
        this.ngOnInit();
      }
    },
      (error => {
        console.log(error);
      }))
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
  aboutWebsite() {
    if (this.isOwner === true) {
      this.popupText = "About Myown Website"
    } else {
      this.popupText = "About This Private Website"
    }
    const initialState = {
      list: [
        "Open a modal with component",
        "Pass your data",
        "Do something else",
        "..."
      ],
      title: this.popupText
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.setClass("my-modal");
    this.bsModalRef.content.alertTitle = this.popupText;
    this.bsModalRef.content.content = localStorage.getItem(this.siteName + '_privateSiteDesc');
    this.bsModalRef.content.isCancel = true;

  }
  conatctInfo() {
    const initialState = {
      list: [
        "Open a modal with component",
        "Pass your data",
        "Do something else",
        "..."
      ],
      title: "Contact Information"
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.setClass("my-modal");
    this.bsModalRef.content.alertTitle = "Contact Information";
    this.bsModalRef.content.isCancel = true;
    this.bsModalRef.content.content = localStorage.getItem(this.siteName + '_privateSiteContact');
  }
  createTopicModal() {
    const initialState = {
      list: [
        "Open a modal with component",
        "Pass your data",
        "Do something else",
        "..."
      ],
      title: "Modal with component",
      searchData: this.searchType === 'poll' ? this.searchtext : null

    };
    if (!this.isAuth()) {
      this.openModalWithComponent(false);
    } else {
      this.cService.set('polltype', 'PrivateSite');
      this.bsModalRef = this.modalService.show(TopicmodalComponent, {
        initialState
      });
      this.bsModalRef.content.closeBtnName = "Close";
    }
  }
  enableSerch() {
    if (this.searchtext.length > 2) return true;
    else return false;
  }
  
  changeInSearchText(text) {
    this.searchtext = text;
    if (text.length === 0) {
      this.SearchInfo = [];
      return;
    }
    if (this.searchType === "poll") {
      if (text.split("")[0] === "#") {
        if (text === "#") {
          this.tagSearch = false;
          return;
        }
        this.getTagPolls(text.substring(1));
      } else {
        this.SearchInfo = this.PollList.filter(item => {
          return item.question.toLowerCase().includes(text.toLowerCase());
        });
      }
      
    } else {
      this.SearchInfo = this.UsersList.filter(item => {
        return (
          item.firstName.toLowerCase().includes(text.toLowerCase()) ||
          item.lastName.toLowerCase().includes(text.toLowerCase()) ||
          (
            item.firstName.toLowerCase() +
            " " +
            item.lastName.toLowerCase()
          ).includes(text.toLowerCase())
        );
      });
    }
  }


  ngOnInit() {
    this.pService.getAllPrivateSites(localStorage.getItem(this.siteName+"_siteOwnerId")).subscribe((data: Array<any>) => {
      this.privateSites = data
    }, (error: object) => {
      console.log(error);
    })
    // this._sharedService.getPollListForSearch({privateSiteId: localStorage.getItem(this.siteName+"_siteUserId")}).subscribe((response: Array<any>) => {
    //   this.PollList = response;
    // }, error => {
    //   console.log(error);
    // })
    this.changeInSearchCategory(this.searchType)
    let link = window.location.pathname.split('/');
    if (link[1] === "privatesites") {
      this.siteName = link[2];      
    }
    // if (localStorage.getItem(this.siteName+"_privateSiteName")) {
    //   console.log("Site exists");
    // } else {
    //   // this.removeItems();
    //   this.router.navigateByUrl("/privatesites/" + link[2]);
    // }
    if (localStorage.getItem(this.siteName+"_privateSiteOwnerId") === localStorage.getItem('userId')) {
      this.isOwner = true; 
      this.isAdmin = true;
    } 
    else {
      if (localStorage.getItem(this.siteName+"_siteOwnerId")) {
        this.settingsService.getPrivateSettings(localStorage.getItem(this.siteName+"_siteOwnerId")).subscribe(data => {
          let admins = data["admins"];
          admins.forEach(admin => {
            if (admin === localStorage.getItem("userId")) {
              this.isAdmin = true;
            }
          })
        })
      }
    }

    if (this.isOwner) {
      this.hasFileAccess = true;
    } else {
      // Get File permissions settings
      this.fileSharingService.getFilePermissions(localStorage.getItem(this.siteName + "_siteUserId"), this.isOwner).subscribe((response) => {
        if (response["success"]) {
          if (response["doc"] && response["doc"].length > 0) {
            let blocked = response["doc"][0]["blocked"];
            if (blocked && blocked["fileAccess"] && blocked["fileAccess"].length > 0) {
              if (blocked["fileAcess"].includes(localStorage.getItem("userId")))  {
                this.hasFileAccess = false;
              } else {
                this.hasFileAccess = true;
              }
            } else {
              this.hasFileAccess = true;
            }
          }
        }
      }, (error) => {
        console.error(error);
      });
    }

    this.privateSiteLogo = localStorage.getItem(this.siteName+"_privateSiteLogo");
    this.cService.set("pslogo", this.privateSiteLogo);
    this.privateSiteName = localStorage.getItem(this.siteName+'_privateSiteName');
    this.privateSite = localStorage.getItem("privateSite"); 
    this.privateUserId = localStorage.getItem(this.siteName+"_privateSiteUserId");
    this.loginId = localStorage.getItem('userId');
    if (localStorage.getItem("userId") !== localStorage.getItem(this.siteName+"_siteOwnerId")) {
      this.userId = localStorage.getItem("userId");
      this.getNotifications()
    }
    if (this.privateUserId) {
      this.getAllPrivateNotifications();
    }
    this.getData();
    if (localStorage.length > 0) {
      this.userData = {
        userId: localStorage.getItem("userId"),
        userName: localStorage.getItem("userName"),
        userMail: localStorage.getItem("userMail"),
        profilePicture: localStorage.getItem("profilePicture"),
      };
      if (localStorage.getItem("userId") === localStorage.getItem(this.siteName+"_siteOwnerId")) {
        this.userData.profilePicture = localStorage.getItem(this.siteName+"_privateSiteLogo")
      } 
    }

    //get subscriber status when viewing private site user
    if (localStorage.getItem("userId") !== localStorage.getItem(this.siteName+"_siteUserId")) {
      var subscriptionObj = {
        id: localStorage.getItem("userId"),
        userid: localStorage.getItem(this.siteName+"_siteUserId") + "",
        privateSiteId: localStorage.getItem(this.siteName+'_siteUserId')
      };
      this.uService.getSubscrptionStatus(subscriptionObj).subscribe(data => {
        var subData: any = data;
          this.subscriptionObj = subData.data[0];
          if (this.subscriptionObj) {
            if (this.subscriptionObj.status === "ACCEPTED") {
              this.isSubscriber = true;
            }
          }
      });
    }

    if (localStorage.getItem('userId') === localStorage.getItem(this.siteName+'_siteOwnerId')) {
      this.isSubscriber = true;
    }
  }
  
  navtomainsite() {
      this.navToMainSite();
  }
  navtomessages() {
    var siteName = localStorage.getItem(this.siteName+'_privateSiteName');
    this.router.navigateByUrl("/privatesites/" + siteName +"/messages");
  }
  getData() {
    return forkJoin(this.hservice.getCurrentIpLocation()).subscribe(data => {
      if (data[0] && data[0].names)
        localStorage.setItem("currentCountry", data[0].names["en"]);
    },
      (error => {
        console.log(error);
      }));
  }
  getNotifications() {
    var data = {
      notifyTo: localStorage.getItem('userId'),
      privateSiteId: localStorage.getItem(this.siteName+'_siteUserId')
    }
      this.hservice.gePrivateSubNotifications(data).subscribe(docs => {
        this.notifications = docs;
        this.notifications.forEach(element => {
          // if (element.privateSite) {
          if (!element.isRead)
            this.unreadCount += 1;
          if (!element.isViewed)
            this.newNotifications = true;

          if (element.createdBy._id === localStorage.getItem(this.siteName+"_siteOwnerId")) {
            element.createdBy.firstName = localStorage.getItem(this.siteName+"_privateSiteName");
            element.createdBy.lastName = "(Site Admin)";
            element.createdBy.profilePicture = localStorage.getItem(this.siteName+"_privateSiteLogo");
          }
        });
      },
        (error => {
          console.log(error);
        }));
  }
  openSettings() {
    if (!this.isAuth()) {
      this.openModalWithComponent(false);
    } else {
      var siteName = localStorage.getItem(this.siteName+'_privateSiteName');
      this.router.navigate(["/privatesites/" + siteName +"/settings"]);
    }
  }
  navToNotifications() {
    var siteName = localStorage.getItem(this.siteName+"_privateSiteName");
    this.router.navigate(['/privatesites/'+ siteName + '/notifications']);
  }
  getAllPrivateNotifications() {
    var data = {
      notifyTo: localStorage.getItem(this.siteName+'_privateSiteUserId')
    }
    if (this.privateSiteCheck()) {
      data["privateSiteId"] = localStorage.getItem(this.siteName+'_siteUserId'); 
      this.hservice.getPrivateNotifications(data).subscribe((docs) => {
        this.notifications = docs;
        this.notifications.forEach((element) => {
          if (!element.isRead)
            this.unreadCount += 1;
          if (!element.isViewed)
            this.newNotifications = true;
        });
      }, (error) => {
        console.log(error);
      });
    }
   
  }
  logout() {
    this.hservice.userLogout({ id: localStorage.getItem("userId") }).subscribe(data => {
      var result: any = data;
      if (result) {
        localStorage.removeItem('loginType');
        localStorage.removeItem('userFirstName');
        localStorage.removeItem('userLastName');
        localStorage.removeItem('profilePicture');
        localStorage.removeItem('jwt');
        localStorage.removeItem('currentCountry');
        localStorage.removeItem('selectedLocation');
        localStorage.removeItem('userId');
        localStorage.removeItem('messagePermission');
        localStorage.removeItem('izLogout');
        localStorage.removeItem('userName');
        localStorage.removeItem('country');
        localStorage.removeItem('izLogin');
        localStorage.removeItem('loginType');
        localStorage.removeItem('toDate');
        localStorage.removeItem('fromDate');
        localStorage.removeItem('initialLoad')
        localStorage.removeItem('eligibleForUserBenefits')
        localStorage.removeItem(this.privateSiteName + "_privateSiteUserId");
        this.router.navigateByUrl('/', { skipLocationChange: true}).then(() => {
          this.router.navigateByUrl('/privatesites/' + this.privateSiteName);
        });
        let url = window.location.href;
        let domain = new URL(url).hostname;
        this.cService.delete('x-header-authToken', "/", domain);
        this.cService.delete('x-header-refreshToken', "/", domain);
      }
    },
      (error => {
        console.log(error);
      }));



  }
  isAuth() {
    if (localStorage.getItem("userId")) {
      if (
        localStorage.getItem("userId") !== null &&
        localStorage.getItem("userId") != undefined
      )
        return true;
    }
    return false;
  }

  changeInSearchCategory(searchType) {
    if(searchType === "poll"){
      this._sharedService.search({privateSiteId: localStorage.getItem(this.siteName+"_siteUserId"), searchType: searchType}).subscribe((response: Array<any>) => {
        this.PollList = response;
      }, error => {
        console.log(error);
      })
    } else if (searchType === "profile"){
      this._sharedService.search({privateSiteId: localStorage.getItem(this.siteName+'_siteUserId'), id: localStorage.getItem("userId"), searchType: searchType}).subscribe((response: Array<any>) => {
        this.UsersList = response;
      })
      this.SearchInfo = [];
    }
    this.searchType = searchType;
  }
  
  openProfilePage(sitename) {
    localStorage.setItem("privateSite", "true");
    if (!this.isAuth()) {
      this.openModalWithComponent(false);
    } 
      var mysite = localStorage.getItem(this.siteName+'_privateSiteName');
      this.router.navigate(["/privatesites/"+mysite + "/profile/mytopics"]);
  }
  navtohome() {
    // if (this.subscriptionObj !== undefined) {
    //   if (this.subscriptionObj.status !== "PENDING") {
    //     var mysite = localStorage.getItem(this.siteName+'_privateSiteName');
    //     this.router.navigate(["/privatesites/" + mysite]);
    //   }
    // } else if (localStorage.getItem('userId') === localStorage.getItem(this.siteName+'_siteOwnerId')) {
    //     var mysite = localStorage.getItem(this.siteName+'_privateSiteName')
    //     this.router.navigate(["/privatesites/" + mysite]);
    //   }
    // this.router.navigateByUrl('/', { skipLocationChange: true}).then(() => {
      this.router.navigateByUrl('/privatesites/' + this.privateSiteName);
    // })
  }
  searchResult(type, searchParam) {
    if (this.tagSearch) {
      this.router.navigateByUrl("/privatesites/"+ this.siteName +"/search/tag?query=" + searchParam.substring(1));
      return;
    }
    this.router.navigateByUrl("privatesites/"+ this.siteName +"/search/" + type + "?query=" + searchParam);
  }
  naviateToProfile(searchType, user) {
    this.router.navigate(["privatesites/"+ localStorage.getItem(this.siteName+"_privateSiteName") +"/userprofile/" + user.userName]);
  }
  naviateToMyProfile(searchType, user) {
    this.router.navigate(["privatesites/+"+ localStorage.getItem(this.siteName+"_privateSiteName") +"/profile/mytopics"]);
    // this.router.navigate(["/userprofile/"+localStorage.getItem("userName")]);

  }
  searchPoll(searchType, poll) {
    var siteName = localStorage.getItem(this.siteName+"_privateSiteName");
    if (siteName !== null) {
      this.router.navigate(["/privatesites/" + siteName  + "/poll/" + poll._id]);
    }
  }
  markAllAsViewed() {
    var data = {
      notifyTo: localStorage.getItem('userId')
    };
    this.newNotifications = false;

    this.hservice.markAsAllViewd(data).subscribe(docs => {

      // this.hservice.markAsAllPrivateViewd(data).subscribe(docs => {
      // this.loading=false;

      this.notifications.forEach(element => {
        // if (element.privateSite) {
        element.isViewed = true;
        // }
      });
    },
      (error => {
        console.log(error);
      }))
  }
  goToLink(notification, event, index) {
    var data = {
      id: notification._id
    };
    var mysite = localStorage.getItem(this.siteName+'_privateSiteName');

    this.hservice.markAsViewd(data).subscribe(docs => {
      if (this.unreadCount > 0)
        this.unreadCount -= 1;
      this.notifications[index].isViewed = true;
      this.notifications[index].isRead = true;
    },
      (error => {
        console.log(error);
      }));
    if (notification.type === "POLL_FOLLOWER") {
      if (notification.createdBy._id === localStorage.getItem(this.siteName+"_siteOwnerId")) {
        return;
      }
      this.router.navigate(["/privatesites/" + mysite + "/userprofile/" + notification.createdBy.userName]);
    } else if (notification.type === "SUBSCRIBE") {
      this.router.navigate(["/privatesites/" + mysite + "/subscribers/0"]);
    } 
    else if (notification.type === "MESSAGE_REQUEST") {
      this.router.navigate(["/privatesites/" + mysite + "/subscribers/2"]);
    }
    else if(notification.type === "MESSAGE"){
      this.router.navigate(["/privatesites/" + mysite + '/messages']);
    } else if (notification.type === "ADMIN"){
      this.router.navigate(["/privatesites/" + mysite + "/settings"]);
    }
    else {
      this.hservice.isPollDeleted(notification.pollId).subscribe(data => {
        var result: any = data;
        if (result.isdelete) {
          window.alert("this poll is delted by the user");
        }
        else {
          this.router.navigate(['/privatesites/' + mysite + '/poll/' + notification.pollId])
        }
      },
        (error => {
          console.log(error);
        }));
      // this.router.navigate(['/poll/'+notification.pollId])
      // $scope.notificationOverlay(notification, notification.type);
    }
  }
  goToUserProfile(createdBy, event, index) {
    this.router.navigate(["/userprofile/" + createdBy]);
  }
  markOneAsRead(notification, index, event) {
    event.stopPropagation();
    var data = {
      id: notification._id
    };
    // this.loading=true;
    this.hservice.markAsViewd(data).subscribe(docs => {
      // this.loading=false;
      this.unreadCount -= 1;
      this.notifications[index].isViewed = true;
      this.notifications[index].isRead = true;
    },
      (error => {
        console.log(error);
      }))
  }

  removeItems() {
    this.removeFromLocalStorage();
    this._signUpModelService.isPrivateSite = "No";
  }

  // Method to navigate to main site
  navToMainSite() {
    this._signUpModelService.isPrivateSite = "No";
    this.removeFromLocalStorage();
    if (this.cService.get('userHomeTabLocation') && this.cService.get('userHomeLocation')) {
      let userHomeTabLocation = this.cService.get('userHomeTabLocation');
      let userHomeLocation = this.cService.get('userHomeLocation');
      this.router.navigateByUrl("/home/"+ userHomeTabLocation + "?location=" + userHomeLocation);
    } else if (this.cService.get('userHomeTabLocation')) {
      let userHomeTabLocation = this.cService.get('userHomeTabLocation');
      this.router.navigateByUrl("/home/"+ userHomeTabLocation + "?location=world");
    } else {
      this.router.navigateByUrl("/home/top?location=world");
    }
  }

  navToAnotherPrivateSite(id) {
    let data = this.privateSites[this.privateSites.findIndex(obj => obj._id === id)]

    localStorage.setItem(data['settings']['siteName']+'_privateSiteName', data['settings']['siteName']);
    localStorage.setItem('privateSiteName', data['settings']['siteName'])
    localStorage.setItem(data['settings']['siteName']+'_privateSiteLogo', data['settings']['siteLogo'])
    localStorage.setItem(data['settings']['siteName']+'_privateSiteLogo', data['settings']['siteLogo'])
    localStorage.setItem(data['settings']['siteName']+'_privateSiteDesc', data['settings']['siteDescription']);
    localStorage.setItem(data['settings']['siteName']+'_privateSiteContact', data['settings']['siteContact']);
    localStorage.setItem(data['settings']['siteName']+'_privateSiteUserId', data['virtualUser']);
    localStorage.setItem(data['settings']['siteName']+'_privateSiteOwnerId', data['ownerId']);
    localStorage.setItem(data['settings']['siteName']+'_privateSiteId', data['_id']);
    localStorage.setItem(data['settings']['siteName']+'_privateSiteUsername', localStorage.getItem('userName'));
    localStorage.setItem('messagePermission', "true");
    localStorage.setItem('privateSite', "true");
    localStorage.setItem(data['settings']['siteName']+'_siteOwnerId', data['ownerId']);
    localStorage.setItem(data['settings']['siteName']+'_privateSiteOwner', data['firstName'] + " " + data['lastName']);
    localStorage.setItem(data['settings']['siteName']+'_siteUserId', data['virtualUser']);

      this.siteName = data['settings']['siteName']
      var privatelink = "/privatesites/" + data['settings']['siteName'];
      this.ngOnInit();
      window.open(privatelink, '_blank')
  }

  navToDrive(): void{
    this.router.navigateByUrl("privatesites/" + this.siteName + "/drive")
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
    this.tagSearch = true;
    this.SearchInfo = this.PollList.filter((item)=>{
      if(item['tags'].includes(tag.slice(0,))){
        return item;
      }
    })
  }
 
  onClickForSearchInput(){
    this.styleBlock = true
  }

  onBlur() {
    setTimeout(() => {
    this.styleBlock = false;
    },300)
  }

  removeFromLocalStorage() {
    localStorage.removeItem(this.siteName+'_privateSiteName')
    localStorage.removeItem(this.siteName+'_privateSiteLogo')
    localStorage.removeItem(this.siteName+'_privateSiteDesc');
    localStorage.removeItem(this.siteName+'_privateSiteContact');
    localStorage.removeItem(this.siteName+'_privateSiteUserId');
    localStorage.removeItem(this.siteName+'_privateSiteOwnerId');
    localStorage.removeItem(this.siteName+'_privateSiteUsername');
    localStorage.removeItem(this.siteName+'_privateSiteId');
    localStorage.removeItem('messagePermission');
    localStorage.removeItem('privateSite');
    localStorage.removeItem(this.siteName+'_siteOwnerId');
    localStorage.removeItem(this.siteName+'_privateSiteOwner')
    localStorage.removeItem(this.siteName+'_siteUserId');
  }

}

