angular.module('starter.controllers', [])

  .controller('ChatsCtrl', function ($scope, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = Chats.all();
    $scope.remove = function (chat) {
      Chats.remove(chat);
    };
  })

  .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
  })

  .controller('AccountCtrl', function ($rootScope, $scope) {
    $scope.BLE = true;
    $scope.enableBeacons = $rootScope.enableBeacons;
    $scope.toggleChange = function () {
      if (!noBLE) {
        $rootScope.enableBeacons = !$rootScope.enableBeacons;
        if ($rootScope.enableBeacons) {
          $rootScope.beacons = {};
          $rootScope.$broadcast('RI_FOUND');
        }
        console.log("enableBeacons new state: %s", $rootScope.enableBeacons);
      }
    }
  });
