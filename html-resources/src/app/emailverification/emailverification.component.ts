import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { EmailverificationService } from './emailverification.service';

@Component({
  selector: 'app-emailverification',
  templateUrl: './emailverification.component.html',
  styleUrls: ['./emailverification.component.scss']
})
export class EmailverificationComponent implements OnInit {
  tokenId = '';
  constructor(private route: ActivatedRoute, private router: Router,
    private eService:EmailverificationService) { }

  ngOnInit() {
  }

  navToSignin() {
    this.router.navigateByUrl("home/top?location=world");
  }
}
