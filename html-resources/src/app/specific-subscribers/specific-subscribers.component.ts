import { Component, OnInit, EventEmitter } from '@angular/core';
import { SpecificSubscribersService } from './specific-subscribers.service';
import { UserprofileService } from '../userprofile/userprofile.service';
import { BsModalRef } from 'ngx-bootstrap';
import { forkJoin } from 'rxjs';
import { SubscribersService }  from '../subscribers/subscribers.service';
@Component({
  selector: 'app-specific-subscribers',
  templateUrl: './specific-subscribers.component.html',
  styleUrls: ['./specific-subscribers.component.scss']
})
export class SpecificSubscribersComponent implements OnInit {
  constructor(private sSubscribersService: SpecificSubscribersService, private bsRef: BsModalRef, private userProfileService: UserprofileService, private subscribersService: SubscribersService) { }
  tempSubscribersList = [];
  privacySubcribersList = [];
  onClose: any;
  list: any[] = [];
  siteName: string;
  ngOnInit() {
    let link = window.location.pathname.split('/');
    if (link[1] === "privatesites") {
      this.siteName = link[2];
    }
    var userObj = {
      id: localStorage.getItem('userId'),
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    }

    if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
      userObj.id = localStorage.getItem(this.siteName + '_privateSiteUserId');
    }
    if (this.list.length <= 0) {
      this.tempSubscribersList = [];

      return forkJoin(
        this.subscribersService.getAllVirtualSubscribers(userObj),
        this.sSubscribersService.getSubscribers(userObj)
      ).subscribe(data => {
        var SubData: any = data[0];
        var ownerData: any = data[1];
        for (let dataobj of SubData) {
          var subobj = {
            userdata: dataobj.subscriber,
            ischecked: false
          }
          this.tempSubscribersList.push(subobj);
        }
        
        for (let dataobj of ownerData) {
          var subobj = {
            userdata: dataobj.subscriber,
            ischecked: false
          }
          this.tempSubscribersList.push(subobj);
        }
      });
    }
    else {
      this.tempSubscribersList = this.list;

    }
  }
  closePrivacyModal() {
    this.bsRef.hide();
  }
  close() {
    this.onClose(this.tempSubscribersList)
  }
  detectChanges1(i) {
    this.tempSubscribersList[i].ischecked = !this.tempSubscribersList[i].ischecked;
  }
  detectChanges2(i) {
    this.tempSubscribersList[i].ischecked = !this.tempSubscribersList[i].ischecked;
  }
  subscribersearch(text) {

  }
}
