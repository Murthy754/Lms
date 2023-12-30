import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../middlewares/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  profilePic: any;
  constructor(
    public router: Router,
    private _authService: AuthService
  ) { }

  ngOnInit(): void {
    this.profilePic = localStorage.getItem("profilePicture");
  }

  logout(): void {
    this._authService.clearAllCookies();
    localStorage.clear();
    this.router.navigateByUrl('/login');
  }

}
