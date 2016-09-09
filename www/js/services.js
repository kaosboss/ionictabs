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
        var networkState = navigator.connection.type;
        return networkState !== Connection.UNKNOWN && networkState !== Connection.NONE;
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
  .factory('$IbeaconScanner', ['$rootScope', '$window', '$regioes', function ($rootScope, $window, $regioes) {
    var beacons = {};
    var myRegion = null;
    var myRegion = null;

    var uuid = '74278BDA-B644-4520-8F0C-720E1F6EF512'; // mandatory
    var identifier = 'PIs'; // mandatory
    var minor = 64001; // optional, defaults to wildcard if left empty
    var major = 4660; // optional, defaults to wildcard if left empty
    var nomes = {
      "64001": "Regiao de interesse B",
      "64003": "Regiao de interesse E"
    };

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
            $rootScope.currentRI = pluginResult.beacons[i].nome;
            // console.log("Device busy: %s", $rootScope.deviceBUSY);
            if (!$rootScope.deviceBUSY) {
              // console.log("Device free not busy");
              beacons[uniqueBeaconKey] = pluginResult.beacons[i];
              $rootScope.beacons = beacons;
              if ($rootScope.enableBeacons) {
                var regioes = $regioes.getAllRegioesList();
                $regioes.getRegioes().then(function (res) {
                  var found = false;
                  var aCircles = JSON.parse(res || [{}]);
                  console.log("IBEACON: GOT regioes from cordova service to aCircles", aCircles);
                  for (var f = 0; f <= aCircles.length - 1; f++) {
                    if (aCircles[f].nome == regioes[$rootScope.currentRI]) {
                      aCircles[f].locked = false;
                      found = true;
                    }
                  }
                  if (found) {
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
          } else {
            beacons[uniqueBeaconKey] = pluginResult.beacons[i];
            $rootScope.beacons = beacons;
            if (sendUpdates) {
              $rootScope.$broadcast('BEACONS_UPDATE');
              console.log("Sending broadcast BEACONS_UPDATE");
            }
          }
          // console.log("FOUND: ", pluginResult.beacons[i].uuid, pluginResult.beacons[i].proximity)
        }
        // $scope.$apply();
      };

      cordova.plugins.locationManager.setDelegate(delegate);
      //  required in iOS 8+
      cordova.plugins.locationManager.requestWhenInUseAuthorization();
      // cordova.plugins.locationManager.requestAlwaysAuthorization();

      cordova.plugins.locationManager.startRangingBeaconsInRegion(myRegion)
        .fail(function (e) {
          console.log("ERROR: START SCAN ", e);
        })
        .done(function (e) {
          console.log("Done: START SCAN", e);
          scanning = true;
        });
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

    openDB = function (options, background) {

      if (angular.isObject(options) && !angular.isString(options)) {
        if (typeof background !== 'undefined') {
          options.bgType = background;
        }
        // if ($window.sqlitePlugin)
        return $window.sqlitePlugin.openDatabase(options);
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
          return this.execute(db, query, binding).then(function (res) {
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
  .factory("likes", function ($firebaseArray, $firebase, $cordovaNetwork, $cordovaSQLite, $timeout, $rootScope, users) {

    var likesRef = null;
    var allLikes = [];
    var atividades = null;
    var dataLoaded = false;
    var needUpdate = false;
    var items = [
      {
        id: 0,
        img: 'img/atividades/atividades_arborismo.png',
        title: 'ARBORISMO',
        description: 'O Sesimbra Natura Park desenvolveu um percurso de arborismo para que possa reforçar a sua ligação à natureza.',
        template: "arborismo"
      },
      {
        id: 1,
        img: 'img/atividades/atividades_bicicletas-hover.png',
        title: 'BICICLETAS NO SNP',
        description: 'Um novo desafio para todos os que têm alguma pedalada e são adeptos de um estilo de vida saudável em contacto com a natureza.',
        template: "bicicletas"
      },
      {
        id: 2,
        title: 'DESPORTO AQUÁTICO',
        description: 'O Sesimbra Natura Park tem 13 ha de planos de água, perfeitos para a prática de atividades de desporto náutico não poluentes.',
        img: 'img/atividades/actividades_aquaticas-hover.png',
        template: "aquaticas"
      },
      {
        id: 3,
        title: 'CAMPOS DE FÉRIAS',
        img: 'img/atividades/atividades_campo_ferias-hover.png',
        description: 'O SNP disponibiliza no Campo Base uma infraestrutura ideal para a realização de campos de férias.',
        template: "campo_ferias"
      },
      {
        id: 5,
        title: 'FAUNA E FLORA',
        description: 'O Ecossistema Ecológico do Sesimbra Natura Park é um dos nossos maiores orgulhos.',
        img: 'img/atividades/atividades_fauna_flora-hover.png'
      },
      {
        id: 6,
        title: 'PAINTBALL',
        description: 'O Sesimbra Natura Park permite a prática de paintball num campo em contexto de mato, criado especialmente para esta modalidade.',
        img: 'img/atividades/atividades_painball-hover.png'
      },
      {
        id: 7,
        title: 'PERCURSOS PEDESTRES',
        description: 'Um novo desafio para todos os que são adeptos de um estilo de vida saudável em contacto com a natureza.',
        img: 'img/atividades/atividades_percursos_pedestres-hover.png'
      },
      {
        id: 8,
        img: 'img/atividades/atividades_tiro-hover.png',
        title: 'ATIVIDADES DE TIRO',
        description: 'O SNP disponibiliza a possibilidade de praticar o tiro em duas modalidades distintas: tiro com arco e zarabatana.'
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
      isUploading: isUpLoading
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
        } else
          console.log("Stored regioes", res);

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
      getAllRegioesList: getAllRegioesList
    }
  })
  .factory('perguntas', function ($http, $rootScope) {

    var perguntas = [];
    var regioes_inicio = [];
    var tdcards = [];
    var url = "";

    init = function (RI, PI) {

      url = "data/" + RI + "/" + PI + "/tdcards.json";
      $http.get(url).then(function (response) {
        $rootScope.tdcards = response.data;
        console.log("response preload tdcards: ", $rootScope.tdcards);
        //  return tdcards;
      });

      url = "data/" + RI + "/" + PI + "/verdade_mentira.json";
      $http.get(url).then(function (response) {
        $rootScope.perguntas = response.data;
        console.log("response preload verdade mentira: ", $rootScope.perguntas);
        //  return perguntas;
      });

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
        if ((regioes_inicio) && (regioes_inicio.length > 0))
          return regioes_inicio;

        url = "data/regioes_inicio.json";
        return $http.get(url).then(function (response) {
          console.log("response xxx regios inicio: ", response.data);
          regioes_inicio = response.data;
          //$regioes.setRegioes(response.data);
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
  });

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
