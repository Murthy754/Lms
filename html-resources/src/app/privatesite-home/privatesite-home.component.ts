import { HeaderComponent } from './../header/header.component';
import { SettingsService } from './../settings/settings.service';
import { UserprofileService } from './../userprofile/userprofile.service';
import { Component, OnInit, HostListener } from "@angular/core";
import { LocationStrategy } from '@angular/common';  
import { Router, ActivatedRoute } from "@angular/router";
import { forkJoin } from "rxjs";
import * as _ from "lodash";
import { AuthService } from "../auth.service";
import { PrivatesiteHomeService } from './privatesite-home.service';
import { CookieService } from "ngx-cookie-service";
import { BsModalService, BsModalRef, ModalOptions } from "ngx-bootstrap/modal";
import { ModalComponent } from "../modal/modal.component";
import { SignupComponent } from "../signupmodal/signupmodal.component";
import * as moment from "moment";
import { SharedService } from '../shared-services/shared.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  providers: [HeaderComponent],
  selector: "app-privatesite-home",
  templateUrl: "./privatesite-home.component.html",
  styleUrls: ["./privatesite-home.component.scss"]
})
export class PrivatesiteHomeComponent implements OnInit {
  adFeedIndex: number = 2;
  displayAds: Boolean = false;
  isWrapperStiky = false;
  searchKey = "";
  @HostListener("window:scroll", ["$event"])
  scrollHandler(event) {
    if (window.pageYOffset && window.pageYOffset > 82) {
      this.isWrapperStiky = true;
    } else this.isWrapperStiky = false;
  }
  subscriptionObj;
  isSubscriber: boolean = false;
  categoryInf: any = [];
  categoryInfo = [];
  categoryfilter = [];
  currentTab = "top";
  selectedTab = 2;
  currentPage = 1;
  index=0;
  country;
  userId;
  privateSiteName: string;
  itemCountArray:any=[];
  location = "world";
  Categories = [];
  CategoiesList: any = [];
  queryParams;
  CountryList: any = [];
  itemcount = 0;
  mobileCategoies = [];
  tempCountryList;
  recent: any = [];
  top: any = [];
  trending: any = [];
  PollList: any = [];
  p = 1;
  privateSiteID;
  siteName;
  bsModalRef: BsModalRef;
  isLogOut: boolean = false;
  topicsPerPage = 8;
  pageNumber : number = 0;
  skeletonLoading: boolean = false;
  previousPollCount: number = 0;
  pollCountExceede: boolean = false;
  initialPageLoad: boolean = true;
  toDate: any;
  fromDate : any;
  dateForm: FormGroup ;
  today = new Date();
  pollsLoading : boolean = false;

  constructor(
    private locationStrategy: LocationStrategy,
    private pService: PrivatesiteHomeService,
    private uService: UserprofileService,
    private settingService: SettingsService,
    private headerComponent: HeaderComponent,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router:Router,
    private cookieService: CookieService,
    private modalService: BsModalService,
    private sharedService: SharedService
) {}

  async ngOnInit() {
    let link = window.location.pathname.split('/');
    if (link[1] === "privatesites") {
      this.siteName = link[2];
    }
    if(localStorage.getItem(this.siteName + '_toDate') && localStorage.getItem(this.siteName + '_fromDate')) {
      this.toDate = new Date(localStorage.getItem(this.siteName + '_toDate'));
      this.fromDate = new Date(localStorage.getItem(this.siteName + '_fromDate'));
    } else {
      this.toDate = new Date()
      this.fromDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1))

    }

    this.dateForm = new FormGroup({
      toDate: new FormControl(this.toDate),
      fromDate: new FormControl(this.fromDate)
    })
    let currentTab = this.cookieService.get(this.siteName + "_userHomeTabLocation");
    if (currentTab) {
      this.currentTab = currentTab;
    }

    let userPrivateHomeLocation = this.cookieService.get(this.siteName + "_userPrivateHomeLocation");
    if (userPrivateHomeLocation) {
      this.country = userPrivateHomeLocation;
    }
    this.privateSiteName = localStorage.getItem(this.siteName+'_privateSiteName');
    this.userId = localStorage.getItem('userId');
    if (localStorage.getItem(this.siteName+'_privateSiteUserId') !== null) {
      this.userId = localStorage.getItem(this.siteName + '_privateSiteUserId');
    }
    this.locationStrategy.onPopState(() => {
      if (this.privateSiteCheck()) {
        if (localStorage.getItem('userId') === localStorage.getItem(this.siteName + '_siteOwnerId')) {
          var settingsURL = "/privatesites/" + this.privateSiteName + "/settings";
          var messageURL = "/privatesites/" + this.privateSiteName + "/messages";
          if (window.location.pathname.toLowerCase() === settingsURL.toLowerCase()) {
            history.pushState(null, null, settingsURL);
            return;
          } else if (window.location.pathname.toLowerCase() === messageURL.toLowerCase()) {
            history.pushState(null, null, messageURL);
            return;
          } else {
            var url: string;
            if (this.privateSiteName !== null) {
              url = "/privatesites/" + this.privateSiteName;
            }
            history.pushState(null, null, url);
          }
        } else {
          var messageURL = "/privatesites/" + this.privateSiteName + "/messages";
          if (window.location.pathname.toLowerCase() === messageURL.toLowerCase()) {
            history.pushState(null, null, messageURL);
            return;
          } else {
            var url: string;
            if (this.privateSiteName !== null) {
              url = "/privatesites/" + this.privateSiteName;
            }
            history.pushState(null, null, url);
          }
        }
      }
    });
    if (!localStorage.getItem("userId")) {
      this.activatedRoute.params.subscribe(params => {
        var id  = params["id"];
        if (!id) {
          this.router.navigateByUrl('/home/top?location=world');
          this.authService.isPrivateSite = "No";
        }
        this.pService.getPrivateSiteFromURL(id).subscribe(data => {
           
          if (data[0] === undefined) {
             
            const config: ModalOptions = {
              backdrop: 'static',
              keyboard: false,
              animated: true,
              ignoreBackdropClick: true,
              initialState: {
                title: "Modal with component",
                privateSite: true
              }
            };
            this.bsModalRef = this.modalService.show(ModalComponent, config);
            this.bsModalRef.content.alertTitle = "Alert";
            this.bsModalRef.content.isCancel = true;
            this.bsModalRef.content.content =
            "No private site found by name " + id + ". Click Ok to return to Home page.";
            this.bsModalRef.content.onClose = myData => {
              this.bsModalRef.hide();
            };
          } else {
            this.settingService.getPrivateSiteDetails(data[0]["_id"]).subscribe(siteData => {
              localStorage.setItem(siteData['settings']['siteName']+'_privateSiteName', siteData['settings']['siteName'])
              localStorage.setItem(siteData['settings']['siteName']+'_privateSiteLogo', siteData['settings']['siteLogo'])
              localStorage.setItem(siteData['settings']['siteName']+'_privateSiteDesc', siteData['settings']['siteDescription']);
              localStorage.setItem(siteData['settings']['siteName']+'_privateSiteContact', siteData['settings']['siteContact']);
              localStorage.setItem(siteData['settings']['siteName']+'_siteUserId', siteData['virtualUser']);
              localStorage.setItem(siteData['settings']['siteName']+'_siteOwnerId', siteData['ownerId']);
              localStorage.setItem('messagePermission', "true");
              localStorage.setItem('privateSite', "true");
              // this.authService.isPrivateSite = "Yes";
              if (localStorage.getItem(siteData['settings']['siteName']+"_siteOwnerId") === localStorage.getItem("userId")) {
                localStorage.setItem(siteData['settings']['siteName']+"_privateSiteUserId", siteData['virtualUser']);
              }
            });
          }
          this.isLogOut = true;
          this.isSubscriber = true;
        })
      })
    } else if (localStorage.getItem(this.siteName + "_siteOwnerId") === null && localStorage.getItem(this.siteName + "_privateSiteOwnerId") === null) {
          this.activatedRoute.params.subscribe(params => {
          var id  = params["id"];
          if (!id) {
            this.router.navigateByUrl('/home/top?location=world');
            this.authService.isPrivateSite = "No";
          }
          this.pService.getPrivateSiteFromURL(id).subscribe(data => {
            if (data[0] === undefined) {
               
              this.router.navigateByUrl('/home/top?location=world');
              this.authService.isPrivateSite = "No";
            } else {
              this.settingService.getPrivateSiteDetails(data[0]["_id"]).subscribe(siteData => {
                localStorage.setItem(siteData['settings']['siteName']+'_privateSiteName', siteData['settings']['siteName'])
                localStorage.setItem(siteData['settings']['siteName']+'_privateSiteLogo', siteData['settings']['siteLogo'])
                localStorage.setItem(siteData['settings']['siteName']+'_privateSiteDesc', siteData['settings']['siteDescription']);
                localStorage.setItem(siteData['settings']['siteName']+'_privateSiteContact', siteData['settings']['siteContact']);
                localStorage.setItem(siteData['settings']['siteName']+'_siteUserId', siteData['virtualUser']);
                localStorage.setItem(siteData['settings']['siteName']+'_siteOwnerId', siteData['ownerId']);
                localStorage.setItem('messagePermission', "true");
                localStorage.setItem('privateSite', "true");
                // this.authService.isPrivateSite = "Yes";
                if (localStorage.getItem(siteData['settings']['siteName']+"_siteOwnerId") === localStorage.getItem("userId")) {
                  localStorage.setItem(siteData['settings']['siteName']+"_privateSiteUserId", siteData['virtualUser']);
                }
                // this.router.navigate(["/privatesites/" + siteData['settings']['siteName']], { state: {id: siteData["_id"]}});
                this.checkSubscription(siteData["_id"]);
                this.getTopicsForHome();
              });
            }
          })
        })
    } else if (localStorage.getItem(this.siteName + "_siteOwnerId") === localStorage.getItem("userId")) {
      localStorage.setItem(this.siteName + "_privateSiteUserId", localStorage.getItem(this.siteName + "_siteUserId"));
    }
    if (localStorage.getItem("userId")) {
      //get subscriber status when viewing private site user
      if (localStorage.getItem("userId") !== localStorage.getItem(this.siteName + "_siteOwnerId")) {
        var subscriptionObj = {
          id: localStorage.getItem("userId"),
          userid: localStorage.getItem(this.siteName + "_siteUserId") + "",
          privateSiteId: localStorage.getItem(this.siteName + "_siteUserId")
        };
        this.uService.getSubscrptionStatus(subscriptionObj).subscribe(data => {
          var subData: any = data;
          if (subData.result) {
            this.subscriptionObj = subData.data[0];
            if (this.subscriptionObj.status === 'ACCEPTED') {
              this.isSubscriber = true;
            } else {
              this.isSubscriber = false;
            }
          } else {
            this.isSubscriber = false;
          }
        });
      } else {
        this.isSubscriber = true;
      }

      let configurations = this.sharedService.getConfigurations()
      if (configurations != {}) {
          this.adFeedIndex = (configurations["feed_ad_index"]) ? configurations["feed_ad_index"] : this.adFeedIndex;
          this.displayAds = (configurations["show_google_ads"]) ? configurations["show_google_ads"] : this.displayAds;
          this.topicsPerPage = (configurations["topics_per_page"]) ? (configurations["topics_per_page"]) : this.topicsPerPage;
      }
      
    }
    
    await this.getData().then(data => {
      // this.isSubscriber = true;
       this.getTopicsForHome();
    });
  }
  getTopicsForHome() {
    this.getTopics(0);
    this.getFourTopics();
    this.getCount();
  }
  checkSubscription(id) {
    //get subscriber status when viewing private site user
    if (localStorage.getItem("userId") !== localStorage.getItem(this.siteName + "_siteOwnerId")) {
      var subscriptionObj = {
        id: localStorage.getItem("userId"),
        userid: localStorage.getItem(this.siteName + "_siteUserId") + "",
        privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
      };
      this.uService.getSubscrptionStatus(subscriptionObj).subscribe(data => {
        var subData: any = data;
        if (subData.result) {
          this.subscriptionObj = subData.data[0];
          if (this.subscriptionObj.status === 'ACCEPTED')
            this.isSubscriber = true;
        } else {
          this.privateSiteID = id;
        }
      });
    } else {
      this.isSubscriber = true;
    }
  }
  getData() {
    return new Promise((res, rej) => {
      forkJoin(
        this.pService.getCategories(),
        this.pService.getCurrentIpLocation(),
        this.pService.getJSON()
      ).subscribe(docs => {
        var resultData: any = docs;
        this.categoryInf = resultData[0];
        this.categoryInfo = this.categoryInf;
        if (this.cookieService.get(this.siteName + '_userHomeCategory')) {
          let categories = JSON.parse(this.cookieService.get(this.siteName + '_userHomeCategory'));
          this.categoryfilter = categories;
          this.categoryfilter.forEach((category) => {
            for (let i=0; i < this.categoryInfo.length ; i++) {
              if (this.categoryInfo[i]._id === category._id) {
                this.categoryInfo.splice(i, 1);
              }
            }
          });
        }  
        var cc = docs[1];
        this.CountryList=docs[2];
        this.tempCountryList=docs[2];
        if(!this.country)
        this.country = cc.names.en;
        var dataaa: any = this.categoryInf;
        dataaa.forEach(element => {
          this.Categories.push(element.name);
        });
        if (this.cookieService.get(this.siteName + "_userMobileHomeCategory")) {
          let categories = JSON.parse(this.cookieService.get(this.siteName + "_userMobileHomeCategory"));
          for (var key in categories) {
            if (categories.hasOwnProperty(key)) {
              this.mobileCategoies.push(categories[key]);
            }
          }
        }
        res(docs)
      },
      (error=>{
        console.log(error);
      }));
    });
  }
  
  getFilterConutries(searchKey){
    this.tempCountryList=[];
    this.tempCountryList = this.CountryList.filter(item => {
      return item.name.toLowerCase().includes(searchKey.toLowerCase());
    });
    return this.tempCountryList;
  }
  SearchPolls(searchParam) {
    this.categoryInfo = this.categoryInf.filter(item => {
      return item.name.toLowerCase().includes(searchParam.toLowerCase());
    });
  }
  filterPolls(item, index) {
    this.initialPageLoad = true;
    this.previousPollCount = 0;
    this.pageNumber = 0;
    this.pollCountExceede = false;
    this.PollList = [];
    this.categoryfilter.push(item);
    this.cookieService.set(this.siteName + '_userHomeCategory', JSON.stringify(this.categoryfilter));
    this.categoryInfo.splice(index, 1);
    this.getTopics(1);
    this.getCount();
  }
  removecategoryPolls(item, index) {
    this.initialPageLoad = true;
    this.previousPollCount = 0;
    this.pageNumber = 0;
    this.pollCountExceede = false;
    this.PollList = [];
    this.categoryInfo.push(item);
    this.categoryfilter.splice(index, 1);
    this.cookieService.set(this.siteName + '_userHomeCategory', JSON.stringify(this.categoryfilter));
    this.categoryInfo.sort((a, b) => a.name.localeCompare(b.name));
    this.getTopics(1);  
    this.getCount();
  }
  getCategories(){
    if(this.categoryfilter.length>0)
    {
      var tempCats:any=[];
      this.categoryfilter.forEach(element => {
        tempCats.push(element.name)
      });
      return tempCats;
    }
    else if(this.mobileCategoies.length>0){
      return this.mobileCategoies;
    }
    else
      return this.Categories
  }
  getTopics(range){
    this.skeletonLoading = true;
    if (this.currentTab==="top" && this.location === 'world') {
      this.itemcount=this.itemCountArray[0];
    } else if (this.currentTab==="top" && this.location !== 'world') {
      this.itemcount=this.itemCountArray[1];
    } else if (this.currentTab==="trending" && this.location === 'world') {
      this.itemcount=this.itemCountArray[2];
    } else if (this.currentTab==="trending" && this.location !== 'world') {
      this.itemcount=this.itemCountArray[3];
    } else if (this.currentTab==="recent" && this.location === 'world') {
      this.itemcount=this.itemCountArray[4];
    } else if (this.currentTab==="recent" && this.location !== 'world') {
      this.itemcount=this.itemCountArray[5];
    }
    var categories=this.getCategories()
    var data={
        range: this.pageNumber * this.topicsPerPage,
        limit: this.topicsPerPage,
        categories: categories,
        location: this.location,
        // siteOwnerId:localStorage.getItem('siteUserId'),
        // id:localStorage.getItem('siteUserId'),
        siteOwnerId: localStorage.getItem(this.siteName + '_siteUserId'),
        id: localStorage.getItem('userId'),
        country: this.country,
        privateSiteId: localStorage.getItem(this.siteName + '_siteUserId'),
        siteId: localStorage.getItem(this.siteName+ '_siteOwnerId'),
        toDate: this.toDate,
        fromDate: this.fromDate
    }

    if (localStorage.getItem(this.siteName + "_privateSiteUserId")) {
        data.id = localStorage.getItem(this.siteName + "_privateSiteUserId");
    }
    this.initialPageLoad = false
    if((!this.pollCountExceede)) {
      if(this.currentTab=="recent") {
        this.pService.getAllRecentPolls( {data : JSON.stringify(data) } ).subscribe(data => {
        this.pollsLoading = false;
        this.PollList = _.unionBy(this.PollList, data,"_id");
        this.recent = this.PollList
        this.skeletonLoading = false;
        this.checkForMaxPolls();
        }, (error) => {
          console.log(error);
          this.pollsLoading = false;
          this.skeletonLoading = false;
        })
      } else if(this.currentTab=="trending") {
        this.pService.getAllTrendingPolls( {data : JSON.stringify(data)}).subscribe(data => {
          this.PollList = _.unionBy(this.PollList, data)
          this.trending = this.PollList;
          this.skeletonLoading = false;
          this.pollsLoading = false;
          this.checkForMaxPolls();
        }, (error) => {
          console.log(error);
          this.skeletonLoading = false;
          this.pollsLoading = false;

        })
      } else if(this.currentTab=="top") {
            this.pService.getAllTopPolls( {data : JSON.stringify(data) } ).subscribe(data => {
            this.PollList = _.unionBy(this.PollList, data);
            this.top = this.PollList
            this.skeletonLoading = false;
            this.pollsLoading = false;
            this.checkForMaxPolls();
            }, (error) => {
              console.log(error);
              this.pollsLoading = false;
              this.skeletonLoading = false;
            })
      }
  }
}

  //for checking whether the polls reached the max or not.
  checkForMaxPolls () {
    if(this.previousPollCount+this.topicsPerPage > this.PollList.length) {
      this.pollCountExceede = true;
    } else {
      this.previousPollCount = this.PollList.length
      this.pollCountExceede = false;
    }
  }

  changePage(event){
    this.getTopics(event);
    this.p = event;
    this.currentPage=event;
  }

  mobilecategoryPolls(catname) {
    var temppolls = this.mobileCategoies.filter(item => {
      return item === catname;
    });
    if (temppolls.length == 0) {
      this.mobileCategoies.push(catname);
      this.cookieService.set(this.siteName + "_userMobileHomeCategory", JSON.stringify(this.mobileCategoies));
    } 
    else {
      var index = this.mobileCategoies.indexOf(catname);
      if (index !== -1) {
        this.mobileCategoies.splice(index, 1);
        this.cookieService.set(this.siteName + "_userMobileHomeCategory", JSON.stringify(this.mobileCategoies));
      }
    }
  }
  checkCategory(catname) {
    var temppolls = this.mobileCategoies.filter(item => {
      return item===catname;
    });
    if (temppolls.length > 0) return true;
    return false;
  }
  getFourTopics(){
    var categories=this.Categories;
    var data={
        range:0,
        limit:5,
        categories:categories,
        siteOwnerId:localStorage.getItem(this.siteName + '_siteUserId'),
        id:localStorage.getItem('userId'),
        country:this.country,
        location: this.location,
        privateSiteId: localStorage.getItem(this.siteName + '_siteUserId'),
        siteId: localStorage.getItem(this.siteName+ '_siteOwnerId'),
        toDate: this.toDate,
        fromDate: this.fromDate
    }
    if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
      data.id = localStorage.getItem(this.siteName + "_privateSiteUserId");
    }
    if (this.currentTab == "recent") {
      return forkJoin(
        this.pService.getAllTopPolls({ data: JSON.stringify(data) }),
        this.pService.getAllTrendingPolls({ data: JSON.stringify(data) })
      ).subscribe(data => {
        this.top = data[0];
        this.trending = data[1];
      },
        (error => {
          console.log(error);
        }));
    } else if (this.currentTab == "top") {
      return forkJoin(
        this.pService.getAllRecentPolls({ data: JSON.stringify(data) }),
        this.pService.getAllTrendingPolls({ data: JSON.stringify(data) })
      ).subscribe(data => {
        this.recent = data[0];
        this.trending = data[1];
      },
        (error => {
          console.log(error);
        }));
    } else if (this.currentTab == "trending") {
      return forkJoin(
        this.pService.getAllRecentPolls({ data: JSON.stringify(data) }),
        this.pService.getAllTopPolls({ data: JSON.stringify(data) }),
      ).subscribe(data => {
        this.recent = data[0];
        this.top = data[1];
      },
        (error => {
          console.log(error);
        }));
    }
  }
  getCount(){
    var data={
        id:localStorage.getItem(this.siteName + '_privateSiteUserId'),
        country:this.country,
        categories:this.getCategories()
    }
    return forkJoin(this.pService.getCount(data,'world','top'),
                    this.pService.getCount(data,'current','top'),
                    this.pService.getCount(data,'world','trending'),
                    this.pService.getCount(data,'current','trending'),
                    this.pService.getCount(data,'world','recent'),
                    this.pService.getCount(data,'current','recent')).subscribe(data => {
          this.itemCountArray=[];
          for(var i=0;i<6;i++){
              this.itemCountArray.push(data[i]);
          }
          if (this.currentTab === "top") {
            this.itemcount = this.itemCountArray[0];
          }
          else if (this.currentTab === "trending") {
            this.itemcount = this.itemCountArray[2];
          }
          else if (this.currentTab === "recent") {
            this.itemcount = this.itemCountArray[4];
          }
    },
    (error=>{
      console.log(error);
    }));
  }
  onChangeTab(index){
    this.initialPageLoad = true;
    this.previousPollCount = 0;
    this.pageNumber = 0;
    this.pollCountExceede = false;
    this.PollList = [];
    this.currentPage=0;
    if (index == 0) {
      this.currentTab = "top";
      this.cookieService.set(this.siteName + "_userHomeTabLocation", "top");
      this.getTopics(0);
    } else if (index == 1) {
      this.currentTab = "trending";
      this.cookieService.set(this.siteName + "_userHomeTabLocation", "trending");
      this.getTopics(0);
    } else {
      this.currentTab = "recent";
      this.cookieService.set(this.siteName + "_userHomeTabLocation", "recent");
      this.getTopics(0);
    }
  }
  pollOverlay(id, type) {
    if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
      var siteName = localStorage.getItem(this.siteName + '_privateSiteName');
      this.router.navigate(['/privatesites/' + siteName + "/poll/" + id]);
    } else {
      this.router.navigate(["/poll/" + id]);
    }
  }
  locationChange(country){
      this.currentPage=0;
      this.searchKey="";
      this.tempCountryList=this.CountryList;
      if(country === this.location ||(this.country==country&&this.location==='current'))
      {
        return
      }
      this.initialPageLoad = true;
      this.previousPollCount = 0;
      this.pageNumber = 0;
      this.pollCountExceede = false;
      this.PollList = [];
      if(country!=='world'){
        this.location='current';
        this.country=country;
        this.cookieService.set(this.siteName + "_userPrivateHomeLocation", country, 30)
        // this.getCount();
        this.getTopics(0);
      }
      else{
        this.location='world'
        // this.getCount();
        this.getTopics(0);
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

  navToMainSite() {
    localStorage.removeItem(this.siteName + '_privateSite');
    localStorage.removeItem(this.siteName + '_privateSiteName')
    localStorage.removeItem(this.siteName + '_privateSiteLogo')
    localStorage.removeItem(this.siteName + '_privateSiteOwner')
    localStorage.removeItem(this.siteName + '_privateSiteUsername');
    localStorage.removeItem(this.siteName + '_privateSiteUserId');
    localStorage.removeItem(this.siteName + '_privateSiteDesc');
    localStorage.removeItem(this.siteName + '_privateSiteContact');
    localStorage.removeItem(this.siteName + '_privateSiteId');
    localStorage.removeItem('privateSite');
    localStorage.removeItem(this.siteName + '_siteUserId');
    localStorage.removeItem(this.siteName + '_siteOwnerId');
    localStorage.removeItem(this.siteName + '_privateSiteOwnerId');
    this.authService.isPrivateSite = "No";
    this.router.navigateByUrl('/home/top?location=world');
  }
  removeItems() {
    localStorage.removeItem(this.siteName + '_privateSiteName')
    localStorage.removeItem(this.siteName + '_privateSiteLogo')
    localStorage.removeItem(this.siteName + '_privateSiteDesc');
    localStorage.removeItem(this.siteName + '_privateSiteContact');
    localStorage.removeItem(this.siteName + '_privateSiteId');
    localStorage.removeItem(this.siteName + '_privateSiteUserId');
    localStorage.removeItem(this.siteName + '_privateSiteOwnerId');
    localStorage.removeItem(this.siteName + '_privateSiteUsername');
    localStorage.removeItem('messagePermission');
    localStorage.removeItem('privateSite');
    localStorage.removeItem(this.siteName + '_siteOwnerId');
    localStorage.removeItem(this.siteName + '_privateSiteOwner')
    localStorage.removeItem(this.siteName + '_siteUserId');
    this.authService.isPrivateSite = "No";
  }

  // Checks if user is in private site
  privateSiteCheck() {
    let httpLink = window.location.pathname.split('/');
    if (localStorage.getItem("privateSite") === "true" && httpLink[1] === "privatesites") { // Checks localStorage and parses current page link
      return true;
    }
    return false;
  }

  placeInFeedAd(index) {
    if (index !== 1 && index % this.adFeedIndex === 0) {
      return true;
    }
    return false;
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    if (((window.innerHeight + window.scrollY) >= (document.body.scrollHeight + document.getElementById('scroller').offsetTop)) && !this.pollsLoading && !this.initialPageLoad) {
      this.pollsLoading = true;
      this.getTopics(++this.pageNumber);
    }
}

onDateChage(value){
  if(this.currentTab != 'top') {
    this.initialPageLoad = true;
    this.previousPollCount = 0;
    this.pageNumber = 0;
    this.pollCountExceede = false;
    this.PollList = [];
    this.fromDate = moment(this.dateForm.controls.fromDate.value).toISOString();
    this.toDate = moment(this.dateForm.controls.toDate.value).toISOString();
    // console.log(this.toDate, this.fromDate)
    localStorage.setItem(this.siteName+'_toDate', this.toDate);
    localStorage.setItem(this.siteName+ '_fromDate', this.fromDate);
    this.getTopics(0)
  }
}
}
