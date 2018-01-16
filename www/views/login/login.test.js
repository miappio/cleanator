xdescribe('myAngularApp.views.login', function () {
    'use strict';
    var _httpBackend, _scope, _log, _q, _rootScope, _timeout, _routeParams, _srvData, _controller, _createController, _authRequestHandler;
    var _http, _location, _cookieStore, _authorization, _api, _srvCordova, _srvConfig;
    var _ionicHistory, _ionicNavBarDelegate, _srvDataContainer, _srvMiapp;
    var _mockUser = {
        email: 'mock@user.com',
        miappUserId: 'myMockedUser',
        _id: "myMockedUser",
        doc: {
            docType: 'UserDocType',
            _id: "myMockedUser",
            email: 'mock@user.com',
            miappUserId: 'myMockedUser'
        }
    };

    function _checkXHRDigest(xhrUrls) {
        // Digest flush
        var filo = '';
        for (var i = xhrUrls.length; i > 0; i--) {
            var url = xhrUrls[i - 1];
            var todo = '';
            //todo +='request = jasmine.Ajax.requests.mostRecent();';
            //if (url === 'undefined') todo += 'expect(request).toBeUndefined();';
            //else todo += 'expect(request.url).toBe("' + url + '");';
            todo += 'if (_rootScope) {_rootScope.$apply();}';
            //todo += 'if (_httpBackend) {_httpBackend.flush();}';


            filo = 'setTimeout(function() {' + todo + filo + '},200);';
        }
        //filo = 'var request = jasmine.Ajax.requests.mostRecent();' + filo;

        return eval(filo);
    }

    var myAngularApp = angular.module('myLoginApp', [
        'ionic',
        'angular.filter',
        'chart.js',
        'MiappService',
        'miapp.services',
        'ngLocale',
        'ngCordova',
        'gettext',
        'myAngularApp.config',
        'myAngularApp.services',
        'myAngularApp.directives',
        'myAngularApp.filters',
        'myAngularApp.views'
    ])
        .run(function (MiappService) {
            // init service
            window.localStorage.removeItem('miappCurrentUser');
            window.localStorage.removeItem('miappIsOffline');
            window.localStorage.removeItem('miappURL');
            window.localStorage.removeItem('miappDBURL');

            MiappService.init('myLoginApp'); // todo , 'salt', true, 'http://fakesite.com/api');
        })
        .config(function () {
            //console.log('myAngularApp config');
        });

    beforeEach(module('myLoginApp'));
    beforeEach(function (done) {
        inject(function ($injector) {

            _httpBackend = $injector.get('$httpBackend');
            _rootScope = $injector.get('$rootScope');
            _scope = _rootScope.$new();
            _q = $injector.get('$q');
            _timeout = $injector.get('$timeout');
            _log = console;//$injector.get('$log');
            _http = $injector.get('$http');
            _location = $injector.get('$location');
            _controller = $injector.get('$controller');
            _ionicHistory = $injector.get('$ionicHistory');
            _ionicNavBarDelegate = $injector.get('$ionicNavBarDelegate');
            _srvMiapp = $injector.get('MiappService');
            _srvDataContainer = $injector.get('srvDataContainer');
            _createController = function () {
                //$scope, $log, $http, $q, $timeout, $ionicHistory, $ionicNavBarDelegate, srvDataContainer
                return _controller('LoginCtrl', {
                    $scope: _scope,
                    $log: _log,
                    $http: _http,
                    $q: _q,
                    $timeout: _timeout,
                    $ionicHistory: _ionicHistory,
                    $ionicNavBarDelegate: _ionicNavBarDelegate,
                    srvDataContainer: _srvDataContainer
                });
            };

            // Custo
            _httpBackend.whenGET(/views.*/).respond(200, '');
            _srvMiapp.miappService.logger = console;
            _srvDataContainer.$log = console;
            _srvDataContainer.logout().finally(done);
            _rootScope.$apply();
            //_httpBackend.flush();
        })
    });

    afterEach(function () {
        _httpBackend.verifyNoOutstandingExpectation(false);
        _httpBackend.verifyNoOutstandingRequest();
    });

    //var _originalTimeout;
    //beforeEach(function () {
    //    _originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    //    jasmine.DEFAULT_TIMEOUT_INTERVAL = 9500;
    //});
    //afterEach(function () {
    //    jasmine.DEFAULT_TIMEOUT_INTERVAL = _originalTimeout;
    //});

    xit('should set loginNoConnection error msg from Internet Connection Pb (a fake site unreachable)', function (done) {
        var controller = _createController();
        expect(controller).toBeDefined();
        expect(_srvDataContainer.isLoggedIn()).toBe(false);
        expect(_scope.loginErrCode).toBe('');
        expect(_scope.loginErrMsgs).toBeDefined();
        expect(_scope.loginErrMsgs.length).toBe(0);

        // mocks :
        _scope.navDataSync = function () {
            return _q.resolve();
        };
        _scope.navRedirect = function () {
            return _q.resolve();
        };
        _scope.loginSubmit(_mockUser.email, 'password', true)
            .then(function (msg) {
                expect(msg).toBeUndefined();
                expect(_scope.loginInitSpinnerStopped).toBe(true);
                expect(_scope.loginWaitForLoginRequest).toBe(false);
                expect(_scope.loginErrCode).toBe('loginNoConnection');
                expect(_scope.loginErrMsgs).toBeDefined();
                expect(_scope.loginErrMsgs.length).toBe(1);
                expect(_scope.loginErrMsgs[0]).toBe('Timeout');
                done();
            })
            .catch(function (err) {
                done.fail(err);
            });

        // Digest flush
        _timeout.flush(200);
        //var ret = _checkXHRDigest(['undefined', 'undefined', 'undefined']);
    });

    describe('with ajax mock', function () {

        beforeEach(function () {
            jasmine.Ajax.install();
        });

        afterEach(function () {
            jasmine.Ajax.uninstall();
        });


        describe('should set loginBadConnection msg from /api/users : On Timeout (miapp is down)', function () {

            beforeEach(function () {
                jasmine.clock().install();
            });

            afterEach(function () {
                jasmine.clock().uninstall();
            });

            it('408', function (done) {
                var controller = _createController();
                expect(controller).toBeDefined();
                expect(_srvDataContainer.isLoggedIn()).toBe(false);
                expect(_scope.loginErrCode).toBe('');
                expect(_scope.loginErrMsgs).toBeDefined();
                expect(_scope.loginErrMsgs.length).toBe(0);

                // mocks :
                _httpBackend.whenGET(/views.*/).respond(200, '');
                _scope.navDataSync = function () {
                    return _q.resolve();
                };
                _scope.navRedirect = function () {
                    return _q.resolve();
                };
                jasmine.Ajax.stubRequest(/.*api\/users.*/).andTimeout();

                _scope.loginSubmit(_mockUser.email, 'password', true)
                    .then(function (msg) {
                        expect(msg).toBeUndefined();
                        expect(_scope.loginInitSpinnerStopped).toBe(true);
                        expect(_scope.loginWaitForLoginRequest).toBe(false);
                        expect(_scope.loginErrCode).toBe('loginBadConnection');
                        expect(_scope.loginErrMsgs).toBeDefined();
                        expect(_scope.loginErrMsgs.length).toBe(2);
                        expect(_scope.loginErrMsgs[0]).toBe('408');
                        expect(_scope.loginErrMsgs[1]).toBe('Miapp.io SDK request fail.');
                        done();
                    })
                    .catch(function (err) {
                        done.fail(err);
                    });

                // Digest flush
                //var ret = _checkXHRDigest(['undefined', 'undefined', 'undefined']);

            });
        });

        it('should set loginBadCredential msg from /api/users : 404 ()', function (done) {
            var controller = _createController();
            expect(controller).toBeDefined();
            expect(_srvDataContainer.isLoggedIn()).toBe(false);
            expect(_scope.loginErrCode).toBe('');
            expect(_scope.loginErrMsgs).toBeDefined();
            expect(_scope.loginErrMsgs.length).toBe(0);

            // mocks :
            _httpBackend.whenGET(/views.*/).respond(200, '');
            _scope.navDataSync = function () {
                return _q.resolve();
            };
            _scope.navRedirect = function () {
                return _q.resolve();
            };
            jasmine.Ajax.stubRequest(/.*api\/users.*/).andReturn({
                "status": 404,
                "contentType": 'text/plain',
                "responseText": ''//JSON.stringify(_mockUser)
            });

            _scope.loginSubmit(_mockUser.email, 'password', true)
                .then(function (msg) {
                    expect(msg).toBeUndefined();
                    expect(_scope.loginInitSpinnerStopped).toBe(true);
                    expect(_scope.loginWaitForLoginRequest).toBe(false);
                    expect(_scope.loginErrCode).toBe('loginBadCredential');
                    expect(_scope.loginErrMsgs).toBeDefined();
                    expect(_scope.loginErrMsgs.length).toBe(2);
                    expect(_scope.loginErrMsgs[0]).toBe('408');
                    expect(_scope.loginErrMsgs[1]).toBe('Miapp.io SDK request fail.');
                    done();
                })
                .catch(function (err) {
                    done.fail(err);
                });

            // Digest flush
            var ret = _checkXHRDigest(['undefined', 'undefined', 'undefined']);

        });

        it('should set loginBadCredential msg from /api/users : 400 (unautorized)', function (done) {
            var controller = _createController();
            expect(controller).toBeDefined();
            expect(_srvDataContainer.isLoggedIn()).toBe(false);
            expect(_scope.loginErrCode).toBe('');
            expect(_scope.loginErrMsgs).toBeDefined();
            expect(_scope.loginErrMsgs.length).toBe(0);

            // mocks :
            _httpBackend.whenGET(/views.*/).respond(200, '');
            _scope.navDataSync = function () {
                return _q.resolve();
            };
            _scope.navRedirect = function () {
                return _q.resolve();
            };
            jasmine.Ajax.stubRequest(/.*api\/users.*/).andReturn({
                "status": 400,
                "contentType": 'text/plain',
                "responseText": ''//JSON.stringify(_mockUser)
            });

            // try to login
            _scope.loginSubmit(_mockUser.email, 'password', true)
                .then(function (msg) {
                    expect(_scope.loginInitSpinnerStopped).toBe(true);
                    expect(_scope.loginWaitForLoginRequest).toBe(false);
                    expect(_scope.loginErrCode).toBe('loginBadCredential');
                    expect(_scope.loginErrMsgs).toBeDefined();
                    expect(_scope.loginErrMsgs.length).toBe(1);
                    expect(_scope.loginErrMsgs[0]).toBe('400');
                    expect(msg).toBeUndefined();
                    done();
                })
                .catch(function (err) {
                    done.fail(err);
                });

            // Digest flush
            var ret = _checkXHRDigest(['undefined', 'undefined', 'undefined']);
        });

        it('should set loginBadCredential msg from /api/auth : 401 (unautorized)', function (done) {
            var controller = _createController();
            expect(controller).toBeDefined();
            expect(_srvDataContainer.isLoggedIn()).toBe(false);
            expect(_scope.loginErrCode).toBe('');
            expect(_scope.loginErrMsgs).toBeDefined();
            expect(_scope.loginErrMsgs.length).toBe(0);

            // mocks :
            _httpBackend.whenGET(/views.*/).respond(200, '');
            _scope.navDataSync = function () {
                return _q.resolve();
            };
            _scope.navRedirect = function () {
                return _q.resolve();
            };
            jasmine.Ajax.stubRequest(/.*api\/users.*/).andReturn({
                "status": 202,
                "contentType": 'text/plain',
                "responseText": JSON.stringify(_mockUser)
            });
            jasmine.Ajax.stubRequest('http://fakesite.com/api/auth').andReturn({
                status: 401,
                "responseText": 'no auth...'
            });

            // try to login
            _scope.loginSubmit(_mockUser.email, 'password', true)
                .then(function (msg) {
                    expect(_scope.loginInitSpinnerStopped).toBe(true);
                    expect(_scope.loginWaitForLoginRequest).toBe(false);
                    expect(_scope.loginErrCode).toBe('loginBadCredential');
                    expect(_scope.loginErrMsgs).toBeDefined();
                    expect(_scope.loginErrMsgs.length).toBe(1);
                    expect(_scope.loginErrMsgs[0]).toBe('401');
                    expect(msg).toBeUndefined();
                    done();
                })
                .catch(function (err) {
                    done.fail(err);
                });

            // Digest flush
            var ret = _checkXHRDigest(['undefined', 'undefined']);

        });

    });

});
