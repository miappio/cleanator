

describe('srvConfig', function () {
'use strict';

    var log, q, gettextCatalog,srvMiapp,rootScope,httpBackend,timeout;
    var uriMiappLocal = "http://localhost:3000/api";
    var srvConfig;


    describe('basics', function () {


        //beforeEach(module('myAngularApp'));
        beforeEach(function () {
            inject(function ($injector, _$log_, _$q_, _$rootScope_){//, _gettextCatalog_, _srvMiapp_) {
                log = _$log_;//$injector.get('$log');
                q = _$q_;//$injector.get('$q');
                rootScope = _$rootScope_; //$injector.get('$rootScope');

                //gettextCatalog = _gettextCatalog_;
                //srvMiapp = _srvMiapp_;
            });

        });

        afterEach(function () {

        });


        it('should be correctly initialized', function () {

            //var srv = new SrvConfig(log, q);
            var srv = new SrvConfig(log,q,null,null);

            //expect(srv.isLoggedIn()).toBe(false);
            //expect(a4pAnalytics.mAnalyticsArray.length).toEqual(0);
            //expect(a4pAnalytics.mAnalyticsFunctionnalitiesArray.length).toEqual(0);
            //expect(srv.miappClient).toBe(null);
            //expect(srv.currentUser).toBe(null);

        });


    });

/*
    describe('login', function () {


        //beforeEach(module('myAngularApp'));
        beforeEach(function () {

            inject(function ($injector) {
                log = $injector.get('$log');
                q = $injector.get('$q');
                gettextCatalog = $injector.get('gettextCatalog');
                srvMiapp = $injector.get('srvMiapp');
                srvConfig = $injector.get('srvConfig');
                rootScope = $injector.get('$rootScope');
                httpBackend = $injector.get('$httpBackend');
                timeout = $injector.get('$timeout');

                //rootScope.$apply();
                //httpBackend.flush();
                srvMiapp.miappURI = uriMiappLocal;
                httpBackend.whenGET(/views\/* /).respond(200);

            });

        });

        afterEach(function () {
            //httpBackend.verifyNoOutstandingExpectation();
            //httpBackend.verifyNoOutstandingRequest();
        });


        it('should be correctly initialized', function () {

            //var srv = new SrvConfig(log,q,gettextCatalog,srvMiapp);

            expect(srvConfig.isLoggedIn()).toBe(false);
            //expect(a4pAnalytics.mAnalyticsArray.length).toEqual(0);
            //expect(a4pAnalytics.mAnalyticsFunctionnalitiesArray.length).toEqual(0);

        });


        it('should return correct getter', function () {

            //var srv = new SrvConfig(log,q,gettextCatalog,srvMiapp);

            srvConfig.setAppFirstInitLevel(0);
            expect(srvConfig.isAppFirstInitCompleted()).toBe(false);
            srvConfig.setAppFirstInitLevel(3);
            expect(srvConfig.isAppFirstInitCompleted()).toBe(true);


            srvConfig.setConfigLang('en_US');
            expect(srvConfig.getConfigLang().code).toBe('en_US');
            srvConfig.setConfigLang('fr_FR');
            expect(srvConfig.getConfigLang().code).toBe('fr_FR');
            srvConfig.setConfigLang('my_test_lang');
            expect(srsrvConfigv.getConfigLang()).not.toBe('my_test_lang');

        });

        it('should async log a new user', function (done) {

            //var srv = new SrvConfig(log, q, gettextCatalog, srvMiapp);

            var user = {email: 'my@test.user', password: 'my.password'};
            srvConfig.setUserLoggedIn(user)
                .then(function (user) {
                    expect(srvConfig.isLoggedIn()).toBe(true);
                    expect(srvConfig.getUserLoggedIn().email).toBe(user.email);
                    expect(srvConfig.getUserLoggedIn().miappUserId).not.toBeUndefined();
                    expect(srvConfig.getUserLoggedIn().miappUserId).toBe(user._id);
                })
                .catch(function (err) {
                    if (err.errors) { // validation errors
                        for (var field in err.errors) {
                            console.log('field:' + field);
                        }
                    } else if (err.message) { // should be execution error without err.errors
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
*/

});
