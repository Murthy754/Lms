import { Component, OnInit } from '@angular/core';
import { GlobalConfigurationsService } from './global-configurations.service';
import { Validators, FormControl } from "@angular/forms";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-global-configurations',
  templateUrl: './global-configurations.component.html',
  styleUrls: ['./global-configurations.component.scss']
})
export class GlobalConfigurationsComponent implements OnInit {

  configurations: any;
  mainSiteStorageFormControl = new FormControl('', [Validators.required]);
  privateSiteStorageFormControl = new FormControl('', [Validators.required]);
  topicsPerPageFormControl = new FormControl('', [Validators.required]);
  showGoogleAdsFormControl = new FormControl('');
  feedAdIndexFormControl = new FormControl('', [Validators.required]);
  privateSiteSubscriberLimitFormControl = new FormControl('', [Validators.required]);
  privateSitesLimitFormControl = new FormControl('', [Validators.required]);
  tabPreference = new FormControl('top', Validators.required)
  disableSave: Boolean = true;
  tabs = ['top','trending','recent'];

  constructor(
    private globalConfigurationsService: GlobalConfigurationsService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.onInit();
  }

  onInit(): void {
    this.globalConfigurationsService.getConfigurations().subscribe((response: any) => {
      if (response && response["success"]) {
        if (response["configurations"] && response["configurations"]["__v"]) {
          delete response["configurations"]["__v"];
        }
        this.configurations = response["configurations"];

        this.mainSiteStorageFormControl.setValue((this.configurations["main_site_storage"]) ? this.configurations["main_site_storage"] : 1);
        this.privateSiteStorageFormControl.setValue((this.configurations["private_site_storage"]) ? this.configurations["private_site_storage"] : 1);
        this.topicsPerPageFormControl.setValue((this.configurations["topics_per_page"]) ? this.configurations["topics_per_page"] : 1);
        this.showGoogleAdsFormControl.setValue((this.configurations["show_google_ads"]) ? this.configurations["show_google_ads"] : false);
        this.feedAdIndexFormControl.setValue((this.configurations["feed_ad_index"]) ? this.configurations["feed_ad_index"] : 1);
        this.privateSiteSubscriberLimitFormControl.setValue((this.configurations["private_site_subscriber_limit"]) ? this.configurations["private_site_subscriber_limit"] : 0);
        this.privateSitesLimitFormControl.setValue((this.configurations["private_sites_limit"]) ? this.configurations["private_sites_limit"] : 1);
      }
    });
  }

  validate(type: String) {
    if (type === "main_site_storage") {
      if (this.mainSiteStorageFormControl.value < 20) {
        this.disableSave = true;
        this.mainSiteStorageFormControl.setErrors({ 'incorrect': true });
      } else {
        this.disableSave = false;
        this.mainSiteStorageFormControl.setErrors(null);
      }
    } else if (type === "private_site_storage") {
      if (this.privateSiteStorageFormControl.value < 100) {
        this.disableSave = true;
        this.privateSiteStorageFormControl.setErrors({ 'incorrect': true });
      } else {
        this.disableSave = false;
        this.privateSiteStorageFormControl.setErrors(null);
      }
    } else if (type === "topics_per_page") {
      if (this.topicsPerPageFormControl.value < 1) {
        this.disableSave = true;
        this.topicsPerPageFormControl.setErrors({ 'incorrect': true });
      } else {
        this.disableSave = false;
        this.topicsPerPageFormControl.setErrors(null);
      }
    } else if (type === "feed_ad_index") {
      if (this.feedAdIndexFormControl.value < 1) {
        this.disableSave = true;
        this.feedAdIndexFormControl.setErrors({ 'incorrect': true });
      } else {
        this.disableSave = false;
        this.feedAdIndexFormControl.setErrors(null);
      }
    } else if (type === "private_site_subscriber_limit") {
      if (this.privateSiteSubscriberLimitFormControl.value < 0) {
        this.disableSave = true;
        this.privateSiteSubscriberLimitFormControl.setErrors({ 'incorrect': true });
      } else {
        this.disableSave = false;
        this.privateSiteSubscriberLimitFormControl.setErrors(null);
      }
    } else if (type === "private_sites_limit") {
      if (this.privateSitesLimitFormControl.value < 1) {
        this.disableSave = true;
        this.privateSitesLimitFormControl.setErrors({ 'incorrect': true });
      } else {
        this.disableSave = false;
        this.privateSitesLimitFormControl.setErrors(null);
      }
    } else if(type === "tabPreference") {
      if(this.tabPreference.invalid) {
        this.disableSave = true;
      } else {
        this.disableSave = false;
      }
    }
    
    else {
      this.disableSave = false;
    }
  }

  saveConfigurations(): void {
    
    let request = {
      "feed_ad_index": this.feedAdIndexFormControl.value,
      "type": "_tn_configurations",
      "main_site_storage": this.mainSiteStorageFormControl.value,
      "private_site_storage": this.privateSiteStorageFormControl.value,
      "show_google_ads": this.showGoogleAdsFormControl.value,
      "topics_per_page": this.topicsPerPageFormControl.value,
      "tabPreference": this.tabPreference.value,
      "private_site_subscriber_limit": this.privateSiteSubscriberLimitFormControl.value,
      "private_sites_limit": this.privateSitesLimitFormControl.value,
      "__v": 0
    };

    if (JSON.stringify(this.configurations) === JSON.stringify(request)) {
      this.openSnackBar("Configurations are up-to-date");
      return;
    }
    // API call
    this.globalConfigurationsService.setConfigurations(request).subscribe((response: any) => {
      if (response && response["success"]) {
        this.configurations = request;
        this.disableSave = true;
        this.openSnackBar(response["message"]);
      }
    }, (error) => {
      this.openSnackBar("Server side error occurred. Please try again");
    });
  }

  openSnackBar(message: string): void {
    this.snackBar.open(message, "OK", {
      duration: 2000,
    });
  }

}
