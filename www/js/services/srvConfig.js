

angular.module('srvConfig', [])

.factory('srvConfig', function ($log, $q, gettextCatalog, srvMiapp) {
  return new SrvConfig($log,$q, gettextCatalog, srvMiapp);
});



var SrvConfig = (function (){
//'use strict';

    function service ($log, $q, gettextCatalog, srvMiapp) {

        this.$log = $log;
        this.$q = $q;
        this.$log.log('srvConfig - init');
        this.srvMiapp = srvMiapp;
        this.srvMiappInitDone = false;

        this.gettextCatalog = gettextCatalog;
        this.configUserLoggedIn = null;
        this.configAppFirstInitLevel = 0;
        this.configAppFirstInitLevelMax = 3;

        // Init lang
        this.configLangs =  [
                        {title:'English', code:'en_US'},
                        {title:'Français', code:'fr_FR'}
                        //{title:'Espagnol', code:'es_ES'}
                      ];
        var lang = this.getConfigLang() ? this.getConfigLang().code : 'en_US';
        this.setConfigLang(lang);
    }



    service.prototype.logout = function () {

        this.configUserLoggedIn = null;
        var ret = removeObjectFromLocalStorage('configUserLoggedIn');
    }
    service.prototype.setUserLoggedIn = function (user) {
        var self = this;
        var defer = self.$q.defer();

        var login = user.email;
        var password = user.password;
        self.$log.log('srvConfig.setUserLoggedIn : '+user.email);

        var mergeAndStoreUser = function(userToMerge){
            if (!self.configUserLoggedIn) self.configUserLoggedIn = angular.copy(userToMerge);
            for (var attrname in userToMerge) { self.configUserLoggedIn[attrname] = userToMerge[attrname]; }
            if (userToMerge._id) self.configUserLoggedIn.miappUserId = userToMerge._id;
            setObjectFromLocalStorage('configUserLoggedIn',self.configUserLoggedIn);
        };

        if(self.srvMiapp && !self.srvMiappInitDone) {
            self.$log.log('srvConfig.setUserLoggedIn with srvMiapp');
            self.srvMiapp.login(login, password, {})
                .then(function(miappUser){

                    self.$log.log('srvConfig.setUserLoggedIn srvMiapp received: '+ miappUser.email);
                    for (var attrname in user) { miappUser[attrname] = user[attrname]; }
                    mergeAndStoreUser(user);
                    self.srvMiappInitDone = true;
                    defer.resolve(self.configUserLoggedIn);
                })
                .catch(function(err){
                    defer.reject(err);
                });
        }
        else {
            self.$log.log('srvConfig.setUserLoggedIn standalone');
            mergeAndStoreUser(user);
            return self.$q.resolve(self.configUserLoggedIn);
        }

        return defer.promise;
    };
    service.prototype.getUserLoggedIn = function () {
      var obj = getObjectFromLocalStorage('configUserLoggedIn');
      this.configUserLoggedIn = obj || null;
      return this.configUserLoggedIn;
    };
    service.prototype.isLoggedIn = function () {
      var user = this.getUserLoggedIn();
      var b = false;
      if (user) b = true;
      return b;
    };


    service.prototype.getAppFirstInitLevel = function () {
      var obj = getObjectFromLocalStorage('configAppFirstInitLevel');
      this.configAppFirstInitLevel = obj || 0;
      return this.configAppFirstInitLevel;
    };
    service.prototype.setAppFirstInitLevel = function (level) {
      this.configAppFirstInitLevel = level;
      setObjectFromLocalStorage('configAppFirstInitLevel',this.configAppFirstInitLevel);
    };
    service.prototype.isAppFirstInitCompleted = function () {
      var level = this.getAppFirstInitLevel();
      var b = false;
      if (level == this.configAppFirstInitLevelMax) b = true;
      return b;
    };


    // @return langs formatted as [{title:'English', code:'en_US'},{}...]
    service.prototype.getConfigLangs = function () {
      return this.configLangs;
    };
    // @return lang formatted as {title:'English', code:'en_US'}
    service.prototype.getConfigLang = function () {
      var lang = getObjectFromLocalStorage('configLang');
      if (!lang) lang = this.configLangs[0];
      return lang;
    };
    service.prototype.setConfigLang = function (lang) {
      //var langCode = 'en_US';
      var langObj = null;
      for (var i=0; i < this.configLangs.length && !langObj; i++){
        var langIt = this.configLangs[i];
        if (lang == langIt.code) langObj = langIt;
      }

      if (this.gettextCatalog && langObj) this.gettextCatalog.setCurrentLanguage(langObj.code);//'en';
      if (langObj) setObjectFromLocalStorage('configLang',langObj);
    };



    //Local Storage utilities
    function setObjectFromLocalStorage(id, object){
      if(typeof(Storage) === "undefined") return null;

      var jsonObj = JSON.stringify(object);
      // Retrieve the object from storage
      window.localStorage.setItem(id,jsonObj);

      //self.$log.log('retrievedObject: ', JSON.parse(retrievedObject));
      return jsonObj;
    }

    function getObjectFromLocalStorage(id){
        if(typeof(Storage) === "undefined") return null;

        // Retrieve the object from storage
        var retrievedObject = window.localStorage.getItem(id);
        var obj = JSON.parse(retrievedObject);

        //self.$log.log('retrievedObject: ', JSON.parse(retrievedObject));
        return obj;
    }
    function removeObjectFromLocalStorage(id){
        if(typeof(Storage) === "undefined") return null;

        // Retrieve the object from storage and remove it
        return window.localStorage.removeItem(id);
    }






    return service;
})();
