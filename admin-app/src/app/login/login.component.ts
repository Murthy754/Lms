import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { LoginService } from './login.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  SignInForm: FormGroup;
  loginError = "";

  constructor(
    private loginService: LoginService,
    private formBuilder: FormBuilder,
    private _router: Router,
    private cookieService: CookieService
  ) {
    this.SignInForm = this.formBuilder.group({
      email: ["", [Validators.required]],
      password: ["", Validators.required]
    });
  }

  ngOnInit(): void {
    this.onInit();
  }

  onInit() {

  }

  login() {
    this.loginError = "";
    if (this.SignInForm.invalid) {
      return false;      
    }
    const credentails = {
      userName: this.SignInForm.controls["email"].value,
      password: this.SignInForm.controls["password"].value
    };
    this.loginService.login(credentails).subscribe(response => {
      var result: any = response;
      if (result.success) {
        if (result.result) {
          console.log("Login successful");
          
          localStorage.setItem("userId", result.result._id);
          localStorage.setItem("userName", result.result.userName);
          localStorage.setItem("userMail", result.result.email);
          localStorage.setItem("country", result.result.address.country);
          localStorage.setItem("profilePicture", result.result.profilePicture);
          localStorage.setItem("userFirstName", result.result.firstName);
          localStorage.setItem("userLastName", result.result.lastName);
          localStorage.setItem("loginType", 'normal');
          this._router.navigateByUrl("/user-management");
          this.cookieService.set("x-header-authtoken", result.result.tokens.authToken);
        } else {
          this.loginError = result.message;
        }
      } else {
        this.loginError = result.message;
      }
    });
  }
}
