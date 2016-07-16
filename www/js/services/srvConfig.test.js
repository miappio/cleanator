

describe('srvConfig', function () {
'use strict';

    var log = null, gettextCatalog = null;

    beforeEach(module('myAngularApp'));
    beforeEach(function () {

      inject(function($injector) {
        log = $injector.get('$log');
        gettextCatalog = $injector.get('gettextCatalog');
      });

    });

    afterEach(function () {
    });


    it('should be correctly initialized', function () {

        var srv = new SrvConfig(log, gettextCatalog);

        //expect(srv.isLoggedIn()).toBe(false);
        //expect(a4pAnalytics.mAnalyticsArray.length).toEqual(0);
        //expect(a4pAnalytics.mAnalyticsFunctionnalitiesArray.length).toEqual(0);

    });


    it('should return correct getter', function () {

      var srv = new SrvConfig(log, gettextCatalog);
      var user = {name:'new user'};
      srv.setUserLoggedIn(null);
      expect(srv.isLoggedIn()).toBe(false);
      srv.setUserLoggedIn(user);
      expect(srv.isLoggedIn()).toBe(true);

//setAppFirstInitLevel
//isAppFirstInitCompleted

      srv.setAppFirstInitLevel(0);
      expect(srv.isAppFirstInitCompleted()).toBe(false);
      srv.setAppFirstInitLevel(3);
      expect(srv.isAppFirstInitCompleted()).toBe(true);


      srv.setConfigLang('en_US');
      expect(srv.getConfigLang().code).toBe('en_US');
      srv.setConfigLang('fr_FR');
      expect(srv.getConfigLang().code).toBe('fr_FR');
      srv.setConfigLang('my_test_lang');
      expect(srv.getConfigLang()).not.toBe('my_test_lang');

    });

});
