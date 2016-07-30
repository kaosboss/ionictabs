angular.module('starter.services', [])
  .factory('$IbeaconScanner', ['$rootScope', '$window', function ($rootScope, $window) {
    var beacons = {};
    var myRegion = null;
    var myRegion = null;

    var uuid = '74278BDA-B644-4520-8F0C-720E1F6EF512'; // mandatory
    var identifier = 'PIs'; // mandatory
    var minor = 64001; // optional, defaults to wildcard if left empty
    var major = 4660; // optional, defaults to wildcard if left empty
    var nomes = {
      "64001": "Regiao de interesse 2",
      "64003": "Regiao de interesse 3"
    }

    cw("Factory $IbeaconScanner");

    var sendUpdates = false;

    checkBLE = function () {
      if ($window.device.model.indexOf("iPhone4") == -1)
        return true;
    };

    // if ($window.device.model.indexOf("iPhone4") != -1) {
    //   cw("Factory: NO BLE support found!");
    //   $rootScope.enableBeacons=false;
    //   return {
    //     sendUpdates: function (updates) {
    //       sendUpdates = updates;
    //     },
    //     checkBLE: checkBLE
    //   }
    // } else cw("Factory: BLE support found!");

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
        });
    };

    return {

      sendUpdates: function (updates) {
        sendUpdates = updates;
      },

      startBeaconScan: startBeaconScan,

      stopBeaconScan: stopBeaconScan,

      checkBLE: checkBLE
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
            result = res;
            if (res.rows.length > 0) {
              var message = "SELECTED -> " + res.rows.item(0).value;
              console.log(message);
              return result.rows.item(0).value;
            } else {
              // alert("No results found");
              console.log("No results found");
              return 0;
            }
          }, function (err) {
            // alert(err);
            console.error(err);
          });
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
      }
    };

    return {
      openDB: openDB,

      execute: execute,

      // insertCollection: insertCollection,

      // nestedExecute: nestedExecute,

      // deleteDB: deleteDB,

      getVarFromDB: getVarFromDB,

      updateValueToDB: updateValueToDB

    };
    // });
  }])
  // .factory('IbeaconFactory', ['$q', function($q) {
  //
  //   return {
  //     scanBarcode: function() {
  //       var q = $q.defer();
  //       cordova.plugins.BarcodeScanner(function(result) {
  //         // Do any magic you need
  //         q.resolve(result);
  //       }, function(err) {
  //         q.reject(err);
  //       });
  //
  //       return q.promise;
  //     }
  //   }
  // }])
  .factory('Chats', function () {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var chats = [{
      id: 0,
      name: 'Ben Sparrow',
      lastText: 'You on your way?',
      face: 'img/ben.png'
    }, {
      id: 1,
      name: 'Max Lynx',
      lastText: 'Hey, it\'s me',
      face: 'img/max.png'
    }, {
      id: 2,
      name: 'Adam Bradleyson',
      lastText: 'I should buy a boat',
      face: 'img/adam.jpg'
    }, {
      id: 3,
      name: 'Perry Governor',
      lastText: 'Look at my mukluks!',
      face: 'img/perry.png'
    }, {
      id: 4,
      name: 'Mike Harrington',
      lastText: 'This is wicked good ice cream.',
      face: 'img/mike.png'
    }];

    return {
      all: function () {
        return chats;
      },
      remove: function (chat) {
        chats.splice(chats.indexOf(chat), 1);
      },
      get: function (chatId) {
        for (var i = 0; i < chats.length; i++) {
          if (chats[i].id === parseInt(chatId)) {
            return chats[i];
          }
        }
        return null;
      }
    };
  });
