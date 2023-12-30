import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { EdittopicService } from "./edittopic.service";
import { Router, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef, ModalOptions } from "ngx-bootstrap/modal";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { SpecificCommentsComponent } from "../specific-comments/specific-comments.component";
import { SpecificSubscribersComponent } from "../specific-subscribers/specific-subscribers.component";
import { forkJoin } from "rxjs";
import { CreatetopicService } from "../createnewtopic/createtopic.service";
import { UploadService } from "../shared-services/upload.service";
import { MatCheckbox } from '@angular/material';
import { ModalComponent } from '../modal/modal.component';

var Grapheme = require("grapheme-splitter");
declare var $: any;
@Component({
  selector: "app-edittopic",
  templateUrl: "./edittopic.component.html",
  styleUrls: ["./edittopic.component.scss"]
})
export class EdittopicComponent implements OnInit {
  @ViewChild('myCheckBox', {static: false}) private myCheckbox: MatCheckbox;
  phoneVerified: boolean = false;
  CreatePollForm: FormGroup;
  selectedsubscriberss = [];
  selectedsubscriberssNames = [];
  selectedsubscriberssIds = [];
  FileUrls = [];
  editquestion = false;
  allsubscribersIds = [];
  selectedsubscriberss_comment = [];
  pollCastCount = 0;
  selectedsubscriberss_commentNames = [];
  selectedsubscriberss_commentIds = [];
  activeMenu = "";
  poll: any = [];
  ArticleInfo: any = [];
  ArticleInfoEdit: any = [
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
  tags: any = [];
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
  WordLength = 0;
  countries: any;
  maxFileCount = false;
  maxFileError = false;
  FilesArray = [];
  bsModalRef: BsModalRef;
  minDate = new Date().toISOString();
  Ccode;
  country;
  pollstatus = "Public";
  autocompleteItemsAsObjects = [
    { value: "Harsha", id: 0, extra: 0 },
    { value: "Vardhan", id: 1, extra: 1 },
    "Reddy"
  ];
  autocompleteItems = [];
  siteName: string;
  constructor(
    private eService: EdittopicService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private sanitizer: DomSanitizer,
    private createTopicService: CreatetopicService,
    private uploadService: UploadService,
    private el: ElementRef
    // private bsRef: BsModalRef
  ) {}

  ngOnInit() {
    let link = window.location.pathname.split("/");
    if (link[1] === "privatesites") {
      this.siteName = link[2];
    }
    var splitter = new Grapheme();
    $(document).ready(function() {
      $("#emojionearea11").emojioneArea({
        pickerPosition: "bottom",
        filtersPosition: "bottom",
        tones: false,
        autocomplete: false,
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
              ).innerHTML ="Options are required for Option1";
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
              ).innerHTML ="Options are required  for Option2";
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
              ).innerHTML ="Options are required  for Option2";
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
    this.CreatePollForm = this.fb.group({
      commentstatus: ["Public", Validators.required],
      question: ["", Validators.required],
      disableComments: ["", Validators.required],
      topicExpiration: [false, Validators.required],
      country: ["India", Validators.required],
      pollstatus: ["Public", Validators.required],
      expires: ["", Validators.required],
      selectedCategories: [[], Validators.required],
      tags: [[], []],
      pollOptionsType: ["Choice", Validators.required],
      Text1: ["", Validators.required],
      Text2: ["", Validators.required],
      Text3: ["", Validators.required],
      Text4: ["", Validators.required],
      Text5: ["", Validators.required]
    });
    this.route.params.subscribe(params => {
      this.getData(params["id"]);
    });
  }
  getData(id) {
    return forkJoin(
      this.createTopicService.getJSON(),
      this.createTopicService.getCurrentIpLocation(),
      this.createTopicService.getCategories(),
      this.eService.getPollInfo(id),
      this.eService.getPrivatePollInfo(id),
      this.createTopicService.getTags({ privatesite: localStorage.getItem(this.siteName + "_siteUserId")})
    ).subscribe(data => {
      this.countries = data[0];
      this.Ccode = data[1];
      const CountryObj: any = this.countries.filter(
        item => item.code.search(this.Ccode.iso_code) !== -1
      );
      this.country = CountryObj[0];
      var categories: any = data[2];
      for (let data of categories) {
        this.autocompleteItems.push(data.name);
      }
      this.poll = data[3];
      if (localStorage.getItem(this.siteName + "_privateSiteUserId")) {
        this.poll = data[4];
      }
      this.tags = data[5]["tags"];
      if (this.poll[0].articleInfo != null) {
        this.poll[0].articleInfo.forEach(artile => {
          var Description= "";
          var caption= "";
          var urls= [];
          if (artile.description) {
            Description = artile.description;
          }
          if (artile.caption) {
            caption = artile.caption;
          }
          if (artile.files) {
            urls = artile.files;
          }
          var tempObj = {
            description: Description,
            files: [],
            caption: caption,
            urls: urls,
            tempurls: []
          };
          this.ArticleInfo.push(tempObj);
        });
      } else {
        this.addNewArticle();
	  }
	  if (this.poll[0].pollOptionsType === "Choice") {
		this.CreatePollForm.controls["Text1"].setValue(this.poll[0].pollOptions[0]);
		this.CreatePollForm.controls["Text2"].setValue(this.poll[0].pollOptions[1]);
		this.CreatePollForm.controls["Text3"].setValue(this.poll[0].pollOptions[2]);
		this.CreatePollForm.controls["Text4"].setValue("Low");
		this.CreatePollForm.controls["Text5"].setValue("High");
		} else {
		this.CreatePollForm.controls["Text1"].setValue("👍");
		this.CreatePollForm.controls["Text2"].setValue("👎");
		this.CreatePollForm.controls["Text3"].setValue("😑");
		this.CreatePollForm.controls["Text4"].setValue(this.poll[0].pollOptions[0]);
		this.CreatePollForm.controls["Text5"].setValue(this.poll[0].pollOptions[1]);
		}
      // this.ArticleInfo = this.poll[0].articleInfo;
      this.CreatePollForm.controls["country"].setValue((this.poll[0].country) ? this.poll[0].country : localStorage.getItem('country'));
      this.CreatePollForm.controls["question"].setValue(this.poll[0].question);
      this.WordLength = this.poll[0].question.length;
      this.CreatePollForm.controls["pollOptionsType"].setValue(
        this.poll[0].pollOptionsType
      );
      this.pollCastCount = this.poll[0].pollCastCount;
      if (this.pollCastCount > 0) {
        this.CreatePollForm.controls["question"].disable();
        this.CreatePollForm.controls["pollOptionsType"].disable();
        this.CreatePollForm.controls["Text1"].disable();
        this.CreatePollForm.controls["Text2"].disable();
        this.CreatePollForm.controls["Text3"].disable();
        this.CreatePollForm.controls["Text4"].disable();
        this.CreatePollForm.controls["Text5"].disable();

      }
      this.CreatePollForm.controls["expires"].setValue(this.poll[0].expires);
      if (this.poll[0].expires === null)  {
        let date = new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate());
        this.CreatePollForm.controls["expires"].setValue(date);
        this.CreatePollForm.controls["topicExpiration"].setValue(true);
      }
      this.CreatePollForm.controls["pollstatus"].setValue(
        this.poll[0].privacyOptions.poll.preference
      );
      this.CreatePollForm.controls["commentstatus"].setValue(
        this.poll[0].privacyOptions.comment.preference
      );
      this.CreatePollForm.controls["disableComments"].setValue(
        this.poll[0].disableComments
      );
      this.CreatePollForm.controls["tags"].setValue(this.poll[0].tags);
      this.CreatePollForm.controls["selectedCategories"].setValue(
        this.poll[0].categories
      );

      this.myCheckbox.checked = this.poll[0].verifiedVote;

    },
    (error=>{
      console.log(error);
    }));
  }
  onFileChange(event, index) {
    this.maxFileCount = false;
    this.maxFileError = false;
    if (event.target.files.length >= 11) {
      this.maxFileCount = true;
      return;
    }
    this.FilesArray = event.target.files;
    for (var file of this.FilesArray) {
      if (file.size / Math.pow(1024, 2) >= 500) {
        this.maxFileError = true;
        return;
      }
      var singledata = {
        url: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file)),
        type: file.type
      };
      this.ArticleInfo[index].tempurls.push(singledata);
    }
    this.ArticleInfo[index].files = this.FilesArray;
  }

  UpdateWordLength(value) {
    this.WordLength = value.length;
    this.Text = value;
  }
  cleararticleModal(index) {
    this.ArticleInfo.splice(index, 1);
  }
  removeFileFromSaved(data,i, index) {
    this.ArticleInfo[i].urls.splice(index, 1);
  }
  removeFile(i, ind) {
    var TempFileArray = [];
    this.ArticleInfo[i].tempurls.splice(ind, 1);
    for (var ii = 0; ii < this.ArticleInfo[i].files.length; ii++) {
      if (ii !== ind) {
        TempFileArray.push(this.ArticleInfo[i].files[ii]);
      }
    }
    this.ArticleInfo[i].files = TempFileArray;
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
  savePollData(type) {
    this.scrollToFirstInvalidControl();

    if (!type) {
      return;
    }
    var temp = 0;

    for (var i = 0; i < this.ArticleInfo.length; i++) {
      var tempFiles = this.ArticleInfo[i].urls;
      for (var j = 0; j < this.ArticleInfo[i].files.length; j++) {
        tempFiles.push(this.FileUrls[temp++]);
      }
      var singleArticleData = {
        files: tempFiles,
        description: this.ArticleInfo[i].description,
        caption: this.ArticleInfo[i].caption,
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
    if (
      this.CreatePollForm.controls["tags"].value &&
      this.CreatePollForm.controls["tags"].value.length > 0
    ) {
      for (let tag of this.CreatePollForm.controls["tags"].value) {
        if (tag.value !== undefined) tags.push(tag.value);
        else tags.push(tag);
      }
    }
    if (
      this.CreatePollForm.controls["selectedCategories"].value &&
      this.CreatePollForm.controls["selectedCategories"].value.length > 0
    ) {
      for (let cat of this.CreatePollForm.controls["selectedCategories"].value) {
        if(cat.display)
        categories.push(cat.display);
        else
        categories.push(cat);
      }
    }
    var pollObject = {
      pollster: localStorage.getItem("userId"),
      question: this.CreatePollForm.controls["question"].value,
      status: "Open",
      pollOptionsType: this.CreatePollForm.controls["pollOptionsType"].value,
      disableComments: this.CreatePollForm.controls["disableComments"].value,
      categories: categories,
      tags: tags,
      expires: this.CreatePollForm.controls["expires"].value,
      articleInfo: this.ArticleInfoData,
      country: this.CreatePollForm.controls["country"].value.name?this.CreatePollForm.controls["country"].value.name:this.CreatePollForm.controls["country"].value,
      pollOptions: pollOptions,
      verifiedVote: this.myCheckbox.checked,
      privacyOptions: {
        poll: pollprivacy,
        comment: commentprivacy
      },
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    };

    if (this.CreatePollForm.controls["topicExpiration"].value) {
      pollObject.expires = null;
    }

    if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
      pollObject.pollster = localStorage.getItem(this.siteName + '_privateSiteUserId');
    }
    this.eService.upDatePoll(pollObject, this.poll[0]._id).subscribe(data => {
      if (this.privateSiteCheck()) {
        var siteName = localStorage.getItem(this.siteName + '_privateSiteName');
        this.router.navigateByUrl("/privatesites/" + siteName);
      } else {
        this.router.navigateByUrl("/home/recent?location=world");
      }
    },
    (error=>{
      console.log(error);
    }));
  }

  private scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
      "form .ng-invalid"
    );

    window.scroll({
      top: this.getTopOffset(firstInvalidControl),
      left: 0,
      behavior: "smooth"
    });
  }

  private getTopOffset(controlEl: HTMLElement): number {
    const labelOffset = 50;
    if (!controlEl) {
      return;
    }
    return controlEl.getBoundingClientRect().top + window.scrollY - labelOffset;
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
              type: type
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
  addNewArticle() {
    var ArticleInfo = {
      description: "",
      files: [],
      caption: "",
      urls: [],
      tempurls: []
    };
    this.ArticleInfo.push(ArticleInfo);
  }
  saveTopicPoll() {
    // this.scrollToFirstInvalidControl();

    var pollOptions = [
      (<HTMLInputElement>document.getElementById("emojionearea11")).value,
      (<HTMLInputElement>document.getElementById("emojionearea22")).value,
      (<HTMLInputElement>document.getElementById("emojionearea33")).value
    ];
    this.CreatePollForm.controls['Text1'].setValue(pollOptions[0]);
    this.CreatePollForm.controls['Text2'].setValue(pollOptions[1]);
    this.CreatePollForm.controls['Text3'].setValue(pollOptions[2]);
    if (!this.maxFileCount && !this.maxFileError && this.CreatePollForm.valid)  {
      if (this.FilesArray.length > 0) {
        this.UploadFiles();
      } else {
        this.FileUrls = [];
        this.savePollData(true);
      }
    }
    else{
      // window.scrollTo(0,0);
      this.scrollToFirstInvalidControl();
    }
  }

  // Checks in DB whether the user has phone number or not
  onVerificationOptionChange(event) {
    if (this.poll[0].verifiedVote && this.pollCastCount > 0) {
      this.myCheckbox.checked = true;
      return;
    } else {
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
      for(let i=0; i < this.ArticleInfoData.length; i++) {
        if (!this.ArticleInfo[i]) {
          return;
        }
        if (this.ArticleInfo[i]["description"] === str) {
          return;
        } else {
          this.ArticleInfoData.push(articleInfo); // Pushing article info object to aritcleinfodata component array
        }
      }
      return;
    } else {
      return;
    }
  }

  // Checks if user is in private site
  privateSiteCheck() {
    let httpLink = window.location.pathname.split('/');
    if (localStorage.getItem("privateSite") === "true" && httpLink[1] === "privatesites") { // Checks localStorage and parses current page link
      return true;
    }
    return false;
  }

  editQuestionToggle() {
    if (this.pollCastCount < 1) {
      this.editquestion = !this.editquestion;
    }
  }
}
