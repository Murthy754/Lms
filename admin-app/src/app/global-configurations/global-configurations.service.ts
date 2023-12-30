import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GlobalConfigurationsService {

  constructor(
    private _http: HttpClient
  ) { }

  getConfigurations() {
    return this._http.get(environment.url + "api/admin/global/configurations");
  }

  setConfigurations(request: any) {
    return this._http.post(environment.url + "api/admin/set/global/configurations", request);
  }

}
