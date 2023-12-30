import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-sigupheader',
  templateUrl: './sigupheader.component.html',
  styleUrls: ['./sigupheader.component.scss']
})
export class SigupheaderComponent implements OnInit {

  constructor(private router:Router) { }

  ngOnInit() {
  }
  navtohome(){
    this.router.navigateByUrl('/home/top?location=world');
  }
  

}
