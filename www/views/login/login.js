angular
    .module('myAngularApp.views.login', [])

    .config(function ($stateProvider) {
        'use strict';

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'views/login/loginIn.html',
                controller: 'LoginCtrl'
            })
            .state('loading', {
                url: '/loading',
                templateUrl: 'views/login/loading.html',
                controller: 'LoadingCtrl'
            })
        ;

    })

    .controller('LoginCtrl', function ($scope, $log, $http, $q, $timeout, $ionicHistory, $ionicNavBarDelegate, srvDataContainer, demoMode, srvLocalStorage) {
        'use strict';

        $scope.demoMode = demoMode;
        $scope.userLoginEmail = '';

        $scope.loginInit = function () {

            var emailStored = srvLocalStorage.get('userLoginEmail');
            if (emailStored)
                $scope.userLoginEmail = emailStored;

            $ionicHistory.clearHistory();
            $ionicHistory.nextViewOptions({
                disableBack: true
            });

        };

        // Spinner
        $scope.loginInitSpinnerStopped = false;
        $scope.loginWaitForLoginRequest = false;
        $scope.afterNavigationInitSpinnerShow = function () {

            if (!$scope.loginWaitForLoginRequest) {
                $timeout(function () {
                    $scope.loginInitSpinnerStopped = true;
                }, 500);
            }
        };
        //Spinner - end


        $scope.loginErrCode = '';
        $scope.loginErrMsgs = [];

        $scope.loginSignupANewUser = function (newUser) {

            $scope.loginInitSpinnerStopped = false;
            $scope.loginWaitForLoginRequest = true;
            return srvDataContainer.login(newUser)
                .then(function (userStored) {
                    return $scope.navDataSync(srvDataContainer);
                })
                .then(function (err) {
                    if (err) return $q.reject(err);

                    $scope.loginInitSpinnerStopped = true;
                    $scope.loginWaitForLoginRequest = false;

                    // reset Errors
                    delete $scope.loginErrCode;
                    $scope.loginErrMsgs = [];

                    $ionicNavBarDelegate.showBackButton(true);
                    return $scope.navRedirect(srvDataContainer, 'config.couple');

                    // Stop the ion-refresher from spinning
                    //$scope.$broadcast('scroll.refreshComplete');
                })
                //.then(function (msg) {
                //    $state.reload();
                //})
                .catch(function (err) {

                    $scope.loginInitSpinnerStopped = true;
                    $scope.loginWaitForLoginRequest = false;

                    //console.log('loginErr : ', err);
                    if (err && err.name === '408') {
                        $scope.loginErrCode = 'loginBadConnection';
                        $scope.loginErrMsgs.push(err.name);
                        if (err && err.message) $scope.loginErrMsgs.push(err.message);
                    } else if (err && err.name === '0') {
                        $scope.loginErrCode = 'loginNoConnection';
                        $scope.loginErrMsgs.push('Timeout');
                    } else {
                        $scope.loginErrCode = 'loginBadCredential';
                        if (err && err.name) $scope.loginErrMsgs.push(err.name);
                        else if (err && err.message) $scope.loginErrMsgs.push(err.message);
                    }

                    // Stop the ion-refresher from spinning
                    //$scope.$broadcast('scroll.refreshComplete');
                });

        };

        $scope.loginInDemoMode = function () {
            var newUser = {};
            newUser.email = 'demo';
            newUser.password = 'demo';
            return $scope.loginSignupANewUser(newUser);
        };


        $scope.loginSubmit = function (email, password, validForm) {
            if (!validForm) return;

            var newUser = {};
            newUser.email = email;
            srvLocalStorage.set('userLoginEmail', email);

            newUser.password = password; //todo : offuscate or encrypt Pass;
            return $scope.loginSignupANewUser(newUser);
        };

        // Init
        $scope.loginInit();
        //if ($scope.navRedirect) $scope.navRedirect(srvDataContainer);

    })

    .controller('LoadingCtrl', function ($scope, $log, $q, $timeout, srvDataContainer) {
        'use strict';

        $scope.$on( "$ionicView.enter", function( scopes, states ) {
            //if( states.fromCache && states.stateName == "your view" ) {
                // do whatever

                //console.log('LoadingCtrl view ... ');
            //}
        });

        //console.log('LoadingCtrl ... ');

        if ($scope.navRedirect) $scope.navRedirect(srvDataContainer);

    })
;
