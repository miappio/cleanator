

angular.module('myAngularApp.views.login', [])

//.config(['$routeProvider', function($routeProvider) {
.config(function($stateProvider, $urlRouterProvider) {
	'use strict';
	// $routeProvider
	// .when('/login', {
	// 	templateUrl: 'views/login/loginIn.html',
	// 	//template: '<h1>Login!</h1>',
	// 	controller: 'LoginCtrl'
	// });



	$stateProvider
	.state('login', {
		url: '/login',
		templateUrl: 'views/login/loginIn.html',
		controller: 'LoginCtrl'
	})
	// .state('signin', {
	// 	url: '/sign-in',
	// 	templateUrl: 'templates/sign-in.html',
	// 	controller: 'SignInCtrl'
	// })
	// .state('forgotpassword', {
	// 	url: '/forgot-password',
	// 	templateUrl: 'templates/forgot-password.html'
	// })
	;


})

.controller('LoginCtrl', function ($scope,$http, $location, $ionicHistory,$ionicNavBarDelegate, srvConfig, srvData) {
	'use strict';


	$scope.logInit = function() {

		$ionicHistory.clearHistory();
		//$ionicHistory.clearCache();
		$ionicHistory.nextViewOptions({
				disableBack: true
		});
		//$ionicNavBarDelegate.showBackButton(false);
		//srvConfig.setConfigLang('en_US');
	};

	$scope.loginSetLogin = function(user) {

		srvData.setUserLoggedIn(user);
		srvConfig.setUserLoggedIn(user);
		//$scope.setAppLogin(true);
		//$scope.navJustLogin();

		$ionicNavBarDelegate.showBackButton(true);
		$scope.navRedirect('/config/couple');
	};

	$scope.loginSubmit = function (email, password, validForm) {
		if (!validForm) return;

		var userCols = srvData.User.columns;
		var encryptPass = SHA256(password);
		//console.log('pass:'+encryptPass);



    srvData.User.findOneByEmail(email)
		.then(function(user){
			if (password)
				$scope.loginSetLogin(user);
			else {
					console.log('Bad user / password');
				}
		})
		.catch(function(err){
				// Set a new user
				var newUser = {};
				newUser[userCols.email] = email;
				newUser[userCols.password] = encryptPass;
			//srvData.User.set(newUser)
			//.then(function(user){
				$scope.loginSetLogin(newUser);
			//})
			//.catch(function(err){
			//	alert("Bad login :"+err);
			//});
		});
	};



	// Init
	$scope.logInit();
	if ($scope.navRedirect) $scope.navRedirect();

});
