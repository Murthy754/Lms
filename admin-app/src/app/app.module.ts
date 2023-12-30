import { BrowserModule }                    from '@angular/platform-browser';
import { NgModule }                         from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule }          from '@angular/platform-browser/animations';
import { MatCheckboxModule }                from '@angular/material/checkbox';
import { MatDialogModule }                  from '@angular/material/dialog';
import { MatTableModule } 						      from '@angular/material/table';

import { HttpClientModule,
  HTTP_INTERCEPTORS }                       from "@angular/common/http";
import { AppRoutingModule }                 from './app-routing.module';
import { AppComponent }                     from './app.component';
import { LoginComponent }                   from './login/login.component';
import { HeaderComponent }                  from './header/header.component';
import { RedirectComponent }                from './redirect/redirect.component';
import { MatInputModule }                   from '@angular/material/input';
import { MatSelectModule }                  from '@angular/material/select';
import { DashboardComponent }               from './dashboard/dashboard.component';

import { AuthService }                      from './middlewares/auth.service';
import { AuthGuarder }                      from './middlewares/auth.gaurd';
import { BroadcastEmailComponent }          from './broadcast-email/broadcast-email.component';
import { ComposeEmailModalComponent }       from './broadcast-email/compose-email-modal/compose-email-modal.component';
// import { NgxEditorModule }                  from "ngx-editor";
import { MatSnackBarModule }                from '@angular/material/snack-bar';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { InviteUserComponent }              from './invite-user/invite-user.component';
import { MatChipsModule }                   from '@angular/material/chips';
import { CookieService }                    from "ngx-cookie-service";
import { UserManagementComponent }          from './user-management/user-management.component';
import { MatPaginatorModule }               from "@angular/material/paginator";
import { MatSortModule }                    from "@angular/material/sort";
import { MatTooltipModule }                 from '@angular/material/tooltip';
import { HttpInterceptorService }           from './middlewares/http-interceptor.service';
import { ForgotComponent }                  from './forgot/forgot.component';
import { ForgotDoneComponent }              from './forgot-done/forgot-done.component';
import { ForgotUsernameComponent }          from './forgot-username/forgot-username.component';
import { ForgotPasswordComponent }          from './forgot-password/forgot-password.component';
import { ResetPasswordComponent }           from './reset-password/reset-password.component';
import { MatMenuModule }                    from '@angular/material/menu';
import { MatCardModule }                    from '@angular/material/card';
import { GlobalConfigurationsComponent }     from './global-configurations/global-configurations.component';
import { MatButtonModule }                  from '@angular/material/button';
import { MatSlideToggleModule }             from '@angular/material/slide-toggle';
import { PrivateSiteDetailsModalComponent } from './private-site-details-modal/private-site-details-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent,
    RedirectComponent,
    DashboardComponent,
    BroadcastEmailComponent,
    ComposeEmailModalComponent,
    InviteUserComponent,
    UserManagementComponent,
    ForgotComponent,
    ForgotDoneComponent,
    ForgotUsernameComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    GlobalConfigurationsComponent,
    PrivateSiteDetailsModalComponent,
   ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    HttpClientModule,
    MatCheckboxModule,
    MatDialogModule,
    AngularEditorModule,
    // NgxEditorModule,
    MatSnackBarModule,
    MatChipsModule,
    MatSortModule,
    MatPaginatorModule,
    MatTableModule,
    MatTooltipModule,
    MatMenuModule,
    MatCardModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSelectModule
  ],
  providers: [
    AuthService,
    AuthGuarder,
    CookieService,
    HttpInterceptorService,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: HttpInterceptorService,
			multi: true
		},
  ],
  bootstrap: [AppComponent],
  entryComponents: [ComposeEmailModalComponent]
})
export class AppModule { }
