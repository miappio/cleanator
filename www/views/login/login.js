angular
    .module('myAngularApp.views.login', [])

    .config(function ($stateProvider, $urlRouterProvider) {
        'use strict';

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'views/login/loginIn.html',
                controller: 'LoginCtrl'
            })
        ;

    })

    .controller('LoginCtrl', function ($scope, $log, $http, $q, $location, $timeout, $ionicHistory, $ionicNavBarDelegate, srvDataContainer) {
        'use strict';

        $scope.loginInit = function () {

            $ionicHistory.clearHistory();
            $ionicHistory.nextViewOptions({
                disableBack: true
            });

        };

        // Spinner
        $scope.loginInitSpinnerStopped = false;
        $scope.loginWaitForLoginRequest = false;
        $scope.afterNavigationInitSpinnerShow = function () {
            $scope.navInit();

            if (!$scope.loginWaitForLoginRequest) {
                $timeout(function () {
                    $scope.loginInitSpinnerStopped = true;
                }, 500);
            }
        };
        //Spinner - end


        $scope.loginErrCode = '';
        $scope.loginErrMsgs = [];

        /**
         * @deprecated
         * @param user
         */
        $scope.loginSetLogin = function (user) {

            srvDataContainer.login(user)
                .then(function (user) {

                    $ionicNavBarDelegate.showBackButton(true);
                    $scope.navRedirect('/config/couple');

                })
                .catch(function (err) {
                    console.log('loginErr : ', err);
                    if (err && err.name === '404') {
                        $scope.loginErrCode = 'loginBadConnection';
                    } else if (err && err.name === '0') {
                        $scope.loginErrCode = 'loginNoConnection';
                    } else {
                        $scope.loginErrCode = 'loginBadCredential';
                    }
                    $scope.loginErrMsgs.push(err.message ? err.message : err);
                });

        };

        $scope.loginSignupANewUser = function (newUser) {

            $scope.loginInitSpinnerStopped = false;
            $scope.loginWaitForLoginRequest = true;
            return srvDataContainer.login(newUser)
                .then(function (userStored) {
                    return $scope.navDataSync();
                })
                .then(function (err) {
                    if (err) return $q.reject(err);

                    $ionicNavBarDelegate.showBackButton(true);
                    $scope.navRedirect('/config/couple');
                })
                .catch(function (err) {
                    console.log('loginErr : ', err);
                    if (err && err.name === '404') {
                        $scope.loginErrCode = 'loginBadConnection';
                    } else if (err && err.name === '0') {
                        $scope.loginErrCode = 'loginNoConnection';
                    } else {
                        $scope.loginErrCode = 'loginBadCredential';
                    }
                    $scope.loginErrMsgs.push(err.message ? err.message : err);
                })
                .finally(function (msg) {
                    $scope.loginInitSpinnerStopped = true;
                    $scope.loginWaitForLoginRequest = false;
                    return $q.resolve();
                });

        };

        $scope.loginSubmit = function (email, password, validForm) {
            if (!validForm) return;

            var newUser = {};
            newUser.email = email;
            newUser.password = password; //todo : offuscate or encrypt Pass;
            return $scope.loginSignupANewUser(newUser);
        };

        // Init
        $scope.loginInit();
        if ($scope.navRedirect) $scope.navRedirect();

    });
