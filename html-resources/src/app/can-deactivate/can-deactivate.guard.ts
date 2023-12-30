import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ComponentCanDeactivate } from './can-deactivate.component';

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<ComponentCanDeactivate> {
    count =0;
  canDeactivate(component: ComponentCanDeactivate): boolean {
    
    if(!component.canDeactivate()){
        this.count++;
        if(this.count==1){
            if (confirm("You have unsaved changes! If you leave, your changes will be lost.")) {
                this.count =0;
                return true;
            } else {
                return false;
            }
        }
        else
        {
            this.count=0;
            return false;
        }
       
    }
    return true;
  }
}
