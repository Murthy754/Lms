import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { ForgotService } from '../forgot-username/forgot.service';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  emailErr="";
  forgotPasswordForm: FormGroup;
  constructor(private cookieService: CookieService,private fb: FormBuilder,
    private router: Router,private forogtService:ForgotService) { }

  ngOnInit() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required,Validators.email]],    
    });
  }
  sendPassword()
  {
    this.emailErr="";
    var data = {
      email: this.forgotPasswordForm.controls['email'].value
    }
    if(this.forgotPasswordForm.invalid)
        return;  
    else{
        this.forogtService.sendForgotPassowordMail(data).subscribe(res=>{
          var result:any=res;

            if(res)
            {
                if(result.result){                
                  this.cookieService.set('forgotUserEmail',this.forgotPasswordForm.controls['email'].value );
                  this.router.navigate(['/forgot/done']);
                }
                else{
                  this.emailErr="Entered Email Address Doesn't Exists."
                }
            }
        },
        (error=>{
          console.log(error);
        }));
    }
  }
  cancel(){
    this.router.navigate(['/']);
  }
}
