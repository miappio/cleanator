var myAngularApp = angular.module('myAngularApp', [
  'ionic',
//  'ngRoute',
//  'ngResource',
//  'angular-gestures',
  'angular.filter',
//  'ionic-material',
//  'ngTouch',
    'chart.js',
//    'chartjs',
//  'ngAnimate',
//  'ngSanitize',
  'ngLocale',
  'gettext',
  'myAngularApp.config',
  'myAngularApp.controllers',
  'myAngularApp.services',
  'myAngularApp.directives',
  'myAngularApp.filters',
  'myAngularApp.views'
  //'ptvTemplates'
])


//angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform, gettextCatalog) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  //gettextCatalog.currentLanguage = 'en_US';
  //gettextCatalog.setCurrentLanguage('en_US');
  gettextCatalog.debug = true;

})

.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider, srvMiapp) {

    $ionicConfigProvider.tabs.position('top'); // other values: top
    $ionicConfigProvider.views.forwardCache(true);
    
    srvMiapp.init('cleanator');

});
