import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { AuthService } from "../auth.service";
@Component({
  selector: "app-modal",
  templateUrl: "./modal.component.html",
  styleUrls: ["./modal.component.scss"]
})
export class ModalComponent implements OnInit {
  alertTitle: "";
  content: "";
  onClose: any;
  subscriberid;
  isCancel;
  constructor(private bsRef: BsModalRef, private router: Router, public authserve: AuthService) {}

  ngOnInit() {}
  cancel() {

    this.bsRef.hide();
    if (this.bsRef.content.checkbox) {
      this.bsRef.content.checkbox.checked = false;
    } else if (this.bsRef.content.privateSite === true) {
      this.authserve.isPrivateSite = "No"
      this.router.navigateByUrl('/home/top?location=world');
    }
  }
  yesButtonClick(value) {
    this.onClose(this.subscriberid);
  }
}
