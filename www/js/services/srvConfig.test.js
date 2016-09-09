

describe('myAngularApp.services.srvConfig', function () {
'use strict';


    describe('basics', function () {


        var log, q, gettextCatalog,srvMiapp,rootScope,httpBackend,timeout;
        //beforeEach(module('myAngularApp'));
        beforeEach(function () {
            inject(function ($injector, _$log_, _$q_, _$rootScope_){//, _gettextCatalog_, _srvMiapp_) {
                log = _$log_;//$injector.get('$log');
                q = _$q_;//$injector.get('$q');
                rootScope = _$rootScope_; //$injector.get('$rootScope');

                //gettextCatalog = _gettextCatalog_;
                //srvMiapp = _srvMiapp_;
            });


            window.localStorage.removeItem('configUserLoggedIn');

        });

        afterEach(function () {

        });


        it('should be correctly initialized', function () {

            var srv = new SrvConfig(log,q,null,null);

            // Login
            expect(srv.configUserLoggedIn).toBe(null,'because of no login launched before.');
            var userStored = window.localStorage.getItem('configUserLoggedIn');
            expect(userStored).toBe(null, 'because of no login launched before.');
            expect(srv.isLoggedIn()).toBe(false,'because of no login launched before.');

            // Lang

        });

        it('should return basic setters/getters', function () {

            var srv = new SrvConfig(log,q,null,null);

            // App Level
            srv.setAppFirstInitLevel(0);
            expect(srv.isAppFirstInitCompleted()).toBe(false);
            srv.setAppFirstInitLevel(3);
            expect(srv.isAppFirstInitCompleted()).toBe(true);

            // Langs
            srv.setConfigLang('en_US');
            expect(srv.getConfigLang().code).toBe('en_US');
            srv.setConfigLang('fr_FR');
            expect(srv.getConfigLang().code).toBe('fr_FR');
            srv.setConfigLang('my_test_lang');
            expect(srv.getConfigLang()).not.toBe('my_test_lang');

        });


    });


    describe('login', function () {


        var log, q, rootScope, srvConfig, $httpBackend, $timeout;
        var uriMiappLocal = "http://localhost:3000/api";

        beforeEach(module('myAngularApp'));
        beforeEach(function () {

            inject(function ($injector) {
                log = $injector.get('$log');
                q = $injector.get('$q');
                srvConfig = $injector.get('srvConfig');
                rootScope = $injector.get('$rootScope');

                $httpBackend = $injector.get('$httpBackend');
                $httpBackend.whenGET(/views\/*/).respond(200);

                $timeout = $injector.get('$timeout');
                //rootScope.$apply();
                //httpBackend.flush();
                //srvMiapp.miappURI = uriMiappLocal;

            });

        });
        beforeEach(function(){
            $httpBackend.flush();
            srvConfig.logout();
        })

        afterEach(function () {
            //$httpBackend.verifyNoOutstandingExpectation();
            //$httpBackend.verifyNoOutstandingRequest();
            //$httpBackend.flush();
        });


        it('should be correctly injected', function () {
            expect(srvConfig.isLoggedIn()).toBe(false,'cause app');
        });

        it('should async log a new user', function (done) {

            //$httpBackend.flush();
            var user = { _id : 'pouchdb_id', email: 'my@test.user', password: 'my.password'};
            srvConfig.setUserLoggedIn(user)
                .then(function (user) {

                    //console.log('recieved user: '+user.email);
                    expect(srvConfig.isLoggedIn()).toBe(true);
                    expect(srvConfig.getUserLoggedIn().email).toBe(user.email);
                    expect(srvConfig.getUserLoggedIn().miappUserId).toBe(user._id);
                    expect(srvConfig.getUserLoggedIn().miappUserId).toBe('pouchdb_id','mock user stored');
                    done();
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
                    done();
                });

            //rootScope.$digest();
            //$httpBackend.flush();
            //setTimeout(function () {
              //  rootScope.$apply();
                $timeout.flush(500);

            //}, 2000);


        });
    });


});
