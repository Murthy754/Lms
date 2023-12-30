/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FileSharingService } from './file-sharing.service';

describe('Service: FileSharing', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FileSharingService]
    });
  });

  it('should ...', inject([FileSharingService], (service: FileSharingService) => {
    expect(service).toBeTruthy();
  }));
});
