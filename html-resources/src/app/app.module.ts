import { BrowserModule }                          from "@angular/platform-browser";
import { NgModule }                               from "@angular/core";
import { NgbModule }                              from "@ng-bootstrap/ng-bootstrap";
import { AppRoutingModule }                       from "./app-routing.module";
import { AppComponent }                           from "./app.component";
import { HeaderComponent }                        from "./header/header.component";
import { SignupComponent }                        from "./signupmodal/signupmodal.component";
import { BrowserAnimationsModule }                from "@angular/platform-browser/animations";
import { ModalModule }                            from "ngx-bootstrap";
import { FormsModule, ReactiveFormsModule }       from "@angular/forms";
import { SignUpComponent }                        from "./sign-up/sign-up.component";
import { NgSelectModule }                         from "@ng-select/ng-select";
import { NgxPaginationModule }                    from "ngx-pagination";
import { SignUpService }                          from "./sign-up/sign-up.service";
import { HttpClientModule, HTTP_INTERCEPTORS }     from "@angular/common/http";
import { Ng5SliderModule }                        from "ng5-slider";
import { NgxEditorModule }                        from "ngx-editor";
import { SignupmodalService }                     from "./signupmodal/signupmodal.service";
import { CookieService }                          from "ngx-cookie-service";
import { SigupheaderComponent }                   from "./sigupheader/sigupheader.component";
import { EmailVerifyComponent }                   from "./email-verify/email-verify.component";
import { AuthService }                            from "./auth.service";
import { ForgotComponent }                        from "./forgot/forgot.component";
import { ForgotUsernameComponent }                from "./forgot-username/forgot-username.component";
import { ForgotPasswordComponent }                from "./forgot-password/forgot-password.component";
import { ForgotDoneComponent }                    from "./forgot-done/forgot-done.component";
import { EmailverificationComponent }             from "./emailverification/emailverification.component";
import { RecoverpasswordComponent }               from "./recoverpassword/recoverpassword.component";
import { ForgotService }                          from "./forgot-username/forgot.service";
import { TopicmodalComponent }                    from "./topicmodal/topicmodal.component";
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HttpInterceptorService }                 from './authentication/http-interceptor.service';
import { BsModalService }                         from "ngx-bootstrap/modal";
import { MatTabsModule }                          from '@angular/material/tabs';
import { NgxTimerModule }                         from 'ngx-timer';
import { MenuComponent }                          from './menu/menu.component';
import { MatTooltipModule }                       from '@angular/material/tooltip';
import { NgxSkltnModule, SkltnConfig }            from 'ngx-skltn';
import { MatChipsModule }                         from '@angular/material/chips';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import {
  SocialLoginModule,
  AuthServiceConfig,
  GoogleLoginProvider,
  FacebookLoginProvider
} from "angular-6-social-login";

import { SocialSignupComponent }                    from "./social-signup/social-signup.component";
import { 
  MatDatepickerModule, 
  MatNativeDateModule, 
  MatCheckboxModule, 
  MatButtonModule, 
  MatIconModule
}                                                   from "@angular/material";
import { CreatenewtopicComponent }                  from "./createnewtopic/createnewtopic.component";
import { TagInputModule }                           from "ngx-chips";
import { SpecificCommentsComponent }                from "./specific-comments/specific-comments.component";
import { SpecificSubscribersComponent }             from "./specific-subscribers/specific-subscribers.component";
import { AuthGuarder }                              from "./auth.guard";
import { AuthPrivatesiteGuard }                     from './auth-privatesite.guard';

import { ProfileComponent }                         from "./profile/profile.component";
import { SubscribersComponent }                     from "./subscribers/subscribers.component";
import { SettingsComponent }                        from "./settings/settings.component";
import { HomeComponent }                            from "./home/home.component";
import { CategoiesComponent }                       from "./categoies/categoies.component";
import { PollinfoComponent }                        from "./pollinfo/pollinfo.component";
import { TrunumuserSubscriptionsComponent }         from "./trunumuser-subscriptions/trunumuser-subscriptions.component";
import { TrunumuserSubscriptionsService }           from "./trunumuser-subscriptions/trunumuser-subscriptions.service";
import { HttpModule }                               from "@angular/http";
import { ModalComponent }                           from "./modal/modal.component";
import { SearchResultsComponent }                   from "./search-results/search-results.component";
import { UserprofileComponent }                     from "./userprofile/userprofile.component";
import { SearchResultsService }                     from "./search-results/search-results.service";
import { EdittopicComponent }                       from "./edittopic/edittopic.component";
import { EdittopicService }                         from "./edittopic/edittopic.service";
import { PollinfoService }                          from "./pollinfo/pollinfo.service";
import { DatefromnowPipe }                          from "./datefromnow.pipe";
import { EmbedVideo }                               from "ngx-embed-video";
import { RetruthModalComponent }                    from "./retruth-modal/retruth-modal.component";
import { FooterComponent }                          from "./footer/footer.component";
import { PrivacyPolicyComponent }                   from "./privacy-policy/privacy-policy.component";
import { PolldetailsComponent }                     from "./polldetails/polldetails.component";
import { PolldetailsService }                       from "./polldetails/polldetails.service";
import { NotificationComponent }                    from './notification/notification.component';
import { SocketIoModule, SocketIoConfig }           from 'ngx-socket-io';
import { DeviceDetectorModule }                     from 'ngx-device-detector';
import { environment }                              from 'src/environments/environment';
import { RedirectComponentComponent }               from './redirect-component/redirect-component.component';
import { PrivatesiteHeaderComponent }               from './privatesite-header/privatesite-header.component';
import { PrivatesiteHomeComponent }                 from './privatesite-home/privatesite-home.component';
import { PrivatesiteHomeService }                   from './privatesite-home/privatesite-home.service';
import { PrivatesiteHeaderService }                 from './privatesite-header/privatesite-header.service';
import { DeactivatedPrivatesiteComponent }          from './deactivated-privatesite/deactivated-privatesite.component';
import { MessagesComponent }                        from './messages/messages.component';
import {WebcamModule}                               from 'ngx-webcam';
import {CameraComponent}                            from './camera/camera.component';
import {RecordRTCComponent}                         from './record-rtc/record-rtc.component';
import { GroupsComponent }                          from './groups/groups.component';
import { CanDeactivateGuard }                       from './can-deactivate/can-deactivate.guard';
import {CameramodalComponent}                       from './cameramodal/cameramodal.component';
import { ToasterContainerComponent }                from './toast/toaster-container.component';
import { ToasterComponent }                         from './toast/toaster.component';
import { UploadFileModalComponent }                 from './uploadFileModal/uploadFileModal.component';
import { FileSharingComponent }                     from "./file-sharing/file-sharing.component";
import { Ng2TelInputModule }                        from "ng2-tel-input";
import { MatFormFieldModule, MatInputModule }       from '@angular/material';
import { MatSnackBarModule }                        from '@angular/material/snack-bar';
import { CreateNewFolderComponent }                 from "./file-sharing/modal/new-folder/create-new-folder/create-new-folder.component";
import { PhoneVerificationComponent }               from './phone-verification/phone-verification.component';
import { RenameModalComponent }                     from './file-sharing/modal/rename-modal/rename-modal.component';
import { VerifiedVoteModalComponent }               from "./pollinfo/verified-vote-modal/verified-vote-modal.component";
import { MatProgressBarModule }                     from '@angular/material/progress-bar';
import { StorageWarningComponent }                  from "./file-sharing/modal/storage-warning/storage-warning.component";
import { ShareModalComponent }                      from "./file-sharing/modal/share-modal/share-modal.component";
import { CookiePolicyModalComponent }               from './cookie-policy-modal/cookie-policy-modal.component';
import { MoveFolderModalComponent }                 from "./file-sharing/modal/move-folder-modal/move-folder-modal.component";
import { ShareDataModalComponent }                  from "./file-sharing/modal/share-data-modal/share-data-modal.component";
import { LightboxModule } 						              from 'ngx-lightbox';
import { PdfViewerModule }                          from 'ng2-pdf-viewer';
import { FilePreviewComponent }                     from "./file-sharing/preview/file-preview/file-preview.component";
import { GoogleAdComponent }                        from './google-ad/google-ad.component';
import { SkeletonLoadingComponent }                 from './skeleton-loading/skeleton-loading.component';
import { AngularOtpLibModule }                      from 'angular-otp-box';

const config : SocketIoConfig = { url: environment.socketUrl, options: {} };
const skltnConfig: SkltnConfig = {
  rectRadius: 10,
  flareWidth: '150px',
  bgFill: '#d8d5d1',
  flareFill: 'rgba(255,255,255, 0.5)',
};
export function getAuthServiceConfigs() {
  let config = new AuthServiceConfig([
    {
      id: GoogleLoginProvider.PROVIDER_ID,
      provider: new GoogleLoginProvider(
        environment.google_app_id
      )
    },
    {
      id: FacebookLoginProvider.PROVIDER_ID,
      provider: new FacebookLoginProvider(environment.facebook_app_id)
    }
  ]);
  return config;
}
@NgModule({
   declarations: [		
      AppComponent,
      HeaderComponent,
      SignupComponent,
      SignUpComponent,
      SigupheaderComponent,
      EmailVerifyComponent,
      ForgotComponent,
      ForgotUsernameComponent,
      ForgotPasswordComponent,
      ForgotDoneComponent,
      EmailverificationComponent,
      RecoverpasswordComponent,
      TopicmodalComponent,
      SocialSignupComponent,
      CreatenewtopicComponent,
      SpecificCommentsComponent,
      SpecificSubscribersComponent,
      ProfileComponent,
      SubscribersComponent,
      SettingsComponent,
      HomeComponent,
      CategoiesComponent,
      PollinfoComponent,
      TrunumuserSubscriptionsComponent,
      ModalComponent,
      SearchResultsComponent,
      UserprofileComponent,
      EdittopicComponent,
      DatefromnowPipe,
      RetruthModalComponent,
      FooterComponent,
      PrivacyPolicyComponent,
      PolldetailsComponent,
      NotificationComponent,
      RedirectComponentComponent,
      PrivatesiteHeaderComponent,
      PrivatesiteHomeComponent,
      MessagesComponent,
      CameraComponent,
      RecordRTCComponent,
      CameramodalComponent,
      ToasterContainerComponent,
      ToasterComponent,
      UploadFileModalComponent,
      GroupsComponent,
      MenuComponent,
      FileSharingComponent,
      CreateNewFolderComponent,
      PhoneVerificationComponent,
      VerifiedVoteModalComponent,
      RenameModalComponent,
      StorageWarningComponent,
      CookiePolicyModalComponent,
      ShareModalComponent,
      MoveFolderModalComponent,
      ShareDataModalComponent,
      FilePreviewComponent,
      GoogleAdComponent,
      DeactivatedPrivatesiteComponent,
      SkeletonLoadingComponent
   ],
   entryComponents: [
      SignupComponent,
      ModalComponent,
      TrunumuserSubscriptionsComponent,
      HeaderComponent,
      TopicmodalComponent,
      SpecificCommentsComponent,
      SpecificSubscribersComponent,
      RetruthModalComponent,
      CameramodalComponent,
      UploadFileModalComponent,
      CreateNewFolderComponent,
      VerifiedVoteModalComponent,
      RenameModalComponent,
      StorageWarningComponent,
      CookiePolicyModalComponent,
      ShareModalComponent,
      MoveFolderModalComponent,
      ShareDataModalComponent,
      FilePreviewComponent,
      SkeletonLoadingComponent
   ],
   imports: [
    BrowserModule.withServerTransition({ appId: "serverApp" }),
    AppRoutingModule,
    NgbModule,
    DeviceDetectorModule.forRoot(),
    BrowserAnimationsModule,
    ModalModule.forRoot(),
    SocketIoModule.forRoot(config),
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgSelectModule,
    SocialLoginModule,
    EmbedVideo.forRoot(),
    MatDatepickerModule,
    MatNativeDateModule,
    TagInputModule,
    NgxEditorModule,
    NgxPaginationModule,
    HttpModule,
    Ng5SliderModule,
    WebcamModule,
    MatTabsModule,
    MatCheckboxModule,
    MatButtonModule,
    NgxTimerModule,
    MatTooltipModule,
    Ng2TelInputModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatChipsModule,
    MatIconModule,
    LightboxModule,
    PdfViewerModule,
    MatBottomSheetModule,
    NgxSkltnModule.forRoot(skltnConfig),
    AngularOtpLibModule
  ],
  providers: [
    MatDatepickerModule,
    EdittopicService,
    SearchResultsService,
    SignUpService,
    TrunumuserSubscriptionsService,
    AuthGuarder,
    AuthPrivatesiteGuard,
    AuthService,
    SignupmodalService,
    PollinfoService,
    CookieService,
    AuthService,
    PolldetailsService,
    PrivatesiteHeaderService,
    PrivatesiteHomeService,
    CanDeactivateGuard,
    ForgotService,
    HttpInterceptorService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    },
    { provide: AuthServiceConfig, useFactory: getAuthServiceConfigs },
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    BsModalService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
