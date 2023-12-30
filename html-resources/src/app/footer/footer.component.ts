import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"]
})
export class FooterComponent implements OnInit {
  constructor(public _router: Router) {}

  ngOnInit() {}

  getYear() {
    return new Date().getFullYear();
  }
  navtoPrivacyPolicy() {
    this._router.navigate(["/privacy-policy"]);
  }
}
