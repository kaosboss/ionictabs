var APPverion = "0.5";
var APPtutorial = 0;
var APPfirstTime = 0;
var APPdir = null;
var db = null;
var enableBeacons = false;
var initialOutput = "";
var debug = 0;
var noBLE = 1;
var RED = "#ec6157";
var YELLOW = "#fec659";
var GREEN = "#33cd5f";

cw = function (value) {
  initialOutput += value + '\n';
  console.log(value);
};

function clone(obj) {
  if (null == obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
}

angular.module('starter', ['ionic', 'firebase', 'ngSanitize', 'ionic.ion.imageCacheFactory', 'angular-timeline', 'ngImageAppear', 'angular-scroll-animate', 'ion-floating-menu', 'ionic.contrib.ui.tinderCards', 'starter.controllers', 'starter.services'])

  .config(function ($ionicConfigProvider) {
    if (ionic.Platform.platform() == "android") {
      console.log("jsScrolling(false)");
      $ionicConfigProvider.scrolling.jsScrolling(false);
    }
  })
  .run(function ($ionicPlatform, $rootScope, $ionicHistory, $window, $ImageCacheFactory, $state) {
    $rootScope.APP = {
      logged: false,
      firstTime: false,
      user: {
        picture: 'img/SNP_small.jpg'
      },
      regiao_descoberta: false,
      start_qr: false,
      start_quiz: false
    };

    var preLoadImages = [
      'img/atividades_quinta_pedagogica_small.jpg',
      'img/SNP_background_intro.jpg',
      'img/SNP_small.jpg',
      'img/mapaqtapedagogica2.png',
      'img/snp_projeto_02_small.jpg',
      'img/journal/atividades_quinta_pedagogica_small.jpg'];

    $ImageCacheFactory.Cache(preLoadImages).then(function () {
      console.warn("done preloading!");
    });

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

      if (typeof cordova !== 'undefined')
        cordova.plugins.BluetoothStatus.initPlugin();

      $rootScope.popupQueue = [];

      $rootScope.smallDevice = false;
      $rootScope.currentRI = "Quinta pedagógica";
      $rootScope.currentRI_descricao = "Quinta pedagógica";
      $rootScope.showPopup = function (popup) {
        $rootScope.mypop = popup;
        $rootScope.$broadcast("SHOW_POPUP");
      };
      $rootScope.showAlert = function (msg) {
        $rootScope.mypop = {
          cssClass: "myPopup",
          template: msg || '',
          title: 'Notificação',
          subTitle: '',
          buttonText: "Ok",
          // queue: true
        };
        $rootScope.$broadcast("SHOW_POPUP");
      };
      // $rootScope.showPopup({templateUrl: 'templates/tab-game_help.html', cssClass: 'myPopupLegenda', timeout: 600000});
      // ionic.Platform.isFullScreen = true;
      // ionic.Platform.fullScreen();

      // if ($window.StatusBar) {
      //   return $window.StatusBar.hide();

      // org.apache.cordova.statusbar required
      // StatusBar.styleDefault();
      // }
    });
  })
  // .controller('DashCtrl', function ($window, $rootScope, $scope, $ionicPopup, $timeout, $ionicPlatform, $cordovaSQLite, $IbeaconScanner, $cordovaNetwork, UserService, users, $regioes, $ionicLoading) {
  .controller('DashCtrl', function ($window, $rootScope, $scope, $ionicPopup, $timeout,
                                    $ionicPlatform, $cordovaSQLite, $IbeaconScanner, $cordovaNetwork,
                                    UserService, users, $regioes, $state, perguntas, $ionicLoading, likes, news, $gameFactory, $eventFactory) {

    dbres = 0;
    var query = "";
    var swiper = null;
    var newsres = null;
    if (debug) alert("start");

    // $timeout(function () {
    //   //   $rootScope.showPopup({templateUrl: 'templates/tab-game_help.html', cssClass: 'myPopupLegenda', timeout: 600000});
    //   // }, 1000);
    //   $ionicPopup.confirm({
    //     cssClass: "myPopupLegenda",
    //     // title: 'RI: ' + $scope.currentRI,
    //     templateUrl: 'templates/tab-game_help.html',
    //     // scope: $scope,
    //     buttons: [
    //       {
    //         text: 'OK',
    //         type: 'button-popup'
    //       }
    //     ]
    //   });
    //
    // }, 3000);

    $scope.showDesafios_help = function () {
      $rootScope.showPopup({templateUrl: 'templates/tab-game_help.html', cssClass: 'myPopupLegenda', timeout: 600000});
    };


    $scope.goAtividades = function () {
      console.log("Go Atividades");
      // $ionicHistory.goBack();
      $state.go("tab.snp", {
        AT: "atividades",
        ATD: "bicicletas"
      });
    };

    $scope.logged = $rootScope.APP.logged;

    // $scope.goLogin = function () {
    //   $state.go('tab.account');
    // };

    $scope.goHome = function () {
      $state.go('tab.dash');
    };

    $ionicPlatform.ready(function () {
        cw("ionic platform ready");

        // swiper = new Swiper('.swiper-container', {
        //   pagination: '.swiper-pagination',
        //   paginationClickable: true,
        //   onInit: function (swp) {
        //     console.warn("swipper init");
        //   }
        // });

        // $rootScope.showPopup({
        //   // cssClass: "myPopup",
        //   // template: '',
        //   // title: '',
        //   // subTitle: '',
        //   // timeout: 100000,
        //   templateUrl: 'templates/popups/desafio_nok.html',
        //   // buttonText: "OK",
        // });
        // $rootScope.showPopup({ template: "Tens de visitar todos os pontos de interesse da região, para poder jogar o desafio"  });
        // $rootScope.showPopup({templateUrl: 'templates/popups/desafio_ok.html'});

        if (($cordovaNetwork))
          if ($cordovaNetwork.isOnline)
            $rootScope.isOnline = $cordovaNetwork.isOnline();

        $window.document.addEventListener("pause", function (event) {
          console.log('run() -> cordovaPauseEvent');
        });

        $window.document.addEventListener("resume", function (event) {
          console.log('run() -> cordovaResumeEvent');
        });

        $scope.checkNetwork = function () {
          // $scope.netWork.type = $cordovaNetwork.getNetwork();
          // $scope.netWork.isOnline = $cordovaNetwork.isOnline();
          $rootScope.isOnline = $cordovaNetwork.isOnline();
          $rootScope.netWorktype = $cordovaNetwork.getNetwork();
          // $scope.netWork.isOffline = $cordovaNetwork.isOffline();

          if (!likes.isDataLoading())
            likes.init();

          if ($cordovaNetwork.isOnline()) {
            if (!news.checked())
              news.checkNews();
          }

          $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
            // $scope.netWork.type = networkState;
            $rootScope.netWorktype = networkState;
            $rootScope.isOnline = true;
            // $scope.netWork.isOnline = true;
            // $scope.netWork.isOffline = false;
            // $rootScope.showAlert("NetWork ONLINE");

            // if ((likes.needsUpdate()) && (!likes.isUploading()))
            //   likes.uploadLikes();

            if ((!likes.isDataLoading()) && (!likes.isDataLoaded()))
              likes.init();
            else if ((!likes.isDataLoading()))
              if (likes.needsUpdate())
                likes.uploadLikes();

            if (users.needsUpdate()) {
              users.updateDados();
            }

            if (!news.checked())
              news.checkNews();
          });

          // likes.needsUpdate();

          $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
            // $scope.netWork.type = networkState;
            $rootScope.netWorktype = networkState;
            // $scope.netWork.isOnline = false;
            $rootScope.isOnline = false;
            // $scope.netWork.isOffline = true;
            // $rootScope.showAlert("NetWork OFFLINE");
            if (likes.isfireBaseOnline())
              likes.offline();
          });
        };
        // $scope.checkNetwork();
        // cordova.plugins.BluetoothStatus.initPlugin();
        // db = $rootScope.db = $window.sqlitePlugin.openDatabase({name: "snpquinta.db", location: "default"});
        // if (!typeof cordova)
        db = $rootScope.db = $cordovaSQLite.openDB({name: "snpquinta.db", location: "default"});

        if (db) {
          cw("DB open");
          console.log("DB", db);
          $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS `info` ( `name`	TEXT,	`value`	TEXT)", []).then(function (res) {
            // alert("OK onDB create");
            cw("Table info", res);
          }, function (err) {
            alert(err);
          });
          $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS `journal` (id integer primary key autoincrement, `IMG`	TEXT, `caption`	TEXT, `thumbnail`	TEXT, `thumbnail_data`	TEXT, `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, `title` TEXT, `auto` TEXT, `whendb`	TEXT)", []).then(function (res) {
            cw("Table journal", res);
          }, function (err) {
            alert(err);
          });
          $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS `regioes` ( `name`	TEXT,	`value`	TEXT)", []).then(function (res) {
            cw("Table regioes", res);
          }, function (err) {
            alert(err);
          });
        }
        dbres = 1;
        $scope.checkNetwork();
        query = "select value from info where name=?";
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
            // $scope.checkNetwork();

            var tempUser = UserService.getUser();
            tempUser.then(function (res) {
              var userInfo = JSON.parse(res || '{}')
              console.log("GOT USER from user service", userInfo);
              if (userInfo.picture && userInfo.name && userInfo.picture) {
                $rootScope.APP.logged = true;
                $rootScope.APP.user.name = userInfo.name;
                $rootScope.APP.user.email = userInfo.email;
                $rootScope.APP.user.picture = userInfo.picture;
                $rootScope.APP.user.fb_email = userInfo.fb_email;
                $scope.logged = true;

                // users.offline();
                console.log("USER: LOGGED: true");
                // $state.go("tab.atividades");
              } else {
                $rootScope.APP.logged = false;
                $scope.logged = false;
                console.log("USER: LOGGED: false");
                $rootScope.enableBeacons = false;
                // setTimeout(function () {
                //   $state.go("tab.login");
                // }, 300)
              }
              checkBT();
              $cordovaSQLite.getVarFromDB("info", "userID").then(function (res) {
                $rootScope.APP.userID = res;
                users.setUserID(res);
                console.log("XXX Got userID: ", $rootScope.APP.userID);
              });
              $cordovaSQLite.getVarFromDB("info", "userinfoUpdate").then(function (res) {
                console.log("Got userinfoUpdate = %s", res);
                if (res == "true") {
                  console.log("Got userinfoUpdate NEED UPDATE");
                  users.updateDados({
                    nome: userInfo.name,
                    email: userInfo.email,
                    picture: userInfo.picture,
                    platform: ionic.Platform.platform(),
                    version: ionic.Platform.version(),
                    timestamp: Date.now(),
                    dataInicio: Date().toLocaleLowerCase(),
                    modelo: ionic.Platform.device().model
                  })
                }
              });
            });

            $cordovaSQLite.getVarFromDB("info", "gameInfo").then(function (res) {
              var gameInfo = JSON.parse(res || '{}');
              $gameFactory.processGameInfo(gameInfo);
              console.log("Got game info", gameInfo);
              for (var levelName in gameInfo) {
                if (!gameInfo.hasOwnProperty(levelName)) continue;

                var level = gameInfo[levelName];
                console.log("gameInfo2: ", levelName, level);

                if (!level.locked) {
                  var elem = $window.document.getElementById(levelName);
                  if (elem)
                    elem.classList.add("clearBadge");
                  console.warn("GameInfo unlocked: " + levelName + " = " + level);
                }
              }
            });

            $cordovaSQLite.getVarFromDB("info", "news").then(function (res) {
              newsres = JSON.parse(res || '{}');

              console.warn("Got news from db: ", newsres);
              swiper = new Swiper('.swiper-container', {
                pagination: '.swiper-pagination',
                paginationClickable: true,
                onInit: function (swp) {
                  console.warn("swipper init");
                  newsres.forEach(function (slide) {
                    swp.appendSlide('<div class="swiper-slide">' + slide.noticia + '</div>');
                  });
                  swp.update(true);
                  news.updated(false);
                }
              });
            });

          } else {
            // $scope.checkNetwork();
            // $scope.showAlert("No results found, primeira utilizacao!");
            console.log("No results found, firsttime?");

            $eventFactory.addInHouseEvent({
              title: "Welcome Back!",
              image: "img/journal/atividades_quinta_pedagogica_small.jpg",
              caption: "Instalaste a aplicação da Quinta Pedagógica do Sesimbra Natura Park, eu vou ser o teu guia!",
              thumb: "img/journal/atividades_quinta_pedagogica_small.jpg"
            });
            // $scope.addInHouseEvent("Welcome Back!", "img/journal/atividades_quinta_pedagogica_small.jpg", "Instalaste a aplicação da Quinta Pedagógica do Sesimbra Natura Park, eu vou ser o teu guia!", "img/journal/atividades_quinta_pedagogica_small.jpg", true);

            $rootScope.APP.userID = users.genUUID();
            console.log("Generate userID: ", $rootScope.APP.userID);

            query = "INSERT INTO `info` (name,value) VALUES ('APP', " + APPverion + ")";
            $cordovaSQLite.execute(db, query, []).then(function (res) {
              // var message = "INSERT ID -> " + res.insertId;
              // console.log(message);
              console.log("Inserted APP version: v" + APPverion + " tutorial: ON");
              APPfirstTime = 1;
              $rootScope.APP.firstTime = true;
              // $scope.showAlert("Inserted APP version: v" + APPverion + " tutorial: ON");
              // alert(message);
            }, function (err) {
              console.error(err);
              alert(err);
            });

            query = "INSERT INTO `info` (name,value) VALUES ('APPtutorial', 'Sim')";
            $cordovaSQLite.execute(db, query, []).then(function (res) {
              var message = "INSERT ID -> " + res.insertId;
              // console.log(message);
              console.log("Inserted APP tutorial: Sim");
              $rootScope.APP.APPtutorial = 1;
              // alert(message);
            }, function (err) {
              console.error(err);
              alert(err);
            });

            likes.getAtividadesInicio().then(function (res) {
              query = "INSERT INTO `info` (name,value) VALUES ('atividades', '" + JSON.stringify(likes.getItems()) + "')";
              $cordovaSQLite.execute(db, query, []).then(function (res) {
                var message = "INSERT ID -> " + res.insertId;
                // console.log(message);
                console.log("Inserted atividades items, ", message);
              }, function (err) {
                console.error(err);
                // alert(err);
              });
            });

            perguntas.getRegioesInicio().then(function (res) {
              $regioes.setRegioes(res);
            });

            $gameFactory.getGameInicio().then(function (res) {
              var gameInfo = res;
              $gameFactory.processGameInfo(gameInfo);
              for (var levelName in gameInfo) {
                if (!gameInfo.hasOwnProperty(levelName)) continue;

                var level = gameInfo[levelName];
                console.log("gameInfo2: ", levelName, level);

                if (!level.locked) {
                  var elem = $window.document.getElementById(levelName);
                  if (elem)
                    elem.classList.add("clearBadge");
                  console.warn("GameInfo unlocked: " + levelName + " = " + level);
                }
              }
              $gameFactory.saveGameInfo(res);
            });

            news.getNewsInicio().then(function (res) {
              news.setNews(res);
              newsres = res;

              console.warn("Got news inicio: ", newsres);
              swiper = new Swiper('.swiper-container', {
                pagination: '.swiper-pagination',
                paginationClickable: true,
                onInit: function (swp) {
                  console.warn("swipper init");
                  newsres.forEach(function (slide) {
                    swp.appendSlide('<div class="swiper-slide">' + slide.noticia + '</div>');
                  });
                  // $timeout(function () {
                  swp.update(true);
                  news.updated(false);
                  // },500);
                }
              });
            });

            if (cordova != null)
              $ionicLoading.hide();

            $rootScope.enableBeacons = false;
            // checkBT();
            $timeout(function () {
              checkBT();
            }, 30000);

            $state.go("tab.intro");

          }
        }, function (err) {
          if (cordova != null)
            $ionicLoading.hide();
          // alert(err);
          console.error("ERROR ON get app version", err);
        });

        $scope.$on('LEVELUP', function (e, args) {

          // $cordovaSQLite.getVarFromDB("info", "gameInfo").then(function (res) {
          var gameInfo = args.gameInfo;
          console.log("Got game info: level up", gameInfo);
          for (var levelName in gameInfo) {
            if (!gameInfo.hasOwnProperty(levelName)) continue;

            var level = gameInfo[levelName];
            console.log("gameInfo2: ", levelName, level);

            if (!level.locked) {
              var elem = $window.document.getElementById(levelName);
              if (elem)
                elem.classList.add("clearBadge");
              console.warn("GameInfo unlocked: " + levelName + " = " + level);
            }
          }
          // });
        });

        $scope.$on("$ionicView.afterEnter", function (event, data) {
          console.log("State $ionicView.afterEnter dash Params: ", data, news.updated());
          if (!news.updated()) {
            console.log("State $ionicView.afterEnter dash news needs update: ", news.updated());
            swiper.update(true);
            news.updated(true);
          }
        });

        $scope.$on('GOT_NEWS', function (e) {
          console.warn("BROADCAST GOT_NEWS RECEIVED");
          swiper.removeAllSlides();
          news.getNews().forEach(function (slide) {
            swiper.appendSlide('<div class="swiper-slide">' + slide.noticia + '</div>');
            console.warn("Gotnews adding slide: ", slide);
          });
          swiper.update(true);
          news.updated(false);
        });

        checkBT = function () {
          var msg = "Has BT: " + cordova.plugins.BluetoothStatus.hasBT + " Has BLE: " + cordova.plugins.BluetoothStatus.hasBTLE + " isBTenable: " + cordova.plugins.BluetoothStatus.BTenabled;
          if (cordova != null)
            $ionicLoading.hide();

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

              // $rootScope.showPopup({
              //   cssClass: "myPopup",
              //   title: "INFORMAÇÃO",
              //   buttonText: "OK",
              //   template: "O bluetooth está desligado, sem alertas de interesse"
              // });
              $rootScope.showAlert("O bluetooth está desligado, não vais receber alertas de interesse na Quinta");
            });

            if (device.platform === 'iOS') {
              msg = msg + " IOS: isAuthorized: " + cordova.plugins.BluetoothStatus.iosAuthorized;
              if (!cordova.plugins.BluetoothStatus.BTenabled) {
                console.log("TURN BT ON - IOS");
                $scope.showBT("Liga o Bluetooth para receberes alertas de interesse na Quinta");
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
          // if (($scope.logged == false) && (APPfirstTime == 0))
          // $state.go("tab.login");
          // $scope.showBT("Faça login no FB");
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
        // checkBT();
        // $scope.checkNetwork();
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

        $scope.$on("BEACONS_UPDATE", function (e, args) {
          $scope.beacons = args.beacons;
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
  .controller('PopupCtrl', function ($rootScope, $scope, $ionicPopup, $timeout, $state, $ionicTabsDelegate, $stateParams, $ionicHistory) {

    console.log("PopupCtrl startted");
// Triggered on a button click, or some other target
    $scope.showPopup = function (mypop) {
      $rootScope.popupON = 1;
      $scope.data = {};
      if (!mypop)
        mypop = {};

      if (!mypop.timeout)
        mypop.timeout = 15000;

      var buttonText = mypop.buttonText || "Ok";
      var oButtons = mypop.oButtons || [
          {
            text: '<b>' + buttonText + '</b>',
            type: 'button-popup'
          }
        ];
      var myPopup = $ionicPopup.show({
        cssClass: mypop.cssClass || "myPopup",
        template: mypop.template || '',
        templateUrl: mypop.templateUrl || '',
        title: mypop.title || '',
        subTitle: mypop.subTitle || '',
        scope: $scope,
        buttons: oButtons,
        buttonText: buttonText
      });

      myPopup.then(function (res) {
        console.log('Force Tap!');
        $scope.popupON = 0;
        $rootScope.popupON = 0;
      });

      $timeout(function () {
        myPopup.close();
        $scope.popupON = 0;
        $rootScope.popupON = 0;
      }, mypop.timeout);
    };

    $scope.$on('SHOW_POPUP', function (e) {
      // do something
      console.log("POPUP controller enter.");
      if (!$scope.popupON) {
        $scope.popupON = 1;
        $rootScope.popupON = 1;
        $scope.showPopup($rootScope.mypop);
      }
      else {
        if ($rootScope.mypop.queue) {
          console.log("ShowPopUP: Got event, but popup ON, skipping, but queue: ", $rootScope.mypop);
          $rootScope.popupQueue.push($rootScope.mypop);
          $timeout(function () {
            showPopupQueue();
          }, 5000);
        }
      }
    });

    var showPopupQueue = function () {
      if ($rootScope.popupQueue.length > 0) {
        if ((!$scope.popupON) && (!$rootScope.deviceBUSY)) {
          $scope.showPopup($rootScope.popupQueue.pop());
        }
        $timeout(function () {
          showPopupQueue();
        }, 5000);
      }
    };

    goMapaPopup = function () {
      $state.go("tab.mapa", {
        RI: "ALL",
        PI: ""
      });
    };

    // A confirm dialog
    $scope.showRI = function (uniqueBeaconKey) {
      if ($rootScope.popupON) {
        console.log("rootScope POPUP is ON, leaving");
        return;
      }

      $scope.popupON = 1;
      $rootScope.popupON = 1;
      var confirmPopup = $ionicPopup.confirm({
        cssClass: "myPopup",
        // title: 'RI: ' + $scope.currentRI,
        templateUrl: 'templates/popups/nova_regiao.html',
        scope: $scope,
        buttons: [
          {
            text: 'Ficar',
            type: 'button-popup',
            onTap: function (e) {
              $timeout(function () {
                $rootScope.beacons[uniqueBeaconKey] = 0;
              }, 30000);
            }
          },
          {
            text: '<b>Visitar</b>',
            type: 'button-popup',
            onTap: function (e) {
              // var RI = $scope.currentRI;
              console.log("Confirmed navigation to region", $state);
              if ($state.current.name != "tab.mapa") {
                // $state.go("tab.mapa", {});
                // $ionicTabsDelegate.select(3);
                $rootScope.APP.regiao_descoberta = true;
                goMapaPopup();

                // $timeout(function () {
                //   $ionicTabsDelegate.select(3);
                //   // $rootScope.APP.regiao_descoberta = true;
                // $rootScope.$br               oadcast('GO_REGIAO', {regiao: $scope.currentRI})
                // }, 300);
                $rootScope.$broadcast('GO_REGIAO', {regiao: $scope.currentRI})

              } else {
                if ($stateParams.RI == "ALL") {
                  console.warn("SHOWRI: ON MAPA");
                  $rootScope.APP.regiao_descoberta = true;
                  $timeout(function () {
                    $rootScope.$broadcast('GO_REGIAO', {regiao: $scope.currentRI});
                  }, 600);
                } else {
                  // console.warn("SHOWRI: OUTSIDE MAPA");
                  // $timeout(function () {
                  //   $rootScope.$broadcast('GO_REGIAO', {regiao: $scope.currentRI});
                  // }, 600);
                  // $ionicHistory.goBack();
                }
              }
              return 1;
            }
          },
          {
            text: '<b><i class="icon ion-qr-scanner"></i></b>',
            type: 'button-popup',
            onTap: function (e) {
              console.log("Confirmed navigation to qr", $state);

              if ($state.current.name != "tab.mapa") {
                // $state.go("tab.mapa", {});
                $rootScope.APP.start_qr = true;
                goMapaPopup();
                // $ionicTabsDelegate.select(3);
                // $timeout(function () {
                //   $rootScope.APP.start_qr = true;
                //   $ionicTabsDelegate.select(3);
                //   // $rootScope.APP.regiao_descoberta = true;
                //   // $rootScope.$broadcast('GO_REGIAO', {regiao: $scope.currentRI})
                // }, 300);
                $rootScope.$broadcast('GO_REGIAO', {regiao: $scope.currentRI, qr: true})

              } else {
                $rootScope.$broadcast('GO_REGIAO', {regiao: $scope.currentRI, qr: true})
              }

              // if ($state.current.name != "tab.mapa") {
              //   // $state.go("tab.mapa", {});
              //   $ionicTabsDelegate.select(3);
              //   $ionicTabsDelegate.select(3);
              //   // $rootScope.APP.start_qr = true;
              //   $timeout(function () {
              //     // $ionicTabsDelegate.select(3);
              //     // $rootScope.APP.start_qr = true;
              //     /$rootScope.$broadcast('GO_REGIAO', {regiao: $scope.currentRI, qr: true})/ $rootScope.APP.regiao_descoberta = true;
              //     // $rootScope.$broadcast('GO_REGIAO', {regiao: $scope.currentRI, qr: true})
              //     $rootScope.$broadcast('GO_REGIAO', {regiao: $scope.currentRI, qr: true})
              //   }, 200);
              // } else {
              //
              // }
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
      }, 60000);
    };

    $scope.showQuiz = function (RI) {
      if ($rootScope.popupON) {
        console.log("rootScope POPUP is ON, leaving");
        return;
      }

      $scope.popupON = 1;
      $rootScope.popupON = 1;
      var confirmPopup2 = $ionicPopup.confirm({
        cssClass: "myPopup",
        // title: 'RI: ' + $scope.currentRI,
        templateUrl: 'templates/popups/quiz_regiao.html',
        scope: $scope,
        buttons: [
          {
            text: 'Ficar',
            type: 'button-popup',
            onTap: function (e) {
            }
          },
          {
            text: '<i class="icon ion-clipboard"></i>',
            type: 'button-popup',
            onTap: function (e) {
              console.log("Confirmed navigation to quiz", $state);

              if ($state.current.name != "tab.mapa") {
                // $state.go("tab.mapa", {});
                $rootScope.APP.start_quiz = true;
                goMapaPopup();
                // $ionicTabsDelegate.select(3);
                $timeout(function () {
                  //   $rootScope.APP.start_qr = true;
                  //   $ionicTabsDelegate.select(3);
                  //   // $rootScope.APP.regiao_descoberta = true;
                  //   // $rootScope.$broadcast('GO_REGIAO', {regiao: $scope.currentRI})
                  $rootScope.$broadcast('GO_REGIAO', {regiao: RI, quiz: true})
                }, 500);

              } else {
                $rootScope.$broadcast('GO_REGIAO', {regiao: RI, quiz: true})
              }

              // if ($state.current.name != "tab.mapa") {
              //   // $state.go("tab.mapa", {});
              //   $ionicTabsDelegate.select(3);
              //   $ionicTabsDelegate.select(3);
              //   // $rootScope.APP.start_qr = true;
              //   $timeout(function () {
              //     // $ionicTabsDelegate.select(3);
              //     // $rootScope.APP.start_qr = true;
              //     /$rootScope.$broadcast('GO_REGIAO', {regiao: $scope.currentRI, qr: true})/ $rootScope.APP.regiao_descoberta = true;
              //     // $rootScope.$broadcast('GO_REGIAO', {regiao: $scope.currentRI, qr: true})
              //     $rootScope.$broadcast('GO_REGIAO', {regiao: $scope.currentRI, qr: true})
              //   }, 200);
              // } else {
              //
              // }
              return 1;
            }
          }
        ]
      });

      confirmPopup2.then(function (res) {
        if (res) {
          console.log('resposta confirmacao de regiao - sim, ver conteudo', res);
        } else {
          console.log('Nao, ficar onde estou - nao', res);
        }
        $scope.popupON = 0;
        $rootScope.popupON = 0;
      });

      $timeout(function () {
        confirmPopup2.close();
        $scope.popupON = 0;
        $rootScope.popupON = 0;
      }, 60000);
    };

    $scope.$on('RI_FOUND', function (e, args) {
      // do something
      // console.log("POPUP controller scope.on RI_FOUND, enter.");
      if (!$scope.popupON) {
        $scope.currentRI = $rootScope.currentRI;
        $scope.showRI(args.uniqueBeaconKey);
      }
      // else
      // console.log("Got event, but popup ON, skipping");
    });

    $scope.$on('SHOW_QUIZ', function (e, args) {
      // do something
      // console.log("POPUP controller scope.on RI_FOUND, enter.");
      // if (!$scope.popupON) {
      //   $scope.currentRI = $rootScope.currentRI;
      $scope.showQuiz(args.regiao);
      // }
      // else
      // console.log("Got event, but popup ON, skipping");
    });
    // setTimeout(function () {
    //   $scope.showConfirm();
    // }, 4000);
  })
  .controller('CameraCtrl', function ($rootScope, $scope, $cordovaCamera,
                                      $cordovaDevice, $cordovaSQLite, $ionicPlatform,
                                      $ionicPopup, $timeout, $ionicBackdrop,
                                      $ionicModal, $ionicSlideBoxDelegate, $ionicScrollDelegate,
                                      $window, $q, $ionicLoading, blob, $gameFactory, $regioes, $eventFactory) {

    var query = "";
    var lorem = "Aqui está a familia Ramos num Domingo muito divertido e diferente!";

    var myFolderApp = "images";
    var myRootFolderApp = $rootScope.albumFolder || "SNP-Quinta";

    // $ionicModal.fromTemplateUrl('templates/template_caption.html', {
    //   scope: $scope,
    //   animation: 'fade-in'
    // }).then(function(modal) {
    //   $scope.modal = modal;
    // });

    $scope.showDelete = function () {
      var confirmDeletePopup = $ionicPopup.confirm({
        cssClass: "myPopup",
        title: "Apagar",
        template: 'Queres mesmo apagar este registo?',
        scope: $scope,
        buttons: [
          {text: 'Não'},
          {
            text: '<b>Sim</b>',
            type: 'button-assertive',
            onTap: function (e) {
              console.log("Confirmed delete id: %s", $scope.id);
              return 1;
            }
          }
        ]
      });

      confirmDeletePopup.then(function (res) {
        if (res) {
          console.log('resposta confirmacao de delete id: %s', $scope.id);
          $cordovaSQLite.deleteValueFromDB("journal", $scope.id).then(function (res) {
            if (!res.rowsAffected)
              console.warn("ALERT: Delete from db got 0 affected rows");
            // console.log("Client side, returned update", res);
            for (var i = 0; i < $scope.events.length; i++) {
              if ($scope.events[i].id == $scope.id) {
                $scope.events.splice(i, 1);
                $ionicScrollDelegate.resize();
                console.warn("FOUND ID: Delete from db got 0 affected rows", $scope.id);
                break;
              }
            }
          });
        } else {
          console.log('Nao, manter registo id: %s', $scope.id);
        }
        // $scope.popupON = 0;
        // $rootScope.popupON = 0;
      });
    };

    $scope.showCaption = function (index) {

      console.warn("showcaption index: ", index);

      // index--;
      $scope.id = "";
      var edit = false;
      $scope.data = {};
      var caption = null;

      if (index != null) {
        $scope.id = $scope.events[index].id;
        edit = $scope.events[index].edit;
        // if ($scope.events[index].contentHtml != '')
        //   edit = true;
        $scope.data.caption = $scope.events[index].contentHtml;
      }
      else {
        edit = false;
        $scope.id = $scope.captureImageId;
        $scope.data.caption = "\n\n\n";
      }

      if (!edit)
        caption = $ionicPopup.show({
          cssClass: "myPopupCaption",
          // template: '<textarea ng-model="data.caption" name="Text1" rows="2"></textarea>',
          templateUrl: 'templates/template_caption.html',
          title: 'Album',
          subTitle: 'Adiciona uma descrição à foto',
          scope: $scope,
          buttons: [
            {text: 'Cancelar'},
            {
              text: '<b>Guardar</b>',
              type: 'button-next-new',
              onTap: function (e) {
                if (!$scope.data.caption) {
                  e.preventDefault();
                } else {
                  return $scope.data.caption;
                }
              }
            }
          ]
        });
      else
        caption = $ionicPopup.show({
          cssClass: "myPopup",
          // template: '<textarea ng-model="data.caption" name="Text1" rows="2"></textarea>',
          templateUrl: 'templates/template_caption.html',
          title: 'Album',
          subTitle: 'Adicione uma descrição à foto',
          scope: $scope,
          buttons: [
            {
              text: 'Cancelar',
              type: 'button-small'
            },
            {
              text: '<b><i class="glyphicon icon ion-trash-a"></i></b>',
              type: 'button-small button-assertive',
              onTap: function (e) {
                return "delete";
              }
            },
            {
              text: 'Guardar',
              type: 'button-small button-balanced',
              onTap: function (e) {
                if (!$scope.data.caption) {
                  e.preventDefault();
                } else {
                  return $scope.data.caption;
                }
              }
            }
          ]
        });

      caption.then(function (res) {
        if (res == "delete") {
          $scope.showDelete();
          return;
        }

        console.log('Tapped! ID: %s', $scope.id, res, $scope.events);
        if (!res)
          return;

        if (res.length > 300)
          res = res.substring(0, 300);

        var f = 0;
        for (f = 0; f < $scope.events.length; f++) {
          if ($scope.events[f].id == $scope.id) {
            console.warn("Found id @: ", f);
            break;
          }
        }

        $scope.events[f].contentHtml = res;

        $cordovaSQLite.updateValueToDB("journal", [res, $scope.id]).then(function (res) {

          if (!res.rowsAffected)
            console.warn("ALERT: Update db got 0 affected rows");
          // console.log("Client side, returned update", res);
        });
      });

      // $timeout(function() {
      //   caption.close();
      // }, 10000);
    };

    $scope.createContact = function (caption, id) {
      // $scope.contacts.push({ name: u.firstName + ' ' + u.lastName });
      console.log("New caption: %s for id: %s", caption, id);
      $scope.modal.hide();
    };

    $scope.side = 'left';
    $scope.images = {};

    $scope.events = [
      // {
      //   badgeClass: 'mascoteAvatar',
      //   badgeIconClass: 'bg-dark',
      //   // badgeIconClass : 'ion-ionic',
      //   // badgeIconClass : 'avatar',
      //   title: 'Quinta Pedagógica',
      //   when: 'à 5 minutos',
      //
      //   // contentHtml: '<img ng-image-appear placeholder class="img-responsive img-thumbnail" src="img/atividades_quinta_pedagogica_small.jpg"><p>Bem vindo à Quinta Pedagógica do Sesimbra Natura Park, vou ser o teu guia.</p>'
      //   contentHtml: '',
      //   titleContentHtml: '<img ng-image-appear placeholder class="img-responsive img-thumbnail" src="img/atividades/atividades_quinta_pedagogica_small.jpg"><p>Bem vindo à Quinta Pedagógica do Sesimbra Natura Park, vou ser o teu guia.</p>'
      // }
      // , {
      //   badgeClass: 'bg-positive',
      //   // badgeIconClass : 'ion-gear-b',
      //   badgeIconClass: '',
      //   title: 'Descoberta!',
      //   when: 'à 12 minutos',
      //   titleContentHtml: '',
      //   contentHtml: '<img ng-image-appear placeholder class="img-responsive" src="img/snp_projeto_02_small.jpg"><p>Encontraste a região da Chacra</p>',
      //   footerContentHtml: '<a href="#/tab/regiao/RI_D/PI_16">ir para a região</a>'
      // }
      // , {
      //   image: "img/atividades_quinta_pedagogica.jpg",
      //   badgeClass: 'bg-balanced',
      //   // badgeIconClass : 'ion-person',
      //   title: 'Foto - Album',
      //   titleContentHtml: '<img class="img-responsive" src="img/atividades_quinta_pedagogica.jpg">',
      //   contentHtml: lorem,
      //   // footerContentHtml : '<a href="">Continue Reading</a>'
      // }
    ];

    $scope.addInHouseEvent = function (title, pic_src, caption, thumb_src, NOTI_PUSH) {
      var d = new Date();
      var when = d.toDateString();
      // $scope.events.push(
      //   {
      //     badgeClass: 'bg-positive',
      //     // badgeIconClass : 'ion-gear-b',
      //     badgeIconClass: '',
      //     title: 'Descoberta!',
      //     when: 'à 12 minutos',
      //     titleContentHtml: '',
      //     contentHtml: '<img ng-image-appear placeholder class="img-responsive" src="img/snp_projeto_02_small.jpg"><p>Encontraste a região da Chacra</p>',
      //     footerContentHtml: '<a href="#/tab/regiao/RI_D/PI_16">ir para a região</a>'
      //   });

      // if (NOTI_PUSH) {
      //   var max = 0;
      //   $scope.events.forEach(function (event) {
      //     if (event.id > max)
      //       max = event.id;
      //   });
      //   $scope.events.push(
      //     {
      //       // id: 0,
      //       badgeClass: 'mascoteAvatar',
      //       badgeIconClass: 'bg-dark',
      //       // badgeIconClass : 'ion-ionic',
      //       // badgeIconClass : 'avatar',
      //       title: title || 'Quinta Pedagógica',
      //       when: when,
      //
      //       // contentHtml: '<img ng-image-appear placeholder class="img-responsive img-thumbnail" src="img/atividades_quinta_pedagogica_small.jpg"><p>Bem vindo à Quinta Pedagógica do Sesimbra Natura Park, vou ser o teu guia.</p>'
      //       contentHtml: '',
      //       titleContentHtml: '<img class="img-responsive" src="' + thumb_src + '"><p>' + caption + '</p>'
      //     });
      //
      //   $ionicScrollDelegate.resize();
      // }

      query = "INSERT INTO `journal` (IMG,caption, thumbnail_data, title, auto) VALUES (?,?,?,?,?)";
      // $cordovaSQLite.execute($scope.db, query, [entry.toURL(), "No caption yet!", "data:image/png;base64," + res.imageData]).then(function (res) {
      $cordovaSQLite.execute($scope.db, query, [pic_src, caption, thumb_src, title, 'YES']).then(function (res) {
        var message = "INSERT ID -> " + res.insertId;
        // $scope.captureImageId = res.insertId;
        console.log(message, pic_src, res);
        // alert(message);
        if (NOTI_PUSH) {
          $scope.events.push(
            {
              id: res.insertId,
              inHouse: true,
              badgeClass: 'mascoteAvatar',
              badgeIconClass: 'bg-dark',
              // badgeIconClass : 'ion-ionic',
              // badgeIconClass : 'avatar',
              title: title || 'Quinta Pedagógica',
              when: when,

              // contentHtml: '<img ng-image-appear placeholder class="img-responsive img-thumbnail" src="img/atividades_quinta_pedagogica_small.jpg"><p>Bem vindo à Quinta Pedagógica do Sesimbra Natura Park, vou ser o teu guia.</p>'
              contentHtml: '',
              titleContentHtml: '<img class="img-responsive" src="' + thumb_src + '"><p>' + caption + '</p>'
            });

          $ionicScrollDelegate.resize();
        }
      }, function (err) {
        console.error(err);
        alert(err);
      });

    };

    // if ($rootScope.APP.firstTime)
    //   $scope.addInHouseEvent("Welcome Back", "img/atividades/atividades_quinta_pedagogica_small.jpg", "Instalaste a aplicação da Quinta Pedagógica do Sesimbra Natura Park, eu vou ser o teu guia.", "img/atividades/atividades_quinta_pedagogica_small.jpg", false);


    $scope.addEvent = function (id, img, thumb, caption, noRefresh, when, title, auto) {
      if (!when) {
        var d = new Date();
        when = d.toDateString();
      }
      var RI = $regioes.convertRegiaoLongToShort($rootScope.currentRI);
      // var RI = "Hello";

      if (auto == "NO") {

        $scope.events.push({
          // image: thumb,
          id: id,
          inHouse: false,
          edit: true,
          image_src: img,
          badgeClass: 'bg-royal',
          // badgeIconClass : 'ion-checkmark',
          title: title || 'Foto - Album',
          titleContentHtml: '<img class="img-responsive" src="' + thumb + '">',
          when: when,
          contentHtml: caption
        });
      } else

      // $gameFactory.addPoints("foto");

        $scope.events.push(
          {
            id: id,
            inHouse: true,
            badgeClass: 'mascoteAvatar',
            badgeIconClass: 'bg-dark',
            title: title || 'Quinta Pedagógica',
            when: when,
            titleContentHtml: '<img class="img-responsive" src="' + thumb + '">',
            contentHtml: caption
          });

      if (!noRefresh)
        $ionicScrollDelegate.resize();

    };
    // optional: not mandatory (uses angular-scroll-animate)
    $scope.animateElementIn = function ($el) {
      $el.removeClass('timeline-hidden');
      $el.addClass('bounce-in');
    };

    // optional: not mandatory (uses angular-scroll-animate)
    $scope.animateElementOut = function ($el) {
      $el.addClass('timeline-hidden');
      $el.removeClass('bounce-in');
    };

    $scope.reExecuteAnimation = function () {
      TM = document.getElementsByClassName('tm');
      for (var i = 0; i < TM.length; i++) {
        removeAddClass(TM[i], 'bounce-in');
      }
    }

    $scope.rePerformAnimation = function () {
      $scope.reExecuteAnimation();
    };

    $scope.leftAlign = function () {
      $scope.side = 'left';
      $ionicScrollDelegate.resize();

      $scope.reExecuteAnimation();
    };

    $scope.rightAlign = function () {
      $scope.side = 'right';
      $ionicScrollDelegate.resize();

      $scope.reExecuteAnimation();
    };

    $scope.defaultAlign = function () {
      $scope.side = '';
      $ionicScrollDelegate.resize();

      $scope.reExecuteAnimation();
      // or 'alternate'
    };

    // camera ctrl

    $scope.allImages = [];

    $scope.zoomMin = 1;

    $scope.showImages = function (index) {
      console.log("clicked img in journal", index);

      if (!$scope.events[index].edit)
        return;

      $scope.activeSlide = 0;

      $scope.images.activeIMG = $scope.events[index].image_src;
      // $scope.images.push({
      //   activeIMG: $scope.events[index].image_src
      // });
      console.log("clicked image: ", $scope.images.activeIMG, $scope.events);
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

      $eventFactory.addEventHandler();

      function done(evt) {
        console.warn("Write completed.");

        var timestamp = new Date().getTime();
        var todate = new Date(timestamp).getDate();
        var tomonth = new Date(timestamp).getMonth() + 1;
        var toyear = new Date(timestamp).getFullYear();
        var whendb = toyear + '/' + tomonth + '/' + todate + " " + $rootScope.currentRI;

        $scope.addEvent($scope.captureImageId, $scope.captureImage, $scope.thumbNailName, "", 0, whendb, 'Foto - Album', "NO");
        $ionicLoading.hide();
        $scope.showCaption();
      }

      function error(evt) {
        $ionicLoading.hide();
        console.error("Write failed:" + evt);
      }

      function savebase64AsImageFile(folderpath, filename, content, contentType) {
        // Convert the base64 string in a Blob
        var DataBlob = blob.b64toBlob(content, contentType);

        console.log("Starting to write the file :3");

        window.resolveLocalFileSystemURL(folderpath, function (dir) {
          console.log("Access to the directory granted succesfully");
          dir.getFile(filename, {create: true}, function (file) {
            console.log("File created succesfully.", file.toURL());
            $scope.thumb_file = file.toURL();
            file.createWriter(function (fileWriter) {
              console.log("Writing content to file");
              // fileWriter.write(DataBlob);
              fileWriter.onwrite = done;
              fileWriter.onerror = error;
              // fileWriter.write(content);
              fileWriter.write(DataBlob);
            }, function () {
              console.error('Unable to save file in path ' + folderpath);
            });
          });
        });
      }

      saveThumbToFile = function (dir, thumb) {
        var contentType = "image/png";
        // var folderpath = "file:///storage/emulated/0/";
        var folderpath = dir.nativeURL;
        // var folderpath = dir.nativeURL + "thumb_" + $scope.newFile + ".png";
        var filename = "thumb_" + $scope.newFile + ".png";

        var block = thumb.split(";");
// Get the content type
        var dataType = block[0].split(":")[1];// In this case "image/png"
// get the real base64 content of the file
        var realData = block[1].split(",")[1];// In this case "iVBORw0KGg...."

        savebase64AsImageFile(folderpath, filename, realData, dataType);
        console.log("saveThumbToFile", folderpath, filename, contentType);
      };

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

      $scope.$on('ADD_JOURNAL', function (e, args) {
        console.log("ADD_JOURNAL: ", args);
        // $scope.addInHouseEvent("Welcome Back!", "img/journal/atividades_quinta_pedagogica_small.jpg", "Instalaste a aplicação da Quinta Pedagógica do Sesimbra Natura Park, eu vou ser o teu guia!", "img/journal/atividades_quinta_pedagogica_small.jpg", true);
        $scope.addInHouseEvent(args.title, args.image, args.caption, args.thumb, true);
      });

      console.log("camera controller ready 1");
      $ionicPlatform.ready(function () {
        console.log("retrieving last pic");
        query = "select * from journal";
        $cordovaSQLite.execute(db, query, []).then(function (res) {
          if (res.rows.length > 0) {
            var message = "SELECTED -> " + res.rows.item(res.rows.length - 1).IMG;
            // $scope.showAlert(message);
            for (var f = 0; f < res.rows.length; f++)
              $scope.addEvent(res.rows.item(f).id, res.rows.item(f).IMG, res.rows.item(f).thumbnail_data, res.rows.item(f).caption, 1, res.rows.item(f).whendb, res.rows.item(f).title, res.rows.item(f).auto);


            $ionicScrollDelegate.resize();
            // $scope.allImages.push({
            //   src: res.rows.item(f).thumbnail_data,
            //   img: res.rows.item(f).IMG
            // });

            console.log(message, res);
            // $scope.lastPhoto = res.rows.item(res.rows.length - 1).IMG;
            // $scope.lastPhoto_thumb = res.rows.item(res.rows.length - 1).thumbnail_data;
            // $scope.addEvent($scope.lastPhoto, $scope.lastPhoto_thumb);
            // $scope.allImages.src = $scope.lastPhoto;
            // $scope.$apply();
          } else {
            // $scope.showAlert("No results found");
            console.log("No results found");
            // $scope.addInHouseEvent("Welcome Back!", "img/journal/atividades_quinta_pedagogica_small.jpg", "Instalaste a aplicação da Quinta Pedagógica do Sesimbra Natura Park, eu vou ser o teu guia!", "img/journal/atividades_quinta_pedagogica_small.jpg", true);
          }
        }, function (err) {
          $scope.showAlert(err);
          console.error(err);
        });
      });

      function movePic(file) {
        // window.resolveLocalFileSystemURI(file, resolveOnSuccess, resOnError);
        window.resolveLocalFileSystemURL(file, resolveOnSuccess, resOnError);
      }

//Callback function when the file system uri has been resolved
      function resolveOnSuccess(entry) {
        var d = new Date();
        var n = d.getTime();
        $scope.newFile = n;
        $scope.newFileName = n + ".jpg";

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSys) {

            myFolderApp = "images";
            fileSys.root.getDirectory(myFolderApp,
              {create: true, exclusive: false},
              function (directory) {
                $scope.saveDir = directory;
                console.warn("DIR: ", directory);
                entry.copyTo(directory, $scope.newFileName, successMove, resOnError);
              },
              resGetDirImagesOnError);

          },
          resOnError);
      }

      function successCopy(entry) {
        console.log("Android: Success copied file, new URL: %s", entry.toURL(), entry);

        if ((device.platform === 'Android') && (Number(ionic.Platform.version()) >= 5)) {
          cordova.plugins.MediaScannerPlugin.scanFile(entry.toURL(),
            function (res) {
              console.warn("succes in add file to media scannner", res);
            }, function (err) {
              console.error("Error add file to media scannner", err);
            });
        }
      }

//Callback function when the file has been moved successfully - inserting the complete path
      function successMove(entry) {

        if (device.platform === 'Android') {
          console.warn("checking for dir " + cordova.file.externalRootDirectory);
          window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (fileEntry) {

            // console.warn("file entry: ", fileEntry);
            console.warn("file entry full + app: ", fileEntry.toURL() + myRootFolderApp);

            fileEntry.filesystem.root.getDirectory(myRootFolderApp,
              {create: true, exclusive: false},
              function (directory) {
                entry.copyTo(directory, $scope.newFileName, successCopy, resDirOnError);
              },
              resGetdirOnError);
          });
        }

        $scope.lastPhoto = entry.toURL();

        console.log("Success moved file, new URL: %s", entry.toURL(), entry.fullPath);

        resizeImage(entry.toURL()).then(function (res) {
          console.log("RESize RES: ", res);
          // $scope.allImages.push({
          //   src: "data:image/png;base64," + res.imageData,
          //   img: entry.toURL()
          // });
          // $scope.$apply();
          $scope.thumbNailName = $scope.saveDir.nativeURL + "thumb_" + $scope.newFile + ".png";
          console.warn("ThumbFile: ", $scope.thumbNailName);
          // saveThumbToFile($scope.saveDir, res.imageData);
          saveThumbToFile($scope.saveDir, "data:image/png;base64," + res.imageData);

          // $ionicLoading.hide();

          $scope.captureImage = entry.toURL();

          // $scope.addEvent(entry.toURL(), thumbNailName);
          // $ionicScrollDelegate.resize();
          fotoDone();
          var timestamp = new Date().getTime();
          var todate = new Date(timestamp).getDate();
          var tomonth = new Date(timestamp).getMonth() + 1;
          var toyear = new Date(timestamp).getFullYear();
          var whendb = toyear + '/' + tomonth + '/' + todate + " " + $rootScope.currentRI;
          // alert(whendb);

          query = "INSERT INTO `journal` (IMG,caption, thumbnail_data, title, auto, whendb) VALUES (?,?,?,?,?,?)";
          // $cordovaSQLite.execute($scope.db, query, [entry.toURL(), "No caption yet!", "data:image/png;base64," + res.imageData]).then(function (res) {
          $cordovaSQLite.execute($scope.db, query, [entry.toURL(), "Sem comentário.", $scope.thumbNailName, 'Foto - Album', 'NO', whendb]).then(function (res) {
            var message = "INSERT ID -> " + res.insertId;
            $scope.captureImageId = res.insertId;
            console.log(message, entry.toURL(), res);
            // alert(message);
          }, function (err) {
            console.error(err);
            // alert(err);
          });
          $rootScope.deviceBUSY = 0;
        });
      }

      function resDirOnError(error) {
        console.log("DIR ERROR", error, error.code);
        $rootScope.deviceBUSY = 0;
      }

      function resGetdirOnError(error) {
        console.log("GET DIR ERROR", error, error.code);
        $rootScope.deviceBUSY = 0;
      }

      function resGetDirImagesOnError(error) {
        console.log("GET DIR images ERROR", error, error.code);
        $rootScope.deviceBUSY = 0;
      }

      function resOnError(error) {
        console.log("COPY ERROR: ", error, error.code);
        $rootScope.deviceBUSY = 0;
      }

      var fotoDone = function () {
        var found = false;
        var regioes = {};
        var RI = $regioes.convertRegiaoLongToShort($rootScope.currentRI);

        $regioes.getRegioes().then(function (res) {
          regioes = JSON.parse(res || [{}]);
          console.log("fotoCompleto: GOT regioes from cordova service: ", regioes);
          for (var f = 0; f < regioes.length; f++) {
            console.log("f: %s ri: %s r_cur: %s", f, regioes[f].descricao, $rootScope.currentRI);
            if (regioes[f].nome == RI) {
              if (!regioes[f].fotoDone) {
                regioes[f].fotoDone = true;
                $gameFactory.addPoints("foto");
                found = true;
              }
            }
          }
          if (found) {
            console.log("fotoCompleto: UPDATE: ", regioes);
            $regioes.setRegioesPromise(regioes).then(function () {
              // scope.goMapa('ok');
              // $ionicHistory.goBack();
            });
            // $timeout(function () {
            //   scope.goMapa();
            // }, 200);
          } else
            console.warn("fotoCompleto RI not found", $rootScope.currentRI);
        });
      };

      $scope.takePicture = function () {
        console.log("take picture ready");

        $rootScope.deviceBUSY = 1;
        if ($scope.takingPicture)
          return;
        $scope.takingPicture = 1;

        if (device.platform === 'iOS') {
          $ionicLoading.show();
        }

        navigator.camera.getPicture(onSuccess, onFail, {
          quality: 75,
          // destinationType: Camera.DestinationType.FILE_URI,
          destinationType: Camera.DestinationType.NATIVE_URI,
          encodingType: 0,
          targetWidth: 640,
          targetHeight: 480,
          correctOrientation: true,
          saveToPhotoAlbum: true
        });

        function onSuccess(imageURI) {

          // if (device.platform === 'iOS') {
          //   $ionicLoading.hide();
          // }

          console.log(imageURI);
          if (device.platform === 'Android')
            $ionicLoading.show();

          $scope.takingPicture = 0;
          // $scope.lastPhoto = imageURI;
          // $scope.$apply();
          movePic(imageURI);
        }

        function onFail(message) {
          console.error('Failed because: ' + message);
          $scope.takingPicture = 0;
          $ionicLoading.hide();
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
  .controller("BarCodeReaderController", function ($rootScope, $scope, $cordovaBarcodeScanner, $ionicSlideBoxDelegate, perguntas, $stateParams, $state, $regioes, $timeout, $gameFactory, $ionicHistory) {
    console.log("ionic controller BarCodeReaderController ready");

    var stopped = true;
    var score = 0;
    $scope.PIs = [];
    $scope.startted = false;
    // $scope.cat1 = true;
    $scope.header = true;
    $scope.view = {
      buttonClass: "",
      buttonStart: "",
    };

    $scope.$on('QUIZ_POPUP', function (e, args) {
      console.log("QUIZ_POPUP mapapi: ", args);
      // drawedMapa = false;
      // $regioes.drawedMapa('OFF');
      // createCircles();
      $timeout(function () {
        // loadRegiao(args.regiao);
        $rootScope.showPopup({templateUrl: 'templates/popups/desafio_' + args.desafio + '.html'});
      }, 200);
    });

    $scope.goBack = function () {
      $state.go("tab.mapa", {
        RI: "ALL",
        PI: ""
      });
    };

    $scope.goMapaQR = function () {
      $state.go("tab.mapa", {
        RI: "ALL",
        PI: ""
      });
    };

    $scope.closeQRHeader = function () {
      $scope.header = false;
      $gameFactory.QRHeaderValue('OFF');
      // $scope.headeron = false;
    };

    listClick = function (index) {
      var card = $scope.PIs.splice(index, 1);
      console.log("clicked card: ", card);
      // var elem = document.getElementById("PI_" + card.id);
      // if (elem) {
      //   elem.classList.add("animated", "bounce");
      // }
    };

    $scope.goQRmapa = function (res) {
      $timeout(function () {
        $rootScope.$broadcast("QUIZ_POPUP", {desafio: res});
      }, 600);
      // $ionicHistory.goBack();
      $state.go("tab.mapa", {
        RI: "ALL",
        PI: ""
      });
    };

    $scope.goPI_QR = function (pop) {
      if (pop)
        $timeout(function () {
          $rootScope.$broadcast("QUIZ_POPUP", {desafio: "ok"});
        }, 600);


      // $ionicHistory.goBack();
      // $scope.regiao.PIs.some(function (tpi) {
      //   // console.warn("tpi:", tpi);
      //   if (tpi.visited)
      //     count++;
      //   if (PI.nome == tpi.nome) {
      //     $gameFactory.setHeaderOff($scope.regiao.nome);
      //     if (!tpi.visited) {
      //       tpi.visited = true;
      //       // console.warn("pi descicao", tpi.descricao);
      //       $rootScope.PI_descricao = tpi.descricao;
      //       // $scope.$apply();
      //       console.log("found PI goPI, marked visited: ", PI);
      //       // return true;
      //     } else {
      //       $rootScope.PI_descricao = tpi.descricao;
      //       console.log("found PI goPI: ", tpi);
      //       // $scope.$apply();
      //       // return true;
      //     }
      //   }
      // });
      $state.go("tab.mapaPI", {
        RI: $scope.QR_RI,
        PI: $scope.QR_PI
      });
    };

    QRcompleto = function () {
      $regioes.getRegioes().then(function (res) {
        var found = false;
        var RI = $scope.QR_RI;
        var regioes = JSON.parse(res || [{}]);
        console.log("qrCompleto: GOT regioes from cordova service");
        for (var f = 0; f < regioes.length; f++) {
          if (regioes[f].nome == $scope.QR_RI) {
            if (!regioes[f].qrDone) {
              regioes[f].qrDone = true;
              $gameFactory.addPoints("desafios");
              found = true;
            }
          }
        }
        if (found) {
          console.log("qrCompleto: UPDATE: ", regioes);
          $regioes.setRegioesPromise(regioes).then(function () {
            $scope.goPI_QR(true);
            // $ionicHistory.goBack();
          });
          // $timeout(function () {
          //   scope.goMapa();
          // }, 200);
        } else {
          console.warn("Qrcompleto RI not found: ", $scope.QR_RI);
          $scope.goPI_QR(false);
        }
      });
    };

    checkQR = function (BCD) {
      if (BCD == "")
        return;

      var res = BCD.text.split(" ");
      var id = null;
      var found = false;

      console.log(res);
      if (res.length == 2) {
        if ((res[0].indexOf("RI_") == -1) || (res[1].indexOf("PI_") == -1)) {
          return;
        }
        if (!perguntas.checkPI(res[0], res[1]))
          return;


        $scope.QR_PI = res[1];
        if (res[0] == $scope.QR_RI) {
          // score += 20;
          for (var f = 0; f < $scope.PIs.length; f++) {
            // if ($scope.PIs[f].descricao == res[1]) {
            if ($scope.PIs[f].nome == res[1]) {
              $scope.PIs[f].score += 1;
              id = $scope.PIs[f].id;
              $scope.QR_PI = res[1];
              QRcompleto();
              found = true;
              // $scope.PIs[f].score -= 1;

            }
          }

          if ($scope.view.buttonClass != "animated tada balanced")
            $scope.view = {
              buttonClass: "animated tada balanced",
              buttonStart: score
            };
          else {
            console.log("previous equal ######");

            $scope.view = {
              buttonClass: "balanced myanimated mytada",
              buttonStart: score
            };
          }

          var elem = document.getElementById("PI_" + id);
          if (elem) {
            elem.classList.add("animated", "tada");
            $timeout(function () {
              elem.classList.remove("animated", "tada");
            }, 1000);
          }

          $timeout(function () {
            QRcompleto();
          }, 300);

        } else {
          $scope.QR_RI = res[0];
          $scope.goPI_QR(false);
        }
        // $scope.goQRmapa("nok");
      } else {
        console.log("QR code not found in regiao: ", BCD);
      }

    };

    $scope.startQR = function (RI) {
      $scope.QR_RI = RI;
      $scope.header = $gameFactory.QRHeaderValue();
      // $scope.disableSwipe();
      // $rootScope.$broadcast('QR_CODE_SCAN', { showQR: true });
      stopped = false;
      score = 0;
      $scope.view = {
        buttonClass: "",
        buttonStart: score
      };
      $scope.startted = true;
      var tempPIs = perguntas.getPIs($stateParams.RI);
      console.log("starting QR caça: ", tempPIs);

      $timeout(function () {
        for (f = 0; f < tempPIs.length; f++) {
          // for (var f = 0; f < 15; f++) {
          tempPIs[f].score = 0;
          $scope.PIs.push(tempPIs[f]);
        }
      }, 500);
    };

    $scope.stopQR = function () {
      // $rootScope.$broadcast('QR_CODE_SCAN', { showQR: false });
      // $scope.enableSwipe();
      stopped = true;
      console.log("atopped QR caça: ");
      $scope.startted = false;
      $scope.PIs = [];
      $scope.goMapa("nok");
    };

    $scope.getBarcode = function () {
      console.log("Calling scanbarcode");
      $rootScope.deviceBUSY = 1;
      $cordovaBarcodeScanner
        .scan({
          "preferFrontCamera": false, // iOS and Android
          "showFlipCameraButton": false, // iOS and Android
          //"prompt" : "Coloque um código barras dentro da área" // supported on Android only
          "formats": "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
          // "orientation" : "portrait" // Android only (portrait|landscape), default unset so it rotates with the device
        })
        .then(function (barcodeData) {
          console.warn("Bar code data : ", barcodeData);
          // Success! Barcode data is here
          $scope.code = barcodeData.text;
          $scope.barcodeData = barcodeData;
          $rootScope.deviceBUSY = 0;

          checkQR(barcodeData);

          // $scope.$apply();
        }, function (error) {
          // An error occurred
          console.error("Failed QR coe scan!", error)
          $rootScope.deviceBUSY = 0;
        });

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

    $ionicPlatform.ready(function () {

      console.log("Logged: " + $rootScope.APP.logged + " online: " + $cordovaNetwork.isOnline());
      if (!$rootScope.APP.logged && $cordovaNetwork.isOnline()) {
        users.init();
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
                userInfo.fb_email = userInfo.email;
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

            $scope.profile_photo = "https://graph.facebook.com/" + authResponse.userID + "/picture?type=large";
            $scope.profile_name = profileInfo.name;
            $scope.profile_email = profileInfo.email;

            console.log("GOT FB: ", profileInfo.name, "https://graph.facebook.com/" + authResponse.userID + "/picture?type=large");

            $ionicLoading.hide();

            $scope.Download("https://graph.facebook.com/" + authResponse.userID + "/picture?type=large");
            if ($cordovaNetwork.isOnline()) {
              $rootScope.APP.logged = true;
              $rootScope.APP.user.fb_email = profileInfo.email;
              users.addUser({
                fb_email: profileInfo.email,
                nome: profileInfo.name,
                email: profileInfo.email,
                platform: ionic.Platform.platform(),
                version: ionic.Platform.version(),
                timestamp: Date.now(),
                dataInicio: Date().toLocaleLowerCase(),
                modelo: ionic.Platform.device().model
              })
            }
            $rootScope.enableBeacons = true;
            $state.go("tab.dash");
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
          $rootScope.showAlert("Liga a Internet e tenta novamente");
          return 0;
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
                      $rootScope.APP.user.fb_email = profileInfo.email;
                      users.addUser({
                        fb_email: profileInfo.email,
                        nome: profileInfo.name,
                        email: profileInfo.email,
                        platform: ionic.Platform.platform(),
                        version: ionic.Platform.version(),
                        timestamp: Date.now(),
                        dataInicio: Date().toLocaleLowerCase(),
                        modelo: ionic.Platform.device().model
                      })
                    }
                    // $rootScope.showAlert("Facebook Logged IN com o nome: " + profileInfo.name + " email: " + profileInfo.email);
                    $rootScope.enableBeacons = true;
                    $state.go("tab.dash");

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
                $state.go('tab.dash');
              }

            });

          } else {
            // If (success.status === 'not_authorized') the user is logged in to Facebook,
            // but has not authenticated your app
            // Else the person is not logged into Facebook,
            // so we're not sure if they are logged into this app or not.

            console.log('getLoginStatus', success.status);

            $ionicLoading.show({
              template: 'A iniciar a sessão...'
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
          $rootScope.showAlert("Liga a Internet e tente novamente");
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
                // $rootScope.showAlert("Facebook Logged OUT!");
                $state.go('tab.dash');
              },
              function (fail) {
                $ionicLoading.hide();
              });
          }
        });
      };
    });
  })
  .controller('MapaCtrl', function ($scope, $rootScope, $state, $ionicPlatform, $regioes, $stateParams, $timeout, $window, $gameFactory, $ionicScrollDelegate, $ionicTabsDelegate, $ionicHistory) {
      // $ionicSlideBoxDelegate, $ionicHistory, perguntas) {

      // $ionicLoading.show({
      //   template: 'A verificar o Mapa'
      // });
      console.log("Mapa controller ready");

      $scope.showLegenda = function () {
        $rootScope.showPopup({
          templateUrl: 'templates/popups/mapa_legenda.html',
          cssClass: 'myPopupLegenda',
          timeout: 600000
        });
      };

      scrollToTop = function () { //ng-click for back to top button
        $ionicScrollDelegate.scrollTop();
      };

      $scope.goQuiz = function (RI) {
        console.log("Go Quiz", RI, $scope.regiao);
        if (!RI)
          RI = $scope.RI;
        // if ($stateParams.RI != "ALL") {
        //   $ionicTabsDelegate.select(3);
        //   $timeout(function () {
        if (!$scope.regiao.completed) {
          $rootScope.showPopup({templateUrl: 'templates/popups/desafio_locked.html'});
          return;
        }
        // $ionicHistory.goBack();
        $state.go("tab.mapaPIdesafios", {
          RI: RI,
          PI: RI,
          tipo: "QUIZ"
        });
        //   }, 300);
        // } else {
        //   if (!$scope.regiao.completed) {
        //     $rootScope.showPopup({templateUrl: 'templates/popups/desafio_locked.html'});
        //     return;
        //   }
        //   // $ionicHistory.goBack();
        //   $state.go("tab.mapa", {
        //     RI: $scope.RI,
        //     PI: $scope.RI + "_Q"
        //   });
        // }

      };

      $scope.goBack = function () {
        $ionicHistory.goBack();
      };

      $scope.goQR = function (RI) {
        if (!RI)
          RI = $scope.regiao.nome;
        console.log("Go QR", RI);
        // if ($stateParams.RI != "ALL") {
        //   $ionicTabsDelegate.select(3);
        //   $timeout(function () {
        if ($scope.regiao.locked) {
          $rootScope.showPopup({templateUrl: 'templates/popups/desafio_locked_qr.html'});
          return;
        }

        $state.go("tab.mapaPIdesafios", {
          RI: RI,
          PI: RI,
          tipo: "QR"
        });
        //   }, 300);
        // } else {
        //   $state.go("tab.mapa", {
        //     RI: $scope.RI,
        //     PI: $scope.RI + "_QR"
        //   });
        // }
      };

      var aCircles = [];
      // var drawedMapa = false;
      var elem = null;
      $scope.data = {
        PI_descricao: "Hello",
        buttonColor: "#ec6157"
      };

      loadRegiao = function (RI, QR, QUIZ, JUSTGO) {

        if (JUSTGO) {
          if (QR)
            $timeout(function () {
              $scope.goQR(RI);
            }, 300);
          if (QUIZ)
            $timeout(function () {
              $scope.goQuiz(RI);
            }, 300);
        }
        // if (CIRCLES)
        //   $timeout(function () {
        //     createCircles();
        //   }, 300);

        // if ((QR) || (QUIZ) || (JUSTGO))
        //   return;

        $regioes.getRegioes().then(function (res) {
          console.log("Load regiao ready ri:", RI);
          aCircles = JSON.parse(res || [{}]);

          aCircles.some(function (reg) {

            if (reg.nome == RI) {
              console.log("Loading regiao: found");
              // if (!$scope.regiaoLoaded)
              $scope.regiao = angular.copy(reg);
              // $timeout(function () {
              //   angular.copy(reg, $scope.regiao)
              // });
              $scope.regiaoLoaded = true;
              $scope.RI = reg.nome;
              // $scope.$apply();
              var file = reg.nome;
              if (reg.locked)
                file += "_red";
              else if (reg.completed)
                file += "_green";
              else file += "_orange";
              file += "_90.png";
              // $scope.regiao.headeron = true;
              $scope.regiao.headeron = $gameFactory.isHeaderOn(reg.nome);
              $scope.regiao.marcador = file;
              $scope.marcador = file;
              $scope.PI_FULL = "";
              $scope.PI = "";
              $rootScope.APP.regiaoLoaded = reg.nome;
// $scope.$apply();
              // $regioes.drawedMapa("OFF");
              // drawedMapa = false;
              if (QR)
                $timeout(function () {
                  $scope.goQR(RI);
                }, 600);
              if (QUIZ)
                $timeout(function () {
                  $scope.goQuiz(RI);
                }, 600);
              return true;
            }
          });
        });
      };


      // if (!$rootScope.mapLoaded)
      //   $rootScope.mapLoaded = true;

      $scope.RI = $stateParams.RI;
      // $scope.RI = "RI_A";
      $scope.PI_FULL = $stateParams.PI;
      $scope.PI = $stateParams.PI.replace("PI_", "");

      // if (($stateParams.PI.indexOf("PI") != -1)) {
      //   $regioes.getRegioes().then(function (res) {
      //     regioes = JSON.parse(res || [{}]);
      //
      //     regioes.some(function (reg) {
      //       if (reg.nome == $scope.RI) {
      //         reg.PIs.some(function (tpi) {
      //           if (tpi.nome == $stateParams.PI) {
      //             // $scope.data = {
      //             //   PI_descricao: tpi.descricao
      //             // };
      //             // $scope.data.PI_descricao = tpi.descricao;
      //             $rootScope.PI_descricao = tpi.descricao;
      //             // $scope.$apply();
      //             console.warn("Setting pi desc", tpi.descricao);
      //             // return true;
      //           }
      //         });
      //         // return true;
      //       }
      //
      //     });
      //   });
      // }

      if (($scope.RI == "ALL") && ($stateParams.PI == "")) {
        if (($rootScope.APP.regiao_descoberta) || ($rootScope.APP.start_qr) || ($rootScope.APP.start_quiz) || ($rootScope.APP.load)) {
          console.log("Loading currentri , starting", $regioes.convertRegiaoLongToShort($rootScope.currentRI));
          loadRegiao($regioes.convertRegiaoLongToShort($rootScope.currentRI));
        } else {
          console.log("Loading regiao A , starting");
          loadRegiao("RI_A");
        }

        $rootScope.mapLoaded = true;
      }
      // else {
      //   $scope.regiao = {
      //     nome: "sem região",
      //     nome: "sem região",
      //     banner: "",
      //     marcador: "marcador_galo.png",
      //     headeron: true,
      //     PIs: []
      //   };
      // }

      // $scope.dataChanged = false;
      // $scope.regiao.banner = "Bem-vindo à “Região A”! Aqui vais conhecer pequenas plantas capazes de fazer grandes efeitos nos teus sentidos, os melhores mensageiros, a minha casa, a minha horta e os meus vizinhos marrecos e mudos!";
      // $scope.headeron = false;
      // $scope.$on('QR_CODE_SCAN', function (e, args) {
      //   console.log("tab mapa QR_CODE_SCAN", args);
      //   $scope.showQR = args.showQR;
      //
      //   // console.log("tab mapa QR_CODE_SCAN scandat", args.barcodeData);
      // });
      // console.warn("entering mapa: ", $state.current.url);

      // $scope.$on('$stateChangeSuccess', function (data) {
      //
      //   if (($rootScope.Mapaurl == null) && ($state.current.url == "/regiao/:RI/:PI")) {
      //     console.warn("entering mapa");
      //     $rootScope.Mapaurl = $state.current.url;
      //   }
      //
      //   if (($state.current.url.indexOf("regiao") == -1)) {
      //     $rootScope.Mapaurl = null;
      //     console.warn("leaving mapa");
      //     // if ($rootScope.MapadataChanged) {
      //     //   console.warn("leaving mapa : Data changed: saving");
      //     //   $regioes.setRegioes($regioes.getTempRegioes());
      //     //   $rootScope.MapadataChanged = false;
      //     // }
      //   }
      // });
      if (!$gameFactory.mapaHandler()) {
        $gameFactory.mapaHandler(true);

        $scope.$on("$ionicView.afterEnter", function (event, data) {
          console.log("State $ionicView.beforeEnter MApa Params: ", data);
          // if ($stateParams.PI)

          //   perguntas.init($stateParams.RI, $stateParams.PI);
          // if ($rootScope.APP.regiao_descoberta) {
          //   $rootScope.APP.regiao_descoberta = false;
          //   console.log("Regiao descoberta, loading regiao", $regioes.convertRegiaoLongToShort($rootScope.currentRI));
          //   // $scope.RI = $regioes.convertRegiaoLongToShort($rootScope.currentRI);
          //   loadRegiao($regioes.convertRegiaoLongToShort($rootScope.currentRI));
          // }
          if ($rootScope.APP.start_qr) {
            $rootScope.APP.start_qr = false;
            console.log("mapa onbefore enter, start qr", $regioes.convertRegiaoLongToShort($rootScope.currentRI));
            // $scope.RI = $regioes.convertRegiaoLongToShort($rootScope.currentRI);
            // loadRegiao($regioes.convertRegiaoLongToShort($rootScope.currentRI));
            loadRegiao($regioes.convertRegiaoLongToShort($rootScope.currentRI), true, false, true);
          }
          if ($rootScope.APP.start_quiz) {
            $rootScope.APP.start_quiz = false;
            console.log("mapa onbefore enter, start quiz", $regioes.convertRegiaoLongToShort($rootScope.currentRI));
            // $scope.RI = $regioes.convertRegiaoLongToShort($rootScope.currentRI);
            // loadRegiao($regioes.convertRegiaoLongToShort($rootScope.currentRI));
            loadRegiao($regioes.convertRegiaoLongToShort($rootScope.currentRI), false, true, true);
          }

          if ($stateParams.RI == "ALL") {
            // if ($rootScope.APP.regiao_descoberta)
            $timeout(function () {
              createCircles();
            }, 600);

            $timeout(function () {
              var idMarcador = $window.document.getElementById('marcador');
              if (idMarcador)
                idMarcador.classList.remove('animated', 'bounce');
            }, 2000);
          }
        });

        $scope.$on('RI_FOUND', function (e) {
          console.log("tab mapa RI_FOUND refresh: %s", $rootScope.currentRI);
          // drawedMapa = false;
          // $regioes.drawedMapa('OFF');
          // loadRegiao($regioes.convertRegiaoLongToShort($rootScope.currentRI), 0, 0, 1);
          if ($stateParams.RI == "ALL")
            $timeout(function () {
              createCircles();
            }, 200)
        });

        $scope.$on('GO_REGIAO', function (e, args) {
          console.log("go regiao refresh: ", args.regiao, args, $state.current, $stateParams);
          // drawedMapa = false;
          // $regioes.drawedMapa('OFF');
          // createCircles();
          $scope.RI = args.regiao;
          if ($stateParams.RI != "ALL") {
            $ionicTabsDelegate.select(3);
            // $ionicHistory.goBack();
            $timeout(function () {
              // loadRegiao($regioes.convertRegiaoLongToShort(args.regiao), args.qr, args.quiz);
              $rootScope.$broadcast('GO_REGIAO', {regiao: args.regiao})
            }, 400);
          } else {
            $timeout(function () {
              loadRegiao($regioes.convertRegiaoLongToShort(args.regiao), args.qr, args.quiz);
            }, 400)
          }
          // if (args.qr)
          //   $timeout(function () {
          //     goQR();
          //   }, 300);
        });

        $scope.$on('QUIZ_POPUP', function (e, args) {
          console.log("QUIZ_POPUP refresh: ", args);
          // drawedMapa = false;
          // $regioes.drawedMapa('OFF');
          // createCircles();
          $timeout(function () {
            // loadRegiao(args.regiao);
            $rootScope.showPopup({templateUrl: 'templates/popups/desafio_' + args.desafio + '.html'});
          }, 200);
        });
      }

      $scope.init = function () {
        var RI = $stateParams.RI;
        var PI = $stateParams.PI;
        if (!PI)
          return;

        console.log("mapa init init");
        // $scope.slideIndex = 0;
        // $scope.start = 1;
        // if (!$scope.perguntas)
        //   perguntas.init(RI, PI);
      };

      $scope.goPI = function (PI) {
        console.log("GOPI: ", PI);
        var count = 0;
        $scope.closeHeader();
        $scope.regiao.PIs.some(function (tpi) {
          // console.warn("tpi:", tpi);
          if (tpi.visited)
            count++;
          if (PI.nome == tpi.nome) {
            $gameFactory.setHeaderOff($scope.regiao.nome);
            if (!tpi.visited) {
              tpi.visited = true;
              // console.warn("pi descicao", tpi.descricao);
              $rootScope.PI_descricao = tpi.descricao;
              // $scope.$apply();
              console.log("found PI goPI, marked visited: ", PI);
              // return true;
            } else {
              $rootScope.PI_descricao = tpi.descricao;
              console.log("found PI goPI: ", tpi);
              // $scope.$apply();
              // return true;
            }
          }
        });
        if (count == $scope.regiao.PIs.length - 1) {
          console.log("regiao completed");
          $scope.regiao.completed = true;
        }
        // $scope.regiao = {};
        // $timeout(function () {
        $scope.closeHeader();
        $state.go("tab.mapaPI", {
          RI: $scope.RI,
          PI: PI.nome
        });
        // }
        // , 100);
      };

      $scope.closeHeader = function () {
        $scope.regiao.headeron = false;
        $gameFactory.setHeaderOff($scope.RI);
        // $scope.headeron = false;
      };

      $scope.updateRegiaoVisitada = function (RI, PI) {
        var count = 0;
        var total = 0;
        var found = false;

        $regioes.getRegioes().then(function (res) {
          aCircles = JSON.parse(res || [{}]);

          // $regioes.setTempRegioes($scope.aCircles);
          // console.log("createCircles: GOT regioes from cordova service to aCircles", $scope.aCircles);
          // drawCircles();
          // aCircles = $regioes.getTempRegioes();
          console.log("Mapa updateRegiaoVisitada: ", RI, PI, aCircles);
          // if (aCircles)
          aCircles.some(function (reg) {
            if (reg.nome == RI) {
              if (reg.PIs) {
                count = 0;
                total = 0;
                reg.PIs.forEach(function (tpi) {
                    if (tpi.visited)
                      count++;
                    total++;
                    if (tpi.nome == PI) {
                      // $rootScope.PI_descricao = tpi.descricao;
                      // $scope.data.PI_descricao = tpi.descricao;
                      // $scope.$apply();
                      if (!tpi.visited) {
                        tpi.visited = true;
                        count++;
                        found = true;
                        console.log("Mapa updateRegiaoVisitada Found updated, visited PI: ", PI, count, total);
                        // $regioes.setTempRegioes(aCircles);
                      } else {
                        console.log("Mapa updateRegiaoVisitada Found no need to update PI: ", PI, count, total);
                      }
                    }
                  }
                );
                if (found) {
                  if (count == total) {
                    console.log("Mapa updateRegiaoVisitada: regiao completa:", reg);
                    reg.completed = true;
                    $regioes.setRegioes(aCircles);
                  } else {
                    $regioes.setRegioes(aCircles);
                    console.log("Mapa updateRegiaoVisitada regiao incompleta: PI visitado: %s", PI);
                  }
                  return true;
                }
              }
            }

          });
          // if (found) {
          //   $regioes.setRegioes(aCircles);
          //   return true;
          // }
        });
      };

      $ionicPlatform.ready(function () {

        console.log("Mapactrl ready");
        // $scope.aCircles = [];
        var canvas = document.getElementById('imageView');
        var canvas2 = document.getElementById('imageView2');
        if (canvas2) {
          var context2 = canvas2.getContext('2d');
          context2.imageSmoothingEnabled = false;
          context2.mozImageSmoothingEnabled = false;
          context2.msImageSmoothingEnabled = false;
        }
        if (canvas) {
          var regioes = $regioes.getAllRegioesList();
          var context = canvas.getContext('2d');
          context.imageSmoothingEnabled = false;
          context.mozImageSmoothingEnabled = false;
          context.msImageSmoothingEnabled = false;
        } else console.error("no canvas");

        touchUp = function (e) {

          aCircles = $regioes.getCacheRegioes();
          console.log("rootpop:  acircle", $rootScope.popupON, aCircles);

          for (var f = 0; f <= aCircles.length - 1; f++) {

            var circleY = aCircles[f].centerY - 30;
            var circleX = aCircles[f].centerX;
            // var circleRadius = $scope.aCircles[f].radius;
            var circleRadius = 30;
            var y = e.offsetY - circleY;
            var x = e.offsetX - circleX;
            var dist = Math.sqrt(y * y + x * x);
            //console.log("circle: %s dist: ", $scope.aCircles[f].nome, dist);

            if (dist < circleRadius) {
              console.log("in circle: %s", aCircles[f].nome);

              // if (aCircles[f].locked || !aCircles[f].visited) {
              // if (!aCircles[f].fotoDone || !aCircles[f].visited) {
              //   // if (!aCircles[f].visited) {
              //   // aCircles[f].locked = false;
              //   if (!aCircles[f].fotoDone) {
              //     aCircles[f].fotoDone = true;
              //     $gameFactory.addPoints("foto");
              //   }
              //   if (!aCircles[f].visited) {
              //     $regioes.setRegioes(aCircles);
              //     $gameFactory.addPoints("regioes");
              //     aCircles[f].visited = true;
              //   }
              //   // createCircles();
              // }

              if (aCircles[f].locked) {
                $rootScope.showPopup({templateUrl: 'templates/popups/regiao_locked.html'});
                // aCircles[f].locked = false;
                // aCircles[f].visited = true;
                //
                // $regioes.setRegioes(aCircles);
                // createCircles();
                // context.beginPath();
                // context.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI, false);
                // context.lineWidth = 1;
                // context.strokeStyle = '#003300';
                // context.stroke();
                // context.closePath();
              }
              else {
                $scope.regiao = aCircles[f];
                $scope.RI = aCircles[f].nome;
                var file = aCircles[f].nome;
                if (aCircles[f].locked)
                  file += "_red";
                else if (aCircles[f].completed)
                  file += "_green";
                else file += "_orange";
                file += "_90.png";
                $scope.regiao.marcador = file;
                $scope.marcador = file;
                console.log("file: ", file + ".png", aCircles[f], $scope.marcador);
                $scope.regiao.headeron = $gameFactory.isHeaderOn($scope.regiao.nome);
                $rootScope.APP.regiaoLoaded = aCircles[f].nome;
                if (($scope.regiao.completed) && (!$scope.regiao.quizDone)) {
                  console.warn("touchup Regiao completed ", $scope.regiao);
                  $scope.data.buttonColor = YELLOW;
                  // $window.document.getElementById("floating-button").children[0].style.backgroundColor = YELLOW;
                } else if ($scope.regiao.quizDone) {
                  console.warn("touchup quiz completed ", $scope.regiao);
                  $scope.data.buttonColor = GREEN;
                  // $window.document.getElementById("floating-button").children[0].style.backgroundColor = GREEN;
                } else {
                  console.warn("touchup not open ", $scope.regiao);
                  $scope.data.buttonColor = RED;
                  // $window.document.getElementById("floating-button").children[0].style.backgroundColor = RED;
                }

                $scope.$apply();
                console.log("setting scope regiao: ", $scope.regiao);

                // context.beginPath();
                // context.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI, false);
                // context.lineWidth = 1;
                // context.strokeStyle = '#003300';
                // context.stroke();
                // context.closePath();

                var idMarcador = $window.document.getElementById('marcador');
                if (idMarcador)
                  idMarcador.classList.add('animated', 'bounce');

                $timeout(function () {
                  elem = $window.document.getElementById("marcador");
                  if (elem) {
                    elem.classList.remove("animated", "bounce");
                  }
                }, 1000);

                scrollToTop();

              }
            }
          }
        };

        drawImage = function () {
          // console.log("Draw image enter", context);
          //shadow
          //alert();
          // context.shadowBlur = 20;
          // context.shadowColor = "rgb(0,0,0)";

          //image
          context.imageSmoothingEnabled = false;
          context.mozImageSmoothingEnabled = false;
          context.msImageSmoothingEnabled = false;
          var image = new Image();
          image.onload = function () {
            //alert("load");
            console.log("load image done");
            context.drawImage(image, 0, 0, canvas.width, canvas.height);

            // createCircles();
            // $timeout(function () {
            //   drawCircles();
            // }, 200)
            // drawedMapa = true;
          };
          //canvas.addEventListener("touchend", touchUp, false);
          canvas2.addEventListener("click", touchUp, false);
          //image.src ="http://i.imgur.com/p3gjnKa.jpg";
          // image.className = "img-responsive";
          image.src = "img/mapaqtapedagogica2.png";
          //<img id="pic" src="http://i.telegraph.co.uk/multimedia/archive/03589/Wellcome_Image_Awa_3589699k.jpg">

          //$(image).load(function () {
          //image.height = canvas.height();
          //image.width = canvas.width();
          //context.drawImage(image);
          //context.drawImage(image, 0, 0, canvas.width, canvas.height);
          //});
        };

        if (canvas) {
          // drawImage();
        }

        createCircles = function () {
          console.log("create circles enter, scope.ri: ", $scope.RI);
          if ((!$regioes.drawedMapa())) {
            drawImage();
            // if (!value) {
            $regioes.drawedMapa('ON');
            //   drawedMapa = true;
          }
          // }
          $regioes.getRegioes().then(function (res) {
            var found = false;
            var elem = null;
            // $scope.aCircles = JSON.parse(res || [{}]);
            aCircles = JSON.parse(res || [{}]);
            $regioes.setCacheRegioes(aCircles);
            aCircles.some(function (reg, i) {
              // console.log("Some: reg.nome, reg, scope.ri ", reg.nome, reg, $scope.RI);
              if (reg.nome == $scope.RI) {
                // console.log("Some FOUND: reg.nome, reg, scope.ri ", reg.nome, reg, $scope.RI);
                var file = reg.nome;
                if (reg.locked)
                  file += "_red";
                else if (reg.completed)
                  file += "_green";
                else file += "_orange";
                // file += ".png";
                reg.marcador = file + ".png";
                $scope.marcador = file + ".png";
                // if (!$scope.regiaoLoaded) {
                // if (!$scope.regiao) {
                // $scope.regiao = {};
                // loadRegiao($scope.RI);
                // $scope.regiao = angular.copy(reg);
                // $timeout(function () {
                angular.copy(reg, $scope.regiao);
                //   angular.copy(reg.PIs, $scope.regiao.PIs);
                // });
                console.warn("Createcircles: regiao not loaded");
                $scope.regiaoLoaded = true;
                // }
                // $scope.regiao = clone(aCircles[i]);
                // $scope.regiaoLoaded = true;
                // console.warn("Createcircles: regiao not loaded");
                // }
                // $scope.regiao.completed = aCircles[i].completed;
                $scope.regiao.headeron = $gameFactory.isHeaderOn(reg.nome);

                // $timeout(function () {
                if ((reg.completed) && ($gameFactory.isShowOn(reg.nome)) && (!reg.quizDone)) {
                  $gameFactory.setShowOff(reg.nome);
                  $rootScope.$broadcast('SHOW_QUIZ', {regiao: $regioes.convertRegiaoShortToLong(reg.nome)});
                }

                if ((reg.completed) && (!reg.quizDone)) {
                  console.warn("circles Regiao completed ", reg);
                  $scope.data.buttonColor = YELLOW;
                  // $window.document.getElementById("floating-button").children[0].style.backgroundColor = YELLOW;
                } else if (reg.quizDone) {
                  console.warn("circles quiz completed ", $scope.regiao);
                  $scope.data.buttonColor = GREEN;
                  // $window.document.getElementById("floating-button").children[0].style.backgroundColor = GREEN;
                } else {
                  console.warn("circles not open ", $scope.regiao);
                  $scope.data.buttonColor = RED;
                  // $window.document.getElementById("floating-button").children[0].style.backgroundColor = RED;
                }
                // }, 200);

                // $scope.$apply();

                //
                // if (($scope.regiao.completed) && ($scope.regiao.quizDone)) {
                //   console.warn("circles Regiao e quiz completed GREEN", $scope.regiao);
                //   // $scope.data.buttonColor = "#33cd5f";
                //   $scope.data.buttonColor = GREEN;
                //   elem = $window.document.getElementById("floating-button").children[0];
                //   if (elem)
                //   $window.document.getElementById("floating-button").children[0].style.backgroundColor = GREEN;
                //   else
                //     console.error("id for marcador not found, createcircles");
                // } else if ($scope.regiao.completed) {
                //   console.warn("circles regiao completed YELLOW", $scope.regiao);
                //   $scope.data.buttonColor = YELLOW;
                //   elem = $window.document.getElementById("floating-button").children[0];
                //   if (elem)
                //     $window.document.getElementById("floating-button").children[0].style.backgroundColor = YELLOW;
                //   else
                //     console.error("id for marcador not found, createcircles");
                // } else {
                //   console.warn("circles not open RED", $scope.regiao);
                //   $scope.data.buttonColor = RED;
                //   $window.document.getElementById("floating-button").children[0].style.backgroundColor = RED;
                // }
                //
                // if ((reg.completed) && (!reg.quizDone)) {
                //   console.warn("Regiao completed i:", i, reg, $scope.regiao);
                //   // $scope.data.buttonColor = "#33cd5f";
                //   $scope.data.buttonColor = "#fec659";
                //   $scope.regiao.completed = true;
                //   $window.document.getElementById("floating-button").children[0].style.backgroundColor = "#fec659";
                //   // $scope.$apply();
                // } else if (reg.quizDone) {
                //   console.warn("Regiao quiz completed i:", i, reg, $scope.regiao);
                //   $scope.data.buttonColor = "#33cd5f";
                //   // $scope.data.buttonColor = "#fec659";
                //   // $scope.regiao.completed = true;
                //   $window.document.getElementById("floating-button").children[0].style.backgroundColor = "#33cd5f";
                //   // $scope.$apply();
                // }
                var idMarcador = $window.document.getElementById('marcador');
                idMarcador.src = 'img/mapa/marcadores/' + file + "_90.png";
                idMarcador.classList.add('animated', 'bounce');
                found = true;
                // console.log("Some FOUND: reg.nome, reg, scope.ri ", reg.nome, reg, $scope.RI, $scope.regiao, idMarcador);
                return true;
              }
            });
            // if ($scope.regiao.headeron) {
            //   console.log("Setting timeout for banner");
            // }
            // if (found)
            //   $scope.$apply();
            // aCircles = $scope.aCircles;
            // $regioes.setTempRegioes($scope.aCircles);
            console.log("createCircles: GOT regioes from cordova service to aCircles", aCircles);
            drawCircles();
            // $timeout(function () {
            //   $scope.regiao.headeron = $gameFactory.isHeaderOn($scope.regiao.nome);
            //   if (($scope.regiao.completed) && (!$scope.regiao.quizDone)) {
            //     console.warn("circles Regiao completed ", $scope.regiao.nome);
            //     $scope.data.buttonColor = YELLOW;
            //     // $window.document.getElementById("floating-button").children[0].style.backgroundColor = YELLOW;
            //   } else if ($scope.regiao.quizDone) {
            //     console.warn("circles quiz completed ", $scope.regiao);
            //     $scope.data.buttonColor = GREEN;
            //     // $window.document.getElementById("floating-button").children[0].style.backgroundColor = GREEN;
            //   } else {
            //     console.warn("circles not open ", $scope.regiao);
            //     $scope.data.buttonColor = RED;
            //     // $window.document.getElementById("floating-button").children[0].style.backgroundColor = RED;
            //   }
            // }, 300);
          });
        };

        $scope.unlock_regiao = function () {
          aCircles[3].locked = false;
          $regioes.setRegioes(aCircles);
          $timeout(createCircles, 1000);
        };

        drawCircle = function (oCircle) {
          // console.log("oCircle: ", oCircle);
          var centerX = oCircle.centerX;
          var centerY = oCircle.centerY;
          var radius = oCircle.radius || 20;
          // var radius = 35;
          var blue = "108, 202, 255";
          var red = "255, 104, 85";
          var color = blue;
          var file = oCircle.nome;
          // var file = "RI_A";


          // context.beginPath();
          // context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);

          if (oCircle.locked)
            file += "_red";
          else if (oCircle.completed)
            file += "_green";
          else file += "_orange";

          file += ".png";
          console.log("file: ", file, oCircle);

          // context.fillStyle = "rgba(" + color + ", 0.9)";
          // else
          // context.fillStyle = "rgba(" + color + ", 0.5)";

          // context.fill();
          // context.lineWidth = 1;
          // //
          // context.strokeStyle = '#003300';
          // context.stroke();

          // context.closePath();
          // context.clip();
          // var img = $window.document.getElementById(oCircle.nome);
          // console.log("image: ", img);
          // if (!img) {
          var img = new Image();
          img.width = 40;
          // img.style.opacity = "0.5";
          console.log("created img id: ", oCircle.nome);
          // if (color == "red") {
          //   img.classList.add("here");
          //   console.log("added class img ", oCircle.nome);
          // }
          // img.id = oCircle.nome;
          // } else
          //   console.log("found img id: ", oCircle.nome);

          // img.onclick = function (e) {
          //   console.log("cicked mapa: ", e);
          // };

          img.onload = function () {

            // context.save();
            // context.beginPath();
            // context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
            // context.closePath();
            // context.clip();
            // console.log("draw circles on load: ");
            context2.clearRect(centerX - 12, centerY - (43), 40, 43);
            context2.drawImage(img, centerX - 12, centerY - (43), 40, 43);
            // img.style.opacity = "0";
            // context.restore();
            if ($rootScope.currentRI) {
              if (regioes[$rootScope.currentRI] == oCircle.nome) {
                var pixels = context2.getImageData(centerX - 12, centerY - (43), 40, 43);
                console.log("filterimage: currentRI: pixels: ", regioes[$rootScope.currentRI], pixels);
                var d = pixels.data;
                // var threshold = 150;
                // for (var i=0; i<d.length; i+=4) {
                //   var r = d[i];
                //   var g = d[i+1];
                //   var b = d[i+2];
                //   var v = (0.2126*r + 0.7152*g + 0.0722*b >= threshold) ? 255 : 0;
                //   d[i] = d[i+1] = d[i+2] = v
                // }
                var dst = pixels.data;
                for (var i = 0; i < d.length; i += 4) {
                  dst[i] = 255 - d[i];
                  dst[i + 1] = 255 - d[i + 1];
                  dst[i + 2] = 255 - d[i + 2];
                  dst[i + 3] = d[i + 3];
                }
                var adjustment = 70;
                for (var i = 0; i < d.length; i += 4) {
                  d[i] += adjustment;
                  d[i + 1] += adjustment;
                  d[i + 2] += adjustment;
                }
                context2.putImageData(pixels, centerX - 12, centerY - (43));
              }
            }


            // context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
            // context.lineWidth = 1;
            // //
            // context.strokeStyle = '#003300';
            // context.stroke();
            // context.closePath();
            // context.clip();
            //
            // context.drawImage(img, 0, 0, 50, 50);

            // tmpCtx.beginPath();
            // tmpCtx.arc(0, 0, 25, 0, Math.PI * 2, true);
            // tmpCtx.clip();
            // tmpCtx.closePath();
            // tmpCtx.restore();
          };
//         img.addEventListener('load', function(e) {
//           context.drawImage(this, 0, 0, 50, 50);
//           console.log("loaded img canvas");
//           context.fill();
// context.stroke();
//         }, true);
//         img.classList = "animated bounce";
          img.src = "img/mapa/marcadores/" + file;
        };

        drawCircles = function () {
          // context2.clearRect(0, 0, canvas.width, canvas.height);
          for (var f = 0; f <= aCircles.length - 1; f++) {
            drawCircle(aCircles[f]);
          }
          // $ionicLoading.hide();
        };

        // console.log("Mapa antes dos circles", $stateParams);

        // if ($stateParams.PI.indexOf("PI") != -1)
        //   $scope.updateRegiaoVisitada($stateParams.RI, $stateParams.PI);

        // if ($stateParams.RI == "ALL"){
        //     createCircles();
        //     $timeout(function () {
        //       var idMarcador = $window.document.getElementById('marcador');
        //       if (idMarcador)
        //         idMarcador.classList.remove('animated', 'bounce');
        //     }, 2000);
        // }
      })
    }
  )
  .controller('DebugCtrl', function ($scope, $rootScope) {

    $scope.showDesafios_help = function () {
      $rootScope.showPopup({
        templateUrl: 'templates/tab-game_help.html',
        cssClass: 'myPopupLegenda',
        timeout: 600000
      });
    };
    // $scope.Login = {
    //   nome: $rootScope.APP.user.name,
    //   email: $rootScope.APP.user.email,
    //   picture: $rootScope.APP.user.picture,
    //   canSubmit: "disabled"
    // };
    //
    // $scope.submit = function () {
    //   console.log("Nome: %s Email: %s", $scope.Login.nome, $scope.Login.email);
    //   return false;
    // };
    //
    // $scope.changed = function () {
    //   console.log("changed: Nome: %s Email: %s", $scope.Login.nome, $scope.Login.email);
    //   if (($rootScope.APP.user.name) && ($rootScope.APP.user.email)) {
    //     $scope.Login.canSubmit = "";
    //   } else {
    //     $scope.Login.canSubmit = "disabled";
    //   }
    //   return false;
    // };

  })
  // .controller('GameCtrl', function ($rootScope, $scope, $state, $window, $timeout, $ionicTabsDelegate, $regioes) {
  .controller('GameCtrl', function ($rootScope, $scope, $state, $window, $timeout, $gameFactory, $regioes) {
    console.log("Game controller ready");

    $scope.score = $gameFactory.getScore();
    $scope.header = $gameFactory.gameHeaderValue();
    $scope.nivelAtual = $gameFactory.getNivelAtualNome();
    var gameInfo = $gameFactory.getGameInfo();

    $scope.game = {
      "RI_A": {
        "REGIAO": false,
        "QUIZ": false,
        "FOTO": false,
        "PIS": false,
        "QR": false
      },
      "RI_B": {
        "REGIAO": false,
        "QUIZ": false,
        "PIS": false,
        "FOTO": false,
        "QR": false
      },
      "RI_C": {
        "REGIAO": false,
        "FOTO": false,
        "PIS": false,
        "QUIZ": false,
        "QR": false
      },
      "RI_D": {
        "REGIAO": false,
        "QUIZ": false,
        "FOTO": false,
        "PIS": false,
        "QR": false
      },
      "RI_E": {
        "REGIAO": false,
        "QUIZ": false,
        "FOTO": false,
        "PIS": false,
        "QR": false
      },
      "RI_F": {
        "REGIAO": false,
        "QUIZ": false,
        "PIS": false,
        "FOTO": false,
        "QR": false
      },
      "RI_G": {
        "REGIAO": false,
        "QUIZ": false,
        "FOTO": false,
        "PIS": false,
        "QR": false
      },
      "RI_H": {
        "REGIAO": false,
        "QUIZ": false,
        "FOTO": false,
        "PIS": false,
        "QR": false
      }
    };

    $regioes.getRegioes().then(function (res) {

      var regioes = JSON.parse(res || [{}]);
      regioes.forEach(function (reg) {
        $scope.game[reg.nome].REGIAO = reg.visited;
        $scope.game[reg.nome].QUIZ = reg.quizDone;
        $scope.game[reg.nome].FOTO = reg.fotoDone;
        $scope.game[reg.nome].QR = reg.qrDone;
        $scope.game[reg.nome].PIS = reg.completed;
      });

      $timeout(function () {
        for (var levelName in gameInfo) {
          if (!gameInfo.hasOwnProperty(levelName)) continue;

          var level = gameInfo[levelName];
          console.log("gameInfo3: ", levelName, level);

          if (!level.locked) {
            var elem = null;
            if (level.tipo != "nivel")
              elem = $window.document.getElementById(levelName);
            else
              elem = $window.document.getElementById(levelName + "1");
            if (elem) {
              elem.classList.add("clearBadge");
              console.warn("GameInfo unlocked: " + levelName);
            }
            else console.warn("GameInfo: elem not found");
          }
        }
      }, 600);

    });

    // $scope.$on('LEVELUP', function (e, args) {
    //
    //   $scope.score = $gameFactory.getScore();
    //   $scope.header = $gameFactory.gameHeaderValue();
    //   $scope.nivelAtual = $gameFactory.getNivelAtualNome();
    //   // var gameInfo = $gameFactory.getGameInfo();
    //   var gameInfo = args.gameInfo;
    //
    //   $regioes.getRegioes().then(function (res) {
    //
    //     var regioes = JSON.parse(res || [{}]);
    //     regioes.forEach(function (reg) {
    //       $scope.game[reg.nome].REGIAO = reg.visited;
    //       $scope.game[reg.nome].QUIZ = reg.quizDone;
    //       $scope.game[reg.nome].FOTO = reg.fotoDone;
    //       $scope.game[reg.nome].QR = reg.qrDone;
    //       $scope.game[reg.nome].PIS = reg.completed;
    //     });
    //
    //   });
    //
    //   // $timeout(function () {
    //     for (var levelName in gameInfo) {
    //       if (!gameInfo.hasOwnProperty(levelName)) continue;
    //
    //       var level = gameInfo[levelName];
    //       console.log("gameInfo3: ", levelName, level);
    //
    //       if (!level.locked) {
    //         var elem = null;
    //         if (level.tipo != "nivel")
    //           elem = $window.document.getElementById(levelName);
    //         else
    //           elem = $window.document.getElementById(levelName + "1");
    //         if (elem) {
    //           elem.classList.add("clearBadge");
    //           console.warn("GameInfo unlocked: " + levelName);
    //         }
    //         else console.warn("GameInfo: elem not found");
    //       }
    //     }
    //   // }, 100);
    //
    //   // $timeout(function () {
    //     for (var levelName in gameInfo) {
    //       if (!gameInfo.hasOwnProperty(levelName)) continue;
    //
    //       var level = gameInfo[levelName];
    //       console.log("gameInfo3: ", levelName, level);
    //
    //       if (!level.locked) {
    //         var elem = null;
    //         if (level.tipo != "nivel")
    //           elem = $window.document.getElementById(levelName);
    //         else
    //           elem = $window.document.getElementById(levelName + "1");
    //         if (elem) {
    //           elem.classList.add("clearBadge");
    //           console.warn("GameInfo unlocked: " + levelName);
    //         }
    //         else console.warn("GameInfo: elem not found");
    //       }
    //     }
    //   // }, 100);
    //
    // });


    $scope.closeGameHeader = function () {
      $scope.header = false;
      $gameFactory.gameHeaderValue('OFF');
      // $scope.headeron = false;
    };

    $scope.goMapa = function (RI) {
      $state.go("tab.mapa", {
        RI: "ALL",
        PI: ""
      });
      $timeout(function () {
        $rootScope.$broadcast('GO_REGIAO', {regiao: "Regiao de interesse " + RI});
      }, 300);
    };
    $scope.goDesafios = function (RI) {
      // console.log("tab game, go journal");
      $state.go("tab.camera");
    };

    $scope.goMapaQRGame = function (RI) {
      // $ionicHistory.goBack();
      // $state.go("tab.mapa", {
      //   RI: "ALL",
      //   PI: RI
      // });
      // if ($state.current.name != "tab.mapa") {
      //   // $state.go("tab.mapa", {});
      // $rootScope.APP.start_qr = true;
      //   $state.go("tab.mapa", {
      //     RI: "ALL",
      //     PI: ""
      //   });
      // $rootScope.APP.start_quiz = true;
      // $rootScope.APP.load = true;
      $state.go("tab.mapa", {
        RI: "ALL",
        PI: ""
      });
      // $rootScope.$broadcast('GO_REGIAO', {regiao: "Regiao de interesse E", quiz: true})
      // $rootScope.$broadcast('GO_REGIAO', {regiao: "Regiao de interesse " + RI});
      // } else {
      $timeout(function () {
        $rootScope.$broadcast('GO_REGIAO', {regiao: "Regiao de interesse " + RI, qr: true});
      }, 300);

      // }
    };

    $scope.goMapaQuizGame = function (RI) {
      // $ionicHistory.goBack();
      // $state.go("tab.mapa", {
      //   RI: "ALL",
      //   PI: RI
      // });
      // if ($state.current.name != "tab.mapa") {
      //   // $state.go("tab.mapa", {});
      // $rootScope.APP.load = true;
      $state.go("tab.mapa", {
        RI: "ALL",
        PI: ""
      });
      // $rootScope.$broadcast('GO_REGIAO', {regiao: "Regiao de interesse " + RI});
      // } else {
      $timeout(function () {
        $rootScope.$broadcast('GO_REGIAO', {regiao: "Regiao de interesse " + RI, quiz: true})
      }, 300);
      // }
    };

    $timeout(function () {
      var level = $gameFactory.getNivelAtual();

      switch (level) {
        case "":
          level = "zero";
          break;
        case "nivel1":
          level = "twentyfive";
          break;
        case "nivel2":
          level = "fifty";
          break;
        case "nivel3":
          level = "seventyfive";
          break;
        case "nivel4":
          level = "onehundred";
          break;
        default:
          level = "zero";
      }
      console.log("gamelevel: level");
      $window.document.getElementById(level).checked = true;
    }, 600);

    $scope.showDesafios_help = function () {
      $rootScope.showPopup({
        templateUrl: 'templates/tab-game_help.html',
        cssClass: 'myPopupLegenda',
        timeout: 600000
      });
    };

  })
  .controller('RadialCtrl', function ($scope, $state, $window, $timeout, $regioes) {
    console.log("RadialCtrl controller ready");

    var progressElem = null;
    var progressPie = null;
    var deg = 0;
    var unique = Math.floor(Math.random() * 1000);
    var regioes = null;
    $scope.unique = unique;

    $scope.initRadial = function (item, percent, caption, tipo) {
      console.log("initRadial ready: item: %s perc: %s", item, percent);
      // $scope.unique = unique;
      $scope.item = item;
      // $scope.caption = caption;
      if (tipo == "regioes") {
        regioes = $regioes.getAllRegioesList();
        $regioes.getRegioes().then(function (res) {
          var regioes = JSON.parse(res || [{}]);
          console.log("got regioes: ", regioes);
          var r_total = 0;
          var r_atual = 0;
          regioes.forEach(function (reg) {
            if (reg.visited == true)
              r_atual++;
            r_total++;
          });
          $scope.caption = r_atual + "/" + r_total;
          percent = (r_atual / r_total) * 100;
          console.log("r_total: %s r_atual: %s perc: %s", r_total, r_atual, percent);
          $timeout(function () {
            progressElem = $window.document.getElementsByName("progress-fill-" + unique)[0];
            progressPie = $window.document.getElementsByName("progress-pie-" + unique)[0];
            deg = 360 * percent / 100;
            if (percent > 50) {
              if (progressPie) {
                progressPie.classList.add('gt-50');
              }
            }
            if (progressElem) {
              progressElem.style = "transform: rotate(" + deg + "deg);";
            }
          });
        });
      } else {
        regioes = $regioes.getAllRegioesList();
        $regioes.getRegioes().then(function (res) {
          var regioes = JSON.parse(res || [{}]);
          console.log("got regioes: ", regioes);
          var r_total = 0;
          var r_atual = 0;
          regioes.forEach(function (reg) {
            if (reg.PIs)
              reg.PIs.forEach(function (pi) {
                if (pi.visited)
                  r_atual++;
                r_total++;
              })
          });
          $scope.caption = r_atual + "/" + r_total;
          percent = (r_atual / r_total) * 100;
          console.log("r_total: %s r_atual: %s perc: %s", r_total, r_atual, percent);
          $timeout(function () {
            progressElem = $window.document.getElementsByName("progress-fill-" + unique)[0];
            progressPie = $window.document.getElementsByName("progress-pie-" + unique)[0];
            deg = 360 * percent / 100;
            if (percent > 50) {
              progressPie.classList.add('gt-50');
            }
            progressElem.style = "transform: rotate(" + deg + "deg);";
          });
        });
      }

    };
  })
  .controller('LoginCtrl', function ($scope, $rootScope, users, UserService, $state, $window, $ionicLoading, blob, $q) {

    // if ($rootScope.APP.logged)
    $scope.Login = {
      nome: $rootScope.APP.user.name,
      email: $rootScope.APP.user.email,
      picture: $rootScope.APP.user.picture,
      canSubmit: "disabled"
    };

    $scope.takingPicture = 0;

    $scope.takeAvatarPicture = function () {
      console.log("take Avatarpicture ready");

      $rootScope.deviceBUSY = 1;
      if ($scope.takingPicture)
        return;
      $scope.takingPicture = 1;

      if (device.platform === 'iOS') {
        $ionicLoading.show();
      }

      navigator.camera.getPicture(onSuccess, onFail, {
        quality: 75,
        destinationType: Camera.DestinationType.FILE_URI,
        // destinationType: Camera.DestinationType.NATIVE_URI,
        // destinationType: 0,
        encodingType: 0,
        targetWidth: 640,
        targetHeight: 480,
        correctOrientation: true,
        saveToPhotoAlbum: false,
        Direction: 1
        // sourceType: 0

      });

      function onSuccess(imageURI) {

        // if (device.platform === 'iOS') {
        //   $ionicLoading.hide();
        // }

        console.log(imageURI);
        if (device.platform === 'Android')
          $ionicLoading.show();

        $scope.takingPicture = 0;
        // $scope.lastPhoto = imageURI;
        // $scope.$apply();
        window.resolveLocalFileSystemURL(imageURI, processAvatarPicture, resOnError);
      }


      function resOnError(message) {
        console.error('Failed because: ' + message);
        $scope.takingPicture = 0;
        $ionicLoading.hide();
      }

      function onFail(message) {
        console.error('Failed because: ' + message);
        $scope.takingPicture = 0;
        $ionicLoading.hide();
      }
    };

    var processAvatarPicture = function (imageURI) {

      console.log("processAvatarPicture: entry", imageURI, imageURI.toURL());

      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSys) {

          myFolderApp = "/";
          fileSys.root.getDirectory(myFolderApp,
            {create: true, exclusive: false},
            function (directory) {
              // $scope.saveDir = directory;
              console.warn("DIR: ", directory);
              thumbresizeImage(imageURI.toURL()).then(function (res) {
                console.log("RESize RES: ", res);
                saveThumbToFile(directory, "data:image/jpg;base64," + res.imageData);

                $rootScope.deviceBUSY = 0;
              });
            },
            resGetDirThumbOnError);

        },
        resGetfileSystemOnError);
    };

    var thumbresizeImage = function (img_path) {
      var q = $q.defer();
      console.log("thumbresizeImage: image path", img_path);
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

    function resGetDirThumbOnError(error) {
      console.log("GET resGetDirThumbOnError images ERROR", error, error.code);
      $rootScope.deviceBUSY = 0;
      $ionicLoading.hide();
    }

    function resGetfileSystemOnError(error) {
      console.log("resGetfileSystemOnError ERROR: ", error, error.code);
      $rootScope.deviceBUSY = 0;
      $ionicLoading.hide();
    }

    var saveThumbToFile = function (dir, thumb) {
      var contentType = "image/png";
      // var folderpath = "file:///storage/emulated/0/";
      // var folderpath = dir;
      var folderpath = dir.nativeURL;
      // var filename = "thumb_" + $scope.newFile + ".png";
      var d = new Date();
      var n = d.getTime();
      filename = n + ".jpg";
      // var filename = "profile_photo.jpg";

      var block = thumb.split(";");
      var dataType = block[0].split(":")[1];// In this case "image/png"
      var realData = block[1].split(",")[1];// In this case "iVBORw0KGg...."

      console.log("saveThumbToFile", folderpath, filename, contentType);
      savebase64AsImageFile(folderpath, filename, realData, dataType);

    };

    function done(evt) {
      console.warn("Write completed.", $scope.thumb_file);
      var img = document.getElementById("profile_photo");
      img.src = $scope.thumb_file;
      $rootScope.APP.user.picture = $scope.thumb_file;
      $scope.$apply();
      var tempUser = UserService.getUser();
      tempUser.then(function (res) {
        var userInfo = JSON.parse(res || '{}');
        userInfo.picture = $scope.thumb_file;
        $rootScope.APP.logged = true;
        UserService.setUser(userInfo);
      });
      $ionicLoading.hide();
    }

    function error(evt) {
      $ionicLoading.hide();
      console.error("Write failed:" + evt);
    }

    var savebase64AsImageFile = function (folderpath, filename, content, contentType) {
      // Convert the base64 string in a Blob
      var DataBlob = blob.b64toBlob(content, contentType);

      console.log("Starting to write the file :4", folderpath);

      window.resolveLocalFileSystemURL(folderpath, function (dir) {
        console.log("Access to the directory granted succesfully");
        dir.getFile(filename, {create: true}, function (file) {
          console.log("File created succesfully.", file.toURL());
          $scope.thumb_file = file.toURL();
          file.createWriter(function (fileWriter) {
            console.log("Writing content to file");
            // fileWriter.write(DataBlob);
            fileWriter.onwrite = done;
            fileWriter.onerror = error;
            // fileWriter.write(content);
            fileWriter.write(DataBlob);
          }, function () {
            console.error('Unable to save file in path ' + folderpath);
          });
        });
      });
    };

    $scope.submit = function () {
      console.log("Nome: %s Email: %s", $scope.Login.nome, $scope.Login.email);
      $rootScope.APP.user.name = $scope.Login.nome;
      $rootScope.APP.user.email = $scope.Login.email;
      $rootScope.APP.user.picture = $scope.Login.picture;

      if ($rootScope.APP.logged)
        users.updateDados({
          nome: $scope.Login.nome,
          email: $scope.Login.email,
          picture: $scope.Login.picture,
          dataAtualizacao: Date().toLocaleLowerCase(),
          dataAtualizacao_ts: Date.now(),
        });
      else {
        users.updateDados({
          nome: $scope.Login.nome,
          email: $scope.Login.email,
          picture: $scope.Login.picture,
          platform: ionic.Platform.platform(),
          version: ionic.Platform.version(),
          timestamp: Date.now(),
          dataInicio: Date().toLocaleLowerCase(),
          modelo: ionic.Platform.device().model
        });
      }

      var tempUser = UserService.getUser();
      tempUser.then(function (res) {
        var userInfo = JSON.parse(res || '{}');
        // $scope.authResponse = userInfo.authResponse;
        console.log("GOT USER from user service", userInfo);

        userInfo.name = $scope.Login.nome;
        userInfo.email = $scope.Login.email;
        userInfo.picture = $scope.Login.picture;

        $rootScope.APP.user.name = userInfo.name;
        $rootScope.APP.user.email = userInfo.email;
        $rootScope.APP.user.picture = userInfo.picture;
        $rootScope.$broadcast('LOGGED_IN');
        UserService.setUser(userInfo);
      });

      $rootScope.showAlert("Sessão iniciada, podes alterar os dados mais tarde nas definições");
      $state.go("tab.dash");
      // return false;
    };

    $scope.changed = function (UPDATE) {
      // console.log("changed: Nome: %s Email: %s", $scope.Login.nome, $scope.Login.email);
      if (($scope.Login.nome) && ($scope.Login.email)) {
        $scope.Login.canSubmit = "";
      } else {
        $scope.Login.canSubmit = "disabled";
      }
      if (UPDATE)
        if (($scope.Login.name) || ($scope.Login.email)) {
          $scope.Login.canSubmit = "";
        } else {
          $scope.Login.canSubmit = "disabled";
        }

      return false;
    };
  })
  .controller('IntroCtrl', function ($scope, $state, $ionicSlideBoxDelegate, $rootScope, $gameFactory, $cordovaSQLite) {

    $scope.goLogin = function () {
      $state.go('tab.account');
      // $timeout(function () {
      //   $rootScope.showPopup({templateUrl: 'templates/popups/fim_onboarding.html'});
      $gameFactory.addPoints("onboarding");
      // $cordovaSQLite.getVarFromDB("info", "APPtutorial").then(function (res) {
      //   if (res == "Sim")
      //     $gameFactory.addPoints("presencial");
      // });

      // },300);
    };

    $scope.goHome = function () {
      $state.go('tab.dash');
      // $timeout(function () {
      //   $rootScope.showPopup({templateUrl: 'templates/popups/fim_onboarding.html'});
      $gameFactory.addPoints("onboarding");
      // $cordovaSQLite.getVarFromDB("info", "APPtutorial").then(function (res) {
      //   if (res == "Sim")
      //     $gameFactory.addPoints("presencial");
      // });
      // },300);
    };
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
    var score = 0;
    $scope.startted = false;
    $scope.cat1 = true;
    $scope.view = {
      buttonClass: "",
      buttonStart: "Iniciar",
    };
    $scope.cards = [];

    $scope.disableSwipe = function () {
      $ionicSlideBoxDelegate.enableSlide(false);
    };
    $scope.enableSwipe = function () {
      $ionicSlideBoxDelegate.enableSlide(true);
    };

    // var cardTypes = [
    //   { image: 'img/ben.png' },
    //   { image: 'img/mike.png' },
    //   { image: 'img/perry.png' },
    //   { image: 'img/max.png'}
    // ];
    var cardTypes = [];

    $scope.init = function (PI) {
      console.log("cards init: ", PI);
      // perguntas.init(PI);
    };

    $scope.startCards = function (cat2) {
      console.log("cat2: ", cat2);
      if (cat2 == 2)
        $scope.cat1 = false;
      else $scope.cat1 = true;

      score = 0;
      $scope.view = {
        buttonClass: "",
        buttonStart: score
      };
      $scope.startted = true;

      // $scope.view.buttonClass = "button";
      // $scope.view.score = 0;
      // $scope.view.buttonStart = "Score " + $scope.view.score;
      // if ($scope.cat1)
      //   cardTypes = perguntas.getTdcards();
      // else
      //   cardTypes = perguntas.getPerguntas();

      console.log("carTypes: cat1: %s", $scope.cat1, cardTypes);

      $scope.disableSwipe();
      stopped = false;
      console.log("starting cards: ", cardTypes);
      //$scope.cards = Array.prototype.slice.call(cardTypes, 0);
      // cardTypes.push(angular.extend({},cardTypes[Math.floor(Math.random() * (cardTypes.length - 1))]));
      // $scope.cards.unshift(angular.extend({}, newCard));
      // $scope.cards = Array.prototype.slice.call(cardTypes, Math.floor(Math.random() * (cardTypes.length - 1)), 1);
      console.log("#### acrds in scope: ", $scope.cards);
      $scope.addCard();
      // if ($scope.cat1) {
      setTimeout(function () {
        $scope.addCard();
      }, 300);
      // }
    };
    $scope.stopCards = function () {
      $scope.view = {
        // score: 0,
        buttonClass: "balanced",
        buttonStart: "Iniciar"
      };
      $scope.startted = false;
      // $scope.view.buttonStart = "Iniciar";
      // $scope.view.buttonClass = "button button-balanced";

      $scope.enableSwipe();
      $scope.cards = [];
      cardTypes = [];
      stopped = true;
    };
    $scope.cardDestroyed = function (index) {
      console.log("card destroyed");
      $scope.cards.splice(index, 1);
      $scope.addCard();
    };
    $scope.addCard = function () {
      var newCard = cardTypes[Math.floor(Math.random() * (cardTypes.length - 1))];
      newCard.id = Math.random();
      $scope.cards.unshift(angular.extend({}, newCard));
    };

    // $scope.cardSwipedLeft = function (index) {
    //   //console.log('LEFT SWIPE', index);
    //   if ($scope.cards[index].resposta == false) {
    //     console.log('You are right!', index);
    //     $scope.view.buttonClass = "button button-balanced";
    //   } else {
    //     console.log('You are Wrong!', index);
    //     $scope.view.buttonClass = "button button-assertive";
    //   }
    //   //$scope.addCard();
    // };
    // $scope.cardSwipedRight = function (index) {
    //   //console.log('RIGHT SWIPE', index);
    //   if ($scope.cards[index].resposta == true) {
    //     console.log('You are right!', index);
    //     $scope.view.buttonClass = "button button-balanced";
    //   }
    //   else {
    //     console.log('You are Wrong!', index);
    //     $scope.view.buttonClass = "button button-assertive";
    //   }
    //   //$scope.addCard();
    // };

    $scope.transitionRight = function (index) {
      //console.log('card removed to the right', index);
      if ($scope.cards[index].resposta == true) {
        console.log('You are right!', index);
        score += 5;
        if ($scope.view.buttonClass != "animated tada balanced")
          $scope.view = {
            buttonClass: "animated tada balanced",
            buttonStart: score
          };
        else {
          console.log("previous equal ######");

          $scope.view = {
            buttonClass: "balanced myanimated mytada",
            buttonStart: score
          };
        }

        // $scope.view.buttonClass = "button button-balanced";
        // $scope.view.score += 5;
        // $scope.view.buttonStart = "Score " + $scope.view.score;
      }
      else {
        console.log('You are Wrong!', index);
        score -= 15;
        $scope.view = {
          buttonClass: "assertive",
          buttonStart: score
        };
        // $scope.view.buttonClass = "button button-assertive";
        // $scope.view.score -= 15;
        // $scope.view.buttonStart = "Score " + $scope.view.score;
      }
      //$scope.addCard();
    };
    $scope.transitionLeft = function (index) {
      //console.log('card removed to the left', index);
      if ($scope.cards[index].resposta == false) {
        console.log('You are right!', index);
        score += 5;
        if ($scope.view.buttonClass != "animated tada balanced")
          $scope.view = {
            buttonClass: "animated tada balanced",
            buttonStart: score
          };
        else {
          console.log("previous equal ######");
          $scope.view = {
            buttonClass: "balanced myanimated mytada",
            buttonStart: score
          };
        }

        // $scope.view.buttonClass = "button button-balanced";
        // $scope.view.score += 5;
        // $scope.view.buttonStart = "Score " + $scope.view.score;
      } else {
        console.log('You are Wrong!', index);
        score -= 15;
        $scope.view = {
          buttonClass: "assertive",
          buttonStart: score
        };
        // $scope.view.buttonClass = "button button-assertive";
        // $scope.view.score -= 15;
        // $scope.view.buttonStart = "Score " + $scope.view.score;
      }
      //$scope.addCard();
    };

  })
  .controller('CardCtrl', function ($scope) {
  })
  .controller('GameHelpCtrl', function ($scope) {
  })
  .controller('AccountCtrl', function ($rootScope, $scope, UserService) {
    $scope.show = false;
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

  })
  .controller('SNPCtrl', function ($scope, $state, $timeout, $ionicHistory, $rootScope, likes, $stateParams) {

    $scope.Items = likes.getItems();
    // $scope.url = null;

    console.warn("items: ", $scope.Items);

    $scope.$on('$stateChangeSuccess', function (data) {

      if (($rootScope.url == null) && ($state.current.url == "/snp/:AT/:ATD")) {
        console.log("entering snp");
        $rootScope.url = $state.current.url;
      }

      if (($state.current.url.indexOf("snp") == -1)) {
        $rootScope.url = null;
        // console.log("leaving snp");
        if ($rootScope.dataChanged) {
          console.log("leaving snp, saving data");
          // likes.saveLikes($scope.items);
          likes.needsUpdate(true);
          likes.uploadLikes();
          $rootScope.dataChanged = false;
        }
      }
    });

    $scope.$on('REFRESH_ITEMS', function () {
      console.log("GOT broadcast REFRESH_ITEMS");
      $scope.Items = likes.getItems();
    });

    $scope.goAtividades = function () {
      console.log("Go Atividades");
      // $ionicHistory.goBack();
      $state.go("tab.snp", {
        AT: "ALL"
      });
    };

    $scope.goBack = function () {
      $ionicHistory.goBack();
    };

    $scope.goAtividadesDetalhe = function (item) {
      console.log("Go Atividades detalhe ");
      // $ionicHistory.goBack();
      $state.go("tab.snp", {
        AT: "atividades",
        ATD: item.template
      });
    };

    // $scope.$on('$stateChangeSuccess', function (data) {
    //
    //   if (($rootScope.url == null) && ($state.current.url == "/snp/:AT/:ATD")) {
    //     console.log("entering snp");
    //     $rootScope.url = $state.current.url;
    //   }
    //
    //   if (($state.current.url.indexOf("snp") == -1)) {
    //     $rootScope.url = null;
    //     console.log("leaving snp");
    //     if ($rootScope.dataChanged) {
    //       // likes.saveLikes($scope.items);
    //       likes.needsUpdate(true);
    //       likes.uploadLikes();
    //       $rootScope.dataChanged = false;
    //     }
    //   }
    // });

    $scope.clickedLike = function (item) {

      item.like = !item.like;
      if (item.like)
        item.likes += 1;
      else
        item.likes -= 1;

      item.changed = true;
      $rootScope.dataChanged = true;
    };
  })
  .directive('expandingTextarea', function () {
    return {
      restrict: 'A',
      controller: function ($scope, $element, $attrs, $timeout) {
        $element.css('min-height', '0');
        $element.css('resize', 'none');
        $element.css('overflow-y', 'hidden');
        setHeight(0);
        $timeout(setHeightToScrollHeight);

        function setHeight(height) {
          $element.css('height', height + 'px');
          $element.css('max-height', height + 'px');
        }

        function setHeightToScrollHeight() {
          setHeight(0);
          var scrollHeight = angular.element($element)[0]
            .scrollHeight;
          if (scrollHeight !== undefined) {
            setHeight(scrollHeight);
          }
        }

        $scope.$watch(function () {
          return angular.element($element)[0].value;
        }, setHeightToScrollHeight);
      }
    };
  })
  .directive('quiz', function ($timeout, $state, $regioes, $gameFactory, $ionicHistory, $rootScope) {
    return {
      restrict: 'AE',
      scope: {},
      templateUrl: 'templates/template-Quiz.html',
      link: function (scope, elem, attrs) {
        console.log("ELEM QUIZ: ", attrs);
        var elem = null;
        var t1 = 5000;
        var t2 = 7000;
        var count = 0;
        var regioes = null;
        var RI = attrs.ri;

        scope.closeQuizHeader = function () {
          scope.header = false;
          $gameFactory.quizHeaderValue('OFF');
          // $scope.headeron = false;
        };

        scope.goBack = function () {
          $ionicHistory.goBack();
        };

        scope.goMapaQuiz = function () {
          $state.go("tab.mapa", {
            RI: "ALL",
            PI: ""
          });
        };

        scope.goMapa = function (res) {
          $timeout(function () {
            $rootScope.$broadcast("QUIZ_POPUP", {desafio: res});
          }, 600);
          $ionicHistory.goBack();
          // $state.go("tab.mapa", {
          //   RI: "ALL",
          //   PI: RI
          // });
        };

        scope.start = function () {
          if (count++ > 0)
            scope.banner = "Se tiveres dificuldades volta a visitar a região. Acerta o máximo que conseguires e vais ser recompensado.";
          else
            scope.banner = "Agora é que vamos ver o que aprendeste nesta região, acerta o máximo que conseguires e vais ser recompensado.";

          scope.id = 0;

          scope.header = $gameFactory.quizHeaderValue();

          // if (scope.header)
          //   $timeout(function () {
          //     scope.header = false;
          //     elem = document.getElementById("headerQuiz");
          //     if (elem) {
          //       elem.classList.add("animated", "fadeOut");
          //     }
          //   }, t1);
          //
          // $timeout(function () {
          //   scope.header = false;
          //   elem = document.getElementById("headerQuiz");
          //   if (elem) {
          //     elem.classList.remove("animated", "fadeOut");
          //   }
          // }, t2);

          scope.quizOver = false;
          scope.inProgress = true;
          scope.getQuestion();
          scope.view = {
            buttonClass: ""
          }
        };

        scope.reset = function () {
          scope.inProgress = false;
          scope.score = 0;
          scope.selValue = -1;
        };

        scope.disableRadio = function (value) {
          // console.log("Disable radio");
          var x = document.getElementsByClassName("option");
          var i;
          for (i = 0; i < x.length; i++) {
            x[i].disabled = value;
            // console.log("Disable radio: ", x[i]);

          }
        };

        scope.getQuestion = function () {
          // var q = quizFactory.getQuestion(scope.id);
          var q = questions[scope.id];
          if (q) {
            scope.question = q.question;
            scope.options = q.options;
            scope.answer = q.answer;
            scope.answerMode = true;
          } else {
            scope.header = false;
            scope.quizOver = true;
            scope.banner = "Acabaste o questionário com a pontuação de " + scope.score;
            if (scope.score >= 3) {
              scope.banner += ". Parabéns, atingiste a pontuação máxima e concluiste este desafio!";
              scope.quizCompleto();
            } else {
              scope.goMapa('nok');
              // $timeout(function () {
              //   $rootScope.$broadcast("GO_REGIAO", { regiao: RI });
              // }, 500);
              // $ionicHistory.goBack();
            }

            scope.banner += ". A pontuação máxima para este desafio é de 3 pontos.";
            // t1 = 2000;
            // t2 = 4000;
            // scope.view.buttonClass = "hidden";

          }
        };

        scope.quizCompleto = function () {

          $regioes.getRegioes().then(function (res) {
            var found = false;
            regioes = JSON.parse(res || [{}]);
            console.log("quizCompleto: GOT regioes from cordova service: ", regioes);
            for (var f = 0; f < regioes.length; f++) {
              if (regioes[f].nome == RI) {
                if (!regioes[f].quizDone) {
                  regioes[f].quizDone = true;
                  $gameFactory.addPoints("desafios");
                }
                found = true;
              }
            }
            if (found) {
              console.log("quizCompleto: UPDATE: ", regioes);
              $regioes.setRegioesPromise(regioes).then(function () {
                scope.goMapa('ok');
                // $ionicHistory.goBack();
              });
              // $timeout(function () {
              //   scope.goMapa();
              // }, 200);
            } else
              console.warn("QuizCompleto RI not found", quizRI);
          });
        };

        scope.checkAnswer = function (index) {
          // if(!$('input[name=answer]:checked').length) return;
          //
          // var ans = $('input[name=answer]:checked').val();
          var ans = scope.selValue;
          console.warn("index: ", ans, scope.answer, scope.options[scope.answer]);

          if (ans == scope.answer) {
            if (scope.score < 3)
              scope.score++;
            scope.iconClass = "ion-checkmark-circled balanced";
            scope.view.buttonClass = "animated tada balanced";
            $timeout(function () {
              scope.view.buttonClass = "";
            }, 2000);
            scope.correctAns = true;
            scope.mensagem = "Essa é a resposta correta!";
            // scope.answerMode = false;
          } else {
            scope.iconClass = "ion-close-circled assertive";
            scope.view.buttonClass = "animated tada assertive";
            $timeout(function () {
              scope.view.buttonClass = "";
            }, 2000);
            scope.correctAns = false;
            scope.mensagem = "Essa resposta está incorreta";
            // scope.answerMode = true;
          }

          scope.answerMode = false;
          scope.disableRadio(true);
        };

        scope.selectValue = function (index) {
          scope.selValue = index;
          if (scope.answerMode)
            scope.checkAnswer();
        };

        scope.nextQuestion = function () {
          scope.id++;
          scope.correctAns = false;
          scope.getQuestion();
          scope.disableRadio(false);
        };

        $regioes.getRegioes().then(function (res) {
          regioes = JSON.parse(res || [{}]);
          // $regioes.setTempRegioes($scope.aCircles);
          // console.log("createCircles: GOT regioes from cordova service to aCircles", $scope.aCircles);
          // drawImage();
          for (var f = 0; f < regioes.length; f++) {
            if (regioes[f].nome == RI)
              if (regioes[f].Quiz)
                questions = regioes[f].Quiz;
          }
          // quizFactory.update
          console.log("Quiz factory inited", questions);
          scope.reset();
          scope.start();
        });

      }
    }
  })
  .controller('MapaPICtrl', function ($scope, $rootScope, $stateParams, $regioes, $ionicHistory) {
    console.log("mapaPICtrl controller ready");

    // $scope.header = $gameFactory.gameHeaderValue();

    // $scope.closeGameHeader = function () {
    //   $scope.header = false;
    //   $gameFactory.gameHeaderValue('OFF');
    // };
    $regioes.updateRegiaoVisitada($stateParams.RI, $stateParams.PI);

    $scope.goBack = function () {
      $ionicHistory.goBack();
      // $state.go("tab.mapa", {
      //   RI: "ALL",
      //   PI: ""
      // });
    };

  })
  .controller('MapaPIdesafiosCtrl', function ($ionicHistory, $scope) {
    console.log("MapaPIdesafiosCtrl controller ready");

    // $scope.header = $gameFactory.gameHeaderValue();
    $scope.goBack = function () {
      $ionicHistory.goBack();
      // $state.go("tab.mapa", {
      //   RI: "ALL",
      //   PI: ""
      // });
    };
    // $scope.closeGameHeader = function () {
    //   $scope.header = false;
    //   $gameFactory.gameHeaderValue('OFF');
    // };
    // $regioes.updateRegiaoVisitada($stateParams.RI, $stateParams.PI);


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
      .state('tab.snp', {
        url: '/snp/:AT/:ATD',
        views: {
          'tab-snp': {
            // templateUrl: 'templates/tab-snp.html',
            templateUrl: function ($stateParams) {
              console.log("state params: ", $stateParams);
              if ($stateParams.AT == "SNP")
                return 'templates/tab-snp.html';

              if ($stateParams.AT == "ALL")
                return 'templates/tab-atividades.html';

              return 'templates/atividades/' + $stateParams.ATD + '.html';
            },
            controller: 'SNPCtrl'
          }
        }
      })
      // .state('tab.atividades', {
      //   url: '/atividades',
      //   views: {
      //     'tab-atividades': {
      //       templateUrl: 'templates/tab-atividades.html',
      //       controller: 'AtividadesCtrl'
      //     }
      //   }
      // })
      .state('tab.login', {
        url: '/login',
        views: {
          'tab-login': {
            templateUrl: 'templates/tab-login.html',
            // controller: 'DebugCtrl'
            controller: 'LoginCtrl'
          }
        }
      })
      .state('tab.mapaPI', {
        url: '/mapaPI/:RI/:PI',
        views: {
          'tab-mapaPI': {
            templateUrl: function ($stateParams) {
              console.log("mapaPI state params: ", $stateParams);

              // if ($stateParams.RI == "ALL") {
              // }
              console.log(' returned templates/regioes/' + $stateParams.RI + '/' + $stateParams.PI + '.html');
              return 'templates/regioes/' + $stateParams.RI + '/' + $stateParams.PI + '.html';
            },
            controller: 'MapaPICtrl'
          }
        }
      })
      .state('tab.mapaPIdesafios', {
        url: '/mapaPIdesafios/:RI/:PI/:tipo',
        views: {
          'tab-mapaPIdesafios': {
            templateUrl: function ($stateParams) {
              console.log("mapaPIdesafios state params: ", $stateParams);

              if ($stateParams.tipo == "QR") {
                console.log(' returned templates/regioes/' + $stateParams.RI + '/' + $stateParams.PI + '_QR.html');
                return 'templates/regioes/' + $stateParams.RI + '/' + $stateParams.PI + '_QR.html';
              }
              if ($stateParams.tipo == "QUIZ") {
                console.log(' returned templates/regioes/' + $stateParams.RI + '/' + $stateParams.PI + '_Q.html');
                return 'templates/regioes/' + $stateParams.RI + '/' + $stateParams.PI + '_Q.html';
              }

            },
            controller: 'MapaPIdesafiosCtrl'
          }
        }
      })
      .state('tab.mapa', {
        url: '/regiao/:RI/:PI',
        views: {
          'tab-mapa': {
            templateUrl: function ($stateParams) {
              console.log("state params: ", $stateParams);

              if ($stateParams.RI == "ALL") {
                return 'templates/regioes/' + $stateParams.RI + '/' + $stateParams.RI + '.html';
              }
              if (!$stateParams.PI) {
                console.log(' returned: templates/regioes/' + $stateParams.RI + '.html');
                return 'templates/regioes/' + $stateParams.RI + '/' + $stateParams.RI + '.html';
              }
              else if ($stateParams.RI) {
                console.log(' returned templates/regioes/' + $stateParams.RI + '/' + $stateParams.PI + '.html');
                return 'templates/regioes/' + $stateParams.RI + '/' + $stateParams.PI + '.html';
              }
            },
            // cache: false,
            controller: 'MapaCtrl'
          }
        }
      })
      .state('tab.camera', {
        url: '/camera',
        views: {
          'tab-camera': {
            // templateUrl: 'templates/tab-camera.html',
            templateUrl: 'templates/tab-timeline.html',
            controller: 'CameraCtrl'
            // controller: 'timeLineCtrl'
          }
        }
      })
      // .state('tab.tdcards', {
      //   url: '/tdcards/:RI/',
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
      .state('tab.game_help', {
        url: '/game_help',
        views: {
          'tab-game_help': {
            templateUrl: 'templates/tab-game_help.html',
            controller: 'GameHelpCtrl'
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
      // .state('tab.chats', {
      //   url: '/chats',
      //   views: {
      //     'tab-chats': {
      //       templateUrl: 'templates/tab-chats.html',
      //       controller: 'ChatsCtrl'
      //     }
      //   }
      // })
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


