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

  .controller('AccountCtrl', function ($rootScope, $scope, UserService) {
    $scope.BLE = true;
    $scope.enableBeacons = $rootScope.enableBeacons;

    $scope.$on("LOGGED_IN", function (userInfo) {
      console.log("AcountCTRL: logged_in event: ", userInfo);
      $scope.profile_name = userInfo.name;
      $scope.profile_email = userInfo.email;
      $scope.profile_photo = userInfo.picture;
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

    getProfile = function () {
      var tempUser = UserService.getUser();
      tempUser.then(function (res) {
        var userInfo = JSON.parse(res || '{}')
        console.log("Definicoes; GOT USER from user service", userInfo);
        if (userInfo.picture && userInfo.name && userInfo.email) {
          $scope.logged = true;
          console.log("USER: LOGGED: true");
          $scope.profile_name = userInfo.name;
          $scope.profile_email = userInfo.email;
          $scope.profile_photo = userInfo.picture;
        } else {
          $scope.logged = false;
          console.log("USER: LOGGED: false");
        }
      });
    };

    getProfile();

  });
