import { HeaderService } from './../header/header.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsService } from '../settings/settings.service';
import { object } from 'underscore';
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { ModalComponent } from "../modal/modal.component";


@Component({
	selector: 'app-deactivated-privatesite',
	templateUrl : "./deactivated-privatesite.component.html",
	styleUrls: ['./deactivated-privatesite.component.scss']
})
export class DeactivatedPrivatesiteComponent implements OnInit {

	bsModalRef: BsModalRef;
	loggedUser: String = "";
	privatesiteAdmin: String = "";
	siteName: String = "";
	constructor(
		private _activatedRoute : ActivatedRoute,
		private hservice : HeaderService,
		private snackBar : MatSnackBar,
		private _router: Router,
		private _settingService: SettingsService,
		private modalService: BsModalService,
	) {
		this.siteName = this._activatedRoute.snapshot.params.siteName;
		this.loggedUser = localStorage.getItem('userId');
		this.privatesiteAdmin = localStorage.getItem(this.siteName + "_siteOwnerId")
	}

	ngOnInit() {
		this.onInit();
	}

	onInit() {
		this._settingService.getSiteSettings(this.siteName).subscribe((res: object) => {
			if (res['data']['isActive']){
				this._router.navigateByUrl('privatesites/'+ this.siteName)
			}
		})
	}

	changePrivateSiteStatus(){
		const initialState = {
			title: "Modal with component"
		  };
		  this.bsModalRef = this.modalService.show(ModalComponent, { initialState });
		  this.bsModalRef.content.alertTitle = "Alert";
			this.bsModalRef.content.content = "Are you sure you want to Activate this Private Site ?" ;
		  this.bsModalRef.content.onClose = myData => {
			this.bsModalRef.hide();
		let privateSiteId = localStorage.getItem(this.siteName + "_privateSiteId")
		let data = {privatesiteId : privateSiteId, status : true};
		this.hservice.changePrivatesiteStatus(data).subscribe(data => {
			this.snackBar.open("Private Site Activated",  "OK", {duration : 2000})
			this._router.navigate(["/privatesites/" + this.siteName +"/settings"]);
			// this._router.navigateByUrl('privatesites/'+ this.siteName)
		}, err => console.log(err)
		)
	  }
	}
}
