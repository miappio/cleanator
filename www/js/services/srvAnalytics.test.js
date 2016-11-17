

// GAnalytics possible queues cf analytics tests below
if (typeof ga === 'undefined') {
    var ga = null;
    //var analytics = null;
}

describe('myAngularApp.services.srvAnalytics', function () {

'use strict';
        var log = null;

        var MockGaq1 = null;
        var MockGaq2 = null;
        var MockGaq3 = null;
        var srvLocalStorage = null;
        //var miappAnalytics = null;
        //var window.plugins.gaPlugin = null;

        //this.gaQueue = [];  //  GA official queue
        //this.gaPanalytics = [];     //  used ? todelete ?
        //this.gaPlugin = []; //  GAPlugin queue

        beforeEach(module('myAngularApp'));
        beforeEach(function () {

            MockGaq1 = (function() {
                function Service(statArray) {
                    this.list = [];
                }
                Service.prototype.push = function (statArray) {
                    this.list.push(statArray);
                };
                Service.prototype.create = function (statArray) {
                    //this.list.push(statArray);
                };
                Service.prototype.send = function (statArray) {
                    this.list.push(statArray);
                };
                return Service;
            })();
            MockGaq2 = (function() {
                function Service() {
                    this.list = [];
                }
                Service.prototype.trackEvent = function (a,b,c,d,e,f) {
                    var ar = ['_trackEvent',a,b,c,d,e,f];
                    this.list.push(ar);
                };
                Service.prototype.trackView = function (a,b,c,d,e,f) {
                    var ar = ['_trackView',a,b,c,d,e,f];
                    this.list.push(ar);
                };
                return Service;
            })();
            MockGaq3 = (function() {
                function Service() {
                    this.list = [];
                }
                Service.prototype.trackEvent = function (successHandler, errorHandler, a,b,c,d,e,f) {
                    var ar = ['_trackEvent',a,b,c,d,e,f];
                    this.list.push(ar);
                };
                Service.prototype.trackPage = function (successHandler, errorHandler, a,b,c,d,e,f) {
                    var ar = ['_trackPage',a,b,c,d,e,f];
                    this.list.push(ar);
                };
                Service.prototype.init = function (successHandler, errorHandler, UA_ID, chiffre) {
                   // this.list.push(statArray);
                   //console.log("GAPlugin init done");
                };

                return Service;
            })();

            var LocalStorage = miapp.LocalStorageFactory(new miapp.MemoryStorage());
            srvLocalStorage = new LocalStorage();
            //ga = new MockGaq1();
            ga = function(){};
            //analytics = new MockGaq2();
            window.plugins = []; window.plugins.gaPlugin = new MockGaq3();


            inject(function($injector) {
                log = console;//$injector.get('$log');
            });


        });

        afterEach(function () {
            //Online mode : reset
            miapp.BrowserCapabilities.online = navigator.onLine;
        });


        it('should be correctly initialized', function () {

            //miappAnalytics.init();
            var miappAnalytics = new SrvAnalytics(log, srvLocalStorage, 'UA-mocked-id', 'mockApp');
            miappAnalytics.init();
            expect(miappAnalytics.localStorage).toEqual(srvLocalStorage);
            expect(miappAnalytics.mAnalyticsArray.length).toEqual(0);
            expect(miappAnalytics.mAnalyticsFunctionnalitiesArray.length).toEqual(0);

            expect(miappAnalytics.gaQueue).toEqual(ga);
                        //expect(miappAnalytics.gaPanalytics).toEqual(analytics);
            expect(miappAnalytics.gaPlugin).toEqual(window.plugins.gaPlugin);

            expect(miappAnalytics.vid).toBe("mockApp");

            //expect(ga).toBe(2);
            //expect(ga.list.length).toBe(2);
            //expect(ga.list[0][0]).toBe('_setAccount');
            //expect(ga.list[0][1]).toBe('UA-mocked-id');
            //expect(ga.list[1][0]).toBe('_trackPageview');
        });


    /*
        it('should add single', function () {

            // Force offline mode : test queue
            miapp.BrowserCapabilities.online = false;

            var miappAnalytics = new SrvAnalytics(log, srvLocalStorage, 'UA-mocked-id', "mockApp");
            miappAnalytics.init();
            //expect(ga.list.length).toBe(2);
            var analyticsData = srvLocalStorage.get('miapp.Analytics', null);
            expect(analyticsData).toBeNull();

            miappAnalytics.add('Uses', 'SingleTest-1');
            //expect(ga.list.length).toBe(2);
            //expect(window.plugins.gaPlugin.list.length).toBe(2);
            analyticsData = srvLocalStorage.get('miapp.Analytics', null);
            expect(analyticsData.length).toBe(2);
            expect(analyticsData[0].vid).toBe('mockApp');
            expect(analyticsData[0].uid).toBe('uid_undefined');
            expect(analyticsData[0].type).toBe('event');
            expect(analyticsData[0].category).toBe('Uses');
            expect(analyticsData[0].action).toBe('SingleTest-1');
            expect(analyticsData[0].value).toBe(1);
            //expect(analyticsData[1].vid).toBe('vid_undefined');
            expect(analyticsData[1].uid).toBe('uid_undefined');
            expect(analyticsData[1].type).toBe('view');
            expect(analyticsData[1].category).toBe('Uses');
            expect(analyticsData[1].action).toBe('SingleTest-1');
            expect(analyticsData[1].value).toBe(1);

            miappAnalytics.run();
            //expect(ga.list.length).toBe(4);
            //expect(window.plugins.gaPlugin.list.length).toBe(2);
            //expect(ga.list[2][0]).toBe('_trackEvent');
            //expect(ga.list[2][1]).toBe('vid_undefined - Uses');
            //expect(ga.list[2][2]).toBe('Uses - SingleTest-1');
            //expect(ga.list[2][3]).toBe('uid_undefined');
            //expect(ga.list[2][4]).toBe(1);
            //expect(ga.list[3][0]).toBe('_trackPageview');
            //expect(ga.list[3][1]).toBe('vid_undefined - Uses - SingleTest-1');

            analyticsData = srvLocalStorage.get('miapp.Analytics', null);
            expect(analyticsData.length).toBe(0);

        });

        it('should add many', function () {

            // Force offline mode : test queue
            miapp.BrowserCapabilities.online = false;

            var miappAnalytics = new SrvAnalytics(log, srvLocalStorage, 'UA-mocked-id');
            miappAnalytics.init();
            //expect(ga.list.length).toBe(2);
            var analyticsData = srvLocalStorage.get('miapp.Analytics', null);
            expect(analyticsData).toBeNull();

            miappAnalytics.add('Uses', 'ManyTest-1');
            miappAnalytics.add('Uses', 'ManyTest-2',2);
            miappAnalytics.add('Interest', 'ManyTest-3',3);
            //expect(ga.list.length).toBe(2);
            //expect(window.plugins.gaPlugin.list.length).toBe(0);
            analyticsData = srvLocalStorage.get('miapp.Analytics', null);
            expect(analyticsData.length).toBe(6);
            //expect(analyticsData[2].vid).toBe('vid_undefined');
            expect(analyticsData[2].uid).toBe('uid_undefined');
            expect(analyticsData[2].type).toBe('event');
            expect(analyticsData[2].category).toBe('Uses');
            expect(analyticsData[2].action).toBe('ManyTest-2');
            expect(analyticsData[2].value).toBe(2);
            //expect(analyticsData[3].vid).toBe('vid_undefined');
            expect(analyticsData[3].uid).toBe('uid_undefined');
            expect(analyticsData[3].type).toBe('view');
            expect(analyticsData[3].category).toBe('Uses');
            expect(analyticsData[3].action).toBe('ManyTest-2');
            expect(analyticsData[3].value).toBe(2);

            miappAnalytics.run();
            //expect(ga.list.length).toBe(8);
            //expect(window.plugins.gaPlugin.list.length).toBe(6);
            //expect(ga.list[4][0]).toBe('_trackEvent');
            //expect(ga.list[4][1]).toBe('vid_undefined - Uses');
            //expect(ga.list[4][2]).toBe('Uses - ManyTest-2');
            //expect(ga.list[4][3]).toBe('uid_undefined');
            //expect(ga.list[4][4]).toBe(2);
            //expect(ga.list[5][0]).toBe('_trackPageview');
            //expect(ga.list[5][1]).toBe('vid_undefined - Uses - ManyTest-2');
            //expect(window.plugins.gaPlugin.list[4][0]).toBe('_trackEvent');
            //expect(window.plugins.gaPlugin.list[4][1]).toBe('vid_undefined - Interest');
            //expect(window.plugins.gaPlugin.list[4][2]).toBe('Interest - ManyTest-3');
            //expect(window.plugins.gaPlugin.list[4][3]).toBe('uid_undefined');
            //expect(window.plugins.gaPlugin.list[4][4]).toBe(3);

            analyticsData = srvLocalStorage.get('miapp.Analytics', null);
            expect(analyticsData.length).toBe(0);

        });

        */

        it('should add Once', function () {

            // Force offline mode : test queue
            miapp.BrowserCapabilities.online = false;

            var miappAnalytics = new miapp.Analytics(srvLocalStorage, 'UA-mocked-id');
            miappAnalytics.init();
            //expect(ga.list.length).toBe(2);
            var analyticsData = srvLocalStorage.get('miapp.Analytics', null);
            expect(analyticsData).toBeNull();

            miappAnalytics.add('Uses', 'OnceTest-1',0);
            miappAnalytics.add('Once', 'OnceTest-1');
            miappAnalytics.add('Once', 'OnceTest-1',30);
            miappAnalytics.add('Once', 'OnceTest-2',4);
            miappAnalytics.add('Interest', 'OnceTest-2',6);
            //expect(ga.list.length).toBe(2);
            expect(window.plugins.gaPlugin.list.length).toBe(0);
            analyticsData = srvLocalStorage.get('miapp.Analytics', null);
            expect(analyticsData.length).toBe(9);

            //expect(analyticsData[0].vid).toBe('vid_undefined');
            expect(analyticsData[0].uid).toBe('uid_undefined');
            expect(analyticsData[0].type).toBe('event');
            expect(analyticsData[0].category).toBe('Uses');
            expect(analyticsData[0].action).toBe('OnceTest-1');
            expect(analyticsData[0].value).toBe(1);

            //expect(analyticsData[2].vid).toBe('vid_undefined');
            expect(analyticsData[2].uid).toBe('uid_undefined');
            expect(analyticsData[2].type).toBe('event');
            expect(analyticsData[2].category).toBe('Once');
            expect(analyticsData[2].action).toBe('OnceTest-1');
            expect(analyticsData[2].value).toBe(1);

            //expect(analyticsData[4].vid).toBe('vid_undefined');
            expect(analyticsData[4].uid).toBe('uid_undefined');
            expect(analyticsData[4].type).toBe('view');
            expect(analyticsData[4].category).toBe('Once');
            expect(analyticsData[4].action).toBe('OnceTest-1');
            expect(analyticsData[4].value).toBe(30);

            //expect(analyticsData[5].vid).toBe('vid_undefined');
            expect(analyticsData[5].uid).toBe('uid_undefined');
            expect(analyticsData[5].type).toBe('event');
            expect(analyticsData[5].category).toBe('Once');
            expect(analyticsData[5].action).toBe('OnceTest-2');
            expect(analyticsData[5].value).toBe(4);

            //expect(analyticsData[7].vid).toBe('vid_undefined');
            expect(analyticsData[7].uid).toBe('uid_undefined');
            expect(analyticsData[7].type).toBe('event');
            expect(analyticsData[7].category).toBe('Interest');
            expect(analyticsData[7].action).toBe('OnceTest-2');
            expect(analyticsData[7].value).toBe(6);

            miappAnalytics.run();

            analyticsData = srvLocalStorage.get('miapp.Analytics', null);
            expect(analyticsData.length).toBe(0);

        });

        it('should be correctly customized', function () {

            //miappAnalytics.init();
            var analyticsData = null;
            var miappAnalytics = new miapp.Analytics(srvLocalStorage, 'UA-mocked-id');
            miappAnalytics.init();

            //Online mode : disable queue
            miapp.BrowserCapabilities.online = true;
            miappAnalytics.setVid('VID test');
            miappAnalytics.setUid('UID test');
            miappAnalytics.add('Uses', 'CustTest-1');
            analyticsData = srvLocalStorage.get('miapp.Analytics', null);
            expect(analyticsData.length).toBe(0);

            //Force offline mode : test queue
            miapp.BrowserCapabilities.online = false;
            miappAnalytics.add('Uses', 'CustTest-2');
            miappAnalytics.add('Uses', 'CustTest-3');
            analyticsData = srvLocalStorage.get('miapp.Analytics', null);
            expect(analyticsData.length).toBe(4);

            //Disabled
            miappAnalytics.setEnabled(false);
            miappAnalytics.add('Uses', 'CustTest-4');
            //expect(ga.list.length).toBe(4);
            miappAnalytics.run();
            analyticsData = srvLocalStorage.get('miapp.Analytics', null);
            expect(analyticsData.length).toBe(4);

            //Enabled
            miappAnalytics.setEnabled(true);
            miappAnalytics.run();
            analyticsData = srvLocalStorage.get('miapp.Analytics', null);
            expect(analyticsData.length).toBe(0);

        });

    });
