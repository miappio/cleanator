
angular.module('myAngularApp', [
    'ionic',
    //  'ngRoute',
    //  'ngResource',
    //  'angular-gestures',
    'angular.filter',
    //  'ngTouch',
    'chart.js',
    'MiappService',
    'miapp.services',
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
    .value('launched', new Date())

    .config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {

        //console.log('myAngularApp config');
        $ionicConfigProvider.tabs.position('top'); // other values: top
        $ionicConfigProvider.views.forwardCache(true);


    })

    .run(function ($ionicPlatform, gettextCatalog, MiappService, srvData, miappId, miappSalt, appForceOffline, appAuthEndpoint, appCouchDBEndpoint) {


        //console.log('myAngularApp run');
        $ionicPlatform.ready(function() {

            //console.log('$ionicPlatform ready');
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

            //miapp.io
            MiappService.init(miappId, miappSalt, !appForceOffline, appAuthEndpoint);

            srvData.init();

        });

        //gettextCatalog.currentLanguage = 'en_US';
        //gettextCatalog.setCurrentLanguage('en_US');
        //gettextCatalog.debug = true;

    });

