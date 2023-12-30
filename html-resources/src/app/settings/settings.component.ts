import { PrivatesiteHeaderComponent } from './../privatesite-header/privatesite-header.component';
import { AppComponent } from './../app.component';
import { Component, OnInit, ViewChild, NgZone } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { SettingsService } from "./settings.service";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ModalComponent } from "../modal/modal.component";
import { CreatetopicService } from '../createnewtopic/createtopic.service';
import { DomSanitizer } from "@angular/platform-browser";
import { AuthService } from "../auth.service";
import { ActivatedRoute, Router } from "@angular/router";
import { SubscribersService } from "../subscribers/subscribers.service";
import { FormCanDeactivate } from '../form-can-deactivate/form-can-deactivate';
import { forkJoin } from "rxjs";
import { HeaderComponent } from "../header/header.component";
import { NgForm } from "@angular/forms";
import { UserprofileService } from "../userprofile/userprofile.service";
import { UploadService } from "../shared-services/upload.service";
import { MatSnackBar } from '@angular/material';
import { FileSharingService } from "../file-sharing/file-sharing.service";
import { SharedService } from '../shared-services/shared.service';
import { HeaderService } from './../header/header.service';


declare var $: any;

@Component({
  providers: [HeaderComponent, AppComponent, PrivatesiteHeaderComponent],
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"]
})

export class SettingsComponent extends FormCanDeactivate implements OnInit {
  displayAds: Boolean = false;
  saveValidity = true;
  @ViewChild('form', { static: false })
  form: NgForm;
  youtube_status_val = "";
  youtube_save;
  oldPasswordMatch;
  YoutubeForm: FormGroup;
  MakePrivateSite = false;
  NonSubscribersPrivateData = false;
  ResetPasswordForm: FormGroup;
  privateSettingsForm: FormGroup;
  newpassword = "";
  confirmpassword = "";
  passwordConfirmation = "";
  ErrorMessageForPrivateSite;
  dont_show;
  subscribersList;
  webSiteLogoPic;
  webSiteLogoFile;
  oldpassword = "";
  isOwner: boolean = false;
  isPrivateSite: boolean = false;
  subscribers = [];
  functionForModal = "";
  bsModalRef: BsModalRef;
  setPrivateSite;
  loginType;
  pexists = false;
  chekckType;
  websitename;
  privateSiteSettingsExist: boolean = false;
  AllowAutomaticSub: boolean = true;
  privateTopicsPublicView: boolean = true;
  privateSiteOwner: any = false;
  privateSiteSettings: any;
  adminsList = [];
  isPrivateSiteOwner: boolean = false;
  siteName;
  blockedUpload = [];
  blockedDownload = [];
  blockedFileAccess = [];
  save: boolean = false
  isProfilepicError: boolean = false;
  createPrivateSite: Boolean = true;
  privatesiteIsActive: boolean = false;

  constructor(
    private appComponent: AppComponent,
    private headerComponent: HeaderComponent,
    private pHeader: PrivatesiteHeaderComponent,
    private ngZone: NgZone,
    private fb: FormBuilder,
    private settingService: SettingsService,
    private modalService: BsModalService,
    private cService: CreatetopicService,
    private sanitizer: DomSanitizer,
    private SService: AuthService,
    private router: Router,
    private sService: SubscribersService,
    private userProfileService: UserprofileService,
    private uploadService: UploadService,
    private snackBar: MatSnackBar,
    private fileSharingService: FileSharingService,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private _headerservice: HeaderService
  ) {
    super();
  }

  ngOnInit() {
    let link = window.location.pathname.split('/');
    if (this.privateSiteCheck()) {
      this.siteName = link[2];
    }
    if (this.privateSiteCheck()) {
      this.isPrivateSite = true;
      if (localStorage.getItem("userId") === localStorage.getItem(this.siteName + "_privateSiteOwnerId")) {
        this.isOwner = true;
        let subscriptionObj = {
          privateSiteId: localStorage.getItem(this.siteName + '_siteUserId'),
          id: localStorage.getItem(this.siteName + "_siteUserId")
        };
        // Get all subscribers
        this.subscribers = [];
        this.sService.getPrivateSiteSubscribers(subscriptionObj).subscribe(data => {
          let subscribersList = Object.assign([], data);
          if (subscribersList.length>0) {
            subscribersList.forEach(subscriber => {
              if (subscriber["subscriber"]["_id"] !== localStorage.getItem("userId")) {
                this.subscribers.push(subscriber["subscriber"]);
              }
            });
          } else {
            this.subscribers = [];
          } 
        });

        // Get File permissions settings
        this.fileSharingService.getFilePermissions(localStorage.getItem(this.siteName + "_privateSiteUserId"), this.isOwner).subscribe((response) => {
          if (response["success"]) {
            if (response["doc"] && response["doc"].length > 0) {
              let blocked = response["doc"][0]["blocked"];
              if (blocked && blocked["fileAccess"]) {
                this.blockedFileAccess = blocked["fileAccess"];
              }
              if (blocked && blocked["upload"]) {
                this.blockedUpload = blocked["upload"];
              }
              if (blocked && blocked["download"]) {
                this.blockedDownload = blocked["download"];
              }
            }
          }
        }, (error) => {
          console.error(error);
        });
      } else {
        let subscriptionObj = {
          privateSiteId: localStorage.getItem(this.siteName + '_siteUserId'),
          id: localStorage.getItem(this.siteName + "_siteUserId")
        }
        // Get all subscribers
        this.subscribers = [];
        this.sService.getAllSubscribers(subscriptionObj).subscribe(data => {
          let subscribersList = Object.assign([], data);
          subscribersList.forEach(subscriber => {
            if (subscriber["subscriber"]["_id"] !== localStorage.getItem("userId")) {
              this.subscribers.push(subscriber["subscriber"]);
            }
          });

          this.settingService
          .getPrivateSettings(localStorage.getItem(this.siteName + "_siteOwnerId"))
          .subscribe(data => {
            this.privateSiteSettings = data;
            if (this.privateSiteSettings) {
              if (this.privateSiteSettings["ownerId"] === localStorage.getItem("userId")) {
                this.isPrivateSiteOwner = true;
              }
            }
            var i = 0;
            this.subscribers.forEach(subscriber => {
              const value = data["admins"].indexOf(subscriber["_id"]);
              if (value > -1) {
                this.subscribers[i]["isAdmin"] = true;
              } else {
                this.subscribers[i]["isAdmin"] = false;
              }
              i++;
            });
          });
        });
      }
    } else {
      this.isPrivateSiteOwner = true;
    }
     
    this.YoutubeForm = this.fb.group({
      youtube_save: [false]
    });
    if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
      this.privateSiteOwner = true;
      this.setPrivateSite = localStorage.getItem("privateSite");
    }
    this.loginType = "normal";
    if (localStorage.getItem("loginType") === 'social') {
      this.loginType = "social"
    }
    if (this.privateSiteCheck()) {
      this.SService.isPrivateSite = "Yes";
    } else {
      this.SService.isPrivateSite = "No";
    }
    this.ResetPasswordForm = this.fb.group({
      oldpassword: [''],
      newpassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmpassword: ['', [Validators.required, Validators.minLength(8)]]
    });
    this.privateSettingsForm = this.fb.group({
      // websitename: ['', [Validators.required]],
      websitename: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9_.]*$')]],
      websitedescription: ['', [Validators.required]],
      privateForNonSubscribers: [false, []],
      websitecontact: ['', [Validators.required]],
      checkPrivate: [],
      messagePermission: [true, []]
    });
    
    this.getSubscribersData();
    if (!this.privateSiteCheck()){
      this.checkPrivateSiteEligibility();
    } else {
       
    }

    if (this.privateSiteCheck()) {
      if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
        this.isPrivateSiteOwner = true;
      }
      this.settingService
        .getSiteSettings(this.siteName)
        .subscribe(response => {
          // this.loading = false;
          this.privatesiteIsActive = response['data']['isActive']
           
          this.privateSiteSettings = response["data"];
          this.MakePrivateSite = true;
          if (this.privateSiteSettings && this.privateSettingsForm) {
            this.privateSiteSettingsExist = true;
            this.privateSettingsForm.controls['websitename'].setValue(this.privateSiteSettings.settings.siteName)
            this.privateSettingsForm.controls['websitedescription'].setValue(this.privateSiteSettings.settings.siteDescription)
            this.privateSettingsForm.controls['privateForNonSubscribers'].setValue(this.privateSiteSettings.settings.siteSubPrivate);
            this.privateSettingsForm.controls['websitecontact'].setValue(this.privateSiteSettings.settings.siteContact);
            this.privateSettingsForm.controls['messagePermission'].setValue(this.privateSiteSettings.allowAutomaticSubscription);
            this.AllowAutomaticSub = this.privateSiteSettings.allowAutomaticSubscription;
            this.webSiteLogoPic = this.privateSiteSettings.settings.siteLogo;
            this.privateTopicsPublicView = this.privateSiteSettings.privateTopicsPublicView;
          }
        });
    }
    
    // Get global configurations for settings
    let configurations = {};
    configurations = this.sharedService.getConfigurations()
    if (configurations != {}) {
      this.displayAds = (configurations["show_google_ads"]) ? configurations["show_google_ads"] : this.displayAds;
    }

  }
  getSubscribersData() {
    var countryObj = {
      id: localStorage.getItem("userId"),
      country: localStorage.getItem("currentCountry"),
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    };
    this.sService.getSubscribersByCountry(countryObj)
      .subscribe(data => {
        this.subscribersList = data;
      },
        (error => {
          console.log(error);
        }))
  }
  processResetPassword() {
    if (!this.ResetPasswordForm.valid)
      return;
    var profileData = {
      id: localStorage.getItem("userId"),
      password: this.ResetPasswordForm.controls["oldpassword"].value,
      newpassword: this.ResetPasswordForm.controls["newpassword"].value,
    };
    this.settingService.updateProfilePassword(profileData).subscribe(data => {
      if (data === null) {
        return;
      }else if (data['error'] === "Authentication error") {
        this.router.navigateByUrl('/home/top?location=world');
        this.SService.isPrivateSite = "No";
        window.location.reload();
        this.headerComponent.openModalWithComponent(false);
        return;
      }
      var result: any = data;
      this.oldPasswordMatch = result.message
       
      this.ResetPasswordForm.controls['confirmpassword'].setValue('');
      this.ResetPasswordForm.controls['newpassword'].setValue('');
      this.ResetPasswordForm.controls['oldpassword'].setValue('');
    },
      (error => {
        console.log(error);
      }));
  }
  processYoutubeForm() {
     
    var youtubeData = {
      savetoYoutube: this.YoutubeForm.controls["youtube_save"].value,
      show_modal_box: this.dont_show,
      youtube_status: this.youtube_status_val,
      id: localStorage.getItem("userId")
    };
    this.settingService.setYoutbeSettings(youtubeData).subscribe(data => {
       
    },
      (error => {
        console.log(error);
      }));
  }

  onFileChange(event) {
    this.webSiteLogoFile = event.target.files[0];
    if (this.webSiteLogoFile) {
      this.webSiteLogoPic = this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(this.webSiteLogoFile)
      );
      this.isProfilepicError = false;
    } else {
        this.isProfilepicError = true;
    }
  }
  savePrivateSettingsForm(event) {
     
    this.save = true
    if (this.privateSettingsForm.valid && this.webSiteLogoFile) {
      this.isProfilepicError = false
      this.uploadService.uploadFile(this.webSiteLogoFile).then(
        pased => {
          this.saveSettings(pased.Location)
        },
        err => {

        }
      );
    }
    else if (this.privateSettingsForm.valid && this.webSiteLogoPic) {
      this.isProfilepicError = false;
      this.saveSettings(this.webSiteLogoPic)
    }
    else {
      if(this.webSiteLogoFile == undefined) {
        this.isProfilepicError = true;
      }
       this.privateSettingsForm.markAllAsTouched();
      // console.log("Invalid Form",this.webSiteLogoFile,this.privateSettingsForm.valid);
    }
  }
  checkPrivateSiteName() {
    var name = this.privateSettingsForm.controls['websitename'].value;
    if (name) {
      this.settingService.checkPrivateSiteName(name).subscribe(res => {
        if (res) {
          if (res[0]) {
            this.saveValidity = true;
            this.pexists = true;
          } else {
            this.pexists = false;
          }
        }
      })
    }
  }
  saveSettings(url) {
    localStorage.setItem(this.privateSettingsForm.controls['websitename'].value+'_privateSiteOwnerId', localStorage.getItem('userId'));
    localStorage.setItem(this.privateSettingsForm.controls['websitename'].value+'_siteOwnerId', localStorage.getItem('userId'));
    localStorage.setItem(this.privateSettingsForm.controls['websitename'].value+'_privateSiteLogo', url)
    if (this.privateSiteSettingsExist === false) {
      this.settingService.getUserProfileDetails(localStorage.getItem('userId')).subscribe((data) => {
        var userData = {};
        userData['email'] = data[0].email;
        userData['firstName'] = data[0].firstName;
        userData['lastName'] = data[0].lastName;
        userData['address'] = data[0].address.country;
        userData['userName'] = data[0].userName;
        userData['profilePicture'] = data[0].profilePicture;
        userData['privateSite'] = true;
        userData['id'] = localStorage.getItem('userId');
        userData['privateSiteUserId'] = localStorage.getItem(this.siteName + '_privateSiteUserId');
        userData['privateSiteSettings'] = {
          siteName: this.privateSettingsForm.controls['websitename'].value,
          siteLogo: url,
          siteDescription: this.privateSettingsForm.controls['websitedescription'].value,
          siteSubPrivate: this.privateSettingsForm.controls['privateForNonSubscribers'].value,
          siteContact: this.privateSettingsForm.controls['websitecontact'].value
        }
        userData['allowAutomaticSubscription'] = this.privateSettingsForm.controls['messagePermission'].value;
        userData['privateTopicsPublicView'] = this.privateTopicsPublicView;
  
        return new Promise((res, rej) => {
          forkJoin(
            this.settingService.savePrivateSiteSettings(userData)
            // this.settingService.updatePollToPrivate(Sitedata)
          ).subscribe((result: any) => {
            // console.log(result[0]);
            let data = [];
            data[0] = result[0].data
            this.siteName = this.privateSettingsForm.controls['websitename'].value
            localStorage.setItem(this.privateSettingsForm.controls['websitename'].value+"_siteUserId" , data[0]._id)
            localStorage.setItem(this.privateSettingsForm.controls['websitename'].value+'_privateSiteName', data[0].firstName)
            localStorage.setItem(this.privateSettingsForm.controls['websitename'].value+"_privateSiteId" , result[0].privateSiteId)
            localStorage.setItem('privateSite', "true");
            this.fileSharingService.getFilePermissions(data[0]._id, true).subscribe((response) => {
              if (response["success"]) {
              }
            }, (error) => {
              console.error(error);
            });


            if (localStorage.getItem(this.siteName + '_privateSiteUserId') === null) {
              this.updatePrivateSiteModel(data[0]);
            } else {
               
              this.saveValidity = true;
              this.SService.isPrivateSite = "No";
              this.router.navigateByUrl("/privatesites/" + this.privateSettingsForm.controls['websitename'].value);
            }
          },
            (error => {
              console.log(error);
            }))
        });
      }, (error) => {
        console.log(error);
      });
    } else {
      this.settingService.getUserProfileDetails(localStorage.getItem('userId')).subscribe((data) => {
        var userData = {};
        userData['email'] = data[0].email;
        userData['firstName'] = data[0].firstName;
        userData['lastName'] = data[0].lastName;
        userData['address'] = data[0].address.country;
        userData['userName'] = data[0].userName;
        userData['profilePicture'] = data[0].profilePicture;
        userData['privateSite'] = true;
        userData['id'] = localStorage.getItem('userId');
        userData['privateSiteUserId'] = localStorage.getItem(this.siteName + '_privateSiteUserId');
        userData['privateSiteSettings'] = {
          siteName: this.privateSettingsForm.controls['websitename'].value,
          siteLogo: url,
          siteDescription: this.privateSettingsForm.controls['websitedescription'].value,
          siteSubPrivate: this.privateSettingsForm.controls['privateForNonSubscribers'].value,
          siteContact: this.privateSettingsForm.controls['websitecontact'].value
        }
        userData['privateSiteSettingsId'] = this.privateSiteSettings._id;
        userData['allowAutomaticSubscription'] =  this.privateSettingsForm.controls['messagePermission'].value;;
        userData['privateTopicsPublicView'] = this.privateTopicsPublicView;
        return new Promise((res, rej) => {
          forkJoin(
            this.settingService.updatePrivateSiteSettings(userData)
            // this.settingService.updatePollToPrivate(Sitedata)
          ).subscribe((data: any) => {
            this.siteName = this.privateSettingsForm.controls['websitename'].value;
            localStorage.setItem(this.privateSettingsForm.controls['websitename'].value+"_siteUserId" , data[0]._id)
            localStorage.setItem(this.privateSettingsForm.controls['websitename'].value+'_privateSiteName', data[0].firstName)
            if (data === null) {
              return;
            } else if (data[0]['error'] === "Authentication error") {
              this.router.navigateByUrl('/home/top?location=world');

              this.headerComponent.openModalWithComponent(false);
              this.SService.isPrivateSite = "No";
              window.location.reload();
              return;
            }
            this.saveValidity = true;
            if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
              this.ngZone.run(() => {
                this.SService.isPrivateSite = "No";
                this.pHeader.navToMainSite();
              })
            } else {
              this.ngZone.run(() => {
                this.SService.isPrivateSite = "No";
                window.location.reload();
              });    
            }   
          },
            (error => {
              console.log(error);
            }))
        });
      }, (error) => {
        console.log(error);
      });
    }
  }

   // To show confirmation
   openSnackBar(message: string) {
      this.snackBar.open(message, "OK", {
        duration: 2000,
      });
    }

  updatePrivateSiteModel(data) {
    data["id"] = localStorage.getItem('userId');
    this.settingService.updatePrivateSite(data).subscribe((result) => {
       
      this.saveValidity = true;
      this.router.navigateByUrl("/privatesites/" + this.privateSettingsForm.controls['websitename'].value);
    });
  }

  changePrivateSiteSettings(event) {
    // this.MakePrivateSite=false;
    this.passwordConfirmation = "";
    this.ErrorMessageForPrivateSite = undefined;
    this.functionForModal = "PrivateSite";
    this.settingService.getUserProfileDetails(localStorage.getItem('userId')).subscribe((data) => {
    })
    $('#exampleModal').modal('show');
  }
  continuePrivateSite(event) {
    // if (event.key === "Enter") {
    //   console.log(event);
    // }
    this.saveValidity = false;
    // console.log(this.passwordConfirmation);
    // var credentails = {
    //   username: localStorage.getItem('userMail'),
    //   password: this.passwordConfirmation
    // };
    // this.settingService.userLogin(credentails).subscribe(data => {
    //   var result: any = data;

    //   if (result.result) {
    //     $('#exampleModal').modal('hide');
    //     this.ErrorMessageForPrivateSite = undefined;
    //     this.MakePrivateSite = !this.MakePrivateSite;
    //   }
    //   else {
    //     this.MakePrivateSite = false;
    //     this.ErrorMessageForPrivateSite = result.message;
    //   }
    // },
    //   (error => {
    //     console.log(error);
    //   }))
    $("#exampleModal").modal('hide');
    if(event.target.innerText === "Cancel") {
      this.MakePrivateSite = false;
      return;
    }
    this.MakePrivateSite = !this.MakePrivateSite;
  }
  changeDontShow(event, type) {
    this.chekckType = type;

    this.passwordConfirmation = "";
    this.ErrorMessageForPrivateSite = undefined;
    this.privateSettingsForm.controls['privateForNonSubscribers'].setValue(!(this.privateSettingsForm.controls['privateForNonSubscribers'].value));
    this.functionForModal = "DontShow";
    this.saveValidity = false;
    if (type === "subscriber") {
      this.privateSettingsForm.controls['privateForNonSubscribers'].setValue(!(this.privateSettingsForm.controls['privateForNonSubscribers'].value));
      this.saveValidity = false;
      return;
    } else {
      $('#exampleModal').modal('show');
    }
  }
  automaticSubscription(event, type) {
    this.chekckType = type;
    this.passwordConfirmation = "";
    this.ErrorMessageForPrivateSite = undefined;
    this.saveValidity = false;
    this.AllowAutomaticSub = !this.AllowAutomaticSub
  }
  continueChangeDontShow() {
    this.saveValidity = false;
    var credentails = {
      username: localStorage.getItem('userMail'),
      password: this.passwordConfirmation
    };
    this.settingService.userLogin(credentails).subscribe(data => {
      var result: any = data;
      if (result.result) {
        $('#exampleModal').modal('hide');
        this.ErrorMessageForPrivateSite = undefined;
        if (this.chekckType === "message") {
          this.privateSettingsForm.controls['messagePermission'].setValue(!(this.privateSettingsForm.controls['messagePermission'].value));
        } else {
          this.privateSettingsForm.controls['privateForNonSubscribers'].setValue(!(this.privateSettingsForm.controls['privateForNonSubscribers'].value));
        }

      }
      else {
        this.privateSettingsForm.controls['privateForNonSubscribers'].setValue(false);
        this.privateSettingsForm.controls['messagePermission'].setValue(false);

        this.ErrorMessageForPrivateSite = result.message;
      }
    },
      (error => {
        console.log(error);
      }))
  }
  enableSave() {
    this.saveValidity = false;
  }
  deactivateModal() {
    const initialState = {
      title: "Modal with component"
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.content.alertTitle = "Alert";
    this.bsModalRef.content.content =
      "Are you sure? Do you want to deactivate the account?";
    this.bsModalRef.content.onClose = myData => {
       
      this.settingService
        .deActivateAccount(localStorage.getItem("userId"))
        .subscribe(data => {
           
          this.bsModalRef.hide();
        },
          (error => {
            console.log(error);
          }));
    };
  }
  sendForgotPwdEmail() {
     
    var emailObj = { email: localStorage.getItem("userMail") };
    this.settingService.sendForgotSocialPassowordMail(emailObj).subscribe(res => {
      var result: any = res;
      console.log(res);
      if (res) {
        if (result.result) {
           
          const initialState = {
            title: "Modal with component"
          };
          this.bsModalRef = this.modalService.show(ModalComponent, {
            initialState
          });
          this.bsModalRef.content.alertTitle = "Alert";
          this.bsModalRef.content.isCancel = true;
          this.bsModalRef.content.content =
            "Password sent to your Email. Please check your Email";
          this.bsModalRef.content.onClose = myData => {
            this.bsModalRef.hide();
          };
          // window.alert("Password sent to your Email. Please check your Email");
          // this.cookieService.set('forgotUserEmail',this.forgotPasswordForm.controls['email'].value );
          // this.router.navigate(['/forgot/done']);
        } else {
           
          console.log("error");

        }

      }
    },
      (error => {
        console.log(error);
      }));
  }

  // Make private site admin method
  makePrivateSiteAdmin(id) {
    var notifcation = {
      type: "ADMIN",
      notifyTo: id,
      createdBy: this.userProfile(),
      message: "has made you admin",
      isRead: false,
      subscribeId: localStorage.getItem("userId"),
      isViewed: false,
      privateSite:false,
      createdAt: new Date(),
      updatedAt: new Date(),
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    };
    let adminDetails = {
      userId: id,
      privateSiteDocId: this.privateSiteSettings["_id"]
    };

    // this.sService.sendNotifcation(notifcation);
    // Calls make admin service with admin details
    this.settingService.makePrivateSiteAdmin(adminDetails).subscribe(result => {
      this.sService.sendNotifcation(notifcation);
      this.sService.saveNofication(notifcation);
    });
  }

  // Remove private site admin method
  removePrivateSiteAdmin(id) {
    let adminDetails = {
      userId: id, 
      privateSiteDocId: this.privateSiteSettings["_id"]
    };

    // Calls remove admin service with admin details
    this.settingService.removePrivateSiteAdmin(adminDetails).subscribe(result => {});
  }

  addToAdminsList(id, event) {
    if (event.checked) {
      this.adminsList.push(id);
      this.makePrivateSiteAdmin(id);
    } else {
      this.adminsList.splice(id, 1);
      this.removePrivateSiteAdmin(id);
    }
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
      data.firstName = localStorage.getItem(this.siteName + "_privateSiteName");
      data.lastName = "(Site Admin)";
      data.profilePicture = localStorage.getItem(this.siteName + "_privateSiteLogo");
    }
    return data;
  }

  removeFromSite(id) {
    var subscriptionObj = {
      id: id,
      userid:localStorage.getItem(this.siteName + "_siteUserId"),
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    };
    this.userProfileService.getSubscrptionStatus(subscriptionObj).subscribe(result => {
      let subscriptionObjId ={
        "id": result["data"][0]["_id"]
      }
      this.sService.removeSubscription(subscriptionObjId).subscribe(res => {
        let requestData = {
          requestedBy: id,
          privateSiteId: localStorage.getItem(this.siteName + "_siteUserId"),
        }
        // Removes from messaging subscription
        this.sService.removeMessageSubscription(requestData).subscribe((data) => {
          if (data["result"]) {
            // Remove admin
            this.ngOnInit();
            this.removePrivateSiteAdmin(id);
          }
        }, (error) => {
          console.log(error);
        });
      });
    });
  }

  // Checks if user is in private site
  privateSiteCheck() {
    let httpLink = window.location.pathname.split('/');
    if (localStorage.getItem("privateSite") === "true" && httpLink[1] === "privatesites") { // Checks localStorage and parses current page link
      return true;
    }
    return false;
  }

  addToBlockedFileAccessList(userId, index, event) {
    if (!event.checked) {
      this.blockedFileAccess.push(userId);
    } else {
      this.blockedFileAccess.splice(index, 1);
    }
  }

  addToBlockedFileUploadList(userId, index, event) {
    if (!event.checked) {
      this.blockedUpload.push(userId);
    } else {
      this.blockedUpload.splice(index, 1);
    }
  }

  addToBlockedFileDownloadList(userId, index, event) {
    if (!event.checked) {
      this.blockedDownload.push(userId);
    } else {
      this.blockedDownload.splice(index, 1);
    }
  }

  saveFileSettings(): void {
    console.log(this.blockedFileAccess, this.blockedUpload, this.blockedDownload);
    let requestData = {
      privateSiteId: localStorage.getItem(this.siteName + "_siteUserId"),
      blockedFileAccess: this.blockedFileAccess,
      blockedUpload: this.blockedUpload,
      blockedDownload: this.blockedDownload
    }
    this.fileSharingService.saveFileAccessSettings(requestData).subscribe((response) => {
      if (response["success"]) {
        this.openSnackBar(response["message"]);
        this.ngOnInit();
      } else {
        this.openSnackBar(response["message"]);
      }
    }, (error) => {
      this.openSnackBar("Server side error occurred. Please try again later.");
    });
  } 

  checkPrivateSiteEligibility() {
        let configurations = {}
        configurations = this.sharedService.getConfigurations()
        if (configurations != {}) {
          let private_sites_limit = (configurations["private_sites_limit"]) ? configurations["private_sites_limit"] : 5;
          let private_site_subscriber_limit = (configurations["private_site_subscriber_limit"]) ? configurations["private_site_subscriber_limit"] : 0;

          this.settingService.gePrivateSites(localStorage.getItem("userId")).subscribe((response) => {
                         
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
                  (privasiteEnable) ? this.createPrivateSite = true : this.createPrivateSite = false;
                } else {
                  this.createPrivateSite = false;
                }
              } else {
                this.createPrivateSite = true;
              }
            }
          });
        } else {
          // this.loading = false;
        }
  }

  changePrivateSiteStatus(){

    const initialState = {
      title: "Modal with component"
    };
    this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
    this.bsModalRef.content.alertTitle = "Alert";
      this.bsModalRef.content.content =
      "Are you sure you want to Deactivate this Private Site " + this.siteName +"?" ;
    this.bsModalRef.content.onClose = myData => {
      this.bsModalRef.hide();
		let privateSiteId = localStorage.getItem(this.siteName + "_privateSiteId")
		let data = {privatesiteId : privateSiteId, status : false};
		this._headerservice.changePrivatesiteStatus(data).subscribe(data => {
      // this.SService.isPrivateSite = localStorage.getItem(this.siteName + "_privateSiteId")+"-"+
			this.snackBar.open("Private Site Deactivated",  "OK", {duration : 2000})
			this.router.navigateByUrl('/home/top?location=world')
		}, err => console.log(err)
		)
	  }
}
}
