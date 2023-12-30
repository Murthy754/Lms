import { PrivatesiteHomeComponent }     from './privatesite-home/privatesite-home.component';
import { NgModule }                     from "@angular/core";
import { Routes, RouterModule }         from "@angular/router";
import { SignUpComponent }              from "./sign-up/sign-up.component";
import { EmailVerifyComponent }         from "./email-verify/email-verify.component";
import { ForgotComponent }              from "./forgot/forgot.component";
import { ForgotUsernameComponent }      from "./forgot-username/forgot-username.component";
import { ForgotPasswordComponent }      from "./forgot-password/forgot-password.component";
import { ForgotDoneComponent }          from "./forgot-done/forgot-done.component";
import { EmailverificationComponent }   from "./emailverification/emailverification.component";
import { RecoverpasswordComponent }     from "./recoverpassword/recoverpassword.component";
import { SocialSignupComponent }        from "./social-signup/social-signup.component";
import { CreatenewtopicComponent }      from "./createnewtopic/createnewtopic.component";
import { AuthGuarder }                  from "./auth.guard";
import { ProfileComponent }             from "./profile/profile.component";
import { SubscribersComponent }         from "./subscribers/subscribers.component";
import { SettingsComponent }            from "./settings/settings.component";
import { HomeComponent }                from "./home/home.component";
import { SearchResultsComponent }       from "./search-results/search-results.component";
import { UserprofileComponent }         from "./userprofile/userprofile.component";
import { EdittopicComponent }           from "./edittopic/edittopic.component";
import { PrivacyPolicyComponent }       from "./privacy-policy/privacy-policy.component";
import { PolldetailsComponent }         from "./polldetails/polldetails.component";
import { NotificationComponent }        from './notification/notification.component';
import { RedirectComponentComponent }   from './redirect-component/redirect-component.component';
import { MessagesComponent }            from './messages/messages.component';
import { CanDeactivateGuard }           from './can-deactivate/can-deactivate.guard';
import { FileSharingComponent }         from "./file-sharing/file-sharing.component";
import { PhoneVerificationComponent }   from "./phone-verification/phone-verification.component";
import { DeactivatedPrivatesiteComponent} from './deactivated-privatesite/deactivated-privatesite.component';
import { AuthPrivatesiteGuard           } from './auth-privatesite.guard';

const routes: Routes = [
  { path: "", component:RedirectComponentComponent , pathMatch: "full" },
  { path: "privatesites/:siteName/deactivated", component:DeactivatedPrivatesiteComponent},
  { path: "signup", component: SignUpComponent },
  {
    path: "poll/edit/start/:id",
    component: EdittopicComponent,
    canActivate: [AuthGuarder]
  },
  {
    path: "privatesites/:siteName/poll/edit/start/:id",
    component: EdittopicComponent,
    canActivate: [AuthGuarder, AuthPrivatesiteGuard]
  },
  { path: "signup/complete", component: EmailVerifyComponent },
  { path: "forgot", component: ForgotComponent },
  { path: "forgot/username", component: ForgotUsernameComponent },
  { path: "forgot/password", component: ForgotPasswordComponent },
  { path: "forgot/done", component: ForgotDoneComponent },
  { path: "emailVerification/successful", component: EmailverificationComponent },
  { path: "recoverPassword/:id", component: RecoverpasswordComponent },
  {
    path: "profile/:id",
    component: ProfileComponent,
    canActivate: [AuthGuarder],
  },
  {
    path: "privatesites/:siteName/profile/:id",
    component: ProfileComponent,
    canActivate: [AuthGuarder, AuthPrivatesiteGuard]
  },
  { path: "signup/social", component: SocialSignupComponent },
  {
    path: "topic/new/start",
    component: CreatenewtopicComponent,
    canActivate: [AuthGuarder]
  },
  {
    path: "privatesites/:siteName/topic/new/start",
    component: CreatenewtopicComponent,
    canActivate: [AuthGuarder, AuthPrivatesiteGuard]
  },
  { path: "privacy-policy", component: PrivacyPolicyComponent },
  {
    path: "subscribers/:id",
    component: SubscribersComponent,
    canActivate: [AuthGuarder]
  },
  {
    path: "privatesites/:siteName/subscribers/:id",
    component: SubscribersComponent,
    canActivate: [AuthGuarder, AuthPrivatesiteGuard]
  },
  {
    path: "messages",
    component: MessagesComponent,
    canActivate: [AuthGuarder]
  },
  {
    path: "privatesites/:siteName/messages",
    component: MessagesComponent,
    canActivate: [AuthGuarder, AuthPrivatesiteGuard]
  },
  {
    path: "groups/:id",
    component: MessagesComponent,
    canActivate: [AuthGuarder]
  },
  {
    path: "subscribers",
    component: SubscribersComponent,
    canActivate: [AuthGuarder]
  },
  {
    path: "settings",
    component: SettingsComponent,
    canActivate: [AuthGuarder],
    canDeactivate: [CanDeactivateGuard]
  },
  {
    path: "privatesites/:siteName/settings",
    component: SettingsComponent,
    canActivate: [AuthGuarder, AuthPrivatesiteGuard],
    canDeactivate: [CanDeactivateGuard]
  },
  { path: "home/:id", component: HomeComponent },
  { path: "search/:id", component: SearchResultsComponent },
  { 
    path: "privatesites/:siteName/search/:id",
    component: SearchResultsComponent,
    canActivate: [AuthPrivatesiteGuard]
  },
  { path: "userprofile/:id", component: UserprofileComponent },
  { 
    path: "privatesites/:siteName/userprofile/:id", 
    component: UserprofileComponent,
    canActivate: [AuthPrivatesiteGuard]
  },
  { path: "poll/:id", component: PolldetailsComponent },
  { 
    path: "privatesites/:siteName/poll/:id", 
    component: PolldetailsComponent, 
    canActivate: [AuthPrivatesiteGuard]
  },
  
  {path:'notifications',component:NotificationComponent, canActivate: [AuthGuarder]},
  {
    path:'privatesites/:siteName/notifications',
    component:NotificationComponent, 
    canActivate: [AuthGuarder, AuthPrivatesiteGuard]
  },
  {
    path:'privatesites/:id', 
    component: PrivatesiteHomeComponent,
    canActivate: [AuthPrivatesiteGuard]
  },
  {path: 'drive', component: FileSharingComponent},
  {
    path: 'privatesites/:id/drive', 
    component: FileSharingComponent,
    canActivate: [AuthPrivatesiteGuard]
  },
  {path: 'phoneverification', component: PhoneVerificationComponent},
  {
    path: 'privatesites/:siteName/phoneverification', 
    component: PhoneVerificationComponent,
    canActivate: [AuthPrivatesiteGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: "reload" })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
