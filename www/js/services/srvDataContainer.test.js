

describe('myAngularApp.services.srvDataContainer', function () {
'use strict';


    describe('basics', function () {

        var log, q, http, gettextCatalog, srvData, srvConfig, srvMiapp, timeout, rootScope;
        var originalTimeout, $httpBackend, filterFilter, pouchDBMock;

        beforeEach(module('myAngularApp'));
        beforeEach(function () {

            inject(function ($injector) {
                log = $injector.get('$log');
                q = $injector.get('$q');
                http = $injector.get('$http');
                filterFilter = $injector.get('filterFilter');
                //gettextCatalog = $injector.get('gettextCatalog');
                srvData = $injector.get('srvData');
                srvConfig = $injector.get('srvConfig');
                srvMiapp = $injector.get('srvMiapp');
                rootScope = $injector.get('$rootScope');
                timeout = $injector.get('$timeout');
                $httpBackend = $injector.get('$httpBackend');
                $httpBackend.whenGET(/views.*/).respond(200, '');


                srvConfig.getUserLoggedIn = function () {
                    return {email: 'mock@user.com', miappUserId: 'myMockedUser'};
                };
                srvMiapp.currentUser = {
                    email: 'mock@user.com',
                    miappUserId: 'myMockedUser',
                    doc: {
                        docType: 'UserDocType',
                        _id: "myMockedUser",
                        email: 'mock@user.com',
                        miappUserId: 'myMockedUser'
                    }
                };
            });

        });

        afterEach(function () {});


        it('should be correctly initialized', function () {

            expect(log).toBeDefined();
            expect(q).toBeDefined();
            expect(filterFilter).toBeDefined();
            expect(srvData).toBeDefined();
            expect(srvConfig).toBeDefined();
            expect(srvMiapp).toBeDefined();
            expect(srvData.User).toBeDefined();

            var srv = new SrvDataContainer(log, q, http, filterFilter, srvData, srvConfig, srvMiapp);

            expect(srv.getChores().length).toBe(0);
        });
    });


    describe('injected', function () {


        var log, q, http, gettextCatalog, srvData, srvConfig, srvMiapp, timeout, rootScope;
        var originalTimeout, $httpBackend, filterFilter, pouchDBMock;

        var choreRefToCopy = {
            "_id": "choreFakeId",
            "choreName": "Vacuum",
            "choreCategoryName": "01_Chambre",
            "description": "Vacuum thoroughly (plinths, under carpets, underneath furniture ...)",
            "percent_AB": 50,
            "action": "Todo",
            "frequencyDays": 1,
            "timeInMn": 10,
            "choreDescriptionCat": "Aspirateur",
            "priority": 5,
            "priorityComputed": 5,
            "desactivate": false
        };
        var histoRefToCopy = {
            "choreName": "Vacuum",
            "choreCategoryName": "01_Chambre",
            "description": "Vacuum thoroughly (plinths, under carpets, underneath furniture ...)",
            "percent_AB": 50,
            "action": "Todo",
            "frequencyDays": 1,
            "timeInMn": 10,
            "choreDescriptionCat": "Aspirateur",
            "priority": 5,
            "priorityComputed": 5,
            "desactivate": false,
            'choreId': 'choreFakeId',
            'userId': '',
            'actionTodoDate': '',
            'actionDoneDate': '',
            'internalWeight': '',
            'internalLate': ''
        };
        var userA = {_id: 'userA', timeInMnPerWeekTodo: 200};
        var userB = {_id: 'userB', timeInMnPerWeekTodo: 300};


        var currentUser = {
            email: 'mock@user.com',
            miappUserId: 'myMockedUser',
            doc: {
                docType: 'UserDocType',
                _id: "myMockedUser",
                email: 'mock@user.com',
                miappUserId: 'myMockedUser'
            }
        };
        var currentCouple = {
            coupleName: 'mmyMockedCouple',
            miappUserId: 'myMockedUser',
            doc: {
                docType: 'CoupleDocType',
                _id: "myMockedCouple",
                coupleName: 'myMockedCouple',
                miappUserId: 'myMockedUser'
            }
        };
        var currentChore = {
            choreName: 'myMockedCchore',
            miappUserId: 'myMockedUser',
            doc: {
                docType: 'ChoreDocType',
                _id: "myMockedCchore",
                choreName: 'myMockedCchore',
                miappUserId: 'myMockedUser'
            }
        };
        var currentCategory = {
            categoryName: 'myMockedCategory',
            miappUserId: 'myMockedUser',
            doc: {
                docType: 'CategoryDocType',
                _id: "myMockedCchore",
                categoryName: 'myMockedCategory',
                miappUserId: 'myMockedUser'
            }
        };

        beforeEach(module('myAngularApp'));
        beforeEach(function () {

            //originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            //jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

            inject(function ($injector) {
                log = $injector.get('$log');
                q = $injector.get('$q');
                http = $injector.get('$http');
                filterFilter = $injector.get('filterFilter');
                //gettextCatalog = $injector.get('gettextCatalog');
                srvData = $injector.get('srvData');
                srvConfig = $injector.get('srvConfig');
                srvMiapp = $injector.get('srvMiapp');
                rootScope = $injector.get('$rootScope');
                timeout = $injector.get('$timeout');
                $httpBackend = $injector.get('$httpBackend');
                $httpBackend.whenGET(/views.*/).respond(200, '');
                //$httpBackend.whenGET(/data.*/).respond(200, '');
                function getData() {
                    //console.log('srvDataContainer.test getData');
                    var request = new XMLHttpRequest();
                    request.open('GET', '/base/www/data/init.en_US.json', false);
                    //request.open('GET', '.', false);
                    request.send(null);
                    //var request = {};
                    //request.status = 200;
                    //request.response = {test:'testtt'};
                    //console.log('srvDataContainer.test getData sent: '+request.status);
                    //console.log(request.response);
                    //return [request.status, request.response, {}];
                    return request.response;
                }

                $httpBackend.when('GET', 'data/init.en_US.json').respond(getData());
                //$httpBackend.whenGET('data/init.en_US.json').respond($resource('/www/data/init.en_US.json').query());

                srvConfig.getUserLoggedIn = function () {
                    return {email: 'mock@user.com', miappUserId: 'myMockedUser'};
                };

                srvMiapp.currentUser = currentUser;

                pouchDBMock = {
                    allDocs: function (filter, callback) {
                        //console.log('srdvDataContainer.test.pouchDBMock.allDocs');
                        var response = {};
                        response.total_rows = 8;
                        response.rows = [];

                        // 2 users
                        response.rows.push(srvMiapp.currentUser);
                        response.rows.push(srvMiapp.currentUser);

                        // 1 couple
                        response.rows.push(currentCouple);

                        // 3 chores
                        response.rows.push(currentChore);
                        response.rows.push(currentChore);
                        response.rows.push(currentChore);
                        // 1 category
                        response.rows.push(currentCategory);

                        return callback(null, response);
                    },
                    sync: function (pouchdbEndpoint, filter) {
                        var onFn = {
                            on: function (status, callback) {
                                if (status === 'complete') callback('pouchDBMock is synced...');
                                return onFn;
                            }
                        };
                        return onFn;
                    },
                    put: function (data, dataId, callback) {
                        var response = {};
                        response.ok = true;
                        response.id = dataId;
                        response.rev = 'fakeRev';
                        return callback(null, response);
                    }
                };
            });

        });

        beforeEach(function () {
            $httpBackend.flush();
        });

        afterEach(function () {

            //rootScope.$apply();
            //  timeout.flush();
            //rootScope.$digest();
            //jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;

            //$httpBackend.verifyNoOutstandingExpectation();
            //$httpBackend.verifyNoOutstandingRequest();
        });


        it('should be correctly initialized', function () {

            expect(log).toBeDefined();
            expect(q).toBeDefined();
            expect(filterFilter).toBeDefined();
            expect(srvData).toBeDefined();
            expect(srvConfig).toBeDefined();
            expect(srvMiapp).toBeDefined();
            expect(srvData.User).toBeDefined();

            var srv = new SrvDataContainer(log, q, http, filterFilter, srvData, srvConfig, srvMiapp);

            expect(srv.getChores().length).toBe(0);
        });

        it('should compute indicators', function () {

            var srv = new SrvDataContainer(log, q, http, filterFilter, srvData, srvConfig, srvMiapp);
            var indicators = srv.computeIndicators();
            expect(indicators.indicPercent).toEqual([0, 0]);
            expect(indicators.indicTimeSpent).toEqual([0, 0]);
            expect(indicators.indicUsersTimeAvailabity).toBe(0);
            expect(indicators.indicChoresTimeRequired).toBe(0);
            expect(indicators.indicChoresFeasibility).toBe(0);

            //inject chores and historics
            srv.chores = [choreRefToCopy, choreRefToCopy, choreRefToCopy, choreRefToCopy];
            var historicsDone = [];
            for (var i = 0; i < 3; i++) {
                var hist = angular.copy(histoRefToCopy);
                hist._id = i;
                hist.userId = (i == 1) ? userA._id : userB._id;
                historicsDone.push(hist);
            }
            srv.historicsDone = historicsDone;
            srv.userA = userA;
            srv.userB = userB;

            indicators = srv.computeIndicators();
            expect(indicators.indicPercent).toEqual([43, 57]);
            expect(indicators.indicTimeSpent).toEqual([10, 20]);
            expect(indicators.indicUsersTimeAvailabity).toBe(36);
            expect(indicators.indicChoresTimeRequired).toBe(40);
            expect(indicators.indicChoresFeasibility).toBe(0.89);

        });

        it('should catch error with a bad init', function (done) {

            srvConfig.getUserLoggedIn = function () {
                return null;
            };
            srvMiapp.currentUser = null;
            var srv = new SrvDataContainer(log, q, http, filterFilter, srvData, srvConfig, srvMiapp);
            //console.log(srvConfig.getUserLoggedIn());
            expect(srv.isLoggedIn()).toBe(false, 'should be not well loggin');

            srv.sync()
                .then(function (err) {
                    expect(true).toBe(false, 'should not pass here : ' + err);
                })
                .catch(function (err) {
                    expect(err).toBe('Need one user logged in.');

                    //Launch another sync with a login but not db
                    srvConfig.getUserLoggedIn = function () {
                        return {email: 'mock@user.com', miappUserId: 'myMockedUser'};
                    };
                    srvMiapp.currentUser = {email: 'mock@user.com', miappUserId: 'myMockedUser'};
                    srvData.db = null;

                    return srv.sync();
                })
                .then(function (err) {
                    expect(true).toBe(false, 'should not pass here : ' + err);
                })
                .catch(function (err) {
                    expect(err).toBe('DB search impossible. Need a user logged in. ([object Object])', 'cause of no valid pouchDB');

                }).finally(function (err) {
                    done();
                });

            timeout.flush(200);
        });


        it('should init first data', function (done) {
            var srv = new SrvDataContainer(log, q, http, filterFilter, srvData, srvConfig, srvMiapp);
            expect(srv.isLoggedIn()).toBe(true);

            srv.srvData.db = pouchDBMock;
            var user = srvConfig.getUserLoggedIn();

            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();

            srv.initWithFirstData('en_US',user)
                .then(function (err) {

                    expect(err).toBeUndefined('should not catch error : ' + err);
                    expect(srv.getChores()).toBeDefined('Need chores');
                    expect(srv.getChores().length).toBe(0,'No data is stored in db - need a sync.');
                    expect(srv.getCategories()).toBeDefined('Need chore Categories');
                    expect(srv.getCategories().length).toBe(0,'No data is stored in db - need a sync.');
                })
                .catch(function (err) {
                    expect(true).toBe(false, 'should not catch error : ' + err);
                })
                .finally(function (err) {
                    done();
                });

            $httpBackend.flush();
        });

        it('should bind first data', function (done) {

            srvData.getUserAFromCouple = function(couple){return q.resolve(currentUser);};
            srvData.getUserBFromCouple = function(couple){return q.resolve(currentUser);};

            var srv = new SrvDataContainer(log, q, http, filterFilter, srvData, srvConfig, srvMiapp);
            expect(srv.isLoggedIn()).toBe(true);

            srv.srvData.db = pouchDBMock;

            srv.sync().then(function (err) {
                expect(err).toBeUndefined('should not resolve error ' + err);

                expect(srv.getUserA()).toBeDefined('Need first User');
                expect(srv.getUserB()).toBeDefined('Need second User');
                expect(srv.getCouple()).toBeDefined('Need Couple');
                expect(srv.getChores()).toBeDefined('Need Chores');
                expect(srv.getChores().length).toBe(3);
                expect(srv.getCategories()).toBeDefined('Need chore Categories');
                expect(srv.getCategories().length).toBe(1);
            }).catch(function (err) {
                expect(true).toBe(false, 'should not catch error : ' + err);
            }).finally(function (err) {
                done();
            });

            timeout.flush(200);
        });


    });




        /*


         sync
         isLoggedIn
         logout
         reset
         getLastResetDate
         getUserA
         getCouple
         getUserB
         getChores
         getCategories
         getHistoricsDone
         getChoreCategoryName
         getChoreCategoryThumbPath
         computeTodoForOneUser
         computeTodoForAllUsers
         computeIndicators

            it('should return correct getter', function (done) {

              var srv = new SrvDataContainer(log, q, srvData, srvConfig);

              var user = {name:'test',email:'test'};
              srvConfig.setUserLoggedIn(user);
              srvData.setUserLoggedIn(user);
              expect(srvData.getUserLoggedIn().email).toBe(user.email);


              var testEmployee = function(employee) {
                  console.log('sync done');
                    expect(employee.name).toBe(mockEmployee.name);
                    expect(employee.id).toBe(mockEmployee.id);
              };

              var failTest = function(error) {
                console.log('sync err:'+error);
                expect(error).toBeUndefined();
              };


              //srv.sync()
              //      .then(testEmployee)
              //      .catch(failTest)
              //      .finally(done);

              $httpBackend.flush();
              //rootScope.$digest();
                //rootScope.$apply();

            });
            */

});
