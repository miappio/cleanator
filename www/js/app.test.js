

describe('app', function () {
'use strict';



    describe('fakeApp injection', function () {

        angular.module('myFakeApp', [
            'srvMiapp',
            'miapp.services'
        ])
            .value('version', 'v1.0.1')
            .run(function (srvMiapp) {
                console.log('myAngularApp run');
                //if (appIsTest && appEndpointTest) srvMiapp.setEndpoint(appEndpointTest);
                srvMiapp.init('miappId', 'miappSalt', true);
            })
            .config(function () {
                console.log('myAngularApp config');
            });

        beforeEach(module('myFakeApp'));
        afterEach(function () {
        });

        it('should provide a version', inject(function (version) {
            expect(version).toEqual('v1.0.1');
        }));
    });


    describe('myAngularApp injection', function () {

        beforeEach(module('myAngularApp'));
        afterEach(function () {
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
        it('should set a Miapp Service', function () {

            inject(function ($injector) {
                var srvInjected = $injector.get('srvMiapp');
                expect(srvInjected).toBeDefined();

            });
        });
    });

});
