import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SignUpService } from './sign-up.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { VerifiedVoteModalComponent } from '../pollinfo/verified-vote-modal/verified-vote-modal.component';
import { MatSnackBar } from '@angular/material';
@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  SignUpForm: FormGroup;
  Ccode;
  country;
  loading = true;
  userExists;
  userNames: Array<string>
  phone
  phoneNumberExist: boolean = false; 
  countries: [
    {
      name: 'INDIAA',
      code: 'INDIA'
    }
  ];
  mobileNumberIsVerified: Boolean = false;
  countryCode;
  disableSend: boolean = true;
  enteringPhoneNumber: Boolean = false;
  phoneNumberVerified: Boolean = false
  mycountry;
  constructor(private fb: FormBuilder, private Sservice: SignUpService,
    private cookieService: CookieService, private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
        ) {
  }
  signupCancel(){
    if(!this.router.url.includes('/home/'))
    this.router.navigateByUrl("/home/top?location=world");    
  }
  signup() {  
    if(this.SignUpForm.invalid){
      this.SignUpForm.markAllAsTouched();
      return;
    }
    if(this.SignUpForm.get('phoneNumber').value !== "" && !this.phoneNumberVerified) {
      this.SignUpForm.get('phoneNumber').setErrors(['invalid_cell_phone', true]);
      return
    }
              
    this.userExists="";
    var createUserObj = {
      email: this.SignUpForm.controls['email'].value,
      username: this.SignUpForm.controls['username'].value,
      password: this.SignUpForm.controls['password'].value,
      first_name: this.SignUpForm.controls['first_name'].value,
      last_name: this.SignUpForm.controls['last_name'].value,
      gender: this.SignUpForm.controls['gender'].value,
      address: {country:this.country.name},
      webUrl:'localhost:4200',
      toMail:this.SignUpForm.controls['email'].value,
      imgUrl:"../../assets/images/Overlay_Logo.png",
      phone: this.SignUpForm.controls['phoneNumber'].value
    }
    if(this.phoneNumberVerified) {
      createUserObj['phoneVerified'] = true; 
    }
    this.Sservice.createUser(createUserObj).subscribe(res=>{
      const mres:any=res;
       
        if(mres)
        {
            if(!mres.result){
              this.userExists=mres.message;
            }            
        }
        if(mres.result)
        {

          this.router.navigate(['/signup/complete']);
        }
    },
    (error=>{
      console.log(error);
    }));   
  }
  ngOnInit() {
      this.Sservice.getUserNames().subscribe((result: Array<string>) => {
        this.userNames = result;
      }, error => {
        console.log(error);
      })
    this.SignUpForm = this.fb.group({
      email: [this.cookieService.get('userEmail'), [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(35), Validators.pattern('^[A-Za-z0-9_]*$')]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      first_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(35), Validators.pattern('^[a-zA-Z]*$')]],
      last_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(35), Validators.pattern('^[a-zA-Z]*$')]],
      phoneNumber: [''],
      selected_city: [this.country, Validators.required],
      gender: ['', Validators.required]
    });
     
    forkJoin(this.Sservice.getJSON(), this.Sservice.getCurrentIpLocation()).subscribe(data => {
      this.countries = data[0];
      var res=data[1];
      this.Ccode = res;
      const CountryObj: any = this.countries.filter(item => item.code.search(this.Ccode.iso_code) !== -1);
      this.country = CountryObj[0];
      this.SignUpForm.controls['selected_city'].setValue(this.country);
       
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
      if (!event && this.SignUpForm.value.phoneNumber !== '') {
        this.SignUpForm.get('phoneNumber').setErrors(['invalid_cell_phone', true]);
        this.disableSend = true;
      }
    }

    phonenumberChange() {
      if(this.SignUpForm.value.phoneNumber == ''){
        this.enteringPhoneNumber = false
        return
      }
      this.enteringPhoneNumber = true;
    }
    
  // Sends OTP to registered mobile number
  sendOtp() {
    let dialogRef    
    if (this.SignUpForm.get('phoneNumber').status === "INVALID") {
      this.SignUpForm.get('phoneNumber').setErrors(['invalid_cell_phone', true]);
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
            this.SignUpForm.get('phoneNumber').setErrors(null)
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
    this.SignUpForm.get('phoneNumber').enable()
    this.SignUpForm.get('phoneNumber').setValue('');
    this.phoneNumberVerified = false;
    this.SignUpForm.get('phoneNumber').setErrors(null)
  }

  getNumber() {
    return "+" + this.countryCode + this.SignUpForm.get('phoneNumber').value;
  }
  openSnackBar(message: string) {
    this.snackBar.open(message, "OK", {
      duration: 3000,
    });
  }
}
