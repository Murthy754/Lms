import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { CookieService } from "ngx-cookie-service";
import { Router, Data } from "@angular/router";
import { SignUpService } from "../sign-up/sign-up.service";
import { SocialsignupService } from "./socialsignup.service";
import { forkJoin } from "rxjs";
import { DOCUMENT } from '@angular/common';
import { VerifiedVoteModalComponent } from "../pollinfo/verified-vote-modal/verified-vote-modal.component";
import { MatDialog, MatSnackBar } from "@angular/material";

@Component({
  selector: "app-social-signup",
  templateUrl: "./social-signup.component.html",
  styleUrls: ["./social-signup.component.scss"]
})
export class SocialSignupComponent implements OnInit {
  SocialSignUpForm: FormGroup;
  Ccode;
  country;
  loading = true;
  userExists;
  isPrivateSite="No";
  phoneNumberExist: boolean = false; 
  countries: [
    {
      name: "INDIAA";
      code: "INDIA";
    }
  ];
  mobileNumberIsVerified: Boolean = false;
  countryCode;
  disableSend: boolean = true;
  enteringPhoneNumber: Boolean = false;
  phoneNumberVerified: Boolean = false

  constructor(
    private fb: FormBuilder,
    private cookieService: CookieService,
    private router: Router,
    private sSService: SocialsignupService,
    private Sservice: SignUpService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
     
    this.getData();
    
    this.SocialSignUpForm = this.fb.group({
      email: [
        this.cookieService.get("socialUserMail"),
        [Validators.required, Validators.email]
      ],
      username: [
        this.cookieService
          .get("socialUserName")
          .replace(/\s/g, "")
          .toLowerCase(),
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(35),
          Validators.pattern("^[A-Za-z0-9_]*$")
        ]
      ],
      first_name: [
        this.cookieService
          .get("socialUserName")
          .substr(0, this.cookieService.get("socialUserName").indexOf(" ")),
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(35),
          Validators.pattern("^[a-zA-Z]*$")
        ]
      ],
      last_name: [
        this.cookieService.get("socialUserName").split(" ")[1],
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(35),
          Validators.pattern("^[a-zA-Z]*$")
        ]
      ],
      phoneNumber: [''],
      gender: ["", Validators.required]
    });
  }
  getData() {
    return forkJoin(
      this.sSService.getJSON(),
      this.sSService.getCurrentIpLocation()
    ).subscribe(data => {
      this.countries = data[0];
      var res = data[1];
      this.Ccode = res;
       
      const CountryObj: any = this.countries.filter(
        item => item.code.search(this.Ccode.iso_code) !== -1
      );
      this.country = CountryObj[0];
       
    },
    (error=>{
      console.log(error);
    }));
  }
  signupCancel(){
    if(!this.router.url.includes('/home'))
      this.router.navigateByUrl("/home/top?location=world");
    }
  signup() {
    if (this.SocialSignUpForm.invalid) return;
    this.userExists = "";
    if(this.SocialSignUpForm.get('phoneNumber').value !== "" && !this.phoneNumberVerified) {
      this.SocialSignUpForm.get('phoneNumber').setErrors(['invalid_cell_phone', true]);
      return
    }
    var createUserObj = {
      id: this.cookieService.get("socialId"),
      provider: this.cookieService.get("socialProvider"),
      accessToken: this.cookieService.get("socialToken"),
      email: this.SocialSignUpForm.controls["email"].value,
      username: this.SocialSignUpForm.controls["username"].value,
      first_name: this.SocialSignUpForm.controls["first_name"].value,
      last_name: this.SocialSignUpForm.controls["last_name"].value,
      gender: this.SocialSignUpForm.controls["gender"].value,
      address: { country: this.country.name },
      profilePicture: this.cookieService.get("socialUserProfilePic"),
      type: "login",
      phone: this.SocialSignUpForm.controls['phoneNumber'].value
    };
    if(this.phoneNumberVerified) {
      createUserObj['phoneVerified'] = true; 
    }
    this.sSService.createSocialUser(createUserObj).subscribe(data => {
      var result: any = data;
      if (result.result) {
        localStorage.setItem("userId", result.user._id);
        localStorage.setItem("userName", result.user.userName);
        localStorage.setItem("country", result.user.address.country);
        localStorage.setItem("userFirstName", result.user.firstName);
        localStorage.setItem("userLastName", result.user.lastName);
        localStorage.setItem("userMail", result.user.email);
        localStorage.setItem("profilePicture", result.user.profilePicture);
        if(result.user.eligibleForUserBenefits) {
          localStorage.setItem("eligibleForUserBenefits", result.user.eligibleForUserBenefits);
        }
        if (this.cookieService.get('privateSiteLink')) {
          this.router.navigateByUrl(this.cookieService.get('privateSiteLink'));
          this.cookieService.delete('privateSiteLink');
        } else {
          this.router.navigateByUrl("/home/top?location=world");
        }
      } else {
        this.userExists = result.message;
      }
    },
    (error=>{
      console.log(error);
    }));
  }

      // Gets country code
      countryChange(obj) {
        this.countryCode = obj.dialCode;
      }
      
      // Invokes when Phone number is invalid
      hasError(event: any): void {
        if (!event && this.SocialSignUpForm.value.phoneNumber !== '') {
          this.SocialSignUpForm.get('phoneNumber').setErrors(['invalid_cell_phone', true]);
          this.disableSend = true;
        }
      }
  
      phonenumberChange() {
        if(this.SocialSignUpForm.value.phoneNumber == ''){
          this.enteringPhoneNumber = false
          return
        }
        this.enteringPhoneNumber = true;
      }
      
    // Sends OTP to registered mobile number
    sendOtp() {
      let dialogRef    
      if (this.SocialSignUpForm.get('phoneNumber').status === "INVALID") {
        this.SocialSignUpForm.get('phoneNumber').setErrors(['invalid_cell_phone', true]);
        return;
      }
      let number = this.getNumber();
      var psDetails = {
        privateSite: false,
        privateSiteId: null
      };
      
      this.Sservice.sendOtp({ number: number, attempt: "first",privateSiteDetails: psDetails}).subscribe((data) => {
        if (data['result']) {
          this.phoneNumberExist = false 
           dialogRef = this.dialog.open(VerifiedVoteModalComponent, {
            width: '400px',
            data: {
              'phone': data['phone'],
              'title': "Add Your Number",
              'label': '',
              'attempt': 'first',
              'otp': data['otp']
            }
          })
  
          dialogRef.afterClosed().subscribe(result => {
            if (result === "verified") {
              this.phoneNumberVerified = true;
              this.SocialSignUpForm.get('phoneNumber').setErrors(null)
            } else {
              this.phoneNumberVerified = false;
            }
          });
          
        } else {
          this.phoneNumberExist = true
  
        }
      }, (error) => {
        this.phoneNumberExist = true;
  
      });
    }
  
    removeNumber() {
      this.SocialSignUpForm.get('phoneNumber').enable()
      this.SocialSignUpForm.get('phoneNumber').setValue('');
      this.phoneNumberVerified = false;
      this.SocialSignUpForm.get('phoneNumber').setErrors(null)
    }
  
    getNumber() {
      return "+" + this.countryCode + this.SocialSignUpForm.get('phoneNumber').value;
    }
    openSnackBar(message: string) {
      this.snackBar.open(message, "OK", {
        duration: 3000,
      });
    }

}
