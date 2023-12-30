import { Component, OnInit, ViewChild } from '@angular/core';
import { UserManagementService } from './user-management.service';
import { MatTableDataSource } from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { PrivateSiteDetailsModalComponent } from '../private-site-details-modal/private-site-details-modal.component';


@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  @ViewChild(MatPaginator) 
  paginator!: MatPaginator;
  @ViewChild(MatSort) 
  sort!: MatSort;
  
  users: any = [];
	usersList: any = [];
	displayedColumns = ["firstName", "lastName", "mainSiteStorage", "privateSiteStorage", 'privateSites', "numberOfPolls", "createdAt", "blocked"];

  constructor(
    private _userManagementService: UserManagementService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.onInit();
  }

  onInit() {
    this._userManagementService.getUsers().subscribe((response: any) => {
      if (response["success"]) {
        if (response["data"].length > 0) {
          this.usersList = new MatTableDataSource(response["data"]);
          this.ngAfterViewInit();
        }
      }
    }, (error) => {
      console.log(error);
    });
  }

  ngAfterViewInit() {
    this.usersList.paginator = this.paginator;
    this.usersList.sort = this.sort;
  }

  searchValueChange(value: string) {
    this.usersList.filter = value.toLowerCase();
  }

  openprivateSiteDetailsModel(id: any) {
    const dialogRef = this.dialog.open(PrivateSiteDetailsModalComponent,{
      width: '500px',
      disableClose: false,
      data: {
        id: id
      }
    });
    
  }
}
