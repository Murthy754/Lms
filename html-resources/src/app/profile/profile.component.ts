import { Component, OnInit, HostListener } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { TrunumuserSubscriptionsComponent } from "../trunumuser-subscriptions/trunumuser-subscriptions.component";
import { forkJoin } from "rxjs";
import { Router, ActivatedRoute } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { ProfileService } from "./profile.service";
import { Options } from "ng5-slider";
import { PollinfoService } from "../pollinfo/pollinfo.service";
import { ModalComponent } from "../modal/modal.component";
import { CookieService } from "ngx-cookie-service";
import { SignupmodalService } from '../signupmodal/signupmodal.service';
import { AuthService } from "../auth.service";
import { SubscribersService } from "../subscribers/subscribers.service";
import { UserprofileService } from "../userprofile/userprofile.service";
import { SettingsService } from "../settings/settings.service";
import { UploadService } from "../shared-services/upload.service";
import { MatDialog, MatSnackBar, MAT_ICON_LOCATION } from '@angular/material';
import { VerifiedVoteModalComponent } from "../pollinfo/verified-vote-modal/verified-vote-modal.component";
import { SharedService } from "../shared-services/shared.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"]
})
export class ProfileComponent implements OnInit {
  isWrapperStiky = false;
  displayAds: Boolean = false;
  public contactForm: FormGroup;
  @HostListener("window:scroll", ["$event"])
  scrollHandler(event) {
    if (window.pageYOffset && window.pageYOffset > 82) {
      this.isWrapperStiky = true;
    } else this.isWrapperStiky = false;
  }
  bsModalRef: BsModalRef;
  EditProfile: FormGroup;
  countries: any = [];
  privateSiteUserId;
  searchKey = "";
  mobileCategoies = [];
  currentCountry;
  location;
  pollCoutry;
  tempCountryList;
  CountryList: any = [];
  country;
  siteName: String;
  privateSite: boolean = false;
  isOwner: boolean = false;
  userName = "";
  countryname = "";
  phone: any;
  valueForSlider = 0;
  currentTab;
  email = "";
  myInfo: any = [];
  FollowTopicArray = [];
  FlagTopicArray = [];
  subscriberlist: any = [];
  Ccode: any = [];
  subscriptions: any = [];
  profileedit = false;
  profilePicture: any;
  profileFile;
  currentPageFeed = 1;
  PollList: any = [];
  FeedPollsList: any = [];
  categoryInf: any = [];
  categoryInfo = [];
  categoryfilter = [];
  itemcountFeed: any = 0;
  VotesInfo: any = [];
  VotesInfoGroup: any = [];
  FeedList: any = [];
  userId = "";
  privateSubscribers = [];
  privateSubscriptions = [];
  messageRequestList: any = [];
  MainMsgRequestList;
  countryCode = "1";
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
    ticksTooltip: value => {
      return `People Voted for: ${value}`;
    }
  };
  constructor(
    private modalService: BsModalService,
    private router: Router,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private pService: ProfileService,
    private route: ActivatedRoute,
    private pollService: PollinfoService,
    private cookieService: CookieService,
    public sService: SignupmodalService,
    public auth: AuthService,
    private subscriptionService: SubscribersService,
    private userProfileService: UserprofileService,
    private settingsService: SettingsService,
    private uploadService: UploadService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private sharedService: SharedService
  ) { 
    this.contactForm = this.fb.group({
      formControlPhone: ['', Validators.required]
    });
  }
  ngOnInit() {
    this.onInit();
  }

  async onInit() {
    let link = window.location.pathname.split('/');
    if (this.privateSiteCheck()) {
      this.siteName = link[2];
      this.privateSite = true;
      if (localStorage.getItem("userId") === localStorage.getItem(this.siteName + "_siteOwnerId")) {
        this.isOwner = true;
      }
    }
    this.privateSiteUserId = localStorage.getItem(this.siteName + "_privateSiteUserId");
    this.userId = localStorage.getItem("userId");
    this.userName = localStorage.getItem("userName");
    this.email = localStorage.getItem("userMail");
     
    this.EditProfile = this.fb.group({
      firstName: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(35),
          Validators.pattern("^[a-zA-Z]*$")
        ]
      ],
      lastName: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(35),
          Validators.pattern("^[a-zA-Z]*$")
        ]
      ]
    });
    var userIdObj = {
      id: localStorage.getItem("userId"),
      country: localStorage.getItem("currentCountry"),
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    };
    
    if (this.cookieService.get('userProfileLocation')) {
      userIdObj.country = this.cookieService.get('userProfileLocation');
    }
    
    if (this.privateSiteCheck()) {
      this.auth.isPrivateSite = "Yes";
    } else {
      this.auth.isPrivateSite = "No";
    }

    if (this.privateSiteCheck()) {
      if (localStorage.getItem(this.siteName + '_privateSiteUsername') === localStorage.getItem('userName')) {
        var privateUserId = { id: localStorage.getItem(this.siteName + '_privateSiteUserId'), country: localStorage.getItem("currentCountry"), privateSiteId: localStorage.getItem(this.siteName + '_siteUserId') }

        this.getData(privateUserId).then(dataaa => {
          if (dataaa[0].length > 0) {
            this.privateSubscribers = dataaa[0].map((a) => { return a.subscriber.userName; });
          }
          if (dataaa[1].length > 0) {
            this.privateSubscriptions = dataaa[1].map((a) => { return a.subscribee.userName; });
          }
          this.privateSubscribers.push(localStorage.getItem(this.siteName + '_privateSiteUsername'));
          this.privateSubscriptions.push(localStorage.getItem(this.siteName + '_privateSiteUsername'));

          this.locationChange(privateUserId.country, 1);
        });
      } else {
        this.getData(userIdObj).then(dataaa => {
          if (dataaa[0].length > 0) {
            this.privateSubscribers = dataaa[0].map((a) => { return a.subscriber.userName; });
          }
          if (dataaa[1].length > 0) {
            this.privateSubscriptions = dataaa[1].map((a) => { return a.subscribee.userName; });
          }
          this.privateSubscribers.push(localStorage.getItem(this.siteName + '_privateSiteUsername'));
          this.privateSubscriptions.push(localStorage.getItem(this.siteName + '_privateSiteUsername'));
        });
      }
    } else {
      await this.getData(userIdObj).then(dataaa => {});
    }
    this.route.params.subscribe(dataa => {
      this.currentTab = dataa.id;
      if (this.cookieService.get("userProfileTab")) {
        this.currentTab = this.cookieService.get("userProfileTab")
      } else if (this.cookieService.get(this.siteName + "_userProfileTab")) {
        this.currentTab = this.cookieService.get(this.siteName + "_userProfileTab");
      }
      this.currentPageFeed = 1;
      if (this.currentTab === "mytopics") {
        this.locationChange(this.currentCountry, 1);
      } else if (this.currentTab === "myvotes") {
        this.locationChange(this.currentCountry, 1);
      } else if (this.currentTab === "myfeed") {
        this.locationChange(this.currentCountry, 1);
      } else {
         
        this.currentTab = 'mytopics'
        this.locationChange(this.currentCountry, 1);
      }
    },
      (error => {
        console.log(error);
      }));

    // Get global configurations for settings
    let configurations = {};
    configurations = this.sharedService.getConfigurations()
    if (configurations != {}) {
      this.displayAds = (configurations["show_google_ads"]) ? configurations["show_google_ads"] : this.displayAds;
    }

  }

  createNewTopic() {
    this.router.navigate(["/topic/new/start"]);
  }
  onChangeTab(tab) {
    if (this.privateSiteCheck()){
      var siteName = localStorage.getItem(this.siteName + "_privateSiteName");
      this.router.navigate(["privatesites/" + siteName + "/profile/" + tab]);
      this.cookieService.set(this.siteName + "_userProfileTab", tab);
    } else {
      this.router.navigate(["/profile/" + tab]);
      this.cookieService.set("userProfileTab", tab);
    }
  }
  changeSubscribers(tabIndex) {
    var siteName = localStorage.getItem(this.siteName + '_privateSiteName');
    if (tabIndex === 0) {
      if (siteName) {
        this.router.navigate(["privatesites/" + siteName + "/subscribers/0"]);
      } else {
        this.router.navigate(["subscribers/0"]);
      }
    } else if (tabIndex === 1) {
      if (siteName) {
        this.router.navigate(["privatesites/" + siteName + "/subscribers/1"]);
      } else {
        this.router.navigate(["subscribers/1"]);
      }
    } else {
      if (siteName) {
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
  getStautsPending() {
    var count = 0;
    var SearchInfo = this.subscriberlist.filter(item => {
      return item.status.includes("PENDING");
    });
    if (SearchInfo.length > 0) return true;
    else return false;
  }
  getData(userIdObj) {
    return new Promise((res, rej) => {
      forkJoin(
        this.pService.getSubscribersByCountry(userIdObj),
        this.pService.getSubscriptionsByCountry(userIdObj),
        this.pService.getJSON(),
        this.pService.getCurrentIpLocation(),
        this.pService.getMyInfo(localStorage.getItem("userId")),
        this.pService.getCategories(),
        this.subscriptionService.getMessageRequestByCountry(userIdObj),
        this.subscriptionService.getSentRequestByCountry(userIdObj)
      ).subscribe((data: any) => {
        this.categoryInf = data[5];
        
        // For mobile category cookies
        if (this.privateSiteCheck()) {
          if (this.cookieService.get(this.siteName + "_userMobileProfileCategory")) {
            let categories = JSON.parse(this.cookieService.get(this.siteName + "_userMobileProfileCategory"));
            for (var key in categories) {
              if (categories.hasOwnProperty(key)) {
                this.mobileCategoies.push(categories[key]);
              }
            }
          }
        } else {
          if (this.cookieService.get("userMobileProfileCategory")) {
            let categories = JSON.parse(this.cookieService.get("userMobileProfileCategory"));
            for (var key in categories) {
              if (categories.hasOwnProperty(key)) {
                this.mobileCategoies.push(categories[key]);
              }
            }
          }
        }
        this.categoryInfo = this.categoryInf;
        if (this.cookieService.get('userProfileCategory')) {
          let categories = JSON.parse(this.cookieService.get('userProfileCategory'));
          this.categoryfilter = categories;
          this.categoryfilter.forEach((category) => {
            for (let i=0; i < this.categoryInfo.length ; i++) {
              if (this.categoryInfo[i]._id === category._id) {
                this.categoryInfo.splice(i, 1);
              }
            }
          });
        }
        this.countries = data[2];
        this.Ccode = data[3];
        if (this.Ccode && this.Ccode.names) {
          this.currentCountry = this.Ccode.names.en;
          this.pollCoutry = this.Ccode.names.en;
        }        

        // If private site
        if (this.privateSiteCheck()) {
          if (localStorage.getItem(this.siteName + '_privateSiteUsername') !== localStorage.getItem('userName')) {
            var newSubscribers = [];
            var newSubscriptions = [];
            data[0].forEach(element => {
              if (this.privateSubscribers.indexOf(element.subscriber.userName) > -1) {
                newSubscribers.push(element);
              }
            });
            data[1].forEach(element => {
              if (this.privateSubscriptions.indexOf(element.subscribee.userName) > -1) {
                newSubscriptions.push(element);
              }
            });
            this.subscriberlist = newSubscribers;
            this.subscriptions = newSubscriptions;
            if (newSubscribers.length < 1 || newSubscriptions.length < 1) {
              this.subscriberlist = data[0];
              this.subscriptions = data[1];
            }
          }
          else {
            this.subscriberlist = data[0];
            this.subscriptions = data[1];
          }
          let userPrivateHomeLocation = this.cookieService.get("userPrivateHomeLocation");
          if (userPrivateHomeLocation) {
            this.currentCountry = userPrivateHomeLocation;
          }
        } else {
          let userHomeLocation = this.cookieService.get("userProfileLocation");
          if (userHomeLocation && userHomeLocation !== "world") {
            this.currentCountry = userHomeLocation;
          }
          this.subscriberlist = data[0];
          this.subscriptions = data[1];
          this.messageRequestList = data[6];
        }
        //if not private site

        this.myInfo = data[4];
        this.CountryList = data[2];
        this.tempCountryList = this.CountryList;
        this.setProfileData(data[4]);
         
        var feedpolls = {
          userId: localStorage.getItem("userId"),
          id: localStorage.getItem("userId"),
          pollsterset: this.subscriptions,
          country: this.currentCountry
        };
        res(data);
      },
        (error => {
          console.info(error);
        }));
    });
  }
  setProfileData(data) {
    this.EditProfile.controls["firstName"].setValue(data[0].firstName);
    this.EditProfile.controls["lastName"].setValue(data[0].lastName);
    this.profilePicture = data[0].profilePicture;
    var countryObj = {
      name: data[0].address.country
    };
    this.country = countryObj;
    this.countryname = data[0].address.country;
    if (localStorage.getItem(this.siteName + "_privateSiteUserId")) {
      this.EditProfile.controls["firstName"].setValue(localStorage.getItem(this.siteName + "_privateSiteName"));
      this.EditProfile.controls["lastName"].setValue(" (Admin)");
      this.profilePicture = localStorage.getItem(this.siteName + '_privateSiteLogo');
    }
    if (this.privateSiteCheck()) {
      let phoneData = data[0].verifiedNumbersList;
      if (phoneData.length > 0) {
        for (let i=0; i < phoneData.length; i++) {
          if (localStorage.getItem(this.siteName + "_siteUserId") === phoneData[i]["privateSiteId"]) {
            if (phoneData[i].phoneVerified) {
              this.phone = phoneData[i].phone;
              return;
            } else {
              this.phone = null
            }
          } else {
            this.phone = null
          }
        }
      } else {
        this.phone = null
      }
    } else {
      if (data[0].phone !== null && data[0].phoneVerified) {
        this.phone = data[0].phone;
      } else {
        this.phone = null;
      }
    }
  }
  edit() {
    this.profileedit = true;
  }
  uploadProfilePicture() {
    this.uploadService.uploadFile(this.profileFile).then(
      pased => {
        this.profileFile = null;
        this.upDateProfileData(pased.Location);
      },
      err => {
        this.upDateProfileData(null);
      }
    );
  }
  upDateProfileData(url) {
    var profilePicture;
    if (url !== null) {
      profilePicture = url;
    } else {
      profilePicture = this.profilePicture;
    }
    var updateProfileObj = {
      id: localStorage.getItem("userId"),
      firstName: this.EditProfile.controls["firstName"].value,
      lastName: this.EditProfile.controls["lastName"].value,
      address: {
        country: this.country.name
      },
      profilePicture: profilePicture
    };
    this.pService.updateProfile(updateProfileObj).subscribe(data => {
      var result: any = data;
      localStorage.setItem("userId", result._id);
      localStorage.setItem("userName", result.userName);
      localStorage.setItem("userMail", result.email);
      localStorage.setItem("profilePicture", result.profilePicture);
      localStorage.setItem("userFirstName", result.firstName);
      localStorage.setItem("userLastName", result.lastName);
      localStorage.setItem("country", result.address.country);
      if(result.eligibleForUserBenefits) {
        localStorage.setItem("eligibleForUserBenefits", result.eligibleForUserBenefits);
      }
      if (document.getElementById('my-profile-picture')) {
        (document.getElementById('my-profile-picture') as HTMLImageElement).src = result.profilePicture;
      } else {
        this.onInit();
      }
       
      this.profileedit = false;
    },
      (error => {
        console.log(error);
      }));
  }
  gettopciscount(feedpolls) {
    if (this.location !== 'world') {
      this.pService.getpollcount(feedpolls).subscribe(data => {
        this.itemcountFeed = data;
      },
        (error => {
          console.log(error);
        }));
    }
    else {
      this.pService.getpollcountybyworld(feedpolls).subscribe(data => {
        this.itemcountFeed = data;
      },
        (error => {
          console.log(error);
        }));
    }
  }

  profileSave() {
     
    if (this.profileFile) {
      this.uploadProfilePicture();
    } else {
      this.upDateProfileData(null);
    }
    if (this.EditProfile.invalid) return;
  }
  getfeedpollscount(feedpolls, location) {
    if (this.location !== 'world') {
      this.pService.getfeedcount(feedpolls).subscribe(data => {
        this.itemcountFeed = data;
      },
        (error => {
          console.log(error);
        }));
    }
    else {
      this.pService.getfeedcountybyworld(feedpolls).subscribe(data => {
        this.itemcountFeed = data;
      },
        (error => {
          console.log(error);
        }));
    }
  }
  onFileChange(event) {
    this.profileFile = event.target.files[0];
    this.profilePicture = this.sanitizer.bypassSecurityTrustUrl(
      URL.createObjectURL(this.profileFile)
    );
  }
  SearchPolls(searchParam) {
    this.categoryInfo = this.categoryInf.filter(item => {
      return item.name.toLowerCase().includes(searchParam.toLowerCase());
    });
  }
  filterPolls(item, index) {
    this.categoryfilter.push(item);
    this.cookieService.set("userProfileCategory", JSON.stringify(this.categoryfilter));
    this.categoryInfo.splice(index, 1);
    this.getTopics();
    this.currentPageFeed = 1;
  }
  removecategoryPolls(item, index) {
    this.categoryInfo.push(item);
    this.categoryfilter.splice(index, 1);
    this.cookieService.set("userProfileCategory", JSON.stringify(this.categoryfilter));
    this.categoryInfo.sort((a, b) => a.name.localeCompare(b.name));
    this.getTopics();
    this.currentPageFeed = 1;
  }
  mobilecategoryPolls(catname) {
    var temppolls = this.mobileCategoies.filter(item => {
      return item === catname;
    });
    if (temppolls.length == 0) {
      this.mobileCategoies.push(catname);
      if (this.privateSiteCheck()) {
        this.cookieService.set(this.siteName + "_userMobileProfileCategory", JSON.stringify(this.mobileCategoies));
      } else {
        this.cookieService.set("userMobileProfileCategory", JSON.stringify(this.mobileCategoies));
      }
    }
    else {
      var index = this.mobileCategoies.indexOf(catname);
      if (index !== -1) {
        this.mobileCategoies.splice(index, 1);
        if (this.privateSiteCheck()) {
          this.cookieService.set(this.siteName + "_userMobileProfileCategory", JSON.stringify(this.mobileCategoies));
        } else {
          this.cookieService.set("userMobileProfileCategory", JSON.stringify(this.mobileCategoies));
        }
      }
    }
  }
  checkCategory(catname) {
    var temppolls = this.mobileCategoies.filter(item => {
      return item === catname;
    });
    if (temppolls.length > 0) return true;
    return false;
  }
  getPollsCateogies() {
    if (this.categoryfilter.length > 0) {
      var tempCats: any = [];
      this.categoryfilter.forEach(element => {
        tempCats.push(element.name)
      });
      return tempCats;
    }
    else if (this.mobileCategoies.length > 0)
      return this.mobileCategoies;
    else {
      var tempCats: any = [];
      this.categoryInf.forEach(element => {
        tempCats.push(element.name)
      });
      return tempCats;
    }
  }
  getTopics() {
    var tempCountry;
    var feedpolls = {
      userId: localStorage.getItem("userId"),
      id: localStorage.getItem("userId"),
      pollsterset: this.subscriptions,
      country: this.currentCountry,
      categories: this.getPollsCateogies()
    };
    if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
      feedpolls.userId = localStorage.getItem(this.siteName + '_privateSiteUserId');
    }
    if (this.location === 'world') {
      tempCountry = 'world'
    }
    else {
      tempCountry = this.currentCountry;
    }
    if (this.currentTab === "mytopics") {
      this.locationChange(tempCountry, 1);
    } else if (this.currentTab === "myvotes") {
      this.locationChange(tempCountry, 1);
    } else if (this.currentTab === "myfeed") {
      this.locationChange(tempCountry, 1);
      this.getfeedpollscount(feedpolls, this.currentCountry)
    }
  }
  navtoProfile() { }
  navtoUserProfile(id) { }
  votesss(Option, pollvote, ind, mainindex) {
    var poll = pollvote.poll;
    if (!poll.verifiedVote || (localStorage.getItem('userId') === poll.pollster[0]['_id'])) {
      this.voteConfirmed(Option, pollvote, ind, mainindex);
    } else {
      // Verify phone
      this.pollService.getUserProfileDetails(localStorage.getItem('userId')).subscribe((userDetails) => {
        let user = userDetails;
        if (user) {
          if (user[0]['phone'] !== null && user[0]['phoneVerified']) {
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
                this.pollService.insertVerifiedVoter(requestData).subscribe(data => { }, (error) => {
                   
                  console.error(error);
                });
                this.voteConfirmed(Option, pollvote, ind, mainindex);
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
                this.pollService.insertVerifiedVoter(requestData).subscribe(data => { }, (error) => {
                   
                  console.error(error);
                });
                this.voteConfirmed(Option, pollvote, ind, mainindex);
              } else {
                 
                return;
              }
            });
          }
        }
      });
    }
    
  }

  voteConfirmed(Option, pollvote, ind, mainindex) {
    var poll = pollvote.poll;
    var pollresltupdate = {
      result: Option,
      id: pollvote._id
    };
    var pollCastCountByAnswer = poll.pollCastCountByAnswer;
    if (pollCastCountByAnswer[Option]) {
      pollCastCountByAnswer[Option] += 1;
    } else {
      pollCastCountByAnswer[Option] = 1;
    }
    pollCastCountByAnswer[pollvote.result] -= 1;
    if (this.pollCoutry === poll.country) {
      var targetCountryCountByAnswer = poll.targetCountryCountByAnswer;
      if (targetCountryCountByAnswer[Option]) {
        targetCountryCountByAnswer[Option] += 1;
      } else targetCountryCountByAnswer[Option] = 1;
      targetCountryCountByAnswer[pollvote.tempresult] -= 1;
      var data = {
        pollCastCountByAnswer: pollCastCountByAnswer,
        targetCountryCountByAnswer: targetCountryCountByAnswer
      };

      this.updateBothVotes(
        data,
        pollvote,
        poll,
        ind,
        mainindex,
        pollresltupdate
      );
    } else {
      var data2 = {
        pollCastCountByAnswer: pollCastCountByAnswer
      };
      this.updateSingleVote(
        data2,
        pollvote,
        poll,
        ind,
        mainindex,
        pollresltupdate
      );
    }
    this.VotesInfoGroup[mainindex].values[ind].result = Option;
    this.VotesInfoGroup[mainindex].values[ind].tempresult = Option;
  }

  updateBothVotes(data, vote, poll, ind, mainindex, pollresltupdate) {
    return forkJoin(
      this.pollService.updateBoth(data, poll._id),
      this.pollService.updatePollResult(pollresltupdate, vote._id)
    ).subscribe(result => {
      var res: any = result;
      this.VotesInfoGroup[mainindex].values[ind].poll.pollCastCountByAnswer =
        res[0].pollCastCountByAnswer;
      this.VotesInfoGroup[mainindex].values[
        ind
      ].poll.targetCountryCountByAnswer = res[0].targetCountryCountByAnswer;

       
    },
      (error => {
        console.log(error);
      }));
  }
  updateSingleVote(data, vote, poll, ind, mainindex, pollresltupdate) {
    return forkJoin(
      this.pollService.updatepollCastCountByAnswer(
        data.pollCastCountByAnswer,
        poll._id
      ),
      this.pollService.updatePollResult(pollresltupdate, vote._id)
    ).subscribe(result => {
      var res: any = result;
      this.VotesInfoGroup[mainindex].values[ind].poll.pollCastCountByAnswer =
        res[0].pollCastCountByAnswer;
       
    },
      (error => {
        console.log(error);
      }));
  }
  locationChange(location, pageno) {
    // Uncomment below lines for getting current country from cache
    // if (this.privateSiteCheck()) {
    //   if (location === "World") {
    //     localStorage.setItem(this.siteName + "_currentSelectedCountry", "world");
    //   } else {
    //     localStorage.setItem(this.siteName + "_currentSelectedCountry", location);
    //   }
    // } else {
    //   if (location === "World") {
    //     localStorage.setItem("currentSelectedCountry", "world");
    //   } else {
    //     localStorage.setItem("currentSelectedCountry", location);
    //   }
    // }
    this.searchKey = "";
    this.tempCountryList = this.CountryList;
     
    this.subscriberlist = [];
    this.subscriptions = [];
    this.messageRequestList = [];
    if (location === "world") {
      var userId;
      userId = localStorage.getItem('userId');
      if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
        userId = localStorage.getItem(this.siteName + '_privateSiteUserId');
      }
      this.pService.getAllSubscribers({ id: userId, privateSiteId: localStorage.getItem(this.siteName + '_siteUserId') }).subscribe(data => {
        // this.location = 'world';
        this.subscriberlist = data;
      },
        (error => {
          console.log(error);
        }));
      this.pService.getAllSubscriptions({ id: userId, privateSiteId: localStorage.getItem(this.siteName + '_siteUserId') }).subscribe(data => {
        // this.location = "world";
        this.subscriptions = data;
      },
        (error => {
          console.log(error);
        }));

      this.subscriptionService.getAllMessageRequest({ id: userId, privateSiteId: localStorage.getItem(this.siteName + '_siteUserId') }).subscribe(data => {
        // this.location = this.currentCountry;
         
        this.messageRequestList = data;
        // this.MainMsgRequestList = data;
      },
      (error=>{
        console.log(error);
      }));

      this.subscriptionService.getAllSentRequestByCountry({ id: userId, privateSiteId: localStorage.getItem(this.siteName + '_siteUserId') }).subscribe((data: any) => {
        if (data && data.length > 0) {
          data.forEach(element => {
            this.messageRequestList.push(element);
          })
        }
      },
      (error=>{
        console.log(error);
      }));

      if (this.privateSiteCheck()) {
        let countryObj = {
          id: localStorage.getItem("userId"),
          country: location,
          privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
        };
        if (this.privateSiteCheck()) {
          if (localStorage.getItem('userId') === localStorage.getItem(this.siteName + '_siteOwnerId')) {
            countryObj.id = localStorage.getItem(this.siteName + '_privateSiteUserId');
          }
        }
        this.subscriptionService.getAllVirtualSubscribers(countryObj).subscribe(data => {
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

      this.location = location;
      var feedpolls = {
        userId: localStorage.getItem("userId"),
        id: localStorage.getItem("userId"),
        pollsterset: this.subscriptions,
        country: this.currentCountry,
        pageno: pageno,
        categories: this.getPollsCateogies(),
        privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
      };
      if (this.privateSiteCheck()) {
        var feedpolls = {
          userId: localStorage.getItem("userId"),
          id: localStorage.getItem("userId"),
          pollsterset: this.subscriptions,
          country: this.currentCountry,
          pageno: pageno,
          categories: this.getPollsCateogies(),
          privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
        };
        if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
          feedpolls.userId = localStorage.getItem(this.siteName + '_privateSiteUserId');
          feedpolls.id = localStorage.getItem(this.siteName + '_privateSiteUserId');
        }
      }
      if (this.currentTab === "mytopics") {
        this.gettopciscount(feedpolls);
        if (this.privateSiteCheck()) {
          if (localStorage.getItem("userId") !== localStorage.getItem(this.siteName + "_siteOwnerId")) {
            forkJoin(
              this.pService.getPrivateSubscriberProfileTopicsByWorld(feedpolls),
              this.pService.getPrivateSubscriberProfileOwnerTopicsByWorld(feedpolls)
            ).subscribe(result => {
              this.PollList = result[0];
              this.PollList = this.PollList.concat(result[1]);
              if (localStorage.getItem("privateSite") === "true" && localStorage.getItem(this.siteName + "_privateSiteUserId") !== localStorage.getItem("userId")) {
                this.PollList = this.PollList.filter(item => {
                  return item.privateSite === true;
                });
              }
              if (localStorage.getItem("privateSite") === "false") {
                this.PollList = this.PollList.filter(item => {
                  return item.privateSite === false;
                });
              }
            });
          } else {
            this.pService.getOwnerPorfileTopicsByWorld(feedpolls).subscribe(result => {
              this.PollList = result;
              var pollLength = this.PollList.length;
              if (pollLength > 0) {
                if (this.privateSiteCheck() && localStorage.getItem(this.siteName + "_privateSiteUserId") !== localStorage.getItem("userId")) {
                  this.PollList = this.PollList.filter(item => {
                    return item.privateSite === true;
                  });
                }
                if (localStorage.getItem("privateSite") === "false" && localStorage.getItem(this.siteName + "_privateSiteUserId") !== localStorage.getItem("userId")) {
                  this.PollList = this.PollList.filter(item => {
                    return item.privateSite === false;
                  });
                }
              }
               
            },
              (error => {
                console.log(error);
              }));
          } 
        } else {
          this.pService.getProfileTopicsByWorld(feedpolls).subscribe(result => {
            this.PollList = result;
            if (this.privateSiteCheck() && localStorage.getItem(this.siteName + "_privateSiteUserId") !== localStorage.getItem("userId")) {
              this.PollList = this.PollList.filter(item => {
                return item.privateSite === true;
              });
            }
            if (localStorage.getItem("privateSite") === "false") {
              this.PollList = this.PollList.filter(item => {
                return item.privateSite === false;
              });
            }
             
          },
            (error => {
              console.log(error);
            }));
        }
      } else if (this.currentTab === "myvotes") {
          if (this.privateSiteUserId) {
            var data = {
              id: localStorage.getItem(this.siteName + "_privateSiteUserId"),
              country: this.currentCountry,
              categories: this.getPollsCateogies(),
              privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
            };
            this.pService
              .getmyprivatevotesbyworld(data)
              .subscribe(result => {
                if (result[0] && result[0]["pollster"]) {
                  this.VotesInfo = [];
                } else {
                  this.VotesInfo = result;
                  var groups = new Set(
                    this.VotesInfo.map(item => item.createdAt.substring(0, 10))
                  );
                  this.VotesInfoGroup = [];
                  groups.forEach(g =>
                    this.VotesInfoGroup.push({
                      createdAt: g,
                      values: this.VotesInfo.filter(
                        i => i.createdAt.substring(0, 10) === g
                      )
                    })
                  );
                }
              },
                (error => {
                  console.log(error);
                }));
          } else {
            var data = {
              id: localStorage.getItem("userId"),
              country: this.currentCountry,
              categories: this.getPollsCateogies(),
              privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
            };
            this.pService
              .getmyvotesbyworld(data)
              .subscribe(result => {
                this.VotesInfo = result;
                var groups = new Set(
                  this.VotesInfo.map(item => item.createdAt.substring(0, 10))
                );
                this.VotesInfoGroup = [];
                groups.forEach(g =>
                  this.VotesInfoGroup.push({
                    createdAt: g,
                    values: this.VotesInfo.filter(
                      i => i.createdAt.substring(0, 10) === g
                    )
                  })
                );
              },
                (error => {
                  console.log(error);
                }));
          }
      } else if (this.currentTab === "myfeed") {
        this.getfeedpollscount(feedpolls, this.currentCountry)
        forkJoin(
          this.pService.getSubswithFeed(feedpolls),
          this.pService.getOwnerPolls(feedpolls)).subscribe(data => {
          this.FeedPollsList = data[0];
          if (data[1] !== []) {
            var ownerPolls = Object.assign([], data[1]);
            this.FeedPollsList = this.FeedPollsList.concat(ownerPolls);
          }
        },
          (error => {
            console.log(error);
          }));
      }
       
    } else {
      var userObj = { id: localStorage.getItem("userId"), country: location, privateSiteId: localStorage.getItem(this.siteName + '_siteUserId') }
      if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
        userObj.id = localStorage.getItem(this.siteName + "_privateSiteUserId");
      }
      // Message contacts count
      this.subscriptionService.getMessageRequestByCountry(userObj).subscribe(data => {
        this.messageRequestList = data;
      });

      this.subscriptionService.getSentRequestByCountry(userObj).subscribe((data: any[]) => {
        if (data && data.length > 0) {
          data.forEach(element => {
            this.messageRequestList.push(element);
          })
        }
      },
      (error=>{
         
        console.log(error);
      }));

      //subscribers count
      this.pService.getSubscribersByCountry(userObj).subscribe(data => {
        // this.location = 'world';
        this.subscriberlist = data;
      },
        (error => {
          console.log(error);
        }));
      this.pService.getSubscriptionsByCountry(userObj).subscribe(data => {
        // this.location = "world";
        this.subscriptions = data;
      },
        (error => {
          console.log(error);
        }));
      //subscribers count ends
      // if (localStorage.getItem('privateSite')) {
      //   if (localStorage.getItem('userId') === localStorage.getItem('siteOwnerId')) {
      //     var userObj = {
      //       id: localStorage.getItem('privateSiteUserId'),
      //       country: localStorage.getItem("currentCountry"),
      //       privateSiteId: localStorage.getItem('siteUserId')
      //     }
      //     this.pService.getSubscribersByCountry(userObj).subscribe(data => {
      //       this.subscriberlist = data;
      //     }, (error => {
      //       console.log(error)
      //     }));
      //     this.pService.getSubscriptionsByCountry(userObj).subscribe(data => {
      //       this.subscriptions = data;
      //     }, (error => {
      //       console.log(error)
      //     }));
      //   }
      // }
      this.currentCountry = location;
      this.cookieService.set("userProfileLocation", location);
      var feedpolls = {
        userId: localStorage.getItem("userId"),
        id: localStorage.getItem("userId"),
        pollsterset: this.subscriptions,
        country: this.currentCountry,
        pageno: pageno,
        categories: this.getPollsCateogies(),
        privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
      };
      if (this.privateSiteCheck() && localStorage.getItem('userId') === localStorage.getItem(this.siteName + '_siteOwnerId')) {
        var feedpolls = {
          userId: localStorage.getItem(this.siteName + "_privateSiteUserId"),
          id: localStorage.getItem(this.siteName + "_privateSiteUserId"),
          pollsterset: this.subscriptions,
          country: this.currentCountry,
          pageno: pageno,
          categories: this.getPollsCateogies(),
          privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
        };
      }
      // if (localStorage.getItem("privateSiteUserId")) {
      //   feedpolls.userId = localStorage.getItem("privateSiteUserId");
      // }
      this.location = "current";
       
      if (this.currentTab === "mytopics") {
        this.gettopciscount(feedpolls)
        if (this.privateSiteCheck()) {
          if (localStorage.getItem('userId') === localStorage.getItem(this.siteName + '_siteOwnerId')) {
            this.pService.getPrivatePorfileTopics(feedpolls).subscribe(result => {
              this.PollList = result;
              var pollLength = this.PollList.length;
              if (pollLength > 0) {
                if (this.privateSiteCheck() && localStorage.getItem(this.siteName + "_privateSiteUserId") !== localStorage.getItem("userId")) {
                  this.PollList = this.PollList.filter(item => {
                    return item.privateSite === true;
                  });
                }
                if (localStorage.getItem("privateSite") === "false" && localStorage.getItem(this.siteName + "_privateSiteUserId") !== localStorage.getItem("userId")) {
                  this.PollList = this.PollList.filter(item => {
                    return item.privateSite === false;
                  });
                }
              }
               
            },
              (error => {
                console.log(error);
              }));
          } else {
            forkJoin(
              this.pService.getPrivateSubscriberProfileTopics(feedpolls)
              // this.pService.getPrivateSubscriberProfileOwnerTopics(feedpolls)
            )
            .subscribe(result => {
              this.PollList = result[0];
              // this.PollList = this.PollList.concat(result[1]);
              var pollLength = this.PollList.length;
              if (pollLength > 0) {
                if (this.privateSiteCheck() && localStorage.getItem(this.siteName + "_privateSiteUserId") !== localStorage.getItem("userId")) {
                  this.PollList = this.PollList.filter(item => {
                    return item.privateSite === true;
                  });
                }
                if (localStorage.getItem("privateSite") === "false" && localStorage.getItem(this.siteName + "_privateSiteUserId") !== localStorage.getItem("userId")) {
                  this.PollList = this.PollList.filter(item => {
                    return item.privateSite === false;
                  });
                }
              }
               
            },
              (error => {
                console.log(error);
              }));
          }
          
        } else {
          this.pService.getProfileTopics(feedpolls).subscribe(result => {
            this.PollList = result;
  
            if (this.privateSiteCheck() && localStorage.getItem(this.siteName + "_privateSiteUserId") !== localStorage.getItem("userId")) {
              this.PollList = this.PollList.filter(item => {
                return item.privateSite === true;
              });
            }
            if (localStorage.getItem("privateSite") === "false" && localStorage.getItem(this.siteName + "_privateSiteUserId") !== localStorage.getItem("userId")) {
              this.PollList = this.PollList.filter(item => {
                return item.privateSite === false;
              });
            }
             
          },
            (error => {
              console.log(error);
            }));
        }
        // }
      } else if (this.currentTab === "myvotes") {
        if (this.privateSiteUserId) {
          var data = {
            id: localStorage.getItem(this.siteName + "_privateSiteUserId"),
            country: this.currentCountry,
            categories: this.getPollsCateogies(),
            privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
          };
          // Remove the below comments to get votes for private site owner
          // return forkJoin(
          //   this.pService.getmyprivatevotes(data),
          //   this.pService.getprivatesubscriberpollresult(data)
          //   ).subscribe(result => {
          //   this.VotesInfo = result[0];
          //   this.VotesInfo.forEach(element => {
          //     element.tempresult = element.result;
          //     element.pollster[0] = {};
          //     element.pollster[0].firstName = element.userDetails[0].firstName;
          //     element.pollster[0].email = element.userDetails[0].email;
          //     element.pollster[0].lastName = element.userDetails[0].lastName;
          //     element.pollster[0].profilePicture = element.userDetails[0].profilePicture;
          //     element.pollster[0].userName = element.userDetails[0].userName;
          //     element.pollster[0].userStatus = element.userDetails[0].userStatus;
          //     element.pollster[0].firstName = element.userDetails[0].firstName;
          //     element.pollster[0].address = {};
          //     element.pollster[0].address.country = element.userDetails[0].address.country;
          //   });
          //   // this.VotesInfo = this.VotesInfo.concat(result[1]);
          //   var groups = new Set(
          //     this.VotesInfo.map(item => item.createdAt.substring(0, 10))
          //   );
          //   this.VotesInfoGroup = [];
          //   groups.forEach(g => {
          //     this.VotesInfoGroup.push({
          //       createdAt: g,
          //       values: this.VotesInfo.filter(
          //         i => i.createdAt.substring(0, 10) === g
          //       )
          //     });
          //   });
          //    
          // },
          // (error => {
          //   console.log(error);
          // }));
        } else {
          var data = {
            id: localStorage.getItem("userId"),
            country: this.currentCountry,
            categories: this.getPollsCateogies(),
            privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
          };
          return forkJoin(
            this.pService.getmyvotes(data),
            this.pService.getmyprivatevotes(data)
          ).subscribe(result => {
            if (result[1] && result[1]["pollster"]) {
              this.VotesInfo = [];
            } else {
              this.VotesInfo = result[0];
              this.VotesInfo.forEach(element => {
                if (element.pollster.length < 1) {
                  element.pollster = element.userDetails;
                }
              });
              this.VotesInfo.forEach(element => {
                element.tempresult = element.result;
              });
              var groups = new Set(
                this.VotesInfo.map(item => item.createdAt.substring(0, 10))
              );
              this.VotesInfoGroup = [];
              groups.forEach(g => {
  
                this.VotesInfoGroup.push({
                  createdAt: g,
                  values: this.VotesInfo.filter(
                    i => i.createdAt.substring(0, 10) === g
                  )
                });
              });
               
            }
          })
          
        }
      } else if (this.currentTab === "myfeed") {
        if (this.privateSiteCheck() && localStorage.getItem('userId') !== localStorage.getItem(this.siteName + '_siteOwnerId')) {
          this.getfeedpollscount(feedpolls, this.currentCountry)
          forkJoin(
            this.pService.getPrivateOwnerFeedDataByCountry(feedpolls),
            this.pService.getPrivateFeedDataByCountry(feedpolls)
          ).subscribe(data => {
            this.FeedPollsList = data[0];
            this.FeedPollsList = this.FeedPollsList.concat(data[1]);
             
          },
            (error => {
              console.log(error);
            }));
        } else {
          this.getfeedpollscount(feedpolls, this.currentCountry)
          this.pService.getFeedDataByCountry(feedpolls).subscribe(data => {
            this.FeedPollsList = data;
             
          },
            (error => {
              console.log(error);
            }));
        }
       
      }
    }
     
  }
  updateSlider(event, vote, index, maainindex) {
    this.votesss(event.value, vote, index, maainindex);
    // if(!this.auth.isLoggedIn())
    // {
    //   this.valueForSlider=0;
    //   this.openModalWithComponent(false);
    //   return
    // }
    //  
    // this.votesss(event.value, this.poll);
  }
  pollOverlay(id, type) {
    this.cookieService.set("type", type);
    this.router.navigate(["/poll/" + id]);
  }
  changeEvent(event) {
    // if(!this.auth.isLoggedIn())
    // {
    //   this.valueForSlider=0;
    //   this.openModalWithComponent(false);
    // }
    // this.vote(event.value, this.poll);
  }
  checkFlagModal(poll, mainindex, index) {
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
      if (!this.isFlag(poll) && this.isFollow(poll)) {
        this.flagWhenFollow(flagData, mainindex, index);
      } else if (this.isFlag(poll)) {
        this.pService.unflagTopic(flagData).subscribe(data => {
           
          this.VotesInfoGroup[mainindex].values[
            index
          ].poll.flagPollByUserIds = [];
        },
          (error => {
            console.log(error);
          }));
      } else {
        this.pService.flagTopic(flagData).subscribe(data => {
           

          this.VotesInfoGroup[mainindex].values[
            index
          ].poll.flagPollByUserIds.push(localStorage.getItem("userId"));
        },
          (error => {
            console.log(error);
          }));
      }
      this.bsModalRef.hide();
       
    };
  }
  followpoll(poll, mainindex, index) {
    var data = {
      id: poll._id,
      userid: localStorage.getItem("userId")
    };
     
    this.pService.followTopic(data).subscribe(data => {
       
      this.VotesInfoGroup[mainindex].values[index].poll.pollSubscription.push(
        localStorage.getItem("userId")
      );
    },
      (error => {
        console.log(error);
      }));
  }
  Unfollow(poll, mainindex, index) {
    var data = {
      id: poll._id,
      userid: localStorage.getItem("userId")
    };
     
    this.pService.unfollowTopic(data).subscribe(data => {
       
      this.VotesInfoGroup[mainindex].values[index].poll.pollSubscription = [];
    },
      (error => {
        console.log(error);
      }));
  }
  flagWhenFollow(flagData, mainindex, index) {
    return forkJoin(
      this.pService.flagTopic(flagData),
      this.pService.unfollowTopic(flagData)
    ).subscribe(data => {
      this.VotesInfoGroup[mainindex].values[index].poll.pollSubscription = [];
      this.VotesInfoGroup[mainindex].values[index].poll.flagPollByUserIds.push(
        localStorage.getItem("userId")
      );
    },
      (error => {
        console.log(error);
      }));
  }
  isFlag(poll) {
    var FlagTopicArray = [];
    if (poll.flagPollByUserIds && poll.flagPollByUserIds.length > 0) {
      FlagTopicArray = poll.flagPollByUserIds.filter(item => {
        return item.includes(localStorage.getItem("userId"));
      });
    }
    if (FlagTopicArray.length > 0) return true;
    else return false;
  }
  getFilterConutries(searchKey) {
    this.tempCountryList = [];
    this.tempCountryList = this.CountryList.filter(item => {
      return item.name.toLowerCase().includes(searchKey.toLowerCase());
    });
    return this.tempCountryList;
  }
  changePage(value) {
    var tempCountry;
    if (this.location === "world") {
      tempCountry = "world";
    } else {
      tempCountry = this.currentCountry;
    }
    this.currentPageFeed = value;
    this.locationChange(tempCountry, value);
  }
  isFollow(poll) {
    var FollowTopicArray = [];
    if (poll.pollSubscription && poll.pollSubscription.length > 0) {
      FollowTopicArray = poll.pollSubscription.filter(item => {
        return item.includes(localStorage.getItem("userId"));
      });
    }
    if (FollowTopicArray.length > 0) return true;
    else return false;
  }
  changePagforFeed(event) {
    this.currentPageFeed = event;
    this.locationChange(this.currentCountry, event);
  }
  setpageNo() {
    this.currentPageFeed = 1;
  }
  removeSubscription() {
    const initialState = {
      title: "Modal with component"
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.content.alertTitle = "Alert";
    this.bsModalRef.content.content =
      "Are you sure? Do you want to Unsubscribe ?";
    this.bsModalRef.content.onClose = myData => {
      this.bsModalRef.hide();
      var subscriptionObj = {
        id: localStorage.getItem("userId"),
        userid:localStorage.getItem("userId"),
        privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
      };
      if (subscriptionObj.id  === subscriptionObj.userid) {
        subscriptionObj.userid = localStorage.getItem(this.siteName + '_siteUserId');
      }
      this.userProfileService.getSubscrptionStatus(subscriptionObj).subscribe(result => {
        let subscriptionObjId ={
        "id": result["data"][0]["_id"]  
        } 
        this.subscriptionService.removeSubscription(subscriptionObjId).subscribe(data => {
          this.removePrivateSiteAdmin(localStorage.getItem("userId"));
          this.router.navigateByUrl('/home/top?location=world');
          this.auth.isPrivateSite = "No";
          localStorage.removeItem("privateSite");
          localStorage.removeItem(this.siteName + '_privateSite');
          localStorage.removeItem(this.siteName + '_privateSiteName')
          localStorage.removeItem(this.siteName + '_privateSiteLogo')
          localStorage.removeItem(this.siteName + '_privateSiteOwner')
          localStorage.removeItem(this.siteName + '_privateSiteUsername');
          localStorage.removeItem(this.siteName + '_privateSiteUserId');
          localStorage.removeItem(this.siteName + '_privateSiteDesc');
          localStorage.removeItem(this.siteName + '_privateSiteId');
          localStorage.removeItem(this.siteName + '_privateSiteContact');
          localStorage.removeItem(this.siteName + '_privateSite');
          localStorage.removeItem(this.siteName + '_siteUserId');
          localStorage.removeItem(this.siteName + '_siteOwnerId');
          localStorage.removeItem(this.siteName + '_privateSiteOwnerId');
        });
      });
    };
  }

  removePrivateSiteAdmin(id) {
    if (localStorage.getItem(this.siteName + '_siteOwnerId')) {
      this.settingsService.getPrivateSettings(localStorage.getItem(this.siteName + "_siteOwnerId")).subscribe(data => {
        let privateSiteSettings = data;
        let adminDetails = {
          userId: id, 
          privateSiteDocId: privateSiteSettings["_id"]
        };
        // Calls remove admin service with admin details
        this.settingsService.removePrivateSiteAdmin(adminDetails).subscribe(result => {
        });
      });
    }
  }

  addPhoneNumber(): void {
    const dialogRef = this.dialog.open(VerifiedVoteModalComponent, {
      width: '400px',
      data: {
        'phone': "",
        'title': "Add Your Number",
        'label': '',
        'attempt': 'first'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'verified') {
        this.ngOnInit();
      } else {
         
        return;
      }
    })
  }

  // Gets country code
  countryChange(obj) {
    this.countryCode = obj.dialCode;
  }

  // Invokes when Phone number is invalid
  hasError(event: any): void {
    if (!event && this.contactForm.value.formControlPhone !== '') {
      this.contactForm.get('formControlPhone').setErrors(['invalid_cell_phone', true]);
    }
  }

  // Edit number method
  editNumber(): void {
    const initialState = {
      title: "Modal with component"
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.content.alertTitle = "Alert";
    this.bsModalRef.content.content =
      "Do you want to change the number?";
    this.bsModalRef.content.onClose = myData => {
      this.bsModalRef.hide();
      const dialogRef = this.dialog.open(VerifiedVoteModalComponent, {
        width: '400px',
        data: {
          "title": "MOBILE NUMBER CHANGE",
          "phone": this.phone,
          "label": "Please verify your old phone number",
          "attempt": "second"
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === "verified") {
          this.newNumberModalOpen();
        }
      });
    };
  }

  // Gets phone number from form group
  getNumber() {
    return "+" + this.countryCode + this.contactForm.get('formControlPhone').value;
  }

  // New number modal open 
  newNumberModalOpen(): void {
    const newNumberDialog = this.dialog.open(VerifiedVoteModalComponent, {
      width: '400px',
      data: {
        'phone': "",
        'title': "ADD YOUR NEW NUMBER",
        'label': '',
        'attempt': "first"
      }
    });
    
    newNumberDialog.afterClosed().subscribe(data => {
      if (data === "verified") {
        if (this.privateSiteCheck()) {
          let requestData = {
            "userId": localStorage.getItem('userId'),
            "privateSite": true,
            "privateSiteId": localStorage.getItem(this.siteName + "_siteUserId"),
            "phone": this.phone
          };
          // API call with userID request data
          this.pService.deletePhoneNumber(requestData).subscribe((response) => {
            if (response["result"]) {
               
              this.ngOnInit();
            } else {
              this.openSnackBar("Server side error occurred");
            }
          });
        } else {
          this.ngOnInit();
        }
      }
    });
  }

  // Deletes number for the user
  deleteNumber(): void {
    const initialState = {
      title: "Modal with component"
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.content.alertTitle = "Alert";
    this.bsModalRef.content.content =
      "Are you sure you want to delete the number?";
    this.bsModalRef.content.onClose = myData => {
      this.bsModalRef.hide();
       
      if (localStorage.getItem('userId')) {
        var requestData = {
          "userId": localStorage.getItem('userId'),
          "privateSite": false,
          "privateSiteId": "",
          "phone": ""
        };
      }
      if (this.privateSiteCheck()) {
        requestData.privateSite = true;
        requestData.privateSiteId = localStorage.getItem(this.siteName + "_siteUserId");
        requestData.phone = this.phone;
      }
      const dialogRef = this.dialog.open(VerifiedVoteModalComponent, {
        width: '400px',
        data: {
          'phone': this.phone,
          'title': "Confirm your action",
          'label': "",
          'attempt': 'second'
        }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'verified') {
          // API call with userID request data
          this.pService.deletePhoneNumber(requestData).subscribe((response) => {
            if (response["result"]) {
               
              this.openSnackBar("Delete number successful");
              this.ngOnInit();
            } else {
              this.openSnackBar("Server side error occurred");
            }
          });
        } else {
           
          this.openSnackBar("Verification unsuccessful");
          return;
        }
      })
      
    };
  }

  // To show confirmation
  openSnackBar(message: string) {
    this.snackBar.open(message, "OK", {
      duration: 3000,
    });
  }

  editButton(pollid) {
    if (this.privateSiteCheck()) {
      var siteName = localStorage.getItem(this.siteName + "_privateSiteName");
      this.router.navigate(["privatesites/" + siteName + "/poll/edit/start/" + pollid]);
    } else {
      this.router.navigate(["poll/edit/start/" + pollid]);
    }
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
