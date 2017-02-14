describe('myAngularApp.views.ctrlNavigation', function () {
    'use strict';

    var _httpBackend, _rootScope, _scope, _log, _location, _timeout, _q, _controller;
    var _state, _ionicHistory;
    var _createController, _srvAnalytics, _srvDataContainer;

    beforeEach(module('myAngularApp'));
    beforeEach(module('crtl.Navigation'));
    beforeEach(inject(function ($injector) {

        _httpBackend = $injector.get('$httpBackend');
        _rootScope = $injector.get('$rootScope');
        _scope = _rootScope.$new();
        _timeout = $injector.get('$timeout');
        _q = $injector.get('$q');
        _controller = $injector.get('$controller');
        _state = $injector.get('$state');
        _ionicHistory = $injector.get('$ionicHistory');
        _srvDataContainer = $injector.get('srvDataContainer');
        _srvAnalytics = $injector.get('srvAnalytics');

        _createController = function () {
            return _controller('ctrlNavigation', {
                '$scope': _scope,
                '$log': _log,
                '$timeout': _timeout,
                '$q': _q,
                '$ionicHistory': _ionicHistory,
                'srvAnalytics': _srvAnalytics,
                'srvDataContainer': _srvDataContainer
            });
        };
    }));


    describe('initialisation', function () {

        var _controller = null;
        beforeEach(function () {
            _controller = _createController();
        });

        it('Should call get samples on initialization', function () {
            expect(_controller).toBeDefined();


            var user = {name: 'test', email: 'test'};
            //srvConfig.setUserLoggedIn(user);
            //srvData.setUserLoggedIn(user);

            //_rootScope.dashboardDataBind();
            //$rootScope.dashboardComputeHistoricsByPrior();
        });
    });


});

