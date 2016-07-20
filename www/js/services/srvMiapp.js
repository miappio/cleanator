angular.module('srvMiapp', []).factory('srvMiapp', function ($log,$q) {
  return new SrvMiapp($log,$q);
});



var SrvMiapp = (function() {
'use strict';

    function Service($log, $q) {

        this.$log = $log;
        this.$q = $q;
        this.$log.log('SrvMiapp - init');

        this.miappClient = null;
        this.currentUser = null;
    }



    Service.prototype.init = function (appName) {

        this.miappClient = new Miapp.Client({
            orgName: 'miappio',
            appName: appName,
            logging: true, // Optional - turn on logging, off by default
            buildCurl: false // Optional - turn on curl commands, off by default
        });

    };


    Service.prototype.login = function (login, password, updateProperties) {
        var defer = this.$q.defer();

        if (!this.miappClient) {
            return this.$q.reject('not initialized');
            //return defer.promise;
        }

        this.miappClient.loginMLE(login, password, updateProperties, function (err, user) {
            console.log('callback done :' + err);
            if (err) {
                // Error - could not log user in
                return defer.reject(err);
            } else {
                // Success - user has been logged in
                this.currentUser = user;
                setObjectFromLocalStorage('miappCurrentUser',this.currentUser);
                return defer.resolve(user);
            }
        });

        return defer.promise;
    };


    /*
    Service.prototype.setAppFirstInitLevel = function (level) {

        var obj = getObjectFromLocalStorage('configAppFirstInitLevel');
        this.configAppFirstInitLevel = obj || 0;
        return this.configAppFirstInitLevel;


        this.configAppFirstInitLevel = level;
        setObjectFromLocalStorage('configAppFirstInitLevel',this.configAppFirstInitLevel);
    };
    Service.prototype.isAppFirstInitCompleted = function () {
      var level = this.getAppFirstInitLevel();
      var b = false;
      if (level == this.configAppFirstInitLevelMax) b = true;
      return b;
    };

    //
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



    //Local Storage utilities
    function setObjectFromLocalStorage(id, object){
      if(typeof(Storage) === "undefined") return null;

      var jsonObj = JSON.stringify(object);
      // Retrieve the object from storage
      localStorage.setItem(id,jsonObj);

      //console.log('retrievedObject: ', JSON.parse(retrievedObject));
      return jsonObj;
    }

    function getObjectFromLocalStorage(id){
      if(typeof(Storage) === "undefined") return null;

      // Retrieve the object from storage
      var retrievedObject = localStorage.getItem(id);
      var obj = JSON.parse(retrievedObject);

      //console.log('retrievedObject: ', JSON.parse(retrievedObject));
      return obj;
    }






    return Service;
})();
