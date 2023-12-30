import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, Event } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
// import { Editor } from 'ngx-editor';

@Component({
  selector: 'app-compose-email-modal',
  templateUrl: './compose-email-modal.component.html',
  styleUrls: ['./compose-email-modal.component.scss']
})
export class ComposeEmailModalComponent implements OnInit {
  // editor: Editor = new Editor();
  template = '';
  subject = '';
  emails: any = [];

  
  constructor(
    public dialogRef: MatDialogRef<ComposeEmailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.router.events.subscribe((event: Event) => {
      this.dialogRef.close({ success: false });
    });
   }

   editorConfig: AngularEditorConfig = {
      editable: true,
      spellcheck: true,
      height: '15vh',
      translate: 'yes',
      enableToolbar: true,
      showToolbar: true,
      placeholder: 'Enter text here...',
      fonts: [
        {class: 'arial', name: 'Arial'},
        {class: 'times-new-roman', name: 'Times New Roman'},
        {class: 'calibri', name: 'Calibri'},
        {class: 'comic-sans-ms', name: 'Comic Sans MS'}
      ],
      customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
};

  ngOnInit() {
    this.onInit();
  }

  onInit(): void {
    if (this.data.emails.length > 2) {
      let index = 0;
      this.data.emails.forEach((user: any) => {
        if (index < 2) {
          this.emails.push(user);
        }
        if (index === 2) {
          let obj = {
            email: "..." + (this.data.emails.length - 2) + " more"
          }
          this.emails.push(obj);
        }
        index = index + 1;
      });
    } else {
      this.emails = this.data.emails;
    }
  }

  onNoClick() {
    this.dialogRef.close({ result: { success: false }});
  }

  onBroadcastClick() {
    if (this.template.length > 0 && this.subject.length > 0) {
      this.dialogRef.close({ success: true, data: this.template, subject: this.subject });
    } else {
      this.dialogRef.close({ success: false });
    }
  }

  // make sure to destory the editor
  ngOnDestroy(): void {
    // this.editor.destroy();
  }

  copyEmails() {
    let copyString = "";
    this.data.emails.forEach((emails: any) => {
      if (copyString.length === 0) {
        copyString = emails.email;
      } else {
        copyString = copyString + ", " + emails.email;
      }
    });

    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = copyString;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.openSnackBar("Copied to clipboard");
  }

  openSnackBar(message: string): void {
    this.snackBar.open(message, "OK", {
      duration: 2000,
    });
  }
}
