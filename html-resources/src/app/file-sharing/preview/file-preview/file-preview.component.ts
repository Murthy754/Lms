import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PDFProgressData } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-file-preview',
  templateUrl: './file-preview.component.html',
  styleUrls: ['./file-preview.component.scss']
})
export class FilePreviewComponent implements OnInit {

  files: any = [];
  file;
  loading : Boolean = false;
  hidePrevious: Boolean = false;
  hideNext: Boolean = false;

  constructor(
    public dialogRef: MatDialogRef<FilePreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    document.onkeydown = (event) => {
      if (event.key === "ArrowRight") {
        if (this.hideNext) {
          return;
        }
        this.nextFile();
      } else if (event.key === "ArrowLeft") {
        if (this.hidePrevious) {
          return;
        }
        this.previousFile();
      }
    };
  }

  ngOnInit() {
    this.onInit();
  }

  onInit(): void {
    this.files = this.data.files;
    this.file = this.files[this.data.index];
    if (this.files.length === 1) {
      this.hidePrevious = true;
      this.hideNext = true;
    } else if (this.data.index === 0) {
      this.hidePrevious = true;
    } else if (this.data.index === this.files.length - 1) {
      this.hideNext = true;
    }
    if (this.file && this.file.type === "pdf") {
       this.loading = true
    } else if (this.file.type === "image") {
       this.loading = true
    }
  }

  onProgress(progressData: PDFProgressData) {
    if (progressData.loaded >= progressData.total) {
       
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  download() {
    window.open(this.file.source);
  }

  previousFile() {
    this.hideNext = false;
    let index = this.files.findIndex((file) => file.id === this.file.id);
    if (index < 0) return;
    this.file = this.files[index - 1];

    if (index - 1 === 0) {
      this.hidePrevious = true;
    }

    if (this.file.type === "pdf") {
       this.loading = true;
    }
  }

  nextFile() {
    this.hidePrevious = false;
    let index = this.files.findIndex((file) => file.id === this.file.id);
    if (index < 0) return;
    this.file = this.files[index + 1];

    if (index + 1 >= this.files.length - 1) {
      this.hideNext = true;
    }

    if (this.file.type === "pdf") {
       this.loading = true;
    }
  }

  loaded() {
     this.loading = false;
  }

  loadError() {
     this.loading = false;
    this.file.type = "error";
  }
}
