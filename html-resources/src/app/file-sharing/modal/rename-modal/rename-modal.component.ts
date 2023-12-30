import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-rename-modal',
  templateUrl: './rename-modal.component.html',
  styleUrls: ['./rename-modal.component.scss']
})
export class RenameModalComponent implements OnInit {

  type: string = "";
  renameString: string = "";
  errorMessage;
  
  constructor(
    public dialogRef: MatDialogRef<RenameModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.type = this.data.type;
  }

  onNoClick() {
    this.dialogRef.close();
  }

  onCreateClick() {
    if (this.renameString.length > 0) {
      this.dialogRef.close({ "renameString": this.renameString});
    } else {
      this.dialogRef.close();
    }
  }

}
