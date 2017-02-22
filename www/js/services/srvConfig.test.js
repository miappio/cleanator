describe('myAngularApp.services.srvConfig', function () {
    'use strict';

    describe('basics - new srvConfig', function () {


        var log, q, gettextCatalog, srvMiapp, rootScope, httpBackend, timeout;
        beforeEach(function () {
            inject(function ($injector, _$log_, _$q_, _$rootScope_) {//, _gettextCatalog_, _srvMiapp_) {
                log = _$log_;//$injector.get('$log');
                q = _$q_;//$injector.get('$q');
                rootScope = _$rootScope_;
            });
            window.localStorage.removeItem('configUserLoggedIn');

        });

        afterEach(function () {

        });


        it('should be correctly initialized', function () {

            var srv = new SrvConfig(log, q, null, null);

            // Login
            expect(srv.configUserLoggedIn).toBe(null, 'because of no login launched before.');
            var userStored = window.localStorage.getItem('configUserLoggedIn');
            expect(userStored).toBe(null, 'because of no login launched before.');
            expect(srv.isLoggedIn()).toBe(false, 'because of no login launched before.');

            // Lang

        });

        it('should return basic setters/getters', function () {

            var srv = new SrvConfig(log, q, null, null);

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

    describe('login - injected srvConfig', function () {

        var log, q, rootScope, srvConfig, srvDataContainer, miappService, $httpBackend, $timeout;
        var uriMiappLocal = "http://localhost:3000/api";

        beforeEach(module('myAngularApp'));
        beforeEach(function () {

            inject(function ($injector) {
                log = console;//$injector.get('$log');
                q = $injector.get('$q');
                srvConfig = $injector.get('srvConfig');
                miappService = $injector.get('MiappService');
                srvDataContainer = $injector.get('srvDataContainer');
                srvConfig.$log = log;
                rootScope = $injector.get('$rootScope');

                $httpBackend = $injector.get('$httpBackend');
                $httpBackend.whenGET(/views\/*/).respond(200);

                $timeout = $injector.get('$timeout');

            });

        });
        beforeEach(function () {
            return $httpBackend.flush();
        });

        afterEach(function () {
        });

        it('should be correctly injected', function () {
            expect(srvConfig.isLoggedIn()).toBe(false, 'cause app');
        });

        it('should async log a new user', function (done) {

            //$httpBackend.flush();
            var user = {_id: 'pouchdb_id', email: 'my@test.user', password: 'my.password'};

            srvConfig.setUserLoggedIn(user);
            expect(srvConfig.isLoggedIn()).toBe(true);
            expect(srvConfig.getUserLoggedIn().email).toBe(user.email);
            expect(srvConfig.getUserLoggedIn()._id).toBe(user._id);
            done();
        });

        it('should remove all db', function (done) {

            srvDataContainer.srvMiapp.miappService.currentUser = {};

            srvDataContainer.logout()
                .then(function (err) {
                    console.log('db destroy');
                    expect(err).toBeUndefined(err);
                    //todo more test on logout ?
                    done();
                })
                .catch(function (err) {
                    expect(err).toBe('no error supposed to be catched', err);
                    done.fail(err);
                });

            setTimeout(function () {
                rootScope.$apply();
                setTimeout(function () {
                    rootScope.$apply();
                    setTimeout(function () {
                        rootScope.$apply();
                        setTimeout(function () {
                            rootScope.$apply();
                            setTimeout(function () {
                                rootScope.$apply();
                                setTimeout(function () {
                                    rootScope.$apply();
                                }, 200);
                            }, 200);
                        }, 200);
                    }, 200);
                }, 200);
            }, 200);

        });
    });

});
