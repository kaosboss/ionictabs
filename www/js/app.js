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
var enableBeacons = true;

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

  .run(function ($ionicPlatform, $rootScope, $cordovaSQLite) {
    $ionicPlatform.ready(function () {
      console.log("ionic platform  ready");
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
      document.addEventListener("deviceready", function () {
        $rootScope.enableBeacons = enableBeacons;
        $rootScope.deviceBUSY  = 0;
        console.log("ionic platform db: init firsttime"); // #### DB #########
        db = $rootScope.db = $cordovaSQLite.openDB({name: "snpquinta.db", location: "default"});
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS `info` ( `name`	TEXT,	`value`	TEXT)");
      });
    });
  })
  .controller('DashCtrl', function ($rootScope, $scope, $cordovaSQLite, $ionicPopup, $timeout) {

    document.addEventListener("deviceready", function () {

      //$scope.msg = "";

      $scope.showAlert = function () {
        var alertPopup = $ionicPopup.alert({
          scope: $scope,
          title: 'INFORMACAO',
          template: $scope.msg
        });

        alertPopup.then(function (res) {
          console.log('OK on APP version');
        });

        $timeout(function () {
          alertPopup.close();
        }, 5000);
      };

      var dbres = 0;
      console.log("Dashboard controller, first controller");
      if (!db) {
        dbres = 2;
        console.log("ionic platform db: init, second"); // #### DB #########
        db = $rootScope.db = $cordovaSQLite.openDB({name: "snpquinta.db", location: "default"});
        $cordovaSQLite.execute($rootScope.db, "CREATE TABLE IF NOT EXISTS `info` ( `name`	TEXT,	`value`	TEXT)");
      }

      dbres = 1;
      // "select value from info where name=?", ["APP"]
      var query = "select value from info where name=?";
      $cordovaSQLite.execute($scope.db, query, ["APP"]).then(function (res) {
        if (res.rows.length > 0) {
          // var message = "SELECTED -> " + res.rows.item(0).value;
          // alert(message);
          // console.log(message);
          console.log("Got APP version: Installed v" + res.rows.item(0).value);
          $scope.msg = "Got APP version: Installed v" + res.rows.item(0).value + "(" + dbres + ")";
          $scope.showAlert();
        } else {
          $scope.msg = "No results found, primeira utilizacao!";
          $scope.showAlert();
          console.log("No results found, firsttime?");

          var query = "INSERT INTO `info` (name,value) VALUES ('APP', " + APPverion + ")";
          $cordovaSQLite.execute($scope.db, query, []).then(function (res) {
            // var message = "INSERT ID -> " + res.insertId;
            // console.log(message);
            console.log("Inserted APP version: v" + APPverion + " tutorial: ON");
            $scope.msg = "Inserted APP version: v" + APPverion + " tutorial: ON";
            APPfirstTime = 1;
            $scope.showAlert();
            // alert(message);
          }, function (err) {
            console.error(err);
            alert(err);
          });

          var query = "INSERT INTO `info` (name,value) VALUES ('APPtutorial', 'Sim')";
          $cordovaSQLite.execute($scope.db, query, []).then(function (res) {
            var message = "INSERT ID -> " + res.insertId;
            console.log(message);
            console.log("Inserted APP tutorial: Sim");
            APPtutorial = 1;
            alert(message);
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
  })
  .controller("IbeaconController", function ($rootScope, $scope, $ionicPlatform) {

    $scope.beacons = {};
    $scope.myRegion = null;
    var myRegion = null;

    var uuid = '74278BDA-B644-4520-8F0C-720E1F6EF512'; // mandatory
    var identifier = 'PIs'; // mandatory
    var minor = 64001; // optional, defaults to wildcard if left empty
    var major = 4660; // optional, defaults to wildcard if left empty
    // throws an error if the parameters are not valid
    console.log("ionic controller IBEACON ready");
    $ionicPlatform.ready(function () {
      console.log("ionic controller platform ready");
      if (!myRegion) {
        myRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major);
        console.log("myRegion Created");
        $scope.myRegion = myRegion;
      }
    });

    $scope.startScan = function () {
      var delegate = new cordova.plugins.locationManager.Delegate();

      delegate.didDetermineStateForRegion = function (pluginResult) {
      };

      delegate.didStartMonitoringForRegion = function (pluginResult) {
      };

      delegate.didRangeBeaconsInRegion = function (pluginResult) {
        var i = 0;
        // console.log('XX: didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));
        // cordova.plugins.locationManager.appendToDeviceLog('didRangeBeaconsInRegion:' + JSON.stringify(pluginResult));
        // console.log("event, plug res: UUID: %s prox: %s lenght: %s", pluginResult.beacons[i].uuid, pluginResult.beacons[i].proximity, pluginResult.beacons[i].length, event, pluginResult.beacons[i]);
        var uniqueBeaconKey;
        for (i = 0; i < pluginResult.beacons.length; i++) {
          pluginResult.beacons[i].nome = "PI 1-2";
          uniqueBeaconKey = pluginResult.beacons[i].uuid + ":" + pluginResult.beacons[i].major + ":" + pluginResult.beacons[i].minor;
          if ((!$scope.beacons[uniqueBeaconKey])) {
            $rootScope.currentRI = pluginResult.beacons[i].nome;
            // console.log("Device busy: %s", $rootScope.deviceBUSY);
            if (!$rootScope.deviceBUSY) {
              // console.log("Device free not busy");
              if ($rootScope.enableBeacons) {
                $rootScope.$broadcast('RI_FOUND');
                console.log("Sending broadcast RI_FOUND");
              } else
                console.log("NoT enabled beacons for broadcast RI_FOUND");
            } else console.log("Device BUSY for broadcast RI_FOUND, queue?ß");
          }
          $scope.beacons[uniqueBeaconKey] = pluginResult.beacons[i];
          // console.log("FOUND: ", pluginResult.beacons[i].uuid, pluginResult.beacons[i].proximity)
        }
        // $scope.$apply();
      };

      cordova.plugins.locationManager.setDelegate(delegate);
      //  required in iOS 8+
      // cordova.plugins.locationManager.requestWhenInUseAuthorization();
      cordova.plugins.locationManager.requestAlwaysAuthorization();

      cordova.plugins.locationManager.startRangingBeaconsInRegion($scope.myRegion)
        .fail(function (e) {
          console.log("ERROR: START SCAN ", e);
        })
        .done(function (e) {
          console.log("Done: START SCAN", e);
        });
    };

    $scope.stopScan = function () {

      cordova.plugins.locationManager.stopRangingBeaconsInRegion($scope.myRegion)
        .fail(function (e) {
          console.log("ERROR STOP SCAN", e);
        })
        .done(function (e) {
          console.log("Done: STOP SCAN", e);
          $scope.beacons = {};
          // $scope.$apply();
        });
    };
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
        title: 'Regiao de interesse: ' + $scope.currentRI,
        template: 'Estás perto da Regiao ' + $scope.currentRI + ', queres ver o conteudo?',
        scope: $scope,
        buttons: [
          {text: 'FICAR'},
          {
            text: '<b>IR</b>',
            type: 'button-positive',
            onTap: function (e) {
              // if (!$scope.data.wifi) {
              //   //don't allow the user to close unless he enters wifi password
              //   e.preventDefault();
              // } else {
              //   return $scope.data.wifi;
              // }
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
    $scope.showAlert = function () {
      var alertPopup = $ionicPopup.alert({
        title: 'Don\'t eat that!',
        template: 'It might taste good'
      });

      alertPopup.then(function (res) {
        console.log('Thank you for not eating my delicious ice cream cone');
      });
    };

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
  .controller('CameraCtrl', function ($rootScope, $scope, $cordovaCamera, $cordovaDevice, $cordovaSQLite, $ionicPlatform) {

    // $scope.lastPhoto ="";

    document.addEventListener("deviceready", function () {

      console.log("camera controller ready 1");
      $ionicPlatform.ready(function () {
        console.log("retrieving first pic");
        var query = "select value from info where name=?";
        $cordovaSQLite.execute($scope.db, query, ["IMG"]).then(function (res) {
          if (res.rows.length > 0) {
            var message = "SELECTED -> " + res.rows.item(res.rows.length - 1).value;
            alert(message);
            console.log(message, res);
            $scope.lastPhoto = res.rows.item(res.rows.length - 1).value;
            // $scope.$apply();
          } else {
            alert("No results found");
            console.log("No results found");
          }
        }, function (err) {
          alert(err);
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

        var query = "INSERT INTO `info` (name,value) VALUES ('IMG', '" + entry.toURL() + "')";
        $cordovaSQLite.execute($scope.db, query, []).then(function (res) {
          var message = "INSERT ID -> " + res.insertId;
          console.log(message);
          alert(message);
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
        $cordovaCamera.cleanup().then(function () {
          console.log("CleanUP Enter");

        }); // only for FILE_URI
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
    $scope.tutorial = "Nao";
    $scope.firstTime = "Nao";

    if (APPfirstTime)
      $scope.firstTime = "Sim";
    if (APPtutorial)
      $scope.tutorial = "Sim";

    console.log("ionic controller SQLliteController ready");

    // $scope.insert = function (firstname, lastname) {
// //alert('check: ' + $scope.aaa);
//         var query = "INSERT INTO `info` (name,value) VALUES ('APP', " + APPverion + ")";
//         $cordovaSQLite.execute($scope.db, query, []).then(function (res) {
//           var message = "INSERT ID -> " + res.insertId;
//           console.log(message);
//           alert(message);
//         }, function (err) {
//           console.error(err);
//           alert(err);
//         });
//       }
//
//       $scope.select = function (lastname) {
//         var query = "SELECT firstname, lastname FROM people WHERE lastname = ?";
//         $cordovaSQLite.execute($scope.db, query, [lastname]).then(function (res) {
//           if (res.rows.length > 0) {
//             var message = "SELECTED -> " + res.rows.item(0).firstname + " " + res.rows.item(0).lastname;
//             alert(message);
//             console.log(message);
//           } else {
//             alert("No results found");
//             console.log("No results found");
//           }
//         }, function (err) {
//           alert(err);
//           console.error(err);
//         });
//       }

    $scope.isTutorial = function () {

      console.log("ionic controller SQLliteController isTutotial");

      $ionicPlatform.ready(function () {

        var query = "select value from info where name=?";
        $cordovaSQLite.execute($scope.db, query, ["APPtutorial"]).then(function (res) {
          if (res.rows.length > 0) {
            var message = "SELECTED -> " + res.rows.item(0).value;
            alert(message);
            console.log(message);
            $scope.tutorial = res.rows.item(0).value;
          } else {
            alert("No results found");
            console.log("No results found");
          }
        }, function (err) {
          alert(err);
          console.error(err);
        });
      })
    };

    $scope.updateTutorial = function () {
      console.log("ionic controller SQLliteController updateTutorial");
      $ionicPlatform.ready(function () {
        var query = "update info set value='Nao' where name='APPtutorial'";
        $cordovaSQLite.execute($scope.db, query, []).then(function (res) {
          // var message = "INSERT ID -> " + res.insertId;
          console.log("update APPtutorial");
          alert("update APPtutorial Nao");
          APPtutorial = 0;
        }, function (err) {
          console.error(err);
          alert(err);
        });
      })
    };

    $scope.moreTutorial = function () {
      console.log("ionic controller SQLliteController updateTutorial");
      $ionicPlatform.ready(function () {
        var query = "update info set value='Sim' where name='APPtutorial'";
        $cordovaSQLite.execute($scope.db, query, []).then(function (res) {
          // var message = "INSERT ID -> " + res.insertId;
          console.log("update APPtutorial");
          alert("update APPtutorial Sim");
          APPtutorial = 1;
        }, function (err) {
          console.error(err);
          alert(err);
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


