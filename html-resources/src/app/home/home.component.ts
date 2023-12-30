import { FormControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Component, OnInit, HostListener, Output, EventEmitter, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { forkJoin,  } from "rxjs";
import { HomeService } from "./home.service";
import * as _ from "lodash";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { SignupComponent } from "../signupmodal/signupmodal.component";
import { SignupmodalService } from '../signupmodal/signupmodal.service';
import { AuthService } from "../auth.service";
import { HeaderComponent } from "../header/header.component";
import { CookieService } from "ngx-cookie-service";
import { MatDatepickerInputEvent, MatDialog } from "@angular/material";
import { CookiePolicyModalComponent } from "../cookie-policy-modal/cookie-policy-modal.component";
import { SharedService } from "../shared-services/shared.service";
import * as moment from "moment"
@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  providers: [HeaderComponent]
})
export class HomeComponent implements OnInit {
  adFeedIndex: number = 4;
  displayAds: Boolean = false;
  isWrapperStiky = false;
  searchKey = "";
  configurations = {};
  @HostListener("window:scroll", ["$event"])
  scrollHandler(event) {
    if (window.pageYOffset && window.pageYOffset > 82) {
      this.isWrapperStiky = true;
    } else this.isWrapperStiky = false;
  }
  @Output() datechange = new EventEmitter<MatDatepickerInputEvent<Date>>();
  currentTab = "";
  selectedTab = 2;
  isprivateSite: boolean = false;
  currentPage = 1;
  country;
  isLogIn = -1;
  isLogout = -1;
  location = "";
  Categories = [];
  CategoiesList: any = [];
  queryParams;
  categoryInfo = [];
  categoryfilter = [];
  CountryList: any = [];
  itemcount: any = 0;
  mobileCategoies = [];
  tempCountryList;
  recent: any = [];
  top: any = [];
  pollsCount: any = [];
  trending: any = [];
  pollList: any = [];
  bsModalRef: BsModalRef;
  p = 1;
  siteName: string;
  topicsPerPage = 5;
  pageNumber: number = 0;
  pollsNotLoading: boolean = true;
  skeletonLoading:boolean = false;
  previousPollCount: number = 0;
  pollCountExceede: boolean = false;
  initialPageLoad: boolean = true
  toDate: any;
  fromDate : any;
  dateForm: FormGroup ;
  today = new Date();


  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private hService: HomeService,
    private modalService: BsModalService,
    public authService: SignupmodalService,
    public auth: AuthService,
    private cookieService: CookieService,
    public dialog: MatDialog,
    private sharedService: SharedService
  ) {

    if(localStorage.getItem('toDate') && localStorage.getItem('fromDate')) {
      this.toDate = new Date(localStorage.getItem('toDate'));
      this.fromDate = new Date(localStorage.getItem('fromDate'))
    } else {
      this.toDate = moment(new Date()).toISOString();
      this.fromDate = moment(new Date(new Date().setFullYear(new Date().getFullYear() - 1))).toISOString()
    }

    this.dateForm = new FormGroup({
      toDate: new FormControl(this.toDate),
      fromDate: new FormControl(this.fromDate)
    })

    authService.itemValue.subscribe(currentUser => {
      if (currentUser && localStorage.getItem('izLogin')==='-1') {
         
        this.pollsCount = [];
        this.recent = [];
        localStorage.setItem('izLogin','1')
        localStorage.setItem('izLogout','-1')
        this.top = [];
        this.trending = [];
        this.ngOnInit();
   
      }
    },
    (error=>{
      console.log(error);
    })),
    authService.getNewPolls.subscribe(data => {
        if (!localStorage.getItem('izLogout')||localStorage.getItem('izLogout')==='-1') {
          localStorage.setItem('izLogin','-1')
          localStorage.setItem('izLogout','1')
           
          this.pollsCount = [];
          this.recent = [];
          this.top = [];
          this.trending = [];
          this.ngOnInit();
      
        }
      },
      (error=>{
        console.log(error);
      }));
  }

  async ngOnInit() {
    let cookieService = this.cookieService.get("cookieAcceptance");
    if (this.auth.isLoggedIn() && cookieService !== "true") {
      const dialogRef = this.dialog.open(CookiePolicyModalComponent, {
        width: '1000px',
        panelClass: "cookieModal"
      });
    }
    let link = window.location.pathname.split("/");
    if (link[1] === "privatesites") {
      this.siteName = link[2];
      this.auth.isPrivateSite = "Yes";
    } else {
      this.auth.isPrivateSite = "No";
    }
    if (!this.auth.isLoggedIn() && this.cookieService.get("privateSiteLink")) {
      this.openModalWithComponent(false);
    }
    let userHomeLocation = this.cookieService.get("userHomeLocation");
    if (userHomeLocation) {
      this.country = userHomeLocation; 
    }

    // Get global configurations for settings
    this.configurations = this.sharedService.getConfigurations()
        if (this.configurations != {}) {
          this.adFeedIndex = (this.configurations["feed_ad_index"]) ? this.configurations["feed_ad_index"] : this.adFeedIndex;
          this.displayAds = (this.configurations["show_google_ads"]) ? this.configurations["show_google_ads"] : this.displayAds;
          this.topicsPerPage = (this.configurations["topics_per_page"]) ? (this.configurations["topics_per_page"]) : this.topicsPerPage;
        }


    this.location
    if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
      this.isprivateSite = true;
    } else {
      if(!localStorage.getItem('izLogin')){
        localStorage.setItem('izLogin','-1')
        localStorage.setItem('izLogout','-1')
      }
      this.router.routeReuseStrategy.shouldReuseRoute = () => {
        return false;
      };
      this.queryParams = this.route.snapshot.queryParams;
      var params = this.route.snapshot.params;
       
      await this.getLocation().then(data => {
        if (this.queryParams["location"] === "world") {
          this.location = "world";
        } else this.location = "current";
        if(this.queryParams['location'] !=='world' && this.queryParams['location'] !== 'current')
        {
          this.country=this.queryParams['location'];
        }
        if(this.configurations['tabPreference'] && localStorage.getItem('initialLoad') == 'true') {
          localStorage.setItem("initialLoad",'false')
          var index = this.configurations['tabPreference'];
          this.currentTab = index;
        } else {
          var index = params["id"];
          this.currentTab = index;
        }
        if (index === "top") {
          this.selectedTab = 0;
        } else if (index === "trending") {
          this.selectedTab = 1;
        } else if (index === "recent") {
          this.selectedTab = 2;
        } else {
          this.selectedTab = 0;
        }
        
        this.getPollsCount();
        this.currentPage = 1;
        this.getSideDataForDisplay();
        this.getData(this.selectedTab, ++this.pageNumber);
      });
    }
  }

  ngOnDestroy(): void {
          
  }
  getLocation() {
    return new Promise((res, rej) => {
      forkJoin(
        this.hService.getCategories(),
        this.hService.getCurrentIpLocation(),
        this.hService.getJSON()
      ).subscribe(docs => {
        var value: any = docs;
        var cc = docs[1];
        this.CategoiesList = value[0];
        var dataaa: any = value[0];
        dataaa.forEach(element => {
          this.Categories.push(element.name);
        });
        if (this.cookieService.get('userMobileHomeCategory')) {
          let categories = JSON.parse(this.cookieService.get('userMobileHomeCategory'));
          for (var key in categories) {
            if (categories.hasOwnProperty(key)) {
              this.mobileCategoies.push(categories[key]);
            }
          }
        }
        this.CountryList = docs[2];
        this.categoryInfo=this.CategoiesList;

        if (this.cookieService.get('userHomeCategory')) {
          let categories = JSON.parse(this.cookieService.get('userHomeCategory'));
          this.categoryfilter = categories;
          this.categoryfilter.forEach((category) => {
            for (let i=0; i < this.categoryInfo.length ; i++) {
              if (this.categoryInfo[i]._id === category._id) {
                this.categoryInfo.splice(i, 1);
              }
            }
          });
        }
        this.tempCountryList = docs[2];
        if (!this.country && cc && cc.names) 
        this.country = cc.names.en;
        res(docs);
      },
      (error=>{
        console.log(error);
      }));
    });
  }
  SearchPolls(searchParam) {
    this.categoryInfo = this.CategoiesList.filter(item => {
      if((this.categoryfilter.find(element=>element===item))===undefined)
      return item.name.toLowerCase().includes(searchParam.toLowerCase());
    });
  }
  filterPolls(item, index) {
    this.initialPageLoad = true;
    this.previousPollCount = 0;
    this.pageNumber = 0;
    this.pollCountExceede = false;
    this.pollList = [];
    this.categoryfilter.push(item);
    this.cookieService.set("userHomeCategory", JSON.stringify(this.categoryfilter));
    this.categoryInfo.splice(index, 1);
    var params = "";
    for (var i = 0; i < this.categoryfilter.length; i++) {
      if (i != this.categoryfilter.length - 1)
        params = params + this.categoryfilter[i].name.toLowerCase() + ",";
      else params = params + this.categoryfilter[i].name.toLowerCase();
    }
    var a = this.categoryInfo.sort((a, b) => a.name.localeCompare(b.name));
    this.getData(this.selectedTab,0);
    this.getPollsCount();
    // this.router.navigateByUrl(this.urllink + "&categories=" + params);
  }

  removecategoryPolls(item, index) {
    this.initialPageLoad = true;
    this.previousPollCount = 0;
    this.pageNumber = 0;
    this.pollCountExceede = false;
    this.pollList = [];
    this.categoryInfo.push(item);
    this.categoryfilter.splice(index, 1);
    this.cookieService.set("userHomeCategory", JSON.stringify(this.categoryfilter));
    var params = "";
    for (var i = 0; i < this.categoryfilter.length; i++) {
      if (i != this.categoryfilter.length - 1)
        params = params + this.categoryfilter[i].name + ",";
      else params = params + this.categoryfilter[i].name;
    }
    this.categoryInfo.sort((a, b) => a.name.localeCompare(b.name));
    this.getData(this.selectedTab,0);
    this.getPollsCount();
    // var urlString = this.urllink;
    // if (this.categoryfilter.length > 0) {
    //   urlString = urlString + "&categories=" + params;
    // }
    // this.router.navigateByUrl(urlString);
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
  pollOverlay(id, type) {
    this.router.navigate(["/poll/" + id]);
  }
  
  getSideDataForDisplay() {
    var arr = [];
    if (this.queryParams && this.queryParams.categories) {
      arr = this.queryParams.categories.split(",");
      for (var i = 0; i < arr.length; i++) arr[i] = _.startCase(arr[i]);
    } else if (this.mobileCategoies.length > 0) {
      arr = this.mobileCategoies;
    } else arr = this.Categories;
    var data = {
      country: this.country,
      id: localStorage.getItem("userId"),
      categories: arr,
      range: 0,
      limit: 4,
      toDate: this.toDate,
      fromDate: this.fromDate
    };
    var getListArray=[0,1,2];
    var index = getListArray.indexOf(this.selectedTab);
    if (index !== -1) getListArray.splice(index, 1);
    if(this.location === "world"){
      return forkJoin(
        this.hService.getWorldPollData(data, 0),
        this.hService.getWorldPollData(data, 1),
        this.hService.getWorldPollData(data, 2),

      ).subscribe(docs => {
          if(this.selectedTab===0){
              this.recent=docs[2];
              this.trending=docs[1];              
          }
          else if(this.selectedTab==1)
          {
            this.top=docs[0];
            this.recent=docs[2];
          }
          else
          {
            this.top=docs[0];
            this.trending=docs[1];
          }
      },
      (error=>{
        console.log(error);
      }));
    } else {
        return forkJoin(
          this.hService.getPolllsData(data, 0),
          this.hService.getPolllsData(data, 1),
          this.hService.getPolllsData(data, 2),

        ).subscribe(docs => {
            if(this.selectedTab===0){
                this.recent=docs[2];
                this.trending=docs[1];                
            }
            else if(this.selectedTab==1)
            {
              this.top=docs[0];
              this.recent=docs[2];
            }
            else
            {
              this.top=docs[0];
              this.trending=docs[1];
            }
        },
        (error=>{
          console.log(error);
        }));
  }
  }

  getData(selectedTab, num) {
    var arr = [];
    if (this.queryParams && this.queryParams.categories) {
      arr = this.queryParams.categories.split(",");
      for (var i = 0; i < arr.length; i++) arr[i] = _.startCase(arr[i]);
    } else if (this.mobileCategoies.length > 0) {
         arr = this.mobileCategoies;
    } 
    else if(this.categoryfilter.length>0){
        this.categoryfilter.forEach(element => {
          arr.push(element.name);
        });
    }
    else arr = this.Categories;
    var data = {
      country: this.country,
      id: localStorage.getItem("userId"),
      categories: arr,
      range: this.pollList.length,
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId'),
      limit: this.topicsPerPage,
      totalItems: this.itemcount,
      toDate : this.toDate,
      fromDate: this.fromDate
    };

    this.skeletonLoading = true;
        if((!this.pollCountExceede)) {
          if (this.location !== "world") {
            return forkJoin(this.hService.getPolllsData(data, selectedTab)).subscribe(
              (data: Array<any>) => {
                this.skeletonLoading = false;
                this.pollsNotLoading = true;
                if(data[0].length){
                 this.pollList = _.unionBy(this.pollList, data[0],'_id')
                }
                
                if(this.previousPollCount+this.topicsPerPage > this.pollList.length) {
                  this.pollCountExceede = true;
                } else {
                  this.previousPollCount = this.pollList.length
                  this.pollCountExceede = false;
                }
                this.initialPageLoad = false;              
              },
              (error=>{
                this.skeletonLoading = false;
                this.pollsNotLoading = true;
                this.initialPageLoad = false;
                console.log(error);
              })
            );
          } else {
            return forkJoin(
              this.hService.getWorldPollData(data, selectedTab)
            ).subscribe((data:Array<any>) => {
              this.skeletonLoading = false;
              this.pollsNotLoading = true;
              if(data[0].length){
                this.pollList = _.unionBy(this.pollList, data[0],'_id')              
              }
              if(this.previousPollCount + this.topicsPerPage  > this.pollList.length) {
                this.pollCountExceede = true;
              } else {
                this.previousPollCount = this.pollList.length
                this.pollCountExceede = false;
              }
              this.initialPageLoad = false;

            },
            (error=>{
              this.pollsNotLoading = true;
              this.skeletonLoading = false;
              this.initialPageLoad = false;
              console.log(error);
            }));
          }
      }
  }

  getPollsCateogies(){
    if(this.categoryfilter.length>0){
      var tempCats:any=[];
      this.categoryfilter.forEach(element => {
        tempCats.push(element.name)
      });
      return tempCats;
    }
    else  if(this.mobileCategoies.length>0)
      return this.mobileCategoies;
    else
    {
      var tempCats:any=[];
      this.categoryInfo.forEach(element => {
        tempCats.push(element.name)
      });
      return tempCats;
    }
  }
  async getPollsCount() {
    var arr = [];
    if (this.queryParams && this.queryParams.categories) {
      arr = this.queryParams.categories.split(",");
      for (var i = 0; i < arr.length; i++) arr[i] = _.startCase(arr[i]);
    } else if (this.mobileCategoies.length > 0) {
      arr = this.mobileCategoies;
    } else if (this.categoryfilter.length > 0) {
      this.categoryfilter.forEach(element => {
        arr.push(element.name);
      });
    } else arr = this.Categories;
    var data = {
      id: localStorage.getItem("userId"),
      categories: arr,
      country: this.country
    };
    await this.hService.getNewPollsCount(data,this.selectedTab,this.queryParams['location']).subscribe(docs=>{
        this.itemcount=docs;
    },
    (error=>{
      console.log(error);
    }));
  }
  locationChange(location) {
    this.initialPageLoad = true;
    localStorage.setItem('selectedLocation', location);
    this.searchKey = "";
    if (location === "world") {
      this.location = "world";
      // this.cookieService.set("userHomeLocation", location, 30);
    } else {
      this.location = "current";
      this.country = location;
      this.cookieService.set("userHomeLocation", location, 30);
    }
    this.onChangeTab(this.selectedTab);
  }
  getFilterConutries(searchKey) {
    this.tempCountryList = [];
    this.tempCountryList = this.CountryList.filter(item => {
      return item.name.toLowerCase().includes(searchKey.toLowerCase());
    });
    return this.tempCountryList;
  }
  onChangeTab(index) {
    this.initialPageLoad = true;
    this.previousPollCount = 0;
    this.pageNumber = 0;
    this.pollCountExceede = false;
    this.pollList = [];
    var tempCountry;
    // console.log("navigation");
    if (this.location === "world") tempCountry = "world";
    else tempCountry = this.country;
    if (index == 0) {
      var urlString = "home/top?location=" + tempCountry;
      if (this.queryParams.categories) {
        urlString = urlString + "&categories=" + this.queryParams.categories;
      }
      this.router.navigateByUrl(urlString);
      this.cookieService.set("userHomeTabLocation", "top");
    } else if (index == 1) {
      var urlString = "home/trending?location=" + tempCountry;
      if (this.queryParams.categories) {
        urlString = urlString + "&categories=" + this.queryParams.categories;
      }
      this.router.navigateByUrl(urlString);
      this.cookieService.set("userHomeTabLocation", "trending");
    } else if (index == 2) {
      var urlString = "home/recent?location=" + tempCountry;
      if (this.queryParams.categories) {
        urlString = urlString + "&categories=" + this.queryParams.categories;
      }
      this.router.navigateByUrl(urlString);
      this.cookieService.set("userHomeTabLocation", "recent");
    }
  }
  createNewTopic() {
    if (!this.auth.isLoggedIn()) {
      this.openModalWithComponent(false);
      return;
    }
    this.router.navigate(["/topic/new/start"]);
  }
  changePage(event) {
    this.currentPage = event;
    this.p = event;
    this.getData(this.selectedTab, (event === 1) ? 0 : (event - 1) * this.topicsPerPage);
  }
  getpolls() {
    this.getData(this.selectedTab, 1);
  }
  mobilecategoryPolls(catname) {
    var temppolls = this.mobileCategoies.filter(item => {
      return item.includes(catname);
    });
    if (temppolls.length == 0) {
      this.mobileCategoies.push(catname);
      this.cookieService.set("userMobileHomeCategory", JSON.stringify(this.mobileCategoies));
    } else {
      var index = this.mobileCategoies.indexOf(catname);
      if (index !== -1) {
        this.mobileCategoies.splice(index, 1);
        this.cookieService.set("userMobileHomeCategory", JSON.stringify(this.mobileCategoies));
      }
    }
  }
  checkCategory(catname) {
    var temppolls = this.mobileCategoies.filter(item => {
      return item.includes(catname);
    });
    if (temppolls.length > 0) return true;
    return false;
  }
  removeItems() {
    localStorage.removeItem('privateSiteName')
    localStorage.removeItem('privateSiteLogo')
    localStorage.removeItem('privateSiteDesc');
    localStorage.removeItem('privateSiteContact');
    localStorage.removeItem('privateSiteUserId');
    localStorage.removeItem('privateSiteOwnerId');
    localStorage.removeItem('privateSiteUsername');
    localStorage.removeItem('messagePermission');
    localStorage.removeItem('privateSite');
    localStorage.removeItem('siteOwnerId');
    localStorage.removeItem('privateSiteOwner')
    localStorage.removeItem('siteUserId');
    localStorage.removeItem('toDate')
    localStorage.removeItem('fromDate')
    this.authService.isPrivateSite = "No";
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {    
    if ((_.ceil(window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight) ) && this.pollsNotLoading && !this.initialPageLoad) {
      //initialPageLoad is set for blocking this 'onScroll' event for initial paga loading , so 'getData' method is called only once.
      this.pollsNotLoading = false;
      this.getData(this.selectedTab, ++this.pageNumber);
    }
}

  placeInFeedAd(index) {
    if (index !== 1 && index % this.adFeedIndex === 0) {
      return true;
    }
    return false;
  }

  onDateChage(value){
    if(this.currentTab != 'top') {
      this.initialPageLoad = true;
      this.previousPollCount = 0;
      this.pageNumber = 0;
      this.pollCountExceede = false;
      this.pollList = [];
      this.fromDate = moment(this.dateForm.controls.fromDate.value).toISOString();
      this.toDate = moment(this.dateForm.controls.toDate.value).toISOString();
      localStorage.setItem('toDate', this.toDate);
      localStorage.setItem('fromDate', this.fromDate);
      this.getData(this.selectedTab,++this.pageNumber);
    }
  }
}
