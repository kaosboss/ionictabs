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
var debug = 0;
var noBLE = 1;

cw = function (value) {
  initialOutput += value + '\n';
  console.log(value);
};

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

  .run(function ($ionicPlatform, $rootScope) {
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
      cordova.plugins.BluetoothStatus.initPlugin();
      $rootScope.popupQueue = [];
      $rootScope.showPopup = function (popup) {
        $rootScope.mypop = popup;
        $rootScope.$broadcast("SHOW_POPUP");
      };
      $rootScope.showAlert = function (msg) {
        $rootScope.mypop = {
          template: msg || '',
          title: 'INFORMAÇÃO',
          subTitle: '',
          buttonText: "OK"
        };
        $rootScope.$broadcast("SHOW_POPUP");
      }
    });
  })
  .controller('DashCtrl', function ($window, $rootScope, $scope, $ionicPopup, $timeout, $ionicPlatform, $cordovaSQLite, $IbeaconScanner, $cordovaNetwork, UserService) {

    dbres = 0;
    if (debug) alert("start");

    $scope.netWork = {
      type: "",
      isOnline: false,
      isOffline: true,
      onlineState: "",
      offLineState: ""
    };

    $ionicPlatform.ready(function () {
        cw("ionic platform ready");
        $scope.checkNetwork = function () {
          $scope.netWork.type = $cordovaNetwork.getNetwork();
          $scope.netWork.isOnline = $cordovaNetwork.isOnline();
          $scope.netWork.isOffline = $cordovaNetwork.isOffline();

          $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
            $scope.netWork.onlineState = networkState;
            $scope.netWork.isOnline = true;
            $scope.netWork.isOffline = false;
            $rootScope.showAlert("NetWork ONLINE");
          });

          $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
            $scope.netWork.offlineState = networkState;
            $scope.netWork.isOnline = false;
            $scope.netWork.isOffline = true;
            $rootScope.showAlert("NetWork OFFLINE");
          });
        };
        // $scope.checkNetwork();
        // cordova.plugins.BluetoothStatus.initPlugin();
        // db = $rootScope.db = $window.sqlitePlugin.openDatabase({name: "snpquinta.db", location: "default"});
        db = $rootScope.db = $cordovaSQLite.openDB({name: "snpquinta.db", location: "default"});

        if (db) {
          cw("DB open");
          console.log("DB", db);
          $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS `info` ( `name`	TEXT,	`value`	TEXT)", []).then(function (res) {
            // alert("OK onDB create");
            cw("Table info");
          }, function (err) {
            alert(err);
          });
          $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS `journal` (`IMG`	TEXT, `caption`	TEXT, `thumbnail`	TEXT, `thumbnail_data`	TEXT)", []).then(function (res) {          // alert("OK onDB create");
            cw("Table journal");
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
            console.log("Got APP version: Installed v" + res.rows.item(0).value + "PLAT: " + currentPlatform + " VER: " + currentPlatformVersion);
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

        checkBT = function () {
          var msg = "Has BT: " + cordova.plugins.BluetoothStatus.hasBT + " Has BLE: " + cordova.plugins.BluetoothStatus.hasBTLE + " isBTenable: " + cordova.plugins.BluetoothStatus.BTenabled;

          if (cordova.plugins.BluetoothStatus.hasBTLE) {
            noBLE = 0;
            $rootScope.enableBeacons = true;

            $window.addEventListener('BluetoothStatus.enabled', function () {
              console.log('Bluetooth has been enabled');
              if (!$IbeaconScanner.isScanning())
                $IbeaconScanner.startBeaconScan();
            });
            $window.addEventListener('BluetoothStatus.disabled', function () {
              console.log('Bluetooth has been disabled');
              if ($IbeaconScanner.isScanning())
                $IbeaconScanner.stopBeaconScan();

              $rootScope.showPopup({
                title: "INFORMAÇÃO",
                buttonText: "OK",
                template: "O bluetooth está desligado, sem alertas de interesse"
              });
            });

            if (device.platform === 'iOS') {
              msg = msg + " IOS: isAuthorized: " + cordova.plugins.BluetoothStatus.iosAuthorized;
              if (!cordova.plugins.BluetoothStatus.BTenabled) {
                console.log("TURN BT ON - IOS");
                $scope.showBT("Ligue o Bluetooth para a localizaçao na Quinta");
              } else {
                $IbeaconScanner.startBeaconScan();
              }
            }
            if (device.platform === 'Android') {
              if (!cordova.plugins.BluetoothStatus.BTenabled) {
                cordova.plugins.BluetoothStatus.promptForBT();
              } else {
                $IbeaconScanner.startBeaconScan();
              }
            }
          }
          // $scope.showBT(msg);
          console.log(msg);
        };

        // $scope.Download = function (imgurl) {
        //
        //   if ($scope.netWork.isOffline)
        //     return;
        //
        //   if (!imgurl)
        //     imgurl = document.getElementById("fb_photo");
        //   console.log("IMG URL: %s", imgurl.src);
        //
        //   var url = imgurl.src;
        //   var filename = url.split("/").pop();
        //   var targetPath = cordova.file.documentsDirectory + filename;
        //   var d = new Date();
        //   var n = d.getTime();
        //   //new file name
        //   var newFileName = n + ".jpg";
        //   console.log("DOC DIR: %s", cordova.file.documentsDirectory);
        //
        //   // $ionicLoading.show({
        //   //   template: 'Logging in...'
        //   // });
        //
        //   window.requestFileSystem(LocalFileSystem.PERSISTENT, 5 * 1024 * 1024, function (fs) {
        //
        //     console.log('file system open: ' + fs.name);
        //
        //     // Make sure you add the domain name to the Content-Security-Policy <meta> element.
        //     // var url = 'http://cordova.apache.org/static/img/cordova_bot.png';
        //     // Parameters passed to getFile create a new file or return the file if it already exists.
        //
        //     fs.root.getFile(newFileName, { create: true, exclusive: false }, function (fileEntry) {
        //       // download(fileEntry, url, true);
        //
        //       $cordovaFileTransfer.download(url, fileEntry.toURL(), {}, true).then(function (result) {
        //         console.log('Save file on ' + fileEntry.toURL() + ' success!');
        //         $scope.note = 'Save file on ' + fileEntry.toURL() + ' success!';
        //         $scope.profile_photo=fileEntry.toURL();
        //         // $ionicLoading.hide();
        //         var tempUser = UserService.getUser();
        //         tempUser.then(function (res) {
        //           var userInfo = JSON.parse(res || '{}')
        //           console.log("GOT USER from user service", userInfo);
        //           userInfo.picture = fileEntry.toURL();
        //           UserService.setUser(userInfo);
        //         });
        //
        //       }, function (error) {
        //         $scope.note = 'Error Download file';
        //       }, function (progress) {
        //         $scope.downloadProgress = (progress.loaded / progress.total) * 100;
        //       });
        //
        //     }, function () {
        //       console.log("onErrorCreateFile");
        //     });
        //
        //   }, function () {
        //     console.log("onErrorLoadFs");
        //   });
        //
        // };
        // $timeout(checkBT, 3000);

      }
    );

    // });


    // $scope.startBeaconScanning = function () {
    //   $IbeaconScanner.startBeaconScan();
    // };
    //
    // $scope.stopBeaconScanning = function () {
    //   $IbeaconScanner.stopBeaconScan();
    // };
    //

    $scope.showBT = function (msg) {
      var alertPopup2 = $ionicPopup.alert({
        scope: $scope,
        title: 'INFORMACAO',
        template: msg
      });

      alertPopup2.then(function (res) {
        console.log('OK on BT info');
      });

      $timeout(function () {
        alertPopup2.close();
      }, 5000);
    };

    $scope.showAlert = function (msg) {
      var alertPopup = $ionicPopup.alert({
        scope: $scope,
        title: 'INFORMACAO',
        template: msg
      });

      alertPopup.then(function (res) {
        console.log('OK on APP version');
        checkBT();
        $scope.checkNetwork();
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

      if (cordova.plugins.BluetoothStatus.hasBTLE) {

        cw("IbeaconController: BLE support found!");

        $rootScope.enableBeacons = true;

        $scope.$on("BEACONS_UPDATE", function (e) {
          $scope.beacons = $rootScope.beacons;
          console.log("Received broadcast BEACONS_UPDATE");
          $scope.$apply();
        });

        $scope.$on("$ionicView.beforeEnter", function (event, data) {
          $IbeaconScanner.sendUpdates(true);
          console.log("State $ionicView.beforeEnter Params: ", data);
        });

        $scope.$on("$ionicParentView.beforeLeave", function (event, data) {
          $IbeaconScanner.sendUpdates(false);
          console.log("State $ionicParentView.beforeLeave Params: ", data);
        });
      } else cw("IbeaconController: NO BLE support found!");

    });

  })
  .controller('PopupCtrl', function ($rootScope, $scope, $ionicPopup, $timeout) {

// Triggered on a button click, or some other target
    $scope.showPopup = function (mypop) {
      $scope.data = {};
      if (!mypop)
        mypop = {};

      if (!mypop.timeout)
        mypop.timeout = 5000;

      var buttonText = mypop.buttonText || "OK";
      var oButtons = mypop.oButtons || [
          {
            text: '<b>' + mypop.buttonText + '</b>',
            type: 'button-positive',
          }
        ];
      var myPopup = $ionicPopup.show({
        template: mypop.template || '',
        title: mypop.title || 'INFORMAÇÃO',
        subTitle: mypop.subTitle || '',
        scope: $scope,
        buttons: oButtons
      });

      myPopup.then(function (res) {
        console.log('Force Tap!');
        $scope.popupON = 0;
      });

      $timeout(function () {
        myPopup.close();
      }, mypop.timeout);
    };

    $scope.$on('SHOW_POPUP', function (e) {
      // do something
      // console.log("POPUP controller scope.on RI_FOUND, enter.");
      if (!$scope.popupON) {
        $scope.popupON = 1;
        $scope.showPopup($rootScope.mypop);
      }
      else {
        if ($rootScope.mypop.queue) {
          console.log("ShowPopUP: Got event, but popup ON, skipping, but queue: ", $rootScope.mypop);
          $rootScope.popupQueue.push($rootScope.mypop);
        }
      }
    });

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
        $cordovaSQLite.execute($scope.db, query, [entry.toURL(), "No caption yet!"]).then(function (res) {
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
  .controller('WelcomeCtrl', function ($scope, $rootScope, $state, $q, UserService, $ionicLoading, $ionicPlatform, $cordovaSQLite, $cordovaFileTransfer,$cordovaNetwork) {
    // This is the success callback from the login method

    $scope.fb = {
      loggedIN: true
    };

    $scope.logged = function () {
      return $scope.fb.loggedIN;
    };

    $ionicPlatform.ready(function () {

      $scope.Download = function (url) {

        if ($scope.netWork.isOffline)
          return;

        if (!url)
          url = document.getElementById("fb_photo").src;

        console.log("IMG URL: %s", url);

        // var url = imgurl;
        // var filename = url.split("/").pop();
        // var targetPath = cordova.file.documentsDirectory + filename;
        var d = new Date();
        var n = d.getTime();
        //new file name
        var newFileName = n + ".jpg";
        // console.log("DOC DIR: %s", cordova.file.documentsDirectory);

        // $ionicLoading.show({
        //   template: 'Logging in...'
        // });

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 5 * 1024 * 1024, function (fs) {

          console.log('file system open: ' + fs.name);

          // Make sure you add the domain name to the Content-Security-Policy <meta> element.
          // var url = 'http://cordova.apache.org/static/img/cordova_bot.png';
          // Parameters passed to getFile create a new file or return the file if it already exists.

          fs.root.getFile(newFileName, {create: true, exclusive: false}, function (fileEntry) {
            // download(fileEntry, url, true);

            $cordovaFileTransfer.download(url, fileEntry.toURL(), {}, true).then(function (result) {
              console.log('Save file on ' + fileEntry.toURL() + ' success!');
              $scope.note = 'Save file on ' + fileEntry.toURL() + ' success!';
              $scope.profile_photo = fileEntry.toURL();
              // $ionicLoading.hide();
              var tempUser = UserService.getUser();
              tempUser.then(function (res) {
                var userInfo = JSON.parse(res || '{}')
                console.log("GOT USER from user service", userInfo);
                userInfo.picture = fileEntry.toURL();
                UserService.setUser(userInfo);
              });

            }, function (error) {
              $scope.note = 'Error Download file';
            }, function (progress) {
              $scope.downloadProgress = (progress.loaded / progress.total) * 100;
            });

          }, function () {
            console.log("onErrorCreateFile");
          });

        }, function () {
          console.log("onErrorLoadFs");
        });

      };

      $cordovaSQLite.getVarFromDB("info", "userinfo").then(function (res) {
        user = JSON.parse(res || '{}');
        // console.log("RES USER:", res);
        $scope.profile_photo = user.picture;
        $scope.profile_name = user.name;
        $scope.profile_email = user.email;
        console.log("FB NAME3: %s pic: %s", user.name, user.picture);
        $scope.fb.loggedIN=true;
      });


      var fbLoginSuccess = function (response) {
        if (!response.authResponse) {
          fbLoginError("Cannot find the authResponse");
          return;
        }

        var authResponse = response.authResponse;

        getFacebookProfileInfo(authResponse)
          .then(function (profileInfo) {
            // For the purpose of this example I will store user data on local storage
            UserService.setUser({
              authResponse: authResponse,
              userID: profileInfo.id,
              name: profileInfo.name,
              email: profileInfo.email,
              picture: "https://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
            });
            // console.log({
            //   authResponse: authResponse,
            //   userID: profileInfo.id,
            //   name: profileInfo.name,
            //   email: profileInfo.email,
            //   picture: "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
            // });

            $scope.profile_photo = "https://graph.facebook.com/" + authResponse.userID + "/picture?type=large";
            $scope.profile_name = profileInfo.name;
            $scope.profile_email = profileInfo.email;

            console.log("GOT FB: ", profileInfo.name, "https://graph.facebook.com/" + authResponse.userID + "/picture?type=large");

            $ionicLoading.hide();

            // $state.go('tab.camera');
            $scope.Download("https://graph.facebook.com/" + authResponse.userID + "/picture?type=large");

          }, function (fail) {
            // Fail get profile info
            console.log('profile info fail', fail);
          });
      };

      // This is the fail callback from the login method
      var fbLoginError = function (error) {
        console.log('fbLoginError', error);
        $ionicLoading.hide();
        $scope.fb.loggedIN=false;
      };

      // This method is to get the user profile info from the facebook api
      var getFacebookProfileInfo = function (authResponse) {
        var info = $q.defer();

        facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
          function (response) {
            console.log(response);
            info.resolve(response);
          },
          function (response) {
            console.log(response);
            info.reject(response);
          }
        );
        return info.promise;
      };

      //This method is executed when the user press the "Login with facebook" button
      $scope.facebookSignIn = function () {

        if (!$cordovaNetwork.isOnline()) {
          $rootScope.showAlert("Ligue a Internet e tente novamente");
          return;
        }

        facebookConnectPlugin.getLoginStatus(function (success) {
          if (success.status === 'connected') {
            // The user is logged in and has authenticated your app, and response.authResponse supplies
            // the user's ID, a valid access token, a signed request, and the time the access token
            // and signed request each expire
            console.log('getLoginStatus', success.status);

            // Check if we have our user saved
            // var userp = UserService.getUser('facebook');
            // var user = userp.then(function (res) {
            //   return(res);
            // });
            var user;

            $cordovaSQLite.getVarFromDB("info", "userinfo").then(function (res) {
              user = res;
              console.log("RES USER:", res);

              // UserService.getUser('facebook').then(function (res) {
              //   user = res;
              console.log("getUser: Got: ", user);
              // });

              if (!user.userID) {
                getFacebookProfileInfo(success.authResponse)
                  .then(function (profileInfo) {
                    // For the purpose of this example I will store user data on local storage
                    UserService.setUser({
                      authResponse: success.authResponse,
                      userID: profileInfo.id,
                      name: profileInfo.name,
                      email: profileInfo.email,
                      picture: "https://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
                    });
                    $scope.profile_photo = "https://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large";
                    $scope.profile_name = profileInfo.name;
                    $scope.profile_email = profileInfo.email;
                    // $scope.$apply();
                    console.log("FB NAME2: %s pic: %s", profileInfo.name, profileInfo.picture);
                    // $state.go('tab.camera');
                    $scope.Download("https://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large");
                    $rootScope.showAlert("Facebook Logged IN com o nome: " +profileInfo.name + " email: " + profileInfo.email);
                  }, function (fail) {
                    // Fail get profile info
                    console.log('profile info fail', fail);
                  });
              } else {
                $scope.profile_photo = user.picture;
                $scope.profile_name = user.name;
                $scope.profile_email = user.email;
                console.log("FB NAME: %s pic: %s", user.name, user.picture);
                $scope.$apply();
                $state.go('tab.camera');
              }

            });

          } else {
            // If (success.status === 'not_authorized') the user is logged in to Facebook,
            // but has not authenticated your app
            // Else the person is not logged into Facebook,
            // so we're not sure if they are logged into this app or not.

            console.log('getLoginStatus', success.status);

            $ionicLoading.show({
              template: 'Logging in...'
            });

            // Ask the permissions you need. You can learn more about
            // FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
            facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
          }
        });
      };
    });

  })
  .controller('HomeCtrl', function ($scope, $rootScope, UserService, $ionicActionSheet, $state, $ionicLoading, $ionicPlatform, $cordovaNetwork, $cordovaSQLite) {

    $ionicPlatform.ready(function () {

      // var getUser = UserService.getUser();

      $scope.showLogOutMenu = function () {

        if (!$cordovaNetwork.isOnline()) {
          $rootScope.showAlert("Ligue a Internet e tente novamente");
          return;
        }

        var hideSheet = $ionicActionSheet.show({
          destructiveText: 'Logout',
          titleText: 'De certeza que quer fazer logout?',
          cancelText: 'Cancelar',
          cancel: function () {
          },
          buttonClicked: function (index) {
            return true;
          },
          destructiveButtonClicked: function () {
            $ionicLoading.show({
              template: 'Logging out...'
            });

            // Facebook logout
            facebookConnectPlugin.logout(function () {
                $ionicLoading.hide();
                // $state.go('tab.camera');
              $rootScope.showAlert("Facebook Logged OUT!");
              },
              function (fail) {
                $ionicLoading.hide();
              });
          }
        });
      };
    });
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


