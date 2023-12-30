import { Component, OnInit ,EventEmitter} from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { SpecificSubscribersService } from '../specific-subscribers/specific-subscribers.service';
@Component({
  selector: 'app-specific-comments',
  templateUrl: './specific-comments.component.html',
  styleUrls: ['./specific-comments.component.scss']
})
export class SpecificCommentsComponent implements OnInit {
  public event: EventEmitter<any> = new EventEmitter();
  constructor(private sSubscribersService: SpecificSubscribersService, private bsRef: BsModalRef) { }
  tempSubscribersList = [];
  privacySubcribersList=[];
  onClose: any;
  list: any[] = [];
  ngOnInit() {    
    var userObj = {
      id: localStorage.getItem('userId')
    }
    if (this.list.length <= 0) {
      this.sSubscribersService.getSubscribers(userObj).subscribe(data => {
        var SubData: any = data;
        for (let dataobj of SubData) {
          var subobj = {
            userdata: dataobj.subscriber,
            ischecked: false
          }
          this.tempSubscribersList.push(subobj);
          // this.privacySubcribersList.push(subobj)
        }
      },
      (error=>{
        console.log(error);
      }));      

    }
    else
    {
      this.tempSubscribersList=this.list;
      // this.privacySubcribersList=this.list
    }    

  }
  subscribersearch(text){
    // this.privacySubcribersList = this.tempSubscribersList.filter(item => {
    //   return (
    //     item.userdata.firstName.toLowerCase().includes(text.toLowerCase()) ||
    //     item.userdata.lastName.toLowerCase().includes(text.toLowerCase()) ||
    //     (
    //       item.userdata.firstName.toLowerCase() +
    //       " " +
    //       item.userdata.lastName.toLowerCase()
    //     ).includes(text.toLowerCase())
    //   );
    // });
  }
  closePrivacyModal() {
    this.bsRef.hide();
  }
  savePrivacyModal() {
    this.event.emit({ data: 12345 });
  }
  close() {
    this.onClose(this.tempSubscribersList)
  }
  detectChanges1(i) {
    this.tempSubscribersList[i].ischecked = !this.tempSubscribersList[i].ischecked;
    // this.privacySubcribersList[i].ischecked = !this.privacySubcribersList[i].ischecked;
  }
  detectChanges2(i) {
    this.tempSubscribersList[i].ischecked = !this.tempSubscribersList[i].ischecked;
    // this.privacySubcribersList[i].ischecked = !this.privacySubcribersList[i].ischecked;

  }
}
