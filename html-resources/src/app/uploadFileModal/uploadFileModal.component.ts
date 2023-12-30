import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
@Component({
  selector: 'app-uploadFileModal',
  templateUrl: './uploadFileModal.component.html',
  styleUrls: ['./uploadFileModal.component.css']
})
export class UploadFileModalComponent {
  fullScreenView: boolean = false;
  description: string;
  constructor(
    private dialogRef: MatDialogRef<UploadFileModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (typeof data["url"] === "string") {
      this.fullScreenView = true;
    }
  }

  // Method to send the message
  sendMessage() {
   this.dialogRef.close({ event: 'save', description: this.description });
  }

  // Method to close the modal
  closeModal() {
    this.dialogRef.close({ event: 'close' });
  }
}
