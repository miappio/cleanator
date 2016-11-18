describe('myAngularApp.views.dashboard', function () {
    'use strict';
    var $httpBackend, $rootScope, $timeout, $routeParams, $q, srvData, srvConfig, createController, authRequestHandler;
    var $stateProvider, $urlRouterProvider, $ionicConfigProvider;

    beforeEach(module('myAngularApp'));
    beforeEach(module('myAngularApp.views.dashboard'));
    beforeEach(inject(function ($injector) {
        // Set up the mock http service responses
        $httpBackend = $injector.get('$httpBackend');
        // backend definition common for all tests
        //authRequestHandler = $httpBackend.when('GET', '/auth.py')
        //                       .respond({userId: 'userX'}, {'A-Token': 'xxx'});

        // Get hold of a scope (i.e. the root scope)
        $rootScope = $injector.get('$rootScope');
        $timeout = $injector.get('$timeout');
        //$routeParams = $injector.get('$routeParams');
        $stateProvider = $injector.get('$state');
        $urlRouterProvider = $injector.get('$urlRouter');
        $ionicConfigProvider = $injector.get('$ionicConfig');
        $q = $injector.get('$q');
        srvData = $injector.get('srvData');
        srvConfig = $injector.get('srvConfig');
        var $controller = $injector.get('$controller');

        createController = function () {
            var fakedMainResponse = {};
            $httpBackend.when('GET', 'views/user/userCalendar.html').respond(fakedMainResponse);

            //$scope, $timeout, $routeParams, $q, srvData, srvConfig
            //$scope, $timeout, $q, srvData, srvConfig)
            return $controller('DashboardCtrl', {
                '$scope': $rootScope,
                '$timeout': $timeout,
                '$q': $q,
                'srvData': srvData,
                'srvConfig': srvConfig
            });
        };
    }));


    describe('initialisation', function () {
        // before each test in this block, generates a fresh directive
        var controller = null;
        beforeEach(function () {
            var controller = createController();
        });

        it('Should call get samples on initialization', function () {
            expect(controller).toBeDefined();


            var user = {name: 'test', email: 'test'};
            srvConfig.setUserLoggedIn(user);
            //srvData.setUserLoggedIn(user);

            $rootScope.dashboardDataBind();
            //$rootScope.dashboardComputeHistoricsByPrior();
            expect($rootScope.dashboardHistorics).toBeDefined();
            //expect($rootScope.dashboardHistorics.length).toBe(3);
            expect($rootScope.dashboardInitSpinnerStopped).toBe(false);
        });
    });

    describe('tools', function () {
        // before each test in this block, generates a fresh directive
        var controller = null;
        beforeEach(function () {
            var controller = createController();
        });

        it('computing dashboardDisplayHistoricDate', function () {
            expect(controller).toBeDefined();

            //var dateAsYYMMDD = '31/12/1812';
            var dateDay = 'Wednesday';
            var displayDate = $rootScope.dashboardDisplayHistoricDate('2011/11/30');
            expect(displayDate).toBe(dateDay);
            var displayDate = $rootScope.dashboardDisplayHistoricDate('2011-11-30');
            expect(displayDate).toBe(dateDay);
            var displayDate = $rootScope.dashboardDisplayHistoricDate(new Date(2011,10,30));
            expect(displayDate).toBe(dateDay);

            //todo Prefer this UTC Date way !
            var displayDate = $rootScope.dashboardDisplayHistoricDate(new Date(Date.UTC(2011, 10, 30)));
            expect(displayDate).toBe(dateDay);
        });


        it('computing dashboardDisplayHistoricCalendar', function () {
            expect(controller).toBeDefined();

            var dateAsString = 'Monday '+"<span class='small'>"+'2011-01-31</span>';
            var dateAsYYYYMMDD_PleaseDoNotUse = new Date(2011,0,31);//cause month [0 - 11]
            var dateAsYYYYMMDDUTC = new Date(Date.UTC(2011,0,31));
            //var offset = dateAsYYYYMMDDUTC.getTimezoneOffset();
            //expect(offset).toBe(0);
            var displayDate = $rootScope.dashboardDisplayHistoricCalendar(dateAsYYYYMMDDUTC);
            expect(displayDate).toBe(dateAsString);
            var dateISO = dateAsYYYYMMDDUTC.toISOString();
            expect(dateISO).toBe('2011-01-31T00:00:00.000Z');
            displayDate = $rootScope.dashboardDisplayHistoricCalendar(dateISO);
            expect(displayDate).toBe(dateAsString);


            var dateAsString = 'Saturday '+"<span class='small'>"+'2011-12-31</span>';
            var dateAsYYYYMMDD_PleaseDoNotUse = new Date(2011,11,31);//cause month [0 - 11]
            var dateAsYYYYMMDDUTC = new Date(Date.UTC(2011,11,31));
            //var offset = dateAsYYYYMMDDUTC.getTimezoneOffset();
            //expect(offset).toBe(0);
            var displayDate = $rootScope.dashboardDisplayHistoricCalendar(dateAsYYYYMMDDUTC);
            expect(displayDate).toBe(dateAsString);
            var dateISO = dateAsYYYYMMDDUTC.toISOString();
            expect(dateISO).toBe('2011-12-31T00:00:00.000Z');
            displayDate = $rootScope.dashboardDisplayHistoricCalendar(dateISO);
            expect(displayDate).toBe(dateAsString);
        });

    });


    describe('interactions', function () {
        // before each test in this block, generates a fresh directive
        var controller = null;
        beforeEach(function () {
            var controller = createController();
            /*
             foo = {
             fn: function() {}
             };

             spyOn(foo, 'fn').and.returnValue("Foo"); // <----------- HERE

             $scope = $rootScope.$new();

             ctrl = $controller('MainCtrl', {$scope: $scope , foo: foo });

             var controller = createController();


             $controller('FirstController', {
             $scope: $rootScope
             });

             var $scope = $rootScope.$new();
             $scope.$index = 1;

             ctrl = $controller('SecondController', {
             $scope: $scope
             });

             expect($scope.childs[0].title).toEqual('Hello, earth!1');
             */
        });

        it('Should call get samples on initialization', function () {
            expect(controller).toBeDefined();


            var user = {name: 'test', email: 'test'};
            srvConfig.setUserLoggedIn(user);
            //srvData.setUserLoggedIn(user);

            $rootScope.dashboardDataBind();
            expect($rootScope.dashboardHistorics).toBeDefined();
            //expect($rootScope.dashboardHistorics.length).toBe(3);
            //expect($rootScope.dashboardInitSpinnerStopped).toBe(true);


            //$rootScope.dashboardNotForMe(h);
            //chore should change

            //historics should change
            //expect($rootScope.dashboardHistorics.length).toBe(2);
            //$rootScope.dashboardNotForUs(h);
            //chore should change
            //historics should change
            //expect($rootScope.dashboardHistorics.length).toBe(1);

        });
    });


});


