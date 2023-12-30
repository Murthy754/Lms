import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class LoaderService {

	loading: boolean;
	header: boolean;
	loadingChange: Subject<boolean> = new Subject<boolean>();
	headerChange: Subject<boolean> = new Subject<boolean>();
	hideCompleteHeader: Subject<boolean> = new Subject<boolean>();
	constructor() {
		this.loadingChange.subscribe((value) => {
			this.loading = value;
		})
		this.headerChange.subscribe((value) => {
			this.header = value;
		})
	}

	changeLoadingVisibility(value) {
		this.loadingChange.next(value);
}

	changeHeader(value) {
		this.headerChange.next(value);
	}
}
