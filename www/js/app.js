// Ionic Starter App
// Ionic Starter App
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var APPverion = "0.2";
var APPtutorial = 0;
var APPfirstTime = 0;
var APPdir = null;
var db = null;
var enableBeacons = false;
var initialOutput = "";
var debug = 0;
var noBLE = 1;
// var aCircles_inicial = [
//   {
//     nome: "RI_A",
//     descricao: "Região de interesse A",
//     centerX: 273,
//     centerY: 105,
//     radius: 20,
//     locked: false
//   },
//   {
//     nome: "RI_B",
//     descricao: "Região de interesse B",
//     centerX: 230,
//     centerY: 95,
//     radius: 20,
//     locked: false
//   },
//   {
//     nome: "RI_C",
//     descricao: "Região de interesse C",
//     centerX: 187,
//     centerY: 88,
//     radius: 22,
//     locked: false
//   },
//   {
//     nome: "RI_D",
//     descricao: "Região de interesse D",
//     centerX: 135,
//     centerY: 70,
//     radius: 32,
//     locked: true
//   },
//   {
//     nome: "RI_E",
//     descricao: "Região de interesse E",
//     centerX: 53,
//     centerY: 50,
//     radius: 36,
//     locked: true
//   },
//   {
//     nome: "RI_F",
//     descricao: "Região de interesse F",
//     centerX: 75,
//     centerY: 110,
//     radius: 31,
//     locked: true
//   },
//   {
//     nome: "RI_G",
//     descricao: "Região de interesse G",
//     centerX: 178,
//     centerY: 125,
//     radius: 20,
//     locked: true
//   },
//   {
//     nome: "RI_H",
//     descricao: "Região de interesse H",
//     centerX: 225,
//     centerY: 125,
//     radius: 20,
//     locked: true
//   }
// ];

cw = function (value) {
  initialOutput += value + '\n';
  console.log(value);
};

angular.module('starter', ['ionic', 'firebase', 'ion-floating-menu', 'ngAnimate', 'ionic.contrib.ui.tinderCards', 'starter.controllers', 'starter.services'])

  .run(function ($ionicPlatform, $rootScope, $ionicHistory, $window) {
    $rootScope.APP = {
      logged: false,
      user: {}
    };

    if (ionic.Platform.platform() == "android")
      $ionicPlatform.registerBackButtonAction(function (e) {
        if ($rootScope.backButtonPressedOnceToExit) {
          ionic.Platform.exitApp();
        }

        else if ($ionicHistory.backView()) {
          $ionicHistory.goBack();
        }
        else {
          $rootScope.backButtonPressedOnceToExit = true;
          window.plugins.toast.showShortCenter(
            "Pressione o botão novamente para sair", function (a) {
            }, function (b) {
            }
          );
          setTimeout(function () {
            $rootScope.backButtonPressedOnceToExit = false;
          }, 2000);
        }
        e.preventDefault();
        return false;
      }, 101);

    $ionicPlatform.ready(function () {
      cw("ionic startting run");
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }

      cordova.plugins.BluetoothStatus.initPlugin();
      $rootScope.popupQueue = [];

      $rootScope.smallDevice = false;
      $rootScope.currentRI = "Sem região de interesse"
      $rootScope.showPopup = function (popup) {
        $rootScope.mypop = popup;
        $rootScope.$broadcast("SHOW_POPUP");
      };
      $rootScope.showAlert = function (msg) {
        $rootScope.mypop = {
          cssClass: "myPopup",
          template: msg || '',
          title: 'INFORMAÇÃO',
          subTitle: '',
          buttonText: "OK"
        };
        $rootScope.$broadcast("SHOW_POPUP");
      };

      ionic.Platform.fullScreen();
      if ($window.StatusBar) {
        return $window.StatusBar.hide();
        // org.apache.cordova.statusbar required
        // StatusBar.styleDefault();
      }
    });
  })
  // .controller('DashCtrl', function ($window, $rootScope, $scope, $ionicPopup, $timeout, $ionicPlatform, $cordovaSQLite, $IbeaconScanner, $cordovaNetwork, UserService, users, $regioes, $ionicLoading) {
  .controller('DashCtrl', function ($window, $rootScope, $scope, $ionicPopup, $timeout, $ionicPlatform, $cordovaSQLite, $IbeaconScanner, $cordovaNetwork, UserService, users, $regioes, $state, perguntas) {

    dbres = 0;
    if (debug) alert("start");

    $scope.logged = $rootScope.APP.logged;

    $scope.netWork = {
      type: "",
      isOnline: false,
      isOffline: true,
      onlineState: "",
      offLineState: ""
    };

    // $ionicLoading.show({
    //   template: 'A carregar...'
    // });

    $ionicPlatform.ready(function () {
        cw("ionic platform ready");

        $window.document.addEventListener("pause", function (event) {
          // $rootScope.$broadcast('cordovaPauseEvent');
          console.log('run() -> cordovaPauseEvent');
        });

        $window.document.addEventListener("resume", function (event) {
          // $rootScope.$broadcast('cordovaResumeEvent');
          console.log('run() -> cordovaResumeEvent');
        });

        $scope.checkNetwork = function () {
          $scope.netWork.type = $cordovaNetwork.getNetwork();
          $scope.netWork.isOnline = $cordovaNetwork.isOnline();
          $rootScope.isOnline = $cordovaNetwork.isOnline();
          $rootScope.netWorktype = $cordovaNetwork.getNetwork();
          $scope.netWork.isOffline = $cordovaNetwork.isOffline();

          $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
            $scope.netWork.type = networkState;
            $rootScope.netWorktype = networkState;
            $rootScope.isOnline = true;
            $scope.netWork.isOnline = true;
            $scope.netWork.isOffline = false;
            $rootScope.showAlert("NetWork ONLINE");
          });

          $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
            $scope.netWork.type = networkState;
            $rootScope.netWorktype = networkState;
            $scope.netWork.isOnline = false;
            $rootScope.isOnline = false;
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
          $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS `journal` (`IMG`	TEXT, `caption`	TEXT, `thumbnail`	TEXT, `thumbnail_data`	TEXT)", []).then(function (res) {
            cw("Table journal");
          }, function (err) {
            alert(err);
          });
          $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS `regioes` ( `name`	TEXT,	`value`	TEXT)", []).then(function (res) {
            cw("Table regioes");
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
            var currentDevice = ionic.Platform.device();

            // if ((currentDevice.model.indexOf("iPhone4") != -1) || (currentDevice.model.indexOf("iPhone5") != -1)) {
            //   $rootScope.smallDevice = true;
            //   $scope.showAlert("Got APP version: Installed v" + res.rows.item(0).value + "(" + dbres + ") PLAT: " + currentPlatform + " VER: " + currentPlatformVersion + " Model: " + currentDevice.model);
            // }

            // $ionicLoading.hide();
            console.log("Got APP version: Installed v" + res.rows.item(0).value + "PLAT: " + currentPlatform + " VER: " + currentPlatformVersion);
            $scope.checkNetwork();
            var tempUser = UserService.getUser();
            tempUser.then(function (res) {
              var userInfo = JSON.parse(res || '{}')
              console.log("GOT USER from user service", userInfo);
              if (userInfo.picture && userInfo.name && userInfo.picture) {
                $rootScope.APP.logged = true;
                $rootScope.APP.user.name = userInfo.name;
                $rootScope.APP.user.email = userInfo.email;
                $rootScope.APP.user.picture = userInfo.picture;
                $scope.logged = true;
                users.offline();
                console.log("USER: LOGGED: true");
                checkBT();
                $state.go("tab.atividades");
              } else {
                $rootScope.APP.logged = false;
                $scope.logged = false;
                console.log("USER: LOGGED: false");
                $rootScope.enableBeacons = false;
                checkBT();
                // setTimeout(function () {
                //   $state.go("tab.login");
                // }, 300)
              }
            });

          } else {
            $scope.checkNetwork();
            $scope.showAlert("No results found, primeira utilizacao!");
            console.log("No results found, firsttime?");

            var query = "INSERT INTO `info` (name,value) VALUES ('APP', " + APPverion + ")";
            $cordovaSQLite.execute(db, query, []).then(function (res) {
              // var message = "INSERT ID -> " + res.insertId;
              // console.log(message);
              console.log("Inserted APP version: v" + APPverion + " tutorial: ON");
              APPfirstTime = 1;
              // $scope.showAlert("Inserted APP version: v" + APPverion + " tutorial: ON");
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

            perguntas.getRegioesInicio().then(function (res) {
              $regioes.setRegioes(res);
            });

            $rootScope.enableBeacons = false;
            checkBT();
            $state.go("tab.intro");

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
              // if ($scope.promptedforBT) {
              //   ionic.Platform.fullScreen();
              //   if (window.StatusBar) {
              //     return StatusBar.hide();
              //   }
              // }
              if (!$IbeaconScanner.isScanning())
                $IbeaconScanner.startBeaconScan();
            });
            $window.addEventListener('BluetoothStatus.disabled', function () {
              console.log('Bluetooth has been disabled');
              if ($IbeaconScanner.isScanning())
                $IbeaconScanner.stopBeaconScan();

              $rootScope.showPopup({
                cssClass: "myPopup",
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
                $scope.promptedforBT = true;
                cordova.plugins.BluetoothStatus.promptForBT();
              } else {
                $IbeaconScanner.startBeaconScan();
              }
            }
          }
          console.log(msg);
          if (($scope.logged == false) && (APPfirstTime == 0))
            $state.go("tab.login");
          // $scope.showBT(msg);
        }
      }
    );

    $scope.showBT = function (msg) {
      var alertPopup2 = $ionicPopup.alert({
        cssClass: "myPopup",
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
        cssClass: "myPopup",
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
  .controller('PopupCtrl', function ($rootScope, $scope, $ionicPopup, $timeout, $regioes, $state) {

// Triggered on a button click, or some other target
    $scope.showPopup = function (mypop) {
      $rootScope.popupON = 1;
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
        cssClass: "myPopup",
        template: mypop.template || '',
        title: mypop.title || 'INFORMAÇÃO',
        subTitle: mypop.subTitle || '',
        scope: $scope,
        buttons: oButtons
      });

      myPopup.then(function (res) {
        console.log('Force Tap!');
        $scope.popupON = 0;
        $rootScope.popupON = 0;
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
        cssClass: "myPopup",
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
              $state.go("tab.regiao", {
                RI: $regioes.convertRegiaoLongToShort($scope.currentRI)
              });
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
  .controller('CameraCtrl', function ($rootScope, $scope, $cordovaCamera, $cordovaDevice, $cordovaSQLite, $ionicPlatform, $ionicPopup, $timeout, $ionicBackdrop, $ionicModal, $ionicSlideBoxDelegate, $ionicScrollDelegate, $window, $q) {

    // $scope.lastPhoto ="";
    $scope.allImages = [];

    $scope.zoomMin = 1;

    $scope.showImages = function (index) {
      $scope.activeSlide = index;
      $scope.showModal('templates/gallery-zoomview.html');
    };

    $scope.showModal = function (templateUrl) {
      $ionicModal.fromTemplateUrl(templateUrl, {
        scope: $scope
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    $scope.closeModal = function () {
      $scope.modal.hide();
      $scope.modal.remove()
    };

    $scope.updateSlideStatus = function (slide) {
      var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).getScrollPosition().zoom;
      if (zoomFactor == $scope.zoomMin) {
        $ionicSlideBoxDelegate.enableSlide(true);
      } else {
        // $ionicSlideBoxDelegate.enableSlide(false);
      }
    };

    document.addEventListener("deviceready", function () {

      resizeImage = function (img_path) {
        var q = $q.defer();
        $window.imageResizer.resizeImage(function (success_resp) {
          // console.log('success, img re-size: ' + JSON.stringify(success_resp));
          console.log('success, img re-size: ');
          q.resolve(success_resp);
        }, function (fail_resp) {
          console.log('fail, img re-size: ' + JSON.stringify(fail_resp));
          q.reject(fail_resp);
        }, img_path, 100, 0, {
          imageDataType: ImageResizer.IMAGE_DATA_TYPE_URL,
          resizeType: ImageResizer.RESIZE_TYPE_MIN_PIXEL,
          pixelDensity: true,
          storeImage: false,
          photoAlbum: false,
          format: 'jpg'
        });

        return q.promise;
      };

      $scope.showAlert = function (msg) {
        var alertPopup = $ionicPopup.alert({
          cssClass: "myPopup",
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
            // $scope.showAlert(message);
            for (var f = 0; f < res.rows.length; f++)
              $scope.allImages.push({
                src: res.rows.item(f).thumbnail_data,
                img: res.rows.item(f).IMG
              });

            console.log(message, res);
            $scope.lastPhoto = res.rows.item(res.rows.length - 1).IMG;
            // $scope.allImages.src = $scope.lastPhoto;
            // $scope.$apply();
          } else {
            // $scope.showAlert("No results found");
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

        resizeImage(entry.toURL()).then(function (res) {
          console.log("RESize RES: ", res);
          $scope.allImages.push({
            src: "data:image/png;base64," + res.imageData,
            img: entry.toURL()
          });
          // $scope.$apply();

          var query = "INSERT INTO `journal` (IMG,caption, thumbnail_data) VALUES (?,?,?)";
          $cordovaSQLite.execute($scope.db, query, [entry.toURL(), "No caption yet!", "data:image/png;base64," + res.imageData]).then(function (res) {
            var message = "INSERT ID -> " + res.insertId;
            console.log(message);
            // alert(message);
          }, function (err) {
            console.error(err);
            alert(err);
          });
          $rootScope.deviceBUSY = 0;
        });
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
          quality: 75,
          destinationType: Camera.DestinationType.FILE_URI,
          encodingType: 0,
          targetWidth: 640,
          targetHeight: 480,
          correctOrientation: true
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
  .controller('WelcomeCtrl', function ($scope, $rootScope, $state, $q, UserService, $ionicLoading, $ionicPlatform, $cordovaSQLite, $cordovaFileTransfer, $cordovaNetwork, users) {
    // This is the success callback from the login method

    $scope.fb = {
      loggedIN: true
    };

    $scope.fblogged = function () {
      return $scope.fb.loggedIN;
    };

    $scope.addUser = function (user) {
      if (!$scope.users) {
        $scope.users = users.init();
        $scope.users.$add(user);
        // $scope.users.offline();
      } else {
        $scope.users.$add(user);
        // $scope.users.offline();
      }
      users.offline();
    };

    $ionicPlatform.ready(function () {

      console.log("Logged: " + $rootScope.APP.logged + " online: " + $cordovaNetwork.isOnline());
      if (!$rootScope.APP.logged && $cordovaNetwork.isOnline()) {
        $scope.users = users.init();
        console.log("First Init firebase");
      }

      $scope.Download = function (url) {

        if (!$rootScope.isOnline)
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
        var newFileName = "profile_photo.jpg";
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
                var userInfo = JSON.parse(res || '{}');
                $scope.authResponse = userInfo.authResponse;
                console.log("GOT USER from user service", userInfo);
                userInfo.picture = fileEntry.toURL();
                $rootScope.APP.logged = true;
                $rootScope.APP.user.name = userInfo.name;
                $rootScope.APP.user.email = userInfo.email;
                $rootScope.APP.user.picture = userInfo.picture;
                $rootScope.$broadcast('LOGGED_IN');
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
          if (user.picture && user.name && user.picture) {
            $rootScope.APP.logged = true;
            $scope.profile_photo = user.picture;
            $scope.profile_name = user.name;
            $scope.profile_email = user.email;
            console.log("FB NAME3: %s pic: %s", user.name, user.picture);
            $scope.fb.loggedIN = true;
          } else {
            $rootScope.APP.logged = false;
            $scope.fb.loggedIN = false;
            // This method is to get the user profile info from the facebook api
          }

        }
      );

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

      var getFacebookProfileFriends = function () {
        if (!$scope.authResponse) {
          console.log("getFriends: no authresponse");
          // return;
        }

        var authResponse = $scope.authResponse || {};
        var info = $q.defer();

        // facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
        facebookConnectPlugin.api('/me/friends?fields=email,name&access_token=' + authResponse.accessToken, null,
          // facebookConnectPlugin.api('me?fields=friends&access_token=' + authResponse.accessToken, null,
          // facebookConnectPlugin.api('/me/friends', {fields: 'id, name, email'},
          function (response) {
            console.log("friends good res: ", response);
            info.resolve(response);
          },
          function (response) {
            console.log("friends bad res: ", response);
            info.reject(response);
          }
        );
        return info.promise;
      };

      $scope.getFriends = function () {
        getFacebookProfileFriends()
          .then(function (profileInfo) {

            console.log("Profile friends res: ", profileInfo)

            // if (!$rootScope.APP.logged && $cordovaNetwork.isOnline()) {
            //   $rootScope.APP.logged = true;
            //   $scope.addUser({
            //     nome: profileInfo.name,
            //     email: profileInfo.email,
            //     platform: ionic.Platform.platform(),
            //     version: ionic.Platform.version(),
            //     timestamp: Date.now(),
            //     data: Date().toLocaleLowerCase()
            //   })
            // }
          }, function (fail) {
            // Fail get profile info
            console.log('profile friends fail', fail);
          });
      }


      var fbLoginSuccess = function (response) {
        if (!response.authResponse) {
          fbLoginError("Cannot find the authResponse");
          // return;
        }

        var authResponse = response.authResponse;
        $scope.authResponse = response.authResponse;

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
            console.log("FB: profile:", profileInfo);

            // $rootScope.$broadcast('LOGGED_IN', networkState);
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

            // if (device.platform === 'Android') {
            //   ionic.Platform.fullScreen();
            //   if (window.StatusBar) {
            //     return StatusBar.hide();
            //   }
            // }

            // $state.go('tab.camera');
            $scope.Download("https://graph.facebook.com/" + authResponse.userID + "/picture?type=large");
            if (!$rootScope.APP.logged && $cordovaNetwork.isOnline()) {
              $rootScope.APP.logged = true;
              $scope.addUser({
                nome: profileInfo.name,
                email: profileInfo.email,
                platform: ionic.Platform.platform(),
                version: ionic.Platform.version(),
                timestamp: Date.now(),
                data: Date().toLocaleLowerCase()
              })
            }
            $rootScope.enableBeacons = true;
            $state.go("tab.atividades");
          }, function (fail) {
            // Fail get profile info
            console.log('profile info fail', fail);
          });
      };

      // This is the fail callback from the login method
      var fbLoginError = function (error) {
        console.log('fbLoginError', error);
        $ionicLoading.hide();
        $scope.fb.loggedIN = false;
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
                    console.log("FB NAME2: %s pic: %s", profileInfo.name, $scope.profile_photo);
                    // $state.go('tab.camera');
                    $scope.Download("https://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large");
                    if (!$rootScope.APP.logged && $cordovaNetwork.isOnline()) {
                      $rootScope.APP.logged = true;
                      $scope.addUser({
                        nome: profileInfo.name,
                        email: profileInfo.email,
                        platform: ionic.Platform.platform(),
                        version: ionic.Platform.version(),
                        timestamp: Date.now(),
                        data: Date().toLocaleLowerCase()
                      })
                    }
                    $rootScope.showAlert("Facebook Logged IN com o nome: " + profileInfo.name + " email: " + profileInfo.email);
                    $rootScope.enableBeacons = true;
                    $state.go("tab.atividades");

                  }, function (fail) {
                    // Fail get profile info
                    console.log('profile info fail', fail);
                  });
              } else {
                $scope.profile_photo = user.picture;
                $scope.profile_name = user.name;
                $scope.profile_email = user.email;
                $rootScope.console.log("FB NAME: %s pic: %s", user.name, user.picture);
                $scope.$apply();
                $rootScope.enableBeacons = true;
                $state.go('tab.atividades');
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
                $rootScope.showAlert("Facebook Logged OUT!");
                $state.go('tab.atividades');
              },
              function (fail) {
                $ionicLoading.hide();
              });
          }
        });
      };
    });
  })
  .controller('MapaCtrl', function ($scope, $rootScope, $state, $ionicLoading, $ionicPlatform, $regioes, $stateParams, $ionicSlideBoxDelegate, $ionicHistory, perguntas) {

    // $ionicLoading.show({
    //   template: 'A verificar o Mapa'
    // });
    console.log("Mapa controller ready");

    $scope.count = 0;
    $scope.start = 0;

    $scope.init = function (PI) {
      console.log("slide box init");
      $scope.slideIndex = 0;
      $scope.start = 1;
      if (!$scope.perguntas)
        perguntas.init(PI);
    };

    $scope.next = function () {
      $ionicSlideBoxDelegate.next();
    };
    $scope.previous = function () {
      $ionicSlideBoxDelegate.previous();
    };
    $scope.disableSwipe = function () {
      $ionicSlideBoxDelegate.enableSlide(false);
    };
    $scope.PI_slideChanged = function (index) {
      $scope.slideIndex = index;
      console.log("Index: " + index);
      $scope.start = 0;
      // $scope.count = 0;
      // if (index==2)
      //   $scope.disableSwipe();
    };

    $scope.goBack = function () {
      $ionicHistory.goBack();
    };

    $scope.swipeLeft = function () {
      console.log("swype left");
      // $state.go("tab.tdcards", {
      //   RI: $stateParams.RI,
      //   PI: $stateParams.PI
      // });
    };
    $scope.swipeRight = function () {
      if (($scope.slideIndex == 0)) {
        console.log("swype right", $scope.slideIndex, $scope.count, $scope.start);
        // if (($scope.slideIndex == 0) && ($scope.count++ > 0)) {
        if (($scope.count++ > 0) || ($scope.start == 1)) {
          $scope.goBack();
        } else {
          console.log("skipped: swype right", $scope.slideIndex, $scope.count);
        }
      }
    };

    $scope.$on('RI_FOUND', function (e) {
      console.log("tab mapa RI_FOUND refresh: %s", $rootScope.currentRI);
      createCircles();
    });


    $ionicPlatform.ready(function () {

      console.log("Mapactrl ready");
      $scope.aCircles = [];
      var canvas = document.getElementById('imageView');
      if (canvas) {
        var regioes = $regioes.getAllRegioesList();
        var context = canvas.getContext('2d');

      }

      touchUp = function (e) {
        console.log("rootpop: ", $rootScope.popupON);
        // e.preventDefault();
        // alert("clicked");
        //console.log(e);

        for (var f = 0; f <= $scope.aCircles.length - 1; f++) {

          var circleY = $scope.aCircles[f].centerY;
          var circleX = $scope.aCircles[f].centerX;
          var circleRadius = $scope.aCircles[f].radius;
          var y = e.offsetY - circleY;
          var x = e.offsetX - circleX;
          var dist = Math.sqrt(y * y + x * x);
          //console.log("circle: %s dist: ", $scope.aCircles[f].nome, dist);
          if (dist < circleRadius) {
            //go to google
            $scope.nome = $scope.aCircles[f].nome;
            $scope.locked = $scope.aCircles[f].locked;
            console.log("in circle: %s", $scope.aCircles[f].nome);
            if ($scope.aCircles[f].locked)
              $rootScope.showAlert("A " + $scope.aCircles[f].descricao + " está por descobrir");
            else $state.go("tab.mapa", {
              RI: $scope.aCircles[f].nome
            });
          }
        }
      };

      createCircles = function (nova_regiao) {

        $regioes.getRegioes().then(function (res) {
          $scope.aCircles = JSON.parse(res || [{}]);
          console.log("createCircles: GOT regioes from cordova service to aCircles", $scope.aCircles);
          drawImage();
        });
      };

      $scope.unlock_regiao = function () {
        $scope.aCircles[3].locked = false;
        $regioes.setRegioes($scope.aCircles);
        setTimeout(createCircles, 1000);
      };

      drawCircle = function (oCircle) {
        // console.log("oCircle: ", oCircle);
        var centerX = oCircle.centerX;
        var centerY = oCircle.centerY;
        var radius = oCircle.radius || 20;
        var blue = "108, 202, 255";
        var red = "255, 104, 85";
        var color = blue;

        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);

        if ($rootScope.currentRI) {
          if (regioes[$rootScope.currentRI] == oCircle.nome) {
            color = red;
            oCircle.locked = false;
          }
        }

        if (oCircle.locked)
          context.fillStyle = "rgba(" + color + ", 0.9)";
        else
          context.fillStyle = "rgba(" + color + ", 0.5)";

        context.fill();
        context.lineWidth = 1;

        context.strokeStyle = '#003300';
        context.stroke();
      };

      drawCircles = function () {
        for (var f = 0; f <= $scope.aCircles.length - 1; f++) {
          drawCircle($scope.aCircles[f]);
        }
        // $ionicLoading.hide();
      };

      drawImage = function () {
        //shadow
        //alert();
        context.shadowBlur = 20;
        context.shadowColor = "rgb(0,0,0)";

        //image
        var image = new Image();
        image.onload = function () {
          //alert("load");
          console.log("load image done");
          context.drawImage(image, 0, 0, canvas.width, canvas.height);

          // createCircles();
          drawCircles();

        };
        //canvas.addEventListener("touchend", touchUp, false);
        canvas.addEventListener("click", touchUp, false);
        //image.src ="http://i.imgur.com/p3gjnKa.jpg";
        image.src = "img/mapaqtapedagogica.jpg";
        //<img id="pic" src="http://i.telegraph.co.uk/multimedia/archive/03589/Wellcome_Image_Awa_3589699k.jpg">

        //$(image).load(function () {
        //image.height = canvas.height();
        //image.width = canvas.width();
        //context.drawImage(image);
        //context.drawImage(image, 0, 0, canvas.width, canvas.height);
        //});
      };
      console.log("Mapa antes dos circles", $stateParams);
      if ($stateParams.RI == "ALL")
        createCircles();
    })
  })
  .controller('DebugCtrl', function ($scope, $rootScope) {

  })
  .controller('GameCtrl', function ($scope, $rootScope) {

  })
  .controller('RegiaoCtrl', function ($scope, $rootScope) {
    // $scope.goBack = function(){
    console.log("going RegiaoCtrl ######");
    //   $ionicHistory.goBack();
    // }
  })
  .controller('AtividadesCtrl', function ($scope, $rootScope, $timeout) {

    $scope.myItems = [];
    $scope.items = [
      {
        id: 0,
        img: 'img/atividades_arborismo.png',
        title: 'ARBORISMO',
        description: 'O Sesimbra Natura Park desenvolveu um percurso de arborismo para que possa reforçar a sua ligação à natureza.'
      },
      {
        id: 1,
        img: 'img/atividades_bicicletas-hover.png',
        title: 'BICICLETAS NO SNP',
        description: 'Um novo desafio para todos os que têm alguma pedalada e são adeptos de um estilo de vida saudável em contacto com a natureza.'
      },
      {
        id: 2,
        title: 'DESPORTO AQUÁTICO AVENTURA',
        description: 'O Sesimbra Natura Park tem 13 ha de planos de água, perfeitos para a prática de atividades de desporto náutico não poluentes.',
        img: 'img/actividades_aquaticas-hover.png'
      },
      {
        id: 3,
        title: 'CAMPOS DE FÉRIAS',
        img: 'img/atividades_campo_ferias-hover.png',
        description: 'O SNP disponibiliza no Campo Base uma infraestrutura ideal para a realização de campos de férias.'
      },
      // { id: 4,
      //   img: 'img/atividades_dormir_snp-hover.png'
      // },
      {
        id: 5,
        title: 'FAUNA E FLORA',
        description: 'O Ecossistema Ecológico do Sesimbra Natura Park é um dos nossos maiores orgulhos.',
        img: 'img/atividades_fauna_flora-hover.png'
      },
      {
        id: 6,
        title: 'PAINTBALL',
        description: 'O Sesimbra Natura Park permite a prática de paintball num campo em contexto de mato, criado especialmente para esta modalidade.',
        img: 'img/atividades_painball-hover.png'
      },
      {
        id: 7,
        title: 'PERCURSOS PEDESTRES',
        description: 'Um novo desafio para todos os que são adeptos de um estilo de vida saudável em contacto com a natureza.',
        img: 'img/atividades_percursos_pedestres-hover.png'
      },
      {
        id: 8,
        img: 'img/atividades_tiro-hover.png',
        title: 'ATIVIDADES DE TIRO',
        description: 'O SNP disponibiliza a possibilidade de praticar o tiro em duas modalidades distintas: tiro com arco e zarabatana.'
      }
    ];

    $timeout(function () {
      for (var i = 0; i < 5; i++) {
        $scope.myItems.push($scope.items[i]);
      }
    });
  })
  .controller('LoginCtrl', function ($scope, $rootScope, $window) {
    ionic.Platform.fullScreen();
    if ($window.StatusBar) {
      return $window.StatusBar.hide();
    }
  })
  .controller('IntroCtrl', function ($scope, $state, $ionicSlideBoxDelegate) {

  // Called to navigate to the main app
  $scope.startApp = function () {
    $state.go('tab.dash');
  };
  $scope.next = function () {
    $ionicSlideBoxDelegate.next();
  };
  $scope.previous = function () {
    $ionicSlideBoxDelegate.previous();
  };

  // Called each time the slide changes
  $scope.slideChanged = function (index) {
    $scope.slideIndex = index;
  };
})
  .directive('noScroll', function ($document) {

    return {
      restrict: 'A',
      link: function ($scope, $element, $attr) {

        $document.on('touchmove', function (e) {
          e.preventDefault();
        });
      }
    }
  })
  .controller('CardsCtrl', function ($scope, TDCardDelegate, $ionicHistory, $stateParams, $ionicSlideBoxDelegate, perguntas) {
    console.log('CARDS CTRL');

    console.log("cards stateparams: ", $stateParams);

    var stopped = true;

    $scope.disableSwipe = function () {
      $ionicSlideBoxDelegate.enableSlide(false);
    };
    $scope.enableSwipe = function () {
      $ionicSlideBoxDelegate.enableSlide(true);
    };

    // $scope.goBack = function() {
    //   $ionicHistory.goBack();
    // };
    //
    // $scope.swipeLeft = function () {
    //   console.log("swype left", stopped);
    //   if (stopped)
    //     $scope.goBack();
    // };
    // $scope.swipeRight = function () {
    //   console.log("swype right", stopped);
    //   if (stopped)
    //     $scope.goBack();
    // };

    // var cardTypes = [
    //   { image: 'img/ben.png' },
    //   { image: 'img/mike.png' },
    //   { image: 'img/perry.png' },
    //   { image: 'img/max.png'}
    // ];
    var cardTypes = [];
    //$scope.cardTypes = [];
    //perguntas.getTdcards().then(function (res) {
     // cardTypes = res;
    //});
      //.$state.value;

    //$scope.cardTypes = [];
    // $scope.cards = Array.prototype.slice.call(cardTypes, 0);

    $scope.startCards = function () {
      cardTypes = perguntas.getTdcards();
      $scope.disableSwipe();
      stopped = false;
      console.log("starting cards: ", cardTypes);
      $scope.cards = Array.prototype.slice.call(cardTypes, 0);
    };
    $scope.stopCards = function () {
      $scope.enableSwipe();
      $scope.cards = [];
      stopped = true;
    };
    $scope.cardDestroyed = function (index) {
      $scope.cards.splice(index, 1);
    };
    $scope.addCard = function () {
      var newCard = cardTypes[Math.floor(Math.random() * (cardTypes.length - 1))];
      newCard.id = Math.random();
      $scope.cards.push(angular.extend({}, newCard));
    };
    $scope.cardSwipedLeft = function (index) {
      console.log('LEFT SWIPE');
      $scope.addCard();
    };
    $scope.cardSwipedRight = function (index) {
      console.log('RIGHT SWIPE');
      $scope.addCard();
    };

  })
  .controller('CardCtrl', function ($scope) {
    // $scope.cardSwipedLeft = function(index) {
    //   console.log('LEFT SWIPE');
    //   $scope.addCard();
    // };
    // $scope.cardSwipedRight = function(index) {
    //   console.log('RIGHT SWIPE');
    //   $scope.addCard();
    // };
  })
  .controller('AccountCtrl', function ($rootScope, $scope, UserService) {
    $scope.BLE = true;
    $scope.enableBeacons = $rootScope.enableBeacons;
    $scope.profile_name = $rootScope.APP.user.name;
    $scope.profile_email = $rootScope.APP.user.email;
    $scope.profile_photo = $rootScope.APP.user.picture;

    $scope.$on("LOGGED_IN", function (userInfo) {
      console.log("AcountCTRL: logged_in event: ", userInfo);
      $scope.profile_name = $rootScope.APP.user.name;
      $scope.profile_email = $rootScope.APP.user.email;
      $scope.profile_photo = $rootScope.APP.user.picture;
    });

    $scope.toggleChange = function () {
      if (!noBLE) {
        $rootScope.enableBeacons = !$rootScope.enableBeacons;
        if ($rootScope.enableBeacons) {
          $rootScope.beacons = {};
          $rootScope.$broadcast('BEACONS_UPDATE');
        }
        console.log("enableBeacons new state: %s", $rootScope.enableBeacons);
      }
    };

    // getProfile = function () {
    //   var tempUser = UserService.getUser();
    //   tempUser.then(function (res) {
    //     var userInfo = JSON.parse(res || '{}')
    //     console.log("Definicoes; GOT USER from user service", userInfo);
    //     if (userInfo.picture && userInfo.name && userInfo.email) {
    //       $scope.logged = true;
    //       console.log("USER: LOGGED: true");
    //       $scope.profile_name = userInfo.name;
    //       $scope.profile_email = userInfo.email;
    //       $scope.profile_photo = userInfo.picture;
    //     } else {
    //       $scope.logged = false;
    //       console.log("USER: LOGGED: false");
    //     }
    //   });
    // };

    // getProfile();

  })
  .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom');
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
      .state('tab.intro', {
        url: '/intro',
        views: {
          'tab-intro': {
            templateUrl: 'templates/tab-intro.html',
            controller: 'IntroCtrl'
          }
        }
      })
      .state('tab.atividades', {
        url: '/atividades',
        views: {
          'tab-atividades': {
            templateUrl: 'templates/tab-atividades.html',
            controller: 'AtividadesCtrl'
          }
        }
      })
      .state('tab.login', {
        url: '/login',
        views: {
          'tab-login': {
            templateUrl: 'templates/tab-login.html',
            controller: 'LoginCtrl'
          }
        }
      })
      // .state('tab.mapa', {
      //   url: '/mapa',
      //   views: {
      //     'tab-mapa': {
      //       // templateUrl: 'templates/tab-mapa.html',
      //       templateUrl: 'templates/regioes/mapa.html',
      //       controller: 'MapaCtrl'
      //     }
      //   }
      // })
      .state('tab.mapa', {
        url: '/regiao/:RI/:PI',
        views: {
          'tab-mapa': {
            templateUrl: function ($stateParams) {
              console.log("state params: ", $stateParams);
              // Here you can access to the url params with $stateParams
              // Just return the right url template according to the params
              // if ((!$stateParams.RI)  || ($stateParams.RI=="ALL")) {
              //   console.log('templates/regioes/mapa.html' + $stateParams.RI + '/' + $stateParams.PI + '.html');
              //   return 'templates/regioes/ALL/ALL.html';
              // }
              if (!$stateParams.PI) {
                console.log(' returned: templates/regioes/' + $stateParams.RI + '.html');
                return 'templates/regioes/' + $stateParams.RI + '/' + $stateParams.RI + '.html';
              }
              else if ($stateParams.RI) {
                console.log(' returned templates/regioes/' + $stateParams.RI + '/' + $stateParams.PI + '.html');
                return 'templates/regioes/' + $stateParams.RI + '/' + $stateParams.PI + '.html';
              }
            },
            controller: 'MapaCtrl'
            // function ($stateParams) {
            // console.log("dynamic ctrl: ", $stateParams);
            // if ($stateParams.RI=="ALL")
            //   return 'MapaCtrl';
            // else
            //   return 'RegiaoCtrl';
            // }
            // 'RegiaoCtrl'
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
      // .state('tab.tdcards', {
      //   url: '/tdcards/:RI/:PI/',
      //   views: {
      //     'tab-tdcards': {
      //       templateUrl: function ($stateParams) {
      //         return 'templates/tab-tdcards.html';
      //       },
      //       controller: 'CardsCtrl'
      //     }
      //   }
      // })
      .state('tab.game', {
        url: '/game',
        views: {
          'tab-game': {
            templateUrl: 'templates/tab-game.html',
            controller: 'GameCtrl'
          }
        }
      })
      .state('tab.debug', {
        url: '/debug',
        views: {
          'tab-debug': {
            templateUrl: 'templates/tab-debug.html',
            controller: 'DebugCtrl'
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


