

describe('srvMiapp', function () {
'use strict';

    var log = null, q = null;

    beforeEach(module('myAngularApp'));
    beforeEach(function () {

      inject(function($injector) {
        log = $injector.get('$log');
        q = $injector.get('$q');
      });

    });

    afterEach(function () {
    });


    it('should be correctly initialized', function () {

        var srv = new SrvMiapp(log, q);

        //expect(srv.isLoggedIn()).toBe(false);
        //expect(a4pAnalytics.mAnalyticsArray.length).toEqual(0);
        //expect(a4pAnalytics.mAnalyticsFunctionnalitiesArray.length).toEqual(0);
        expect(srv.miappClient).toBe(null);
        expect(srv.currentUser).toBe(null);

    });


    it('should trap error withour initialisation', function (done) {

        var srv = new SrvMiapp(log, q);

        expect(srv.miappClient).toBe(null);
        expect(srv.currentUser).toBe(null);

        var upd = {};

        srv.login('test','mypassword',upd)
            .then(function(user){
                expect(user).toBeUndefined();
                done();
            })
            .catch(function(err){
                expect(err).toBe('not initialized');
                done();
            })
            .finally(done);

    });


    it('should return correct getter', function (done) {

        var srv = new SrvMiapp(log, q);

        srv.init('mytestApp');
        expect(srv.miappClient).not.toBe(null);
        expect(srv.currentUser).toBe(null);

        var upd = {};

        srv.login('test','mypassword',upd)
            .then(function(user){
                expect(user).not.toBeUndefined();
            })
            .catch(function(err){expect(err).toBeUndefined();})
            .finally(done);

    });

});
