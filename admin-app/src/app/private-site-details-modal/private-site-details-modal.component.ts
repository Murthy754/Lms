import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserManagementService } from '../user-management/user-management.service';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-private-site-details-modal',
  templateUrl: './private-site-details-modal.component.html',
  styleUrls: ['./private-site-details-modal.component.scss']
})
export class PrivateSiteDetailsModalComponent implements OnInit {

  privateSites : any = []
	displayedColumns = ["privateSiteName", "siteStorage"];


  constructor(
    public dialogRef: MatDialogRef<PrivateSiteDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _userManagementService: UserManagementService,
  ) { 
    let id = JSON.stringify(data.id)
    this._userManagementService.getUserPrivateSites(id).subscribe((data: any) => {
      this.privateSites = new MatTableDataSource(data)
    })
  }

  ngOnInit(): void {
  }

  closePopup() {
    this.dialogRef.close();
  }

}
