import { Component, OnInit, Input, Output, EventEmitter, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import { CategoriesService } from "./categories.service";
import { ThrowStmt } from '@angular/compiler';
@Component({
  selector: "app-categoies",
  templateUrl: "./categoies.component.html",
  styleUrls: ["./categoies.component.scss"]
})
export class CategoiesComponent implements OnInit {
  isWrapperStiky=false;
  @HostListener("window:scroll", ["$event"])
  scrollHandler(event) {
    if(window.pageYOffset && window.pageYOffset>82){
      this.isWrapperStiky=true;
    }
    else
      this.isWrapperStiky=false;
  }
  Url = "";
  @Input() urllink: any;

  @Output() public getData = new EventEmitter<Array<{}>>();

  constructor(private catSerice: CategoriesService, private router: Router) {
  }
  categoryInf: any = [];
  categoryInfo = [];
  categoryfilter = [];
  ngOnInit() {
    this.catSerice.getCategories().subscribe(data => {
      this.categoryInf = data;
      this.categoryInfo = this.categoryInf;
      this.getData.emit(this.categoryInf);
    },
    (error=>{
      console.log(error);
    }));

    this.Url = localStorage.getItem("tab");
  }
  removecategoryPolls(item, index) {
    this.categoryInfo.push(item);
    this.categoryfilter.splice(index, 1);
    var params = "";
    for (var i = 0; i < this.categoryfilter.length; i++) {
      if (i != this.categoryfilter.length - 1)
        params = params + this.categoryfilter[i].name + ",";
      else params = params + this.categoryfilter[i].name;
    }
    this.categoryInfo.sort((a, b) => a.name.localeCompare(b.name));
    var urlString = this.urllink;
    if (this.categoryfilter.length > 0) {
      urlString = urlString + "&categories=" + params;
    }
    this.router.navigateByUrl(urlString);
  }
  SearchPolls(searchParam) {
    this.categoryInfo = this.categoryInf.filter(item => {
      return item.name.toLowerCase().includes(searchParam.toLowerCase());
    });
  }
  filterPolls(item, index) {
    this.categoryfilter.push(item);
    this.categoryInfo.splice(index, 1);
    var params = "";
    for (var i = 0; i < this.categoryfilter.length; i++) {
      if (i != this.categoryfilter.length - 1)
        params = params + this.categoryfilter[i].name.toLowerCase() + ",";
      else params = params + this.categoryfilter[i].name.toLowerCase();
    }
    var a = this.categoryInfo.sort((a, b) => a.name.localeCompare(b.name));

    this.router.navigateByUrl(this.urllink + "&categories=" + params);
  }
}
