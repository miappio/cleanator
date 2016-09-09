

describe('myAngularApp', function () {
'use strict';



    describe('fakeApp injection', function () {

        angular.module('myFakeApp', [
            'srvMiapp',
            'miapp.services'
        ])
            .value('version', 'v1.0.1')
            .config(function () {
                //console.log('myAngularApp config');
            })
            .run(function (srvMiapp) {
                //console.log('myAngularApp run');
                //if (appIsTest && appEndpointTest) srvMiapp.setEndpoint(appEndpointTest);
                srvMiapp.init('miappId', 'miappSalt', true);
            });

        beforeEach(module('myFakeApp'));
        afterEach(function () {
        });

        it('should provide a version', inject(function (version) {
            expect(version).toEqual('v1.0.1');
        }));
    });


    describe('myAngularApp injection', function () {

        //beforeEach(module('myAngularApp'));
        beforeEach(function() {
            module('myAngularApp');
        });
        afterEach(function () {
        });

        it('should inject and launch one fake test ', function () {
            expect(true).toEqual(true);
        });

        it('should provide a version', inject(function (launched) {
            expect(launched).toBeDefined();
            //expect(launched).
            //todo format as date ?
        }));
        it('should override a version and test the new version is injected', function () {
            // module() takes functions or strings (module aliases)
            module(function ($provide) {
                $provide.value('launched', 'overridden'); // override version here
            });

            inject(function (launched) {
                expect(launched).toEqual('overridden');
            });
        });
        // The inject and module method can also be used inside of the it or beforeEach
        it('should a Miapp Service been injected', function () {

            inject(function ($injector) {
                var srvInjected = $injector.get('srvMiapp');
                expect(srvInjected).toBeDefined();

            });
        });
        // The inject and module method can also be used inside of the it or beforeEach
        it('should have an example config set', function () {

            inject(function ($injector) {
                var miappId = $injector.get('miappId');
                expect(miappId).toBe('xxxxxx');

                var appIsTest = $injector.get('appIsTest');
                expect(appIsTest).toBe(true);
                var appForceOffline = $injector.get('appForceOffline');
                expect(appForceOffline).toBe(true);
                var appEndpointTest = $injector.get('appEndpointTest');
                expect(appEndpointTest).toBe('https://xxxxx');



            });
        });
    });

});
