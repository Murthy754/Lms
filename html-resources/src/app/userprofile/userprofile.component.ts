import { PrivatesiteHeaderService } from './../privatesite-header/privatesite-header.service';
import { SubscribersService } from './../subscribers/subscribers.service';
import { AppComponent } from './../app.component';
import { SettingsService } from './../settings/settings.service';
import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { UserprofileService } from "./userprofile.service";
import { forkJoin } from "rxjs";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ModalComponent } from "../modal/modal.component";
import { AuthService } from "../auth.service";
import { SignupComponent } from '../signupmodal/signupmodal.component';
import { SignupmodalService } from '../signupmodal/signupmodal.service';
import { HostListener } from '@angular/core';
import { MessagesService } from '../messages/messages.service';
import { PrivatesiteHomeService } from "../privatesite-home/privatesite-home.service";
@Component({
  providers: [SettingsService, AppComponent],
  selector: "app-userprofile",
  templateUrl: "./userprofile.component.html",
  styleUrls: ["./userprofile.component.scss"],
  preserveWhitespaces: false
})

export class UserprofileComponent implements OnInit {
  virtualData: any;
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    localStorage.removeItem('privateSite');
    localStorage.removeItem('privateSiteName')
    localStorage.removeItem('privateSiteLogo')
    localStorage.removeItem('privateSiteOwner')
    localStorage.removeItem('privateSiteUsername');
    localStorage.removeItem('privateSiteUserId');
    localStorage.removeItem('privateSiteDesc');
    localStorage.removeItem('privateSiteContact');
    localStorage.removeItem('privateSite')
    this.auth.isPrivateSite = "No";
    this.router.navigateByUrl('/home/top?location=world');
    this.appComponent.ngOnInit();
  }
  virtualUserID;
  isPrivateSite: boolean = false;
  userDetails;
  user;
  userId;
  userName;
  pollsInfo: any = [];
  subscriptionObj;
  msgRequestObj;
  urlLocation = "world";
  country = "";
  urlCountry;
  allowAutomaticSubs: boolean = false;
  isSubscriber = false;
  dispalyPendingView = false;
  bsModalRef: BsModalRef;
  displayPrivateSiteinProfile = false;
  virtualUser;
  siteName;
  privateSites: Array<any>
  constructor(
    private appComponent: AppComponent,
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private uService: UserprofileService,
    private modalService: BsModalService,
    public auth: AuthService,
    private sService: SignupmodalService,
    private subService: SubscribersService,
    private settingService: SettingsService,
    private messageService: MessagesService,
    private privatesiteHomeService: PrivatesiteHomeService,
    private _privatesiteHeaderService : PrivatesiteHeaderService
  ) {
  }

  ngOnInit() { 
     
    let link = window.location.pathname.split('/');
    if (link[1] == "privatesites") {
      this.siteName = link[2];
    }
    this.urlCountry = localStorage.getItem("currentCountry");
    if (localStorage.getItem(this.siteName + '_siteUserId')) {
      this.settingService.getPrivateSiteSettings(localStorage.getItem(this.siteName + '_siteUserId')).subscribe(data => {
        this.allowAutomaticSubs = data['allowAutomaticSubscription'];
      });
    }
    if (this.privateSiteCheck()) {
      this.isPrivateSite = true;
      this.auth.isPrivateSite = "Yes";
    } else {
      this.auth.isPrivateSite = "No";
    }
    this.activatedRouter.params.subscribe(data => {
      this.virtualUserID = window.history.state.id
      if (this.virtualUserID !== undefined) {
        this.settingService.getPrivateSiteDetails(this.virtualUserID).subscribe((virtualUserData) => {
           
          this.updateVirtualUserDetails(virtualUserData);
        });
      } else if (data.id && link[1] == "privatesites") {
        this.privatesiteHomeService.getPrivateSiteFromURL(data.id).subscribe(siteData => {
           
          let tempData = Object.assign([], siteData);
          if (tempData.length > 0) {
            this.updateVirtualUserDetails(siteData[0]);
          } else {  
            this.getUserProfile(data);
          }
        });
      } else {
        this.getUserProfile(data);
      }
    },
      (error => {
        console.log(error);
      }));
  }
  
  updateVirtualUserDetails(virtualUserData) {
    if (virtualUserData !== null && virtualUserData['ownerId'] === localStorage.getItem('userId')) { 
        this.userDetails = virtualUserData;
        this.virtualUser = virtualUserData["_id"];
      if (this.userDetails && this.userDetails.address) {
        this.country = this.userDetails.address.country;
      }
      this.user = virtualUserData['_id'];
      this.auth.isPrivateSite = "Yes";
      localStorage.setItem('privateSite', "true");

      localStorage.setItem(this.userDetails.privateSiteSettings.siteName + '_privateSiteUserId', this.userDetails._id);
      localStorage.setItem(this.userDetails.privateSiteSettings.siteName + '_privateSiteName', this.userDetails.privateSiteSettings.siteName)
      localStorage.setItem(this.userDetails.privateSiteSettings.siteName + '_privateSiteLogo', this.userDetails.privateSiteSettings.siteLogo)
      localStorage.setItem(this.userDetails.privateSiteSettings.siteName + '_privateSiteDesc', this.userDetails.privateSiteSettings.siteDescription);
      localStorage.setItem(this.userDetails.privateSiteSettings.siteName + '_privateSiteContact', this.userDetails.privateSiteSettings.siteContact);
      this.userId = this.userDetails.ownerId;
      this.settingService.getUserProfileDetails(this.userDetails.ownerId).subscribe(userData => {
        localStorage.setItem(this.userDetails.privateSiteSettings.siteName + '_privateSiteOwner', userData[0].firstName + ' ' + userData[0].lastName)
        localStorage.setItem(this.userDetails.privateSiteSettings.siteName + '_privateSiteUsername', userData[0].userName);
      });
       
    } else {
      if (virtualUserData !== null) {
        this.virtualData = virtualUserData;
        this.virtualUser = this.virtualData["virtualUser"];
        this.user = virtualUserData['_id'];
        if (localStorage.getItem(this.siteName + '_siteUserId') !== localStorage.getItem('userId')) {
          this.user = localStorage.getItem('userId');
        }
        this.settingService.getUserProfileDetails(this.virtualData['ownerId']).subscribe(userData => {
           
          this.userDetails = userData[0]
          if (this.userDetails && this.userDetails.address) {
            this.country = this.userDetails.address.country;
          }
          this.auth.isPrivateSite = "Yes";
          localStorage.setItem('privateSite', "true");

          localStorage.setItem(this.virtualData['settings'].siteName + '_privateSiteName', this.virtualData['settings'].siteName)
          localStorage.setItem(this.virtualData['settings'].siteName + '_privateSiteLogo', this.virtualData['settings'].siteLogo)
          localStorage.setItem(this.virtualData['settings'].siteName + '_privateSiteDesc', this.virtualData['settings'].siteDescription);
          localStorage.setItem(this.virtualData['settings'].siteName + '_privateSiteContact', this.virtualData['settings'].siteContact);
          this.userId = this.virtualData['ownerId'];

          
          localStorage.setItem(this.virtualData['settings'].siteName + '_privateSiteOwner', userData[0].firstName + ' ' + userData[0].lastName)
          localStorage.setItem(this.virtualData['settings'].siteName + '_privateSiteUsername', userData[0].userName);
        });  
      }
    }
    // Conditionals for privateSiteSettings.siteSubPrivate'
    if (this.virtualData !== undefined) {
      if (!this.virtualData['privateSite'])
        this.getData(this.user);
      else
        this.getSubscprionDetails(this.user);
    }
  }

  getUserProfile(data) {
    if (localStorage.getItem("privateSite") === "false") {
       
      this.displayPrivateSiteinProfile = true;
      this.virtualData = {};
      this.virtualData["privateSite"] = false;
      return
    }
    else {
      this.displayPrivateSiteinProfile = false;
       
      var userObj = {
        username: data.id
      };
      this.uService.getUserProfile(userObj).subscribe(doc => {
         
        if (doc[0] !== undefined) {
          this.userDetails = doc[0];
          this.uService.getAllPrivateSites(this.userDetails._id).subscribe((data: Array<any>) => {
            this.privateSites = data
          }, (error: object) => {
            console.log(error);
          })
          if (this.userDetails && this.userDetails.address)
            this.country = this.userDetails.address.country;
            this.user = doc[0]._id;

            let id = localStorage.getItem("userId");
            let siteId = null;
            if (this.privateSiteCheck()) {
              if (localStorage.getItem(this.siteName + "_privateSiteUserId")) id = localStorage.getItem(this.siteName + "_privateSiteUserId");

              siteId = localStorage.getItem(this.siteName + "_siteUserId");
            }
           // Gets message subscription between users
            this.messageService.getMessageSubscriptionStatus(id, this.user, siteId).subscribe((response) => {
              if (response["result"]) {
                if (response["messageSubscription"]) {
                  this.msgRequestObj = response["messageSubscription"];
                }
              }
            }, (error) => {
              console.log(error);
            });
            
          if (this.userDetails.privateSite===true) {
            var value = "Yes"
            this.auth.isPrivateSite = value;
            localStorage.setItem('privateSite', "true");

            localStorage.setItem(this.userDetails.privateSiteSettings.siteName + '_privateSiteName', this.userDetails.privateSiteSettings.siteName)
            localStorage.setItem(this.userDetails.privateSiteSettings.siteName + '_privateSiteLogo', this.userDetails.privateSiteSettings.siteLogo)
            localStorage.setItem(this.userDetails.privateSiteSettings.siteName + '_privateSiteOwner', this.userDetails.firstName + ' ' + this.userDetails.lastName)
            localStorage.setItem(this.userDetails.privateSiteSettings.siteName + '_privateSiteUsername', this.userDetails.userName);
            localStorage.setItem(this.userDetails.privateSiteSettings.siteName + '_privateSiteUserId', this.userDetails._id);
            localStorage.setItem(this.userDetails.privateSiteSettings.siteName + '_privateSiteDesc', this.userDetails.privateSiteSettings.siteDescription);

            localStorage.setItem(this.userDetails.privateSiteSettings.siteName + '_privateSiteContact', this.userDetails.privateSiteSettings.siteContact);

            if (this.userDetails.privateSiteSettings.siteSubPrivate) {
              localStorage.setItem('privateSiteSubsOnly', "truee")
            }
            else {
              localStorage.setItem('privateSiteSubsOnly', "falsee")
            }
            this.auth.isPrivateSite = value;
          }
          if (!this.userDetails.privateSite){
            this.virtualData = {};
            this.virtualData.privateSite = false;
            this.getData(this.user);
          }
          else {
            this.virtualData = {};
            this.virtualData["privateSite"] = true;
            this.getSubscprionDetails(this.user);
          }
           
        } else {
          return;
        }
      }, (error => {
        console.log(error);
      }));
    }
  }

  getSubscprionDetails(id) {
    var subscriptionObj = {
      id: localStorage.getItem("userId"),
      userid: id + "",
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    };
    if (subscriptionObj.id  === subscriptionObj.userid) {
      subscriptionObj.userid = localStorage.getItem(this.siteName + '_siteUserId');
    }
    this.uService.getSubscrptionStatus(subscriptionObj).subscribe(data => {
      var subData: any = data;
      if (subData.result) {
        this.subscriptionObj = subData.data[0];
        if (this.subscriptionObj.status === 'ACCEPTED')
          this.isSubscriber = true;
        else {
          this.dispalyPendingView = true;
          var value = "create"
          this.sService.AllowCreate = value;
        }

        // else{
        //   const initialState = {
        //     title: "Modal with component"
        //   };
        //   this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
        //   this.bsModalRef.content.alertTitle = "SUBSCRIBE REQUEST";
        //   this.bsModalRef.content.content =
        //     "Are you sure you want to  Subscribee " +
        //     this.userDetails.firstName +
        //     " " +
        //     this.userDetails.lastName +
        //     "?";
        //   this.bsModalRef.content.onClose = myData => {

        //   };
        // }
      }
      else {
        var value = "create"
        this.sService.AllowCreate = value;
        if (!this.auth.isLoggedIn()) {
          this.openModalWithComponent(false);
          return;
        }
        this.dispalyPendingView = true;
      }
       
    },
      (error => {
        console.log(error);
      }));
  }
  getData(id) {
    var userData = {
      userId: this.userDetails._id,
      id: localStorage.getItem("userId"),
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    };
    var subscriptionObj = {
      id: localStorage.getItem("userId"),
      userid: id + "",
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    };
    if (localStorage.getItem(this.siteName + "_privateSiteUserId")) {
      userData.id = localStorage.getItem(this.siteName + '_privateSiteUserId');
      subscriptionObj.id = localStorage.getItem(this.siteName + "_privateSiteUserId");
    }
    return forkJoin(
      this.uService.getSubscrptionStatus(subscriptionObj),
      this.uService.getMyPolls(userData)
    ).subscribe(data => {
      var subData: any = data[0];
      if (subData.result) {
        this.subscriptionObj = subData.data[0];
        if (this.subscriptionObj.status === 'ACCEPTED')
          this.isSubscriber = true;
      }
      this.pollsInfo = data[1];
      if (localStorage.getItem("privateSite") === "true" && localStorage.getItem(this.siteName + "_siteUserId") !== localStorage.getItem("userId")) {
        this.pollsInfo = this.pollsInfo.filter(item => {
          return item.createdFor && item.createdFor.siteUserId === localStorage.getItem(this.siteName + "_siteUserId");
        });
      }
       
    },
      (error => {
        console.log(error);
      }));
  }
  unsubscribednewModal(id, firstName, lastName) {
    const initialState = {
      title: "Modal with component"
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.content.alertTitle = "UNSUBSCRIBE";
    this.bsModalRef.content.content =
      "Are you sure you want to Unsubscribe from " +
      firstName +
      " " +
      lastName +
      "?";
    this.bsModalRef.content.onClose = myData => {
       
      var status = {
        status: "UNSUBSCRIBE"
      };
      this.uService.updaeteSubscrptionStatus(id, status).subscribe(data => {
         
        this.bsModalRef.hide();
        this.ngOnInit();
      },
        (error => {
          console.log(error);
        }));
    };
  }
  cancelModal(id, firstName, lastName) {
    const initialState = {
      title: "Modal with component"
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.content.alertTitle = "CANCEL REQUEST";
    this.bsModalRef.content.content =
      "Are you sure you want to Cancel Subscriber Request from " +
      firstName +
      " " +
      lastName +
      "?";
    this.bsModalRef.content.onClose = myData => {
       
      var status = {
        status: "CANCELLED"
      };
      this.uService.updaeteSubscrptionStatus(id, status).subscribe(data => {
         
        this.bsModalRef.hide();
        this.ngOnInit();
      },
        (error => {
          console.log(error);
        }));
    };
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
  toSubscribe(userDetails) {
    if (!this.auth.isLoggedIn()) {
      this.openModalWithComponent(false);
      return;
    }
    var notifcation = {
      type: "SUBSCRIBE",
      notifyTo: userDetails._id,
      createdBy: this.userProfile(),
      message: "has sent you a subscriber request",
      isRead: false,
      isViewed: false,
      privateSite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    var privateSite = localStorage.getItem("privateSite");
    if (privateSite === "true") {
      notifcation['privateSiteId'] = localStorage.getItem(this.siteName + '_siteUserId');
      notifcation.privateSite = true;
      if (userDetails.virtualUID !== undefined) {
       notifcation.notifyTo = localStorage.getItem(this.siteName + "_siteUserId");
      }
    }
    var data = {
      recipientname: userDetails.firstName + " " + userDetails.lastName,
      recipientid: userDetails._id,
      senderid: localStorage.getItem("userId"),
      sendername:
        localStorage.getItem("userFirstName") +
        " " +
        localStorage.getItem("userLastName"),
      country: localStorage.getItem("country"),   
      tomail: userDetails.email,
      profilePicture: localStorage.getItem("profilePicture"),
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    };
    if (privateSite === "true" && localStorage.getItem(this.siteName + "_siteUserId") === this.virtualUser && this.subscriptionObj === undefined) {
      data.recipientid = localStorage.getItem(this.siteName + "_siteUserId");
    }
    let link = window.location.pathname.split('/');
     
    forkJoin(
      this.uService.addSubscriber(data),
      this.privatesiteHomeService.getPrivateSiteFromURL(link[2])
      ).subscribe(data => {
       
      if (this.privateSiteCheck()) {
        var siteLink = "/privatesites/" + localStorage.getItem(this.siteName + '_privateSiteName');
        this.allowAutomaticSubs = data[1][0]["allowAutomaticSubscription"];
        if (this.allowAutomaticSubs === true && window.location.pathname === siteLink) {
          this.subService.acceptAutomaticSubscriber(data[0]["_id"]).subscribe(res => {
            var siteName = localStorage.getItem(this.siteName + '_privateSiteName')
            this.displayPrivateSiteinProfile = false;
            this.router.navigate(["/privatesites/" + siteName], { state: {id: data[1][0]["_id"]}});
            this.auth.isPrivateSite = "Yes";
            this._privatesiteHeaderService.RefreshPrivateSiteHeader = "Refresh"
            // this.router.navigateByUrl('/', { skipLocationChange: true}).then(() => {
            //   this.router.navigateByUrl('/privatesites/' + this.siteName);
            // })
            // window.location.reload();
          });
          // Create Message subscription with "ACCEPTED" status
          var messageReqData = {
            recipientid: localStorage.getItem(this.siteName + '_siteUserId'),
            senderid: localStorage.getItem('userId'),
            privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
          }
          this.messageService.acceptAutomaticMessageRequest(messageReqData).subscribe(res => {});
  
          // Get all the subscribers
          let subscriptionObj = {
            privateSiteId: localStorage.getItem(this.siteName + '_siteUserId'),
            id: localStorage.getItem(this.siteName + "_siteUserId")
          }
          
          this.subService.getAllSubscribers(subscriptionObj).subscribe(data => {
            var subscribers = Object.assign([], data);
            subscribers.forEach(element => {
              if (element["subscriber"]["_id"] !== localStorage.getItem('userId')) {
                let messageReq = {
                  recipientid: element["subscriber"]["_id"],
                  senderid: localStorage.getItem('userId'),
                  privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
                }
                this.messageService.acceptAutomaticMessageRequest(messageReq).subscribe(res => {});
              }
            });
          });
        }
      } else {
        var obj = {
          feedOption: "start",
          status: "PENDING",
          subscriber: data[0]["subscriber"],
          _id: data[0]["_id"]
        };
        this.subscriptionObj = obj;
      }
      
      this.uService.sendNotifcation(notifcation);     
      this.uService.saveNofication(notifcation).subscribe(res => {
        // Notification saved        
      });
      this.ngOnInit();
      if (this.allowAutomaticSubs === false ) {
        // this.uService.saveNofication(notifcation).subscribe(res => {
        //   // Notification saved        
        // });
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
      }
    },
      (error => {
        console.log(error);
      }));
  }

  // acceptSubscribeRequest(status, subscriber, id) {
  //   var notifcation = {
  //     type: "SUBSCRIBE",
  //     notifyTo: subscriber._id,
  //     createdBy: this.userProfile(),
  //     message: "has accepted your subscriber request",
  //     isRead: false,
  //     subscribeId: localStorage.getItem("userId"),
  //     isViewed: false,
  //     privateSite:false,
  //     createdAt: new Date(),
  //     updatedAt: new Date()
  //   };
  //   var privateSite = localStorage.getItem("privateSite");
  //   if (privateSite === "true") {
  //     notifcation.privateSite = true;
  //   }
  //   this.subService.sendNotifcation(notifcation);
  //   var data = {
  //     recipientname: localStorage.getItem("userFirstName") + " " +localStorage.getItem("userLastName"),
  //     subscriptionid: id,
  //     sendername:
  //       localStorage.getItem("userFirstName") +
  //       " " +
  //       localStorage.getItem("userLastName"),
  //     country: localStorage.getItem("country"),
  //     senderUserName: localStorage.getItem("userName"),
  //     tomail: subscriber.email,
  //     profilePicture: localStorage.getItem("profilePicture")
  //   };
  //    
  //   forkJoin(this.subService.acceptSubscriber(data), this.subService.saveNofication(notifcation)).subscribe(result => {
  //      
  //     return;
  //   },
  //   (error=>{
  //     console.log(error);
  //   }));
  // }

  requestMessage(userDetails) {
    if (!this.auth.isLoggedIn()) {
      this.openModalWithComponent(false);
      return;
    }
    var notifcation = {
      type: "MESSAGE_REQUEST",
      notifyTo: userDetails._id,
      createdBy: this.userProfile(),
      message: "has sent you a message request",
      isRead: false,
      isViewed: false,
      privateSite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    var privateSite = localStorage.getItem("privateSite");
    if (privateSite === "true") {
      notifcation['privateSiteId'] = localStorage.getItem(this.siteName + '_siteUserId');
      notifcation.privateSite = true;
      if (userDetails.virtualUID !== undefined) {
       notifcation.notifyTo = localStorage.getItem(this.siteName + "_siteUserId");
      }
    }
    var data = {
      recipientname: userDetails.firstName + " " + userDetails.lastName,
      recipientid: userDetails._id,
      senderid: localStorage.getItem("userId"),
      sendername:
        localStorage.getItem("userFirstName") +
        " " +
        localStorage.getItem("userLastName"),
      country: localStorage.getItem("country"),
      tomail: userDetails.email,
      profilePicture: localStorage.getItem("profilePicture"),
      privateSiteId: null
    };
    if (this.privateSiteCheck()) {
      if (localStorage.getItem("userId") === localStorage.getItem(this.siteName + "_siteOwnerId")) {
        data.senderid = localStorage.getItem(this.siteName + "_siteUserId");
      }
      data.privateSiteId = localStorage.getItem(this.siteName + "_siteUserId");
    }
     
    this.uService.sendNotifcation(notifcation);
    forkJoin(this.uService.addMessageRequest(data), this.uService.saveNofication(notifcation)).subscribe(data => {
       
      this.msgRequestObj=data[0];
      this.ngOnInit();

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
      (error => {
        console.log(error);
      }));
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
      }
    }
    return data;
  }
  reSubscribe(id, userDetails) {
    var notifcation = {
      type: "SUBSCRIBE",
      notifyTo: userDetails._id,
      createdBy: this.userProfile(),
      message: "has sent you a subscriber request",
      isRead: false,
      isViewed: false,
      privateSite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    var privateSite = localStorage.getItem("privateSite");
    if (privateSite === "true") {
      notifcation.privateSite = true;
    }
     
    var status = {
      status: "PENDING"
    };
    this.uService.sendNotifcation(notifcation);
    forkJoin(this.uService.updaeteSubscrptionStatus(id, status), this.uService.saveNofication(notifcation)).subscribe(data => {
       
      this.ngOnInit();
    },
      (error => {
        console.log(error);
      }))

  }

  // Checks if user is in private site
  privateSiteCheck() {
    let httpLink = window.location.pathname.split('/');
    if (localStorage.getItem("privateSite") === "true" && httpLink[1] === "privatesites") { // Checks localStorage and parses current page link
      return true;
    }
    return false;
  }

  removeMessageModal(msgObj) {
    const initialState = {
      title: "Modal with component",
      subscriberid: msgObj._id
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.content.alertTitle = "REMOVE";
    this.bsModalRef.content.content =
      "Are you sure you want to Remove?";
    this.bsModalRef.content.onClose = myData => {
       
      let requestData = {
        messageSubscriptionObjId: msgObj._id
      };
      this.messageService
        .removeMessaging(requestData)
        .subscribe(response => {
          if (response["result"]) {
            this.msgRequestObj = undefined;
             
            this.bsModalRef.hide();
          }
        },
        (error=>{
           
          console.log(error);
        }));
    };
  }

  navigateToPrivateSite(id) {
    this.uService.getPrivateSiteDetails(id).subscribe((data) => {
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
      }
    );
  }
}
