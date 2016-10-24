angular.module('starter.services', [])
  .service('UserService', function ($cordovaSQLite) {
    // For the purpose of this example I will store user data on ionic local storage but you should save it on a database
    var setUser = function (user_data) {

      $cordovaSQLite.updateOrInsertValueToDB("info", [JSON.stringify(user_data), "userinfo"]);

      // window.localStorage.starter_facebook_user = JSON.stringify(user_data);
      // $cordovaSQLite.updateValueToDB("info", [JSON.stringify(user_data), "userinfo"]).then(function (res) {
      //   if (res.rowsAffected == 0) {
      //     console.warn("ERROR updating profile, inserting new");
      //     $cordovaSQLite.insertVarToDB("info", [JSON.stringify(user_data)], "userinfo").then(function (res) {
      //       console.log("INSERTED userdata: : ", res);
      //       // return JSON.parse(res || '{}')
      //     }, function (err) {
      //       console.error("ERROR inserting profile, NOT stored", err);
      //     });
      //   } else
      //     console.log("Stored profile", res)
      //
      // }, function (err) {
      //   console.error("ERROR updating profile, NOT stored", err);
      // });

    };

    var getUser = function () {
      return $cordovaSQLite.getVarFromDB("info", "userinfo");

      var userInfo = $cordovaSQLite.getVarFromDB("info", "userinfo").then(function (res) {
        // console.log("SQLST: ", res);
        // console.log("SQLST: ", JSON.parse(res));
        userInfo = JSON.parse(res || '{}')
        return userInfo
      });
      return userInfo;
      // console.log("LOCALST: ", JSON.parse(window.localStorage.starter_facebook_user || '{}'));
      // return JSON.parse(window.localStorage.starter_facebook_user || '{}');
    };

    return {
      getUser: getUser,
      setUser: setUser
    };
  })
  .factory('$cordovaFileTransfer', ['$q', '$timeout', function ($q, $timeout) {
    return {
      download: function (source, filePath, options, trustAllHosts) {
        var q = $q.defer();
        var ft = new FileTransfer();
        var uri = (options && options.encodeURI === false) ? source : encodeURI(source);

        if (options && options.timeout !== undefined && options.timeout !== null) {
          $timeout(function () {
            ft.abort();
          }, options.timeout);
          options.timeout = null;
        }

        ft.onprogress = function (progress) {
          q.notify(progress);
        };

        q.promise.abort = function () {
          ft.abort();
        };

        ft.download(uri, filePath, q.resolve, q.reject, trustAllHosts, options);
        return q.promise;
      },

      upload: function (server, filePath, options, trustAllHosts) {
        var q = $q.defer();
        var ft = new FileTransfer();
        var uri = (options && options.encodeURI === false) ? server : encodeURI(server);

        if (options && options.timeout !== undefined && options.timeout !== null) {
          $timeout(function () {
            ft.abort();
          }, options.timeout);
          options.timeout = null;
        }

        ft.onprogress = function (progress) {
          q.notify(progress);
        };

        q.promise.abort = function () {
          ft.abort();
        };

        ft.upload(filePath, uri, q.resolve, q.reject, options, trustAllHosts);
        return q.promise;
      }
    };
  }])
  .factory('$cordovaNetwork', ['$rootScope', '$timeout', function ($rootScope, $timeout) {

    /**
     * Fires offline a event
     */
    var offlineEvent = function () {
      var networkState = navigator.connection.type;
      $timeout(function () {
        $rootScope.$broadcast('$cordovaNetwork:offline', networkState);
      });
    };

    /**
     * Fires online a event
     */
    var onlineEvent = function () {
      var networkState = navigator.connection.type;
      $timeout(function () {
        $rootScope.$broadcast('$cordovaNetwork:online', networkState);
      });
    };

    document.addEventListener('deviceready', function () {
      if (navigator.connection) {
        document.addEventListener('offline', offlineEvent, false);
        document.addEventListener('online', onlineEvent, false);
      }
    });

    return {
      getNetwork: function () {
        return navigator.connection.type;
      },

      isOnline: function () {
        if (navigator.connection) {
          var networkState = navigator.connection.type;
          return networkState !== Connection.UNKNOWN && networkState !== Connection.NONE;
        } else return false;
      },

      isOffline: function () {
        var networkState = navigator.connection.type;
        return networkState === Connection.UNKNOWN || networkState === Connection.NONE;
      },

      clearOfflineWatch: function () {
        document.removeEventListener('offline', offlineEvent);
        $rootScope.$$listeners['$cordovaNetwork:offline'] = [];
      },

      clearOnlineWatch: function () {
        document.removeEventListener('online', onlineEvent);
        $rootScope.$$listeners['$cordovaNetwork:online'] = [];
      }
    };
  }])
  .run(['$injector', function ($injector) {
    $injector.get('$cordovaNetwork'); //ensure the factory always gets initialised
  }])
  .factory('$eventFactory', function ($cordovaSQLite, $rootScope) {

    var eventHanlder = false;
    var DB = $cordovaSQLite.getDB();

    return {
      addInHouseEvent: function (args) {
        console.log("$eventFactory: addInHouseEvent enter: ", args);
        if (eventHanlder) {
          $rootScope.$broadcast('ADD_JOURNAL', args);
          console.warn("$eventFactory: broadcast ADD_JOURNAL");
        }
        else {
          console.warn("$eventFactory: no event handler, inserting: ", args);
          var query = "INSERT INTO `journal` (IMG,caption, thumbnail_data, title, auto) VALUES (?,?,?,?,?)";
          // $cordovaSQLite.execute($scope.db, query, [entry.toURL(), "No caption yet!", "data:image/png;base64," + res.imageData]).then(function (res) {
          $cordovaSQLite.execute($cordovaSQLite.getDB(), query, [args.image, args.caption, args.thumb, args.title, 'YES']).then(function (res) {
            var message = "addInHouseEvent: INSERT ID -> " + res.insertId;
            // $scope.captureImageId = res.insertId;
            console.log(message, args.image, res);
            // alert(message);
          }, function (err) {
            console.error(err);
          });
        }
      },
      addEventHandler: function () {
        eventHanlder = true;
      }
      // isEventHandler: function () {
      //   return eventHanlder;
      // }
    }
  })
  .factory('$gameFactory', function ($http, $cordovaSQLite, $rootScope, $eventFactory) {

    var headers = {
      "RI_A": true,
      "RI_B": true,
      "RI_C": true,
      "RI_D": true,
      "RI_E": true,
      "RI_F": true,
      "RI_G": true,
      "RI_H": true
    };

    // var pontos = {
    //   "pnboarding": 5,
    //   "presencial": 10,
    //   "desafios": 10,
    //   "foto": 5
    // };

    console.log("gameFactory enter");

    var quizHeader = true;
    var gameHeader = true;
    var QRHeader = true;
    var gameInfo = null;
    var playerInfo = null;
    var mapaHanlerVar = false;

    var mapaHandler = function (value) {
      if (value)
        mapaHanlerVar = true;
      else
        return mapaHanlerVar;
    };

    var getScore = function () {
      if (gameInfo["playerInfo"])
        return gameInfo["playerInfo"].pontos;
    };
    var getNivelAtual = function () {
      return gameInfo["playerInfo"].nivelAtual;
    };

    var addPoints = function (value) {
      var temp = gameInfo["playerInfo"];
      console.log("$gamefac: add points, playerinfo : ", value, gameInfo["playerInfo"], gameInfo["playerInfo"]["scoreCard"]);
      switch (value) {

        case "onboarding":
          $cordovaSQLite.getVarFromDB("info", "APPtutorial").then(function (res) {
            if (res == "Sim") {
              if (gameInfo["playerInfo"]["scoreCard"][value][1]) {
                gameInfo["playerInfo"].pontos += gameInfo["playerInfo"]["scoreCard"][value][0];
                gameInfo["playerInfo"]["scoreCard"][value][1]--;
                console.log("$gamefac: added points, playerinfo , pontos : ", value, gameInfo["playerInfo"], gameInfo["playerInfo"]["scoreCard"][value]);
                saveGameInfo(gameInfo);
                $cordovaSQLite.updateOrInsertValueToDB("info", ["Não", "APPtutorial"]);
                processGameInfo(gameInfo);
              }
            } else console.warn("tutorial points already given")
          });
          break;

        case "desafios":
          // $cordovaSQLite.getVarFromDB("info", "APPtutorial").then(function (res) {
          //   if (res == "Sim") {
          if (gameInfo["playerInfo"]["scoreCard"][value][1]) {
            gameInfo["playerInfo"].pontos += gameInfo["playerInfo"]["scoreCard"][value][0];
            gameInfo["playerInfo"]["scoreCard"][value][1]--;
            console.log("$gamefac: added points, playerinfo , pontos : ", value, gameInfo["playerInfo"], gameInfo["playerInfo"]["scoreCard"][value]);
            saveGameInfo(gameInfo);
            // $cordovaSQLite.updateOrInsertValueToDB("info", ["Não", "APPtutorial"]);
            processGameInfo(gameInfo);
          }
          // } else console.warn("tutorial points already given")
          // });
          break;
        case "foto":
          // $cordovaSQLite.getVarFromDB("info", "APPtutorial").then(function (res) {
          //   if (res == "Sim") {
          if (gameInfo["playerInfo"]["scoreCard"][value][1]) {
            gameInfo["playerInfo"].pontos += gameInfo["playerInfo"]["scoreCard"][value][0];
            gameInfo["playerInfo"]["scoreCard"][value][1]--;
            console.log("$gamefac: added points, playerinfo , pontos : ", value, gameInfo["playerInfo"], gameInfo["playerInfo"]["scoreCard"][value]);
            saveGameInfo(gameInfo);
            // $cordovaSQLite.updateOrInsertValueToDB("info", ["Não", "APPtutorial"]);
            processGameInfo(gameInfo);
          }
          // } else console.warn("tutorial points already given")
          // });
          break;

        case "regioes":
          // $cordovaSQLite.getVarFromDB("info", "APPtutorial").then(function (res) {
          //   if (res == "Sim") {
          if (gameInfo["playerInfo"]["scoreCard"][value][1]) {
            gameInfo["playerInfo"].pontos += gameInfo["playerInfo"]["scoreCard"][value][0];
            gameInfo["playerInfo"]["scoreCard"][value][1]--;
            console.log("$gamefac: added points, playerinfo , pontos : ", value, gameInfo["playerInfo"], gameInfo["playerInfo"]["scoreCard"][value]);
            saveGameInfo(gameInfo);
            // $cordovaSQLite.updateOrInsertValueToDB("info", ["Não", "APPtutorial"]);
            processGameInfo(gameInfo);
          }
          // } else console.warn("tutorial points already given")
          // });
          break;
      }
    };

    var processGameInfo = function (info) {
      if (info)
        gameInfo = clone(info);

      var temp = gameInfo["playerInfo"].nivelAtual;
      var latestLevel = "";
      var latestParabens = "";
      var latestDescricao = "";
      var change = false;
      var delay = false;
      for (var levelName in gameInfo) {
        if (!gameInfo.hasOwnProperty(levelName) || (!gameInfo[levelName])) continue;

        var level = gameInfo[levelName];
        console.log("gameInfo Sevice: ", levelName, level);

        switch (level.tipo) {
          case "nivel":
            if (gameInfo["playerInfo"].pontos >= level.pontos) {
              if (level.locked) {
                if (!change) {
                  level.locked = false;
                  change = true;
                  gameInfo["playerInfo"].nivelAtual = latestLevel;
                  latestLevel = levelName;
                  latestParabens = level.parabens;
                  latestDescricao = level.descricao;
                } else delay = true;
              }
              console.warn("process gameinfo: " + levelName + " = " + level);
            }
            break;

          case "reward":
            if (level.locked) {
              console.warn("gameFactory: rewards combos: ", level.combos);
              if (level.combos) {
                var count = 0, total = 0;
                level.combos.forEach(function (item) {

                  total++;
                  if (!gameInfo[item].locked)
                    count++;
                  console.warn("gameFactory: rewards combos: ", item, gameInfo[item].locked);
                });
                if (count == total) {
                  if (!change) {
                    level.locked = false;
                    change = true;
                    latestLevel = levelName;
                    latestParabens = level.parabens;
                    latestDescricao = level.descricao;
                  } else delay = true;
                }
              }
            }
            break;

          case "badge":
            console.warn("gameFactory: badge combos: ", levelName);
            if (level.locked)
              if (gameInfo["playerInfo"]["scoreCard"][levelName][1] == 0) {
                if (!change) {
                  level.locked = false;
                  change = true;
                  latestLevel = levelName;
                  latestParabens = level.parabens;
                  latestDescricao = level.descricao;
                } else delay = true;
              }

            // $regioes.getRegioes().then(function (res) {
            //   var regioes = JSON.parse(res || [{}]);
            //   console.log("got regioes: ", regioes);
            //   var r_total = 0, r_atual = 0, r_foto = 0, r_regioes = 0;
            //   regioes.forEach(function (reg) {
            //     if (reg.locked == false)
            //       r_atual++;
            //     r_total++;
            //   });
            //
            // });
            break;
        }
      }

      // gameInfo["playerInfo"].nivelAtual = latestLevel;
      if ((change)) {
        // alert lastest level popup badge
        $eventFactory.addInHouseEvent({
          title: latestDescricao,
          image: "img/game/badges/badge_" + latestLevel + ".png",
          caption: latestParabens,
          thumb: "img/game/badges/badge_" + latestLevel + ".png"
        });
        // $rootScope.$broadcast('ADD_JOURNAL', {
        //   title: "Título de progressão",
        //   image: "img/game/badges/badge_" + latestLevel + ".png",
        //   caption: "Parabéns! Atingiste o nível",
        //   thumb: "img/game/badges/badge_" + latestLevel + ".png"
        // });
        $rootScope.showPopup({templateUrl: 'templates/popups/badge_' + latestLevel + '.html'});
        saveGameInfo();
        $rootScope.$broadcast('LEVELUP', {gameInfo: gameInfo});
        change = false;
      } else
        console.warn("process gameinfo: no level change");

      // if (delay)
      //   $timeout(function () {
      //     processGameInfo();
      //     delay = false;
      //   }, 60000);
    };

    var getGameInicio = function () {
      url = "data/game_inicio.json";
      return $http.get(url).then(function (response) {
        console.log("response xxx regioes inicio: ", response.data);
        gameInfo = response.data;
        playerInfo = gameInfo.playerInfo;
        return gameInfo;
      });
    };

    var saveGameInfo = function (info) {
      if (!info)
        info = gameInfo;
      console.warn("updating gameinfo with: ", info);
      $cordovaSQLite.updateOrInsertValueToDB("info", [JSON.stringify(info), "gameInfo"]);
    };

    var QRHeaderValue = function (value) {

      var ret = false;

      if (value == "ON")
        value = true;
      else if (value == "OFF")
        value = false;
      else if (value == undefined)
        ret = true;

      if (!ret)
        console.warn("gameFactory setting qr header:", value, QRHeader);
      else
        console.warn("gameFactory getting qr header:", value, QRHeader);

      if (!ret)
        QRHeader = value;
      else
        return QRHeader;
    };

    var quizHeaderValue = function (value) {

      var ret = false;

      if (value == "ON")
        value = true;
      else if (value == "OFF")
        value = false;
      else if (value == undefined)
        ret = true;

      if (!ret)
        console.warn("gameFactory setting quiz header:", value, quizHeader);
      else
        console.warn("gameFactory getting quiz header:", value, quizHeader);

      if (!ret)
        quizHeader = value;
      else
        return quizHeader;
    };

    var gameHeaderValue = function (value) {

      var ret = false;

      if (value == "ON")
        value = true;
      else if (value == "OFF")
        value = false;
      else if (value == undefined)
        ret = true;

      if (!ret)
        console.warn("gameFactory setting game header:", value, gameHeader);
      else
        console.warn("gameFactory getting game header:", value, gameHeader);

      if (!ret)
        gameHeader = value;
      else
        return gameHeader;
    };

    return {
      setHeaderOff: function (RI) {
        headers[RI] = false;
      },
      isHeaderOn: function (RI) {
        return headers[RI];
      },
      quizHeaderValue: quizHeaderValue,
      gameHeaderValue: gameHeaderValue,
      QRHeaderValue: QRHeaderValue,
      getGameInicio: getGameInicio,
      saveGameInfo: saveGameInfo,
      processGameInfo: processGameInfo,
      addPoints: addPoints,
      getScore: getScore,
      getNivelAtual: getNivelAtual,
      mapaHandler: mapaHandler
    }
  })
  .factory('$IbeaconScanner', ['$rootScope', '$window', '$regioes', '$gameFactory', '$timeout', function ($rootScope, $window, $regioes, $gameFactory, $timeout) {
    var beacons = {};
    var myRegion = null;

    var uuid = '74278BDA-B644-4520-8F0C-720E1F6EF512'; // mandatory
    var identifier = 'PIs'; // mandatory
    var minor = 64001; // optional, defaults to wildcard if left empty
    var major = 4660; // optional, defaults to wildcard if left empty
    var nomes = {
      "64001": "Regiao de interesse A",
      "64002": "Regiao de interesse B",
      "64003": "Regiao de interesse C",
      "64004": "Regiao de interesse D",
      "64005": "Regiao de interesse E",
      "64006": "Regiao de interesse F",
      "64007": "Regiao de interesse G",
      "64008": "Regiao de interesse H"
    };

    var regioesNomes = {
      "Regiao de interesse A": "RI_A",
      "Regiao de interesse B": "RI_B",
      "Regiao de interesse C": "RI_C",
      "Regiao de interesse D": "RI_D",
      "Regiao de interesse E": "RI_E",
      "Regiao de interesse F": "RI_F",
      "Regiao de interesse G": "RI_G",
      "Regiao de interesse H": "RI_H"
    };

    var limit = {
      "RI_A": 10,
      "RI_B": 10,
      "RI_C": 10,
      "RI_D": 10,
      "RI_E": 10,
      "RI_F": 10,
      "RI_G": 10,
      "RI_H": 10
    };
    var calibrate = {
      "RI_A": 0,
      "RI_B": 0,
      "RI_C": 0,
      "RI_D": 0,
      "RI_E": 0,
      "RI_F": 0,
      "RI_G": 0,
      "RI_H": 0
    };
var popup = {};

    var scanning = false;

    cw("Factory $IbeaconScanner");

    var sendUpdates = false;

    isScanning = function () {
      return scanning;
    };

    startBeaconScan = function () {

      if (!myRegion) {
        myRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major);
        console.log("myRegion Created");
        // myRegion = myRegion;
      }

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
          pluginResult.beacons[i].nome = nomes[pluginResult.beacons[i].minor];
          uniqueBeaconKey = pluginResult.beacons[i].uuid + ":" + pluginResult.beacons[i].major + ":" + pluginResult.beacons[i].minor;

          if ((!beacons[uniqueBeaconKey])) {
            if ((Number(pluginResult.beacons[i].accuracy) <= limit[regioesNomes[pluginResult.beacons[i].nome]]) && (Number(pluginResult.beacons[i].accuracy)>0)) {
              $rootScope.currentRI = pluginResult.beacons[i].nome;
              // console.log("Device busy: %s", $rootScope.deviceBUSY);
              if (!$rootScope.deviceBUSY) {
                // console.log("Device free not busy");
                beacons[uniqueBeaconKey] = pluginResult.beacons[i];
                popup[uniqueBeaconKey] = true;
                $rootScope.beacons = beacons;
                if ($rootScope.enableBeacons) {
                  regioes = $regioes.getAllRegioesList();
                  $regioes.getRegioes().then(function (res) {
                    var found = false;
                    var aCircles = JSON.parse(res || [{}]);
                    console.log("IBEACON: GOT regioes from cordova service to aCircles", aCircles);
                    var change = false;
                    for (var f = 0; f <= aCircles.length - 1; f++) {
                      if (aCircles[f].nome == regioes[$rootScope.currentRI]) {
                        $rootScope.currentRI_descricao = aCircles[f].descricao;
                        if (aCircles[f].locked) {
                          aCircles[f].locked = false;
                          change = true;
                        }
                        if (!aCircles[f].visited) {
                          aCircles[f].visited = true;
                          $timeout(function () {
                            $gameFactory.addPoints("regioes");
                          }, 500);
                          change = true;
                        }
                        found = true;
                      }
                    }
                    if (change) {
                      console.log("IBEACON: UPDATE: GOT regioes from cordova service to aCircles", aCircles);
                      // $rootScope.regioes = aCircles;
                      $regioes.setRegioes(aCircles);
                    }
                  });
                  $rootScope.$broadcast('RI_FOUND');
                  console.log("Sending broadcast RI_FOUND");

                } else
                  console.log("Disabled: enabled beacons for broadcast RI_FOUND");
              } else console.log("Device BUSY for broadcast RI_FOUND, queue?");
            }

          } else {

            beacons[uniqueBeaconKey] = pluginResult.beacons[i];
            if (!popup[uniqueBeaconKey]) {
              if (Number(pluginResult.beacons[i].accuracy) <= limit[regioesNomes[pluginResult.beacons[i].nome]]) {
                $rootScope.currentRI = pluginResult.beacons[i].nome;
                // console.log("Device busy: %s", $rootScope.deviceBUSY);
                if (!$rootScope.deviceBUSY) {
                  // console.log("Device free not busy");
                  // beacons[uniqueBeaconKey] = pluginResult.beacons[i];
                  popup[uniqueBeaconKey] = true;
                  // $rootScope.beacons = beacons;
                  if ($rootScope.enableBeacons) {
                    var regioes = $regioes.getAllRegioesList();
                    $regioes.getRegioes().then(function (res) {
                      var found = false;
                      var aCircles = JSON.parse(res || [{}]);
                      console.log("IBEACON: GOT regioes from cordova service to aCircles", aCircles);
                      var change = false;
                      for (var f = 0; f <= aCircles.length - 1; f++) {
                        if (aCircles[f].nome == regioes[$rootScope.currentRI]) {
                          $rootScope.currentRI_descricao = aCircles[f].descricao;
                          if (aCircles[f].locked) {
                            aCircles[f].locked = false;
                            change = true;
                          }
                          if (!aCircles[f].visited) {
                            aCircles[f].visited = true;
                            $timeout(function () {
                              $gameFactory.addPoints("regioes");
                            }, 500);
                            change = true;
                          }
                          found = true;
                        }
                      }
                      if (change) {
                        console.log("IBEACON: UPDATE: GOT regioes from cordova service to aCircles", aCircles);
                        // $rootScope.regioes = aCircles;
                        $regioes.setRegioes(aCircles);
                      }
                    });
                    $rootScope.$broadcast('RI_FOUND');
                    console.log("Sending broadcast RI_FOUND");

                  } else
                    console.log("Disabled: enabled beacons for broadcast RI_FOUND");
                } else
                  console.log("Device BUSY for broadcast RI_FOUND, queue?");
              }
              $rootScope.beacons = beacons;
              if (sendUpdates) {
                $rootScope.$broadcast('BEACONS_UPDATE');
                console.log("Sending broadcast BEACONS_UPDATE");
              }
            }
            // console.log("FOUND: ", pluginResult.beacons[i].uuid, pluginResult.beacons[i].proximity)
          }
        }
        // $scope.$apply();
      };

      cordova.plugins.locationManager.setDelegate(delegate);
      //  required in iOS 8+
      // cordova.plugins.locationManager.requestWhenInUseAuthorization();
      cordova.plugins.locationManager.requestAlwaysAuthorization();

      cordova.plugins.locationManager.startRangingBeaconsInRegion(myRegion)
        .fail(function (e) {
          console.log("ERROR: START SCAN ", e);
        })
        .done(function (e) {
          console.log("Done: START SCAN", e);
          scanning = true;
        });
    };

    showPopupRI = function () {

    };

    stopBeaconScan = function () {

      cordova.plugins.locationManager.stopRangingBeaconsInRegion(myRegion)
        .fail(function (e) {
          console.log("ERROR STOP SCAN", e);
        })
        .done(function (e) {
          console.log("Done: STOP SCAN", e);
          beacons = {};
          $rootScope.beacons = beacons;
          // $scope.$apply();
          scanning = false;
        });
    };

    return {

      sendUpdates: function (updates) {
        sendUpdates = updates;
      },

      startBeaconScan: startBeaconScan,

      stopBeaconScan: stopBeaconScan,

      isScanning: isScanning
    }
  }])
  .factory('$cordovaCamera', ['$q', function ($q) {

    return {
      getPicture: function (options) {
        var q = $q.defer();

        if (!navigator.camera) {
          q.resolve(null);
          return q.promise;
        }

        navigator.camera.getPicture(function (imageData) {
          q.resolve(imageData);
        }, function (err) {
          q.reject(err);
        }, options);

        return q.promise;
      },

      cleanup: function () {
        var q = $q.defer();

        navigator.camera.cleanup(function () {
          q.resolve();
        }, function (err) {
          q.reject(err);
        });

        return q.promise;
      }
    };
  }])
  .factory('$cordovaBarcodeScanner', ['$q', function ($q) {

    return {
      scan: function (config) {
        var q = $q.defer();

        cordova.plugins.barcodeScanner.scan(function (result) {
          q.resolve(result);
        }, function (err) {
          q.reject(err);
        }, config);

        return q.promise;
      },

      encode: function (type, data) {
        var q = $q.defer();
        type = type || 'TEXT_TYPE';

        cordova.plugins.barcodeScanner.encode(type, data, function (result) {
          q.resolve(result);
        }, function (err) {
          q.reject(err);
        });

        return q.promise;
      }
    };
  }])
  .factory('$cordovaDevice', [function () {

    return {
      /**
       * Returns the whole device object.
       * @see https://github.com/apache/cordova-plugin-device
       * @returns {Object} The device object.
       */
      getDevice: function () {
        return device;
      },

      /**
       * Returns the Cordova version.
       * @see https://github.com/apache/cordova-plugin-device#devicecordova
       * @returns {String} The Cordova version.
       */
      getCordova: function () {
        return device.cordova;
      },

      /**
       * Returns the name of the device's model or product.
       * @see https://github.com/apache/cordova-plugin-device#devicemodel
       * @returns {String} The name of the device's model or product.
       */
      getModel: function () {
        return device.model;
      },

      /**
       * @deprecated device.name is deprecated as of version 2.3.0. Use device.model instead.
       * @returns {String}
       */
      getName: function () {
        return device.name;
      },

      /**
       * Returns the device's operating system name.
       * @see https://github.com/apache/cordova-plugin-device#deviceplatform
       * @returns {String} The device's operating system name.
       */
      getPlatform: function () {
        return device.platform;
      },

      /**
       * Returns the device's Universally Unique Identifier.
       * @see https://github.com/apache/cordova-plugin-device#deviceuuid
       * @returns {String} The device's Universally Unique Identifier
       */
      getUUID: function () {
        return device.uuid;
      },

      /**
       * Returns the operating system version.
       * @see https://github.com/apache/cordova-plugin-device#deviceversion
       * @returns {String}
       */
      getVersion: function () {
        return device.version;
      },

      /**
       * Returns the device manufacturer.
       * @returns {String}
       */
      getManufacturer: function () {
        return device.manufacturer;
      }
    };
  }])
  .factory('$cordovaSQLite', ['$q', '$window', '$rootScope', function ($q, $window, $rootScope) {

    // document.addEventListener("deviceready", function () {

    cw("ionic platform db: init, factory"); // #### DB #########

    var result = {};
    var DB = null;

    openDB = function (options, background) {

      if (angular.isObject(options) && !angular.isString(options)) {
        if (typeof background !== 'undefined') {
          options.bgType = background;
        }
        // if ($window.sqlitePlugin)
        DB = $window.sqlitePlugin.openDatabase(options);
        return DB;
      }
      // if ($window.sqlitePlugin)
      return $window.sqlitePlugin.openDatabase({
        name: options,
        bgType: background
      });
    };

    execute = function (db, query, binding) {
      if (db == null) {
        var q = $q.defer();
        return q.promise;
      }
      var q = $q.defer();
      db.transaction(function (tx) {
        tx.executeSql(query, binding, function (tx, result) {
            q.resolve(result);
          },
          function (transaction, error) {
            q.reject(error);
          });
      });
      return q.promise;
    };

    insertCollection = function (db, query, bindings) {
      var q = $q.defer();
      var coll = bindings.slice(0); // clone collection

      db.transaction(function (tx) {
        (function insertOne() {
          var record = coll.splice(0, 1)[0]; // get the first record of coll and reduce coll by one
          try {
            tx.executeSql(query, record, function (tx, result) {
              if (coll.length === 0) {
                q.resolve(result);
              } else {
                insertOne();
              }
            }, function (transaction, error) {
              q.reject(error);
              return;
            });
          } catch (exception) {
            q.reject(exception);
          }
        })();
      });
      return q.promise;
    };

    nestedExecute = function (db, query1, query2, binding1, binding2) {
      var q = $q.defer();

      db.transaction(function (tx) {
          tx.executeSql(query1, binding1, function (tx, result) {
            q.resolve(result);
            tx.executeSql(query2, binding2, function (tx, res) {
              q.resolve(res);
            });
          });
        },
        function (transaction, error) {
          q.reject(error);
        });

      return q.promise;
    };

    deleteDB = function (dbName) {
      var q = $q.defer();

      $window.sqlitePlugin.deleteDatabase(dbName, function (success) {
        q.resolve(success);
      }, function (error) {
        q.reject(error);
      });

      return q.promise;
    };

    getVarFromDB = function (tipo, binding) {
      switch (tipo) {

        case "info":

          var query = "select value from info where name=?";
          return this.execute(db, query, [binding]).then(function (res) {
            if (res.rows.length > 0) {
              var message = "SELECTED -> " + res.rows.item(0).value;
              // console.log(message);
              return res.rows.item(0).value;
            } else {
              // alert("No results found");
              console.log("No results found");
              return 0;
            }
          }, function (err) {
            // alert(err);
            console.error(err);
          });
          break;

        case "regioes":
          var query = "select value from regioes where name=?";
          return this.execute(db, query, [binding]).then(function (res) {
            if (res.rows.length > 0) {
              var message = "SELECTED -> " + res.rows.item(0).value;
              // console.log(message);
              return res.rows.item(0).value;
            } else {
              // alert("No results found");
              console.log("No results found");
              return 0;
            }
          }, function (err) {
            // alert(err);
            console.error(err);
          });

          break;
      }
    };

    insertVarToDB = function (tipo, binding) {

      switch (tipo) {

        case "info":

          var query = "INSERT INTO `info` (value, name) VALUES (?, ?)";
          return this.execute(db, query, binding).then(function (res) {
            result = res;
            if (res) {
              console.log("insertVarToDB: ", res);
              return res.insertId;
            }
          }, function (err) {
            // alert(err);
            console.error("insertVarToDB: ERROR: ", err);
            return 0;
          });
          break;

        case "regioes":

          var query = "INSERT INTO `regioes` (value, name) VALUES (?, ?)";
          return this.execute(db, query, binding).then(function (res) {
            result = res;
            if (res) {
              console.log("insertVarToDB: ", res);
              return res.insertId;
            }
          }, function (err) {
            // alert(err);
            console.error("insertVarToDB: ERROR: ", err);
            return 0;
          });

      }
    };

    deleteValueFromDB = function (tipo, binding) {
      switch (tipo) {
        case "journal":

          var query = "delete from journal where id=?";
          return this.execute(db, query, [binding]).then(function (res) {
            result = res;
            console.log("DELETE registo from DB, binding: %s", binding.toString());
            if (!res.rowsAffected)
              console.warn("ALERT: Deleet from db got 0 affected rows");
            return res;
          }, function (err) {
            // alert(err);
            console.error(err);
            return 0;
          });
          break;
      }
    };

    updateValueToDB = function (tipo, binding) {
      switch (tipo) {
        case "info":

          var query = "update info set value=? where name=?";
          return this.execute(db, query, binding).then(function (res) {
            result = res;
            console.log("UPDATED DB, binding: %s", binding.toString());
            if (!res.rowsAffected)
              console.warn("ALERT: Update db got 0 affected rows");
            return res;
          }, function (err) {
            // alert(err);
            console.error(err);
            return 0;
          });
          break;

        case "regioes":
          var query = "update regioes set value=? where name=?";
          return this.execute(db, query, binding).then(function (res) {
            result = res;
            console.log("UPDATED DB Regioes, binding: %s", binding.toString());
            if (!res.rowsAffected)
              console.warn("ALERT: Update db got 0 affected rows");
            return res;
          }, function (err) {
            // alert(err);
            console.error(err);
            return 0;
          });
          break;

        case "journal":
          var query = "update journal set caption=? where id=?";
          return this.execute(db, query, binding).then(function (res) {
            result = res;
            console.log("UPDATED DB, binding: %s", binding.toString());
            if (!res.rowsAffected)
              console.warn("ALERT: Update db got 0 affected rows");
            return res;
          }, function (err) {
            // alert(err);
            console.error(err);
            return 0;
          });
          break;
      }
    };

    updateOrInsertValueToDB = function (tipo, binding) {
      switch (tipo) {
        case "info":

          var query = "update info set value=? where name=?";
          return this.execute(db, query, binding).then(function (res) {
            result = res;
            console.log("updateOrInsertValueToDB: UPDATED DB, binding: %s", binding.toString());
            if (!res.rowsAffected) {
              console.warn("ALERT: Update db got 0 affected rows on updateOrInsertValueToDB");
              insertVarToDB(tipo, binding);
            }
            return res;
          }, function (err) {
            // alert(err);
            console.error(err);
            return 0;
          });
          break;

      }
    };

    return {
      openDB: openDB,

      getDB: function () {
        return DB;
      },

      execute: execute,

      // insertCollection: insertCollection,

      // nestedExecute: nestedExecute,

      // deleteDB: deleteDB,

      deleteValueFromDB: deleteValueFromDB,

      getVarFromDB: getVarFromDB,

      updateValueToDB: updateValueToDB,

      insertVarToDB: insertVarToDB,

      updateOrInsertValueToDB: updateOrInsertValueToDB

    };
    // });
  }])
  .factory("users", function ($firebaseObject, $rootScope, $timeout, $cordovaSQLite, $cordovaNetwork) {

    var usersRef = null;
    var userAccount = null;
    var userID = null;
    var needUpdate = false;
    var dadosUpdate = null;

    var needsUpdate = function (update) {
      if (!update)
        return needUpdate;
      else
        needUpdate = update;
    };

    var genUUID = function () {
      userID = UUID();
      $cordovaSQLite.updateOrInsertValueToDB("info", [userID, "userID"]);
      return userID;
    };

    var setUserID = function (id) {
      userID = id;
    };

    UUID = function () {
      function s(n) {
        return h((Math.random() * (1 << (n << 2))) ^ Date.now()).slice(-n);
      }

      function h(n) {
        return (n | 0).toString(16);
      }

      return [
        s(4) + s(4), s(4),
        '4' + s(3),                    // UUID version 4
        h(8 | (Math.random() * 4)) + s(3), // {8|9|A|B}xxx
        // s(4) + s(4) + s(4),
        Date.now().toString(16).slice(-10) + s(2) // Use timestamp to avoid collisions
      ].join('-');
    };

    goOnline = function () {
      Firebase.goOnline();
    };

    init = function () {
      goOnline();
      console.log("FIREBASE: users INIT");
      usersRef = new Firebase("https://crackling-torch-4418.firebaseio.com/Utilizadores/" + userID);
      userAccount = $firebaseObject(usersRef);

      return userAccount;
    };

    addUser = function (user) {
      console.log("ADDUSER####: ", user);
      if (userAccount == null) {
        userAccount = init();

        userAccount.$loaded(function () {
          uploadUserAccount(userAccount, user);
        });

      } else {
        uploadUserAccount(userAccount, user);
      }
    };

    var updateFavorites = function (favs) {
      console.log("UPLOAD FAVS####: userID: %s", userID, favs);
      if (userAccount == null) {
        // userAccount = init();
        usersRef = new Firebase("https://crackling-torch-4418.firebaseio.com/Utilizadores/" + userID);
        userAccount = $firebaseObject(usersRef);

        userAccount.$loaded(function () {
          uploadFavorites(favs);
        });

      } else {
        uploadFavorites(favs);
      }
    };

    var updateDados = function (dados) {
      if (!dados)
        dados = dadosUpdate;

      if (!dados) {
        console.log("UpdateDados empty set");
        return;
      }

      var online = $cordovaNetwork.isOnline();
      needUpdate = true;
      dadosUpdate = dados;
      console.log("UPLOAD dados####: userID: %s online: %s", userID, online, dados);
      if (online) {
        goOnline();
        if (userAccount == null) {
          // userAccount = init();
          usersRef = new Firebase("https://crackling-torch-4418.firebaseio.com/Utilizadores/" + userID);
          userAccount = $firebaseObject(usersRef);

          userAccount.$loaded(function () {
            uploadDados(dados);
          });

        } else {
          uploadDados(dados);
        }
      } else {
        $cordovaSQLite.updateOrInsertValueToDB("info", ["true", "userinfoUpdate"]);
      }
    };

    var uploadFavorites = function (favs) {

      userAccount.favorites = favs.toString();
      userAccount.dataAtualizacao = Date().toLocaleLowerCase();
      userAccount.dataAtualizacao_ts = Date.now();

      userAccount.$save().then(function (ref) {
        var id = ref.key();
        console.log("Favorites: added record with id ", id, ref.key().$id);
        $timeout(function () {
          offline();
        }, 30000);
        // list.$indexFor(id); // returns location in the array
      });
    };

    var uploadDados = function (dados) {

      userAccount.nome = dados.nome;
      userAccount.email = dados.email;

      if (dados.dataInicio) userAccount.dataInicio = dados.dataInicio;
      if (dados.modelo) userAccount.modelo = dados.modelo;
      if (dados.platform) userAccount.platform = dados.platform;
      if (dados.version) userAccount.version = dados.version;
      if (dados.timestamp) userAccount.timestamp = dados.timestamp;
      if (dados.favorites) userAccount.favorites = "";

      userAccount.dataAtualizacao = Date().toLocaleLowerCase();
      userAccount.dataAtualizacao_ts = Date.now();

      userAccount.$save().then(function (ref) {
        var id = ref.key();
        needUpdate = false;
        $cordovaSQLite.updateOrInsertValueToDB("info", ["false", "userinfoUpdate"]);
        console.log("upload dados: added record with id ", id, ref.key().$id);
        $timeout(function () {
          offline();
        }, 30000);
        // list.$indexFor(id); // returns location in the array
      });
    };

    uploadUserAccount = function (userAccount, user) {

      userAccount.nome = user.nome;
      userAccount.dataInicio = user.dataInicio;
      userAccount.email = user.email;
      userAccount.fb_email = user.fb_email;

      userAccount.modelo = user.modelo;
      userAccount.platform = user.platform;
      userAccount.version = user.version;
      userAccount.timestamp = user.timestamp;
      userAccount.favorites = "";


      userAccount.dataAtualizacao = Date().toLocaleLowerCase();
      userAccount.dataAtualizacao_ts = Date.now();

      userAccount.$save().then(function (ref) {
        var id = ref.key();
        console.log("1added record with id ", id, ref.key().$id);
        $timeout(function () {
          offline();
        }, 30000);
        // list.$indexFor(id); // returns location in the array
      });
    };

    offline = function () {
      console.log("FIREBASE: users going offline");
      userAccount.$destroy();
      usersRef.$destroy();
      $timeout(function () {
        Firebase.goOffline();
        console.log("FIREBASE: users offline");
        userAccount = null;
        usersRef = null;
      }, 60000);

    };

    return {
      init: init,
      offline: offline,
      addUser: addUser,
      UUID: UUID,
      setUserID: setUserID,
      genUUID: genUUID,
      updateFavorites: updateFavorites,
      updateDados: updateDados,
      needsUpdate: needsUpdate
    };

  })
  .factory("likes", function ($firebaseArray, $firebase, $cordovaNetwork, $cordovaSQLite, $timeout, $rootScope, users, $http) {

    var likesRef = null;
    var allLikes = [];
    var atividades = null;
    var dataLoaded = false;
    var needUpdate = false;
    // var items = [];
    var items = [
      {
        "id": 0,
        "img": "img/atividades/eventos_despedidas_thumb.png",
        "title": "EVENTOS",
        "description": "O SNP oferece um conjunto diversificado de locais ideais para que crie o seu evento.",
        "template": "eventos"
      },
      {
        "id": 1,
        "img": "img/atividades/atividades_arborismo_thumb.png",
        "title": "ARBORISMO",
        "description": "Percurso de arborismo para que possa reforçar a sua ligação à natureza.",
        "template": "arborismo"
      },
      {
        "id": 2,
        "img": "img/atividades/atividades_bicicletas_thumb.png",
        "title": "BICICLETAS NO SNP",
        "description": "Um novo desafio para todos os que têm alguma pedalada e são adeptos de um estilo de vida saudável em contacto com a natureza.",
        "template": "bicicletas"
      },
      {
        "id": 3,
        "title": "DESPORTO AQUÁTICO",
        "description": "Existem 13ha de planos de água, perfeitos para a prática de atividades de desporto náutico não poluentes.",
        "img": "img/atividades/atividades_aquaticas_thumb.png",
        "template": "aquaticas"
      },
      {
        "id": 4,
        "title": "CAMPOS DE FÉRIAS",
        "img": "img/atividades/atividades_campo_ferias_thumb.png",
        "description": "Campo Base tem uma infraestrutura ideal para a realização de campos de férias.",
        "template": "campo_ferias"
      },
      {
        "id": 5,
        "title": "FAUNA E FLORA",
        "description": "O Ecossistema Ecológico do Sesimbra Natura Park é um dos nossos maiores orgulhos.",
        "img": "img/atividades/atividades_fauna_flora_thumb.png",
        "template": "fauna_flora"
      },
      {
        "id": 6,
        "title": "PAINTBALL",
        "description": "Paintball num campo em contexto de mato, criado especialmente para esta modalidade.",
        "img": "img/atividades/atividades_painball_thumb.png",
        "template": "paintball"
      },
      {
        "id": 7,
        "title": "PERCURSOS PEDESTRES",
        "description": "Um novo desafio para todos os que são adeptos de um estilo de vida saudável em contacto com a natureza.",
        "img": "img/atividades/atividades_percursos_pedestres_thumb.png",
        "template": "percursos_pedestres"
      },
      {
        "id": 8,
        "img": "img/atividades/atividades_tiro_thumb.png",
        "title": "ATIVIDADES DE TIRO",
        "description": "O SNP disponibiliza a possibilidade de praticar o tiro em duas modalidades distintas: tiro com arco e zarabatana.",
        "template": "tiro"
      },
      {
        "id": 9,
        "img": "img/atividades/atividades_centro_canino_thumb.png",
        "title": "CENTRO CANINO",
        "description": "O Sesimbra Natura Park tem integrado o Centro Pedagógico Canino Beira Tejo.",
        "template": "centro_canino"
      },
      {
        "id": 10,
        "img": "img/atividades/atividades_pomar_variedades_thumb.png",
        "title": "POMAR VARIEDADES",
        "description": "Pomar com variedades locais e regionais, onde poderão realizar um conjunto diverso de atividades ligadas ao mundo rural.",
        "template": "pomar_variedades"
      },
      {
        "id": 11,
        "img": "img/atividades/atividades_rugby_thumb.png",
        "title": "FUTEBOL/RUGBY",
        "description": "Futebol e Rugby de praia, aceite esta sugestão e passe um dia diferente com toda a emoção e adrenalina.",
        "template": "rugby"
      },
      {
        "id": 12,
        "img": "img/atividades/atividades_senior_thumb.png",
        "title": "ACTIVIDADES SÉNIOR",
        "description": "Aceite esta sugestão e passe um dia diferente com toda a emoção e relaxe para o seu bem-estar.",
        "template": "senior"
      },
      {
        "id": 13,
        "img": "img/atividades/atividades_voley_praia_thumb.png",
        "title": "VOLEIBOL DE PRAIA",
        "description": "Aceite esta sugestão e passe um dia diferente com toda a emoção e adrenalina",
        "template": "voley_praia"
      }
    ];
    var fireBaseOnline = false;
    var dataLoading = false;
    var upLoading = false;
    var favs = [];

    init = function () {
      dataLoading = true;
      var online = $cordovaNetwork.isOnline();
      console.log("FIREBASE: likes INIT online: %s", online);

      if (online) {
        goOnline();
        fireBaseOnline = true;
        likesRef = new Firebase("https://crackling-torch-4418.firebaseio.com/Likes/Atividades");

        atividades = $firebaseArray(likesRef);
        atividades.$loaded(function () {
          console.log("Loaded likes");
          $cordovaSQLite.getVarFromDB("info", "atividades").then(function (res) {
            items = JSON.parse(res || '{}');
            processLikes(atividades);
            dataLoaded = true;
            dataLoading = false;
          });
        })
      } else {
        $cordovaSQLite.getVarFromDB("info", "atividades").then(function (res) {
          if (res)
            items = JSON.parse(res || '{}');
          console.log("items from db", items);
          dataLoading = false;
        });
      }
      // allLikes = Firebase(likesRef).$asArray();
      // return $firebaseArray(likesRef);
    };

    isDataLoaded = function () {
      return dataLoaded;
    };
    isDataLoading = function () {
      return dataLoading;
    };
    isUpLoading = function () {
      return upLoading;
    };

    isfireBaseOnline = function () {
      return fireBaseOnline;
    };

    uploadLikes = function () {
      upLoading = true;
      var online = $cordovaNetwork.isOnline();
      console.log("FIREBASE: likes uploadLikes online: %s", online);

      if (online) {
        goOnline();
        fireBaseOnline = true;
        likesRef = new Firebase("https://crackling-torch-4418.firebaseio.com/Likes/Atividades");

        atividades = $firebaseArray(likesRef);
        atividades.$loaded(function () {
          console.log("Loaded likes: uploadLikes");
          favs = [];
          for (var f = 0; f < items.length; f++) {
            if (items[f].like)
              favs.push(items[f].template);

            if (items[f].changed) {
              console.warn("updating atividade: item changed ", items[f]);
              for (var i = 0; i < atividades.length; i++) {
                if (items[f].template == atividades[i].$id) {
                  console.warn("updating atividade: ", atividades[i]);
                  var temp = Number(atividades[i].$value);

                  if (items[f].like)
                    temp++;
                  else
                    temp--;
                  atividades[i].$value = temp.toString();

                  items[f].changed = false;
                  atividades.$save(i).then(function (ref) {
                    console.warn("uploadLikes: SAVED Atividades", i, atividades[atividades.$indexFor(ref.key())]);
                    // ref.key()

                    // ref.key() === atividades.$id; // true
                    // offline();
                  }, function (error) {
                    console.log("Error:", error);
                  });
                }
              }
              // upLoading = false;
            }
          }
          console.log("Processed favs: ", favs);
          users.updateFavorites(favs);
          needUpdate = false;
          $timeout(function () {
            offline();
            upLoading = false;
          }, 60000);
          saveLikes();
          console.log("uploadLikes: Atividades: ", atividades);

        });
      } else {
        upLoading = false;
        saveLikes();
      }
    };

    saveLikes = function (listItems) {
      if (!listItems)
        listItems = items;
      console.log("Saving likes");
      $cordovaSQLite.updateValueToDB("info", [JSON.stringify(listItems), "atividades"]).then(function (res) {
        if (!res.rowsAffected)
          console.warn("ALERT: Update db got 0 affected rows, on saveLikes");
        // console.log("Client side, returned update", res);
      });
    };

    processLikes = function (tempRef) {
      console.log("process likes ", tempRef.length);
      for (var f = 0; f < tempRef.length; f++) {
        console.log("process likes ", tempRef[f]);
        allLikes.push({
          nome: tempRef[f].$id,
          likes: tempRef[f].$value
        })
      }
      for (var f = 0; f < items.length; f++) {
        if (items[f].like)
          favs.push(items[f].template);

        if (items[f].changed)
          needUpdate = true;
        for (var i = 0; i < allLikes.length; i++) {
          if (items[f].template == allLikes[i].nome) {
            items[f].likes = Number(allLikes[i].likes);
          }
        }
      }

      if (needUpdate) {
        console.log("favorites: ", favs, items);
        users.updateFavorites(favs);
      }
      $rootScope.$broadcast('REFRESH_ITEMS');

      saveLikes();

      if (needUpdate) {
        if (!upLoading)
          uploadLikes();
        else
          $timeout(function () {
            offline();
          }, 60000);
      } else
        $timeout(function () {
          offline();
        }, 60000);
    };

    getItems = function () {
      return items;
    };

    getAtividadesInicio = function () {
      url = "data/atividades_inicio.json";
      return $http.get(url).then(function (response) {
        items = response.data;
        console.log("response xxx atividades inicio: ", response.data);
        return items;
      });
    };

    needsUpdate = function (update) {
      if (!update)
        return needUpdate;
      else
        needUpdate = update;
    };

    getAllLikes = function () {

      return allLikes;
    };

    goOnline = function () {
      Firebase.goOnline();
      fireBaseOnline = true;
    };

    offline = function () {
      console.log("FIREBASE: likes going offline");
      // likesRef.$destroy();
      // atividades.$destroy();
      $timeout(function () {
        Firebase.goOffline();
        console.log("FIREBASE: likes offline");
        likesRef = null;
        atividades = null;
      }, 60000);

    };

    return {
      init: init,
      isDataLoaded: isDataLoaded,
      getAllLikes: getAllLikes,
      getItems: getItems,
      processLikes: processLikes,
      saveLikes: saveLikes,
      needsUpdate: needsUpdate,
      uploadLikes: uploadLikes,
      offline: offline,
      goOnline: goOnline,
      isfireBaseOnline: isfireBaseOnline,
      isDataLoading: isDataLoading,
      isUploading: isUpLoading,
      getAtividadesInicio: getAtividadesInicio
    };

  })
  .factory("$regioes", function ($cordovaSQLite) {

    console.log("Factory $regioes");

    var regioes = {
      "Regiao de interesse A": "RI_A",
      "Regiao de interesse B": "RI_B",
      "Regiao de interesse C": "RI_C",
      "Regiao de interesse D": "RI_D",
      "Regiao de interesse E": "RI_E",
      "Regiao de interesse F": "RI_F",
      "Regiao de interesse G": "RI_G",
      "Regiao de interesse H": "RI_H"
    };

    var regioesDesafios = null;
    var tempRegioes = [];
    var mapaIsDrawed = false;
    var aCircles = [];

    var updateRegiaoVisitada = function (RI, PI) {
      var count = 0;
      var total = 0;
      var found = false;

      getRegioes().then(function (res) {
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
                  setRegioes(aCircles);
                } else {
                  setRegioes(aCircles);
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

    var convertRegiaoLongToShort = function (reg) {
      return regioes[reg];
    };

    var getAllRegioesList = function () {
      return regioes;
    };

    var setRegioes = function (regioes) {
      // window.localStorage.starter_facebook_user = JSON.stringify(user_data);
      $cordovaSQLite.updateValueToDB("regioes", [JSON.stringify(regioes), "estados"]).then(function (res) {
        if (res.rowsAffected == 0) {
          console.warn("ERROR updating regioes, inserting new");
          $cordovaSQLite.insertVarToDB("regioes", [JSON.stringify(regioes), "estados"]).then(function (res) {
            console.log("INSERTED regioes: : ", res);
            // return JSON.parse(res || '{}')
          }, function (err) {
            console.error("ERROR inserting regioes, NOT stored", err);
          });
        }
        // else
        //   console.log("Stored regioes", res);

      }, function (err) {
        console.error("ERROR updating regioes, NOT stored", err);
      });

    };

    var setRegioesPromise = function (regioes) {
      // window.localStorage.starter_facebook_user = JSON.stringify(user_data);
      return $cordovaSQLite.updateValueToDB("regioes", [JSON.stringify(regioes), "estados"]).then(function (res) {
        if (res.rowsAffected == 0) {
          console.warn("ERROR updating regioes, inserting new");
          $cordovaSQLite.insertVarToDB("regioes", [JSON.stringify(regioes), "estados"]).then(function (res) {
            console.log("INSERTED regioes: : ", res);
            // return JSON.parse(res || '{}')
          }, function (err) {
            console.error("ERROR inserting regioes, NOT stored", err);
          });
        }
        // else
        //   console.log("Stored regioes", res);

      }, function (err) {
        console.error("ERROR updating regioes, NOT stored", err);
      });

    };

    var getRegioes = function () {
      return $cordovaSQLite.getVarFromDB("regioes", "estados");
    };

    var setTempRegioes = function (tregioes) {
      tempRegioes = tregioes;
    };

    var getTempRegioes = function () {
      return tempRegioes;
    };

    return {
      getTempRegioes: getTempRegioes,
      setTempRegioes: setTempRegioes,
      setRegioes: setRegioes,
      getRegioes: getRegioes,
      convertRegiaoLongToShort: convertRegiaoLongToShort,
      getAllRegioesList: getAllRegioesList,
      drawedMapa: function (value) {
        var ret = false;

        if (value == "ON")
          value = true;
        else if (value == "OFF")
          value = false;
        else if (value == undefined)
          ret = true;

        if (!ret)
          console.warn("drawed setting mapa: ", value, mapaIsDrawed);
        else
          console.warn("drawed getting mapa: ", value, mapaIsDrawed);

        if (!ret)
          mapaIsDrawed = value;
        else
          return mapaIsDrawed;
        // else
        //   mapaIsDrawed = value;
      },
      getCacheRegioes: function () {
        return aCircles;
      },
      setCacheRegioes: function (value) {
        if (value)
          aCircles = value;
        else
          return aCircles;
      },
      setRegioesPromise: setRegioesPromise,
      updateRegiaoVisitada: updateRegiaoVisitada
    }
  })
  .factory('perguntas', function ($http, $rootScope) {

    var perguntas = [];
    var regioes_inicio = [
      {
        "nome": "RI_A",
        "descricao": "Região de interesse A",
        "centerX": 273,
        "centerY": 105,
        "radius": 20,
        "locked": false,
        "banner": "É aqui que vamos iniciar a nossa visita à Quinta Pedagógica. Eu vou estar sempre ao pé de ti para garantir que tiras o máximo de partido desta visita!",
        "PIs": [
          {
            "id": 1,
            "nome": "PI_1",
            "descricao": "Início do percurso"
          },
          {
            "id": 2,
            "nome": "PI_2",
            "descricao": "Horta de Aromáticas"
          },
          {
            "id": 3,
            "nome": "PI_3",
            "descricao": "Poço - Elemento de água típico da Quinta"
          },
          {
            "id": 4,
            "nome": "PI_4",
            "descricao": "Pássaros"
          }
        ],
        "quizDone": false,
        "Quiz": [
          {
            "question": "Qual das plantas tem uma cor lilás?",
            "options": [
              "Alfazema",
              "Coentros",
              "Manjerico"
            ],
            "answer": 0
          },
          {
            "question": "Qual a planta usada para dores musculares?",
            "options": [
              "Alecrim",
              "Salsa",
              "Rosmaninho"
            ],
            "answer": 2
          },
          {
            "question": "Como se chamam os pássaros brancos?",
            "options": [
              "Piriquitos",
              "Rolas",
              "Pombas"
            ],
            "answer": 1
          }
        ]
      },
      {
        "nome": "RI_B",
        "descricao": "Região de interesse B",
        "centerX": 230,
        "centerY": 95,
        "radius": 20,
        "locked": false,
        "banner": "Aqui vais conhecer pequenas plantas capazes de fazer grandes efeitos nos teus sentidos, os melhores mensageiros, a minha casa, a minha horta e os meus vizinhos marrecos e mudos!",
        "PIs": [
          {
            "id": 5,
            "nome": "PI_5",
            "descricao": "Horta de Aromáticas - Rosmaninho"
          },
          {
            "id": 6,
            "nome": "PI_6",
            "descricao": "Horta Pedagógica"
          },
          {
            "id": 7,
            "nome": "PI_7",
            "descricao": "Pombal"
          },
          {
            "id": 8,
            "nome": "PI_8",
            "descricao": "Capoeira de Galinhas"
          },
          {
            "id": 9,
            "nome": "PI_9",
            "descricao": "Capoeira de Gansos, Patos mudos e Patos marrecos "
          }
        ],
        "quizDone": false,
        "Quiz": [
          {
            "question": "Quantos dedos tem cada pata do Pantufas?",
            "options": [
              "3",
              "4",
              "5"
            ],
            "answer": 1
          },
          {
            "question": "Qual a vitamina que a cenoura tem e que faz bem à visão?",
            "options": [
              "Vitamina A",
              "Vitamina B",
              "Vitamina C"
            ],
            "answer": 0
          },
          {
            "question": "Quantos ovos em média pôem as galinhas por dia?",
            "options": [
              "1",
              "3",
              "4"
            ],
            "answer": 0
          }
        ]
      },
      {
        "nome": "RI_C",
        "descricao": "Região de interesse C",
        "centerX": 187,
        "centerY": 88,
        "radius": 22,
        "locked": false,
        "banner": "Agora que já conheceste a minha casa e os meus vizinhos do lado, vou dar-te a conhecer excelentes frutos e árvores, bem como os meus vizinhos mais saloios ... ",
        "PIs": [
          {
            "id": 10,
            "nome": "PI_10",
            "descricao": "Pessegueiros e Nectarinas"
          },
          {
            "id": 11,
            "nome": "PI_11",
            "descricao": "Diospireiros"
          },
          {
            "id": 12,
            "nome": "PI_12",
            "descricao": "Damasqueiros"
          },
          {
            "id": 13,
            "nome": "PI_13",
            "descricao": "Cabras, cabras anãs e ovelha saloia"
          },
          {
            "id": 14,
            "nome": "PI_14",
            "descricao": "Pomar de citrinos"
          },
          {
            "id": 15,
            "nome": "PI_15",
            "descricao": "Sobreiro"
          }
        ],
        "quizDone": false,
        "Quiz": [
          {
            "question": "Como se chama a árvore da cortiça?",
            "options": [
              "Sobreiro",
              "Corticeiro",
              "Pinheiro"
            ],
            "answer": 0
          },
          {
            "question": "Qual a origem dos damascos?",
            "options": [
              "Médio Oriente",
              "África",
              "Ásia"
            ],
            "answer": 0
          },
          {
            "question": "De quantos em quantos anos é retirada a cortiça?",
            "options": [
              "8 em 8",
              "9 em 9",
              "10 em 10"
            ],
            "answer": 1
          }
        ]
      },
      {
        "nome": "RI_D",
        "descricao": "Região de interesse D",
        "centerX": 135,
        "centerY": 70,
        "radius": 32,
        "locked": false,
        "banner": "Esta é a região com mais água da Quinta! Para além da água vais também ficar a saber mais de uma das árvores mais inteligentes que existe!",
        "PIs": [
          {
            "id": 16,
            "nome": "PI_16",
            "descricao": "Eucaliptal"
          },
          {
            "id": 17,
            "nome": "PI_17",
            "descricao": "Nascente"
          },
          {
            "id": 18,
            "nome": "PI_18",
            "descricao": "Charca"
          }
        ],
        "quizDone": false,
        "Quiz": [
          {
            "question": "Quantos anos demora o Eucalipto a ficar pronto para cortar?",
            "options": [
              "30",
              "20",
              "10"
            ],
            "answer": 2
          },
          {
            "question": "De que país é originário o Eucalipto?",
            "options": [
              "Brasil",
              "Canadá",
              "Austrália"
            ],
            "answer": 2
          },
          {
            "question": "Quantas nascentes permanentes existem na Quinta Pedagógica?",
            "options": [
              "1",
              "2",
              "3"
            ],
            "answer": 0
          }
        ]
      },
      {
        "nome": "RI_E",
        "descricao": "Região de interesse E",
        "centerX": 53,
        "centerY": 50,
        "radius": 36,
        "banner": "Depois de já teres ficado a conhecer o Eucalipto, vais agora conhecer as duas outras árvores mais abundantes em Portugal e com uma grande importância. Vou-te ensinar muitas coisas!",
        "locked": true,
        "PIs": [
          {
            "id": 19,
            "nome": "PI_19",
            "descricao": "Sobreiral"
          },
          {
            "id": 20,
            "nome": "PI_20",
            "descricao": "Alfarrobeira"
          },
          {
            "id": 21,
            "nome": "PI_21",
            "descricao": "Charca"
          },
          {
            "id": 22,
            "nome": "PI_22",
            "descricao": "Pinheiro bravo"
          },
          {
            "id": 23,
            "nome": "PI_23",
            "descricao": "Marmeleiros"
          }
        ],
        "quizDone": false,
        "Quiz": [
          {
            "question": "Em que região existem mais alfarrobeiras em Portugal?",
            "options": [
              "Alentejo",
              "Santarém",
              "Algarve"
            ],
            "answer": 2
          },
          {
            "question": "De que planta é que os egípcios utilizavam para diminuir dores e febre?",
            "options": [
              "Salgueiro",
              "Sobreiro",
              "Alfarrobeira"
            ],
            "answer": 0
          },
          {
            "question": " Cerca de quantas sementes estão dentro da alfarroba?",
            "options": [
              "10 a 16",
              "30 a 36",
              "100 a 120"
            ],
            "answer": 0
          }
        ]
      },
      {
        "nome": "RI_F",
        "descricao": "Região de interesse F",
        "centerX": 75,
        "centerY": 110,
        "radius": 31,
        "locked": false,
        "banner": "Nesta região vais ficar a conhecer a Romã e vais também ficar a saber quais as características do Montado.",
        "PIs": [
          {
            "id": 24,
            "nome": "PI_24",
            "descricao": "Romãzeira"
          },
          {
            "id": 25,
            "nome": "PI_25",
            "descricao": "Prado e montado"
          }
        ],
        "quizDone": false,
        "Quiz": [
          {
            "question": "Qual a árvore que dá bolotas?",
            "options": [
              "Sobreiro e Carvalho",
              "Carvalho e Azinheira",
              "Sobreiro, Carvalho e Azinheira"
            ],
            "answer": 2
          },
          {
            "question": "O que há no Montado que não há no Sobreiral?",
            "options": [
              "Cultivo agrícola",
              "Bolotas",
              "Sobreiros"
            ],
            "answer": 0
          },
          {
            "question": "A Romã é rica em que vitaminas?",
            "options": [
              "Vitaminas A,C e E",
              "Complexo B e C",
              "Vitaminas A e D"
            ],
            "answer": 0
          }
        ]
      },
      {
        "nome": "RI_G",
        "descricao": "Região de interesse G",
        "centerX": 178,
        "centerY": 125,
        "radius": 20,
        "locked": false,
        "banner": "Nesta região ainda vais poder aprender muitas coisas interessantes! Prepara-te para conhecer mais sobre frutas deliciosas e sobre o famoso Pinheiro!",
        "PIs": [
          {
            "id": 26,
            "nome": "PI_26",
            "descricao": "Figueiras"
          },
          {
            "id": 27,
            "nome": "PI_27",
            "descricao": "Pomar de citrinos"
          },
          {
            "id": 28,
            "nome": "PI_28",
            "descricao": "Pinheiro Manso"
          }
        ],
        "quizDone": false,
        "Quiz": [
          {
            "question": "Desde quando se come o Figo?",
            "options": [
              "Idade do Gelo",
              "Idade da Pedra",
              "Idade do Bronze"
            ],
            "answer": 1
          },
          {
            "question": "Que fruto não é considerado um citrino?",
            "options": [
              "Figo",
              "Limão",
              "Tangerina"
            ],
            "answer": 0
          },
          {
            "question": "Qual a árvore mais cultivada do Mundo?",
            "options": [
              "Limoeiro",
              "Marmeleiro",
              "Laranjeira"
            ],
            "answer": 2
          }
        ]
      },
      {
        "nome": "RI_H",
        "descricao": "Região de interesse H",
        "centerX": 225,
        "centerY": 125,
        "radius": 20,
        "locked": false,
        "banner": "Aqui, vou mostrar-te árvores que vieram da China, vou-te falar de árvores que vivem mais de 2.000 anos e de plantas que se movem com o sol...",
        "PIs": [
          {
            "id": 29,
            "nome": "PI_29",
            "descricao": "Olival"
          },
          {
            "id": 30,
            "nome": "PI_30",
            "descricao": "Amoreira e Abóboras"
          },
          {
            "id": 31,
            "nome": "PI_31",
            "descricao": "Nespereiras e Romãzeiras"
          },
          {
            "id": 32,
            "nome": "PI_32",
            "descricao": "Campo de cereais"
          },
          {
            "id": 33,
            "nome": "PI_33",
            "descricao": "Girasol"
          }
        ],
        "quizDone": false,
        "Quiz": [
          {
            "question": "Quantos anos tem a oliveira mais velha em Portugal?",
            "options": [
              "100 anos",
              "1000 anos",
              "mais de 2000 anos"
            ],
            "answer": 2
          },
          {
            "question": "De que país é originária a nespereira?",
            "options": [
              "China",
              "Marrocos",
              "Grécia"
            ],
            "answer": 0
          },
          {
            "question": "Para que não são usadas as abóboras?",
            "options": [
              "Máscaras",
              "Óleo",
              "Compotas"
            ],
            "answer": 1
          }
        ]
      }
    ];
    var tdcards = [];
    var url = "";

    init = function (RI, PI) {

      url = "data/" + RI + "/" + PI + "/tdcards.json";
      $http.get(url).then(function (response) {
        $rootScope.tdcards = response.data;
        console.log("response preload tdcards: ", $rootScope.tdcards);
        //  return tdcards;
      });

      // url = "data/" + RI + "/" + PI + "/verdade_mentira.json";
      // $http.get(url).then(function (response) {
      //   $rootScope.perguntas = response.data;
      //   console.log("response preload verdade mentira: ", $rootScope.perguntas);
      //   //  return perguntas;
      // });

      if (regioes_inicio.length == 0) {
        console.log("First load regioes inicio");
        url = "data/regioes_inicio.json";
        $http.get(url).then(function (response) {
          console.log("response xxx regios inicio: ", response.data);
          regioes_inicio = response.data;
        });
      }
    };

    return {
      init: init,

      getPerguntas: function () {
        if (($rootScope.perguntas) && ($rootScope.perguntas.length > 0))
          return $rootScope.perguntas;
      },
      getRegioesInicio: function () {
        // if ((regioes_inicio) && (regioes_inicio.length > 0))
        //   return regioes_inicio;

        url = "data/regioes_inicio.json";
        return $http.get(url).then(function (response) {
          console.log("response xxx regioes inicio: ", response.data);
          regioes_inicio = response.data;
          return regioes_inicio;
        });

      },
      getTdcards: function () {
        console.log("factory: tdcards: ", $rootScope.tdcards);
        if (($rootScope.tdcards) && $rootScope.tdcards.length > 0) {
          return $rootScope.tdcards;
        }
      },
      getPIs: function (RI) {
        if (!regioes_inicio)
        //if (!regioes_inicio)
          return [];

        for (var f = 0; f < regioes_inicio.length; f++) {
          if (regioes_inicio[f].nome == RI)
            return regioes_inicio[f].PIs;
        }
      },
      getQuiz: function (RI) {
        console.warn("GetQuiz, called");
        if (!regioes_inicio) {
          console.warn("GetQuiz, empty regioes");
          return [];
        }
        for (var f = 0; f < regioes_inicio.length; f++) {
          if (regioes_inicio[f].nome == RI)
            return regioes_inicio[f].Quiz;
        }
      }
    }
  })
  .factory("blob", function () {

    var thumb_file = "";

    function getThumbFile() {
      return thumb_file;
    }

    function b64toBlob(b64Data, contentType, sliceSize) {
      contentType = contentType || '';
      sliceSize = sliceSize || 512;

      var byteCharacters = atob(b64Data);
      var byteArrays = [];

      for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
      }

      var blob = new Blob(byteArrays, {type: contentType});
      return blob;
    }

    /**
     * Create a Image file according to its database64 content only.
     *
     * @param folderpath {String} The folder where the file will be created
     * @param filename {String} The name of the file that will be created
     * @param content {Base64 String} Important : The content can't contain the following string (data:image/png[or any other format];base64,). Only the base64 string is expected.
     */

    return {
      // savebase64AsImageFile: savebase64AsImageFile,
      getThumbFile: getThumbFile,
      b64toBlob: b64toBlob
    }
  })
  .factory('news', function ($rootScope, $http, $cordovaSQLite, $cordovaNetwork, $firebaseArray, $firebase) {

    var news_inicio = [];
    var url = '';
    var updated = false;
    var newsRef = null;
    var newsList = null;
    var newsGotNews = false;
    var newsChecked = false;
    var newsArray = [];
    var newsChecking = false;

    var setNews = function (newsres) {
      console.warn("updating news with: ", newsres);
      $cordovaSQLite.updateOrInsertValueToDB("info", [JSON.stringify(newsres), "news"]);
    };

    return {
      getNewsInicio: function () {
        url = "data/news_inicio.json";
        return $http.get(url).then(function (response) {
          console.log("response xxx news inicio: ", response.data);
          news_inicio = response.data;
          return news_inicio;
        });
      },
      setNews: setNews,
      updated: function (value) {
        if (value)
          updated = value;
        else
          return updated;
      },
      goOnline: function () {
        Firebase.goOnline();
        fireBaseOnline = true;
      },

      offline: function () {
        console.log("FIREBASE: news going offline");
        // likesRef.$destroy();
        // atividades.$destroy();
        $timeout(function () {
          Firebase.goOffline();
          console.log("FIREBASE: news offline");
          newsRef = null;
          newsList = null;
        }, 60000);
      },
      checkNews: function () {
        if ((newsChecked) || (newsChecking))
          return;
        newsChecking = true;

        var online = $cordovaNetwork.isOnline();
        console.log("FIREBASE: news online: %s", online);

        if (online) {
          goOnline();
          // fireBaseOnline = true;
          newsRef = new Firebase("https://crackling-torch-4418.firebaseio.com/News");

          newsList = $firebaseArray(newsRef);
          newsList.$loaded(function () {
            console.warn("Got news list", newsList);
            newsGotNews = true;
            newsChecked = true;
            newsChecking = false;
            newsArray = [];
            newsList.forEach(function (slide) {
              newsArray.push({
                noticia: slide.$value
              });
            });
            console.warn("Got news, saving: ", newsArray);
            setNews(newsArray);
            $rootScope.$broadcast('GOT_NEWS');
            offline();
          });
        }
      },
      getNews: function () {
        return newsArray;
      },
      checked: function () {
        return newsChecked;
      },
      gotNews: function () {
        return newsGotNews;
      }
    }

  });
//
//   var questions = null;
//   var quizRI = null;
//   var regioes = null;
//
//   // [
//   // {
//   //   question: "Em que região existem mais alfarrobeiras em Portugal?",
//   //   options: ["Alentejo", "Santarém", "Algarve"],
//   //   answer: 2
//   // },
//   // {
//   //   question: "De que planta é que os egípcios utilizavam para diminuir dores e febre?",
//   //   options: ["Salgueiro", "Sobreiro", "Alfarrobeira"],
//   //   answer: 0
//   // },
//   // {
//   //   question: "De que fruto é que se faz a marmelada?",
//   //   options: ["Maçã", "Pêra", "Marmelo"],
//   //   answer: 2
//   // }
//   // ,
//   // {
//   //   question: "Which city hosted the 1996 Summer Olympics?",
//   //   options: ["Atlanta", "Sydney", "Athens", "Beijing"],
//   //   answer: 0
//   // },
//   // {
//   //   question: "Who invented telephone?",
//   //   options: ["Albert Einstein", "Alexander Graham Bell", "Isaac Newton", "Marie Curie"],
//   //   answer: 1
//   // }
//   // ];
//
//
//   return {
//     init: function (RI) {
//       console.log("Quiz factory initing RI:", RI);
//       quizRI = RI;
//       // if (regioes==null)
//       $regioes.getRegioes().then(function (res) {
//         regioes = JSON.parse(res || [{}]);
//         // $regioes.setTempRegioes($scope.aCircles);
//         // console.log("createCircles: GOT regioes from cordova service to aCircles", $scope.aCircles);
//         // drawImage();
//         for (var f = 0; f < regioes.length; f++) {
//           if (regioes[f].nome == RI)
//             if (regioes[f].Quiz)
//               questions = regioes[f].Quiz;
//         }
//         console.log("Quiz factory inited", questions);
//       });
//     },
//     getQuestion: function (id) {
//       // if (!questions)
//       //   questions = perguntas.getQuiz(RI);
//       if (id < questions.length) {
//         return questions[id];
//       } else {
//         return false;
//       }
//     },
//     quizCompleto: function () {
//       $regioes.getRegioes().then(function (res) {
//         var found = false;
//         regioes = JSON.parse(res || [{}]);
//         console.log("quizCompleto: GOT regioes from cordova service");
//         for (var f = 0; f <= regioes.length - 1; f++) {
//           if (regioes[f].nome == quizRI) {
//             regioes[f].quizDone = true;
//             found = true;
//           }
//         }
//         if (found) {
//           console.log("quizCompleto: UPDATE: ", regioes);
//           $regioes.setRegioes(regioes);
//         } else
//           console.warn("QuizCompleto RI not found", quizRI);
//       });
//     }
//
//   };
// });

// .factory('Chats', function () {
//   // Might use a resource here that returns a JSON array
//
//   // Some fake testing data
//   var chats = [{
//     id: 0,
//     name: 'Ben Sparrow',
//     lastText: 'You on your way?',
//     face: 'img/ben.png'
//   }, {
//     id: 1,
//     name: 'Max Lynx',
//     lastText: 'Hey, it\'s me',
//     face: 'img/max.png'
//   }, {
//     id: 2,
//     name: 'Adam Bradleyson',
//     lastText: 'I should buy a boat',
//     face: 'img/adam.jpg'
//   }, {
//     id: 3,
//     name: 'Perry Governor',
//     lastText: 'Look at my mukluks!',
//     face: 'img/perry.png'
//   }, {
//     id: 4,
//     name: 'Mike Harrington',
//     lastText: 'This is wicked good ice cream.',
//     face: 'img/mike.png'
//   }];
//
//   return {
//     all: function () {
//       return chats;
//     },
//     remove: function (chat) {
//       chats.splice(chats.indexOf(chat), 1);
//     },
//     get: function (chatId) {
//       for (var i = 0; i < chats.length; i++) {
//         if (chats[i].id === parseInt(chatId)) {
//           return chats[i];
//         }
//       }
//       return null;
//     }
//   };
// });
