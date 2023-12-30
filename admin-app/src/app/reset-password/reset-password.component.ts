import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { CookieService } from 'ngx-cookie-service';
import { ForgotService } from '../forgot/forgot.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  message = "";
  resetPasswordForm!: FormGroup;
  constructor(
    private cookieService: CookieService,
    private formBuilder: FormBuilder,
    private router: Router,
    private forogtService:ForgotService
  ) { }

  ngOnInit() {
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  resetPassword() {
    this.message="";
    let tokenId = window.location.pathname.split("/")[3];
    const password = this.resetPasswordForm.controls['password'].value;
    const confirmPassword = this.resetPasswordForm.controls['confirmPassword'].value;
    const requestData = {
      password: this.resetPasswordForm.controls['password'].value,
      tokenId: tokenId
    }
    if(this.resetPasswordForm?.invalid) {
      return;  
    } else if (password !== confirmPassword) {
      this.message = "Password's didn't match";
    } else {
        this.forogtService.updatePassword(requestData).subscribe((response: any)=>{
          if(response) {
            if(response["success"]) {
              this.message = response["message"];
            } else{
              this.message = response["message"];
            }
          }
        },
        ((error: any)=>{
          console.log(error);
        }));
    }
  }

  cancel(){
    this.router.navigate(['/']);
  }

}
