describe('myAngularApp.services.srvDataContainer', function () {
    'use strict';


    describe('basics', function () {

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
        var userA = {
            _id: 'userA', timeInMnPerWeekTodo: 300,
            timeInMnPerMond: 35,
            timeInMnPerTues: 36,
            timeInMnPerWedn: 37,
            timeInMnPerThur: 38,
            timeInMnPerFrid: 39,
            timeInMnPerSatu: 40,
            timeInMnPerSund: 41
        };
        var userB = {
            _id: 'userB', timeInMnPerWeekTodo: 200,
            timeInMnPerMond: 22,
            timeInMnPerTues: 23,
            timeInMnPerWedn: 24,
            timeInMnPerThur: 25,
            timeInMnPerFrid: 26,
            timeInMnPerSatu: 27,
            timeInMnPerSund: 28
        };

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
                srvMiapp = $injector.get('MiappService');
                rootScope = $injector.get('$rootScope');
                timeout = $injector.get('$timeout');
                $httpBackend = $injector.get('$httpBackend');
                $httpBackend.whenGET(/views.*/).respond(200, '');


                srvConfig.getUserLoggedIn = function () {
                    return {_id: "myMockedUser", email: 'mock@user.com', miappUserId: 'myMockedUser'};
                };
                srvMiapp.miappService.currentUser = {
                    _id: "myMockedUser",
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

        afterEach(function () {
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
            expect(indicators.indicPercent).toEqual([25, 75]);
            expect(indicators.indicTimeSpent).toEqual([10, 20]);
            expect(indicators.indicUsersTimeAvailabity).toBe(71);
            expect(indicators.indicChoresTimeRequired).toBe(40);
            expect(indicators.indicChoresFeasibility).toBe(1.79);

        });


        it('should compute historics', function () {

            var srv = new SrvDataContainer(log, q, http, filterFilter, srvData, srvConfig, srvMiapp);
            srv.userA = userA;
            srv.userB = userB;

            var userId = userA._id;
            var now = new Date("January 03, 2016 11:13:00");
            var hDone = srv.getHistoricsDone(userId);
            expect(hDone).toEqual([]);

            var time = srv.getHistoricsDoneTimeRemaining(userId, now);
            expect(time).toEqual(41);


            //inject chores and historics
            srv.chores = [choreRefToCopy, choreRefToCopy, choreRefToCopy, choreRefToCopy];
            var historicsDone = [];
            for (var i = 0; i < 4; i++) {
                var hist = angular.copy(histoRefToCopy);
                hist._id = i;
                hist.userId = (i == 1) ? userB._id : userA._id;
                hist.actionTodoDate = new Date(Date.UTC(2016,0,i));
                hist.actionDoneDate = new Date(Date.UTC(2016,0,i+1));
                historicsDone.push(hist);
            }
            srv.historicsDone = historicsDone;
            srv.historicsTodo2 = historicsDone;

            hDone = srv.getHistoricsDone(userId);
            expect(hDone.length).toEqual(3);

            time = srv.getHistoricsDoneTimeRemaining(userId, now);
            expect(time).toEqual(31);

            var todos = srv.getHistoricsTodo(userId, now);
            expect(todos.length).toEqual(1);



        });


    });


    // --------------------------------

    // --------------------------------

    describe('injected', function () {


        var log, q, http, gettextCatalog, srvData, srvDataContainer, srvConfig, srvMiapp, timeout, rootScope;
        var originalTimeout, $httpBackend, filterFilter, pouchDBMock;


        var currentUser = {
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

            inject(function ($injector) {
                log = console;//$injector.get('$log');
                q = $injector.get('$q');
                http = $injector.get('$http');
                filterFilter = $injector.get('filterFilter');
                srvData = $injector.get('srvData');
                srvDataContainer = $injector.get('srvDataContainer');
                srvDataContainer.$log = log;
                srvConfig = $injector.get('srvConfig');
                window.localStorage.removeItem('configLang');
                srvConfig.getUserLoggedIn = function () {
                    return {_id: "myMockedUser", email: 'mock@user.com', miappUserId: 'myMockedUser'};
                };
                srvMiapp = $injector.get('MiappService');
                srvMiapp.miappService.logger = console;
                srvMiapp.miappService.currentUser = currentUser;
                rootScope = $injector.get('$rootScope');
                timeout = $injector.get('$timeout');
                $httpBackend = $injector.get('$httpBackend');
                $httpBackend.whenGET(/views.*/).respond(200, '');
                function getData() {
                    var request = new XMLHttpRequest();
                    request.open('GET', '/base/www/data/init.en_US.json', false);
                    request.send(null);
                    return request.response;
                }

                $httpBackend.when('GET', 'data/init.en_US.json').respond(getData());


                pouchDBMock = {
                    allDocs: function (filter, callback) {
                        console.log('srvDataContainer.test.pouchDBMock.allDocs');
                        var response = {};
                        response.total_rows = 8;
                        response.rows = [];

                        // 2 users
                        response.rows.push(srvMiapp.miappService.currentUser);
                        response.rows.push(srvMiapp.miappService.currentUser);

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
                    put: function (data, callback) {
                        var response = {};
                        response.ok = true;
                        response.id = data._id;
                        response.rev = 'fakeRev';
                        return callback(null, response);
                    },
                    info: function () {
                        return q.resolve({doc_count: 8});
                    }
                };
            });

        });

        beforeEach(function () {
            return $httpBackend.flush();
        });

        afterEach(function () {
        });


        it('should be correctly initialized', function () {

            expect(log).toBeDefined();
            expect(q).toBeDefined();
            expect(filterFilter).toBeDefined();
            expect(srvData).toBeDefined();
            expect(srvConfig).toBeDefined();
            expect(srvMiapp).toBeDefined();
            expect(srvMiapp.miappService).toBeDefined();
            expect(srvMiapp.miappService._db).toBeDefined();
            expect(srvData.User).toBeDefined();

            var srv = srvDataContainer;

            expect(srv.getChores().length).toBe(0);
        });



        it('should catch error with a bad init', function (done) {

            var srv = srvDataContainer;
            srv.srvConfig.getUserLoggedIn = function () {
                return null;
            };
            srv.srvMiapp.miappService.currentUser = null;
            //console.log(srvConfig.getUserLoggedIn());
            expect(srv.isLoggedIn()).toBe(false, 'should be not logged in');

            srv.sync()
                .then(function (err) {
                    expect(true).toBe(false, 'should not pass here : ' + err);
                })
                .catch(function (err) {
                    expect(err).toBe('srvDataContainer.sync : Need one user logged in.');

                    //Launch another sync with a login but not db
                    srv.srvConfig.getUserLoggedIn = function () {
                        return {email: 'mock@user.com', miappUserId: 'myMockedUser'};
                    };
                    srv.srvMiapp.miappService.currentUser = {email: 'mock@user.com', miappUserId: 'myMockedUser'};
                    srv.srvMiapp.miappService._dbInitialized = true;

                    return srv.sync();
                })
                .then(function (err) {
                    expect(true).toBe(false, 'should not pass here : ' + err);
                })
                .catch(function (err) {
                    expect(err).toBe('first data creation pb : miapp.sdk.service.putInDb : DB put impossible. Need a user logged in. ([object Object])');


                })
                .finally(function (err) {
                    done();
                });

            //timeout.flush(200);
            setTimeout(function () {
                rootScope.$apply();
                setTimeout(function () {
                    rootScope.$apply();
                    $httpBackend.flush();
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


        it('should login', function (done) {

            var srv = srvDataContainer;
            var userLoggedIn = srvConfig.getUserLoggedIn();
            expect(userLoggedIn.email).toBe('mock@user.com');
            expect(srv.isLoggedIn()).toBe(false, 'should not be login by default');

            srv.login(userLoggedIn)
                .then(function (userLogged) {
                    expect(userLogged.email).toBe('mock@user.com');
                    console.log(userLogged);
                    //expect(true).toBe(false, 'should not pass here : ' + err);
                    return srv.login(userLoggedIn);
                })
                .then(function (err) {
                    expect(err).toBeUndefined('should not be there : ' + err);
                })
                .catch(function (err) {
                    expect(err).toBe('srvDataContainer.login : already logged in');
                    srv.srvConfig.getUserLoggedIn = function () {
                        return null;
                    };
                    return srv.login(userLoggedIn);
                })
                .finally(function (err) {
                    done();
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

        it('should bind first data', function (done) {

            var srv = srvDataContainer;
            srv.srvData.getUserAFromCouple = function (couple) {
                return q.resolve(currentUser);
            };
            srv.srvData.getUserBFromCouple = function (couple) {
                return q.resolve(currentUser);
            };
            srv.srvData.db = pouchDBMock;
            srv.srvMiapp.miappService._db = pouchDBMock;
            srv.srvMiapp.miappService._dbInitialized = true;

            expect(srv.isLoggedIn()).toBe(true);

            srv.sync()
                .then(function (err) {
                    expect(err).toBeUndefined('should not resolve error ' + err);

                    expect(srv.getUserA()).toBeDefined('Need first User');
                    expect(srv.getUserB()).toBeDefined('Need second User');
                    expect(srv.getCouple()).toBeDefined('Need Couple');
                    expect(srv.getChores()).toBeDefined('Need Chores');
                    expect(srv.getChores().length).toBe(3);
                    expect(srv.getCategories()).toBeDefined('Need chore Categories');
                    expect(srv.getCategories().length).toBe(1);
                    done();
                })
                .catch(function (err) {
                    expect(err).toBeUndefined('should not catch error : ' + err);
                    done();
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
                                    setTimeout(function () {
                                        rootScope.$apply();
                                    }, 200);
                                }, 200);
                            }, 200);
                        }, 200);
                    }, 200);
                }, 200);
            }, 200);
        });


        it('should remove all db', function (done) {

            //$httpBackend.flush();
            srvDataContainer.logout()
                .then(function (err) {
                    console.log('db destroy');
                    expect(err).toBeUndefined(err);
                    done();
                })
                .catch(function (err) {
                    expect(err).toBe('no error supposed to be catched', err);
                    done();
                });

            timeout.flush(200);
        });


    });


});
