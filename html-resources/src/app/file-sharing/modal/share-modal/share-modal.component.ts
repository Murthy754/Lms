import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { forkJoin } from 'rxjs';
import { MessagesService } from 'src/app/messages/messages.service';
import { FileSharingService } from "../../file-sharing.service";

@Component({
  selector: 'app-share-modal',
  templateUrl: './share-modal.component.html',
  styleUrls: ['./share-modal.component.scss']
})
export class ShareModalComponent implements OnInit {

  // Global variables
  peoplesList: any;
  peoplesFiltered: any;
  groupsList: any;
  groupsFiltered: any;
  selectedGroups: any = [];
  selectedPeoples: any = [];
  loginUser;
  siteName = "";

  constructor(
    private fileSharingService: FileSharingService,
    public dialogRef: MatDialogRef<ShareModalComponent>,
    private messageService: MessagesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.onInit();
  }

  onInit() {
    let link = window.location.pathname.split('/');
    if (link[1] === 'privatesites') {
      this.siteName = link[2];
    }
    this.loginUser = localStorage.getItem("userId");
    this.getPeoples();
    this.getGroups();
    // if (this.data.sentToGroups.length > 0) {
      
    // }

    // if (this.data.sentToUsers.length > 0) {

    // }
  }

  // // Get peoples data
  // getPeoples() {
  //   let requestData = {
  //     id: localStorage.getItem('userId'),
  //     privateSiteId: null
  //   };

  //   if (this.privateSiteCheck()) {
  //     requestData.privateSiteId = localStorage.getItem(this.siteName + "_siteUserId");
  //     if (localStorage.getItem("userId") === localStorage.getItem(this.siteName + "_siteOwnerId")) {
  //       requestData.privateSiteId = localStorage.getItem(this.siteName + "_siteOwnerId");
  //     }
  //   }

  //   // this.loading = true;
  //   forkJoin(
  //     this.fileSharingService.getPeoples(requestData, "requestedBy"),
  //     this.fileSharingService.getPeoples(requestData, "requestedTo")
  //   ).subscribe((result) => {
  //     // this.loading = false;
  //     this.peoplesList = [];
  //     Array.prototype.push.apply(result[0], result[1]);
  //     let peoplesList: any = result[0];
      
  //     peoplesList.map(element => {
  //       if (this.privateSiteCheck()) {
  //         if (element.user._id === localStorage.getItem(this.siteName + "_siteOwnerId")) {
  //           if (element["user"]["_id"] === localStorage.getItem(this.siteName + '_siteOwnerId')) {
  //             element["user"]["firstName"] = localStorage.getItem(this.siteName + '_privateSiteName');
  //             element["user"]["lastName"] = "(Site Admin)";
  //             element["user"]["profilePicture"] = localStorage.getItem(this.siteName + '_privateSiteLogo');
  //           }
  //         }
  //       }
  //       this.peoplesList.push(element.user);
  //     });
  //   });
  // }

  getPeoples() {
    let requestData = {
      id: localStorage.getItem('userId'),
      privateSiteId: null
    };

    if (this.privateSiteCheck()) {
      if (localStorage.getItem('userId') === localStorage.getItem(this.siteName + "_siteOwnerId")) {
        requestData.id = localStorage.getItem(this.siteName + "_siteUserId");
      }
      requestData.privateSiteId = localStorage.getItem(this.siteName + "_siteUserId");
    }
    forkJoin(
      // this.fileSharingService.getPeoples(requestData, "requestedBy"),
      // this.fileSharingService.getPeoples(requestData, "requestedTo")
      this.messageService.getMessageUsers(requestData),
      this.messageService.getMessageUsersBy(requestData)
    ).subscribe((result) => {
      this.peoplesList = [];
      Array.prototype.push.apply(result[0], result[1]);
      let peoplesList: any = result[0];
      peoplesList.map(element => {
        if (this.privateSiteCheck()) {
          if (element.user._id === localStorage.getItem(this.siteName + "_siteOwnerId")) {
            if (element["user"]["_id"] === localStorage.getItem(this.siteName + '_siteOwnerId')) {
              element["user"]["firstName"] = localStorage.getItem(this.siteName + '_privateSiteName');
              element["user"]["lastName"] = "(Site Admin)";
              element["user"]["profilePicture"] = localStorage.getItem(this.siteName + '_privateSiteLogo');
            }
          }
        }
        this.peoplesList.push(element.user);
      });
    });
  }

  // Get groups data
  // getGroups() {
  //   let requestData = {
  //     id: localStorage.getItem('userId')
  //   };
  //   // this.loading = true;
  //   this.fileSharingService.getGroups(requestData).subscribe((result) => {
  //     // this.loading = false;
  //     this.groupsList = result;
  //   });
  // }

  // Gets groups
  getGroups() {

    if (this.privateSiteCheck()) {
      let id = this.loginUser;
      if (localStorage.getItem('userId') === localStorage.getItem(this.siteName + "_siteOwnerId")) {
        id = localStorage.getItem(this.siteName + "_siteUserId");
      }
      this.messageService.getMyPrivateGroups(id, localStorage.getItem(this.siteName + '_siteUserId')).subscribe(data => {
        this.groupsList = data;
      });
    } else {
      this.messageService.getMyGroups(this.loginUser, localStorage.getItem(this.siteName + '_siteUserId')).subscribe(data => {
        var result = [];
        this.groupsList = [];
        result = Object.assign([], data);
        result.forEach(element => {
          if (element.privateSiteId === null) {
            this.groupsList.push(element)
          } else {
            return;
          }
        });
      });
    }
  }

  // On search method
  onSearch(searchValue) {
    this.groupsFiltered = [];
    this.peoplesFiltered = [];
    if (searchValue.length === 0) {
      return;
    } else {
      if (this.groupsList && this.groupsList.length > 0) {
        this.groupsFiltered = this.groupsList.filter(group => {
          return (
            group.groupName.toLowerCase().includes(searchValue.toLowerCase())
          );
        });
      }

      if (this.peoplesList && this.peoplesList.length > 0) {
        this.peoplesFiltered = this.peoplesList.filter(people => {
          return (
            people.firstName.toLowerCase().includes(searchValue.toLowerCase()) ||
            people.lastName.toLowerCase().includes(searchValue.toLowerCase()) ||
            (
              people.firstName.toLowerCase() +
              " " +
              people.lastName.toLowerCase()
            ).includes(searchValue.toLowerCase())
          );
        });
      }
    }
  }

  onNoClick(): void {
    this.dialogRef.close({ result: false });
  }

  addToShare(data, type): void {
    if (type === "group") {
      if (this.selectedGroups.length > 0) {
        let isExist = this.selectedGroups.some(group => group._id === data._id);
        if (!isExist) {
          this.selectedGroups.push(data);
        }
      } else {
        this.selectedGroups.push(data);
      }
    } else {
      if (this.selectedPeoples.length > 0) {
        let isExist = this.selectedPeoples.some(people => people._id === data._id);
        if (!isExist) {
          this.selectedPeoples.push(data);
        }
      } else {
        this.selectedPeoples.push(data);
      }
    }
  }

  removeSelectedItem(index, type): void {
    if (type === "group") {
      this.selectedGroups.splice(index, 1);
    } else {
      this.selectedPeoples.splice(index, 1);
    }
  }

  onShareClick(): void {
    this.dialogRef.close({
      result: true,
      data: {
      peoples: this.selectedPeoples,
      groups: this.selectedGroups
    }});
  }

  // Checks if user is in private site
  privateSiteCheck() {
    let httpLink = window.location.pathname.split('/');
    if (localStorage.getItem("privateSite") === "true" && httpLink[1] === "privatesites") { // Checks localStorage and parses current page link
      return true;
    }
    return false;
  }
}
