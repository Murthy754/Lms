import { BsModalService, BsModalRef, ModalOptions } from "ngx-bootstrap/modal";
import { Component, OnInit } from "@angular/core";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { SpecificCommentsComponent } from "../specific-comments/specific-comments.component";
import { SpecificSubscribersComponent } from "../specific-subscribers/specific-subscribers.component";
import { forkJoin } from "rxjs";
import { CreatetopicService } from "./createtopic.service";
import { CookieService } from "ngx-cookie-service";
import { Router } from "@angular/router";
import { CameramodalComponent } from "../cameramodal/cameramodal.component";
import { UploadService } from "../shared-services/upload.service";
import { ModalComponent } from "../modal/modal.component";
import { MatCheckbox } from '@angular/material';
import { ViewChild } from '@angular/core';

var Grapheme = require("grapheme-splitter");
declare var $: any;
@Component({
  selector: "app-createnewtopic",
  templateUrl: "./createnewtopic.component.html",
  styleUrls: ["./createnewtopic.component.scss"],
  preserveWhitespaces: true
})
export class CreatenewtopicComponent implements OnInit {
  @ViewChild('myCheckBox', {static: false}) private myCheckbox: MatCheckbox;
  phoneVerified: boolean = false;
  searchData= "";
  selectedsubscriberss = [];
  selectedsubscriberssNames = [];
  selectedsubscriberssIds = [];
  FileUrls = [];
  allsubscribersIds = [];
  selectedsubscriberss_comment = [];
  selectedsubscriberss_commentNames = [];
  selectedsubscriberss_commentIds = [];
  activeMenu = "";
  ArticleInfo = [
    {
      Description: "",
      files: [],
      caption: "",
      urls: []
    }
  ];
  ArticleInfoData = [];
  loading = false;
  WordLength1 = 1;
  WordLength2 = 1;
  WordLength3 = 1;
  WordLength4 = 3;
  WordLength5 = 4;
  editorConfig = {
    editable: true,
    spellcheck: true,
    height: "80px",
    minHeight: "80px",
    width: "auto",
    minWidth: "0",
    maxHeight: "80px",
    translate: "yes",
    enableToolbar: true,
    showToolbar: true,
    imageEndPoint: "",
    placeholder: "",
    toolbar: [
      [
        "bold",
        "italic",
        "underline",
        "strikeThrough",
        "superscript",
        "subscript"
      ],
      ["fontName", "fontSize", "color"],
      [
        "justifyLeft",
        "justifyCenter",
        "justifyRight",
        "justifyFull",
        "indent",
        "outdent"
      ],
      [
        "paragraph",
        "blockquote",
        "removeBlockquote",
        "horizontalLine",
        "orderedList",
        "unorderedList"
      ],
      ["link", "unlink", "image", "video"]
    ]
  };
  Text = "";
  tags: any = [];
  WordLength = 0;
  countries: any;
  maxFileCount = false;
  maxFileError = false;
  filesArray = [];
  bsModalRef: BsModalRef;
  minDate = new Date().toISOString();
  Ccode;
  country;
  pollstatus = "Public";
  CreatePollForm: FormGroup;
  autocompleteItemsAsObjects = [
    { value: "Harsha", id: 0, extra: 0 },
    { value: "Vardhan", id: 1, extra: 1 },
    "Reddy"
  ];
  autocompleteItems = [{id:1,value:"News"}];
  siteName: string;
  constructor(
    private fb: FormBuilder,
    private modalService: BsModalService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private cService:CookieService,
    private createTopicService: CreatetopicService,
    private uploadService: UploadService
  ) {
    const navigationExtraData = this.router.getCurrentNavigation();
    const state = navigationExtraData.extras.state as {searchData: string};
    if (state) {
      this.searchData = state.searchData;      
    }
  }

  ngOnInit() {
    let link = window.location.pathname.split('/');
    if (link[1] === "privatesites") {
      this.siteName = link[2];
    }
    this.getData();
    var splitter = new Grapheme();
    $(document).ready(function() {
      $("#emojionearea11").emojioneArea({

        pickerPosition: "bottom",
        filtersPosition: "bottom",
        tones: false,
        autocomplete: "off",
        inline: true,
        events: {
          emojibtn_click: function(button, event) {
            document.getElementById(
              "wlen1"
            ).innerHTML = splitter.splitGraphemes(this.getText()).length;
            if(splitter.splitGraphemes(this.getText()).length==0){
              document.getElementById(
                "err1"
              ).innerHTML ="Options are required for Option1";
            }
            else{
              document.getElementById(
                "err1"
              ).innerHTML = "";
            }
          },
          keyup: function(button, event) {
            document.getElementById(
              "wlen1"
            ).innerHTML = splitter.splitGraphemes(this.getText()).length;
            if(splitter.splitGraphemes(this.getText()).length==0){
              document.getElementById(
                "err1"
              ).innerHTML ="Options are required  for Option1";
            }
            else{
              document.getElementById(
                "err1"
              ).innerHTML = "";
            }
          }
        }
      });
      $("#emojionearea22").emojioneArea({
        pickerPosition: "bottom",
        filtersPosition: "bottom",
        tones: false,
        autocomplete: false,
        inline: true,
        events: {
          emojibtn_click: function(button, event) {
            document.getElementById(
              "wlen2"
            ).innerHTML = splitter.splitGraphemes(this.getText()).length;
            if(splitter.splitGraphemes(this.getText()).length==0){
              document.getElementById(
                "err2"
              ).innerHTML ="Options are required  for Option2";
            }
            else{
              document.getElementById(
                "err2"
              ).innerHTML = "";
            }
          },
          keyup: function(button, event) {
            document.getElementById(
              "wlen2"
            ).innerHTML = splitter.splitGraphemes(this.getText()).length;
            if(splitter.splitGraphemes(this.getText()).length==0){
              document.getElementById(
                "err2"
              ).innerHTML ="Options are required  for Option2";
            }
            else{
              document.getElementById(
                "err2"
              ).innerHTML = "";
            }
          }
        }
      });
      $("#emojionearea33").emojioneArea({
        pickerPosition: "bottom",
        filtersPosition: "bottom",
        tones: false,
        autocomplete: false,
        inline: true,
        events: {
          emojibtn_click: function(button, event) {
            document.getElementById(
              "wlen3"
            ).innerHTML = splitter.splitGraphemes(this.getText()).length;
            if(splitter.splitGraphemes(this.getText()).length==0){
              document.getElementById(
                "err3"
              ).innerHTML ="Options are required  for Option3";
            }
            else{
              document.getElementById(
                "err3"
              ).innerHTML = "";
            }
          },
          keyup: function(button, event) {
            document.getElementById(
              "wlen3"
            ).innerHTML = splitter.splitGraphemes(this.getText()).length;
            if(splitter.splitGraphemes(this.getText()).length==0){
              document.getElementById(
                "err3"
              ).innerHTML ="Options are required  for Option3";
            }
            else{
              document.getElementById(
                "err3"
              ).innerHTML = "";
            }
          }
        }
      });
    });
    var date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    this.CreatePollForm = this.fb.group({
      commentstatus: ["Public", Validators.required],
      question: [this.searchData, Validators.required],
      disableComments: [false, Validators.required],
      topicExpiration: [false, Validators.required],
      country: ["India", Validators.required],
      pollstatus: ["Public", Validators.required],
      expires: [date, Validators.required],
      selectedCategories: [["News"],Validators.required],
      tags: [[]],
      pollOptionsType: ["Choice", Validators.required],
      Text1: ["👍", Validators.required],
      Text2: ["👎", Validators.required],
      Text3: ["😑", Validators.required],
      Text4: ["Low", Validators.required],
      Text5: ["High", Validators.required]
    });
    if (this.cService.get("userPollOptionsType")) {
      this.CreatePollForm.controls['pollOptionsType'].setValue(this.cService.get("userPollOptionsType"));
    }
    let disableComments = (this.cService.get("userPollDisableComments") === "true") ? true : false;
    if (disableComments) {
      this.CreatePollForm.controls['disableComments'].setValue(disableComments);
    }
    let pollExpire = this.cService.get("userPollExpiration");
    if (pollExpire){ 
      let value = (pollExpire === "true") ? true : false;
      this.CreatePollForm.controls['topicExpiration'].setValue(value);
    }
    let pollCategory = this.cService.get("userPollCategory");
    if (pollCategory.length > 0) {
      let category = [this.cService.get("userPollCategory")]
      this.CreatePollForm.controls["selectedCategories"].setValue(category);
    }
    let country = this.cService.get("userPollLocation");
    if (country.length > 0 && country !== "undefined") {
      this.CreatePollForm.controls["country"].setValue(country);
      this.country = country;
    }
  }

  ngAfterViewInit() {
    let value = (this.cService.get("userPhoneVerification") === "true") ? true : false;
    if (value) {
      this.myCheckbox.checked = value;
    }
  }

  getData() {
    return forkJoin(
      this.createTopicService.getJSON(),
      this.createTopicService.getCurrentIpLocation(),
      this.createTopicService.getCategories(),
      this.createTopicService.getTags({ privatesite: localStorage.getItem(this.siteName + "_siteUserId")})
    ).subscribe(data => {
      this.countries = data[0];
      this.Ccode = data[1];
      if(this.Ccode){
      const CountryObj: any = this.countries.filter(
        item => item.code.search(this.Ccode.iso_code) !== -1
      );
      this.country = CountryObj[0];
     }
      var categories: any = data[2];
      for (let data of categories) {
        this.autocompleteItems.push(data.name);
      }
      this.tags = data[3]["tags"];
    },
    (error=>{
      console.log(error);
    }));
  }
  UpdateWordLength(value) {
    this.WordLength = value.length;
    this.Text = value;
  }
  addsubscribers() {
    const initialState = {
      list: this.selectedsubscriberss,
      title: "Modal with component"
    };
    this.bsModalRef = this.modalService.show(SpecificSubscribersComponent, {
      initialState
    });
    this.bsModalRef.content.closeBtnName = "Close";
    this.bsModalRef.content.onClose = myData => {
      // Do something with myData and then hide
      this.selectedsubscriberss = myData;
      this.bsModalRef.hide();
      this.selectedsubscriberssIds = [];
      this.allsubscribersIds = [];
      this.selectedsubscriberssNames = [];
      for (let ss of this.selectedsubscriberss) {
        if (ss.ischecked) {
          this.selectedsubscriberssNames.push(
            ss.userdata.firstName + ss.userdata.lastName
          );
          this.selectedsubscriberssIds.push(ss.userdata._id);
        }
        this.allsubscribersIds.push(ss.userdata._id);
      }
    };
  }
  addcommentsubscribers() {
    const initialState = {
      list: this.selectedsubscriberss_comment,
      title: "Modal with component"
    };
    this.bsModalRef = this.modalService.show(SpecificCommentsComponent, {
      initialState
    });
    this.bsModalRef.content.closeBtnName = "Close";
    this.bsModalRef.content.onClose = myData => {
      // Do something with myData and then hide
      this.selectedsubscriberss_comment = myData;
      this.bsModalRef.hide();
      this.selectedsubscriberss_commentNames = [];
      this.selectedsubscriberss_commentIds = [];
      for (let ss of this.selectedsubscriberss_comment) {
        if (ss.ischecked) {
          this.selectedsubscriberss_commentNames.push(
            ss.userdata.firstName + ss.userdata.lastName
          );
          this.selectedsubscriberss_commentIds.push(ss.userdata._id);
        }
      }
    };
  }
  savePollData(type) {
    if (!type) {
      return;
    }
    var temp = 0;
    for (var i = 0; i < this.ArticleInfo.length; i++) {
      var tempFiles = [];
      for (var j = 0; j < this.ArticleInfo[i].files.length; j++) {
        tempFiles.push(this.FileUrls[temp++]);
      }
      var singleArticleData = {
        files: tempFiles,
        description: this.ArticleInfo[i].Description,
        caption: this.ArticleInfo[i].caption
      };
      if (singleArticleData.files.length !== 0 || singleArticleData.description !== "") {
        this.ArticleInfoData.push(singleArticleData);
      }
    }
    // Spliting the string by space and checking if it has any links included
    let splitQuestion = (this.CreatePollForm.controls["question"].value).split(" ");
    if (splitQuestion.length > 0) {
      splitQuestion.forEach(splitString => {
        this.validURL(splitString);
      });
    }
    var pollprivacy;
    var commentprivacy;
    var pollOptions = [];
    if (this.CreatePollForm.controls["pollOptionsType"].value === "Choice") {
      pollOptions = [
        (<HTMLInputElement>document.getElementById("emojionearea11")).value,
        (<HTMLInputElement>document.getElementById("emojionearea22")).value,
        (<HTMLInputElement>document.getElementById("emojionearea33")).value
      ];
    } else {
      pollOptions = [
        this.CreatePollForm.controls["Text4"].value,
        this.CreatePollForm.controls["Text5"].value
      ];
    }
    let pollOption = this.CreatePollForm.controls["pollOptionsType"].value;
    this.cService.set("userPollOptionsType", pollOption);
    if (this.CreatePollForm.controls["pollstatus"].value === "Public") {
      pollprivacy = {
        preference: "Public",
        subscribers: null
      };
    } else if (
      this.CreatePollForm.controls["pollstatus"].value === "Subscribers"
    ) {
      pollprivacy = {
        preference: "Subscribers",
        subscribers: this.allsubscribersIds
      };
    } else if (
      this.CreatePollForm.controls["pollstatus"].value ===
      "Specific_Subscribers"
    ) {
      pollprivacy = {
        preference: "Specific_Subscribers",
        subscribers: this.selectedsubscriberssIds
      };
    } else if (this.CreatePollForm.controls["pollstatus"].value === "Private") {
      pollprivacy = {
        preference: "Private",
        subscribers: null
      };
    }
    if (this.CreatePollForm.controls["commentstatus"].value === "Subscribers") {
      commentprivacy = {
        preference: "Subscribers",
        subscribers: this.allsubscribersIds
      };
    } else if (
      this.CreatePollForm.controls["commentstatus"].value === "Public"
    ) {
      commentprivacy = {
        preference: "Public",
        subscribers: null
      };
    } else if (
      this.CreatePollForm.controls["commentstatus"].value ===
      "Specific_Subscribers"
    ) {
      commentprivacy = {
        preference: "Specific_Subscribers",
        subscribers: this.selectedsubscriberss_commentIds
      };
    } else if (
      this.CreatePollForm.controls["commentstatus"].value === "Private"
    ) {
      commentprivacy = {
        preference: "Private",
        subscribers: null
      };
    }
    var tags = [];
    var categories = [];
    for (let tag of this.CreatePollForm.controls["tags"].value) {
      tags.push(tag.value);
    }
    for (let cat of this.CreatePollForm.controls["selectedCategories"].value) {
      if(cat.display)
      categories.push(cat.display);
      else
      categories.push(cat);
    }
    var createdFor={
      siteName:"",
      siteLogo:"",
      siteOwner:"",
      siteUsername:"",
      siteUserId:"",
  };
    var pollObject = {
      pollster: localStorage.getItem("userId"),
      question: this.CreatePollForm.controls["question"].value,
      status: "Open",
      disableComments: this.CreatePollForm.controls["disableComments"].value,
      pollOptionsType: this.CreatePollForm.controls["pollOptionsType"].value,
      categories: categories,
      tags: tags,
      expires: this.CreatePollForm.controls["expires"].value,
      articleInfo: this.ArticleInfoData,
      country: (this.CreatePollForm.controls["country"].value).name,
      pollOptions: pollOptions,
      pollCastCountByAnswer: {},
      targetCountryCountByAnswer: {},
      createdFor:createdFor,
      createdAt: new Date(),
      siteOwnerId:null,
      privateSite:false,
      privateSiteSubsOnly:false,
      verifiedVote: this.myCheckbox.checked,
      privacyOptions: {
        poll: pollprivacy,
        comment: commentprivacy
      },
      privateSiteId: localStorage.getItem('siteUserId')
    };
    this.cService.set("userPollDisableComments", this.CreatePollForm.controls["disableComments"].value);
    let country = this.CreatePollForm.controls["country"].value;
    this.cService.set("userPollLocation", country.name);
    this.cService.set("userPollCategory", pollObject.categories[0]);
    let value = this.CreatePollForm.controls["topicExpiration"].value;
    if (value) {
      this.cService.set("userPollExpiration", value);
      pollObject.expires = null;
    }
    if(this.cService.get('polltype')==='PrivateSite'){
      if (localStorage.getItem('userId') === localStorage.getItem(this.siteName + '_siteOwnerId')) {
        pollObject.pollster = localStorage.getItem(this.siteName + "_privateSiteUserId")
        pollObject.privateSite = true;
        pollObject.privateSiteSubsOnly = true;
        createdFor.siteLogo = localStorage.getItem(this.siteName + '_privateSiteLogo');
        createdFor.siteName = localStorage.getItem(this.siteName + '_privateSiteName');
        createdFor.siteUsername = localStorage.getItem(this.siteName + '_privateSiteUsername');
        createdFor.siteOwner = localStorage.getItem(this.siteName + '_privateSiteOwner');
        createdFor.siteUserId = localStorage.getItem(this.siteName + '_privateSiteUserId');
        pollObject.siteOwnerId = localStorage.getItem(this.siteName + '_privateSiteUserId');
      } else {
        pollObject.pollster = localStorage.getItem("userId");
        pollObject.privateSite = true;
        pollObject.privateSiteSubsOnly = true;
        createdFor.siteLogo = localStorage.getItem(this.siteName + '_privateSiteLogo');
        createdFor.siteName = localStorage.getItem(this.siteName + '_privateSiteName');
        createdFor.siteUsername = localStorage.getItem(this.siteName + '_privateSiteUsername');
        createdFor.siteOwner = localStorage.getItem(this.siteName + '_privateSiteOwner');
        createdFor.siteUserId = localStorage.getItem(this.siteName + '_siteUserId');
        pollObject.siteOwnerId = localStorage.getItem(this.siteName + '_siteUserId');
      }
    }
    this.createTopicService.saveQuickTopic(pollObject).subscribe(data => {
      if(this.cService.get('polltype')==='PrivateSite'){
        var siteName = localStorage.getItem(this.siteName + '_privateSiteName');
        this.router.navigateByUrl('/privatesites/' + siteName);
      } else {
        this.router.navigateByUrl("/home/recent?location=world");
      }
    },
    (error=>{
      console.log(error);
    }));
  }
  UploadFiles() {
    var count = 0;
    for (var i = 0; i < this.ArticleInfo.length; i++) {
      for (var j = 0; j < this.ArticleInfo[i].files.length; j++) {
        count++;
        var type = this.ArticleInfo[i].files[j].type;
        this.uploadService.uploadFile(this.ArticleInfo[i].files[j]).then(
          pased => {
            var single = {
              url: pased.Location,
              type: pased.type
            };
            this.FileUrls.push(single);
            if (count === this.FileUrls.length) {
              this.savePollData(true);
            }
          },
          err => {
            this.savePollData(false);
          }
        );
      }    
    }
  }
  saveTopicPoll() {
    var pollOptions = [
      (<HTMLInputElement>document.getElementById("emojionearea11")).value,
      (<HTMLInputElement>document.getElementById("emojionearea22")).value,
      (<HTMLInputElement>document.getElementById("emojionearea33")).value
    ];
    this.CreatePollForm.controls['Text1'].setValue(pollOptions[0]);
    this.CreatePollForm.controls['Text2'].setValue(pollOptions[1]);
    this.CreatePollForm.controls['Text3'].setValue(pollOptions[2]);
    if (!this.maxFileCount && !this.maxFileError && this.CreatePollForm.valid) {
      if (this.filesArray.length > 0) this.UploadFiles();
      else {
        this.FileUrls = [];
        this.savePollData(true);
      }
    }
    else{
      window.scrollTo(0,0);
    }
  }
  commentPrivacy() {}
  addNewArticle() {
    var ArticleInfo = {
      Description: "",
      files: [],
      caption: "",
      urls: []
    };
    this.ArticleInfo.push(ArticleInfo);
  }
  onFileChange(event, index) {
    this.maxFileCount = false;
    this.maxFileError = false;
    if (event.target.files.length >= 11) {
      this.maxFileCount = true;
      return;
    }
    Array.from(event.target.files).forEach(file => {
      this.filesArray.push(file);
    })
    // this.filesArray = event.target.files;
    for (var file of event.target.files) {
      if (file.size / Math.pow(1024, 2) >= 500) {
        this.maxFileError = true;
        return;
      }
      var singledata = {
        url: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file)),
        type: file.type
      };
      this.ArticleInfo[index].urls.push(singledata);
    }
    this.ArticleInfo[index].files = this.filesArray;
  }
  cleararticleModal(index) {
    this.ArticleInfo.splice(index, 1);
  }
  removeFile(i, ind) {
    var TempFileArray = [];
    this.ArticleInfo[i].urls.splice(ind, 1);
    for (var ii = 0; ii < this.ArticleInfo[i].files.length; ii++) {
      if (ii !== ind) {
        TempFileArray.push(this.ArticleInfo[i].files[ii]);
      }
    }
    this.ArticleInfo[i].files = TempFileArray;
  }
  UpdateWordLength4(value) {
    this.WordLength4 = value.length;
  }
  UpdateWordLength5(value) {
    this.WordLength5 = value.length;
  }
  sedit1() {
    this.CreatePollForm.controls["Text4"].enable();
    this.CreatePollForm.controls["Text5"].disable();
    this.activeMenu = "soption1";
  }
  sedit2() {
    this.CreatePollForm.controls["Text5"].enable();
    this.CreatePollForm.controls["Text4"].disable();
    this.activeMenu = "soption2";
  }
  takePhoto() {
    const initialState = {  // Opens camera modal popup
      list: [
        "Open a modal with component",
        "Pass your data",
        "Do something else",
        "..."
      ],
      title: "Modal with component"
    };
    this.cService.set('camType', "photo"); // 

    this.bsModalRef = this.modalService.show(CameramodalComponent, { initialState });
    this.bsModalRef.setClass("my-modal");
    this.bsModalRef.content.closeBtnName = "Close";
    this.bsModalRef.content.onClose = myData => {
      // Do something with myData and then hide
      this.bsModalRef.hide();
      // this.loading = true;
      // this.filesArray = this.urls;
      this.filesArray.push(myData)
      var singledata = {
        url: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(myData)),
        type: myData.type
      };
      this.ArticleInfo[0].urls.push(singledata);
      this.ArticleInfo[0].files = this.filesArray;
    };
  }
 
  takeVideo(type) {
    const initialState = {
      list: [
        "Open a modal with component",
        "Pass your data",
        "Do something else",
        "..."
      ],
      title: "Modal with component"
    };
    this.cService.set('camType', type);

    this.bsModalRef = this.modalService.show(CameramodalComponent, { initialState });
    this.bsModalRef.setClass("my-modal");
    this.bsModalRef.content.closeBtnName = "Close";
    this.bsModalRef.content.onClose = myData => {
      // Do something with myData and then hide
      this.bsModalRef.hide();
      this.filesArray.push(myData);
      var singledata = {
        url: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(myData)),
        type: myData.type
      };
      this.ArticleInfo[0].urls.push(singledata);
      this.ArticleInfo[0].files = this.filesArray;
    };
  }

  onVerificationOptionChange(event) {
    if (event.checked) {
      this.createTopicService.getUserProfileDetails(localStorage.getItem('userId')).subscribe((data) => {
        if (this.privateSiteCheck()) {
          let user = data[0];
          if (user.verifiedNumbersList.length > 0) {
            var numberExists = false;
            for (let i=0; i < user.verifiedNumbersList.length; i++) {
              if ((localStorage.getItem(this.siteName + "_siteUserId") === user.verifiedNumbersList[i]["privateSiteId"]) && user.verifiedNumbersList[i]["phoneVerified"]) {
                numberExists = true;
                this.phoneVerified = true;
                return;
              }
            }
            if (!numberExists) {
              this.openModalForPhoneVerification();
              return;
            }
          } else {
            this.openModalForPhoneVerification();
          }
        } else {
          if (data[0]["phoneVerified"]) {
            this.phoneVerified = true;
          } else {
            this.openModalForPhoneVerification();
          }
        }
      });
    }
  }

  openModalForPhoneVerification() {
    const config: ModalOptions = {
      backdrop: 'static',
      keyboard: false,
      animated: true,
      ignoreBackdropClick: true,
      initialState: {
        title: "Modal with component",
        checkbox: this.myCheckbox
      }
    };
    const initialState = {
      title: "Modal with component",
      checkbox: this.myCheckbox
    };
    this.bsModalRef = this.modalService.show(ModalComponent, config);
    this.bsModalRef.content.alertTitle = "Alert";
    this.bsModalRef.content.content = "Please verify your phone. You'll be redirected to verification page. Changes to topic creation will be lost.";
    this.bsModalRef.content.onClose = myData => {
      this.bsModalRef.hide();
      if (this.privateSiteCheck()) {
        this.router.navigateByUrl("privatesites/"+ this.siteName +"/phoneverification");   
      } else {
        this.router.navigateByUrl('/phoneverification');
      }    
    };
  }

  // Checks if question is a url and creates a article info
  validURL(str) {
    let regEx = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/gm; // regular expression for URL. protocols include (http and https).
    if (regEx.test(str)) { // Checking regular expression returning true or not for the input string.
      let articleInfo = {  // Creating article info object
        files: [],
        description: str
      };
      this.ArticleInfoData.push(articleInfo); // Pushing article info object to aritcleinfodata component array
      return;
    } else {
      return;
    }
  }

  // Checks if user is in private site
  privateSiteCheck() {
    let httpLink = window.location.pathname.split('/');
    if (localStorage.getItem("privateSite") === "true" && httpLink[1] === "privatesites") {
      return true;
    }
    return false;
  }
}
