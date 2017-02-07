describe('myAngularApp.views.login', function () {
    'use strict';
    var $httpBackend, scope, $rootScope, $routeParams, srvData, createController, authRequestHandler;
    var $http, $location, $cookieStore, authorization, api, srvCordova, srvConfig;

    beforeEach(module('myAngularApp'));
    //beforeEach(module('myAngularApp.views'));
    //beforeEach(module('myAngularApp.views.login'));
    //beforeEach(angular.mock.module('controllers'));
    beforeEach(inject(function ($injector, $controller) {
        // Set up the mock http service responses
        $httpBackend = $injector.get('$httpBackend');
        // backend definition common for all tests
        //authRequestHandler = $httpBackend.when('GET', '/auth.py')
        //                       .respond({userId: 'userX'}, {'A-Token': 'xxx'});

        // Get hold of a scope (i.e. the root scope)
        $rootScope = $injector.get('$rootScope');
        scope = $rootScope.$new();
        $routeParams = $injector.get('$routeParams');
        srvData = $injector.get('srvData');
        $http = $injector.get('$http');
        $location = $injector.get('$location');
        $cookieStore = $injector.get('$cookieStore');
        authorization = $injector.get('authorization');
        api = $injector.get('api');
        srvCordova = $injector.get('srvCordova');
        srvConfig = $injector.get('srvConfig');

        //var $controller = $injector.get('$controller');

        createController = function () {
            //'$scope,$http, $location, $cookieStore, authorization, api, srvCordova, srvConfig, srvData';
            return $controller('LoginCtrl', {
                $scope: scope, $http: $http, $location: $location,
                $cookieStore: $cookieStore, authorization: authorization, api: api,
                srvCordova: srvCordova, srvConfig: srvConfig, srvData: srvData
            });
        };

        var controller = $controller('LoginCtrl', {
            $scope: scope, $http: $http, $location: $location,
            $cookieStore: $cookieStore, authorization: authorization, api: api,
            srvCordova: srvCordova, srvConfig: srvConfig, srvData: srvData
        });
    }));


    it('Should call get samples on initialization', function () {
        //spec body
        //var view1Ctrl = $controller('DashboardCtrl');
        //var controller = createController();
        //expect(controller).toBeDefined();

        //scope.bindUser();
        //scope.bindCouples();

    });
});
