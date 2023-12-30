import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-storage-warning',
  templateUrl: './storage-warning.component.html',
  styleUrls: ['./storage-warning.component.scss']
})
export class StorageWarningComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<StorageWarningComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }
  
  onNoClick(): void {
    this.dialogRef.close();
  }
  
}
