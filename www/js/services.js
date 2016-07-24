angular.module('starter.services', [])
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

  // .factory('Camera', ['$q', function($q) {
  //
  //   return {
  //     getPicture: function(options) {
  //       var q = $q.defer();
  //
  //       navigator.camera.getPicture(function(result) {
  //         // Do any magic you need
  //         q.resolve(result);
  //       }, function(err) {
  //         q.reject(err);
  //       }, options);
  //
  //       return q.promise;
  //     }
  //   }
  // }])
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
.factory('Chats', function() {
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
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});
