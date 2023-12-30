import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "../auth.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { CreatetopicService } from '../createnewtopic/createtopic.service';
import { DomSanitizer } from "@angular/platform-browser";
import { GroupsService } from "./groups.service";

@Component({
  selector: 'app-Groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {
  isPrivateSite = "No";
  leftMenu = "groups";
  groupForm: FormGroup;
  replyForm:FormGroup;
  groupLogoPic;
  groupLogoFile;
  saveValidity = false;
  usersList: any;
  groupMembers = [];
  memberArray=[];
  groupsList:any;


  constructor(
    private router: Router,
    public authserve: AuthService,
    private cService: CreatetopicService,
    private sanitizer: DomSanitizer,
    private Groupservice: GroupsService,
    private fb: FormBuilder,


  ) {
    authserve.privateSite.subscribe(isPrivateSite => {

      if (isPrivateSite || isPrivateSite === 'Yes') {
        this.isPrivateSite = isPrivateSite;
      }
      else {
        this.isPrivateSite = "No";
      }
    });
  }


  ngOnInit() {
    this.leftMenu = "groups";

    this.Groupservice.getUsers().subscribe(data => {
       
      this.usersList = data;
    });
    this.Groupservice.getGroups().subscribe(data => {
       
      this.groupsList = data;
    });
    this.replyForm = this.fb.group({
      message: ['', [Validators.required]],
      // groupMembers: ['', [Validators.required]],
    });
   
  }


  enableSave() {
    this.saveValidity = false;
  }
  addMember(user) {
    this.memberArray.push(user._id);

    var userObj = {
      _id: user._id,
      name: user.firstName + " " + user.lastName,
      username: user.userName,
      profilePicture: user.profilePicture
    }
    this.groupMembers.push(userObj);
  }
  removeMember(i) {
    this.groupMembers.splice(i, 1);
    this.memberArray.splice(i, 1);
  }

  onFileChange(event) {
    this.groupLogoFile = event.target.files[0];
    if (this.groupLogoFile) {
      this.groupLogoPic = this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(this.groupLogoFile)
      );
    }
  }
  creategroupFun(value) {
    this.leftMenu = value;
    // this.leftMenu.subscribe(isPrivateSite => {
    // });
  }
  addNewGroup() {
     
    if (this.groupForm.valid && this.groupLogoFile) {
      this.cService.uploadFile(this.groupLogoFile).then(
        pased => {
          this.saveGroup(pased.Location)
        },
        err => {
          console.log(err);
        }
      );
    }
    else if (this.groupForm.valid && this.groupLogoPic) {
      this.saveGroup(this.groupLogoPic)
    }
    else {
       
    }
  }
  
  saveGroup(url) {
    var groupData = {
      // id: localStorage.getItem('userId'),
      groupSettings: {
        groupName: this.groupForm.controls['groupName'].value,
        groupIcon: url,
        groupMembers: this.groupMembers,
        createdBy: localStorage.getItem('userId')
      }

    }
    this.Groupservice.saveGroup(groupData).subscribe(docs => {
       
      // this.privateSettingsForm.valid=false;
      // this.privateSettingsForm.controls['websitecontact'].invalid = true;
      this.saveValidity = true;
      // if (groupData.privateSite === false) {
      //   this.SService.isPrivateSite = "No";
      // } else {
      //   this.SService.isPrivateSite = "Yes";
      // }
    })
  }




  items = ['Artha Shashstra', 'Bay Area Astronomy'];
  itemsList = ['Artha Shashstra', 'Alejandra Rojas', 'Amari Zamora', 'Artha Shashstra'];
}
