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
        //$ionicConfigProvider.views.forwardCache(true);
        $ionicConfigProvider.views.maxCache(0);

    })

    .run(function ($ionicPlatform, $rootScope, $state, $ionicHistory, gettextCatalog, MiappService, srvNavigation, srvData, miappId, miappSalt, demoMode) {

        $ionicPlatform.ready(function () {

            //alert('miapp.$ionicPlatform ready');
            //console.log('miapp.$ionicPlatform ready :', miappId);
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
            gettextCatalog.debug = demoMode;

            // miapp.io
            var demoHost = window.localStorage.getItem('cleanDemoHost'),
                demoDBHost = window.localStorage.getItem('cleanDemoDBHost'),
                options = {};
            if (!demoMode) options._forceOnline = true;
            if (demoHost) options._forceEndpoint = demoHost;
            if (demoDBHost) options._forceDBEndpoint = demoHost;

            MiappService.init(miappId, miappSalt, options);

            // app services
            srvData.init();
            srvNavigation.init($rootScope, $state, $ionicHistory);

        });

    });
