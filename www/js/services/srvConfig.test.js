

describe('srvConfig', function () {
'use strict';

    var log, q, gettextCatalog,srvMiapp,rootScope,httpBackend,timeout;
    var uriMiappLocal = "http://localhost:3000/api";

    beforeEach(module('myAngularApp'));
    beforeEach(function () {

        inject(function($injector) {
            log = $injector.get('$log');
            q = $injector.get('$q');
            gettextCatalog = $injector.get('gettextCatalog');
            srvMiapp = $injector.get('srvMiapp');
            rootScope = $injector.get('$rootScope');
            httpBackend = $injector.get('$httpBackend');
            timeout = $injector.get('$timeout');

            //rootScope.$apply();
            //httpBackend.flush();
            srvMiapp.miappURI = uriMiappLocal;
            httpBackend.whenGET(/views\/*/).respond(200);

        });

    });

    afterEach(function () {
        //httpBackend.verifyNoOutstandingExpectation();
        //httpBackend.verifyNoOutstandingRequest();
    });


    it('should be correctly initialized', function () {

        var srv = new SrvConfig(log,q,gettextCatalog,srvMiapp);

        //expect(srv.isLoggedIn()).toBe(false);
        //expect(a4pAnalytics.mAnalyticsArray.length).toEqual(0);
        //expect(a4pAnalytics.mAnalyticsFunctionnalitiesArray.length).toEqual(0);

    });


    it('should return correct getter', function () {

      var srv = new SrvConfig(log,q,gettextCatalog,srvMiapp);

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

    it('should async log a new user', function (done) {

        var srv = new SrvConfig(log, q, gettextCatalog, srvMiapp);

        var user = {email: 'my@test.user', password: 'my.password'};
        srv.setUserLoggedIn(user)
            .then(function (user) {
                expect(srv.isLoggedIn()).toBe(true);
                expect(srv.getUserLoggedIn().email).toBe(user.email);
                expect(srv.getUserLoggedIn().miappUserId).not.toBeUndefined();
                expect(srv.getUserLoggedIn().miappUserId).toBe(user._id);
            })
            .catch(function (err) {
                if (err.errors) { // validation errors
                    for (var field in err.errors) {
                        console.log('field:' + field);
                    }
                } else if (err.message){ // should be execution error without err.errors
                    for (var field in err.message) {
                        console.log('field:' + field);
                    }
                }

                expect(err).toBe('no error ?', err);
            })
            .finally(function (msg) {
                done();
            });

        setTimeout(function () {
            rootScope.$apply();
        }, 2000);


    });


});
