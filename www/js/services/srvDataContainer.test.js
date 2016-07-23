

describe('srvDataContainer', function () {
'use strict';

    var log,q,gettextCatalog,srvData,srvConfig,srvMiapp,timeout,rootScope;
    var originalTimeout,$httpBackend,filterFilter;

    var choreRefToCopy = {
      "_id":"choreFakeId",
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
      "desactivate" : false
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
      "desactivate" : false,
      'choreId':'choreFakeId',
      'userId':'',
      'actionTodoDate':'',
      'actionDoneDate':'',
      'internalWeight':'',
      'internalLate':''
    };
    var userA = {_id:'userA',timeInMnPerWeekTodo:200};
    var userB = {_id:'userB',timeInMnPerWeekTodo:300};

    beforeEach(module('myAngularApp'));
    beforeEach(function () {

        //originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        //jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

        inject(function($injector) {
            log = $injector.get('$log');
            q = $injector.get('$q');
            filterFilter = $injector.get('filterFilter');
            gettextCatalog = $injector.get('gettextCatalog');
            srvData = $injector.get('srvData');
            srvConfig = $injector.get('srvConfig');
            srvMiapp = $injector.get('srvMiapp');
            rootScope = $injector.get('$rootScope');
            timeout = $injector.get('$timeout');
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.whenGET(/views.*/).respond(200, '');


            srvConfig.getUserLoggedIn = function(){ return {email:'mock@user.com', miappUserId : 'myMockedUser'};};
        });

    });

    afterEach(function () {

          //rootScope.$apply();
          //  timeout.flush();
          //rootScope.$digest();
          //jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });


    it('should be correctly initialized', function () {

        //var srvConfig = new SrvConfig(log, gettextCatalog);
        var srv = new SrvDataContainer(log, q, filterFilter, srvData, srvConfig,srvMiapp);

        expect(srv.getChores().length).toBe(0);
    });

    it('should compute indicators', function () {

        //var srvConfig = new SrvConfig(log, gettextCatalog);
        var srv = new SrvDataContainer(log, q, filterFilter, srvData, srvConfig,srvMiapp);
        var indicators = srv.computeIndicators();
        expect(indicators.indicPercent).toEqual([0,0]);
        expect(indicators.indicTimeSpent).toEqual([0,0]);
        expect(indicators.indicUsersTimeAvailabity).toBe(0);
        expect(indicators.indicChoresTimeRequired).toBe(0);
        expect(indicators.indicChoresFeasibility).toBe(0);

        //inject chores and historics
        srv.chores = [choreRefToCopy,choreRefToCopy,choreRefToCopy,choreRefToCopy];
        var historicsDone = [];
        for(var i = 0; i < 3; i++){
          var hist = angular.copy(histoRefToCopy);
          hist._id = i;
          hist.userId = (i == 1) ? userA._id : userB._id;
          historicsDone.push(hist);
        }
        srv.historicsDone = historicsDone;
        srv.userA = userA;
        srv.userB = userB;

        indicators = srv.computeIndicators();
        expect(indicators.indicPercent).toEqual([43,57]);
        expect(indicators.indicTimeSpent).toEqual([10,20]);
        expect(indicators.indicUsersTimeAvailabity).toBe(36);
        expect(indicators.indicChoresTimeRequired).toBe(40);
        expect(indicators.indicChoresFeasibility).toBe(0.89);

    });

    it('should catch error with a bad init', function (done) {
        console.log(srvConfig.getUserLoggedIn());
        var srv = new SrvDataContainer(log, q, filterFilter, srvData, srvConfig,srvMiapp);
        //console.log(srvConfig.getUserLoggedIn());
        //expect(srv.isLoggedIn()).toBe(false);

        expect(srv.isLoggedIn()).toBe(true);

        srv.sync().then(function(err){
            expect(true).toBe(false,'should not be in a normal way '+err);
        }).catch(function(err){
            expect(err).toBe('DB search impossible. Need a user logged in. (null )');
        }).finally(function(err){
            done();
        });


        setTimeout(function () {
            rootScope.$apply();
        }, 2000);

    });

    it('should bind first data', function (done) {
        console.log(srvConfig.getUserLoggedIn());
        var srv = new SrvDataContainer(log, q, filterFilter, srvData, srvConfig,srvMiapp);
        //console.log(srvConfig.getUserLoggedIn());
        //expect(srv.isLoggedIn()).toBe(false);

        srvConfig.getUserLoggedIn = function(){ return {email:'mock@user.com', miappUserId : 'myMockedUser'};};
        expect(srv.isLoggedIn()).toBe(true);

        //srvData.db = function(){ return {email:'mock@user.com', miappUserId : 'myMockedUser'};};
        //expect(srv.isLoggedIn()).toBe(true);

        srv.sync().then(function(err){
            expect(err).toBeUndefined('should not resolve error '+err);
        }).catch(function(err){
            expect(true).toBe(false,'should not catch error : '+err);
        }).finally(function(err){
            done();
        });


        setTimeout(function () {
            rootScope.$apply();
        }, 2000);

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
