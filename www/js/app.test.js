describe('myAngularApp', function () {

    describe('fakeApp injection', function () {

        angular.module('myFakeApp', [
            'MiappService',
            'miapp.services'
        ])
            .value('version', 'v1.0.1')
            .config(function () {
            })
            .run(function (MiappService) {
                //if (appIsTest && appEndpointTest) srvMiapp.setEndpoint(appEndpointTest);
                MiappService.init('miappId', 'miappSalt', false);
            });

        beforeEach(module('myFakeApp'));
        afterEach(function () {
            console.log('after');
        });

        it('should provide a version', inject(function (version) {
            expect(version).toEqual('v1.0.1');
        }));
    });


    describe('myAngularApp injection', function () {

        var _launched, _demoMode;

        beforeEach(module('myAngularApp'));
        beforeEach(function (done) {
            inject(function ($injector) {
                _launched = $injector.get('launched');
                _demoMode = $injector.get('demoMode');
                done();
            });
        });
        afterEach(function () {
        });


        it('should provide app constants', function () {

            expect(_demoMode).toBeTruthy();
            expect(_launched).toBeDefined();
            expect(typeof _launched).toBe('object');

        });

        it('should a Miapp Service been injected', function () {

            inject(function ($injector) {
                var srvInjected = $injector.get('MiappService');
                expect(srvInjected).toBeDefined();

            });
        });

        it('should have an example config set', function () {

            inject(function ($injector) {
                var miappId = $injector.get('miappId');
                expect(miappId).toBe('demo');

                //var appIsTest = $injector.get('appIsTest');
                //expect(appIsTest).toBe(true);
                var demoMode = $injector.get('demoMode');
                expect(demoMode).toBe(true);
                var appAuthEndpoint = $injector.get('appAuthEndpoint');
                expect(appAuthEndpoint).toBe('demo.com/api');


            });
        });

    });

});
