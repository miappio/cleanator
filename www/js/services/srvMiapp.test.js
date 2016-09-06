
function generateObjectUniqueId(){

    // new Date().toISOString();
    //return null;
    var now = new Date();
    var simpleDate = ""+now.getYear()+""+now.getMonth()+""+now.getDate()+""+now.getHours()+""+now.getMinutes()+""+now.getSeconds();
    //var sequId = ++_srvDataUniqId;
    //var UId = appName.charAt(0)+"_"+type.substring(0,4)+"_"+name.substring(0,4)+'_'+simpleDate+'_'+sequId;
    return simpleDate;
}


describe('srvMiapp', function () {
'use strict';

    var log = null, q = null, rootScope = null;
    var appName = "miappIO";
    var uriMiappLocal = "http://localhost:3000/api";
    var login = 'miappTest' + generateObjectUniqueId();
    var password = "miappPassword";
    var mockUser = {email: login, miappUserId : login};
    var updateProperties = {
        age : 4,
        location : 'london'
    };


    describe('basics', function () {

        //beforeEach(module('myAngularApp'));
        beforeEach(function () {

            inject(function ($injector, _$log_, _$q_, _$rootScope_) {
                log = _$log_;//$injector.get('$log');
                q = _$q_;//$injector.get('$q');
                rootScope = _$rootScope_; //$injector.get('$rootScope');
            });

        });

        afterEach(function () {

        });


        it('should be correctly initialized', function () {

            var srv = new SrvMiapp(log, q);

            //expect(srv.isLoggedIn()).toBe(false);
            //expect(a4pAnalytics.mAnalyticsArray.length).toEqual(0);
            //expect(a4pAnalytics.mAnalyticsFunctionnalitiesArray.length).toEqual(0);
            expect(srv.miappClient).toBe(null);
            expect(srv.currentUser).toBe(null);

        });


        it('should trap error during initialisation', function (done) {

            var srv = new SrvMiapp(log, q);

            expect(srv.miappClient).toBe(null);
            expect(srv.currentUser).toBe(null);

            srv.login(login, password, updateProperties)
                .then(function (user) {
                    expect(user).toBeUndefined('because we should catch error');
                  })
                .catch(function (err) {
                    expect(err).toBe('not initialized');
                })
                .finally(function () {
                    done();
                });

            setTimeout(function () {
                rootScope.$apply();
            }, 2000);
        });
    });


    describe('queries', function () {

        var userId, service , httpBackend, timeout;
        beforeEach(function () {

            inject(function (_$log_, _$q_, _$rootScope_,_$httpBackend_, _$timeout_) {
                log = _$log_;//$injector.get('$log');
                q = _$q_;
                rootScope = _$rootScope_;
                httpBackend = _$httpBackend_;
                timeout = _$timeout_;

                service = new SrvMiapp(log, q);
                service.miappURI = uriMiappLocal;
                httpBackend.whenGET(/views\/*/).respond(200);

            });

        });

        afterEach(function () {

            if (userId) service.deleteUser(userId);
            service = null;

        });


        it('should login', function (done) {

            service.init(appName);
            expect(service.miappClient).not.toBe(null);
            expect(service.currentUser).toBe(null);

            service.login(login,password,updateProperties)
                .then(function (user) {
                    // console.log(user);
                    expect(user).not.toBeUndefined();
                    expect(user._id).not.toBeUndefined();
                    expect(service.currentUser).not.toBe(null);
                })
                .catch(function (err) {
                    expect(err).toBeUndefined();
                })
                .finally(function (err) {
                    done();
                });

            setTimeout(function () {
                rootScope.$apply();
            }, 2000);

        });

        it('should found user previously created', function (done) {


            service.init(appName);
            expect(service.currentUser).toBe(null);

            service.login(login,password,updateProperties)
                .then(function (user) {
                    console.log('then. received');
                    expect(user).not.toBeUndefined();
                    expect(service.currentUser).not.toBe(null);

                    userId = user._id;
                })
                .catch(function (err) {
                    console.log('catch. received');
                    expect(err).toBeUndefined('cause login should be without pb.');
                })
                .finally(function (user) {
                    console.log('finally. received');
                    done();
                });

            setTimeout(function () {
                rootScope.$apply();
            }, 2000);

        });


    });


    describe('pouchDB Wrapper', function () {

        var userId, service, httpBackend;
        var pouchDBMock;

        beforeEach(function () {
            inject(function ($injector, _$log_, _$q_, _$rootScope_, _$httpBackend_) {
                log = _$log_;
                q = _$q_;
                rootScope = _$rootScope_;
                httpBackend = _$httpBackend_;

                service = new SrvMiapp(log, q);
                service.miappURI = uriMiappLocal;
                httpBackend.whenGET(/views\/*/).respond(200);

                //tape = jasmine.createSpyObj('tape', ['allDocs', 'pause', 'stop', 'rewind']);
                //tape.allDocs();
                //tape.pause();
                //tape.rewind(0);
                pouchDBMock = {
                    allDocs: function(filter, callback) {
                        var response = {};
                        response.total_rows = 2;
                        response.rows = [];
                        for (var i=0; i < response.total_rows;i++) {
                            response.rows.push(mockUser);
                        }
                        return callback(null,response);
                    },
                    sync: function(pouchdbEndpoint,filter) {
                        var onFn = { on : function(status, callback) {
                            if (status === 'complete') callback('pouchDBMock is synced...');
                            return onFn;
                            }
                        };
                        return onFn;
                    }
                };
                //spyOn(pouchDBMock, 'allDocs');
                //spyOn(pouchDBMock, 'sync');
            });
        });
        afterEach(function () {
            if (userId) service.deleteUser(userId);
            service = null;
        });

        it('should catch exception without login', function (done) {
            var data = {};
            service.init(appName);
            service.isPouchDBEmpty(pouchDBMock)
                .then(function (ko) { expect(true).toBe(false,'should not be there'); })
                .catch(function (err) {
                    expect(err).toBe('DB search impossible. Need a user logged in. (null)');
                    return service.putInPouchDb(pouchDBMock,data);
                })
                .then(function (ko) { expect(true).toBe(false,'should not be there'); })
                .catch(function (err) {
                    expect(err).toBe('DB put impossible. Need a user logged in. (null)');
                    return service.putFirstUserInEmptyPouchDB(pouchDBMock,data);
                })
                .then(function (ko) { expect(true).toBe(false,'should not be there'); })
                .catch(function (err) {
                    expect(err).toBe('DB put impossible. Need a user logged in. (null)');
                })
                .finally(function (user) {
                    done();
                });

            setTimeout(function () {
                rootScope.$apply();
            }, 2000);

        });

        it('should test if db is empty or not', function (done) {

            service.init(appName);
            service.login(login,password,updateProperties)
                .then(function (user) {
                    expect(service.currentUser).not.toBe(null);
                    expect(service.currentUser.email).toBe(login);
                    return service.isPouchDBEmpty(pouchDBMock);
                })
                .then(function (bEmpty) {
                    expect(bEmpty).toBe(true,'should have an empty DB - just init');
                    pouchDBMock = {
                        allDocs: function(filter, callback) {
                            var response = {};
                            response.total_rows = 10;
                            return callback(null,response);
                        }
                    };
                    return service.isPouchDBEmpty(pouchDBMock);
                })
                .then(function (bEmpty) {
                    expect(bEmpty).toBe(false,'should be not empty');
                }) 
                .catch(function (err) {
                    expect(true).toBe(false,'Should not catch err: ' + err);
                })
                .finally(function (err) {
                    done();
                });

            setTimeout(function () {
                rootScope.$apply();
            }, 2000);

        });



        it('should have an empty db at init with', function (done) {

            service.init(appName);
            service.login(login,password,updateProperties)
                .then(function (user) {
                    expect(service.currentUser).not.toBe(null);
                    expect(service.currentUser.email).toBe(login);
                    return service.isPouchDBEmpty(pouchDBMock);
                })
                .then(function (bEmpty) {
                    //expect(pouchDBMock.allDocs).toHaveBeenCalled();
                    expect(bEmpty).toBe(true,'should have an empty DB - just init');
                    return service.syncPouchDb(pouchDBMock);
                })
                .then(function (err) {
                    //expect(pouchDBMock.sync).toHaveBeenCalled();
                    expect(err).toBeUndefined('should sync without any error');
                })
                .catch(function (err) {
                    expect(err).toBeUndefined('shouldn t catch anything');
                })
                .finally(function (user) {
                    done();
                });

            //var data = {};
            //service.putInPouchDb(pouchDB,data);
            //service.putFirstUserInEmptyPouchDB(pouchDB, data);

            setTimeout(function () {
                rootScope.$apply();
            }, 2000);

        });

    });


    /*
    describe('Testing a Controller that uses a Promise', function () {
        var $scope;
        var $q;
        var deferred;
        beforeEach(module('search'));
        beforeEach(inject(function($controller, _$rootScope_, _$q_, searchService) {
            $q = _$q_;
            $scope = _$rootScope_.$new();
            // We use the $q service to create a mock instance of defer
            deferred = _$q_.defer();

            // Use a Jasmine Spy to return the deferred promise
            spyOn(searchService, 'search').and.returnValue(deferred.promise);

            // Init the controller, passing our spy service instance
            $controller('SearchController', {
                $scope: $scope,
                searchService: searchService
            });
        }));
        it('should resolve promise', function () {
            // Setup the data we wish to return for the .then function in the controller
            deferred.resolve([{ id: 1 }, { id: 2 }]);

            // We have to call apply for this to work
            $scope.$apply();
            // Since we called apply, not we can perform our assertions
            expect($scope.results).not.toBe(undefined);
            expect($scope.error).toBe(undefined);
        });

        it('should reject promise', function () {
            // This will call the .catch function in the controller
            deferred.reject();

            // We have to call apply for this to work
            $scope.$apply();
            // Since we called apply, not we can perform our assertions
            expect($scope.results).toBe(undefined);
            expect($scope.error).toBe('There has been an error!');
        });
    });
    */
});
