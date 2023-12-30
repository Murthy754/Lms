import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { LoaderService } from './shared-service/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit{
  title = 'admin-app';
  isLoading: boolean = false;

  constructor(
    private loaderService: LoaderService,
    private changeDetector: ChangeDetectorRef
  ) {

  }
  ngAfterViewInit(): void {
    this.loaderService.loadingChange.subscribe(value => {
      this.isLoading = value;
      this.changeDetector.detectChanges()
    });
  }
 
}
