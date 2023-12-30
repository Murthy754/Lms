import { Component, Input, OnInit } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { SignupmodalService } from "./signupmodal.service";
import { CookieService } from "ngx-cookie-service";
import {
  AuthService,
  FacebookLoginProvider,
  GoogleLoginProvider
} from "angular-6-social-login";

import { AuthService as auth } from "../auth.service";
@Component({
  selector: "app-signup",
  templateUrl: "./signupmodal.component.html",
  styleUrls: ["./signupmodal.component.scss"]
})
export class SignupComponent implements OnInit {
  title: string;
  closeBtnName: string;
  showSignup: boolean;
  list: any[] = [];
  myval = "Harsha";
  SignInForm: FormGroup;
  loginError = "";
  SignUpForm: FormGroup;
  exists = "";
  isPrivateSite: boolean = false;
  siteName;
  constructor(
    public bsModalRef: BsModalRef,
    private cookieService: CookieService,
    private fb: FormBuilder,
    private router: Router,
    public authService: AuthService,
    private SService: SignupmodalService,
    private authSer: auth
  ) {
    this.SignInForm = this.fb.group({
      email: ["", [Validators.required]],
      password: ["", Validators.required]
    });
    this.SignUpForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]]
    });
  }
  ngOnInit() { 
    let link = window.location.pathname.split('/');
    if (link[1] === 'privatesites') {
      this.isPrivateSite = true;
      this.siteName = link[2];
    } else {
      localStorage.clear();
    }
  }
  cancel() {
    this.bsModalRef.hide();
  }
  changeSignup(val) {
    this.showSignup = val;
  }
  modalLogin() {
    this.loginError = "";
    if (this.SignInForm.invalid)
      return false;
     
    var credentails = {
      username: this.SignInForm.controls["email"].value,
      password: this.SignInForm.controls["password"].value
    };
    this.SService.userLogin(credentails).subscribe(res => {
      var result: any = res;
      if (result) {
        if (result.result) {
          if (result.user.userStatus === "InActive") {
            var confrimDialog = confirm(
              "Are you sure? Do you want to reactivate Again ?"
            );
            if (!confrimDialog) {
              this.bsModalRef.hide();
              return;
            } else this.userActviate(result.user._id);
          }
         this.SService.sendUserStatus(result.user);
          localStorage.setItem("userId", result.user._id);
          localStorage.setItem("userName", result.user.userName);
          localStorage.setItem("userMail", result.user.email);
          localStorage.setItem("country", result.user.address.country);
          localStorage.setItem("profilePicture", result.user.profilePicture);
          localStorage.setItem("userFirstName", result.user.firstName);
          localStorage.setItem("userLastName", result.user.lastName);
          if(result.user.eligibleForUserBenefits) {
            localStorage.setItem("eligibleForUserBenefits", result.user.eligibleForUserBenefits);
          }
          // localStorage.setItem('jwt', result.tokens.authToken)
          // localStorage.setItem('privateSite', result.user.privateSite);
          // localStorage.setItem('privateSiteUsername', result.user.userName);
          localStorage.setItem("loginType", 'normal');
          var key = "True"
          this.SService.newPOlls = key;
           
          this.bsModalRef.hide();
          if (this.isPrivateSite) {
            this.authSer.isPrivateSite = "Yes";
            this.router.navigateByUrl('/', { skipLocationChange: true}).then(() => {
              this.router.navigateByUrl('/privatesites/' + this.siteName);
            });
          }
          var value = "No";
          if (this.cookieService.get('privateSiteLink')) {
            var value = "Yes"
            this.router.navigateByUrl(this.cookieService.get('privateSiteLink'));
            this.cookieService.delete('privateSiteLink');
          }
          this.authSer.isPrivateSite = value;
          window.location.reload();
        } else {
           
          this.loginError = result.message;
        }
      }
    });
  }
  navtoForgotPage() {
    this.cancel();
  }
  checkUserExist(mail) {
    var data = {
      email: mail
    };
    this.SService.userFind(data).subscribe(res => {
       
      var mydata: any = res;
      if (res) {
        if (mydata.result) {
          this.exists = "";
          this.bsModalRef.hide();
          this.cookieService.set("userEmail", mail);
          this.router.navigate(["/signup"]);
        } else {
          this.exists = "Email address entered is already registered.";
        }
      } else {
      }
    });
  }
  modalSignup() {
    if (this.SignUpForm.invalid) {
      return false;
    }
     
    const myval: String = this.SignUpForm.controls["email"].value;
    this.checkUserExist(myval);
  }
  googleLogin() {
    let socialPlatformProvider;
    socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    this.authService.signIn(socialPlatformProvider).then(userData => {
      var UserData2 = {
        id: userData.id,
        provider: userData.provider,
        type: "check",
        email: userData.email
      };
       
      this.SService.createSocialUser(UserData2).subscribe(data => {
         
        var loginUserData: any = data;
        if (loginUserData.result) {
          if (loginUserData.user[0].userStatus === "InActive") {
            var confrimDialog = confirm(
              "Are you sure? Do you want to reactivate Again ?"
            );
            if (!confrimDialog) {
              this.bsModalRef.hide();
              return;
            } else this.userActviate(loginUserData.user[0]._id);
          }
          this.bsModalRef.hide();

          localStorage.setItem("userId", loginUserData.user[0]._id);
          localStorage.setItem("userName", loginUserData.user[0].userName);
          localStorage.setItem("userMail", loginUserData.user[0].email);
          localStorage.setItem("loginType", 'social');
          localStorage.setItem("country", loginUserData.user[0].address.country);
          localStorage.setItem("profilePicture", loginUserData.user[0].profilePicture);
          localStorage.setItem("userFirstName", loginUserData.user[0].firstName);
          localStorage.setItem("userLastName", loginUserData.user[0].lastName);
          // localStorage.setItem('jwt', loginUserData.tokens.authToken);
          localStorage.setItem(
            "profilePicture",
            loginUserData.user[0].profilePicture
          );
          if(loginUserData.user[0].eligibleForUserBenefits) {
            localStorage.setItem("eligibleForUserBenefits", loginUserData.user[0].eligibleForUserBenefits);
          }
          localStorage.setItem(
            "userFirstName",
            loginUserData.user[0].firstName
          );
          localStorage.setItem("userLastName", loginUserData.user[0].lastName);
          localStorage.setItem(
            "country",
            loginUserData.user[0].address.country
          );
          // var value = "Yes"
          // this.SService.isPrivateSite = value
          this.SService.currentUser = loginUserData.user[0]._id;

          if (this.isPrivateSite) {
            this.authSer.isPrivateSite = "Yes";
            this.router.navigateByUrl('/', { skipLocationChange: true}).then(() => {
              this.router.navigateByUrl('/privatesites/' + this.siteName);
            });
          }

          // if (this.cookieService.get('privateSiteLink')) {
          //   this.router.navigateByUrl(this.cookieService.get('privateSiteLink'));
          //   this.cookieService.delete('privateSiteLink');
          // }
          var value = "No";
          if (this.cookieService.get('privateSiteLink')) {
            var value = "Yes"
            this.router.navigateByUrl(this.cookieService.get('privateSiteLink'));
            this.cookieService.delete('privateSiteLink');
          }
          this.authSer.isPrivateSite = value;
          window.location.reload();
          this.authSer.isPrivateSite = value;
          if (loginUserData.user[0].privateSite) {
            localStorage.setItem('privateSiteName', loginUserData.user[0].privateSiteSettings.siteName)
            localStorage.setItem('privateSiteLogo', loginUserData.user[0].privateSiteSettings.siteLogo)
            localStorage.setItem('privateSiteOwner', loginUserData.user[0] + ' ' + loginUserData.user[0].lastName)
            localStorage.setItem('privateSiteUsername', loginUserData.user[0].userName);
            localStorage.setItem('privateSiteUserId', loginUserData.user[0]._id);
            localStorage.setItem('privateSiteDesc', loginUserData.user[0].privateSiteSettings.siteDescription);

            localStorage.setItem('privateSiteContact', loginUserData.user[0].privateSiteSettings.siteContact);
            var value = "Yes"
            this.SService.isPrivateSite = value
            if (loginUserData.user[0].privateSite) {
              // this.router.navigate(['profile/mytopics'])
              this.router.navigate(["/userprofile/" + loginUserData.user[0].userName]);

            }
            var key = "True"
            this.SService.newPOlls = key;
          }

        } else {
          localStorage.setItem("loginType", 'social');
          
          this.bsModalRef.hide();
          this.cookieService.set("socialUserMail", userData.email);
          this.cookieService.set("socialId", userData.id);
          this.cookieService.set("socialToken", userData.token);
          this.cookieService.set("socialProvider", userData.provider);
          this.cookieService.set("socialUserProfilePic", userData.image);
          this.cookieService.set("socialUserName", userData.name);
          this.router.navigate(["/signup/social"]);
        }
      });
    });
  }
  facebookLogin() {
    let socialPlatformProvider;
    socialPlatformProvider = FacebookLoginProvider.PROVIDER_ID;
    this.authService.signIn(socialPlatformProvider).then(userData => {
      var UserData2 = {
        id: userData.id,
        provider: userData.provider,
        type: "check",
        email: userData.email
      };
       
      this.SService.createSocialUser(UserData2).subscribe(data => {
         
        var loginUserData: any = data;
        if (loginUserData.result) {
          if (loginUserData.user[0].userStatus === "InActive") {
            var confrimDialog = confirm(
              "Are you sure? Do you want to reactivate Again ?"
            );
            if (!confrimDialog) {
              this.bsModalRef.hide();
              return;
            } else {
              this.userActviate(loginUserData.user[0]._id);
            }
          }
          this.bsModalRef.hide();

          localStorage.setItem("userId", loginUserData.user[0]._id);
          localStorage.setItem("userName", loginUserData.user[0].userName);
          localStorage.setItem("userMail", loginUserData.user[0].email);
          localStorage.setItem(
            "profilePicture",
            loginUserData.user[0].profilePicture
          );
          if(loginUserData.user[0].eligibleForUserBenefits) {
            localStorage.setItem("eligibleForUserBenefits", loginUserData.user[0].eligibleForUserBenefits);
          }
          localStorage.setItem(
            "country",
            loginUserData.user[0].address.country
          );
          // var value = "Yes"
          // this.SService.isPrivateSite = value;
          this.SService.currentUser = loginUserData.user[0]._id;

          localStorage.setItem("loginType", 'social');

          if (this.isPrivateSite) {
            this.authSer.isPrivateSite = "Yes";
            this.router.navigateByUrl('/', { skipLocationChange: true}).then(() => {
              this.router.navigateByUrl('/privatesites/' + this.siteName);
            });
          }
          
          var value = "No";
          if (this.cookieService.get('privateSiteLink')) {
            var value = "Yes"
            this.router.navigateByUrl(this.cookieService.get('privateSiteLink'));
            this.cookieService.delete('privateSiteLink');
          }
          this.authSer.isPrivateSite = value;
          window.location.reload();
          
          if (loginUserData.user[0].privateSite) {
            localStorage.setItem('privateSiteName', loginUserData.user[0].privateSiteSettings.siteName)
            localStorage.setItem('privateSiteLogo', loginUserData.user[0].privateSiteSettings.siteLogo)
            localStorage.setItem('privateSiteOwner', loginUserData.user[0] + ' ' + loginUserData.user[0].lastName)
            localStorage.setItem('privateSiteUsername', loginUserData.user[0].userName);
            localStorage.setItem('privateSiteUserId', loginUserData.user[0]._id);
            localStorage.setItem('privateSiteDesc', loginUserData.user[0].privateSiteSettings.siteDescription);

            localStorage.setItem('privateSiteContact', loginUserData.user[0].privateSiteSettings.siteContact);
            var value = "Yes"
            this.SService.isPrivateSite = value
            if (loginUserData.user[0].privateSite) {
              // this.router.navigate(['profile/mytopics'])
              this.router.navigate(["/userprofile/" + loginUserData.user[0].userName]);

            }
          }


        } else {
          this.bsModalRef.hide();
          this.cookieService.set("socialUserMail", userData.email);
          this.cookieService.set("socialId", userData.id);
          this.cookieService.set("socialToken", userData.token);
          this.cookieService.set("socialProvider", userData.provider);
          this.cookieService.set("socialUserProfilePic", userData.image);
          this.cookieService.set("socialUserName", userData.name);
          this.router.navigate(["/signup/social"]);
        }
      });
    });
  }
  userActviate(userId) {
    this.SService.activateUserId(userId).subscribe(docs => {
      // console.log(docs);
    });
  }
}
