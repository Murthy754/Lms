import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(
    private _http: HttpClient
  ) { }

  getConfigurations() {
    let configurations = {}
    if(localStorage.getItem('globalConfigurations')) {
      configurations = JSON.parse(localStorage.getItem('globalConfigurations'))
    }
    return configurations;
  }

  getConfigs() {
      return this._http.get(environment.url + "api/global/configurations");
  }

  search(request = {}) {
    let data = request;
    data['searchType'] = request['searchType'];
    return this._http.get(environment.url + "api/search", { params: data})
  }

}
