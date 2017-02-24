// hack
/*console.log('######HACK cordova : ', typeof cordova);
 if (typeof cordova !== 'undefined') {
 document.addEventListener('deviceready', function () {
 console.log('######HACK cordova  2: ');
 angular.bootstrap(document, ['myAngularApp']);
 console.log('######HACK cordova 3: ');
 }, false);
 }
 else {
 document.addEventListener('DOMContentLoaded', function () {
 console.log('######HACK cordova  4: ');
 angular.bootstrap(document, ['myAngularApp']);
 console.log('######HACK cordova  5: ');
 });
 }*/

angular
    .module('myAngularApp', [
        'ionic',
        'angular.filter',
        'chart.js',
        'MiappService',
        'miapp.services',
        'ngLocale',
        'ngCordova',
        'gettext',
        'myAngularApp.config',
        'myAngularApp.services',
        'myAngularApp.directives',
        'myAngularApp.filters',
        'myAngularApp.views'
    ])

    .value('launched', new Date())


    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

        //console.log('myAngularApp config');
        $ionicConfigProvider.tabs.position('top'); // other values: top
        $ionicConfigProvider.views.forwardCache(true);

    })

    .run(function ($ionicPlatform, $rootScope, $state, $ionicHistory, gettextCatalog, MiappService, srvNavigation, srvData, miappId, miappSalt, appForceOffline, appAuthEndpoint) {

        $ionicPlatform.ready(function () {

            //alert('miapp.$ionicPlatform ready');
            console.log('miapp.$ionicPlatform ready :', miappId, appAuthEndpoint);
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }

            gettextCatalog.currentLanguage = 'en_US';
            gettextCatalog.setCurrentLanguage('en_US');
            gettextCatalog.debug = true;

            // miapp.io
            MiappService.init(miappId, miappSalt, !appForceOffline, appAuthEndpoint);

            // app services
            srvData.init();
            srvNavigation.init($rootScope, $state, $ionicHistory);

        });

    });
