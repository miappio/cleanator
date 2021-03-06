describe('myAngularApp.views.dashboard', function () {
    'use strict';
    var _httpBackend, $rootScope, _scope, $timeout, $routeParams, $q, srvData, srvConfig, srvDataContainer, srvArray,
        createController, authRequestHandler;
    var $stateProvider, $stateParams, $ionicModal, $urlRouterProvider, $ionicConfigProvider;

    beforeEach(module('myAngularApp'));
    beforeEach(module('myAngularApp.views.dashboard'));
    beforeEach(inject(function ($injector) {
        // Set up the mock http service responses
        _httpBackend = $injector.get('$httpBackend');
        // backend definition common for all tests
        //authRequestHandler = _httpBackend.when('GET', '/auth.py')
        //                       .respond({userId: 'userX'}, {'A-Token': 'xxx'});

        // Get hold of a scope (i.e. the root scope)
        $rootScope = $injector.get('$rootScope');
        _scope = $rootScope.$new();
        $timeout = $injector.get('$timeout');
        //$routeParams = $injector.get('$routeParams');
        $stateProvider = $injector.get('$state');
        $stateParams = $injector.get('$stateParams');
        $urlRouterProvider = $injector.get('$urlRouter');
        $ionicConfigProvider = $injector.get('$ionicConfig');
        $ionicModal = $injector.get('$ionicModal');
        $q = $injector.get('$q');
        srvDataContainer = $injector.get('srvDataContainer');
        srvData = $injector.get('srvData');
        srvConfig = $injector.get('srvConfig');
        srvArray = $injector.get('srvArray');
        var $controller = $injector.get('$controller');

        createController = function () {
            var fakedMainResponse = {};
            _httpBackend.when('GET', 'views/user/userCalendar.html').respond(fakedMainResponse);

            //$scope, $timeout, $routeParams, $q, srvData, srvConfig
            //$scope, $timeout, $q, srvData, srvConfig)
            // $scope, $timeout, $log, $q, $stateParams, $ionicModal, srvDataContainer, srvData, srvConfig) {
            return $controller('DashboardCtrl', {
                '$scope': _scope,
                '$timeout': $timeout,
                '$q': $q,
                '$stateParams': $stateParams,
                '$ionicModal': $ionicModal,
                'srvDataContainer': srvDataContainer,
                'srvData': srvData,
                'srvConfig': srvConfig,
                'srvArray': srvArray
            });
        };
    }));

    afterEach(function () {
        _httpBackend.verifyNoOutstandingExpectation(false);
        _httpBackend.verifyNoOutstandingRequest();
    });

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

            _scope.dashboardDataBind();
            //_scope.dashboardComputeHistoricsByPrior();
            expect(_scope.dashboardHistorics).toBeDefined();
            //expect(_scope.dashboardHistorics.length).toBe(3);
            expect(_scope.dashboardInitSpinnerStopped).toBe(false);
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
            var displayDate = _scope.dashboardDisplayHistoricDate('2011/11/30');
            expect(displayDate).toBe(dateDay);
            var displayDate = _scope.dashboardDisplayHistoricDate('2011-11-30');
            expect(displayDate).toBe(dateDay);
            var displayDate = _scope.dashboardDisplayHistoricDate(new Date(2011, 10, 30));
            expect(displayDate).toBe(dateDay);

            //todo Prefer this UTC Date way !
            var displayDate = _scope.dashboardDisplayHistoricDate(new Date(Date.UTC(2011, 10, 30)));
            expect(displayDate).toBe(dateDay);
        });


        it('computing dashboardDisplayHistoricCalendar', function () {
            expect(controller).toBeDefined();

            var dateAsString = 'Monday ' + "<span class='small'>" + '2011-01-31</span>';
            var dateAsYYYYMMDD_PleaseDoNotUse = new Date(2011, 0, 31);//cause month [0 - 11]
            var dateAsYYYYMMDDUTC = new Date(Date.UTC(2011, 0, 31));
            //var offset = dateAsYYYYMMDDUTC.getTimezoneOffset();
            //expect(offset).toBe(0);
            var displayDate = _scope.dashboardDisplayHistoricCalendar(dateAsYYYYMMDDUTC);
            expect(displayDate).toBe(dateAsString);
            var dateISO = dateAsYYYYMMDDUTC.toISOString();
            expect(dateISO).toBe('2011-01-31T00:00:00.000Z');
            displayDate = _scope.dashboardDisplayHistoricCalendar(dateISO);
            expect(displayDate).toBe(dateAsString);


            var dateAsString = 'Saturday ' + "<span class='small'>" + '2011-12-31</span>';
            var dateAsYYYYMMDD_PleaseDoNotUse = new Date(2011, 11, 31);//cause month [0 - 11]
            var dateAsYYYYMMDDUTC = new Date(Date.UTC(2011, 11, 31));
            //var offset = dateAsYYYYMMDDUTC.getTimezoneOffset();
            //expect(offset).toBe(0);
            var displayDate = _scope.dashboardDisplayHistoricCalendar(dateAsYYYYMMDDUTC);
            expect(displayDate).toBe(dateAsString);
            var dateISO = dateAsYYYYMMDDUTC.toISOString();
            expect(dateISO).toBe('2011-12-31T00:00:00.000Z');
            displayDate = _scope.dashboardDisplayHistoricCalendar(dateISO);
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

             $scope = _scope.$new();

             ctrl = $controller('MainCtrl', {$scope: $scope , foo: foo });

             var controller = createController();


             $controller('FirstController', {
             $scope: _scope
             });

             var $scope = _scope.$new();
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

            _scope.dashboardDataBind();
            expect(_scope.dashboardHistorics).toBeDefined();
            //expect(_scope.dashboardHistorics.length).toBe(3);
            //expect(_scope.dashboardInitSpinnerStopped).toBe(true);


            var historicToRemove = {id: 1, choreId: 1, userId: 'a'};
            var historicFake = {id: 2, choreId: 2, userId: 'b'};
            var historicList = [historicToRemove, historicFake];
            var historicIndex = 0;
            var choreLinkedToHistoricToRemove = {_id: 1, percent_AB : 50};
            var choreToReplace = {_id: 3, percent_AB : 75};
            //var choreLinkedToHistoricToRemoveModified = {_id: 1, percent_AB : 45}; // percentAB reduce -> userA wants less
            var choreLinkedToHistoricToRemoveModified = {_id: 1, percent_AB : 50};
            _scope.chores = [choreLinkedToHistoricToRemove, choreToReplace];
            _scope.userA = {_id: 'a'};
            _scope.dashboardHistorics = [historicFake, historicToRemove, historicFake];
            spyOn(srvData.Chore, 'set').and.returnValue({});

            _scope.dashboardNotForMe(historicToRemove, historicList, historicIndex);
            expect(historicList.length).toBe(2, 'same length');
            expect(_scope.dashboardHistorics[1].percent_AB).toBe(choreToReplace.percent_AB, 'because it replace historicToRemove with historicFake in historicList');
            expect(_scope.dashboardHistorics[1].userId).toBe('a');
            expect(_scope.dashboardHistorics.length).toBe(3, 'replace historic from dashboardHistorics');
            expect(srvData.Chore.set).toHaveBeenCalledTimes(1);
            expect(srvData.Chore.set).toHaveBeenCalledWith(choreLinkedToHistoricToRemoveModified);

        });
    });


});


