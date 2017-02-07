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
        $scope.loginErrMsgs = [];
        //Spinner - end

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
                    alert("Login PB :" + err);
                });

        };

        $scope.loginSignupANewUser = function (newUser) {

            $scope.loginInitSpinnerStopped = false;
            $scope.loginWaitForLoginRequest = true;
            srvDataContainer.login(newUser)
                .then(function (userStored) {
                    return $scope.navDataSync();
                })
                .then(function (err) {
                    if (err) return $q.reject(err);

                    $ionicNavBarDelegate.showBackButton(true);
                    $scope.navRedirect('/config/couple');
                })
                .catch(function (err) {
                    //alert("Login PB :" + err);
                    $scope.loginErrMsgs.push(err);
                })
                .finally(function (msg) {
                    $scope.loginInitSpinnerStopped = true;
                    $scope.loginWaitForLoginRequest = false;
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
