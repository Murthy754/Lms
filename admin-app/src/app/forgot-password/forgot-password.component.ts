import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { ForgotService } from '../forgot/forgot.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  emailErr="";
  forgotPasswordForm!: FormGroup;

  constructor(
    private cookieService: CookieService,
    private formBuilder: FormBuilder,
    private router: Router,
    private forogtService:ForgotService
  ) { }

  ngOnInit() {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],    
    });
  }

  sendPassword() {
    this.emailErr="";
    const data = {
      email: this.forgotPasswordForm.controls['email'].value
    }
    if(this.forgotPasswordForm?.invalid) {
      return;  
    }
    else {
      this.forogtService.sendForgotPasswordMail(data).subscribe((response: any)=>{
        if(response) {
          if(response["success"]) {                
            this.cookieService.set('forgotUserEmail',this.forgotPasswordForm.controls['email'].value);
            this.router.navigate(['/forgot/done']);
          } else{
            this.emailErr = response["message"];
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
