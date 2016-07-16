'use strict';

angular.module('myAngularApp.views.user', []).config(function($routeProvider) {
  $routeProvider
  .when('/couple', {
    templateUrl: 'views/user/coupleAll.html',
    controller: 'CoupleCtrl'
  })
  .when('/couple/:coupleId', {
    templateUrl: 'views/couple/coupleDetail.html',
    controller: 'CoupleCtrl'
  });
})
.controller('CoupleCtrl', function ($scope, $timeout, $routeParams, $location, $q, srvData) {

  $scope.afterNavigationInitSpinnerShow = function() {
    $scope.navInit();
    $timeout(function() {
      alert("User config binding");
    },1000);
  };


  //------------------
  // Initialization

});
