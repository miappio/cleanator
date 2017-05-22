describe('myAngularApp.services.srvData.pouchdb', function () {
    'use strict';

    var log, q, http, gettextCatalog;
    var originalTimeout;
    var myRootScope;
    var timeout;
    var $httpBackend;
    var miappService;

    //this.choreColumns     = {type:'docType',appVendorId:'app_Id',appVendorVersion:'app_version',appUserId:'appUser_Id', name:'choreName',category:'choreCategoryName',description:'description',percentAB:'percent_AB',frequencyDays:'frequencyDays',timeInMn:'timeInMn',choreDescriptionCat:'choreDescriptionCat',priority:'priority',priorityComputed:'priorityComputed',lastTimeDone:'lastTimeDone',desactivate:'desactivate', lastModified:'lastModified'};
    //this.historicColumns  = {type:'docType',appVendorId:'app_Id',appVendorVersion:'app_version',appUserId:'appUser_Id', name:'choreName',category:'choreCategoryName',description:'description',percentAB:'percent_AB',frequencyDays:'frequencyDays',timeInMn:'timeInMn',choreDescriptionCat:'choreDescriptionCat',priority:'priority',priorityComputed:'priorityComputed',lastTimeDone:'lastTimeDone',desactivate:'desactivate',choreId:'choreId',userId:'userId',action:'action',actionTodoDate:'actionTodoDate',actionDoneDate:'actionDoneDate',internalWeight:'internalWeight',internalLate:'internalLate', lastModified:'lastModified' };
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
        _id: 'userA',
        timeInMnPerSund: 30,
        timeInMnPerMond: 30,
        timeInMnPerTues: 30,
        timeInMnPerWedn: 30,
        timeInMnPerThur: 30,
        timeInMnPerFrid: 30,
        timeInMnPerSatu: 30
    };
    var userB = {
        _id: 'userB',
        timeInMnPerSund: 30,
        timeInMnPerMond: 30,
        timeInMnPerTues: 30,
        timeInMnPerWedn: 30,
        timeInMnPerThur: 30,
        timeInMnPerFrid: 30,
        timeInMnPerSatu: 30
    };

    describe('basics', function () {

        beforeEach(function () {

            inject(function ($injector) {
                log = console;//$injector.get('$log');
                q = $injector.get('$q');
                http = $injector.get('$http');
                //miappService = $injector.get('MiappService');
                miappService = new miapp.angularService(log, q);
                miappService.init('miappId', 'miappSalt', true);
                //gettextCatalog = $injector.get('gettextCatalog');
                myRootScope = $injector.get('$rootScope');
                timeout = $injector.get('$timeout');
                $httpBackend = $injector.get('$httpBackend');
                $httpBackend.whenGET(/views.*/).respond(200, '');

            });

        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation(false);
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should be correctly initialized', function () {

            var srv = new SrvDataPouchDB(q, log, http, timeout, miappService);
            expect(srv.isInitDone()).toBe(false);
            srv.init();
            expect(srv.isInitDone()).toBe(true);
            //expect(srv.isLoggedIn()).toBe(false);
            //expect(a4pAnalytics.mAnalyticsArray.length).toEqual(0);
            //expect(a4pAnalytics.mAnalyticsFunctionnalitiesArray.length).toEqual(0);
        });

        it('should retrieve couple for one user', function () {

            var srv = new SrvDataPouchDB(q, log, http, timeout, miappService);
            srv.init();

            srv.getUserAFromCouple(null)
                .catch(function (user) {
                    expect(user).toBe(null);
                    return srv.getUserBFromCouple(null);
                })
                .catch(function (user) {
                    expect(user).toBe(null);
                });

            timeout.flush(200);

        });

    });

    describe('algoritm', function () {

        //beforeEach(module('myAngularApp'));
        beforeEach(function () {

            inject(function ($injector) {
                log = $injector.get('$log');
                q = $injector.get('$q');
                http = $injector.get('$http');
                //gettextCatalog = $injector.get('gettextCatalog');
                myRootScope = $injector.get('$rootScope');
                timeout = $injector.get('$timeout');
                $httpBackend = $injector.get('$httpBackend');
                miappService = new miapp.angularService(log, q);//$injector.get('MiappService');
                miappService.init('miappId', 'miappSalt', true);
                //var fakedMainResponse = {};
                //$httpBackend.when('GET', 'views/user/userCalendar.html').respond(fakedMainResponse);
                //$httpBackend.when('GET', 'views/user/userAll.html').respond(fakedMainResponse);
                $httpBackend.whenGET(/views.*/).respond(200, '');

            });

        });
        beforeEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
        afterEach(function () {
            //jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
            //myRootScope.$apply();
            //timeout.flush();
            //myRootScope.$digest();
        });

        it('should compute by week - with empty values', function (done) {

            var srv = new SrvDataPouchDB(q, log, http, timeout, miappService);
            expect(srv.isInitDone()).toBe(false);
            srv.init();
            expect(srv.isInitDone()).toBe(true);

            var testComputing = function (lstHistoByCalendar) {
                //console.log('computeHistoricsByCalendar done');
                expect(lstHistoByCalendar.length).toBe(0);
                //expect(lstHistoByCalendar.length).toBe(1);
            };
            var failTest = function (error) {
                //console.log('computeHistoricsByCalendar err:' + error);
                expect(error).toBeUndefined();
            };

            srv.computeHistoricsByCalendar()
                .then(testComputing)
                .catch(failTest)
                .finally(done);

            //$httpBackend.flush();
            timeout.flush(200);
        });

        it('should compute by week - a A/B dispatch with one chore', function (done) {

            var srv = new SrvDataPouchDB(q, log, http, timeout, miappService);
            srv.init();
            expect(srv.isInitDone()).toBe(true);

            var chores = [choreRefToCopy];
            var histoDone = [];
            var testComputing = function (lstHistoByCalendar) {
                //console.log('computeHistoricsByCalendar done');
                expect(lstHistoByCalendar.length).toBe(7);
                expect(lstHistoByCalendar[0].userId).toBe(userA._id);
                expect(lstHistoByCalendar[1].userId).toBe(userB._id);
                expect(lstHistoByCalendar[2].userId).toBe(userA._id);
                expect(lstHistoByCalendar[3].userId).toBe(userB._id);
                expect(lstHistoByCalendar[4].userId).toBe(userA._id);
                expect(lstHistoByCalendar[5].userId).toBe(userB._id);
                expect(lstHistoByCalendar[6].userId).toBe(userA._id);
            };
            var failTest = function (error) {
                console.log('computeHistoricsByCalendar err:' + error);
                expect(error).toBeUndefined();
            };
            srv.computeHistoricsByCalendar(chores, histoDone, userA, userB, 7)
                .then(testComputing)
                .catch(failTest)
                .finally(done);

            //$httpBackend.flush();
            timeout.flush(200);
        });

        it('should compute by week - a A dispatch with one chore with affinity 100% to A', function (done) {

            var srv = new SrvDataPouchDB(q, log, http, timeout, miappService);
            srv.init();
            expect(srv.isInitDone()).toBe(true);

            var oneChore = angular.copy(choreRefToCopy);
            oneChore.percent_AB = 0;
            var chores = [oneChore];
            var histoDone = [];
            var testComputing = function (lstHistoByCalendar) {
                //console.log('computeHistoricsByCalendar done');
                expect(lstHistoByCalendar.length).toBe(7);
                expect(lstHistoByCalendar[0].userId).toBe(userA._id);
                expect(lstHistoByCalendar[1].userId).toBe(userA._id);
                expect(lstHistoByCalendar[2].userId).toBe(userA._id);
                expect(lstHistoByCalendar[3].userId).toBe(userA._id);
                expect(lstHistoByCalendar[4].userId).toBe(userA._id);
                expect(lstHistoByCalendar[5].userId).toBe(userA._id);
                expect(lstHistoByCalendar[6].userId).toBe(userA._id);
            };
            var failTest = function (error) {
                console.log('computeHistoricsByCalendar err:' + error);
                expect(error).toBeUndefined();
            };
            srv.computeHistoricsByCalendar(chores, histoDone, userA, userB, 7)
                .then(testComputing)
                .catch(failTest)
                .finally(done);

            //$httpBackend.flush();
            timeout.flush(200);
        });

        it('should compute by week - a B dispatch with one chore with affinity 100% to B', function (done) {

            var srv = new SrvDataPouchDB(q, log, http, timeout, miappService);
            srv.init();
            expect(srv.isInitDone()).toBe(true);

            var oneChore = angular.copy(choreRefToCopy);
            oneChore.percent_AB = 100;
            var chores = [oneChore];
            var histoDone = [];
            var testComputing = function (lstHistoByCalendar) {
                //console.log('computeHistoricsByCalendar done');
                expect(lstHistoByCalendar.length).toBe(7);
                expect(lstHistoByCalendar[0].userId).toBe(userB._id);
                expect(lstHistoByCalendar[1].userId).toBe(userB._id);
                expect(lstHistoByCalendar[2].userId).toBe(userB._id);
                expect(lstHistoByCalendar[3].userId).toBe(userB._id);
                expect(lstHistoByCalendar[4].userId).toBe(userB._id);
                expect(lstHistoByCalendar[5].userId).toBe(userB._id);
                expect(lstHistoByCalendar[6].userId).toBe(userB._id);
            };
            var failTest = function (error) {
                console.log('computeHistoricsByCalendar err:' + error);
                expect(error).toBeUndefined();
            };
            srv.computeHistoricsByCalendar(chores, histoDone, userA, userB, 7)
                .then(testComputing)
                .catch(failTest)
                .finally(done);

            //$httpBackend.flush();
            timeout.flush(200);
        });

        it('should compute by week - a A/B dispatch with one chore with affinity 70% to B', function (done) {

            var srv = new SrvDataPouchDB(q, log, http, timeout, miappService);
            srv.init();
            expect(srv.isInitDone()).toBe(true);

            var oneChore = angular.copy(choreRefToCopy);
            oneChore.percent_AB = 70;
            var chores = [oneChore];
            var histoDone = [];
            var testComputing = function (lstHistoByCalendar) {
                //console.log('computeHistoricsByCalendar done');
                expect(lstHistoByCalendar.length).toBe(7);
                expect(lstHistoByCalendar[0].userId).toBe(userB._id);
                expect(lstHistoByCalendar[1].userId).toBe(userA._id);
                expect(lstHistoByCalendar[2].userId).toBe(userB._id);
                expect(lstHistoByCalendar[3].userId).toBe(userB._id);
                expect(lstHistoByCalendar[4].userId).toBe(userA._id);
                expect(lstHistoByCalendar[5].userId).toBe(userB._id);
                expect(lstHistoByCalendar[6].userId).toBe(userB._id);
            };
            var failTest = function (error) {
                console.log('computeHistoricsByCalendar err:' + error);
                expect(error).toBeUndefined();
            };
            srv.computeHistoricsByCalendar(chores, histoDone, userA, userB, 7)
                .then(testComputing)
                .catch(failTest)
                .finally(done);

            //$httpBackend.flush();
            timeout.flush(200);
        });

        it('should compute by week - without any time per user should return empty list', function (done) {

            var srv = new SrvDataPouchDB(q, log, http, timeout, miappService);
            srv.init();
            expect(srv.isInitDone()).toBe(true);

            var oneChore = angular.copy(choreRefToCopy);
            var userA_ = angular.copy(userA);
            var userB_ = angular.copy(userB);
            userA_.timeInMnPerSund = userA_.timeInMnPerMond = userA_.timeInMnPerTues = userA_.timeInMnPerWedn = userA_.timeInMnPerThur = userA_.timeInMnPerFrid = userA_.timeInMnPerSatu = 0;
            userB_.timeInMnPerSund = userB_.timeInMnPerMond = userB_.timeInMnPerTues = userB_.timeInMnPerWedn = userB_.timeInMnPerThur = userB_.timeInMnPerFrid = userB_.timeInMnPerSatu = 0;
            var chores = [oneChore];
            var histoDone = [];
            var testComputing = function (lstHistoByCalendar) {
                expect(lstHistoByCalendar.length).toBe(0);
            };
            var failTest = function (error) {
                console.log('computeHistoricsByCalendar err:' + error);
                expect(error).toBeUndefined();
            };
            srv.computeHistoricsByCalendar(chores, histoDone, userA_, userB_, 7)
                .then(testComputing)
                .catch(failTest)
                .finally(done);

            //$httpBackend.flush();
            timeout.flush(200);
        });

        it('should compute by week - A is available only during we / B only 2 days', function (done) {

            var srv = new SrvDataPouchDB(q, log, http, timeout, miappService);
            srv.init();
            expect(srv.isInitDone()).toBe(true);

            var oneChore = angular.copy(choreRefToCopy);
            var userA_ = angular.copy(userA);
            var userB_ = angular.copy(userB);
            userA_.timeInMnPerSund = userA_.timeInMnPerMond = userA_.timeInMnPerTues = userA_.timeInMnPerWedn = userA_.timeInMnPerThur = userA_.timeInMnPerFrid = userA_.timeInMnPerSatu = 0;
            userB_.timeInMnPerSund = userB_.timeInMnPerMond = userB_.timeInMnPerTues = userB_.timeInMnPerWedn = userB_.timeInMnPerThur = userB_.timeInMnPerFrid = userB_.timeInMnPerSatu = 0;
            userA_.timeInMnPerSund = userA_.timeInMnPerSatu = 30;
            userB_.timeInMnPerMond = userB_.timeInMnPerTues = 30;
            var chores = [oneChore];
            var histoDone = [];
            var testComputing = function (lstHistoByCalendar) {
                expect(lstHistoByCalendar.length).toBe(4);
                //expect(lstHistoByCalendar.length).toBe(4);
            };
            var failTest = function (error) {
                console.log('computeHistoricsByCalendar err:' + error);
                expect(error).toBeUndefined();
            };
            srv.computeHistoricsByCalendar(chores, histoDone, userA_, userB_, 7)
                .then(testComputing)
                .catch(failTest)
                .finally(done);

            //$httpBackend.flush();
            timeout.flush(200);
        });

        it('should compute by week - A is available only during we / B only 2 days AND done history is full of same chores', function (done) {

            var srv = new SrvDataPouchDB(q, log, http, timeout, miappService);
            srv.init();
            expect(srv.isInitDone()).toBe(true);

            var oneChore = angular.copy(choreRefToCopy);
            var userA_ = angular.copy(userA);
            var userB_ = angular.copy(userB);
            userA_.timeInMnPerSund = userA_.timeInMnPerMond = userA_.timeInMnPerTues = userA_.timeInMnPerWedn = userA_.timeInMnPerThur = userA_.timeInMnPerFrid = userA_.timeInMnPerSatu = 0;
            userB_.timeInMnPerSund = userB_.timeInMnPerMond = userB_.timeInMnPerTues = userB_.timeInMnPerWedn = userB_.timeInMnPerThur = userB_.timeInMnPerFrid = userB_.timeInMnPerSatu = 0;
            userA_.timeInMnPerSund = userA_.timeInMnPerSatu = 30;
            userB_.timeInMnPerMond = userB_.timeInMnPerTues = 30;
            var chores = [oneChore];
            var histoDone = [];
            // fullish historic for both user
            var now = new Date();
            for (var i = 0; i < 7; i++) {
                var histoA = angular.copy(histoRefToCopy);
                var histoB = angular.copy(histoRefToCopy);
                histoA.actionDoneDate = angular.copy(now);
                histoB.actionDoneDate = angular.copy(now);
                histoA.userId = userA_._id;
                histoB.userId = userB_._id;
                histoDone.push(histoA);
                histoDone.push(histoB);
                now = new Date(now);
                now.setDate(now.getDate() + 1);
            }

            var testComputing = function (lstHistoByCalendar) {
                // allready done chores; should be empty list
                expect(lstHistoByCalendar.length).toBe(0);
            };
            var failTest = function (error) {
                console.log('computeHistoricsByCalendar err:' + error);
                expect(error).toBeUndefined();
            };
            srv.computeHistoricsByCalendar(chores, histoDone, userA_, userB_, 7)
                .then(testComputing)
                .catch(failTest)
                .finally(done);

            //$httpBackend.flush();
            timeout.flush(200);
        });

        it('should compute by week - A & B of 4 days because 3 days done', function (done) {

            var srv = new SrvDataPouchDB(q, log, http, timeout, miappService);
            srv.init();
            expect(srv.isInitDone()).toBe(true);

            var oneChore = angular.copy(choreRefToCopy);
            var chores = [oneChore];
            var histoDone = [];
            // fullish historic for both user
            var now = new Date();
            for (var i = 0; i < 3; i++) {
                var histoA = angular.copy(histoRefToCopy);
                var histoB = angular.copy(histoRefToCopy);
                histoA.actionDoneDate = angular.copy(now);
                histoB.actionDoneDate = angular.copy(now);
                histoA.userId = userA._id;
                histoB.userId = userB._id;
                histoDone.push(histoA);
                histoDone.push(histoB);
                now = new Date(now);
                now.setDate(now.getDate() + 1);
            }

            var testComputing = function (lstHistoByCalendar) {
                // already done chores during 3 days; should receive a 4 days list
                expect(lstHistoByCalendar.length).toBe(4);
                expect(lstHistoByCalendar[0].userId).toBe(userA._id);
                expect(lstHistoByCalendar[1].userId).toBe(userB._id);
                expect(lstHistoByCalendar[2].userId).toBe(userA._id);
                expect(lstHistoByCalendar[3].userId).toBe(userB._id);
            };
            var failTest = function (error) {
                console.log('computeHistoricsByCalendar err:' + error);
                expect(error).toBeUndefined();
            };
            srv.computeHistoricsByCalendar(chores, histoDone, userA, userB, 7)
                .then(testComputing)
                .catch(failTest)
                .finally(done);

            $httpBackend.flush();
        });

        it('should compute by week - A & B of 4 days with chore done before yesterday by A', function (done) {

            var srv = new SrvDataPouchDB(q, log, http, timeout, miappService);
            srv.init();
            expect(srv.isInitDone()).toBe(true);

            var oneChore = angular.copy(choreRefToCopy);
            oneChore.frequencyDays = 4;
            var chores = [oneChore];
            var histoDone = [];
            // fullish historic for both user
            var histoA = angular.copy(histoRefToCopy);
            histoA.userId = userA._id;
            var beforeYesterday = new Date();
            beforeYesterday.setDate(beforeYesterday.getDate() - (2+4+4));
            histoA.actionDoneDate = angular.copy(beforeYesterday);
            histoDone.push(histoA);
            histoA = angular.copy(histoA);
            histoA.userId = userB._id;
            beforeYesterday.setDate(beforeYesterday.getDate() + 4);
            histoA.actionDoneDate = angular.copy(beforeYesterday);
            histoDone.push(histoA);
            histoA = angular.copy(histoA);
            histoA.userId = userA._id;
            beforeYesterday.setDate(beforeYesterday.getDate() + 4);
            histoA.actionDoneDate = angular.copy(beforeYesterday);
            histoDone.push(histoA);

            var testComputing = function (lstHistoByCalendar) {
                expect(lstHistoByCalendar.length).toBe(2);
                expect(lstHistoByCalendar[0].userId).toBe(userB._id);
                beforeYesterday.setDate(beforeYesterday.getDate() + 4);
                expect(lstHistoByCalendar[0].actionTodoDate.substring(7)).toBe('/'+beforeYesterday.getDate());
                expect(lstHistoByCalendar[1].userId).toBe(userA._id);
                beforeYesterday.setDate(beforeYesterday.getDate() + 4);
                expect(lstHistoByCalendar[1].actionTodoDate.substring(7)).toBe('/'+beforeYesterday.getDate());
            };
            var failTest = function (error) {
                console.log('computeHistoricsByCalendar err:' + error);
                expect(error).toBeUndefined();
            };
            srv.computeHistoricsByCalendar(chores, histoDone, userA, userB, 7)
                .then(testComputing)
                .catch(failTest)
                .finally(done);

            $httpBackend.flush();
        });

        it('should compute by week - a A/B dispatch with many chores', function (done) {

            var srv = new SrvDataPouchDB(q, log, http, timeout, miappService);
            srv.init();
            expect(srv.isInitDone()).toBe(true);

            var chores = [];
            for (var i = 0; i < 10; i++) {
                var oneChore = angular.copy(choreRefToCopy);
                oneChore._id += ''+i;
                oneChore.frequencyDays = i % 2 ? 2 : "3";
                oneChore.percent_AB = i % 2 ? "70" : 30;
                oneChore.timeInMn = i % 2 ? 20 : "10";
                oneChore.desactivate = i % 2 ? "false" : true;
                console.log('oneChore : ',oneChore);
                chores.push(oneChore);
            }
            var histoDone = [];
            var testComputing = function (lstHistoByCalendar) {
                expect(lstHistoByCalendar.length).toBe(7 * 2);
                expect(lstHistoByCalendar[0].userId).toBe(userB._id);
                expect(lstHistoByCalendar[1].userId).toBe(userA._id);
                expect(lstHistoByCalendar[2].userId).toBe(userB._id);
                expect(lstHistoByCalendar[3].userId).toBe(userA._id);
                expect(lstHistoByCalendar[4].userId).toBe(userB._id);
                // so on ...
            };
            var failTest = function (error) {
                console.log('computeHistoricsByCalendar err:' + error);
                expect(error).toBeUndefined();
            };
            srv.computeHistoricsByCalendar(chores, histoDone, userA, userB, 7)
                .then(testComputing)
                .catch(failTest)
                .finally(done);

            //$httpBackend.flush();
            timeout.flush(200);
        });

    });

});
