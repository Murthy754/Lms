import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { forkJoin } from 'rxjs';
import { FileSharingService } from '../../file-sharing.service';

@Component({
  selector: 'app-move-folder-modal',
  templateUrl: './move-folder-modal.component.html',
  styleUrls: ['./move-folder-modal.component.scss']
})
export class MoveFolderModalComponent implements OnInit {

  folders = [];
  files = [];
  loginUser;
  folder;
  previousFolder;
  siteName;
  parentFolder;
  folderSelected: boolean = false;
  selectedFolder;
  folderData;
  rootId;

  constructor(
    public dialogRef: MatDialogRef<MoveFolderModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fileSharingService: FileSharingService
  ) { }

  ngOnInit() {
    this.onInit();
  }

  onInit(): void {
    this.folders = [];
    this.files = [];
    this.previousFolder = null;
    let link = window.location.pathname.split('/');
    if (link[1] === 'privatesites') {
      this.siteName = link[2];
    }
    this.parentFolder = this.data.parentFolder;
    this.loginUser = localStorage.getItem("userId");
    // Checks if the user first time user and create a root folder for the user
    this.fileSharingService.checkRootFolder(this.loginUser,  localStorage.getItem(this.siteName + "_siteUserId")).subscribe((rootFolder) => {
      if (rootFolder['result']) {
        this.folder = rootFolder["doc"];
        this.selectedFolder = this.folder;
        this.rootId = this.folder;

        if (this.folder) {
          // Get folders and files created by loggedin user from backend
          this.fileSharingService.getMyFolders(this.loginUser, this.folder, "root").subscribe((response) => {
            if (response["result"]) {
              let folders = response["folders"];
              folders.forEach(folder => {
                // Folderobj to store response
                let folderObj = {
                  folderName: folder["folderName"],
                  folderTime: folder["createdAt"],
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
                // FileObj to store response
                let fileObj = {
                  fileName: file["fileName"],
                  fileTime: file["createdAt"],
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
            }
          });
        }
      }
    }, (error) => {
       
      console.error(error);
    });
  }


  // On click folders data
  getFoldersData(folder) {
     
    this.folders = [];
    this.files = [];
    this.folder = folder.folderId;
    this.selectedFolder = folder.folderId;
    this.folderData = folder;
    this.previousFolder = folder;
    if (folder.folderType === "child") {
      forkJoin(
        this.fileSharingService.getChildFolders(this.loginUser, folder.folderId, folder.folderType, localStorage.getItem(this.siteName + "_siteUserId")),
        this.fileSharingService.getChildFiles(this.loginUser, folder.folderId, localStorage.getItem(this.siteName + "_siteUserId"))
      ).subscribe((result) => {
        let folders = result[0]["folders"];
        let files = result[1]["files"];
        if (folders.length > 0) {
          folders.forEach(folder => {
            // Folderobj to store response
            let folderObj = {
              folderName: folder["folderName"],
              folderTime: folder["createdAt"],
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
        }

        if (files.length > 0) {
          files.forEach(file => {
            if (file) {
              let fileSizeFixed = file["metaData"]["size"].toFixed(3);
              // FileObj to store response
              let fileObj = {
                fileName: file["fileName"],
                fileTime: file["createdAt"],
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
        }
         
      });
    }
  }

  selectFolder(folder) {
    this.selectedFolder = folder.folderId;
    this.folderSelected = true;
  }

  goBackFolder() {
    if (this.folderData.parentFolder === this.rootId) {
      this.onInit();
      return;
    }
    this.getPreviousFolderData(this.folderData);
  }

  onMoveClick(): void {
    this.dialogRef.close({ result: true, selectedFolder: this.selectedFolder });
  }

  onNoClick(): void {
    this.dialogRef.close({ result: false });
  }

  // Checks if user is in private site
  privateSiteCheck() {
    let httpLink = window.location.pathname.split('/');
    if (localStorage.getItem("privateSite") === "true" && httpLink[1] === "privatesites") { // Checks localStorage and parses current page link
      return true;
    }
    return false;
  }

  getPreviousFolderData(folder) {
     
    // this.Header = this.previousHeader;
    this.folders = [];
    this.files = [];
    this.folder = folder.folderId;
    this.folderData = folder;
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
          folderTime: previousFolder["createdAt"],
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
      }
      if (folders.length > 0) {
        folders.forEach(folder => {
          // Folderobj to store response
          let folderObj = {
            folderName: folder["folderName"],
            folderTime: folder["createdAt"],
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
      }

      if (files.length > 0) {
        files.forEach(file => {
          if (file) {
            let fileSizeFixed = file["metaData"]["size"].toFixed(3);
            // FileObj to store response
            let fileObj = {
              fileName: file["fileName"],
              fileTime: file["createdAt"],
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
      }
       
    });
  }
}
