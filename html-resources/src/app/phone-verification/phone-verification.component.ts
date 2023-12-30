import { Component, OnInit, ViewChild } from '@angular/core';
import { FileSharingService } from "../file-sharing/file-sharing.service";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from "@angular/router";
import {Constants} from "../constants"

@Component({
  selector: 'app-phone-verification',
  templateUrl: './phone-verification.component.html',
  styleUrls: ['./phone-verification.component.scss']
})
export class PhoneVerificationComponent implements OnInit {

  public contactForm: FormGroup;
  phone: Boolean = false;
  phoneNumber: string = "";
  verificationSent: Boolean = false;
  verificationPending: boolean = false;
  countryCode: string = "1";
  error: string;
  otp: any = "";
  siteName: string;
  @ViewChild('ngOtpInput', { static: false}) ngOtpInputRef: any;
  settings = Constants.OTP_MODULE_SETTINGS;

  constructor(
    private fileSharingService: FileSharingService,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private router: Router) {
    this.contactForm = this.formBuilder.group({
      formControlPhone: ['', Validators.required]
    });
   }

  ngOnInit() {
     
    let link = window.location.pathname.split("/");
    if (link[1] === "privatesites") {
      this.siteName = link[2];
    }
    this.fileSharingService.getUserProfileDetails(localStorage.getItem('userId')).subscribe((userDetails) => {
      let user = userDetails[0];
      if (this.privateSiteCheck()) {
        if (user.verifiedNumbersList) {
          if (user.verifiedNumbersList.length > 0) {
            user.verifiedNumbersList.forEach(numberData => {
              if (numberData) {
                if (localStorage.getItem(this.siteName + "_siteUserId") === numberData["privateSiteId"]) {
                  this.phone = true;
                  this.phoneNumber = numberData["phone"];
                  if (numberData['phoneVerified']) {
                    this.verificationSent = true;
                    this.verificationPending = true;
                  } else {
                    this.verificationSent = false;
                  }
                }
              }
            });
          }
        } 
      } else {
        if (user) {
          if (user["phone"] !== null) {
            this.phone = true;
            this.phoneNumber = user["phone"];
            if (user['phoneVerified']) {
              this.verificationSent = true;
              this.verificationPending = true;
            } else {
              this.verificationSent = false;
            }
          }
        }
      }
       
    });
  }

  ngAfterViewInit() {
    if (this.ngOtpInputRef) {
      this.ngOtpInputRef.setValue(null);
    }
  }
  
  // Gets phone number from form group
  getNumber() {
    return "+" + this.countryCode + this.contactForm.get('formControlPhone').value;
  }

  // Sends OTP to registered mobile number
  sendOtp() {
     
    this.error = "";
    if (this.contactForm.status === "INVALID") {
      this.contactForm.get('formControlPhone').setErrors(['invalid_cell_phone', true]);
       
      return;
    }
    let number = this.getNumber();
    if (this.phoneNumber !== "") {
      number = this.phoneNumber;
    }

    var psDetails = {
      privateSite: false,
      privateSiteId: null
    };
    
    if (this.privateSiteCheck()) {
      psDetails.privateSite = true;
      psDetails.privateSiteId = localStorage.getItem(this.siteName + "_siteUserId");
    }
    this.fileSharingService.sendOtp({ userId: localStorage.getItem('userId'), number: number, attempt: "first", privateSiteDetails: psDetails }).subscribe((data) => {
       
      if (data['result']) {
        this.openSnackBar("OTP sent successfully");
        this.ngAfterViewInit();
        this.ngOnInit();
      } else {
        this.error = data['error'];
      }
    }, (error) => {
       
      this.error = error.error.message;
    });
  }

  // Resends OTP to registered mobile number
  resendOTP() {
     
    this.error = "";
    var psDetails = {
      privateSite: false,
      privateSiteId: null
    };
    if (this.privateSiteCheck()) {
      psDetails.privateSite = true;
      psDetails.privateSiteId = localStorage.getItem(this.siteName + "_siteUserId");
    }
    this.fileSharingService.sendOtp({ userId: localStorage.getItem('userId'), attempt: "second", number: this.phoneNumber, privateSiteDetails: psDetails }).subscribe((data) => {
       
      this.openSnackBar("OTP sent successfully");
      this.otp = "";
      this.error = "";
      this.ngAfterViewInit();
      this.ngOnInit();
    }, (error) => {
       
      this.error = error.error.message;
    });
  }

  // To show confirmation
  openSnackBar(message: string) {
    this.snackBar.open(message, "OK", {
      duration: 3000,
    });
  }

  // Submits otp
  verifyOtp() {
     
    if (this.otp.length === 6) {
      var psDetails = {
        privateSite: false,
        privateSiteId: null
      };
      if (this.privateSiteCheck()) {
        psDetails.privateSite = true;
        psDetails.privateSiteId = localStorage.getItem(this.siteName + "_siteUserId");
      }
      this.fileSharingService.submitOtp({ userId: localStorage.getItem('userId'), phone: this.phoneNumber, otp: this.otp, privateSiteDetails: psDetails }).subscribe((response) => {
        if (response['result']) {
          this.ngOnInit();
        } else {
           
          this.error = response['message'];
        }
      });
    } else {
       
      this.error = "Please enter otp";
      return;
    }
  }

  // Invokes when Phone number is invalid
  hasError(event: any): void {
    if (!event && this.contactForm.value.formControlPhone !== '') {
      this.contactForm.get('formControlPhone').setErrors(['invalid_cell_phone', true]);
    }
  }

  // Gets country code
  countryChange(obj) {
    this.countryCode = obj.dialCode;
  }

  navToCreateTopic() {
    if (this.privateSiteCheck()) {
      let link = window.location.pathname.split("/");
      if (link[1] === "privatesites") {
        this.siteName = link[2];
      }
      this.router.navigateByUrl('/privatesites/' + this.siteName + "/topic/new/start");
    } else {
      this.router.navigateByUrl('/topic/new/start');      
    }
  }

  // OTP change event
  onOtpChange(event) {
    if(event == -2) {
      this.resendOTP();
    }
    this.otp = event;
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
