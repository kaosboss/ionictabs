angular.module('starter.controllers', [])

// .controller('ChatsCtrl', function ($scope, Chats) {
//   // With the new view caching in Ionic, Controllers are only called
//   // when they are recreated or on app start, instead of every page change.
//   // To listen for when this page is active (for example, to refresh data),
//   // listen for the $ionicView.enter event:
//   //
//   //$scope.$on('$ionicView.enter', function(e) {
//   //});
//
//   $scope.chats = Chats.all();
//   $scope.remove = function (chat) {
//     Chats.remove(chat);
//   };
// })

  .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
  })
  // .module('timeLine.controllers', [])
  .controller('timeLineCtrl', function ($rootScope, $document, $timeout, $scope, $ionicScrollDelegate) {
    console.log("");
    //})

    //var ExampleCtrl = function($rootScope, $document, $timeout, $scope) {

    // var lorem = "Aqui está a familia Ramos num Domingo muito divertido e diferente!";
    //
    // $scope.side = 'left';
    //
    // $scope.events = [{
    //   badgeClass: 'mascoteAvatar',
    //   badgeIconClass: 'bg-dark',
    //   // badgeIconClass : 'ion-ionic',
    //   // badgeIconClass : 'avatar',
    //   title: 'Quinta Pedagógica',
    //   when: 'à 5 minutos',
    //   contentHtml: 'Bem vindo à Quinta Pedagógica do Sesimbra Natura Park, vou ser o teu guia.'
    // }, {
    //   badgeClass: 'bg-positive',
    //   // badgeIconClass : 'ion-gear-b',
    //   badgeIconClass: '',
    //   title: 'Descoberta!',
    //   when: 'à 12 minutos',
    //   titleContentHtml: '<img class="img-responsive" src="img/snp_projeto_02.jpg">',
    //   contentHtml: 'Encontraste a região da Chacra',
    //   footerContentHtml: '<a href="#/tab/regiao/RI_D/PI_16">ir para a região</a>'
    // }, {
    //   badgeClass: 'bg-balanced',
    //   // badgeIconClass : 'ion-person',
    //   title: 'Foto - Album',
    //   titleContentHtml: '<img class="img-responsive" src="img/atividades_quinta_pedagogica.jpg">',
    //   contentHtml: lorem,
    //   // footerContentHtml : '<a href="">Continue Reading</a>'
    // }];
    //
    // $scope.addEvent = function (img) {
    //   if (img) {
    //     $scope.events.push({
    //       badgeClass: 'bg-royal',
    //       // badgeIconClass : 'ion-checkmark',
    //       title: 'First heading',
    //       titleContentHtml: '<img class="img-responsive" src="' + img + '">',
    //       when: '3 hours ago via Twitter',
    //       contentHtml: 'Some awesome content.'
    //     });
    //   } else
    //     $scope.events.push({
    //       badgeClass: 'bg-royal',
    //       // badgeIconClass : 'ion-checkmark',
    //       title: 'First heading',
    //       when: '3 hours ago via Twitter',
    //       content: 'Some awesome content.'
    //     });
    //   $ionicScrollDelegate.resize();
    //
    // };
    // // optional: not mandatory (uses angular-scroll-animate)
    // $scope.animateElementIn = function ($el) {
    //   $el.removeClass('timeline-hidden');
    //   $el.addClass('bounce-in');
    // };
    //
    // // optional: not mandatory (uses angular-scroll-animate)
    // $scope.animateElementOut = function ($el) {
    //   $el.addClass('timeline-hidden');
    //   $el.removeClass('bounce-in');
    // };
    //
    // $scope.reExecuteAnimation = function () {
    //   TM = document.getElementsByClassName('tm');
    //   for (var i = 0; i < TM.length; i++) {
    //     removeAddClass(TM[i], 'bounce-in');
    //   }
    // }
    //
    // $scope.rePerformAnimation = function () {
    //   $scope.reExecuteAnimation();
    // }
    //
    // $scope.leftAlign = function () {
    //   $scope.side = 'left';
    //   $ionicScrollDelegate.resize();
    //
    //   $scope.reExecuteAnimation();
    // }
    //
    // $scope.rightAlign = function () {
    //   $scope.side = 'right';
    //   $ionicScrollDelegate.resize();
    //
    //   $scope.reExecuteAnimation();
    // }
    //
    // $scope.defaultAlign = function () {
    //   $scope.side = '';
    //   $ionicScrollDelegate.resize();
    //
    //   $scope.reExecuteAnimation();
    //   // or 'alternate'
    // }
  });


function hasClass(el, className) {
  if (el.classList)
    return el.classList.contains(className)
  else
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

function addClass(el, className) {
  if (el.classList)
    el.classList.add(className)
  else if (!hasClass(el, className)) el.className += " " + className
}

function removeClass(el, className) {
  if (el.classList)
    el.classList.remove(className)
  else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
    el.className = el.className.replace(reg, ' ')
  }
}

function removeAddClass(el, className) {
  removeClass(el, className)
  setTimeout(function () {
    addClass(el, className);
  }, 1)

};

