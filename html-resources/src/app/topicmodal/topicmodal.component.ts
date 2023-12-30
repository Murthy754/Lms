import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router, NavigationExtras } from "@angular/router";
import { BsModalService, BsModalRef, ModalOptions } from "ngx-bootstrap/modal";
import { TopicmodalService } from "./topicmodal.service";
import { DomSanitizer } from "@angular/platform-browser";
import { AuthService } from "../auth.service";
import { CookieService } from "ngx-cookie-service";
import { SignupComponent } from "../signupmodal/signupmodal.component";
import { CameramodalComponent } from '../cameramodal/cameramodal.component';
import { UploadService } from "../shared-services/upload.service";
import { CreatetopicService } from "../createnewtopic/createtopic.service";
import { MatCheckbox } from '@angular/material';
import { ModalComponent } from '../modal/modal.component';

var Grapheme = require("grapheme-splitter");
declare var $: any;

@Component({
  selector: "app-topicmodal",
  templateUrl: "./topicmodal.component.html",
  styleUrls: ["./topicmodal.component.scss"]
})
export class TopicmodalComponent implements OnInit {
  @ViewChild('myCheckBox', {static: false}) private myCheckbox: MatCheckbox;
  autocompleteItems = [];
  phoneVerified: boolean = false;
  searchData = "";
  squestion: any;
  WordLength = 0;
  FilesArray = [];
  countries: any;
  urls: any;
  bsModalRef: BsModalRef
  FinishUpload = 0;
  FileUrls = [];
  minDate = new Date();
  Ccode;
  maxFileError = false;
  maxFileCount = false;
  country;
  QuickTopicCreate: FormGroup;
  secondMinDate = this.minDate;
  WordLength1 = 1;
  WordLength2 = 1;
  WordLength3 = 1;
  WordLength4 = 3;
  WordLength5 = 4;
  Text1 = "";
  Text2 = "";
  Text3 = "";
  siteName: string;
  articleInfoData = [];
  articleInfo = "";
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

  constructor(
    private fb: FormBuilder,
    private modalService: BsModalService,
    private router: Router,
    private bsRef: BsModalRef,
    private TopicServe: TopicmodalService,
    private cService: CookieService,
    private sanitizer: DomSanitizer,
    public authserve: AuthService,
    private uploadService: UploadService,
    private createTopicService: CreatetopicService
  ) { }


  async ngOnInit() {
    let link = window.location.pathname.split('/');
    if (link[1] === "privatesites") {
      this.siteName = link[2];
    }
    var splitter = new Grapheme();
    if (this.cService.get('polltype') === 'PrivateSite') {
      // console.log(localStorage.getItem('privateSiteSubsOnly'));
    }
    $(document).ready(function () {
      $("#emojionearea11").emojioneArea({
        pickerPosition: "bottom",
        filtersPosition: "bottom",
        tones: false,
        autocomplete: false,
        inline: true,
        events: {
          emojibtn_click: function (button, event) {
            document.getElementById(
              "wlen1"
            ).innerHTML = splitter.splitGraphemes(this.getText()).length;
            if (splitter.splitGraphemes(this.getText()).length == 0) {
              document.getElementById(
                "err1"
              ).innerHTML = "Options are required for Option1";
            }
            else {
              document.getElementById(
                "err1"
              ).innerHTML = "";
            }
          },
          keyup: function (button, event) {
            document.getElementById(
              "wlen1"
            ).innerHTML = splitter.splitGraphemes(this.getText()).length;
            if (splitter.splitGraphemes(this.getText()).length == 0) {
              document.getElementById(
                "err1"
              ).innerHTML = "Options are required for Option1";
            }
            else {
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
          emojibtn_click: function (button, event) {
            document.getElementById(
              "wlen2"
            ).innerHTML = splitter.splitGraphemes(this.getText()).length;
            if (splitter.splitGraphemes(this.getText()).length == 0) {
              document.getElementById(
                "err2"
              ).innerHTML = "Options are required for Option2";
            }
            else {
              document.getElementById(
                "err2"
              ).innerHTML = "";
            }
          },
          keyup: function (button, event) {
            document.getElementById(
              "wlen2"
            ).innerHTML = splitter.splitGraphemes(this.getText()).length;
            if (splitter.splitGraphemes(this.getText()).length == 0) {
              document.getElementById(
                "err2"
              ).innerHTML = "Options are required for Option2";
            }
            else {
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
          emojibtn_click: function (button, event) {
            document.getElementById(
              "wlen3"
            ).innerHTML = splitter.splitGraphemes(this.getText()).length;
            if (splitter.splitGraphemes(this.getText()).length == 0) {
              document.getElementById(
                "err3"
              ).innerHTML = "Options are required for Option3";
            }
            else {
              document.getElementById(
                "err3"
              ).innerHTML = "";
            }
          },
          keyup: function (button, event) {
            document.getElementById(
              "wlen3"
            ).innerHTML = splitter.splitGraphemes(this.getText()).length;
            if (splitter.splitGraphemes(this.getText()).length == 0) {
              document.getElementById(
                "err3"
              ).innerHTML = "Options are required for Option3";
            }
            else {
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
    this.QuickTopicCreate = this.fb.group({
      expires: [date, Validators.required],
      question: [this.searchData, Validators.required],
      pollOptionsType: ["Choice", Validators.required],
      selectedCategories: [["News"],Validators.required],
      tags: [[]],
      Text1: ["👍", Validators.required],
      Text2: ["👎", Validators.required],
      Text3: ["😑", Validators.required],
      Text4: ["Low", Validators.required],
      Text5: ["High", Validators.required],
      disableComments: [false, Validators.required],
      topicExpiration: [false, Validators.required],
      description: [""]
    });

    await this.createTopicService.getCategories().subscribe((response) => {
      var categories: any = response;
      for (let data of categories) {
        this.autocompleteItems.push(data.name);
      }
    })

    if (this.cService.get("userPollOptionsType")) {
      this.QuickTopicCreate.controls['pollOptionsType'].setValue(this.cService.get("userPollOptionsType"));
    }
    let disableComments = (this.cService.get("userPollDisableComments") === "true") ? true : false;
    if (disableComments) {
      this.QuickTopicCreate.controls['disableComments'].setValue(disableComments);
    }

    let pollCategory = this.cService.get("userPollCategory");
    if (pollCategory.length > 0) {
      let category = [this.cService.get("userPollCategory")]
      this.QuickTopicCreate.controls["selectedCategories"].setValue(category);
    }

    let pollExpire = this.cService.get("userPollExpiration");
    if (pollExpire){ 
      let value = (pollExpire === "true") ? true : false;
      this.QuickTopicCreate.controls['topicExpiration'].setValue(value);
    }

    this.QuickTopicCreate.controls["Text4"].disable();
    this.QuickTopicCreate.controls["Text5"].disable();
    this.TopicServe.getJSON().subscribe(data => {
      this.countries = data;
      this.TopicServe.getCurrentIpLocation().subscribe(res => {
         
        this.Ccode = res;
        if (this.Ccode && this.Ccode.iso_code) {
          const CountryObj: any = this.countries.filter(
            item => item.code.search(this.Ccode.iso_code) !== -1
          );
          this.country = CountryObj[0];
        }else{
          this.country={name:"United States"};
        }
        let country = this.cService.get("userPollLocation");
        if (country.length > 0 && country !== "undefined" ) {
          this.country = country;
        }
        if (this.Ccode) {
        }
      },
      (error=>{
        console.log(error);
      }));
    },
    (error=>{
      console.log(error);
    }));

    this.createTopicService.getTags({ privatesite: localStorage.getItem(this.siteName + "_siteUserId")}).subscribe((response) => {
      this.tags = response["tags"];
    });
  }

  ngAfterViewInit() {
    let value = (this.cService.get("userPhoneVerification") === "true") ? true : false;
    if (value) {
      this.myCheckbox.checked = value;
    }
  }

  openModalWithComponent(bool) {
    const initialState = {
      list: [
        "Open a modal with component",
        "Pass your data",
        "Do something else",
        "..."
      ],
      title: "Modal with component"
    };
    this.bsModalRef = this.modalService.show(SignupComponent, { initialState });
    this.bsModalRef.setClass("my-modal");
    this.bsModalRef.content.closeBtnName = "Close";
    this.bsModalRef.content.showSignup = bool;
  }

  cancel() {
    this.bsRef.hide();
  }
  onFileChange(event) {
    this.maxFileCount = false;
    this.maxFileError = false;
    // this.urls = [];
    if (event.target.files.length >= 11) {
      this.maxFileCount = true;
      return;
    }
    Array.from(event.target.files).forEach(file => {
      this.FilesArray.push(file);
    })
    // this.FilesArray.push(event.target.files);
    for (var file of event.target.files) {
      if (file.size / Math.pow(1024, 2) >= 500) {
        this.maxFileError = true;
        return;
      }
      var singledata = {
        url: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file)),
        type: file.type
      };
      if (this.urls === undefined) {
        this.urls = [];
      }
      this.urls.push(singledata);
    }
  }
  getPreviewUrl(data) {
    var reader = new FileReader();
    reader.readAsDataURL(data);
    reader.onload = (event: any) => {
      // called once readAsDataURL is completed
      return event.target.result;
    };
  }
  UpdateTextArea(val) {
    this.WordLength = val.length;
  }
  toggled: boolean = false;
  handleSelection(event) {
    this.QuickTopicCreate.controls["Text1"].setValue(
      this.QuickTopicCreate.controls["Text1"].value + event.char
    );
  }
  UpdateWordLength1(value) {
    this.WordLength1 = value.length;
  }
  UpdateWordLength2(value) {
    this.WordLength2 = value.length;
  }
  UpdateWordLength3(value) {
    this.WordLength3 = value.length;
  }
  UpdateWordLength4(value) {
    this.WordLength4 = value.length;
  }
  UpdateWordLength5(value) {
    this.WordLength5 = value.length;
  }
  removeFile(index) {
    var TempFileArray = [];
    this.urls.splice(index, 1);
    for (var i = 0; i < this.FilesArray.length; i++) {
      if (i !== index) {
        TempFileArray.push(this.FilesArray[i]);
      }
    }
    this.FilesArray = TempFileArray;
  }
  edit1() { }
  edit2() { }
  edit3() { }
  UploadFiles() {
    var temp = this;
     
    for (var i = 0; i < this.FilesArray.length; i++) {
      var type = this.FilesArray[i].type;
      this.uploadService.uploadFile(this.FilesArray[i]).then(
        pased => {
          var single = {
            url: pased.Location,
            type: pased.type
          };
          this.FileUrls.push(single);
          if (this.FilesArray.length === this.FileUrls.length) {
            this.SavePollData(true);
          }
        },
        err => {
        }
      );
    }
  }
  SavePollData(flag) {
     
    if (!flag) {
      this.authserve.display(false);
       
      return;
    }
    var pollOptions = [];
    if (this.QuickTopicCreate.controls["pollOptionsType"].value === "Choice") {
      pollOptions = [
        (<HTMLInputElement>document.getElementById("emojionearea11")).value,
        (<HTMLInputElement>document.getElementById("emojionearea22")).value,
        (<HTMLInputElement>document.getElementById("emojionearea33")).value
      ];
    } else {
      pollOptions = [
        this.QuickTopicCreate.controls["Text4"].value,
        this.QuickTopicCreate.controls["Text5"].value
      ];
    }
    let pollOption = this.QuickTopicCreate.controls["pollOptionsType"].value;
    this.cService.set("userPollOptionsType", pollOption);
    let obj = {
      files: this.FileUrls,
      // description: this.QuickTopicCreate.controls["description"].value
      description: this.articleInfo
    };
    if (obj.files.length !== 0 || obj.description !== "") {
      this.articleInfoData.push(obj);
    }
    let splitQuestion = (this.QuickTopicCreate.controls["question"].value).split(" ");
    if (splitQuestion.length > 0) {
      splitQuestion.forEach(splitString => {
        this.validURL(splitString);
      });
    }

    let tags = [];
    var categories = [];
    for (let tag of this.QuickTopicCreate.controls["tags"].value) {
      tags.push(tag.value);
    }
    for (let cat of this.QuickTopicCreate.controls["selectedCategories"].value) {
      if(cat.display)
      categories.push(cat.display);
      else
      categories.push(cat);
    }

    var createdFor = {
      siteName: "",
      siteLogo: "",
      siteOwner: "",
      siteUsername: "",
      siteUserId: "",
    };
    var pollObject = {

      pollster: localStorage.getItem("userId"),
      question: this.QuickTopicCreate.controls["question"].value,
      disableComments: this.QuickTopicCreate.controls["disableComments"].value,
      status: "Open",
      pollOptionsType: this.QuickTopicCreate.controls["pollOptionsType"].value,
      categories: categories,
      tags: tags,
      pollOptions: pollOptions,
      expires: this.QuickTopicCreate.controls["expires"].value,
      articleInfo: this.articleInfoData,
      country: this.country.name,
      createdFor: createdFor,
      createdAt: new Date(),
      siteOwnerId: null,
      privateSite: false,
      privateSiteSubsOnly: false,
      verifiedVote: this.myCheckbox.checked,
      privacyOptions: {
        poll: {
          preference: "Public",
          subscribers: null
        },
        comment: {
          preference: "Public",
          subscribers: null
        }
      },
      privateSiteId: localStorage.getItem(this.siteName + '_siteUserId')
    };
    this.cService.set("userPollDisableComments", this.QuickTopicCreate.controls["disableComments"].value);
    this.cService.set("userPollLocation", this.country.name);
    let value = this.QuickTopicCreate.controls["topicExpiration"].value
    if (value) {
      this.cService.set("userPollExpiration", value);
      pollObject.expires = null;
    }

    if (this.cService.get('polltype') === 'PrivateSite') {
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
    // console.log(pollObject);
    this.TopicServe.saveQuickTopic(pollObject).subscribe(data => {
      // console.log(data);
      if (data["error"]) {
        this.openModalWithComponent(false);
      }
      this.authserve.display(false);
      this.bsRef.hide();
       
      if (this.privateSiteCheck()) {
        this.router.navigateByUrl('/privatesites/' + localStorage.getItem(this.siteName + '_privateSiteName'));
      } else {
        this.router.navigateByUrl('/', { skipLocationChange: true}).then(() => {
          this.router.navigateByUrl("/home/recent?location=world");
        });
      }
    },
    (error=>{
      console.log(error);
       
    }));
  }
  saveTopicModal() {
    var pollOptions = [
      (<HTMLInputElement>document.getElementById("emojionearea11")).value,
      (<HTMLInputElement>document.getElementById("emojionearea22")).value,
      (<HTMLInputElement>document.getElementById("emojionearea33")).value
    ];
    this.QuickTopicCreate.controls['Text1'].setValue(pollOptions[0]);
    this.QuickTopicCreate.controls['Text2'].setValue(pollOptions[1]);
    this.QuickTopicCreate.controls['Text3'].setValue(pollOptions[2]);
    this.FinishUpload = 0;
    if (
      !this.maxFileCount &&
      !this.maxFileError &&
      this.QuickTopicCreate.valid
    ) {
      this.authserve.display(true);
      if (this.FilesArray.length > 0) this.UploadFiles();
      else {
        this.FileUrls = [];
        this.SavePollData(true);
      }
    }
    else {
      // window.scrollTo(0,0);
    }
  }
  gotoTopic() {
    this.bsRef.hide();
    var navigationExtras: NavigationExtras = { state: { searchData: this.QuickTopicCreate.controls['question'].value } };
    this.router.navigate(["/topic/new/start"], navigationExtras);
    var siteName = localStorage.getItem(this.siteName + '_privateSiteName');
    if (siteName) {
      this.router.navigate(["/privatesites/" + siteName + "/topic/new/start"], navigationExtras);
    }
  }
  activeMenu = "";
  sedit1() {
    this.QuickTopicCreate.controls["Text4"].enable();
    this.QuickTopicCreate.controls["Text5"].disable();
    this.activeMenu = "soption1";
  }
  sedit2() {
    this.QuickTopicCreate.controls["Text5"].enable();
    this.QuickTopicCreate.controls["Text4"].disable();
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
      //  
      // this.FilesArray = this.urls;
      this.FilesArray.push(myData)
      var singledata = {
        url: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(myData)),
        type: myData.type
      };
      if (this.urls === undefined) {
        this.urls = [];
      }
      this.urls.push(singledata);
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
      this.FilesArray.push(myData);
      var singledata = {
        url: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(myData)),
        type: myData.type
      };
      if (this.urls === undefined) {
        this.urls = [];
      }
      this.urls.push(singledata)
    };
  }

  // Checks in DB whether the user has phone number or not
  onVerificationOptionChange(event) {
    this.cService.set("userPhoneVerification", event.checked);
    if (event.checked) {
      let id = localStorage.getItem('userId')
      if (this.privateSiteCheck()) {
        id = localStorage.getItem(this.siteName + "_siteOwnerId")
      }
      this.createTopicService.getUserProfileDetails(id).subscribe((data) => {
        if (this.privateSiteCheck()) {
          let user = data[0];
          if (user.verifiedNumbersList.length > 0) {
            var numberExists = false;
            for (let i=0; i < user.verifiedNumbersList.length; i++) {
              if ((localStorage.getItem(this.siteName + "_siteUserId") === user.verifiedNumbersList[i]["privateSiteId"]) && user.verifiedNumbersList[i]["phoneVerified"]) {
                if (user.verifiedNumbersList[i]["phoneVerified"]) {
                  numberExists = true;
                  this.phoneVerified = true;
                  return;
                }
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
      this.bsRef.hide();
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
      this.articleInfoData.push(articleInfo); // Pushing article info object to aritcleinfodata component array
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
}
