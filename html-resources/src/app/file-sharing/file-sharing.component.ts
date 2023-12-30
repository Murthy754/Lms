import { Constants } from './../constants';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { FileSharingService } from './file-sharing.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UploadService } from "../shared-services/upload.service";
import { MatDialog } from '@angular/material';
import { CreateNewFolderComponent } from './modal/new-folder/create-new-folder/create-new-folder.component';
import { RenameModalComponent } from './modal/rename-modal/rename-modal.component';
import { StorageWarningComponent } from './modal/storage-warning/storage-warning.component';
import { ShareModalComponent } from './modal/share-modal/share-modal.component';
import { MessagesService } from "../messages/messages.service";
import * as moment from "moment";
import * as _ from "lodash";
import { MoveFolderModalComponent } from './modal/move-folder-modal/move-folder-modal.component';
import { ShareDataModalComponent } from "./modal/share-data-modal/share-data-modal.component";
import { NgZone } from '@angular/core';
import { FilePreviewComponent } from './preview/file-preview/file-preview.component';
import { SharedService } from '../shared-services/shared.service';

export interface File {
  name: string;
  owner: string;
  id: string;
  time: string;
  size: string;
}

@Component({
  selector: 'app-file-sharing',
  templateUrl: './file-sharing.component.html',
  styleUrls: ['./file-sharing.component.scss']
})

export class FileSharingComponent implements OnInit {

  // Global variables
  public contactForm: FormGroup;
  folderData;
  loading: boolean = false;
  peoplesList: any;
  groupsList: any;
  loginUser;
  selectedUserId: any;
  selectedUserName: any;
  files = [];
  folders = [];
  phone: Boolean = false;
  verificationSent: Boolean = false;
  countryCode: any = "1";
  error: string;
  otp: string = "";
  phoneNumber: string = "";
  selectedTab = 0;
  Header: string = "My Files";
  verificationPending: boolean = false;
  messagesFolder: File;
  folderType: string = "default";
  folder: string;
  authorized: boolean = false;
  userId;
  storageLimit: number = 20000; // Size in Megabyte
  storageUsed: number = 0; // Size in Megabyte
  percentageUsed: number = 0;
  storageLimitExceeded: boolean = false;
  selectedGroupId: any;
  isPrivateSite: boolean = false;
  siteName;
  isOwner: boolean = false;
  root: boolean = true;
  rootId;
  previousHeader;
  folderSelected: boolean = false;
  selectedFolder;
  canUpload: boolean = true;
  canDownload: boolean = true;
  selectedUser;
  selected: boolean = false;
  selectedId: String = "";
  dragover: Boolean = false;
  enterTarget;
  uploading: Boolean = false;
  totalItems = 0;
  messageMobile: any;
  selectedType = null;
  leftMenu = "groups";
  showMenu: Boolean = true;
  data;
  type;
  configurations;
  @ViewChild('ngOtpInput', { static: false}) ngOtpInputRef: any;
  @ViewChild('closeModal', { static: false }) closeButton: ElementRef;
  settings = Constants.OTP_MODULE_SETTINGS;

  constructor(
    private fileSharingService: FileSharingService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private uploadService: UploadService,
    public dialog: MatDialog,
    private messageService: MessagesService,
    private ngZone: NgZone,
    private router: Router,
    private sharedService: SharedService
  ) {
    this.contactForm = this.formBuilder.group({
      formControlPhone: ['', Validators.required]
    });

      this.configurations = this.sharedService.getConfigurations();
      if (this.configurations && this.configurations !== {}) {
        this.storageLimit = parseInt(this.configurations["main_site_storage"] + "000");
      }

      if (this.privateSiteCheck()) {
        this.storageLimit = parseInt(this.configurations["private_site_storage"] + "000");
      } else {
          if (this.privateSiteCheck()) {
            this.storageLimit = 50000;
          }
        }
      if (localStorage.getItem('eligibleForUserBenefits')) {
        this.storageLimit = 500000
      }
      }

  ngOnInit() {
    this.oninit();
  }

  ngAfterViewInit() {
    // Removes otp from input field
    if (this.ngOtpInputRef) {
      this.ngOtpInputRef.setValue(null);
    }
  }
  goToHomeScreen() {
    this.selectedType = null;
    this.showMenu = true;
  }
  // Oninit
  oninit() {
    let link = window.location.pathname.split('/');
    if (link[1] === 'privatesites') {
      this.siteName = link[2];
    }
    this.loginUser = localStorage.getItem('userId');
    this.getStorageUsed(); // Gets total storage used by logged in user
    if (this.privateSiteCheck()) {
      this.isPrivateSite = true;
      // if (localStorage.getItem(this.siteName + "_privateSiteUserId")) {
      //   this.loginUser = localStorage.getItem(this.siteName + "_privateSiteUserId");
      // }

      if (localStorage.getItem("userId") === localStorage.getItem(this.siteName + '_siteOwnerId')) {
        this.isOwner = true;
      }
      this.fileSharingService.getFilePermissions(localStorage.getItem(this.siteName + "_siteUserId"), this.isOwner).subscribe((response) => {
        if (response["success"]) {
          if (response["doc"] && response["doc"].length > 0) {
            let blocked = response["doc"][0]["blocked"];
            // Checking upload permission
            if (blocked && blocked["upload"] && blocked["upload"].length > 0) {
              if (blocked["upload"].includes(localStorage.getItem("userId")))  {
                this.canUpload = false;
              } else {
                this.canUpload = true;
              }
            } else {
              this.canUpload = true;
            }

            // Checking download permission
            if (blocked && blocked["download"] && blocked["download"].length > 0) {
              if (blocked["download"].includes(localStorage.getItem("userId")))  {
                this.canDownload = false;
              } else {
                this.canDownload = true;
              }
            } else {
              this.canDownload = true;
            }
          }
        }
      }, (error) => {
        console.log(error);
        this.openSnackBar("Server side error occurred");
      });
    }
    // Checks if user is phone verified or not
    this.fileSharingService.getUserProfileDetails(this.loginUser).subscribe((userDetails) => {
      let user = userDetails[0];
      if (this.privateSiteCheck()) {
        if (user.verifiedNumbersList.length > 0) {
          var numberExists = false;
          for (let i=0; i < user.verifiedNumbersList.length; i++) {
            if ((localStorage.getItem(this.siteName + "_siteUserId") === user.verifiedNumbersList[i]["privateSiteId"]) && user.verifiedNumbersList[i]["phoneVerified"]) {
              if (user.verifiedNumbersList[i]["phoneVerified"]) {
                numberExists = true;
                this.authorized = true;
                return;
              }
            }
          }
          if (numberExists) {
            this.authorized = true;
            return;
          }
        } else {
          this.authorized = false;
        }
      } else {
        if (user) {
          if (user["phoneVerified"]) {
            this.authorized = true;
          } else {
            this.authorized = false;
          }
        }
      }
    }, (error) => {
      console.error(error);
    });

    (this.selectedTab) ? this.getPeoplesTabData() : this.getMyFilesTabData();

  }

  // Gets my files tab file data
  getMyFilesTabData() {
    this.showMenu = false;
    this.selectedGroupId = null;
    this.selectedUserId = null;
    this.folders = [];
    this.files = [];
    this.root = true;
    this.folderType = "myFiles";
    this.Header = "My Files";
    this.folderType = "myFiles";

    let siteId = null;
    if (localStorage.getItem(this.siteName + "_siteUserId")) {
      siteId = localStorage.getItem(this.siteName + "_siteUserId");
    }
    // Checks if the user first time user and create a root folder for the user
    this.fileSharingService.checkRootFolder(this.loginUser, siteId).subscribe((rootFolder) => {
      if (rootFolder['result']) {
        this.folder = rootFolder["doc"];
        this.folderData = rootFolder;
        this.root = true;
        this.rootId = rootFolder["doc"];
        // Check if user is first time user and create a message folder
        this.fileSharingService.checkMessagesFolder(this.loginUser, this.folder, siteId).subscribe((messageFolder) => {
            // Folderobj to store response
            let folderObj = {
              folderName: messageFolder["doc"]["folderName"],
              folderTime: messageFolder["doc"]["updatedAt"],
              folderType: messageFolder["doc"]["type"],
              folderOwner: "Me",
              folderId: messageFolder["doc"]["_id"],
              folderSize: "--",
              parentFolder: messageFolder["doc"]["parentFolder"]
            };
            this.folders.push(folderObj); // Storing the folderObj inside folders array. This will be rendered in frontend at top
        });


        this.userId = localStorage.getItem('userId'); // Logged in user
        if (this.folder) {
          // Get folders and files created by loggedin user from backend
          this.fileSharingService.getMyFolders(this.loginUser, this.folder, "root").subscribe((response) => {
            if (response["result"]) {
              let folders = response["folders"];
              folders.forEach(folder => {
                // Folderobj to store response
                let folderObj = {
                  folderName: folder["folderName"],
                  folderTime: folder["updatedAt"],
                  folderType: folder["type"],
                  folderOwner: "Me",
                  folderId: folder["_id"],
                  folderSize: "--",
                  folderFiles: folder["files"],
                  folderSentToGroups: folder["sentToGroups"],
                  folderSentToUsers: folder["sentToUsers"],
                  folderDeleted: folder["isDeleted"],
                  parentFolder: folder["parentFolder"]
                };
                this.folders.push(folderObj); // Storing the folderObj inside folders array. This will be rendered in frontend at top
              });

              this.calculateTotalItems();

            }
             
          }, (error) => {
             
            console.error(error);
          });

          // Get files and files created by loggedin user from backend
          this.fileSharingService.getMyFiles(this.loginUser, this.folder).subscribe((response) => {
            if (response["result"]) {
              let files = response["files"];
              files.forEach(file => {
                let fileSizeFixed = file["metaData"]["size"].toFixed(3);
                let time = new Date(file["updatedAt"]);
                // FileObj to store response
                let fileObj = {
                  fileName: file["fileName"],
                  fileTime: time,
                  fileOwner: "Me",
                  fileId: file["_id"],
                  fileSize: fileSizeFixed + " MB",
                  fileType: file["metaData"]["type"],
                  fileUrl: file["url"],
                  fileDeleted: file["isDeleted"],
                  parentFolder: file["parentFolder"]
                };
                this.files.push(fileObj); // Storing the fileObj inside files array. This will be rendered in frontend at bottom
                 
              }, (error) => {
                 
                console.error(error);
              });

              this.calculateTotalItems();

              if (this.files.length > 0) {
                // Sorting files based on dates
                this.files.sort((a, b) => {
                  return moment(b.fileTime).unix() - moment(a.fileTime).unix()
                });
              }
            }
          }, (error) => {
             
            console.error(error);
          });
        }
      }
    }, (error) => {
       
      this.openSnackBar("Server side error occurred");
      console.error(error);
    });
  }

  calculateTotalItems() {
    this.totalItems = this.files.length + this.folders.length;
  }
  // Gets shared files data
  getSharedFiles() {
    this.showMenu = false;
     
    this.folders = [];
    this.files = [];
    this.Header = "Shared with me"; // Header title change
    this.folderType = "sharedFiles";

    this.fileSharingService.getSharedWithMeData(this.loginUser, localStorage.getItem(this.siteName + "_siteUserId")).subscribe((response) => {
       
      if (response["success"]) {
        let folders = response["folders"];
        let files = response["files"];
        if (folders.length > 0) {
          folders.forEach((folder) => {
            let folderObj = {
              folderName: folder["folderName"],
              folderTime: folder["updatedAt"],
              folderType: folder["type"],
              folderOwner: folder["metaData"]["ownerName"],
              folderId: folder["_id"],
              folderSize: "--",
              folderFiles: folder["files"],
              folderSentToGroups: folder["sentToGroups"],
              folderSentToUsers: folder["sentToUsers"],
              folderDeleted: folder["isDeleted"],
              parentFolder: folder["parentFolder"]
            };
            this.folders.push(folderObj); // Storing the folderObj inside folders array. This will be rendered in frontend at top
          });
          this.calculateTotalItems();
        }
        if (files.length > 0) {
          files.forEach((file) => {
            let fileSizeFixed = file["metaData"]["size"].toFixed(3);
            let time = new Date(file["updatedAt"]);
            let fileObj = {
              fileName: file["fileName"],
              fileTime: time,
              fileOwner: file["metaData"]["ownerName"],
              fileId: file["_id"],
              fileSize: fileSizeFixed + " MB",
              fileUrl: file["url"],
              fileDeleted: file["isDeleted"],
              parentFolder: file["parentFolder"]
            };
            this.files.push(fileObj);
          });
          this.calculateTotalItems();
        }
      }
    }, (error) => {
       
      console.log(error);
    });
  }

  /**
   * Gets trash folders and files of the user
   * @return {*} trash folders and files
   */
  getTrashData() {
    this.showMenu = false;
     
    this.Header = "Trash"; // Header title change
    this.folderType = "trash";
    this.folders = [];
    this.files = [];

    // API call to get files and folders from DB
    this.fileSharingService.getTrashData(this.userId).subscribe((response) => {
       
      if (response["result"]) {
        if (response["trashFolders"].length > 0) {
          response["trashFolders"].map(folder => this.folders.push(folder));
          this.calculateTotalItems();
          // this.folders.push(response["trashFolders"]);
        }

        if (response["trashFiles"].length > 0) {
          response["trashFiles"].map(file => this.files.push(file));
          this.calculateTotalItems();
          // this.files.push(response["trashFiles"]);
        }
      }
    }, (error) => {
       
      console.error(error);
    });
  }

  // Gets people's tab file data
  getPeoplesTabData() {
    this.Header = "Peoples Files";
    this.folderType = "people";
    this.getPeoples();
    this.getGroups();
  }

  // Gets peoples
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
      this.messageService.getMessageUsersBy(requestData),
      this.messageService.getPrivateSiteOwnerForMessaging(requestData)
    ).subscribe((result) => {
       
      this.peoplesList = [];
      Array.prototype.push.apply(result[0], result[1]);
      let ownerDetails: any = result[2];
      if (ownerDetails && ownerDetails.length > 0) {
        var siteAdmin = result[2];
        siteAdmin[0]["user"]["firstName"] = localStorage.getItem(this.siteName + '_privateSiteName');
        siteAdmin[0]["user"]["lastName"] = "(Site Admin)";
        siteAdmin[0]["user"]["profilePicture"] = localStorage.getItem(this.siteName + '_privateSiteLogo');
        Array.prototype.push.apply(result[0], siteAdmin);
      }
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
      if (this.groupsList && this.groupsList.length < 1) {
        if (this.peoplesList && this.peoplesList.length > 0) {
          this.getFilesBetweenUsers(this.peoplesList[0]);
        }
      }
    });
  }

  // Gets groups
  getGroups() {
    let requestData = {
      id: localStorage.getItem('userId')
    };
     
    // this.fileSharingService.getGroups(requestData).subscribe((result) => {
    //    
    //   this.groupsList = result;
    //   if (result && Object.keys(result).length > 0) {
    //     this.getFilesInGroup(result[0]["_id"]); // Getting files for first group in the list of groups
    //   }
    // });

    if (this.privateSiteCheck()) {
      let id = localStorage.getItem('userId');
      if (localStorage.getItem('userId') === localStorage.getItem(this.siteName + "_siteOwnerId")) {
        id = localStorage.getItem(this.siteName + '_siteUserId')
      }
      this.messageService.getMyPrivateGroups(id, localStorage.getItem(this.siteName + '_siteUserId')).subscribe(data => {
         
        this.groupsList = data;
        if (data && Object.keys(data).length > 0) {
          this.getFilesInGroup(data[0]["_id"]); // Getting files for first group in the list of groups
        }
      });
    } else {
      this.messageService.getMyGroups(this.loginUser, localStorage.getItem(this.siteName + '_siteUserId')).subscribe(data => {
         
        let result = [];
        this.groupsList = [];
        result = Object.assign([], data);
        result.forEach(element => {
          if (element.privateSiteId === null) {
            this.groupsList.push(element)
          } else {
            return;
          }
        });
        if (result && Object.keys(result).length > 0) {
          this.getFilesInGroup(result[0]["_id"]); // Getting files for first group in the list of groups
        }
      });
    }
  }

  createFileObj(data) {
    let fileData = {
      name: data['files'][0]['name'],
      owner: "",
      lastModified: data['updatedAt'],
      fileSize: 100,
      url: data['files'][0]['url'],
      ownerId: data['createdBy']
    };
    data['createdBy'] === this.loginUser ? fileData.owner = "me" : fileData.owner = data['member']['firstName'] + " " + data['member']['firstName'];
    return fileData;
  }

  // Sends OTP to registered mobile number
  sendOtp() {
     
    this.error = "";
    if (this.contactForm.status === "INVALID") {
      this.contactForm.get('formControlPhone').setErrors(['invalid_cell_phone', true]);
       
      return;
    }
    let number = this.getNumber();
    if (this.phoneNumber !== "") {
      number = this.phoneNumber;
    }
    var psDetails = {
      privateSite: false,
      privateSiteId: null
    };

    if (this.privateSiteCheck()) {
      psDetails.privateSite = true;
      psDetails.privateSiteId = localStorage.getItem(this.siteName + "_siteUserId");
    }
    this.fileSharingService.sendOtp({ userId: this.loginUser, number: number, attempt: "first", privateSiteDetails: psDetails }).subscribe((data) => {
       
      if (data['result']) {
        this.openSnackBar("OTP sent successfully");
        this.ngAfterViewInit();
        this.phone = true;
        this.phoneNumber = this.getNumber();
        this.oninit();
      } else {
        this.error = data['error'];
      }

    }, (error) => {
       
      this.error = error.error.message;
    });
  }

  // Resends OTP to registered mobile number
  resendOTP() {
     
    this.error = "";
    this.fileSharingService.sendOtp({ userId: localStorage.getItem('userId'), number: this.phoneNumber }).subscribe((data) => {
       
      this.openSnackBar("OTP sent successfully");
      this.otp = "";
      this.error = "";
      this.ngAfterViewInit();
      this.ngOnInit();
    }, (error) => {
       
      this.error = error.error.message;
    });
  }

  // Invokes when Phone number is invalid
  hasError(event: any): void {
    if (!event && this.contactForm.value.formControlPhone !== '') {
      this.contactForm.get('formControlPhone').setErrors(['invalid_cell_phone', true]);
    }
  }

  // Gets phone number from form group
  getNumber() {
    return "+" + this.countryCode + this.contactForm.get('formControlPhone').value;
  }

  // Gets country code
  countryChange(obj) {
    this.countryCode = obj.dialCode;
  }

  // Submits otp
  verifyOtp() {
     
    if (this.otp.length === 6) {
      var psDetails = {
        privateSite: false,
        privateSiteId: null
      };
      if (this.privateSiteCheck()) {
        psDetails.privateSite = true;
        psDetails.privateSiteId = localStorage.getItem(this.siteName + "_siteUserId");
      }
      this.fileSharingService.submitOtp({ userId: this.loginUser, phone: this.phoneNumber, otp: this.otp, privateSiteDetails: psDetails }).subscribe((response) => {
         
        if (response['result']) {
          this.openSnackBar("Verification Successful");
          this.oninit();
        } else {
          this.error = response['message'];
        }
      });
    } else {
       
      this.error = "Please enter otp";
      return;
    }

  }

  // Checks tabs
  tabClick(event) {
    this.selectedTab = event.index;
    (this.selectedTab) ? this.getPeoplesTabData() : this.getMyFilesTabData();
  }

  // Uploads all the files to Cloud storage
  uploadFiles(event) {
    this.closeModal();
    this.uploading = true;
     
    // Check for limit exceeded or not
    this.calculateStoragePercentage();
    if (!this.canUpload) {
       
      this.openSnackBar("You don't have permissions to upload. Please contact administrator");
      return;
    }
    if (this.storageLimitExceeded) {
    // if (true) {
       
      this.uploading = false;
      // Show warning popup
      const dialogRef = this.dialog.open(StorageWarningComponent, {
        width: '300px',
        disableClose: true
      });
      return;
    }
    let uploadPromises = [];
    let wasabiPromises = [];
    let files = Array.from(event.target.files);
    Array.from(event.target.files).forEach(file => { // Iterating through each file from the event
      wasabiPromises.push(this.uploadService.uploadFile(file));
    });

    Promise.all(wasabiPromises).then((uploads) => {
      for (let i=0; i < uploads.length; i++) {
        let now = new Date();
        let utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
        let requestData = {
          name: uploads[i].Key,
          location: uploads[i].Location,
          createdBy: localStorage.getItem('userId'),
          metaData: {
            ownerName: localStorage.getItem('userFirstName') + " " + localStorage.getItem('userLastName'),
            ownerId: localStorage.getItem('userId'),
            size: files[i]['size'] / Math.pow(1024, 2),
            type: uploads[i]["type"]
          },
          folder: this.folder,
          createdAt: utc,
          updatedAt: utc,
          privateSiteId: localStorage.getItem(this.siteName + "_siteUserId")
        };

        uploadPromises.push(this.createFile(requestData));
      }

      Promise.all(uploadPromises).then((result) =>  {
        this.dragover = false;
         
        this.uploading = false;
        if (result.length === uploadPromises.length) {
          result.forEach((file) => {
            if (file) {
              let fileSizeFixed = file["metaData"]["size"].toFixed(3);
              let time = new Date(file["updatedAt"]);
              // FileObj to store response
              let fileObj = {
                fileName: file["fileName"],
                fileTime: time,
                fileOwner: "Me",
                fileId: file["_id"],
                fileSize: fileSizeFixed + " MB",
                fileUrl: file["url"],
                fileType: file["metaData"]["type"],
                fileDeleted: file["isDeleted"],
                parentFolder: file["parentFolder"]
              };
              this.files.push(fileObj);
            }
            this.sortFiles();
          });
          if (event.target.files.length === 1) {
            this.openSnackBar("File uploaded successfully");
          } else {
            this.openSnackBar("Files uploaded successfully");
          }
        } else {
          this.openSnackBar("Unexpected error occurred while uploading files");
        }
      });
    });
  }

  // Uploads folder to Cloud storage
  // uploadFolder(event) {
  //    
  //   // Check for limit exceeded or not
  //   this.calculateStoragePercentage();
  //   if (!this.canUpload) {
  //      
  //     this.openSnackBar("You don't have permissions to upload. Please contact administrator");
  //     return;
  //   }
  //   if (this.storageLimitExceeded) {
  //      
  //     // Show warning popup
  //     const dialogRef = this.dialog.open(StorageWarningComponent, {
  //       width: '300px',
  //       disableClose: true
  //     });
  //     return;
  //   }

  //   let parentFolder = event.target.files[0]["webkitRelativePath"].split('/')[0];
  //   let folderData = Array.from(event.target.files);
  //   let parentFolderId = "";
  //   let filePromises = [];
  //   let folderPromises = [];
  //   let size = 0;
  //   let folderExist = false;
  //   let folders = [];

  //   for (let i=0; i < folderData.length; i++) {
  //     if (folderData[i]["name"] === ".DS_Store") {
  //       folderData.splice(i, 1);
  //     }
  //   }

  //   for (let i=0; i < folderData.length; i++) {
  //     size = size + folderData[i]["size"];
  //     let path = folderData[i]["webkitRelativePath"].split('/');
  //     if (path.length > 2) {
  //       folderExist = true;
  //       path.splice(0, 1);
  //       path.splice(path.length - 1, 1);
  //       folderData[i]["directory"] = path;
  //     }
  //   }

  //   let percentage = Number((((size / Math.pow(1024, 2)) / this.storageLimit) * 100).toFixed(2));
  //   percentage = percentage + this.percentageUsed;
  //   if (percentage >= 100) {
  //      
  //     // Show warning popup
  //     const dialogRef = this.dialog.open(StorageWarningComponent, {
  //       width: '300px',
  //       disableClose: true
  //     });
  //     return;
  //   }

  //   folderData.forEach((data) => {
  //     if (data["name"] !== ".DS_Store") {
  //       filePromises.push(this.uploadService.uploadFile(data));
  //       if (data["directory"]) {
  //         data["directory"].forEach((folder) => {
  //           if (!_.includes(folders, folder)) {
  //             folderPromises.push(this.createFolder(folder, null));
  //             folders.push(folder);
  //           }
  //         });
  //       }
  //     }
  //   });

  //   // Create root folder
  //   let requestData = {
  //     createdBy: localStorage.getItem('userId'),
  //     parentFolder: this.folder,
  //     folderName: parentFolder,
  //     metaData: {
  //       ownerName: localStorage.getItem('userFirstName') + " " + localStorage.getItem('userLastName'),
  //       ownerId: localStorage.getItem('userId')
  //     },
  //     privateSiteId: localStorage.getItem(this.siteName + "_siteUserId")
  //   };
  //   // Create new folder
  //   this.fileSharingService.createNewFolder(requestData).subscribe((response) => {
  //     console.log(response);
  //     if (response["result"]) {
  //       parentFolderId = response["doc"]["_id"];

  //       if (folderExist) {
  //         // Storing all files in Wasabi
  //         Promise.all(filePromises).then((data) => {
  //           Promise.all(folderPromises).then((result) => {
  //             let index = 0;
  //             let uploadPromises = [];
  //             data.forEach((url) => {
  //               folderData[index]["url"] = url
  //               index = index + 1
  //             });
  //             folders = result;
  //             // folders.splice(0, 0, {name: parentFolder, id: parentFolderId});
  //             folderData.forEach((file) => {
  //               let path = file["webkitRelativePath"].split('/');
  //               if (path.length === 2) {
  //                 let now = new Date();
  //                 let utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  //                 let requestData = {
  //                   name: file["url"].Key,
  //                   location: file["url"].Location,
  //                   createdBy: localStorage.getItem('userId'),
  //                   metaData: {
  //                     ownerName: localStorage.getItem('userFirstName') + " " + localStorage.getItem('userLastName'),
  //                     ownerId: localStorage.getItem('userId'),
  //                     size: file['size'] / Math.pow(1024, 2),
  //                     type: file["url"]["type"]
  //                   },
  //                   folder: parentFolderId,
  //                   createdAt: utc,
  //                   updatedAt: utc,
  //                   privateSiteId: localStorage.getItem(this.siteName + "_siteUserId")
  //                 };

  //                 // API call to store file in DB.
  //                 uploadPromises.push(this.createFile(requestData));
  //               } else {
  //                 // Uploading files to their specific folders
  //                 let now = new Date();
  //                 let utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  //                 let folderIndex = folders.findIndex((obj) => obj.name === path[path.length - 2])
  //                 let requestData = {
  //                   name: file["url"].Key,
  //                   location: file["url"].Location,
  //                   createdBy: localStorage.getItem('userId'),
  //                   metaData: {
  //                     ownerName: localStorage.getItem('userFirstName') + " " + localStorage.getItem('userLastName'),
  //                     ownerId: localStorage.getItem('userId'),
  //                     size: file['size'] / Math.pow(1024, 2),
  //                     type: file["url"]["type"]
  //                   },
  //                   folder: folders[folderIndex].id,
  //                   createdAt: utc,
  //                   updatedAt: utc,
  //                   privateSiteId: localStorage.getItem(this.siteName + "_siteUserId")
  //                 };

  //                 // API call to store file in DB.
  //                 uploadPromises.push(this.createFile(requestData));
  //               }
  //             });

  //             Promise.all(uploadPromises).then((response) => {
  //               let parentFolderPromises = [];
  //               let foldersList = [];
  //               folderData.forEach((file) => {
  //                 let path = file["webkitRelativePath"].split('/')
  //                 let pathIndex = 0;
  //                 // Assign folder id's to the folders.
  //                 path.splice(0, 1);
  //                 path.splice(path.length - 1, 1);
  //                 if (path.length === 1) {
  //                   let folderIndex = folders.findIndex((obj) => obj.name === path[0]);
  //                   let folderRequestData = {
  //                     folderId: folders[folderIndex]["id"],
  //                     privateSiteId: localStorage.getItem(this.siteName + "_siteUserId"),
  //                     parentFolder: parentFolderId
  //                   }
  //                   parentFolderPromises.push(this.updateFolderParent(folderRequestData));
  //                   foldersList.push(path[0]);
  //                 } else {
  //                   path.forEach((folder) => {
  //                     if (!_.includes(foldersList, folder)) {
  //                       if (pathIndex === 0) {
  //                         let folderIndex = folders.findIndex((obj) => obj.name === folder);
  //                         let folderRequestData = {
  //                           folderId: folders[folderIndex]["id"],
  //                           privateSiteId: localStorage.getItem(this.siteName + "_siteUserId"),
  //                           parentFolder: parentFolderId
  //                         }
  //                         parentFolderPromises.push(this.updateFolderParent(folderRequestData));
  //                         foldersList.push(folder);
  //                       } else {
  //                         let folderIndex = folders.findIndex((obj) => obj.name === folder);
  //                         let parentFolderIndex = folders.findIndex((obj) => obj.name === path[pathIndex -1])
  //                         let folderRequestData = {
  //                           folderId: folders[folderIndex]["id"],
  //                           privateSiteId: localStorage.getItem(this.siteName + "_siteUserId"),
  //                           parentFolder: folders[parentFolderIndex]["id"]
  //                         }
  //                         parentFolderPromises.push(this.updateFolderParent(folderRequestData));
  //                         foldersList.push(folder);
  //                       }
  //                       pathIndex  = pathIndex + 1;
  //                     }
  //                   });
  //                 }
  //               })

  //               Promise.all(parentFolderPromises).then((response) => {
  //                 console.log(response, folderData);
  //                 this.openSnackBar("Folder uploaded successfully");
  //                 this.oninit();
  //                  
  //               }).catch((error) => {
  //                 console.log(error);
  //               })

  //             }).catch((err) => {
  //               console.log(err);
  //             })
  //           });
  //         });
  //       } else {
  //         Promise.all(filePromises).then((data) => {
  //           let index = 0;
  //           data.forEach((url) => {
  //             folderData[index]["url"] = url
  //             index = index + 1
  //           });
  //           folderData.forEach((file) => {
  //             let path = file["webkitRelativePath"].split('/').length;
  //             if (path === 2) {
  //               let now = new Date();
  //               let utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  //               let requestData = {
  //                 name: file["url"].Key,
  //                 location: file["url"].Location,
  //                 createdBy: localStorage.getItem('userId'),
  //                 metaData: {
  //                   ownerName: localStorage.getItem('userFirstName') + " " + localStorage.getItem('userLastName'),
  //                   ownerId: localStorage.getItem('userId'),
  //                   size: file['size'] / Math.pow(1024, 2),
  //                   type: file["url"]["type"]
  //                 },
  //                 folder: parentFolderId,
  //                 createdAt: utc,
  //                 updatedAt: utc,
  //                 privateSiteId: localStorage.getItem(this.siteName + "_siteUserId")
  //               };

  //               // API call to store file in DB.
  //               this.fileSharingService.uploadFile(requestData).subscribe();
  //               this.openSnackBar("Folder uploaded successfully");
  //               this.oninit();
  //                
  //             }
  //           });
  //         });
  //       }
  //     } else {
  //       this.openSnackBar("Error uploading folder. Please try again");
  //     }
  //   });
  // }

  uploadFolder(event) {
    let rootFolder = event.target.files[0].webkitRelativePath.split('/')[0];
    const count = this.folders.filter((folder) => folder.folderName === rootFolder).length;
    this.uploading = true;
     
    // Check for limit exceeded or not
    this.calculateStoragePercentage();
    if (!this.canUpload) {
       
      this.openSnackBar("You don't have permissions to upload. Please contact administrator");
      return;
    }
    if (this.storageLimitExceeded) {
       
      // Show warning popup
      const dialogRef = this.dialog.open(StorageWarningComponent, {
        width: '300px',
        disableClose: true
      });
      return;
    }

    let folderData = Array.from(event.target.files);
    let filePromises = [];
    let directories = [];
    let percentage = 0;
    let size = 0
    folderData.forEach((file) => {
      if (file["name"] !== ".DS_Store") {
        size = size + file["size"];
        filePromises.push(this.uploadService.uploadFile(file));
        if (count > 0) {
          let folders = file["webkitRelativePath"].split('/')
          folders[0] = rootFolder + "(" + count + ")";
          let directory = folders.join("/");
          directories.push(directory);
        } else {
          directories.push(file["webkitRelativePath"]);
        }
      }
    });
    percentage = Number((((size / Math.pow(1024, 2)) / this.storageLimit) * 100).toFixed(2));
    percentage = percentage + this.percentageUsed;
    if (percentage >= 100) {
       
      // Show warning popup
      const dialogRef = this.dialog.open(StorageWarningComponent, {
        width: '300px',
        disableClose: true
      });
      return;
    }
    let validFolders = folderData.filter((folder) => folder["name"] !== ".DS_Store");
    Promise.all(filePromises).then((result) => {
      let index = 0;
      result.forEach((file) => {
        file.size = validFolders[index]['size'] / Math.pow(1024, 2)
        let path = (validFolders[index]["webkitRelativePath"]).split('/')
        file.parent = path[path.length - 2]
        index = index + 1;
      });
      let requestData = {
        files: result,
        directories: directories,
        parentFolder: this.folder,
        ownerName: localStorage.getItem('userFirstName') + " " + localStorage.getItem('userLastName'),
        ownerId: localStorage.getItem('userId'),
        privateSiteId: localStorage.getItem(this.siteName + "_siteUserId")
      }
      this.fileSharingService.uploadFolder(requestData).subscribe((response) => {
        this.uploading = false;
         
        if (response["success"]) {
          this.oninit();
          this.openSnackBar(response["message"]);
        }
      });
    }).catch((error) => {
      console.log(error);
      this.uploading = false;
       
      this.openSnackBar("Error uploading folder. Please try again");
    })
  }

  createFile(requestData) {
    return new Promise((resolve, reject) => {
      this.fileSharingService.uploadFile(requestData).subscribe((response) => {
        resolve(response);
      });
    })
  }

  updateFolderParent(requestData) {
    return new Promise((resolve, reject) => {
      this.fileSharingService.updateParentFolder(requestData).subscribe((response) => {
        if (response["success"]) {
          resolve("Success");
        } else {
          reject("Failed to update folder");
        }
      })
    });
  }

  // Creates new folder
  createNewFolder() {
    this.closeModal();
    // Open modal to get folder name
    const dialogRef = this.dialog.open(CreateNewFolderComponent, {
      width: '300px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
       
      if (result) {
        let requestData = {
          createdBy: localStorage.getItem('userId'),
          parentFolder: this.folder,
          folderName: result.folderName,
          metaData: {
            ownerName: localStorage.getItem('userFirstName') + " " + localStorage.getItem('userLastName'),
            ownerId: localStorage.getItem('userId')
          },
          privateSiteId: localStorage.getItem(this.siteName + "_siteUserId")
        };
        // API call to create new folder
        this.fileSharingService.createNewFolder(requestData).subscribe((folderData) => {
          if (folderData) {
             
            if (this.folderData.doc === this.rootId || this.folderData.parentFolder === this.rootId) {
              this.oninit();
            } else {
              this.getFoldersData(this.folderData);
            }
            this.openSnackBar("Folder created successfully"); // Snackbar to show success message
          } else {
             
            this.openSnackBar("Error creating folder");
          }
        }, (error) => {
           
          console.log(error);
        });
      } else {
         
      }
    });
  }

  createFolder(folderName, folderId) {
    return new Promise((resolve, reject) => {
      let requestData = {
        createdBy: localStorage.getItem('userId'),
        parentFolder: folderId,
        folderName: folderName,
        metaData: {
          ownerName: localStorage.getItem('userFirstName') + " " + localStorage.getItem('userLastName'),
          ownerId: localStorage.getItem('userId')
        },
        privateSiteId: localStorage.getItem(this.siteName + "_siteUserId")
      };
      // API call to create new folder
      this.fileSharingService.createNewFolder(requestData).subscribe((folderData) => {
        if (folderData) {
          let folderId = folderData["doc"]["_id"];
          resolve({ name: folderName, id: folderId });
        } else {
           
          this.openSnackBar("Error uploading folder");
          reject("Error uploading folder");
        }
      }, (error) => {
         
        console.log(error);
      });
    })

  }


  // OTP change event
  onOtpChange(event) {
  if(event == -2) {
    this.resendOTP();
  }    
    this.otp = event;
  }

  // On click folders data
  getFoldersData(folder) {
     
    // this.root = false;
    this.Header = folder.folderName;
    this.folders = [];
    this.files = [];
    this.folder = folder.folderId;
    this.folderData = folder;
    if (folder.folderType === "child") {
      forkJoin([
        this.fileSharingService.getChildFolders(this.loginUser, folder.folderId, folder.folderType, localStorage.getItem(this.siteName + "_siteUserId")),
        this.fileSharingService.getChildFiles(this.loginUser, folder.folderId, localStorage.getItem(this.siteName + "_siteUserId"))
      ]).subscribe((result) => {
        let folders = result[0]["folders"];
        let files = result[1]["files"];
        if (folders.length > 0) {
          folders.forEach(folder => {
            // Folderobj to store response
            let folderObj = {
              folderName: folder["folderName"],
              folderTime: folder["updatedAt"],
              folderType: folder["type"],
              folderOwner: "Me",
              folderId: folder["_id"],
              folderSize: "--",
              folderFiles: folder["files"],
              folderSentToGroups: folder["sentToGroups"],
              folderSentToUsers: folder["sentToUsers"],
              folderDeleted: folder["isDeleted"],
              parentFolder: folder["parentFolder"]
            };
            this.folders.push(folderObj); // Storing the folderObj inside folders array. This will be rendered in frontend at top
          });
          this.calculateTotalItems();
        }

        if (files.length > 0) {
          files.forEach(file => {
            if (file) {
              let fileSizeFixed = file["metaData"]["size"].toFixed(3);
              let time = new Date(file["updatedAt"]);
              // FileObj to store response
              let fileObj = {
                fileName: file["fileName"],
                fileTime: time,
                fileOwner: "Me",
                fileId: file["_id"],
                fileSize: fileSizeFixed + " MB",
                fileUrl: file["url"],
                fileType: file["metaData"]["type"],
                fileDeleted: file["isDeleted"],
                parentFolder: file["parentFolder"]
              };
              this.files.push(fileObj);
            }
          });
          this.calculateTotalItems();
        }
         
      },
      (error) => {
        console.log(error);
      });
    } else {
      this.fileSharingService.getMessageFolderFiles(this.loginUser, localStorage.getItem(this.siteName + "_siteUserId")).subscribe((messageFolderData) => {
        let files = messageFolderData["files"];
        files.forEach(file => {
          if (file) {
            // FileObj to store response
            let fileObj = {
              fileName: file["files"][0]["name"],
              fileUrl: file["files"][0]["url"],
              fileTime: file["updatedAt"],
              fileOwner: "Me",
              fileSize: "--",
              fileDeleted: file["isDeleted"]
            };
            this.files.push(fileObj);
          }
        });
        this.calculateTotalItems();
         
      });
    }
  }

  getPreviousFolderData(folder) {
     
    this.root = false;
    // this.Header = this.previousHeader;
    this.folders = [];
    this.files = [];
    // this.folder = folder.folderId;
    // this.folderData = folder;
    forkJoin(
      this.fileSharingService.getChildFolders(this.loginUser, folder.parentFolder, folder.folderType, localStorage.getItem(this.siteName + "_siteUserId")),
      this.fileSharingService.getChildFiles(this.loginUser, folder.parentFolder, localStorage.getItem(this.siteName + "_siteUserId")),
      this.fileSharingService.getPreviousFolderData(folder.parentFolder)
    ).subscribe((result) => {
      let folders = result[0]["folders"];
      let files = result[1]["files"];
      let previousFolder = result[2]["doc"];
      if (previousFolder) {
        let folderObj = {
          folderName: previousFolder["folderName"],
          folderTime: previousFolder["updatedAt"],
          folderType: previousFolder["type"],
          folderOwner: "Me",
          folderId: previousFolder["_id"],
          folderSize: "--",
          folderFiles: previousFolder["files"],
          folderSentToGroups: previousFolder["sentToGroups"],
          folderSentToUsers: previousFolder["sentToUsers"],
          folderDeleted: previousFolder["isDeleted"],
          parentFolder: previousFolder["parentFolder"]
        };
        this.folderData = folderObj;
        this.folder = folderObj.folderId;
        this.Header = folderObj.folderName;
      }
      if (folders.length > 0) {
        folders.forEach(folder => {
          // Folderobj to store response
          let folderObj = {
            folderName: folder["folderName"],
            folderTime: folder["updatedAt"],
            folderType: folder["type"],
            folderOwner: "Me",
            folderId: folder["_id"],
            folderSize: "--",
            folderFiles: folder["files"],
            folderSentToGroups: folder["sentToGroups"],
            folderSentToUsers: folder["sentToUsers"],
            folderDeleted: folder["isDeleted"],
            parentFolder: folder["parentFolder"]
          };
          this.folders.push(folderObj); // Storing the folderObj inside folders array. This will be rendered in frontend at top
        });
        this.calculateTotalItems();
      }

      if (files.length > 0) {
        files.forEach(file => {
          if (file) {
            let fileSizeFixed = file["metaData"]["size"].toFixed(3);
            let time = new Date(file["updatedAt"]);
            // FileObj to store response
            let fileObj = {
              fileName: file["fileName"],
              fileTime: time,
              fileOwner: "Me",
              fileId: file["_id"],
              fileSize: fileSizeFixed + " MB",
              fileUrl: file["url"],
              fileDeleted: file["isDeleted"],
              parentFolder: file["parentFolder"]
            };
            this.files.push(fileObj);
          }
        });
        this.calculateTotalItems();
      }
       
    });
  }

   /**
   * Shows success or error message to user
   * @params {*} takes message and button value as arguments
   */
  openSnackBar(message: string): void {
    this.snackBar.open(message, "OK", {
      duration: 2000,
    });
  }

  /**
   * Removes file for the user
   * @params {*} takes file as argument
   */
  removeFile(fileId): void {
     
    // Request object
    let requestData = {
      fileId: fileId
    };

    // API call to removeFile endpoint with request data
    this.fileSharingService.removeFile(requestData).subscribe((response) => {
       
      if (response['result']) {
        this.oninit();
        this.openSnackBar(response['message']);
      }
    }, (error) => {
       
      this.openSnackBar(error.error.message);
    });
  }

  /**
   * Removes folder for the user
   * @param {*} takes folderId as argument
   */
  removeFolder(folder): void {
    //  
    let requestData = { // Request data
      id: folder.folderId,
      filesList: folder.folderFiles
    };

    // API call to remove folder with request data
    this.fileSharingService.removeFolder(requestData).subscribe((response) => {
       
      if (response["result"]) {
        this.oninit();
        this.openSnackBar(response["message"]);
      }
    }, (error) => {
       
      this.openSnackBar(error.error.message);
    });
  }

  /**
   * Restores file for the user
   * @params {*} takes file as argument
   */
  restoreFile(fileId): void {
     
    // Request object
    let requestData = {
      id: fileId,
      type: "file"
    };

    this.fileSharingService.restoreData(requestData).subscribe((response) => {
       
      if (response["result"]) {
        this.getTrashData();
        this.openSnackBar(response['message']);
      }
    }, (error) => {
       
      this.openSnackBar(error.error.message);
    });
  }

  /**
   * Restores folder for the user
   * @params {*} takes folder as argument
   */
  restoreFolder(folder): void {
     
    // Request object
    let requestData = {
      id: folder.folderId,
      type: "folder"
    };

    this.fileSharingService.restoreData(requestData).subscribe((response) => {
       
      if (response["result"]) {
        this.getTrashData();
        this.openSnackBar(response['message']);
      }
    }, (error) => {
       
      this.openSnackBar(error.error.message);
    });
  }

  /**
   * Gets total storage value
   * return {*} total storage value used by logged in user
   */
  getStorageUsed() {
     
    this.storageUsed = 0;
    this.fileSharingService.getStorageUsed(this.loginUser, localStorage.getItem(this.siteName + "_siteUserId")).subscribe((response) => {
       
      if (response["result"]) {
        this.storageUsed += response["storageUsed"];
        this.calculateStoragePercentage();
      }
    }, (error) => {
       
      console.log(error.error);
    });
  }

  /**
   * Calculates used percentage
   * return {*} Percentage used by logged in user
   */
  calculateStoragePercentage() {
    this.percentageUsed = 0;
    this.ngZone.run(() => {
      this.percentageUsed = Number(((this.storageUsed / this.storageLimit) * 100).toFixed(2));
      (this.percentageUsed >= 100) ? this.storageLimitExceeded = true : this.storageLimitExceeded = false;
    });
  }

  /**
   * Shows alert for storage limit exceed
   */
  alertStorageLimitExceed() {

  }

  /**
   * Downloads file
   */
  downloadFile(file, index) {
    // saveAs(file.fileUrl, file. fileName);
    if (!this.canDownload) {
      this.openSnackBar("You don't have permissions to download. Please contact administrator")
      return;
    }
    window.open(file.fileUrl);
  }

  /**
   * Rename file or folder
   */
  rename(data, type) {
    const dialogRef = this.dialog.open(RenameModalComponent, {
      width: '300px',
      data: {
        type: type
      }
    });

    dialogRef.afterClosed().subscribe(result => {
       
      let now = new Date();
      let utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
      if (result) {
        if (type === "file") {
          let requestData = {
            fileId: data.fileId,
            renameString: result.renameString,
            type: type,
            updatedAt: utc
          };
          // API call to create new folder
          this.fileSharingService.rename(requestData).subscribe((response) => {
            if (response['success'] === true) {
               
              // this.oninit();
              this.openSnackBar("File rename successfully"); // Snackbar to show success message
              if (this.folderData.doc === this.rootId) {
                this.oninit();
              } else {
                this.getFoldersData(this.folderData);
              }
            } else {
               
              this.openSnackBar("Error renaming file");
            }
          }, (error) => {
             
            console.log(error);
          });
        } else {
          let requestData = {
            folderId: data.folderId,
            renameString: result.renameString,
            type: type,
            updatedAt: utc
          };
          // API call to create new folder
          this.fileSharingService.rename(requestData).subscribe((response) => {
            if (response['success'] === true) {
               
              // this.oninit();
              this.openSnackBar("Folder rename successfully"); // Snackbar to show success message
              if (this.folderData.doc === this.rootId) {
                this.oninit();
              } else {
                this.getFoldersData(this.folderData);
              }
            } else {
               
              this.openSnackBar("Error renaming folder");
            }
          }, (error) => {
             
            console.log(error);
          });
        }
      } else {
         
      }
    });
  }

  // Checks if user is in private site
  privateSiteCheck() {
    let httpLink = window.location.pathname.split('/');
    if (localStorage.getItem("privateSite") === "true" && httpLink[1] === "privatesites") { // Checks localStorage and parses current page link
      return true;
    }
    return false;
  }

  // Gets files shared between both the users
  getFilesBetweenUsers(user) {
     
    this.files = [];
    this.folders = [];
    this.selectedUserId = user._id;
    this.selectedUserName = user.userName;
    this.selectedUser = user;
    this.selectedGroupId = null;
    return forkJoin(
      this.fileSharingService.getFilesBetweenUsers(this.selectedUserId, this.loginUser, localStorage.getItem(this.siteName + "_siteUserId")),
      this.fileSharingService.getMessageFilesBetweenUsers(this.selectedUserId, this.loginUser, localStorage.getItem(this.siteName + "_siteUserId"))
    ).subscribe((response) => {
         
        let result = Object.assign([], response[1]);
        if (response[0]["success"]) {
          let folders = response[0]["folders"];
          let files = response[0]["files"];
          if (folders && folders.length > 0) {
            folders.forEach((folder) => {
              let folderObj = {
                folderName: folder["folderName"],
                folderTime: folder["updatedAt"],
                folderType: folder["type"],
                folderOwner: "",
                folderId: folder["_id"],
                folderSize: "--",
                folderFiles: folder["files"],
                folderSentToGroups: folder["sentToGroups"],
                folderSentToUsers: folder["sentToUsers"],
                folderDeleted: folder["isDeleted"],
                parentFolder: folder["parentFolder"]
              };
              (folder["user"]["_id"] === this.loginUser) ? folderObj.folderOwner = "me" : folderObj.folderOwner = folder['user']['firstName'] + " " + folder["user"]['lastName'];
              this.folders.push(folderObj); // Storing the folderObj inside folders array. This will be rendered in frontend at top
              this.calculateTotalItems();
            });
          }

          if (files.length > 0) {
            files.forEach((file) => {
              let fileSizeFixed ;
              if (file["metaData"]) {
                fileSizeFixed = file["metaData"]["size"].toFixed(3);
              }
              let time = new Date(file["updatedAt"]);
              // Fileobj to store response
              let fileObj = {
                fileName: file["fileName"],
                fileTime: time,
                fileOwner: file["metaData"]["ownerName"],
                fileId: file["_id"],
                fileSize: "",
                fileUrl: file["url"],
                fileDeleted: file["isDeleted"],
                parentFolder: file["parentFolder"]
              };

              if (fileSizeFixed) {
                fileObj.fileSize = fileSizeFixed + " MB"
              }
              (file["user"]["_id"] === this.loginUser) ? fileObj.fileOwner = "me" : fileObj.fileOwner = file['user']['firstName'] + " " + file["user"]['lastName'];
              this.files.push(fileObj); // Storing the fileObj inside files array. This will be rendered in frontend at bottom
              this.calculateTotalItems();
            });
          }
        }
        result.forEach(element => {
          let fileSizeFixed ;
          if (element["metaData"]) {
            fileSizeFixed = element["metaData"]["size"].toFixed(3);
          }
          // Fileobj to store response
          let fileObj = {
            fileName: element["files"][0]["name"],
            fileTime: element["updatedAt"],
            fileOwner: "",
            fileId: element["_id"],
            fileSize: "--",
            fileUrl: element["files"][0]["url"],
            fileDeleted: element["isDeleted"],
            parentFolder: element["parentFolder"]
          };

          if (fileSizeFixed) {
            fileObj.fileSize = fileSizeFixed + " MB"
          }
          (element["user"]["_id"] === this.loginUser) ? fileObj.fileOwner = "me" : fileObj.fileOwner = element['user']['firstName'] + " " + element["user"]['lastName'];
          this.files.push(fileObj); // Storing the fileObj inside files array. This will be rendered in frontend at bottom
        });
        this.calculateTotalItems();
        if (this.files.length > 0) {
          // Sorting files based on dates
          this.files.sort((a, b) => {
            return moment(b.updatedAt).unix() - moment(a.updatedAt).unix()
          });
        }

    }, (error) => {
       
      console.error(error);
    });
  }

  sortFiles() {
    this.files.sort((a, b) => {
      return moment(b.updatedAt).unix() - moment(a.updatedAt).unix()
    });
  }

  // Gets group details based on Group ID
  getFilesInGroup(groupId) {
    this.showMenu = false;
     
    this.folders = [];
    this.files = [];
    this.selectedGroupId = groupId;
    this.selectedUserId = null;
    this.selectedUser = null;
    this.fileSharingService.getFilesInGroup(groupId, localStorage.getItem(this.siteName + "_siteUserId")).subscribe((response) => {
       
      if (response["success"]) {
        let folders = response["folders"];
        let files = response["files"];

        if (folders.length > 0) {
          folders.forEach(folder => {
            // Folderobj to store response
            let folderObj = {
              folderName: folder["folderName"],
              folderTime: folder["updatedAt"],
              folderType: folder["type"],
              folderOwner: "Me",
              folderId: folder["_id"],
              folderSize: "--",
              folderFiles: folder["files"],
              folderSentToGroups: folder["sentToGroups"],
              folderSentToUsers: folder["sentToUsers"],
              folderDeleted: folder["isDeleted"],
              parentFolder: folder["parentFolder"]
            };
            (folder["user"]["_id"] === this.loginUser) ? folderObj.folderOwner = "me" : folderObj.folderOwner = folder['user']['firstName'] + " " + folder["user"]['lastName'];
            this.folders.push(folderObj); // Storing the folderObj inside folders array. This will be rendered in frontend at top
          });
        }

        if (files.length > 0) {
          files.forEach((file) => {
            let fileSizeFixed = file["metaData"]["size"].toFixed(3);
            let time = new Date(file["updatedAt"]);
            // Fileobj to store response
            let fileObj = {
              fileName: file["fileName"],
              fileTime: time,
              fileOwner: file["metaData"]["ownerName"],
              fileId: file["_id"],
              fileSize: fileSizeFixed + " MB",
              fileUrl: file["url"],
              fileDeleted: file["isDeleted"],
              parentFolder: file["parentFolder"]
            };
            (file["user"]["_id"] === this.loginUser) ? fileObj.fileOwner = "me" : fileObj.fileOwner = file['user']['firstName'] + " " + file["user"]['lastName'];
            this.files.push(fileObj); // Storing the fileObj inside files array. This will be rendered in frontend at bottom
          });
        }
      }
    }, (error) => {
       
      console.log(error);
    });
  }

  // Opens share modal popup
  openShareModal(data, type) {
    let modalData = {
      sentToGroups: [],
      sentToUsers: []
    };

    if (type === 'folder') {
      modalData.sentToGroups = data.folderSentToGroups;
      modalData.sentToUsers = data.folderSentToUsers;
    } else {
      modalData.sentToGroups = data.fileSentToGroups;
      modalData.sentToUsers = data.fileSentToUsers;
    }

    const dialogRef = this.dialog.open(ShareModalComponent, {
      width: '400px',
	    panelClass: 'myDialogStyle',
      disableClose: true,
      data: modalData
    });

    dialogRef.afterClosed().subscribe((response) => {
      if (response.result) {
         
        let groups = response.data.groups;
        let peoples = response.data.peoples;
        let shareGroups = [];
        let sharePeoples = [];
        if (groups.length > 0) {
          groups.map(group => shareGroups.push(group._id));
        }

        if (peoples.length > 0) {
          peoples.map(people => sharePeoples.push(people._id));
        }

        let requestData = {
          type: type,
          privateSiteId: null,
          folderId: null,
          fileId: null,
          sentToGroups: shareGroups,
          sentToUsers: sharePeoples
        }
        if (this.privateSiteCheck()) {
          if (localStorage.getItem(this.siteName + "_siteUserId")) {
            requestData.privateSiteId = localStorage.getItem(this.siteName + "_siteUserId");
          }
        }

        if (type === "folder") {
          requestData.folderId = data.folderId;
        }
        if (type === "file") {
          requestData.fileId = data.fileId
        }

        this.fileSharingService.shareData(requestData).subscribe((response) => {
           
          if (response['success']) {
            this.openSnackBar(response["message"]);
          } else {
            this.openSnackBar("Data share failed. Please try again later");
          }
        }, (error) => {
          console.error(error);
           
        });
      } else {
        return;
      }
    })
  }

  onSearchValueChange(searchValue) {
    if (searchValue.length === 0) {
      if (this.selectedGroupId) {
        this.getFilesInGroup(this.selectedGroupId);
      } else if (this.selectedUserId) {
        this.getFilesBetweenUsers(this.selectedUser);
      } else {
        if (this.folderType === "myFiles") {
          this.oninit();
        } else if (this.folderType === "sharedFiles") {
          this.getSharedFiles();
        } else {
          this.getTrashData();
        }
      }
      return;
    } else {
      if (this.folders.length > 0) {
        this.folders = this.folders.filter((folder) => {
          return(
            folder.folderName.toLowerCase().includes(searchValue.toLowerCase())
          )
        });
      }

      if (this.files.length > 0) {
        this.files = this.files.filter((file) => {
          return(
            file.fileName.toLowerCase().includes(searchValue.toLowerCase())
          )
        });
      }
    }
  }

  openMoveToModal(data, type): void {
    const dialogRef = this.dialog.open(MoveFolderModalComponent, {
      width: '800px',
	    panelClass: 'myDialogStyle',
      disableClose: true,
      data: {
        parentFolder: data["parentFolder"]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result["result"]) {
        if (result["selectedFolder"]) {
          if (this.folder === result["selectedFolder"]) {
            this.openSnackBar("Item already exists");
            return;
          }
           
          let requestData = {
            newFolderId: result["selectedFolder"],
            requestType: type,
            previousFolderId: "",
            privateSiteId: localStorage.getItem(this.siteName + "_siteUserId")
          }
          if (type === "folder") {
            requestData.previousFolderId = data["folderId"];
          } else {
            requestData.previousFolderId = data["fileId"];
          }

          this.fileSharingService.moveToFolder(requestData).subscribe((response) => {
             
            if (response["success"]) {
              this.oninit();
              this.openSnackBar(response["message"]);
            } else {
              this.openSnackBar(response["message"]);
            }
          }, (error) => {
             
            console.error(error);
          });
        }
      }
    });
  }

  openShareFilesModal(): void {
    if (this.selectedGroupId || this.selectedUserId) {
      const dialogRef = this.dialog.open(ShareDataModalComponent, {
        width: '800px',
        panelClass: 'myDialogStyle',
        disableClose: true
      });

      dialogRef.afterClosed().subscribe((data) => {
        if (data["result"]) {
           
          if (data["selectedFolder"]) {
            let requestData = {
              folderId: data["selectedFolder"],
              privateSiteId: localStorage.getItem(this.siteName + "_siteUserId"),
              sentToGroups: this.selectedGroupId,
              sentToUsers: this.selectedUserId
            };

            this.fileSharingService.shareFolder(requestData).subscribe((response) => {
               
              if (response["success"]) {
                this.openSnackBar(response["message"]);
                if (this.selectedGroupId) {
                  this.getFilesInGroup(this.selectedGroupId);
                } else {
                  let user = {
                    _id: this.selectedUserId,
                    userName: this.selectedUserName
                  }
                  this.getFilesBetweenUsers(user);
                }
              } else {
                this.openSnackBar(response["message"]);
              }
            }, (error) => {
               
              this.openSnackBar("Server side error occurred");
              console.log(error);
            });
          }
          if (data["selectedFile"]) {
            let requestData = {
              fileId: data["selectedFile"],
              privateSiteId: localStorage.getItem(this.siteName + "_siteUserId"),
              sentToGroups: this.selectedGroupId,
              sentToUsers: this.selectedUserId
            };

            this.fileSharingService.shareFile(requestData).subscribe((response) => {
               
              if (response["success"]) {
                this.openSnackBar(response["message"]);
                if (this.selectedGroupId) {
                  this.getFilesInGroup(this.selectedGroupId);
                } else {
                  let user = {
                    _id: this.selectedUserId,
                    userName: this.selectedUserName
                  }
                  this.getFilesBetweenUsers(user);
                }
              } else {
                this.openSnackBar(response["message"]);
              }
            }, (error) => {
               
              this.openSnackBar("Server side error occurred");
              console.log(error);
            });
          }
        }
      });
    }
  }

  goToPreviousFolder() {
    if (this.selectedGroupId) {
      this.Header = "Peoples Files"
      this.getFilesInGroup(this.selectedGroupId);
      return;
    } else if (this.selectedUserId) {
      this.Header = "Peoples Files"
      let user = {
        _id: this.selectedUserId,
        userName: this.selectedUserName
      }
      this.getFilesBetweenUsers(user);
      return;
    }
    if (this.folderData.parentFolder === this.rootId) {
      this.getMyFilesTabData();
      return;
    }
    this.getPreviousFolderData(this.folderData);
  }

  selectFolder(folder) {
    this.selectedFolder = folder.folderId;
    this.folderSelected = true;
  }

  managePermissions(): void {
    this.router.navigateByUrl("/privatesites/" + this.siteName + "/settings");
  }

  previewFile(file): void {
    let index = this.files.findIndex((obj) => obj.fileId === file.fileId);
    let types = {
      "image/gif": "image",
      "image/jpeg": "image",
      "image/png": "image",
      "image/vnd.microsoft.icon": "image",
      "image/svg+xml": "image",
      "image/tiff": "image",
      "image/webp": "image",
      "image/bmp": "image",
      "application/pdf": "pdf",
      "video/x-msvideo": "video",
      "video/mp4": "video",
      "video/mpeg": "video",
      "video/ogg": "video",
      "video/mp2t": "video",
      "video/webm": "video",
      "video/3gpp": "video",
      "video/3gpp2": "video",
      "audio/aac": "audio",
      "audio/mpeg": "audio",
      "audio/ogg": "audio",
      "audio/opus": "audio",
      "audio/wav": "audio",
      "audio/3gpp": "audio",
      "audio/3gpp2": "audio",
      "audio/mp3": "audio",
      "audio/mp4": "audio",
    }
    let files = [];
    this.files.forEach((file) => {
      let type = "";
      if (file.fileType) {
        type = types[file.fileType];
        if (!type) {
          type = "";
        }
      }
      let fileObj = {
        id: file.fileId,
        source: file.fileUrl,
        name: file.fileName,
        type: type,
      }
      files.push(fileObj);
    });

    const dialog = this.dialog.open(FilePreviewComponent, {
      // width: '300px',
      data: {
        files: files,
        index: index
      },
      panelClass: 'file-preview',
      disableClose: true
    });
  }

  onSelect(id) {
    this.selected = true;
    this.selectedId = id;
  }

  onDrop(event) {
    event.stopPropagation();
    event.preventDefault();
    // let folderExist = false;
    let files: Array<File> = event.dataTransfer.files;
    event.target.files = files
    // for (var i = 0, f; f = files[i]; i++) { // iterate in the files dropped
    //     var reader = new FileReader();
    //     reader.onload = function (e) {
    //       console.log('it is a file!');
    //     };
    //    reader.onerror = function (e) {
    //       folderExist = true;
    //    };
    // }
    // if (!folderExist) {
      this.uploadFiles(event)
    // } else {
      // this.openSnackBar("Folder(s) cannot be uploaded");
    // }
    this.dragover = false;
  }

  onDragEnter(event) {
    event.stopPropagation();
    event.preventDefault();
    this.enterTarget = event.target;
    this.dragover = true;
  }

  onDragOver($event) {
    event.stopPropagation();
    event.preventDefault();
  }

  onDragEnd(event) {
    event.stopPropagation();
    event.preventDefault();
    this.dragover = false;
  }

  onDragLeave(event) {
    event.stopPropagation();
    event.preventDefault();
    if (this.enterTarget === event.target) {
      this.dragover = false;
    }
  }

  storeData(data, type) {
    this.data = data;
    this.type = type;
  }

  share() {
    this.closeModal();
    this.openShareModal(this.data, this.type);
  }

  move() {
    this.closeModal();
    this.openMoveToModal(this.data, this.type);
  }

  renameResponsive() {
    this.closeModal();
    this.rename(this.data, this.type);
  }

  download() {
    this.closeModal();
    this.downloadFile(this.data, 0);
  }

  remove() {
    this.closeModal();
    if (this.type === "file") {
      this.removeFile(this.data.fileId);
    } else {
      this.removeFolder(this.data);
    }
  }

  closeModal() {
    let modal = document.getElementById("modalPBottom");
    let uploadModal = document.getElementById("modalUploadBottom");
    let fadein = document.getElementsByClassName("modal-backdrop fade in");
    if (modal) {
      modal.style.display = "none";
      if (fadein && fadein[0]) {
        fadein[0].remove();
      }
    }

    if (uploadModal) {
      uploadModal.style.display = "none";
      if (fadein && fadein[0]) {
        fadein[0].remove();
      }
    }
  }
}
