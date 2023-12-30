'use strict';

/**
 * @ngdoc service
 * @name trunumangularApp.appKeys
 * @description
 * # appKeys
 * Constant in the trunumangularApp.
 */
angular.module('trunumangularApp')
  .constant('appKeys', {
    env:'development',
    development:{
      facebook_app_id:'1775478066001820',
      google_app_id:'289936687707-h7sea5j881quvsok3o3dtej3d9tplgsq.apps.googleusercontent.com',
      google_app_secret:'khKySynV1HkWC9y0Zi4sm6Zc',
      url: 'http://localhost:3001/',
      red5_hostURL:'ws-test.trunums.com',
      red5_port:8083,
      red5_protocol:'wss',
      FILESIZE:"500MB",
      PAGE_LIMIT:20
    },
    test: {
      facebook_app_id: '1265067816845070',
      google_app_id: '567789639363-9bnt4pcfjuck52h0a3l8rbkpdm20iruv.apps.googleusercontent.com',
      google_app_secret: 'rGqb3ND6zlFpeBYZXN2J3oQV',
      url: 'https://counting.trunums.com/',
      red5_hostURL:'ws-test.trunums.com',
      red5_port:8083,
      red5_protocol:'wss',
      FILESIZE:"500MB",
      PAGE_LIMIT:20
    },
    staging: {
      facebook_app_id: '1767050853537439',
      google_app_id: '93156312156-tru9tg3kr6a982hfijekat38l61iou68.apps.googleusercontent.com',
      google_app_secret: '4NoGfpYVyKM8J2OWQ30ejgdB',
      url: 'https://canvas.trunums.com/',
      red5_hostURL:'ws.trunums.com',
      red5_port:8083,
      red5_protocol:'wss',
      FILESIZE:"500MB",
      PAGE_LIMIT:20
 },
    production: {
      facebook_app_id: '1801863846767388',
      google_app_id: '352552987511-6sg7n41s09qm19r7u6tjc46napri9jfl.apps.googleusercontent.com',
      google_app_secret: 'b4-7csBJsr-Hvi1sL-osRN8J',
      url: window.location.protocol + '//api.trunums.com/',
      red5_hostURL:'ws.trunums.com',
      red5_port:8083,
      red5_protocol:'wss',
      FILESIZE:"500MB",
      PAGE_LIMIT:20
    }
});
