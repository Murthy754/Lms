import { Constants } from './../../constants';
import { Inject, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FileSharingService } from "../../file-sharing/file-sharing.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import { SignUpService } from 'src/app/sign-up/sign-up.service';

@Component({
  selector: 'app-verified-vote-modal',
  templateUrl: './verified-vote-modal.component.html',
  styleUrls: ['./verified-vote-modal.component.scss']
})
export class VerifiedVoteModalComponent implements OnInit {

  // Global variables
  phoneNumberExists: boolean;
  phone: string = "";
  error: string;
  countryCode: string = "1";
  otp: any = "";
  otpSent: boolean = false;
  public contactForm: FormGroup;
  numberConfirmation: string;
  title: string;
  label: string;
  disableSend: boolean = true;
  siteName: string;
  @ViewChild('ngOtpInput', { static: false}) ngOtpInputRef: any;
    settings = Constants.OTP_MODULE_SETTINGS;
  
  constructor(
    public dialogRef: MatDialogRef<VerifiedVoteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private fileSharingService: FileSharingService,
    private Sservice: SignUpService
  ) {
    if(data['otp']) {
      this.otpSent = true;
    }
    this.contactForm = this.formBuilder.group({
      formControlPhone: ['', Validators.required]
    });
   }

  ngOnInit() {
    let link = window.location.pathname.split("/");
    if (link[1] === "privatesites") {
      this.siteName = link[2];
    }
    this.title = this.data.title;
    this.label = this.data.label;
    this.numberConfirmation = this.data.numberConfirmation;
    if (this.data.attempt === "second") {
      this.disableSend = false;
    }
    if (this.data.phone === "") {
      this.phoneNumberExists = false;
    } else {
      this.phoneNumberExists = true;
      this.phone = this.data.phone;
    }
  }

  ngAfterViewInit() {
    if (this.ngOtpInputRef) {
      this.ngOtpInputRef.setValue(null);
    }
  }

  // Sends OTP to registered mobile number
  sendOtp() {
     
    this.error = "";
    if (this.contactForm.status === "INVALID" && !this.phoneNumberExists) {
      this.contactForm.get('formControlPhone').setErrors(['invalid_cell_phone', true]);
       
      return;
    }
    let number = this.getNumber();
    if (this.phone !== "") {
      number = this.phone;
    }
    this.data.phone = number;
    let id = localStorage.getItem('userId');
    var psDetails = {
      privateSite: false,
      privateSiteId: null
    };
    
    if (this.privateSiteCheck()) {
      psDetails.privateSite = true;
      psDetails.privateSiteId = localStorage.getItem(this.siteName + "_siteUserId");
    }
    this.fileSharingService.sendOtp({ userId: id, number: number, attempt: this.data.attempt, privateSiteDetails: psDetails }).subscribe((data) => {
       
      if (data['result']) {
        this.openSnackBar("OTP sent successfully");
        this.otpSent = true;
        this.otp = "";
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
    if(this.data['otp']) { // if send otp was done in sign up.
      var psDetails = {
        privateSite: false,
        privateSiteId: null
      };
      this.Sservice.sendOtp({ number: this.data['phone'], attempt: "second",privateSiteDetails: psDetails}).subscribe((data) => {
        if(data['result']){
          this.data['otp'] = data['otp']
          console.log(data['otp']);
        }
      })
      return;
    }
     
    this.error = "";
    let id = localStorage.getItem('userId');
    var psDetails = {
      privateSite: false,
      privateSiteId: null
    };
    if (this.privateSiteCheck()) {
      psDetails.privateSite = true;
      psDetails.privateSiteId = localStorage.getItem(this.siteName + "_siteUserId");
    }
    this.fileSharingService.sendOtp({ userId: id, attempt: "second", number: this.phone, privateSiteDetails: psDetails }).subscribe((data) => {
      
      this.openSnackBar("OTP sent successfully");
      this.otpSent = true;
      this.otp = "";
      this.error = "";
      this.ngAfterViewInit();
      this.ngOnInit();
    }, (error) => {
       
      this.error = error.error.message;
    });
  }

  // Gets phone number from form group
  getNumber() {
    return "+" + this.countryCode + this.contactForm.get('formControlPhone').value;
  }

  // To show confirmation
  openSnackBar(message: string) {
    this.snackBar.open(message, "OK", {
      duration: 3000,
    });
  }

  // Gets country code
  countryChange(obj) {
    this.countryCode = obj.dialCode;
  }
  
  // Invokes when Phone number is invalid
  hasError(event: any): void {
    if (!event && this.contactForm.value.formControlPhone !== '') {
      this.contactForm.get('formControlPhone').setErrors(['invalid_cell_phone', true]);
      this.disableSend = true;
    }
  }

   // Submits otp
   verifyOtp() {
     
    this.error = "";
    if (this.otp.length < 6) {
      this.error = "Please enter the OTP";
       
      return;
    }
    if(this.data['otp'] !== undefined) {
      if(this.data['otp'] == this.otp) {
        this.openSnackBar("Verification successful");
        this.dialogRef.close("verified");
      } else {
        this.error = "OTP you entered is incorrect"
      }
      return
    }

    var psDetails = {
      privateSite: false,
      privateSiteId: null
    };
    if (this.privateSiteCheck()) {
      psDetails.privateSite = true;
      psDetails.privateSiteId = localStorage.getItem(this.siteName + "_siteUserId");
    }
    this.fileSharingService.submitOtp({ userId: localStorage.getItem('userId'), phone: this.phone, otp: this.otp, privateSiteDetails: psDetails  }).subscribe((response) => {
       
      if (response['result']) {
        this.openSnackBar("Verification successful");
        this.dialogRef.close("verified");
      } else {
        this.error = response['message'];
      }
    }, (error) => {
      this.error = error.error.message;
       
    });
  }

  onNoClick(){
    this.dialogRef.close();
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
