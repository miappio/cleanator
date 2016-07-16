
// Controllers

angular.module('myAngularApp.controllers', [
                    'crtl.Navigation'])

.controller('DashCtrl', function($scope) {

  //------------------
  // Initialization
  if ($scope.navRedirect) $scope.navRedirect();

})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});



// Demonstrate how to register services
// In this case it is a simple value service.
//myAngularApp.module('myAngularApp.services', []).
//  value('version', '0.1');



//var serviceModule = angular.module('myAngularApp.services', ['angular-data.DS', 'angular-data.DSCacheFactory']);

//
// // Providers
// // ie https://docs.angularjs.org/guide/providers
// serviceModule.value('appVersion', '0.1');
//
// serviceModule.factory('srvAnalytics', function ($log,srvData) {
//   return new srvAnalytics($log, srvData,'UA-33541085-XXXXX');
// });
//
// //
// // serviceModule.factory('srvData', function ($rootScope,$q,$resource,$log,DS,DSHttpAdapter,DSCacheFactory) {
// //
// //   return new srvData($rootScope,$q,$resource,$log,DS,DSHttpAdapter,DSCacheFactory);
// //
// //   //return DS.defineResource('srvData');
// // });
//
// serviceModule.factory('srvCordova', function ($document, $q) {
//   return new srvCordova($document, $q);
// });


// Services
