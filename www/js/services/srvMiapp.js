'use strict';
/* global angular Miapp */

angular.module('srvMiapp', [])

.factory('srvMiapp', function ($log, $q) {
  return new SrvMiapp($log,$q);
});



var SrvMiapp = (function() {
'use strict';

    function Service($log,$q, srvLocalStorage, gettextCatalog) {

      this.$log = $log;
      this.$q = $q;
      this.$log.log('SrvMiapp - constructor');

      //this.localStorage = srvLocalStorage;
      //this.gettextCatalog = gettextCatalog;
     
      this.miappClient = null;
      this.miappMainUser = getObjectFromLocalStorage('miapp-main-user');
     
    }

/*
    Service.prototype.setUserLoggedIn = function (user) {
      this.configUserLoggedIn = user;
      //if (this.localStorage) this.localStorage.set('configUserLoggedIn', this.configUserLoggedIn);
    };
    Service.prototype.getUserLoggedIn = function () {
      
      //if (this.localStorage) this.localStorage.set('configUserLoggedIn', this.configUserLoggedIn);
      //var obj = getObjectFromLocalStorage('configUserLoggedIn');
      //this.configUserLoggedIn = obj || null;
      //return this.configUserLoggedIn;
    };
*/    
    
    
    Service.prototype.init = function (appName) {
      

      this.miappClient = new Miapp.Client({
        //orgName:'yourorgname',
        appName: appName
        //,logging: true // Optional - turn on logging, off by default
        //,buildCurl: true // Optional - turn on curl commands, off by default
      });
    };
    

  
    Service.prototype.userLogin = function (email, password, updateProperties, callback) {
      
      var defer = this.$q.defer;

      this.miappClient.login(email, password, updateProperties,
         function (err, user) {
            if (err){
                this.$log.error('User not created: ' + err);
                return defer.reject();
            } else {
                this.$log.info('User created');
                
                // The login call will return an OAuth token, which is saved
                // in the client. Any calls made now will use the token.
                // Once a user has logged in, their user object is stored
                // in the client and you can access it this way:
                var token = user.token;
                this.miappMainUser = user;
                setObjectFromLocalStorage('miapp-main-user', this.miappMainUser);
                
                return defer.resolve(user);
           }
         }
       );
       
       return defer.promise;
    };
    



  /*
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
      if (localStorage) localStorage.setItem(id,jsonObj);

      //console.log('retrievedObject: ', JSON.parse(retrievedObject));
      return jsonObj;
    }

    function getObjectFromLocalStorage(id){
      if(typeof(Storage) === "undefined") return null;

      // Retrieve the object from storage
      var retrievedObject = {};
      if (localStorage) retrievedObject = localStorage.getItem(id);
      var obj = JSON.parse(retrievedObject);

      //console.log('retrievedObject: ', JSON.parse(retrievedObject));
      return obj;
    }




    return Service;
})();
