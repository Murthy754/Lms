import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from 'src/environments/environment';
const AWS = require("aws-sdk");

@Injectable({
  providedIn: 'root'
})
export class FileSharingService {

  constructor(
    private _http: HttpClient
  ) { }

  getPeoples(requestData, requestType) {
    return this._http.get(environment.url + "api/fileSharing/peoples/" + requestData.id + "?requestType=" + requestType + "&privateSiteId=" + requestData.privateSiteId);
  }

  getGroups(requestData) {
    return this._http.get(environment.url + "api/fileSharing/groups/" + requestData.id);
  }

  getMessageFilesBetweenUsers(memberId, userId, privateSiteId) {
    return this._http.get(environment.url + "api/fileSharing/files/messages/" + memberId + "/" + userId + "?privateSiteId=" + privateSiteId);
  }

  getFilesBetweenUsers(memberId, id, privateSiteId) {
    return this._http.get(environment.url + "api/fileSharing/files/" + memberId + "/" + id + "?privateSiteId=" + privateSiteId);
  }

  getFilesInGroup(groupId, privateSiteId) {
    return this._http.get(environment.url + "api/fileSharing/filesInGroup/" + groupId + "?privateSiteId=" + privateSiteId);
  }

  getUserProfileDetails(id) {
    return this._http.get(environment.url + "api/profile/getUserProfileDetails/" + id);
  }

  sendOtp(requestData) {
    return this._http.post(environment.url + "api/user/sendOtp", requestData);
  }

  submitOtp(requestData) {
    return this._http.post(environment.url + "api/user/submitOtp", requestData);
  }

  checkRootFolder(id, privateSiteId) {
    return this._http.get(environment.url + "api/fileSharing/folders/root/" + id + "?privateSiteId=" + privateSiteId);
  }

  checkMessagesFolder(id, folderId, privateSiteId) {
    return this._http.get(environment.url + "api/fileSharing/folders/messages/" + id + "/" + folderId + "?privateSiteId=" + privateSiteId);
  }

  uploadFile(requestData) {
    return this._http.post(environment.url + "api/fileSharing/files/upload", requestData);
  }
  
  createNewFolder(requestData) {
    return this._http.post(environment.url + "api/fileSharing/folders/new", requestData);
  }

  getMyFolders(id, folderId, type) {
    return this._http.get(environment.url + "api/fileSharing/folders/me/" + id + "/" + folderId + "/" + type);
  }

  getMyFiles(id, folderId) {
    return this._http.get(environment.url + "api/fileSharing/files/me/" + id + "/" + folderId);
  }

  getChildFolders(id, folderId, folderType, privateSiteId) {
    return this._http.get(environment.url + "api/fileSharing/folders/child/" + id + "/" + folderId + "/" + folderType + "?privateSiteId=" + privateSiteId);
  }

  getChildFiles(id, folderId, privateSiteId) {
    return this._http.get(environment.url + "api/fileSharing/files/child/" + id + "/" + folderId + "?privateSiteId=" + privateSiteId)
  }

  getMessageFolderFiles(id, privateSiteId) {
    return this._http.get(environment.url + "api/fileSharing/messagesData/" + id + "?privateSiteId=" + privateSiteId);
  }

  getTrashData(id) {
    return this._http.get(environment.url + "api/fileSharing/trash/" + id);
  }

  removeFile(requestData) {
    return this._http.put(environment.url + "api/fileSharing/files/remove", requestData);
  }

  removeFolder(requestData) {
    return this._http.put(environment.url + "api/fileSharing/folders/remove", requestData);
  }

  restoreData(requestData) {
    return this._http.put(environment.url + "api/fileSharing/restore", requestData);
  }

  getStorageUsed(id, privateSiteId) {
    return this._http.get(environment.url + "api/fileSharing/storage/" + id + "?privateSiteId=" + privateSiteId);
  }

  rename(requestData) {
    return this._http.put(environment.url + "api/fileSharing/rename", requestData);
  }

  getSharedWithMeData(id, privateSiteId) {
    return this._http.get(environment.url + "api/fileSharing/sharedWithMe/" + id + "?privateSiteId=" + privateSiteId);
  }

  shareData(requestData) {
    return this._http.post(environment.url + "api/fileSharing/shareData", requestData);
  }

  moveToFolder(requestData) {
    return this._http.put(environment.url + "api/fileSharing/move", requestData);
  }

  shareFolder(requestData) {
    return this._http.put(environment.url + "api/fileSharing/folder/share", requestData);
  }

  shareFile(requestData) {
    return this._http.put(environment.url + "api/fileSharing/file/share", requestData);
  }

  getPreviousFolderData(id) {
    return this._http.get(environment.url + "api/fileSharing/folder/previous/" + id);
  }

  getFilePermissions(privateSiteId, isAdmin) {
    return this._http.get(environment.url + "api/fileSharing/permissions/" + privateSiteId + "/" + isAdmin);
  }

  saveFileAccessSettings(requestData) {
    return this._http.put(environment.url + "api/fileSharing/saveFileAccessSettings", requestData);
  }

  updateParentFolder(requestData) {
    return this._http.put(environment.url + "api/fileSharing/folder/update/parent", requestData);
  }

  uploadFolder(formData) {
    return this._http.post(environment.url + "api/fileSharing/folder/upload", formData);
  }
}
