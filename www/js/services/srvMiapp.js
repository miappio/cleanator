'use strict';
/* global angular Miapp */

angular.module('srvMiapp', [])

.factory('srvMiapp', function ($log, $q) {
  return new SrvMiapp($log,$q);
});



var SrvMiapp = (function() {
'use strict';

    function Service($log, $q) {

        this.$log = $log;
        this.$q = $q;
        //this.$timeout = $timeout;
        this.$log.log('SrvMiapp - init');

        this.miappClient = null;
        this.currentUser = null;

        this.miappId = null;
        this.miappSalt = 'SALT_TOKEN';
        this.miappOrg = null;
        this.miappAppVersion = null;
        this.miappURI = 'https://miapp.io/api';
        this.miappTestURI = null;
    }



    Service.prototype.init = function (miappId, miappSalt, istest) {

        this.miappIsTest = (istest == true) ? true : false;
        if (!this.miappIsTest) {
            this.miappClient = new Miapp.Client({
                orgName: 'miappio',
                appName: miappId,
                logging: true, // Optional - turn on logging, off by default
                buildCurl: false, // Optional - turn on curl commands, off by default
                URI : this.miappTestURI || this.miappURI
            });
        }


        this.miappId = miappId;
        this.miappOrg = null;
        this.miappAppVersion = null;

    };
    
    Service.prototype.setEndpoint = function (endpointURI) {
        this.miappTestURI = endpointURI + '/api';
    };


    Service.prototype.login = function (login, password, updateProperties) {
        var self = this;
        var defer = self.$q.defer();

        if ((!self.miappClient || !CryptoJS) && !self.miappIsTest) {
            return self.$q.reject('not initialized');
        }

        // TODO encrypting and salt stuff
        var encrypted = CryptoJS.AES.encrypt(password, 'SALT_TOKEN');
        var encrypted_json_str = encrypted.toString();
        self.$log.log('miappClient.loginMLE : '+ login+ ' / '+ encrypted_json_str);
        
        if (self.miappIsTest) {
            var testUser = {};
            self.currentUser = testUser;
            self.currentUser.email = login;
            self.currentUser.password = encrypted_json_str;
            setObjectFromLocalStorage('miappCurrentUser',self.currentUser);
            return self.$q.resolve(self.currentUser);
        }

        self.miappClient.loginMLE(self.miappId, login,encrypted_json_str,updateProperties,function (err, user) {
            // self.$log.log('callback done :' + err + ' user:' + user);
            if (err) {
                // Error - could not log user in
                self.$log.error('miappClient.loginMLE err : '+ err);
                return defer.reject(err);
            } else {
                // Success - user has been logged in
                self.currentUser = user;
                self.currentUser.email = login;
                setObjectFromLocalStorage('miappCurrentUser',self.currentUser);
                return defer.resolve(self.currentUser);
            }
        });

        return defer.promise;
    };

    
    

    Service.prototype.deleteUser = function (userIDToDelete) {
        var self = this;
        var defer = self.$q.defer();
        
        if (self.miappIsTest) {
            return self.$q.resolve(null);
        }

        if (!self.miappClient) {
            return self.$q.reject('not initialized');
        }
        

        self.miappClient.deleteUserMLE(userIDToDelete,function (err) {
            // self.$log.log('deleteUserMLE callback done :' + err);
            if (err) {
                // Error - could not log user in
                return defer.reject(err);
            } else {
                // Success - user has been logged in
                self.currentUser = null;
                setObjectFromLocalStorage('miappCurrentUser',self.currentUser);
                return defer.resolve(self.currentUser);
            }
        });

        return defer.promise;
    };


    Service.prototype.syncPouchDb = function(pouchDB){
        var self = this;
        var deferred = self.$q.defer();
        self.$log.log('syncPouchDb ..');
        
        if (self.miappIsTest) {
            return self.$q.resolve();
        }
        
        var pouchdbEndpoint = self.miappClient ? self.miappClient.getEndpoint() : null;
        if (!self.currentUser || !self.currentUser.email || !pouchdbEndpoint || !pouchDB)
            return self.$q.reject('DB sync impossible. Need a user logged in. (' + pouchdbEndpoint + ' -' + self.currentUser+')');

        self.$log.log('syncPouchDb call');
        pouchDB.sync(pouchdbEndpoint,{

            filter : function(doc){
                if (doc.appUser_Id == self.currentUser.email) return doc;
                }
            }).on('complete', function (info) {
                self.$log.log("db complete : "+info);
                deferred.resolve();
            })
            .on('error', function (err) {
                self.$log.log("db error : "+err);
                deferred.reject(err);
            }).on('change', function (info) {
                self.$log.log("db change : "+ info);
            }).on('paused', function (err) {
                self.$log.log("db paused : "+err);
            }).on('active', function () {
                self.$log.log("db activate");
            }).on('denied', function (info) {
                self.$log.log("db denied : "+info);
                deferred.reject("db denied : "+info);
            });

        return deferred.promise;
    };


    Service.prototype.putInPouchDb = function(pouchDB, data){
        var self = this;
        var deferred = self.$q.defer();
        
        if (!self.currentUser || !self.currentUser._id || !pouchDB)
            return self.$q.reject('DB put impossible. Need a user logged in. (' + self.currentUser+')');

        data.miappUserId = self.currentUser._id;
        data.miappOrgId = self.appName;
        data.miappAppVersion = self.appVersion;

        var dataId = data._id;
        if (!dataId) dataId = generateObjectUniqueId(self.appName);
        delete data._id;
        pouchDB.put(data, dataId, function(err, response) {
            if (response && response.ok && response.id && response.rev) {
                data._id = response.id;
                data._rev = response.rev;
                self.$log.log("updatedData: "+data._id+" - "+data._rev);
                return deferred.resolve(data);
            }
            return deferred.reject(err);
        });
        return deferred.promise;
    };

    var _srvDataUniqId = 0;
    function generateObjectUniqueId(appName, type, name){
    
        //return null;
        var now = new Date();
        var simpleDate = ""+now.getYear()+""+now.getMonth()+""+now.getDate()+""+now.getHours()+""+now.getMinutes();//new Date().toISOString();
        var sequId = ++_srvDataUniqId;
        var UId = '';
        if (appName && appName.charAt(0)) UId += appName.charAt(0);
        if (type && type.length > 3) UId += type.substring(0,4);
        if (name && name.length > 3) UId += name.substring(0,4);
        UId += simpleDate+'_'+sequId;
        return UId;
    }

/* todo ?
    Service.prototype._dbFilter= function(doc){
        var dataUserLoggedIn = this.getUserLoggedIn();
        if (doc.miappUserId == dataUserLoggedIn.email)
            return doc;
        return null;
    };
    */


    Service.prototype.isPouchDBEmpty = function (pouchDB) {
        var self = this;
        var deferred = self.$q.defer();
        self.$log.log('isPouchDBEmpty ..');
        if (!pouchDB) {//if (!self.currentUser || !self.currentUser.email || !pouchDB) {
            var error = 'DB search impossible. Need a user logged in. (' + self.currentUser + ')';
            self.$log.error(error);
            return self.$q.reject(error);
        }

        self.$log.log('isPouchDBEmpty call');
        pouchDB.allDocs({
                filter : function(doc){
                    if (!self.currentUser) return doc;
                    if (doc.miappUserId == self.currentUser._id) return doc;
                }
            },function(err, response) {
                self.$log.log('isPouchDBEmpty callback');
                if (err) return deferred.reject(err);

                if (response && response.total_rows && response.total_rows > 5) return deferred.resolve(false);

                self.$log.log('isPouchDBEmpty callback: '+ response.total_rows);
                return deferred.resolve(true);

            });
        return deferred.promise;
    };

    Service.prototype.putFirstUserInEmptyPouchDB = function (pouchDB, firstUser) {
        var self = this;
        var deferred = self.$q.defer();
        if (!firstUser || !self.currentUser || !self.currentUser.email || !pouchDB)
            return self.$q.reject('DB put impossible. Need a user logged in. (' + self.currentUser+')');

        var loggedUser = self.currentUser;
        var firstUserId = firstUser._id;
        if (!firstUserId) firstUserId = self.currentUser._id;
        if (!firstUserId) firstUserId = generateObjectUniqueId(self.appName,'user');
        
        firstUser.miappUserId = firstUserId;
        firstUser.miappOrgId = self.appName;
        firstUser.miappAppVersion = self.appVersion;
        delete firstUser._id;
        pouchDB.put(firstUser, firstUserId, function(err, response) {
            if (response && response.ok && response.id && response.rev) {
                firstUser._id = response.id;
                firstUser._rev = response.rev;
                self.$log.log("firstUser: "+firstUser._id+" - "+firstUser._rev);
                return deferred.resolve(firstUser);
            }
            return deferred.reject(err);
        });
        return deferred.promise;

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
      //if(typeof(Storage) === "undefined") return null;

      var jsonObj = JSON.stringify(object);
      // Retrieve the object from storage
      if (window.localStorage) window.localStorage.setItem(id,jsonObj);

      //this.$log.log('retrievedObject: ', JSON.parse(retrievedObject));
      return jsonObj;
    }

    function getObjectFromLocalStorage(id){
      //if(typeof(Storage) === "undefined") return null;

      // Retrieve the object from storage
      var retrievedObject;
      if (window.localStorage) retrievedObject = window.localStorage.getItem(id);
      var obj = JSON.parse(retrievedObject);

      //this.$log.log('retrievedObject: ', JSON.parse(retrievedObject));
      return obj;
    }





    return Service;
})();
