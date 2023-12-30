import { Component, OnInit } from '@angular/core';
import { HeaderService } from '../header/header.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TrunumuserSubscriptionsService } from './trunumuser-subscriptions.service';
@Component({
  selector: 'app-trunumuser-subscriptions',
  templateUrl: './trunumuser-subscriptions.component.html',
  styleUrls: ['./trunumuser-subscriptions.component.scss']
})
export class TrunumuserSubscriptionsComponent implements OnInit {
  currentTrunumUsersTab = 'trunumusers';
  selectTrunumuser = [];
  inviteemail = '';
  loading = false;
  UsersList: any;
  users = [];
  user = [];
  addinvite = [];
  userErrorMsg;
  emailErrorMsg;
  constructor(
    private bsModalRef: BsModalRef, private tsService: TrunumuserSubscriptionsService) { }
  ngOnInit() {
     
    this.tsService.getUsers().subscribe(data => {
       
      this.UsersList = data;
    },
    (error=>{
      console.log(error);
    }));
  }
  changeCurrentTab(tabName) {
    this.currentTrunumUsersTab = tabName;
    this.selectTrunumuser = [];
    this.addinvite = [];
  }
  removeUserFromSelection(i) {
    this.selectTrunumuser.splice(i, 1);
  }
  textChanged(searchText: String) {
    if (searchText.length > 2) {
      this.users = this.UsersList.filter((item) => {
        return item.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
          item.lastName.toLowerCase().includes(searchText.toLowerCase())
          || (item.firstName.toLowerCase() + ' ' + item.lastName.toLowerCase()).includes(searchText.toLowerCase())
          ;
      });
    }
    else {
      this.users = [];
    }
  }
  selectTrunumsInvite(user) {
    this.userErrorMsg = '';
    var searchText = this.selectTrunumuser.filter((item) => {
      return item._id.includes(user._id);
    });
    if (searchText.length > 0) {
      this.userErrorMsg = 'Already sent an Invite';
      return;
    }
    var UserObj = {
      email: user.email,
      id: localStorage.getItem('userId')
    };
    this.tsService.checkExistingInviteUser(UserObj).subscribe(data => {
      var result: any = data;
      if (result.result) {
        this.selectTrunumuser.push(user);
      }
      else {
        this.userErrorMsg = 'Already sent an Invite';
      }
    },
    (error=>{
      console.log(error);
    }));
  }
  inviteTrunumsModal() {
    var isTrunumsUser;
    var recipients=[];
    var recipientsData = [];
    var userData = {
      firstName : localStorage.getItem('userFirstName'),
      lastName  : localStorage.getItem('userLastName'),
      userName  : localStorage.getItem('userName'),
      userId    : localStorage.getItem('userId'),
    };
    if (this.currentTrunumUsersTab === 'trunumusers') {
      isTrunumsUser = true;
      this.selectTrunumuser.forEach( data=> {
        recipients.push(data.email);
        var Obj={
          firstName:data.firstName,
          lastName:data.lastName
        }
        recipientsData.push(Obj);
      });
    }
    else {
      isTrunumsUser = false;
      recipients=this.addinvite;
    }
    var data={
      isTrunumsUser:isTrunumsUser,
      recipients:recipients,
      recipientsData:recipientsData,
      userData:userData
    }
    this.tsService.sendInvitatios(data).subscribe(docs=>{        
        if(data){
          this.bsModalRef.hide();
        }
    },
    (error=>{
      console.log(error);
    }));
  }
  removeEmailFromSelection(i) {
    this.addinvite.splice(i,1);    
  }
  adduserinvite(inviteemail) {
    this.emailErrorMsg = '';
    var searchText = this.addinvite.filter((item) => {
      return item.includes(inviteemail);
    });
    if (searchText.length > 0) {
      this.emailErrorMsg = 'Already sent an Invite';
      return;
    }
    var UserObj = {
      email: inviteemail,
      id: localStorage.getItem('userId')
    };
    this.tsService.checkExistingInviteUser(UserObj).subscribe(data => {
      var result: any = data;
      if (result.result) {
        this.addinvite.push(inviteemail);
      }
      else {
        this.emailErrorMsg = 'Already sent an Invite';
      }
    },
    (error=>{
      console.log(error);
    }));
  }
  closeTrunumsModal() {
    this.bsModalRef.hide();
  }
}
