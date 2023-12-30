import { AfterViewInit, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'google-ad',
  templateUrl: './google-ad.component.html',
  styleUrls: ['./google-ad.component.scss']
})
export class GoogleAdComponent implements OnInit, AfterViewInit {

  @Input() adType: any;

  constructor() { }

  ngAfterViewInit() {
    setTimeout(()=>{
     try {
      (window['adsbygoogle'] = window['adsbygoogle'] || []).push({});
     } catch (e) {}
    }, 500);
   }

  ngOnInit() { }
}
