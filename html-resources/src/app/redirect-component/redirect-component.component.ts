import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from "ngx-cookie-service";
@Component({
  selector: 'app-redirect-component',
  templateUrl: './redirect-component.component.html',
  styleUrls: ['./redirect-component.component.scss']
})
export class RedirectComponentComponent implements OnInit {

  constructor(
    private router:Router,
    private cookieService: CookieService
  ) { }

  ngOnInit() {
    let link = window.location.pathname.split("/");
      if (link[2] === "privatesites") {
        this.router.navigateByUrl("/privatesites/" + localStorage.getItem(link[3] + "_siteName"));
      }

      if (this.cookieService.get('userHomeTabLocation') && this.cookieService.get('userHomeLocation')) {
        let userHomeTabLocation = this.cookieService.get('userHomeTabLocation');
        let userHomeLocation = this.cookieService.get('userHomeLocation');
        this.router.navigateByUrl("/home/"+ userHomeTabLocation + "?location=" + userHomeLocation);
      } else if (this.cookieService.get('userHomeTabLocation')) {
        let userHomeTabLocation = this.cookieService.get('userHomeTabLocation');
        this.router.navigateByUrl("/home/"+ userHomeTabLocation + "?location=world");
      } else {
        this.router.navigateByUrl("/home/top?location=world");
      }
  }
}
