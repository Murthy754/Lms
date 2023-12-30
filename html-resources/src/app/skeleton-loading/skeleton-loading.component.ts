import { Component, OnInit ,Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-skeleton-loading',
  templateUrl: './skeleton-loading.component.html',
  styleUrls: ['./skeleton-loading.component.scss']
})
export class SkeletonLoadingComponent implements OnInit {
  @Input() topicsPerPage : number ;
  skltnArr = [] // for count of skltn that are to be displayed
  constructor() { }

  ngOnInit() {
    this.skltnArr = Array(this.topicsPerPage).fill(0); //to display the skeleton loading several times as per topicsPerPage
  }
}
