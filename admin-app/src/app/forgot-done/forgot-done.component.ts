import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-forgot-done',
  templateUrl: './forgot-done.component.html',
  styleUrls: ['./forgot-done.component.scss']
})
export class ForgotDoneComponent implements OnInit {

  userEmail="";
  constructor(
    private cookieService: CookieService
  ) { }

  ngOnInit() {
    this.userEmail=this.cookieService.get('forgotUserEmail');
    this.cookieService.delete('forgotUserEmail');
  }

}
