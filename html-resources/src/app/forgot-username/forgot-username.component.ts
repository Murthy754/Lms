import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { ForgotService } from './forgot.service';

@Component({
  selector: 'app-forgot-username',
  templateUrl: './forgot-username.component.html',
  styleUrls: ['./forgot-username.component.scss']
})
export class ForgotUsernameComponent implements OnInit {

  forgotUserForm: FormGroup;
  emailErr="";
  constructor(private cookieService: CookieService,private fb: FormBuilder,
     private router: Router,private Fservice:ForgotService) { }

  ngOnInit() {
    this.forgotUserForm = this.fb.group({
      email: ['', [Validators.required,Validators.email]],    
    });
  }
  sendUsername(){
    this.emailErr="";
    var data = {
      email: this.forgotUserForm.controls['email'].value
    }
    if(this.forgotUserForm.invalid)
        return;
    else{
        this.Fservice.sendForgotMail(data).subscribe(res=>{
          var result:any=res;
            if(res)
            {
                if(result.result){                
                  this.cookieService.set('forgotUserEmail',this.forgotUserForm.controls['email'].value );
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
  cancel()
  {
      this.router.navigate(['/']);
  }

}
