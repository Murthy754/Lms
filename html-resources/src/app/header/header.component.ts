import { AppComponent } from './../app.component';
import { SettingsService } from './../settings/settings.service';
import { Component, Input, OnInit, NgZone } from "@angular/core";
import { Router } from "@angular/router";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { SignupComponent } from "../signupmodal/signupmodal.component";
import { TopicmodalComponent } from "../topicmodal/topicmodal.component";
import { HeaderService } from "./header.service";
import { forkJoin } from "rxjs";
import { SignupmodalService } from '../signupmodal/signupmodal.service';
import { Socket } from 'ngx-socket-io';
import { CookieService } from "ngx-cookie-service";
import { AuthService } from '../auth.service';
import { ModalComponent } from '../modal/modal.component';
import { SharedService } from '../shared-services/shared.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as _ from 'lodash';

@Component({
  providers: [AppComponent],
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit {
  @Input() name: string;
  reloadSubscription: any;
  maxvalue = 10;
  isLoggedIn: boolean = true;
  UsersList: any = [];
  PollList: any = [];
  PrivateSitesList: any = [];
  SearchInfo = [];
  userId = "";
  newNotifications = false;
  notifications: any = [];
  PollSearchList = [];
  searchtext = "";
  searchType = "poll";
  showSignup: boolean;
  unreadCount = 0;
  SelectedPrivateSite;
  privateSitePresent: boolean = false;
  privateSites = [];
  bsModalRef: BsModalRef
  viewCreatePrivateSite: Boolean = true;
  userData = {
    userId: "",
    userName: "",
    userMail: "",
    profilePicture: ""
  };
  siteName: String = "";
  tagSearch: Boolean = false;
  private_site_subscriber_limit = 0;
  private_sites_limit = 0;
  styleBlock: Boolean = false;
  configurations: any = {}

  constructor(
    private ngZone: NgZone,
    private modalService: BsModalService,
    public router: Router,
    private hservice: HeaderService,
    public authService: SignupmodalService,
    private cService: CookieService,
    private aService: AuthService,
    private soc: Socket,
    private sService: SettingsService,
    // private sharedService: SharedService,
    private snackBar: MatSnackBar,
    private _sharedService: SharedService
  ) {
    this.authService.privateSite.subscribe(privateSiteId => {
      if(privateSiteId){
        this.privateSites = [];
        this.onInit()
      }
    })
    this.soc.fromEvent<any>('Notifcation').subscribe(data => {
      var notification: any = data;
      if (notification.notifyTo === localStorage.getItem('userId') && notification.privateSite === false) {
        this.notifications.unshift(data);
        this.unreadCount+=1;
        this.newNotifications = true;
      }
    },
    (error=>{
      console.log(error);
    }))

    // authService.isNotifications.subscribe(notify=>{
    // // if(!this.router.url.includes('/home/')){
    //   if (notify==='yes') {
    //     // this.ngOnInit();
    //     this.getNotifications();
    //   }
    // // }
    // })
    authService.getNewPolls.subscribe(currentUser => {
      if (currentUser) {
        this.ngOnInit();
      }
    },
    (error=>{
      console.log(error);
    }))
    authService.itemValue.subscribe(currentUser => {
      if (currentUser) {
        this.ngOnInit();
      }
    },
    (error=>{
      console.log(error);
    }))
  }

  ngOnInit() {
    this.onInit()
  }

   onInit() {
    this.checkPrivateSiteEligibility();
    this.changeInSearchCategory(this.searchType)
    let link = window.location.pathname.split('/');
    if (this.privateSiteCheck()) {
      this.siteName = link[2];
    }
    if (localStorage.getItem("userId")) {
      this.isLoggedIn = true;
      this.userId = localStorage.getItem("userId");
      this.getNotifications()
    } else {
      this.isLoggedIn = false;
    }
    this.getData();
    if (localStorage.getItem("userId") !== null) {
      this.sService.getUserProfileDetails(localStorage.getItem("userId")).subscribe((res) => {
         
        var virtualUID = res[0].virtualUID;
        virtualUID.forEach(id => {
           
          this.sService.getVirtualUserProfileDetails(id).subscribe((data) => {
             
            if (data !== null) {
              this.privateSites.push(data);
              // this.viewCreatePrivateSite = false;
            }
          });
          if (virtualUID.length >0) {
            this.privateSitePresent = true;
          } else {
            this.privateSitePresent = false;
          }
        });
         
        this.sService.gePrivateSites(localStorage.getItem("userId")).subscribe((response) => {
           
          if (response["success"]) {
            if (response["data"] && response["data"].length > 0) {
              let data = response["data"];
              if (data[data.length - 1].subscribersCount > 500) {
                this.viewCreatePrivateSite = true;
              }
            }
          }
        });
      });
    }
    if (localStorage.length > 0) {
      this.userData = {
        userId: localStorage.getItem("userId"),
        userName: localStorage.getItem("userName"),
        userMail: localStorage.getItem("userMail"),
        profilePicture: localStorage.getItem("profilePicture")
      };
    }
   }
   checkPrivateSiteEligibility() {
        this.configurations = this._sharedService.getConfigurations();
        if (this.configurations != {}) {
          let private_sites_limit = (this.configurations["private_sites_limit"]) ? this.configurations["private_sites_limit"] : 5;
          let private_site_subscriber_limit = (this.configurations["private_site_subscriber_limit"]) ? this.configurations["private_site_subscriber_limit"] : 0;

          this.sService.gePrivateSites(localStorage.getItem("userId")).subscribe((response) => {
            if (response["success"]) {
              if (response["data"] && response["data"].length > 0) {
                let private_sites = response["data"];
                private_sites.sort((a, b) => {
                  return b.subscribersCount - a.subscribersCount
                });
                let privasiteEnable = false;
                if (private_sites.length < private_sites_limit) {
                  private_sites.forEach((site) => {
                    if (site.subscribersCount >= private_site_subscriber_limit) {
                      privasiteEnable = true;
                    } else {
                      privasiteEnable = false;
                    }
                  });
                  (privasiteEnable) ? this.viewCreatePrivateSite = true : this.viewCreatePrivateSite = false;
                } else {
                  this.viewCreatePrivateSite = false;
                }
              } else {
                this.viewCreatePrivateSite = true;
              }
            }
          });
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
      this.cService.set('polltype', 'TrunumsPoll');
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
            return (
              item.question.toLowerCase().includes(text.toLowerCase()) ||
              (item.tags && item.tags.indexOf(text)>-1)
          );
        });
      }
    } else if (this.searchType === "privateSite") {
        this.SearchInfo = this.PrivateSitesList.filter(item => {  
          return (
            item.settings.siteName.toLowerCase().includes(text.toLowerCase())
          );
        });
    } else if (this.searchType === "tag") {
      this.getTagPolls(text.substring(1));
    } else {
      this.SearchInfo = this.UsersList.filter(item => {
        return (
          item.firstName.toLowerCase().includes(text.toLowerCase()) ||
          item.userName.toLowerCase().includes(text.toLowerCase()) ||
          item.lastName.toLowerCase().includes(text.toLowerCase()) ||
          (
            item.firstName.toLowerCase() +
            " " +
            item.lastName.toLowerCase()
          ).includes(text.toLowerCase())
        );
      });
      if (this.SearchInfo.length === 0) {
        this.SearchInfo = this.UsersList.filter(item => {
          return (
            item.userName.toLowerCase().includes(text.toLowerCase())
          );
        });
      }
    }
  }
  

  getData() {
     
    return forkJoin(this.hservice.getCurrentIpLocation()).subscribe(data => {
       
      if(data[0] && data[0].names)
      localStorage.setItem("currentCountry", data[0].names["en"]);
    },
    (error=>{
       
      console.log(error);
    }));
  }
  getNotifications() {
    var data = {
      notifyTo: localStorage.getItem('userId')
    }
     
    this.hservice.getNotifications(data).subscribe(docs => {
       
      this.notifications = docs;
      this.notifications.forEach(element => {
        if (!element.isRead)
          this.unreadCount += 1;
        if (!element.isViewed)
          this.newNotifications = true;
      });
    },
    (error=>{
       
      console.log(error);
    }));
  }
  
  openSettings() {
    if (!this.isAuth()) {
      this.openModalWithComponent(false);
    } else {
      this.router.navigate(["/settings"]);
    }
  }

  navToSettings() {
    if (!this.isAuth()) {
      this.openModalWithComponent(false);
    } else {
      this.router.navigate(["/settings"]);
    }
  }
  navToNotifications() {
    this.router.navigate(['/notifications']);
  }
  logout() {
    this.SearchInfo = [];
    this.searchtext = "";
     
    this.hservice.userLogout({id:localStorage.getItem("userId")}).subscribe(data => {
       
      var result: any = data;
      this.hservice.sendUserStatus(data);
      if (result) {
        var value = "True";
        localStorage.clear();
        let url = window.location.href;
        let domain = new URL(url).hostname;
        this.cService.delete('x-header-authToken', "/", domain);
        this.cService.delete('x-header-refreshToken', "/", domain);
        this.authService.newPOlls = value;
        this.ngZone.run(() => {
          this.privateSitePresent = false;
          this.privateSites = [];
        });
        // if (!this.router.url.includes('/home/'))
        this.router.navigateByUrl("/home/top?location=world");
        this.ngOnInit();
        this.openModalWithComponent(false);
      }
     
    },
    (error=>{
       
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
    if(searchType == "poll"){
     
      this._sharedService.search({searchType: "poll"}).subscribe(response =>{
         
        this.PollList = response;
      }, error => {
         
      })
    } else if (searchType === "profile"){
     
      this._sharedService.search({searchType: "profile"}).subscribe((response: Array<any>) => {
         
        this.UsersList = response;
      }, error => {
         
      })
    } else if (searchType === "privateSite"){
     
      this._sharedService.search({searchType: "privateSite"}).subscribe(response => {
         
        this.PrivateSitesList = response;
      }, error => {
         
      })
    }
    this.searchType = searchType;
    this.SearchInfo = [];
    this.searchtext = "";
  }
  
  openProfilePage() {
    if (!this.isAuth()) {
      this.openModalWithComponent(false);
    } else {
      this.router.navigate(["/profile/mytopics"]);
    }
  }

  navtomessages() {
    this.router.navigateByUrl("/messages");
  }

  navtohome() {
    let userHomeTabLocation = this.cService.get('userHomeTabLocation');
    let userHomeLocation = this.cService.get('userHomeLocation');
    if (userHomeTabLocation && userHomeLocation) {
      this.router.navigateByUrl("/home/"+ userHomeTabLocation + "?location=" + userHomeLocation);
      return;
    }
    let location = localStorage.getItem('selectedLocation');
    if (location !== null) {
      if (location === "world") {
        this.router.navigateByUrl("home/top?location=world");
      } else {
        this.router.navigateByUrl("home/top?location=" + location);
      }
    } else {
      this.router.navigateByUrl("home/top?location=current");
    }
  }
  searchResult(type, searchParam) {
    if (this.tagSearch) {
      this.router.navigateByUrl("/search/tag?query=" + searchParam.substring(1));
      return;
    }
    this.router.navigateByUrl("/search/" + type + "?query=" + searchParam);
  }
  navigateToProfile(searchType, user) {
    
    // var strWindowFeatures =
    //   "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";
    // var url = window.location.origin + "/userprofile/" + user.userName;
    // if (user.privateSite) {
    //   if (this.isAuth())
    //     window.open(url, "_blank", strWindowFeatures);
    //   else
    //     this.openModalWithComponent(false);
    //     // this.router.navigateByUrl("/userprofile/" + user.userName);
    // }
    // // else
      this.router.navigate(["/userprofile/" + user.userName]);
  }
  // Method to navigate to private site
  navigateToPrivateSite(id) {
    this.sService.getPrivateSiteDetails(id).subscribe((data) => {
       
      if (localStorage.getItem('userId') === data['ownerId']){
        localStorage.setItem(data['settings']['siteName']+'_privateSiteName', data['settings']['siteName']);
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
        var privatelink = "/privatesites/" + data['settings']['siteName'];
        this.router.navigateByUrl(privatelink);
      } else {
         
        this.sService.getUserProfileDetails(data['ownerId']).subscribe((res) => {
           
          var id = data["_id"];
          localStorage.setItem(data['settings']['siteName'] + '_privateSiteName', data['settings']['siteName'])
          localStorage.setItem(data['settings']['siteName'] + '_privateSiteLogo', data['settings']['siteLogo'])
          localStorage.setItem(data['settings']['siteName'] + '_privateSiteDesc', data['settings']['siteDescription']);
          localStorage.setItem(data['settings']['siteName'] + '_privateSiteContact', data['settings']['siteContact']);
          localStorage.setItem(data['settings']['siteName'] + '_privateSiteId', data['_id']);
          localStorage.setItem(data['settings']['siteName'] + '_siteUserId', data['virtualUser']);
          localStorage.setItem(data['settings']['siteName'] + '_siteOwnerId', data['ownerId']);
          localStorage.setItem('messagePermission', "true");
          localStorage.setItem('privateSite', "true");
          this.router.navigate(["/privatesites/" + data['settings']['siteName']], { state: {id: id}});
          // this.router.navigateByUrl(privateLink);
        });
      }
    });
  }

  naviateToMyProfile(searchType, user) {
    this.router.navigate(["/profile/mytopics"]);
  }
  searchPoll(searchType, poll) {
    this.router.navigate(["/poll/" + poll._id]);
  }
  markAllAsViewed() {
    //  
    var data = {
      notifyTo: localStorage.getItem('userId')
    };
    this.newNotifications = false;
    this.hservice.markAsAllViewd(data).subscribe(docs => {
      //  
      this.notifications.forEach(element => {
        element.isViewed = true;
      });
    },
    (error=>{
      console.log(error);
    }))
  }
  goToLink(notification, event, index) {
    var data = {
      id: notification._id
    };
     
    this.hservice.markAsViewd(data).subscribe(docs => {
      this.unreadCount -= 1;
       
      this.notifications[index].isViewed = true;
      this.notifications[index].isRead = true;
    },
    (error=>{
       
      console.log(error);
    }));
    if (notification.type === "POLL_FOLLOWER") {
      this.router.navigate(["/userprofile/" + notification.createdBy.userName]);
    } else if (notification.type === "SUBSCRIBE") {
      this.router.navigate(["subscribers/0"]);
    }
    else if (notification.type === "MESSAGE_REQUEST") {
      this.router.navigate(["subscribers/2"]);
    }
    else if(notification.type === "MESSAGE"){
      this.router.navigate(['/messages']);
      
    } else if (notification.type === "COMMENT_REPLY") {
      
    } else {
       
      this.hservice.isPollDeleted(notification.pollId).subscribe(data => {
         
        var result: any = data;
        if (result.isdelete) {
          window.alert("This poll is deleted by the user");
        }
        else {
          this.router.navigate(['/poll/' + notification.pollId])
        }
      },
      (error=>{
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
     
    this.hservice.markAsViewd(data).subscribe(docs => {
       
      this.unreadCount -= 1;
      this.notifications[index].isViewed = true;
      this.notifications[index].isRead = true;
    },
    (error=>{
       
      console.log(error);
    }))
  }

  // Opens contact us modal popup
  openContactUsModal(): void {
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
    this.bsModalRef.content.content = "Email: admin@trunums.com"
  }

  // Opens about modal popup
  openAboutModal(): void {
    const initialState = {
      list: [
        "Open a modal with component",
        "Pass your data",
        "Do something else",
        "..."
      ],
      title: "About TruNums"
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.setClass("my-modal");
    this.bsModalRef.content.alertTitle = "Contact Information";
    this.bsModalRef.content.isCancel = true;
    this.bsModalRef.content.content = "TruNums is a question-and-answer site where questions are asked, answered, edited and organized by its community of users."
  }

  clearSearch() {
    this.searchtext = "";
  }

  getTagPolls(tag) {
    this.tagSearch = true;
    this.SearchInfo = _.filter(this.PollList, (item)=>{
      if(item['tags'].includes(tag.slice(0,))){
        return item;
      }
    })
  }
  
  // Checks if user is in private site
  privateSiteCheck() {
    let httpLink = window.location.pathname.split('/');
    if (localStorage.getItem("privateSite") === "true" && httpLink[1] === "privatesites") { // Checks localStorage and parses current page link
      return true;
    }
    return false;
  }

  // Changes Private site status to active or inactive
  changePrivateSiteStatus(privateSiteId: String, status: boolean, siteName: String){

    const initialState = {
      title: "Modal with component"
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.content.alertTitle = "Alert";
    if(status) {
      this.bsModalRef.content.content =
      "Are you sure you want to Activate this Private Site " + siteName +"?" ;
    } else {
      this.bsModalRef.content.content =
      "Are you sure you want to Deactivate this Private Site " + siteName +"?" ;
    }
    this.bsModalRef.content.onClose = myData => {
      this.bsModalRef.hide();


    let data = {privatesiteId : privateSiteId, status : status};
    this.hservice.changePrivatesiteStatus(data).subscribe(data => {
      this.privateSites[_.findIndex(this.privateSites, {_id : privateSiteId})]['isActive'] = status;
      if(status){
        this.snackBar.open("Private Site Activated",  "OK", {duration : 2000})
      }else{
        this.snackBar.open("Private Site Dectivated", "OK", {duration : 2000})
      }
      this.changeInSearchText('');
    }, err => console.log(err)
    )
  }
}
  onClickForSearchInput() {
    this.styleBlock = true;
  }

  onBlur() {
    setTimeout(() => {
      this.styleBlock = false;
    }, 300)

  }
}
