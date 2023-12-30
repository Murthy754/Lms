import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InviteUserService } from './invite-user.service';

@Component({
  selector: 'app-invite-user',
  templateUrl: './invite-user.component.html',
  styleUrls: ['./invite-user.component.scss']
})
export class InviteUserComponent implements OnInit {
  emails: any = [];
  email = "";
  errorMessage = "";
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  
  constructor(
    private _inviteUserService: InviteUserService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
  }

  add(event: MatChipInputEvent): void {
    this.errorMessage = "";
    const input = event.input;
    const value = event.value;
    const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

    if (value.length === 0) {
      return;
    }

    if (reg.test(value) === false) {
      this.errorMessage = "Please enter valid email address";
      return;
    }
    if ((value || '').trim()) {
      this.emails.push({name: value.trim()});
    }

    if (input) {
      input.value = '';
    }
  }

  remove(index: any): void {
    this.errorMessage = "";
    this.emails.splice(index, 1);
  }

  onInputChange() {
    this.errorMessage = "";
  }
  
  sendInvite() {
    if (this.emails.length === 0) {
      this.errorMessage = "Please add emails to invite";
      return;
    }
    let requestData = {
      emails: this.emails
    };

    this._inviteUserService.sendInvite(requestData).subscribe((response: any) => {
      if (response["success"]) {
        console.log(response);
        this.openSnackBar(response["message"]);
      }
    }, (error) => {
      this.openSnackBar("Server side error occurred");
      console.log(error);
    });
  }

  openSnackBar(message: string): void {
    this.snackBar.open(message, "OK", {
      duration: 4000,
    });
  }
}
