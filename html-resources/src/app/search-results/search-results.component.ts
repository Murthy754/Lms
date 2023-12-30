import { Component, OnInit } from "@angular/core";
import { combineLatest, forkJoin } from "rxjs";
import { Router, ActivatedRoute } from "@angular/router";
import { SearchResultsService } from "./search-results.service";
import * as _ from "lodash";
@Component({
  selector: "app-search-results",
  templateUrl: "./search-results.component.html",
  styleUrls: ["./search-results.component.scss"]
})
export class SearchResultsComponent implements OnInit {
  searchType;
  searchParam;
  CateogriesList = [];
  UsersList: any = [];
  PollList: any = [];
  SearchInfo: any = [];
  Categories: any = [];
  mobileCategories = [];
  country;
  location;
  loading = false;
  siteName: String = "";
  constructor(
    private router: Router,
    private srService: SearchResultsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    let link = window.location.pathname.split('/');
    if (this.privateSiteCheck()) {
      this.siteName = link[2];
    }
    this.country = localStorage.getItem("currentCountry");
    this.location = "world";
    combineLatest(this.route.queryParams, this.route.params).subscribe(
      ([queryParams, params]) => {
        this.searchType = params.id;
        this.searchParam = queryParams.query;
        if (this.searchType === "profile") {
          this.getProfiles(this.searchParam);
        } else if (this.searchType === "poll") {
          if (this.CateogriesList.length > 0) this.getPolls(queryParams);
        } else if (this.searchType === "tag") {
          this.getTagPolls(queryParams.query);
        }
      },
      (error=>{
        console.log(error);
      })
    );
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
    let request = {
      tag: tag,
      user: localStorage.getItem('userId'),
      privatesite: localStorage.getItem(this.siteName + "_siteUserId")
    }
    this.srService.getSearchTags(request).subscribe((response) => {
       
      this.PollList = response["data"];
      this.SearchInfo = tag;
    })
  }
  createPoll() {}
  getProfiles(searchParam) {
    this.srService.getSearchUser().subscribe(data => {
      this.UsersList = data;
      this.SearchInfo = this.UsersList.filter(item => {
        return (
          item.firstName.toLowerCase().includes(searchParam.toLowerCase()) ||
          item.lastName.toLowerCase().includes(searchParam.toLowerCase()) ||
          (
            item.firstName.toLowerCase() +
            " " +
            item.lastName.toLowerCase()
          ).includes(searchParam.toLowerCase())
        );
      });
       
    },
    (error=>{
      console.log(error);
    }));
  }
  public getCategories(value): void {
    this.CateogriesList = value;
    var dataaa: any = value;
    dataaa.forEach(element => {
      this.Categories.push(element.name);
    });
    this.getPolls(this.searchParam);
  }
  getPolls(searchParam) {
    var arr = [];
    if (searchParam.categories) {
      arr = searchParam.categories.split(",");
      for (var i = 0; i < arr.length; i++) arr[i] = _.startCase(arr[i]);
    } else if (this.mobileCategories.length > 0) {
      arr = this.mobileCategories;
    } else arr = this.Categories;
    var data = {
      id: localStorage.getItem("userId"),
      searchParam: this.searchParam,
      categories: arr
    };
    this.srService.getSearchPolls(data).subscribe(data => {
       
      this.PollList = data;
    },
    (error=>{
      console.log(error);
    }));
  }
  profileRedirect(userId, userName) {
    if (userId === localStorage.getItem("userId")) {
      this.router.navigate(["/profile/mytopics"]);
    } else {
      this.router.navigate(["/userprofile/" + userName]);
    }
  }
  filterPolls() {
    this.getPolls(this.searchParam);
  }
  mobilecategoryPolls(catname) {
    var temppolls = this.mobileCategories.filter(item => {
      return item.includes(catname);
    });
    if (temppolls.length == 0) this.mobileCategories.push(catname);
    else {
      var index = this.mobileCategories.indexOf(catname);
      if (index !== -1) this.mobileCategories.splice(index, 1);
    }
  }
  checkCategory(catname) {
    var temppolls = this.mobileCategories.filter(item => {
      return item.includes(catname);
    });
    if (temppolls.length > 0) return true;
    return false;
  }
}
