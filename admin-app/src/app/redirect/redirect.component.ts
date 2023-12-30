import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.scss']
})
export class RedirectComponent implements OnInit {

  constructor(
    private _router: Router
  ) { }

  ngOnInit() {
    let userId = localStorage.getItem('userId');
    if (userId) {
      this._router.navigateByUrl('/user-management');
    } else {
      this._router.navigateByUrl('/login');
    }
  }

}
