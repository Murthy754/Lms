import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { RedirectComponent } from './redirect/redirect.component';
import { AuthGuarder } from "./middlewares/auth.gaurd";
import { HeaderComponent } from './header/header.component';
import { BroadcastEmailComponent } from './broadcast-email/broadcast-email.component';
import { InviteUserComponent } from './invite-user/invite-user.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { ForgotComponent } from './forgot/forgot.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ForgotDoneComponent } from './forgot-done/forgot-done.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { GlobalConfigurationsComponent } from './global-configurations/global-configurations.component';

const routes: Routes = [
	{ path: "", component: RedirectComponent, pathMatch: "full"},
  	{ path: "login", component: LoginComponent },
  	{ path: "forgot", component: ForgotComponent },
  	{ path: "forgot/password", component: ForgotPasswordComponent },
  	{ path: "password/reset/:id", component: ResetPasswordComponent },
  	{ path: "forgot/done", component: ForgotDoneComponent },
	{ path: '',
		canActivate: [AuthGuarder],
		component: HeaderComponent,
		children: [
			{
				path: '',
				component: RedirectComponent
			},
			{
				path: 'dashboard',
				component: DashboardComponent,
				canActivate: [AuthGuarder]
			},
			{ 
				path: "broadcast", 
				component: BroadcastEmailComponent, 
				canActivate: [AuthGuarder] 
			},
			{ 
				path: "invite", 
				component: InviteUserComponent, 
				canActivate: [AuthGuarder] 
			},
			{ 
				path: "user-management", 
				component: UserManagementComponent,
				canActivate: [AuthGuarder] 
			},
			{ 
				path: "global/configurations", 
				component: GlobalConfigurationsComponent,
				canActivate: [AuthGuarder] 
			}
		]
	}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
