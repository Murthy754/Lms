import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Toast } from './toast.interface';

@Component({
  selector: 'app-toaster',
  template: `
    <div class="toast toast-{{toast.type}}"
      [style.bottom.px]="i*100">
      <h4 class="toast-heading">{{toast.title}}</h4>
      <p>{{toast.body}}</p>
      <a class="close" (click)="remove.emit(i)">&times;</a>
    </div>`,
  styles: [
    `.toast {
      width: 300px;
      height: 40px;
      padding: .75rem 1.25rem;
      margin-top: 1rem;
      border: 1px solid transparent;
      border-radius: .25rem;
	    animation: move 1s both;
	    position: absolute;
      top: 90px;
      left: 0;
      right: 0;
      margin: 0 auto;
	  }
  
    .toast p {
		  margin:0;
	  }

    .toast-success {
      color: #155724;
      background-color: #d4edda;
      border-color: #c3e6cb;
    }

    .toast-error {
      color: #721c24;
      background-color: #f8d7da;
      border-color: #f5c6cb;
    }

    .toast-warning {
      color: #856404;
      background-color: #fff3cd;
      border-color: #ffeeba;
    }

    .close {
      position: absolute;
      top: 11px;
      right: 10px;
      font-size: 1.5em;
      cursor: pointer;
      width:auto;
      height:auto;
    }

    .toast-heading {
      margin-top: 10px;
    }

    @keyframes move {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }`
  ]
})


export class ToasterComponent {
  @Input() toast: Toast;
  @Input() i: number;

  @Output() remove = new EventEmitter<number>();
  
}
