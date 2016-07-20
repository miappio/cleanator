

describe('srvMiapp', function () {
'use strict';

    var log = null, q = null, rootScope = null;

    beforeEach(module('myAngularApp'));
    beforeEach(function () {

      inject(function($injector, _$log_, _$q_, _$rootScope_) {
        log = _$log_;//$injector.get('$log');
          q = _$q_;//$injector.get('$q');
          rootScope = _$rootScope_; //$injector.get('$rootScope');
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


    it('should trap error during initialisation', function (done) {

        var srv = new SrvMiapp(log, q);

        expect(srv.miappClient).toBe(null);
        expect(srv.currentUser).toBe(null);

        var upd = {};

        srv.login('test','mypassword',upd)
            .then(function(user){
                console.log('then received');
                expect(user).toBeUndefined();
                done();
            },function(err){
                console.log('catch received');
                expect(err).toBe('not initialized');
                done();
            })
            .finally(function(){
                console.log('finally received');
                done();
            });

        rootScope.$apply();
    });


    it('should return correct getter', function (done) {

        var srv = new SrvMiapp(log, q);

        srv.init('mytestApp');
        expect(srv.miappClient).not.toBe(null);
        expect(srv.currentUser).toBe(null);

        var upd = {};

        var prom = srv.login('test','mypassword',upd);


        prom
            .then(function(user){
                console.log('then. received');
                expect(user).not.toBeUndefined();
            })
            .catch(function(err){
                console.log('catch. received');
                expect(err).toBeUndefined();
            })
            .finally(function(user){
                console.log('finally. received');
                done();
            });

        setTimeout(function(){rootScope.$apply();},9000);

    });

});
