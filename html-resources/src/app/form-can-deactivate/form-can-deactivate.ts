
import {NgForm} from "@angular/forms";
import { ComponentCanDeactivate } from '../can-deactivate/can-deactivate.component';

export abstract class FormCanDeactivate extends ComponentCanDeactivate{

 abstract get form():NgForm;
 
 canDeactivate():boolean{
      if (this.form) {
        return this.form.submitted || !this.form.dirty
      } else {
        return;
      }
  }
}