import { Router, ActivatedRoute } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { TrunumuserSubscriptionsComponent } from "../trunumuser-subscriptions/trunumuser-subscriptions.component";
import { SubscribersService } from "./subscribers.service";
import { forkJoin } from "rxjs";
import { ModalComponent } from "../modal/modal.component";
import { AuthService } from "../auth.service";
import { SettingsService } from './../settings/settings.service';
import { MessagesService } from "./../messages/messages.service";
@Component({
  selector: "app-subscribers",
  templateUrl: "./subscribers.component.html",
  styleUrls: ["./subscribers.component.scss"]
})
export class SubscribersComponent implements OnInit {
  currentTab;
  searchKey = "";
  subscribersearch: String = "";
  subscriptionSearch: String = "";
  subscriptions: any = [];
  
  MainSubscriptionsList: any = [];
  MainSubscriberList: any = [];
  MainMsgRequestList:any =[];
  MainSentRequestList :any =[];
  sentRequestList:any = [];
  
  
  selectedUser = [];
  subscriberlist: any = [];
  messageRequestList:any=[];
  subscriber_pending_array = [];
  dataLoaded = true;
  CountryList: any = [];
  tempCountryList;
  countries: any = [];
  location;
  userId;
  currentCountry;
  bsModalRef: BsModalRef;
  privateSubscribers = [];
  privateSubscriptions = [];
  allowAutomaticSubs: boolean = false;
  siteName: string;
  constructor(
    private router: Router,
    private sService: SubscribersService,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    public auth: AuthService,
    private settingsService: SettingsService,
    private messagesService: MessagesService
  ) { }

  ngOnInit() {
    let link = window.location.pathname.split('/');
    if (link[1] === "privatesites") {
      this.siteName = link[2];
    }
    if (localStorage.getItem(this.siteName + '_siteUserId') !== null) {
      this.settingsService.getPrivateSiteSettings(localStorage.getItem(this.siteName + '_siteUserId')).subscribe(data => {
        this.allowAutomaticSubs = data['allowAutomaticSubscription'];
      })
    }
    if (this.privateSiteCheck()) {
      if (localStorage.getItem(this.siteName + "_currentSelectedCountry") && localStorage.getItem(this.siteName + "_currentSelectedCountry") !== "world") {
        this.currentCountry = localStorage.getItem(this.siteName + "_currentSelectedCountry");
      } else {
        if (localStorage.getItem("country")) {
          this.currentCountry = localStorage.getItem("country");       
        } else {
          this.currentCountry = localStorage.getItem("currentCountry");       
        }
      }
    } else {
      if (localStorage.getItem("currentSelectedCountry") && localStorage.getItem("currentSelectedCountry") !== "world") {
        this.currentCountry = localStorage.getItem("currentSelectedCountry");
      } else {
        if (localStorage.getItem("country")) {
          this.currentCountry = localStorage.getItem("country");       
        } else {
          this.currentCountry = localStorage.getItem("currentCountry");       
        }
      }
    }
    this.userId=localStorage.getItem('userId');
     
    if (this.privateSiteCheck()) {
      this.auth.isPrivateSite = "Yes";
    } else {
      this.auth.isPrivateSite = "No";
    }
    this.route.params.subscribe(params => {
       
      this.location = this.currentCountry;
      if (this.privateSiteCheck()) {
        if (localStorage.getItem(this.siteName + "_currentSelectedCountry")) {
          this.location = localStorage.getItem(this.siteName + "_currentSelectedCountry")
        }
      } else {
        if (localStorage.getItem("currentSelectedCountry")) {
          this.location = localStorage.getItem("currentSelectedCountry");
        }
      }
      
      this.currentTab = params["id"];
      if (this.currentTab === undefined) {
        this.currentTab = 0;
      }
      this.getData();
    },
    (error=>{
      console.log(error);
    }));
  }
  navigateToProfile(userName) {
    if (this.privateSiteCheck()) {
      if (userName === localStorage.getItem(this.siteName + "_privateSiteName")) {
        return;
      }
      var siteName = localStorage.getItem(this.siteName + "_privateSiteName");
      this.router.navigate(["privatesites/" + siteName +"/userprofile/" + userName]);
    } else {
      this.router.navigate(["/userprofile/" + userName]);
    }
    // this.router.navigate(["/userprofile/" + userName]);
  }
  changeFeedOption(subscription, i) {
    if (this.subscriptions[i].feedoption === "stop") {
      this.subscriptions[i].feedoption = "start";
    } else {
      this.subscriptions[i].feedoption = "stop";
    }
    var feedoptions = {
      feedoption: this.subscriptions[i].feedoption
    };
     
    this.sService
      .feedOptionUpdateOnSubscription(subscription._id, feedoptions)
      .subscribe(data => {
        if (data) {
           
        }
      },
      (error=>{
        console.log(error);
      }));
  }
  getFilterConutries(searchKey) {
    this.tempCountryList = [];
    this.tempCountryList = this.CountryList.filter(item => {
      return item.name.toLowerCase().includes(searchKey.toLowerCase());
    });
    return this.tempCountryList;
  }

  locationChange(country, tabIndex) {
    if (this.privateSiteCheck()) {
      if (country === "World") {
        localStorage.setItem(this.siteName + "_currentSelectedCountry", "world");
      } else {
        localStorage.setItem(this.siteName + "_currentSelectedCountry", country);
      }
    } else {
      if (country === "World") {
        localStorage.setItem("currentSelectedCountry", "world");
      } else {
        localStorage.setItem("currentSelectedCountry", country);
      }
    }
    
    this.searchKey = "";
    this.tempCountryList = this.CountryList;
    this.messageRequestList = [];
    this.subscriberlist = [];
    this.subscriptions= [];
     
    var countryObj = {
      id: localStorage.getItem("userId"),
      // country: this.currentCountry,
      country: country,
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    };
    if (this.privateSiteCheck()) {
      if (localStorage.getItem('userId') === localStorage.getItem(this.siteName + '_siteOwnerId')) {
        countryObj.id = localStorage.getItem(this.siteName + '_privateSiteUserId');
      }
    }
    if (tabIndex === 0) {
      if (country !== "world") {
          this.currentCountry = country;
          this.sService.getSubscribersByCountry(countryObj).subscribe(data => {
            this.location = this.currentCountry;
             
            this.subscriberlist = data;
            this.MainSubscriberList = data;
          },
          (error=>{
            console.log(error);
          }));
          this.sService.getSubscriptionsByCountry(countryObj).subscribe(data => {
            this.location = this.currentCountry;
             
            this.MainSubscriptionsList = data;
            this.subscriptions = data;
          },
          (error=>{
            console.log(error);
          }));
          this.sService.getMessageRequestByCountry(countryObj).subscribe(data => {
            this.location = this.currentCountry;
             
            this.messageRequestList = data;
          });
          this.sService.getSentRequestByCountry(countryObj).subscribe(data => {
            this.location = this.currentCountry;
             
            this.MainSentRequestList = data;
            this.sentRequestList = data;
            this.messageRequestList=this.messageRequestList.concat(data);
            
          },
          (error=>{
            console.log(error);
          }));
      } else {
        this.sService.getAllSubscribers(countryObj).subscribe(data => {
          this.location = 'world';
           
          let subscribers: any = data;
          subscribers = subscribers.filter((obj, index, self) =>
            index === self.findIndex((t) => (
              t.subscribee === obj.subscribee && t.privateSiteId === obj.privateSiteId && t.subscriber._id === obj.subscriber._id
            ))
          )
          this.subscriberlist = subscribers;
          this.MainSubscriberList = subscribers;
        },
        (error=>{
          console.log(error);
        }));
        if (this.privateSiteCheck()) {
           
          this.sService.getAllVirtualSubscribers(countryObj).subscribe(data => {
            this.location = "world";
             
            if (localStorage.getItem('userId') !== localStorage.getItem(this.siteName + "_siteOwnerId")) {
              var virtualSubscriber = data;
              if (virtualSubscriber[0] !== undefined) {
                virtualSubscriber[0]["subscriber"]["userName"] = ""
                virtualSubscriber[0]["subscriber"]["userName"] = localStorage.getItem(this.siteName + "_privateSiteName");
                virtualSubscriber[0]["subscriber"].profilePicture = "";
                virtualSubscriber[0]["subscriber"].profilePicture = localStorage.getItem(this.siteName + "_privateSiteLogo");
                virtualSubscriber[0]["subscriber"]["firstName"] = "";
                virtualSubscriber[0]["subscriber"]["firstName"] = localStorage.getItem(this.siteName + "_privateSiteName");
                virtualSubscriber[0]["subscriber"]["lastName"] = ""
                virtualSubscriber[0]["subscriber"]["lastName"] = "(Site Admin)";
                this.subscriberlist = this.subscriberlist.concat(virtualSubscriber);
              }
            }
          });
        }
        this.sService.getAllSubscriptions(countryObj).subscribe(data => {
          this.location = "world";
           
          this.MainSubscriptionsList = data;
          this.subscriptions = data;
        },
        (error=>{
          console.log(error);
        }));
        this.sService.getAllMessageRequest(countryObj).subscribe(data => {
          this.location = "world";
           
          this.messageRequestList = data;
        });
        this.sService.getAllSentRequestByCountry(countryObj).subscribe(data => {
          this.location = "world";
           
          this.MainSentRequestList = data;
          this.sentRequestList = data;
          this.messageRequestList=this.messageRequestList.concat(data);
        },
        (error=>{
          console.log(error);
        }));
      }
    } else if (tabIndex === 1) {
      if (country !== "world") {
        this.currentCountry = country;
        this.sService.getSubscriptionsByCountry(countryObj).subscribe(data => {
          this.location = this.currentCountry;
           
          this.MainSubscriptionsList = data;
          this.subscriptions = data;
        },
        (error=>{
          console.log(error);
        }));
        this.sService.getSubscribersByCountry(countryObj).subscribe(data => {
          this.location = this.currentCountry;
           
          this.subscriberlist = data;
          this.MainSubscriberList = data;
        },
        (error=>{
          console.log(error);
        }));
        this.sService.getMessageRequestByCountry(countryObj).subscribe(data => {
          this.location = this.currentCountry;
           
          this.messageRequestList = data;
        });
        
        this.sService.getSentRequestByCountry(countryObj).subscribe(data => {
          this.location = this.currentCountry;
           
          this.MainSentRequestList = data;
          this.sentRequestList = data;
          this.messageRequestList=this.messageRequestList.concat(data);
        },
        (error=>{
          console.log(error);
        }));

        this.location = country;
      } else {
        this.sService.getAllSubscriptions(countryObj).subscribe(data => {
          this.location = "world";
           
          this.MainSubscriptionsList = data;
          this.subscriptions = data;
        },
        (error=>{
          console.log(error);
        }));
        this.sService.getAllSubscribers(countryObj).subscribe(data  => {
          this.location = 'world';
           
          this.subscriberlist = data;
          this.MainSubscriberList = data;
        },
        (error=>{
          console.log(error);
        }));
        this.sService.getAllMessageRequest(countryObj).subscribe(data => {
          this.location = "world";
           
          this.messageRequestList = data;
        });
        this.sService.getAllSentRequestByCountry(countryObj).subscribe(data => {
          this.location = "world";
           
          this.MainSentRequestList = data;
          this.sentRequestList = data;
          this.messageRequestList=this.messageRequestList.concat(data);
        },
        (error=>{
          console.log(error);
        }));
        if (this.privateSiteCheck()) {
           
          this.sService.getAllVirtualSubscribers(countryObj).subscribe(data => {
            this.location = "world";
            if (localStorage.getItem('userId') !== localStorage.getItem(this.siteName + "_siteOwnerId")) {
              var virtualSubscriber = data;
              if (virtualSubscriber[0] !== undefined) {
                virtualSubscriber[0]["subscriber"]["userName"] = ""
                virtualSubscriber[0]["subscriber"]["userName"] = localStorage.getItem(this.siteName + "_privateSiteName");
                virtualSubscriber[0]["subscriber"].profilePicture = "";
                virtualSubscriber[0]["subscriber"].profilePicture = localStorage.getItem(this.siteName + "_privateSiteLogo");
                virtualSubscriber[0]["subscriber"]["firstName"] = "";
                virtualSubscriber[0]["subscriber"]["firstName"] = localStorage.getItem(this.siteName + "_privateSiteName");
                virtualSubscriber[0]["subscriber"]["lastName"] = ""
                virtualSubscriber[0]["subscriber"]["lastName"] = "(Site Admin)";
                this.subscriberlist = this.subscriberlist.concat(virtualSubscriber);
              }
            }
             
          });
        }
      }
    } else if (tabIndex === 2) {
      if (country !== "world") {
        this.currentCountry = country;
        this.sService.getMessageRequestByCountry(countryObj).subscribe(data => {
          this.location = this.currentCountry;
           
          this.messageRequestList = data;
          this.MainSubscriberList = data;
        },
        (error=>{
          console.log(error);
        }));
        this.sService.getSubscribersByCountry(countryObj).subscribe(data => {
          this.location = this.currentCountry;
           
          this.subscriberlist = data;
          this.MainSubscriberList = data;
        },
        (error=>{
          console.log(error);
        }));
        this.sService.getSubscriptionsByCountry(countryObj).subscribe(data => {
          this.location = this.currentCountry;
           
          this.MainSubscriptionsList = data;
          this.subscriptions = data;
        },
        (error=>{
          console.log(error);
        }));
        this.sService.getSentRequestByCountry(countryObj).subscribe(data => {
          this.location = this.currentCountry;
           
          this.MainSentRequestList = data;
          this.sentRequestList = data;
          this.messageRequestList=this.messageRequestList.concat(data);
          
        },
        (error=>{
          console.log(error);
        }));

      } else {
        this.sService.getAllMessageRequest(countryObj).subscribe(data => {
          this.location = "world";
           
          this.messageRequestList = data;
          this.MainMsgRequestList = data;
        },
        (error=>{
          console.log(error);
        }));
        this.sService.getAllSentRequestByCountry(countryObj).subscribe(data => {
          this.location = "world";
           
          this.MainSentRequestList = data;
          this.sentRequestList = data;
          this.messageRequestList=this.messageRequestList.concat(data);
        },
        (error=>{
          console.log(error);
        }));
        this.sService.getAllSubscribers(countryObj).subscribe(data => {
          this.location = "world";
           
          this.subscriberlist = data;
          this.MainSubscriberList = data;
        },
        (error=>{
          console.log(error);
        }));
        this.sService.getAllSubscriptions(countryObj).subscribe(data => {
          this.location = "world";
           
          this.MainSubscriptionsList = data;
          this.subscriptions = data;
        },
        (error=>{
          console.log(error);
        }));
        if (this.privateSiteCheck()) {
           
          this.sService.getAllVirtualSubscribers(countryObj).subscribe(data => {
            this.location = "world";
             
            var virtualSubscriber = data;
            if (virtualSubscriber[0] !== undefined) {
              if (localStorage.getItem('userId') !== localStorage.getItem(this.siteName + "_siteOwnerId")) {
                var virtualSubscriber = data;
                virtualSubscriber[0]["subscriber"]["userName"] = "";
                virtualSubscriber[0]["subscriber"]["userName"] = localStorage.getItem(this.siteName + "_privateSiteName");
                virtualSubscriber[0]["subscriber"].profilePicture = "";
                virtualSubscriber[0]["subscriber"].profilePicture = localStorage.getItem(this.siteName + "_privateSiteLogo");
                virtualSubscriber[0]["subscriber"]["firstName"] = "";
                virtualSubscriber[0]["subscriber"]["firstName"] = localStorage.getItem(this.siteName + "_privateSiteName");
                virtualSubscriber[0]["subscriber"]["lastName"] = ""
                virtualSubscriber[0]["subscriber"]["lastName"] = "(Site Admin)";
                this.subscriberlist = this.subscriberlist.concat(virtualSubscriber);
              }
            }
          });
        }
      }
    }
     

  }
  unsubscribeModal(subscription, index) {
    const initialState = {
      title: "Modal with component",
      subscriberid: subscription.subscribee._id
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.content.alertTitle = "REMOVE";
    this.bsModalRef.content.content =
      "Are you sure you want to Unsubscribe from " +
      subscription.subscribee.firstName +
      " " +
      subscription.subscribee.lastName +
      "?";
    this.bsModalRef.content.onClose = myData => {
       
      var status = {
        status: "UNSUBSCRIBE"
      };
      this.sService
        .updaeteSubscrptionStatus(subscription._id, status)
        .subscribe(data => {
          this.subscriptions.splice(index, 1);
           
          this.bsModalRef.hide();
        },
        (error=>{
          console.log(error);
        }));
    };
  }
  removeModal(subscriber, index) {
    const initialState = {
      title: "Modal with component",
      subscriberid: subscriber.subscriber._id
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.content.alertTitle = "REMOVE";
    this.bsModalRef.content.content =
      "Are you sure you want to Remove from " +
      subscriber.subscriber.firstName +
      " " +
      subscriber.subscriber.lastName +
      "?";
    this.bsModalRef.content.onClose = myData => {
       
      var status = {
        status: "UNSUBSCRIBE"
      };
      this.sService
        .updaeteSubscrptionStatus(subscriber._id, status)
        .subscribe(data => {
          this.subscriberlist.splice(index, 1);
           
          this.bsModalRef.hide();
        },
        (error=>{
          console.log(error);
        }));
    };
  }
  
  removeMessageModal(subscriber, index) {
    const initialState = {
      title: "Modal with component",
      subscriberid: subscriber.subscriber._id
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.content.alertTitle = "REMOVE";
    this.bsModalRef.content.content =
      "Are you sure you want to Remove from " +
      subscriber.subscriber.firstName +
      " " +
      subscriber.subscriber.lastName +
      "?";
    this.bsModalRef.content.onClose = myData => {
       
      let requestData = {
        messageSubscriptionObjId: subscriber._id
      };
      this.messagesService
        .removeMessaging(requestData)
        .subscribe(data => {
          this.messageRequestList.splice(index, 1);
           
          this.bsModalRef.hide();
        },
        (error=>{
          console.log(error);
        }));
    };
  }
  serachSubscribers(searchText: String) {
    this.subscribersearch = searchText;
    this.subscriberlist = this.MainSubscriberList.filter(item => {
      return (
        item.subscriber.firstName
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        item.subscriber.lastName
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        (
          item.subscriber.firstName.toLowerCase() +
          " " +
          item.subscriber.lastName.toLowerCase()
        ).includes(searchText.toLowerCase())
      );
    });
  }
  serachSubscriptions(searchText: String) {
    this.subscriptionSearch = searchText;
    this.subscriptions = this.MainSubscriptionsList.filter(item => {
      return (
        item.subscribee.firstName
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        item.subscribee.lastName
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        (
          item.subscribee.firstName.toLowerCase() +
          " " +
          item.subscribee.lastName.toLowerCase()
        ).includes(searchText.toLowerCase())
      );
    });
  }
  acceptSubscribeRequest(status, subscriber, id) {
    var notifcation = {
      type: "SUBSCRIBE",
      notifyTo: subscriber._id,
      createdBy: this.userProfile(),
      message: "has accepted your subscriber request",
      isRead: false,
      subscribeId: localStorage.getItem("userId"),
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
    this.sService.sendNotifcation(notifcation);
    var data = {
      recipientname: subscriber.firstName + " " + subscriber.lastName,
      subscriptionid: id,
      sendername:
        localStorage.getItem("userFirstName") +
        " " +
        localStorage.getItem("userLastName"),
      country: localStorage.getItem("country"),
      senderUserName: localStorage.getItem("userName"),
      tomail: subscriber.email,
      profilePicture: localStorage.getItem("profilePicture"),
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    };
     
    forkJoin(
      this.sService.acceptSubscriber(data), 
      this.sService.saveNofication(notifcation)).subscribe(result => {
       
      if (this.privateSiteCheck()) {
        if (this.allowAutomaticSubs === false && localStorage.getItem('userId') === localStorage.getItem(this.siteName + "_siteOwnerId")) {
          // Create Message subscription with "ACCEPTED" status
          var messageReqData = {
            recipientid: localStorage.getItem(this.siteName + '_siteUserId'),
            senderid: result[1]['notifyTo'],
            privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
          }
          this.messagesService.acceptAutomaticMessageRequest(messageReqData)
            .subscribe(res => {});
          
            // Get all the subscribers
          let subscriptionObj = {
            privateSiteId: localStorage.getItem(this.siteName + '_siteUserId'),
            id: localStorage.getItem(this.siteName + "_siteUserId")
          }
          
          this.sService.getAllSubscribers(subscriptionObj).subscribe(data => {
            var subscribers = Object.assign([], data);
            subscribers.forEach(element => {
              // if (localStorage.getItem(this.siteName + "_privateSiteUserId")) {
                // if (localStorage.getItem(this.siteName + "_privateSiteUserId") !== element["subscribee"]) {
                // if (element["subscriber"]["_id"] === localStorage.getItem('userId')) {
                  let messageReq = {
                    recipientid: element["subscriber"]["_id"],
                    senderid: result[1]['notifyTo'],
                    privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
                  }
                  this.messagesService.acceptAutomaticMessageRequest(messageReq).subscribe(res => {});
                // }
              // }
            });
          });
        }
      }
      let index = this.MainSubscriberList.findIndex((obj) => obj._id === id);
      this.MainSubscriberList[index]["status"] = "ACCEPTED";
    },
    (error=>{
      console.log(error);
    }));
  }
  acceptMessageRequest(status, subscriber, id) {
    var notifcation = {
      type: "MESSAGE_REQUEST",
      notifyTo: subscriber._id,
      createdBy: this.userProfile(),
      message: "has accepted your message request",
      isRead: false,
      subscribeId: localStorage.getItem("userId"),
      isViewed: false,
      privateSite:false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    var privateSite = localStorage.getItem("privateSite");
    if (privateSite === "true") {
      notifcation.privateSite = true;
      Notification['privateSiteId'] = localStorage.getItem(this.siteName + '_siteUserId');
    }
    this.sService.sendNotifcation(notifcation);
    var data = {
      recipientname: subscriber.firstName + " " + subscriber.lastName,
      subscriptionid: id,
      sendername:
        localStorage.getItem("userFirstName") +
        " " +
        localStorage.getItem("userLastName"),
      country: localStorage.getItem("country"),
      senderUserName: localStorage.getItem("userName"),
      tomail: subscriber.email,
      profilePicture: localStorage.getItem("profilePicture")
    };
     
    forkJoin(this.sService.acceptMessageRequest(data), this.sService.saveNofication(notifcation)).subscribe(result => {
       
      // this.ngOnInit();
      let index = this.MainMsgRequestList.findIndex((obj) => obj._id === id);
      this.MainMsgRequestList[index]["status"] = "ACCEPTED";
    },
    (error=>{
      console.log(error);
    }));
  }
  updateSubscribeStatus(statu, subscriber, index) {
     
    var status = {
      status: "CANCELLED"
    };
    this.sService
      .updaeteSubscrptionStatus(subscriber._id, status)
      .subscribe(data => {
        this.subscriberlist.splice(index, 1);
         
      },
      (error=>{
        console.log(error);
      }));
  }
  updateMessageRequestStatus(statu, subscriber, index) {
     
    var status = {
      status: "CANCELLED"
    };
    this.sService
      .updateMessageRequestStatus(subscriber._id, status)
      .subscribe(data => {
        this.subscriberlist.splice(index, 1);
         
      },
      (error=>{
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
    if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
      data._id = localStorage.getItem(this.siteName + '_privateSiteUserId');
    }
    return data;
  }
  getData() {

    var countryObj = {
      id: localStorage.getItem("userId"),
      country: this.currentCountry,
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    };
    if (this.privateSiteCheck()) {
      if (localStorage.getItem(this.siteName + '_privateSiteUsername') === localStorage.getItem('userName')) {
        var countryObj = {
          id: localStorage.getItem(this.siteName + "_privateSiteUserId"),
          country: this.currentCountry,
          privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
        };
      }
    }
    if (this.location === "world") {
      forkJoin(
        this.sService.getAllSubscribers(countryObj),
        this.sService.getAllSubscriptions(countryObj),
        this.sService.getJSON(),
        this.sService.getAllMessageRequest(countryObj),
        this.sService.getAllSentRequestByCountry(countryObj)
      ).subscribe(data => {
         
        this.subscriberlist = data[0];
        this.MainSubscriberList = data[0];
        this.MainSubscriptionsList = data[1];
        this.subscriptions = data[1];
        this.CountryList = data[2];
        this.tempCountryList = data[2];
        this.messageRequestList = data[3];
        this.MainMsgRequestList = data[3];
        this.messageRequestList=this.messageRequestList.concat(data[4]);
      });
    } else {
      forkJoin(
        this.sService.getSubscribersByCountry(countryObj),
        this.sService.getSubscriptionsByCountry(countryObj),
        this.sService.getJSON(),
        this.sService.getMessageRequestByCountry(countryObj),
        this.sService.getSentRequestByCountry(countryObj)
      ).subscribe(data => {
         
        // this.location = this.currentCountry;
        this.subscriberlist = data[0];
        this.MainSubscriberList = data[0];
        this.MainSubscriptionsList = data[1];
        this.subscriptions = data[1];
        this.CountryList = data[2];
        this.tempCountryList = data[2];
        this.messageRequestList = data[3];
        this.MainMsgRequestList = data[3];
        this.sentRequestList = data[4];
        this.MainSentRequestList = data[4];
        
        this.messageRequestList=(this.messageRequestList).concat(data[4]);
      },
      (error=>{
        console.log(error);
      }));
    }
  }
  changeSubscribers(tabIndex) {
    var siteName=localStorage.getItem(this.siteName + '_privateSiteName');
    
    if (tabIndex === 0) {
      if(siteName){
        this.router.navigate(["privatesites/" + siteName +"/subscribers/0"]);
      } else {
        this.router.navigate(["subscribers/0"]);
      }
    }else if(tabIndex === 1){
      if(siteName){
        this.router.navigate(["privatesites/" + siteName +"/subscribers/1"]);
      } else {
        this.router.navigate(["subscribers/1"]);
      }
    } else {
      if(siteName){
        this.router.navigate(["privatesites/" + siteName + "/subscribers/2"]);
      } else {
        this.router.navigate(["subscribers/2"]);
      }
    }
  }
  
  trunumsSubscriptions() {
    const initialState = {
      list: [
        "Open a modal with component",
        "Pass your data",
        "Do something else",
        "..."
      ],
      title: "Modal with component"
    };
    this.bsModalRef = this.modalService.show(TrunumuserSubscriptionsComponent, {
      initialState
    });
    this.bsModalRef.content.closeBtnName = "Close";
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
