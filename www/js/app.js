// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var APPverion = "0.1";
var APPtutorial = 0;
var APPfirstTime = 0;
var APPdir = null;
var db = null;
var enableBeacons = false;
var initialOutput = "";
var debug=1;
var noBLE=1;

cw = function (value) {
  initialOutput += value + '\n';
  console.log(value);
};

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      cw("ionic startting run");
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })
  .controller('DashCtrl', function ($window, $rootScope, $scope, $ionicPopup, $timeout, $ionicPlatform, $cordovaSQLite, $IbeaconScanner) {

    dbres = 0;
    if (debug) alert("start");

    $ionicPlatform.ready(function () {
      cw("ionic platform ready");
      // db = $rootScope.db = $window.sqlitePlugin.openDatabase({name: "snpquinta.db", location: "default"});
      db = $rootScope.db = $cordovaSQLite.openDB({name: "snpquinta.db", location: "default"});

      if (db) {
        cw("DB open");
        console.log("DB", db);
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS `info` ( `name`	TEXT,	`value`	TEXT)", []).then(function (res) {
          // alert("OK onDB create");
          cw("Table info created");
        }, function (err) {
          alert(err);
        });
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS `journal` (`IMG`	TEXT, `caption`	TEXT, `thumbnail`	TEXT, `thumbnail_data`	TEXT)", []).then(function (res) {          // alert("OK onDB create");
          cw("Table journal created");
        }, function (err) {
          alert(err);
        });
      }
      dbres = 1;

      var query = "select value from info where name=?";
      $cordovaSQLite.execute(db, query, ["APP"]).then(function (res) {
        if (res.rows.length > 0) {
          // var message = "SELECTED -> " + res.rows.item(0).value;
          var currentPlatform = ionic.Platform.platform();
          var currentPlatformVersion = ionic.Platform.version();
          console.log("Got APP version: Installed v" + res.rows.item(0).value  + "PLAT: " + currentPlatform + " VER: " + currentPlatformVersion);
          $scope.showAlert("Got APP version: Installed v" + res.rows.item(0).value + "(" + dbres + ") PLAT: " + currentPlatform + " VER: " + currentPlatformVersion);
        } else {
          $scope.showAlert("No results found, primeira utilizacao!");
          console.log("No results found, firsttime?");

          var query = "INSERT INTO `info` (name,value) VALUES ('APP', " + APPverion + ")";
          $cordovaSQLite.execute(db, query, []).then(function (res) {
            // var message = "INSERT ID -> " + res.insertId;
            // console.log(message);
            console.log("Inserted APP version: v" + APPverion + " tutorial: ON");
            APPfirstTime = 1;
            $scope.showAlert("Inserted APP version: v" + APPverion + " tutorial: ON");
            // alert(message);
          }, function (err) {
            console.error(err);
            alert(err);
          });

          var query = "INSERT INTO `info` (name,value) VALUES ('APPtutorial', 'Sim')";
          $cordovaSQLite.execute(db, query, []).then(function (res) {
            var message = "INSERT ID -> " + res.insertId;
            // console.log(message);
            console.log("Inserted APP tutorial: Sim");
            APPtutorial = 1;
            // alert(message);
          }, function (err) {
            console.error(err);
            alert(err);
          });
        }
      }, function (err) {
        alert(err);
        console.error("ERROR ON get app version", err);
      });
    });

    // });


    // $scope.startBeaconScanning = function () {
    //   $IbeaconScanner.startBeaconScan();
    // };
    //
    // $scope.stopBeaconScanning = function () {
    //   $IbeaconScanner.stopBeaconScan();
    // };
    //
    $scope.showAlert = function (msg) {
      var alertPopup = $ionicPopup.alert({
        scope: $scope,
        title: 'INFORMACAO',
        template: msg
      });

      alertPopup.then(function (res) {
        console.log('OK on APP version');
        if ($window.device.model.indexOf("iPhone4") == -1) {
          $rootScope.enableBeacons=true;
          noBLE=0;
          $IbeaconScanner.startBeaconScan();
        }
      });

      $timeout(function () {
        alertPopup.close();
        // if ($window.device.model.indexOf("iPhone4") == -1) {
        //   $rootScope.enableBeacons=true;
        //   $IbeaconScanner.startBeaconScan();
        // }
      }, 5000);
    };

    if (debug)
      setTimeout(function () {
        alert(initialOutput);
      }, 10000);

    // setTimeout(function () {
    //   $IbeaconScanner.startBeaconScan();
    // }, 1000);

    // });
  })
  .controller("IbeaconController", function ($rootScope, $scope, $ionicPlatform, $window, $IbeaconScanner) {

    $scope.beacons = $rootScope.beacons;

    $ionicPlatform.ready(function () {

      if ($window.device.model.indexOf("iPhone4") == -1) {

        cw("IbeaconController: BLE support found!");

        $rootScope.enableBeacons=true;

        $scope.$on("BEACONS_UPDATE", function (e) {
          $scope.beacons = $rootScope.beacons;
          console.log("Received broadcast BEACONS_UPDATE");
          $scope.$apply();
        });

        $scope.$on("$ionicView.beforeEnter", function(event, data){
          $IbeaconScanner.sendUpdates(true);
          console.log("State $ionicView.beforeEnter Params: ", data);
        });

        $scope.$on("$ionicParentView.beforeLeave", function(event, data){
          $IbeaconScanner.sendUpdates(false);
          console.log("State $ionicParentView.beforeLeave Params: ", data);
        });
      } else cw("IbeaconController: NO BLE support found!");

    });

  })
  .controller('PopupCtrl', function ($rootScope, $scope, $ionicPopup, $timeout) {

// Triggered on a button click, or some other target
    $scope.showPopup = function () {
      $scope.data = {};

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '<input type="password" ng-model="data.wifi">',
        title: 'Enter Wi-Fi Password',
        subTitle: 'Please use normal things',
        scope: $scope,
        buttons: [
          {text: 'Cancel'},
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function (e) {
              if (!$scope.data.wifi) {
                //don't allow the user to close unless he enters wifi password
                e.preventDefault();
              } else {
                return $scope.data.wifi;
              }
            }
          }
        ]
      });

      myPopup.then(function (res) {
        console.log('Tapped!', res);
      });

      // $timeout(function () {
      //   myPopup.close(); //close the popup after 3 seconds for some reason
      // }, 3000);
    };

    // A confirm dialog
    $scope.showRI = function () {
      if ($rootScope.popupON) {
        console.log("rootScope POPUP is ON, leaving");
        return;
      }
      $scope.popupON = 1;
      $rootScope.popupON = 1;
      var confirmPopup = $ionicPopup.confirm({
        title: 'RI: ' + $scope.currentRI,
        template: 'Estás perto da ' + $scope.currentRI + ', queres ver o conteudo?',
        scope: $scope,
        buttons: [
          {text: 'FICAR'},
          {
            text: '<b>IR</b>',
            type: 'button-positive',
            onTap: function (e) {
              console.log("Confirmed navigation to region");
              return 1;
            }
          }
        ]
      });

      confirmPopup.then(function (res) {
        if (res) {
          console.log('resposta confirmacao de regiao - sim, ver conteudo', res);
        } else {
          console.log('Nao, ficar onde estou - nao', res);
        }
        $scope.popupON = 0;
        $rootScope.popupON = 0;
      });

      $timeout(function () {
        confirmPopup.close();
        $scope.popupON = 0;
        $rootScope.popupON = 0;
      }, 10000);
    };

    // An alert dialog
    // $scope.showAlert = function () {
    //   var alertPopup = $ionicPopup.alert({
    //     title: 'Don\'t eat that!',
    //     template: 'It might taste good'
    //   });
    //
    //   alertPopup.then(function (res) {
    //     console.log('Thank you for not eating my delicious ice cream cone');
    //   });
    // };

    $scope.$on('RI_FOUND', function (e) {
      // do something
      // console.log("POPUP controller scope.on RI_FOUND, enter.");
      if (!$scope.popupON) {
        $scope.currentRI = $rootScope.currentRI;
        $scope.showRI();
      }
      // else
      // console.log("Got event, but popup ON, skipping");
    });
    // setTimeout(function () {
    //   $scope.showConfirm();
    // }, 4000);
  })
  .controller('CameraCtrl', function ($rootScope, $scope, $cordovaCamera, $cordovaDevice, $cordovaSQLite, $ionicPlatform, $ionicPopup, $timeout) {

    // $scope.lastPhoto ="";

    document.addEventListener("deviceready", function () {

      $scope.showAlert = function (msg) {
        var alertPopup = $ionicPopup.alert({
          scope: $scope,
          title: 'INFORMACAO',
          template: msg
        });

        alertPopup.then(function (res) {
          console.log('OK on camera');
        });

        $timeout(function () {
          alertPopup.close();
        }, 5000);
      };

      console.log("camera controller ready 1");
      $ionicPlatform.ready(function () {
        console.log("retrieving last pic");
        var query = "select * from journal";
        $cordovaSQLite.execute(db, query, []).then(function (res) {
          if (res.rows.length > 0) {
            var message = "SELECTED -> " + res.rows.item(res.rows.length - 1).IMG;
            $scope.showAlert(message);
            console.log(message, res);
            $scope.lastPhoto = res.rows.item(res.rows.length - 1).IMG;
            // $scope.$apply();
          } else {
            $scope.showAlert("No results found");
            console.log("No results found");
          }
        }, function (err) {
          $scope.showAlert(err);
          console.error(err);
        });
      });
      // $scope.getPhoto = function () {
      //   var options = {
      //     destinationType: Camera.DestinationType.FILE_URI,
      //     sourceType: Camera.PictureSourceType.CAMERA,
      //     // targetWidth: 100,
      //     // targetHeight: 100,
      //     // encodingType: 0,
      //   };
      //
      //   $cordovaCamera.getPicture(options).then(function (imageURI) {
      //     console.log(imageURI);
      //     $scope.lastPhoto = imageURI;
      //     $scope.$apply();
      //   }, function (err) {
      //     console.log("ERROR: getPicture", err);
      //   });
      //

      function movePic(file) {
        // window.resolveLocalFileSystemURI(file, resolveOnSuccess, resOnError);
        window.resolveLocalFileSystemURL(file, resolveOnSuccess, resOnError);
      }

//Callback function when the file system uri has been resolved
      function resolveOnSuccess(entry) {
        var d = new Date();
        var n = d.getTime();
        //new file name
        var newFileName = n + ".jpg";
        var myFolderApp = "images";

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSys) {
            //The folder is created if doesn't exist
            fileSys.root.getDirectory(myFolderApp,
              {create: true, exclusive: false},
              function (directory) {
                entry.moveTo(directory, newFileName, successMove, resOnError);
              },
              resOnError);
          },
          resOnError);
      }

//Callback function when the file has been moved successfully - inserting the complete path
      function successMove(entry) {
        //I do my insert with "entry.fullPath" as for the path
        $scope.lastPhoto = entry.toURL();
        console.log("Success moved file, new URL: %s", entry.toURL());

        var query = "INSERT INTO `journal` (IMG,caption) VALUES (?,?)";
        $cordovaSQLite.execute($scope.db, query, [entry.toURL(),"No caption yet!"]).then(function (res) {
          var message = "INSERT ID -> " + res.insertId;
          console.log(message);
          // alert(message);
        }, function (err) {
          console.error(err);
          alert(err);
        });
        $rootScope.deviceBUSY = 0;
      }

      function resOnError(error) {
        console.log(error, error.code);
        $rootScope.deviceBUSY = 0;
      }

      $scope.takePicture = function () {
        console.log("take picture ready");
        $rootScope.deviceBUSY = 1;
        if ($scope.takingPicture)
          return;
        $scope.takingPicture = 1;
        navigator.camera.getPicture(onSuccess, onFail, {
          quality: 50,
          destinationType: Camera.DestinationType.FILE_URI,
          encodingType: 0,
        });

        function onSuccess(imageURI) {
          console.log(imageURI);
          $scope.takingPicture = 0;
          // $scope.lastPhoto = imageURI;
          // $scope.$apply();
          movePic(imageURI);
        }

        function onFail(message) {
          console.error('Failed because: ' + message);
          $scope.takingPicture = 0;
        }
      };

      var device = $cordovaDevice.getDevice();
      if (device.platform === 'iOS') {
        // iOS only code
        // $cordovaCamera.cleanup().then(function () {
        //   console.log("CleanUP Enter");
        //
        // }); // only for FILE_URI
      }


      // }
    }, false);
  })
  .controller("BarCodeReaderController", function ($rootScope, $scope, $cordovaBarcodeScanner) {
    console.log("ionic controller BarCodeReaderController ready");
    $scope.getBarcode = function () {
      console.log("Calling scanbarcode");
      $rootScope.deviceBUSY = 1;
      $cordovaBarcodeScanner
        .scan({
          "preferFrontCamera": false, // iOS and Android
          "showFlipCameraButton": false, // iOS and Android
          //"prompt" : "Coloque um código barras dentro da área" // supported on Android only
          // "formats" : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
          // "orientation" : "portrait" // Android only (portrait|landscape), default unset so it rotates with the device
        })
        .then(function (barcodeData) {
          // Success! Barcode data is here
          $scope.code = barcodeData.text;
          $scope.barcodeData = barcodeData;
          $rootScope.deviceBUSY = 0;
          // $scope.$apply();
        }, function (error) {
          // An error occurred
          console.error("Failed QR coe scan!", error)
          $rootScope.deviceBUSY = 0;
        });
      // cordova.plugins.barcodeScanner.scan(
      //   function (result) {
      //     $scope.code = result.text;
      //     $scope.$apply();
      //     console.debug("Código lido\n" +
      //       "Resultado: " + result.text + "\n" +
      //       "Formato: " + result.format + "\n" +
      //       "Cancelado: " + result.cancelled);
      //   },
      //   function (error) {
      //     console.error("Scanning failed: " + error);
      //   },
      //   {
      //     "preferFrontCamera" : true, // iOS and Android
      //     "showFlipCameraButton" : true, // iOS and Android
      //     "prompt" : "Coloque um código barras dentro da área", // supported on Android only
      //     "formats" : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
      //     "orientation" : "landscape" // Android only (portrait|landscape), default unset so it rotates with the device
      //   }
      // );
    };

  })
  .controller("SQLliteController", function ($scope, $ionicPlatform, $cordovaSQLite) {

    $scope.app = {
      tutorial: "",
      firstTime: "Nao"
    };

    // $scope.tutorial = "Nao";
    // $scope.firstTime = "Nao";

    if (APPfirstTime)
      $scope.app.firstTime = "Sim";
    if (APPtutorial)
      $scope.app.tutorial = "Sim";

    console.log("ionic controller SQLliteController ready");

    $cordovaSQLite.getVarFromDB("info", "APPtutorial").then(function (res) {
      $scope.app.tutorial = res;
    });
    // $cordovaSQLite.updateValueToDB("info", ["Sim", "APPtutorial"]).then(function (res) {
    //   // console.log("Client side, returned update", res);
    // });
    // $cordovaSQLite.getVarFromDB("info", "APPtutorial").then(function (res) { $scope.app.tutorial = res; });

    $scope.isTutorial = function () {
      console.log("ionic controller SQLliteController isTutotial");
      $ionicPlatform.ready(function () {
        $cordovaSQLite.getVarFromDB("info", "APPtutorial").then(function (res) {
          $scope.app.tutorial = res;
        });
      })
    };

    $scope.updateTutorial = function () {
      console.log("ionic controller SQLliteController updateTutorial");
      $ionicPlatform.ready(function () {
        $cordovaSQLite.updateValueToDB("info", ["Sim", "APPtutorial"]).then(function (res) {
          if (!res.rowsAffected)
            console.warn("ALERT: Update db got 0 affected rows");
          // console.log("Client side, returned update", res);
        });
      })
    };

    $scope.moreTutorial = function () {
      console.log("ionic controller SQLliteController updateTutorial");
      $ionicPlatform.ready(function () {
        $cordovaSQLite.updateValueToDB("info", ["Nao", "APPtutorial"]).then(function (res) {
          if (!res.rowsAffected)
            console.warn("ALERT: Update db got 0 affected rows");
          // console.log("Client side, returned update", res);
        });
      })
    }
  })
  .config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      // Each tab has its own nav history stack:

      .state('tab.dash', {
        url: '/dash',
        views: {
          'tab-dash': {
            templateUrl: 'templates/tab-dash.html',
            controller: 'DashCtrl'
          }
        }
      })
      .state('tab.camera', {
        url: '/camera',
        views: {
          'tab-camera': {
            templateUrl: 'templates/tab-camera.html',
            controller: 'CameraCtrl'
          }
        }
      })
      .state('tab.ibeacon', {
        url: '/ibeacon',
        views: {
          'tab-ibeacon': {
            templateUrl: 'templates/tab-ibeacon.html',
            controller: 'IbeaconController'
          }
        }
      })
      .state('tab.bcreader', {
        url: '/bcreader',
        views: {
          'tab-bcreader': {
            templateUrl: 'templates/tab-bcreader.html',
            controller: 'BarCodeReaderController'
          }
        }
      })
      .state('tab.sqllite', {
        url: '/sqllite',
        views: {
          'tab-sqllite': {
            templateUrl: 'templates/tab-sqllite.html',
            controller: 'SQLliteController'
          }
        }
      })

      .state('tab.chats', {
        url: '/chats',
        views: {
          'tab-chats': {
            templateUrl: 'templates/tab-chats.html',
            controller: 'ChatsCtrl'
          }
        }
      })
      .state('tab.chat-detail', {
        url: '/chats/:chatId',
        views: {
          'tab-chats': {
            templateUrl: 'templates/chat-detail.html',
            controller: 'ChatDetailCtrl'
          }
        }
      })

      .state('tab.account', {
        url: '/account',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account.html',
            controller: 'AccountCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');

  });


