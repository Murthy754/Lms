import { Component, OnInit } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
@Component({
  selector: "app-retruth-modal",
  templateUrl: "./retruth-modal.component.html",
  styleUrls: ["./retruth-modal.component.scss"]
})
export class RetruthModalComponent implements OnInit {
  retruth_reason = "";
  userId;
  poll: any;
  onClose: any;
  constructor(public bsModalRef: BsModalRef) {}

  ngOnInit() {
    this.userId=localStorage.getItem('userId');
  }
  closeTrunumsModal() {
    this.bsModalRef.hide();
  }
  retruthTopic(poll) {
    this.onClose(this.retruth_reason);
  }
}
