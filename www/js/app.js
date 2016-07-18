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

.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {

  $ionicConfigProvider.tabs.position('top'); // other values: top
  $ionicConfigProvider.views.forwardCache(true);


  /*
  var client = new Miapp.Client({
    orgName:'yourorgname',
    appName:'sandbox',
    logging: true, // Optional - turn on logging, off by default
    buildCurl: true // Optional - turn on curl commands, off by default
  });


   When a new user wants to sign up in your app, simply create a form to catch their information, then use the `client.signup` method:

   // Method signature: client.signup(username, password, email, name, callback)
   client.signup('marty', 'mysecurepassword', 'marty@timetravel.com', 'Marty McFly',
   function (err, marty) {
   if (err){
   error('User not created');
   runner(step, marty);
   } else {
   success('User created');
   runner(step, marty);
   }
   }
   );


   ###To log a user in
   Logging a user in means sending the user's username and password to the server, and getting back an access (OAuth) token. You can then use this token to make calls to the API on the user's behalf. The following example shows how to log a user in and log them out:

   username = 'marty';
   password = 'mysecurepassword';
   client.login(username, password, function (err) {
   if (err) {
   // Error - could not log user in
   } else {
   // Success - user has been logged in

   // The login call will return an OAuth token, which is saved
   // in the client. Any calls made now will use the token.
   // Once a user has logged in, their user object is stored
   // in the client and you can access it this way:
   var token = client.token;

   // Then make calls against the API.  For example, you can
   // get the logged in user entity this way:
   client.getLoggedInUser(function(err, data, user) {
   if(err) {
   // Error - could not get logged in user
   } else {
   // Success - got logged in user

   // You can then get info from the user entity object:
   var username = user.get('username');
   }
   });
   }
   });

   If you need to change a user's password, set the `oldpassword` and `newpassword` fields, then call save:

   marty.set('oldpassword', 'mysecurepassword');
   marty.set('newpassword', 'mynewsecurepassword');
   marty.save(function(err){
   if (err){
   // Error - user password not updated
   } else {
   // Success - user password updated
   }
   });

   To log a user out, call the `logout` function:

   client.logout();

   // verify the logout worked
   if (client.isLoggedIn()) {
   // Error - logout failed
   } else {
   // Success - user has been logged out
   }
   */


});
