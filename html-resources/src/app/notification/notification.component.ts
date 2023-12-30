import { Component, OnInit } from '@angular/core';
import { NotificationService } from './notification.service';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Socket } from 'ngx-socket-io';
import { CookieService } from "ngx-cookie-service";
import { AuthService } from "../auth.service";

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  notifications:any=[]
  siteName: string;
  deviceInfo:any;
    constructor(private router:Router,private nService:NotificationService,
    private cookieService: CookieService,
    public auth: AuthService,
      
      private soc:Socket,private deviceService: DeviceDetectorService) {  
        this.epicFunction(); 
      this.soc.fromEvent<any>('Notifcation').subscribe(data => {
        var notification:any=data;
        if(notification.notifyTo===localStorage.getItem('userId'))
        {
          this.notifications.unshift(data);
          // this.newNotifications=true;
        }
      },
      (error=>{
        console.log(error);
      }))
  }
  epicFunction() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    const isMobile = this.deviceService.isMobile();
    const isTablet = this.deviceService.isTablet();
    const isDesktopDevice = this.deviceService.isDesktop();
  }

  ngOnInit() {
     
    let link = window.location.pathname.split('/');
    if (link[1] === "privatesites") {
      this.siteName = link[2];
    }
    var data={
      notifyTo:localStorage.getItem('userId')
    }
    if (this.privateSiteCheck()) {
      if (localStorage.getItem(this.siteName + '_privateSiteUserId')) {
        data.notifyTo = localStorage.getItem(this.siteName + '_privateSiteUserId');
        data['privateSiteId'] = localStorage.getItem(this.siteName + '_privateSiteUserId')
      } else {
        data['privateSiteId'] = localStorage.getItem(this.siteName + '_siteUserId')
      }
    }
    if(this.privateSiteCheck()){
      this.auth.isPrivateSite="Yes";
      this.nService.getPrivateNotifications(data).subscribe(docs=>{
         
        this.notifications=docs;
      },
      (error=>{
        console.log(error);
      }));
    }
    else{
      this.auth.isPrivateSite="No";
      this.nService.getNotifications(data).subscribe(docs=>{
         
        this.notifications=docs;
      },
      (error=>{
        console.log(error);
      }));
    }
  }
  isMobile(){
    return true;
  }
  goToUserProfile(createdBy,event){
    
  }
  markAllAsRead(){
     
    var data={
      notifyTo:localStorage.getItem('userId')
    };
    this.nService.markAsAllViewd(data).subscribe(docs=>{
       
        this.notifications.forEach(element => {
          element.isRead=true;
          element.isViewed=true;
        });
    },
    (error=>{
      console.log(error);
    }))
  }
  goToLink(notification){
    if (notification.type === 'POLL_FOLLOWER') {
      this.router.navigate(["/userprofile/" +  notification.createdBy.userName ]);      
  } else if (notification.type === 'SUBSCRIBE') {
    this.router.navigate(["subscribers/0"]);
  } else {
     
    this.nService.isPollDeleted(notification.pollId).subscribe(data=>{
        var result:any=data;
         
        if(result.isdelete){
          window.alert("this poll is delted by the user");
        }
        else{
            this.router.navigate(['/poll/'+notification.pollId])
        }
    },
    (error=>{
      console.log(error);
    })); 
  }
  }  
  markOneAsRead(notification,index){
      var data={
        id:notification._id
      };
       
      this.nService.markAsViewd(data).subscribe(docs=>{
         
        this.notifications[index].isViewed=true;
        this.notifications[index].isRead=true;
      },
      (error=>{
        console.log(error);
      }))
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
