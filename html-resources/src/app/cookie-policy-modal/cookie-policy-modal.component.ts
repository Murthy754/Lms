import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-cookie-policy-modal',
  templateUrl: './cookie-policy-modal.component.html',
  styleUrls: ['./cookie-policy-modal.component.scss']
})
export class CookiePolicyModalComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<CookiePolicyModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cookieService: CookieService
  ) { }

  ngOnInit() {
  }

  onOkClick(): void {
    const today = new Date();
    const currentMonth = today.getMonth();
    today.setMonth(currentMonth + 1);
    this.cookieService.set("cookieAcceptance", "true", today);
    this.dialogRef.close();
  }
}
