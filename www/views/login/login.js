

angular.module('myAngularApp.views.login', [])

//.config(['$routeProvider', function($routeProvider) {
.config(function($stateProvider, $urlRouterProvider) {
	'use strict';

	$stateProvider
	.state('login', {
		url: '/login',
		templateUrl: 'views/login/loginIn.html',
		controller: 'LoginCtrl'
	})
	;


})

.controller('LoginCtrl', function ($scope, $log, $http, $q, $location, $ionicHistory,$ionicNavBarDelegate, srvConfig, srvData) {
	'use strict';


	$scope.logInit = function() {

		$ionicHistory.clearHistory();
		$ionicHistory.nextViewOptions({
				disableBack: true
		});

	};

	$scope.loginSetLogin = function(user) {

		srvConfig.setUserLoggedIn(user)
            .then(function(user){

				$ionicNavBarDelegate.showBackButton(true);
				$scope.navRedirect('/config/couple');

			})
			.catch(function(err){
				alert("Login PB :"+err);
			});

	};

	$scope.loginSignupANewUser = function(newUser) {

		srvConfig.setUserLoggedIn(newUser)
			.then(function(userAuthorized){
				return srvData.putFirstUserInEmptyPouchDB(userAuthorized);
            })
			.then(function(userUpdated){
				return srvConfig.setUserLoggedIn(userUpdated);
            })
			.then(function(userStored) {
				return $scope.navDataSync();
			})
			.then(function(err) {
				if (err) return $q.reject(err);

				$ionicNavBarDelegate.showBackButton(true);
				$scope.navRedirect('/config/couple');
			})
			.catch(function(err){
				alert("Login PB :"+err);
			});

	};

	$scope.loginSubmit = function (email, password, validForm) {
		if (!validForm) return;

		//var userCols = srvData.User.columns;
		//var encryptPass = SHA256(password);
		//console.log('pass:'+encryptPass);


		//todo ex : ad3777ef69f1ddaec85d1115d012d5f4 ???

		srvData.User.findOneByEmail(email)
			.then(function(user){
				return $scope.loginSetLogin(user);
			})
			.catch(function(err){
				$log.log(err);
				var newUser = {};
				newUser.email = email;
				newUser.password = password; //encryptPass;
				return $scope.loginSignupANewUser(newUser);

			});
	};



	// Init
	$scope.logInit();
	if ($scope.navRedirect) $scope.navRedirect();

});
