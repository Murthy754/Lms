import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-create-new-folder',
  templateUrl: './create-new-folder.component.html',
  styleUrls: ['./create-new-folder.component.scss']
})
export class CreateNewFolderComponent implements OnInit {

  folderName: string = "";
  constructor(
    public dialogRef: MatDialogRef<CreateNewFolderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

  onNoClick() {
    this.dialogRef.close();
  }

  onCreateClick() {
    if (this.folderName.length > 0) {
      this.dialogRef.close({ "folderName": this.folderName});
    } else {
      this.dialogRef.close();
    }
  }
  
}
