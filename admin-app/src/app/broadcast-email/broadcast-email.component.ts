import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { BroadcastEmailService } from './broadcast-email.service';
import { ComposeEmailModalComponent } from "./compose-email-modal/compose-email-modal.component";
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

export interface UserElement {
	firstName: string;
	lastName: string;
	email: string;
	verified: string;
}
@Component({
  selector: 'app-broadcast-email',
  templateUrl: './broadcast-email.component.html',
  styleUrls: ['./broadcast-email.component.scss']
})

export class BroadcastEmailComponent implements OnInit {

  @ViewChild(MatPaginator) 
  paginator!: MatPaginator;
  @ViewChild(MatSort) 
  sort!: MatSort;
  users: any = [];
  emailList: any = [];
	displayedColumns: string[] = ["select", "firstName", "lastName", "email", "verified"];
  selection = new SelectionModel<UserElement>(true, []);

  constructor(
    private _broadcastEmailService: BroadcastEmailService,
    public router: Router,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.onInit();
  }

  ngAfterViewInit() {
    this.users.paginator = this.paginator;
    this.users.sort = this.sort;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    let numRows = 0;
		if (this.users && this.users.data && this.users.data.length) {
			numRows = this.users.data.length;
		}
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.users.data.forEach((row: any) => this.selection.select(row));
  }

  checkboxLabel(row?: UserElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.firstName + row.lastName + 1}`;
  }

  onInit(): void {

    // Getting active users
    this._broadcastEmailService.getActiveUsers().subscribe((response: any) => {

      if (response["success"]) {
        if (response["data"].length > 0) {
          this.users = new MatTableDataSource(response["data"]);
          this.ngAfterViewInit();
        } else {
          this.users = [];
        }
      }
    }, (error) => {
      console.log(error);
    });
  }


  composeEmail() {
    if (this.selection["_selected"].length === 0){
      this.openSnackBar("Please select users to start composing");
      return;
    }
    let emails = this.selection["_selected"];
    const dialogRef = this.dialog.open(ComposeEmailModalComponent,{
      width: '800px',
      disableClose: true,
      data: {
        emails: emails
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result["success"]) {
        let selectedUsers = this.selection["_selected"];
        selectedUsers.forEach((user: any) => {
          this.emailList.push(user.email);
        });
        this.selection.clear();
        let requestData = {
          emails: this.emailList,
          subject: result["subject"],
          html: result["data"]
        };

        this._broadcastEmailService.sendBroadcastEmail(requestData).subscribe((response: any) => {
          if (response["success"]) {
            this.openSnackBar("Email broadcast successful");
          }
        }, (error) => {
          console.log(error);
        });
      } else {
        return;
      }
    });
  }


  openSnackBar(message: string): void {
    this.snackBar.open(message, "OK", {
      duration: 2000,
    });
  }

  searchValueChange(value: string) {
    this.users.filter = value.toLowerCase();
  }
}
