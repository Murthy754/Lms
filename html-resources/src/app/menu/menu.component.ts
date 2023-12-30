import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { SignupComponent } from "../signupmodal/signupmodal.component";
import { TopicmodalComponent } from "../topicmodal/topicmodal.component";
import { forkJoin } from "rxjs";
import { SignupmodalService } from '../signupmodal/signupmodal.service';
import { Socket } from 'ngx-socket-io';
import { CookieService } from "ngx-cookie-service";
import { AuthService } from '../auth.service';

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.scss"]
})
export class MenuComponent implements OnInit {
  @Input() name: string;
 
  constructor(
    public authService: SignupmodalService,
  ) { }
  
  ngOnInit() {
  
  }
  
}
