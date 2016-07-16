

angular.module('srvConfig', [])

.factory('srvConfig', function ($log, srvLocalStorage, gettextCatalog) {
  return new SrvConfig($log,srvLocalStorage, gettextCatalog);
});



var SrvConfig = (function() {
'use strict';

    function Service($log, srvLocalStorage, gettextCatalog) {

      this.$log = $log;
      this.$log.log('init');

      this.localStorage = srvLocalStorage;
      this.gettextCatalog = gettextCatalog;
      //this.configLoggedIn = false;
      this.configUserLoggedIn = null;
      //this.configAppFirstInitDone = false;
      this.configAppFirstInitLevel = 0;
      this.configAppFirstInitLevelMax = 3;

      // this.configUsersColors = [
      //   { id:"#333333",
      //     fill:"rgba(133,33,33,0.2)",
      //     stroke:"rgba(133,33,33,0.6)",
      //     hightlight:"rgba(133,133,33,1)"},
      //     {id:"#696969",
      //     fill:"rgba(69,69,169,0.2)",
      //     stroke:"rgba(69,69,169,0.4)",
      //     hightlight:"rgba(19,109,169,0.8)"}
      // ];

      // Init lang
      this.configLangs =  [
                            {title:'English', code:'en_US'},
                            {title:'Français', code:'fr_FR'}
                            //{title:'Espagnol', code:'es_ES'}
                          ];
      var lang = this.getConfigLang() ? this.getConfigLang().code : 'en_US';
      this.setConfigLang(lang);
    }

    Service.prototype.setUserLoggedIn = function (user) {
      this.configUserLoggedIn = user;
      setObjectFromLocalStorage('configUserLoggedIn',this.configUserLoggedIn);
      //if (this.localStorage) this.localStorage.set('configUserLoggedIn', this.configUserLoggedIn);
    };
    Service.prototype.getUserLoggedIn = function () {
      var obj = getObjectFromLocalStorage('configUserLoggedIn');
      this.configUserLoggedIn = obj || null;
      return this.configUserLoggedIn;
    };
    Service.prototype.isLoggedIn = function () {
      var user = this.getUserLoggedIn();
      var b = false;
      if (user) b = true;
      return b;
    };


    Service.prototype.getAppFirstInitLevel = function () {
      var obj = getObjectFromLocalStorage('configAppFirstInitLevel');
      this.configAppFirstInitLevel = obj || 0;
      return this.configAppFirstInitLevel;
    };
    Service.prototype.setAppFirstInitLevel = function (level) {
      this.configAppFirstInitLevel = level;
      setObjectFromLocalStorage('configAppFirstInitLevel',this.configAppFirstInitLevel);
    };
    Service.prototype.isAppFirstInitCompleted = function () {
      var level = this.getAppFirstInitLevel();
      var b = false;
      if (level == this.configAppFirstInitLevelMax) b = true;
      return b;
    };


    // @return langs formatted as [{title:'English', code:'en_US'},{}...]
    Service.prototype.getConfigLangs = function () {
      return this.configLangs;
    };
    // @return lang formatted as {title:'English', code:'en_US'}
    Service.prototype.getConfigLang = function () {
      var lang = getObjectFromLocalStorage('configLang');
      if (!lang) lang = this.configLangs[0];
      return lang;
    };
    Service.prototype.setConfigLang = function (lang) {
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
