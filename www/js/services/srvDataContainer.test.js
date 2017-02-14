describe('myAngularApp.services.srvDataContainer', function () {
    'use strict';

    describe('basics', function () {

        var log, q, http, gettextCatalog, srvData, srvConfig, srvMiapp, timeout, rootScope;
        var originalTimeout, $httpBackend, filterFilter, pouchDBMock;
        var _cordovaNetwork;
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
                _cordovaNetwork = $injector.get('$cordovaNetwork');
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

        it('should be correctly initialized', function () {

            expect(log).toBeDefined();
            expect(q).toBeDefined();
            expect(rootScope).toBeDefined();
            expect(_cordovaNetwork).toBeDefined();
            expect(filterFilter).toBeDefined();
            expect(srvData).toBeDefined();
            expect(srvConfig).toBeDefined();
            expect(srvMiapp).toBeDefined();
            expect(srvData.User).toBeDefined();

            var srv = new SrvDataContainer(log, q, http, rootScope, _cordovaNetwork, filterFilter, srvData, srvConfig, srvMiapp);

            expect(srv.getChores().length).toBe(0);
        });

        it('should compute indicators', function () {

            var srv = new SrvDataContainer(log, q, http, rootScope, _cordovaNetwork, filterFilter, srvData, srvConfig, srvMiapp);
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

            var srv = new SrvDataContainer(log, q, http, rootScope, _cordovaNetwork, filterFilter, srvData, srvConfig, srvMiapp);
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
                hist.actionTodoDate = new Date(Date.UTC(2016, 0, i));
                hist.actionDoneDate = new Date(Date.UTC(2016, 0, i + 1));
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

    describe('injected', function () {

        var log, q, http, srvData, srvDataContainer, srvConfig, srvMiapp, timeout, rootScope;
        var $httpBackend, filterFilter, _pouchDBMockEmpty, _pouchDBMockFull;
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
        beforeEach(function (done) {
            inject(function ($injector) {
                log = console;//$injector.get('$log');
                q = $injector.get('$q');
                http = $injector.get('$http');
                filterFilter = $injector.get('filterFilter');
                srvData = $injector.get('srvData');
                srvDataContainer = $injector.get('srvDataContainer');
                srvDataContainer.$log = log;

                srvConfig = $injector.get('srvConfig');
                //window.localStorage.removeItem('configLang');
                //srvConfig.getUserLoggedIn = function () {
                //    return {_id: "myMockedUser", email: 'mock@user.com', miappUserId: 'myMockedUser'};
                //};
                srvMiapp = $injector.get('MiappService');
                srvMiapp.miappService.logger = console;
                //srvMiapp.miappService.currentUser = currentUser;
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

                _pouchDBMockEmpty = {
                    allDocs: function (filter, callback) {
                        //console.log('srvDataContainer.test.pouchDBMock.allDocs');
                        var response = {};
                        response.total_rows = 0;
                        response.rows = [];
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
                        return q.resolve({doc_count: 0});
                    },
                    destroy: function (callback) {
                        return callback('mock : no db destroy cause renew a real db');
                    }
                };
                _pouchDBMockFull = {
                    allDocs: function (filter, callback) {
                        console.log('srvDataContainer.test.pouchDBMock.allDocs');
                        var response = {};
                        response.total_rows = 8;
                        response.rows = [];

                        // 2 users
                        response.rows.push(currentUser);
                        response.rows.push(currentUser);

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
                    },
                    destroy: function (callback) {
                        return callback('mock : no db destroy cause renew a real db');
                    }
                };


                srvDataContainer.srvData.db = _pouchDBMockEmpty;
                srvDataContainer.srvMiapp.miappService._db = _pouchDBMockEmpty;

                done();
            });
        });

        it('should be correctly initialized', function (done) {

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
            srv.logout()
                .finally(function () {

                    expect(srv.getChores().length).toBe(0);
                    done();
                });
            rootScope.$apply();

        });

        it('should catch error with a bad init', function (done) {

            console.log('#####bad init');
            var srv = srvDataContainer;
            srv.srvConfig.getUserLoggedIn = function () {
                return null;
            };
            srv.srvMiapp.miappService.currentUser = null;
            //console.log(srvConfig.getUserLoggedIn());
            expect(srv.isLoggedIn()).toBe(false, 'should be not logged in');

            $httpBackend.whenGET(/data\/init.*/).respond(200, '');

            srv.sync()
                .then(function (err) {
                    expect(true).toBe(false, 'should not pass here : ' + err);
                    done.fail(err);
                })
                .catch(function (err) {
                    console.log('#####bad init > sync');
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
                    done.fail(err);
                })
                .catch(function (err) {
                    console.log('#####bad init > catched');
                    expect(err).toBe('miapp.sdk.service.miappSync : DB pb with getting data (undefined)');
                })
                .finally(function (err) {

                    console.log('#####bad init > finished');
                    done();
                });

            setTimeout(function () {
                console.log('#####bad init > finished 02');
                rootScope.$apply();
                setTimeout(function () {
                    console.log('#####bad init > finished 03');
                    rootScope.$apply();
                    $httpBackend.flush();
                    console.log('#####bad init > finished 04');
                }, 200);
            }, 200);
        });

        it('should login', function (done) {

            console.log('#####login');
            var srv = srvDataContainer;
            var userLoggedIn = srvConfig.getUserLoggedIn();
            expect(userLoggedIn).toBeNull();
            expect(srv.isLoggedIn()).toBe(false, 'should not be login by default');

            srv.login(currentUser)
                .then(function (userLogged) {
                    expect(srv.isLoggedIn()).toBe(true, 'should be login');
                    expect(userLogged.email).toBe('mock@user.com');
                    //    console.log(userLogged);
                    //    return srv.login(userLoggedIn);
                })
                //.then(function (userRelogged) {
                //    expect(userRelogged.email).toBe('mock@user.com');
                //    expect(srv.isLoggedIn()).toBe(true, 'should be login');
                //    //expect(err).toBeUndefined('should not be there : ' + err);
                //    done.fail('should not relog');
                //})
                .catch(function (err) {
                    expect(err).toBe('mock : no db destroy cause renew a real db');
                    expect(srv.isLoggedIn()).toBe(true, 'should be login');
                    //srv.srvConfig.getUserLoggedIn = function () {
                    //    return null;
                    //};
                    //return srv.login(userLoggedIn);
                    done.fail(err);
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
            srv.srvData.db = _pouchDBMockFull;
            srv.srvMiapp.miappService._db = _pouchDBMockFull;
            srv.srvMiapp.miappService._dbInitialized = true;

            $httpBackend.whenGET(/data\/init.*/).respond(200, '');

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
                    done.fail(err);
                });


            $httpBackend.flush();
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
                    done.fail('should not resolve due to mock');
                })
                .catch(function (err) {
                    expect(err).toBe('mock : no db destroy cause renew a real db');
                    done();
                });

            timeout.flush(200);
        });

    });

});
