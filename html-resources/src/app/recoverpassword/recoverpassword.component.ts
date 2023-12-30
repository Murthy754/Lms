import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { RecoverService } from './recover.service';
@Component({
  selector: 'app-recoverpassword',
  templateUrl: './recoverpassword.component.html',
  styleUrls: ['./recoverpassword.component.scss']
})
export class RecoverpasswordComponent implements OnInit {
  recoverPasswordForm: FormGroup;
  matchError='';
  tokenId;
  constructor( private fb: FormBuilder,private rService:RecoverService,
    private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.recoverPasswordForm = this.fb.group({
      password: ['', [Validators.required,Validators.minLength(8)]],  
      confirmPassword: ['', [Validators.required,Validators.minLength(8)]],    
    });
    this.route.params.subscribe(params => {    
        this.tokenId=params['id'];        
   },
   (error=>{
     console.log(error);
   }));
  }
  recover()
  {
    this.matchError='';
    if(this.recoverPasswordForm.invalid) {
      return;
    }
    else{
      if(this.recoverPasswordForm.controls['password'].value!==this.recoverPasswordForm.controls['confirmPassword'].value) {
        this.matchError='Passwords doesn\'t match';
        return;        
      }
      var userObj = {
        password:this.recoverPasswordForm.controls['password'].value,
        tokenId:this.tokenId
      }
      this.rService.sendForgotPassowordMail(userObj).subscribe(res=>{
      this.router.navigateByUrl("/home/top?location=world");        
      }, ((error) => {
        console.log(error);
      }));
    }
  }

}
