import { Component, } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { SignupmodalService } from './signupmodal/signupmodal.service';
import { CookieService } from "ngx-cookie-service";
import { LoaderService } from "./shared-services/loader.service";
import { Socket } from "ngx-socket-io";
import { SharedService } from "./shared-services/shared.service";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  title = "html-resources";
  showLoader: boolean;
  loading;
  isPrivateSite="No";
  isLoading ;
  siteName: string;
  constructor(
    public router: Router,
    public authserve: AuthService,
    public signupModalService:SignupmodalService,
    public cookieService:  CookieService,
    private loaderService: LoaderService,
    private socket: Socket,
    private sharedService: SharedService
  ) {
    localStorage.setItem("initialLoad",'true')
    //triggered when configurations changed by admin in adminSite.
    this.socket.fromEvent<any>("GlobalConfigurations").subscribe((data) => {
      localStorage.setItem("globalConfigurations", data);
    },
      (error => {
        console.error(error);
      }));

    this.loaderService.loadingChange.subscribe(value => {
      this.isLoading = value;
  });
    this.isPrivateSite="No";
    authserve.privateSite.subscribe(isPrivateSite => {
      if(isPrivateSite || isPrivateSite === 'Yes'){
          this.isPrivateSite=isPrivateSite;
      }
      else{
        this.isPrivateSite="No";
      }
    }, ((error) => {
        console.log(error);
    }));
      
    signupModalService.privateSite.subscribe(isPrivateSite => {
      if(isPrivateSite || isPrivateSite === 'Yes'){
        this.isPrivateSite=isPrivateSite;
      }
      else{
        this.isPrivateSite="No";
      }
    }, ((error) => {
      console.log(error);
    }));
  }
  ngOnInit() {
    this.onInit();
  }

  onInit() {
    //getting configurations and settin in localStorage
    this.sharedService.getConfigs().toPromise().then(config => {
      if (config['configurations']) {
        localStorage.setItem("globalConfigurations", JSON.stringify(config['configurations']));
      }
    });
    
    let link = window.location.pathname.split("/");
    if (link[1] === "privatesites") {
      this.siteName = link[2];
      this.authserve.isPrivateSite = "Yes";
    } else {
      this.authserve.isPrivateSite = "No";
    }

    if (!this.authserve.isLoggedIn()) {
      this.isPrivateSite="No";
    }
    this.authserve.status.subscribe((val: boolean) => {
    },
    (error=>{
      console.log(error);
    }));
  }
  checkforRecovery() {
    return false;
  }
  removeItems() {
    localStorage.removeItem(this.siteName + '_privateSiteName')
    localStorage.removeItem(this.siteName + '_privateSiteLogo')
    localStorage.removeItem(this.siteName + '_privateSiteDesc');
    localStorage.removeItem(this.siteName + '_privateSiteContact');
    localStorage.removeItem(this.siteName + '_privateSiteUserId');
    localStorage.removeItem(this.siteName + '_privateSiteOwnerId');
    localStorage.removeItem(this.siteName + '_privateSiteUsername');
    localStorage.removeItem(this.siteName + '_privateSiteId');
    localStorage.removeItem('messagePermission');
    localStorage.removeItem('privateSite');
    localStorage.removeItem(this.siteName + '_siteOwnerId');
    localStorage.removeItem(this.siteName + '_privateSiteOwner')
    localStorage.removeItem(this.siteName + '_siteUserId');
  }
}
