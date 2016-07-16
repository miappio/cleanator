'use strict';


// Namespace a4p
var a4p;
if (!a4p) a4p = {};


// GAnalytics possible queues cf analytics tests below
if (typeof _gaq === 'undefined') {
    var _gaq = null;
    //var analytics = null;
}



describe('a4p', function () {

    describe('Analytics', function () {

        var MockGaq1 = null;
        var MockGaq2 = null;
        var MockGaq3 = null;
        var srvLocalStorage = null;
        //var a4pAnalytics = null;
        //var window.plugins.gaPlugin = null;

        //this.gaQueue = [];  //  GA official queue
        //this.gaPanalytics = [];     //  used ? todelete ?
        //this.gaPlugin = []; //  GAPlugin queue

        beforeEach(function () {

            MockGaq1 = (function() {
                function Service() {
                    this.list = [];
                }
                Service.prototype.push = function (statArray) {
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
                   console.log("GAPlugin init done");
                };

                return Service;
            })();

            var LocalStorage = a4p.LocalStorageFactory(new a4p.MemoryStorage());
                srvLocalStorage = new LocalStorage();
            _gaq = new MockGaq1();
            //analytics = new MockGaq2();
            window.plugins = []; window.plugins.gaPlugin = new MockGaq3();

        });

        afterEach(function () {
            //Online mode : reset
            a4p.BrowserCapabilities.online = navigator.onLine;
        });


        it('should be correctly initialized', function () {

            //a4pAnalytics.init();
            var a4pAnalytics = new a4p.Analytics(srvLocalStorage, 'UA-mocked-id');
            a4pAnalytics.init();
            expect(a4pAnalytics.localStorage).toEqual(srvLocalStorage);
            expect(a4pAnalytics.mAnalyticsArray.length).toEqual(0);
            expect(a4pAnalytics.mAnalyticsFunctionnalitiesArray.length).toEqual(0);

            expect(a4pAnalytics.gaQueue).toEqual(_gaq);
            //expect(a4pAnalytics.gaPanalytics).toEqual(analytics);
            expect(a4pAnalytics.gaPlugin).toEqual(window.plugins.gaPlugin);

            expect(_gaq.list.length).toBe(2);
            expect(_gaq.list[0][0]).toBe('_setAccount');
            expect(_gaq.list[0][1]).toBe('UA-mocked-id');
            expect(_gaq.list[1][0]).toBe('_trackPageview');
        });

        it('should add single', function () {

            // Force offline mode : test queue
            a4p.BrowserCapabilities.online = false;

            var a4pAnalytics = new a4p.Analytics(srvLocalStorage, 'UA-mocked-id');
            a4pAnalytics.init();
            expect(_gaq.list.length).toBe(2);
            var analyticsData = srvLocalStorage.get('a4p.Analytics', null);
            expect(analyticsData).toBeNull();

            a4pAnalytics.add('Uses', 'SingleTest-1');
            expect(_gaq.list.length).toBe(2);
            expect(window.plugins.gaPlugin.list.length).toBe(0);
            analyticsData = srvLocalStorage.get('a4p.Analytics', null);
            expect(analyticsData.length).toBe(2);
            expect(analyticsData[0].vid).toBe('vid_undefined');
            expect(analyticsData[0].uid).toBe('uid_undefined');
            expect(analyticsData[0].type).toBe('event');
            expect(analyticsData[0].category).toBe('Uses');
            expect(analyticsData[0].action).toBe('SingleTest-1');
            expect(analyticsData[0].value).toBe(1);
            expect(analyticsData[1].vid).toBe('vid_undefined');
            expect(analyticsData[1].uid).toBe('uid_undefined');
            expect(analyticsData[1].type).toBe('view');
            expect(analyticsData[1].category).toBe('Uses');
            expect(analyticsData[1].action).toBe('SingleTest-1');
            expect(analyticsData[1].value).toBe(1);

            a4pAnalytics.run();
            expect(_gaq.list.length).toBe(4);
            expect(window.plugins.gaPlugin.list.length).toBe(2);
            expect(_gaq.list[2][0]).toBe('_trackEvent');
            expect(_gaq.list[2][1]).toBe('vid_undefined - Uses');
            expect(_gaq.list[2][2]).toBe('Uses - SingleTest-1');
            expect(_gaq.list[2][3]).toBe('uid_undefined');
            expect(_gaq.list[2][4]).toBe(1);
            expect(_gaq.list[3][0]).toBe('_trackPageview');
            expect(_gaq.list[3][1]).toBe('vid_undefined - Uses - SingleTest-1');

            analyticsData = srvLocalStorage.get('a4p.Analytics', null);
            expect(analyticsData.length).toBe(0);

        });

        it('should add many', function () {

            // Force offline mode : test queue
            a4p.BrowserCapabilities.online = false;

            var a4pAnalytics = new a4p.Analytics(srvLocalStorage, 'UA-mocked-id');
            a4pAnalytics.init();
            expect(_gaq.list.length).toBe(2);
            var analyticsData = srvLocalStorage.get('a4p.Analytics', null);
            expect(analyticsData).toBeNull();

            a4pAnalytics.add('Uses', 'ManyTest-1');
            a4pAnalytics.add('Uses', 'ManyTest-2',2);
            a4pAnalytics.add('Interest', 'ManyTest-3',3);
            expect(_gaq.list.length).toBe(2);
            expect(window.plugins.gaPlugin.list.length).toBe(0);
            analyticsData = srvLocalStorage.get('a4p.Analytics', null);
            expect(analyticsData.length).toBe(6);
            expect(analyticsData[2].vid).toBe('vid_undefined');
            expect(analyticsData[2].uid).toBe('uid_undefined');
            expect(analyticsData[2].type).toBe('event');
            expect(analyticsData[2].category).toBe('Uses');
            expect(analyticsData[2].action).toBe('ManyTest-2');
            expect(analyticsData[2].value).toBe(2);
            expect(analyticsData[3].vid).toBe('vid_undefined');
            expect(analyticsData[3].uid).toBe('uid_undefined');
            expect(analyticsData[3].type).toBe('view');
            expect(analyticsData[3].category).toBe('Uses');
            expect(analyticsData[3].action).toBe('ManyTest-2');
            expect(analyticsData[3].value).toBe(2);

            a4pAnalytics.run();
            expect(_gaq.list.length).toBe(8);
            expect(window.plugins.gaPlugin.list.length).toBe(6);
            expect(_gaq.list[4][0]).toBe('_trackEvent');
            expect(_gaq.list[4][1]).toBe('vid_undefined - Uses');
            expect(_gaq.list[4][2]).toBe('Uses - ManyTest-2');
            expect(_gaq.list[4][3]).toBe('uid_undefined');
            expect(_gaq.list[4][4]).toBe(2);
            expect(_gaq.list[5][0]).toBe('_trackPageview');
            expect(_gaq.list[5][1]).toBe('vid_undefined - Uses - ManyTest-2');
            expect(window.plugins.gaPlugin.list[4][0]).toBe('_trackEvent');
            expect(window.plugins.gaPlugin.list[4][1]).toBe('vid_undefined - Interest');
            expect(window.plugins.gaPlugin.list[4][2]).toBe('Interest - ManyTest-3');
            expect(window.plugins.gaPlugin.list[4][3]).toBe('uid_undefined');
            expect(window.plugins.gaPlugin.list[4][4]).toBe(3);

            analyticsData = srvLocalStorage.get('a4p.Analytics', null);
            expect(analyticsData.length).toBe(0);

        });

        it('should add Once', function () {

            // Force offline mode : test queue
            a4p.BrowserCapabilities.online = false;

            var a4pAnalytics = new a4p.Analytics(srvLocalStorage, 'UA-mocked-id');
            a4pAnalytics.init();
            expect(_gaq.list.length).toBe(2);
            var analyticsData = srvLocalStorage.get('a4p.Analytics', null);
            expect(analyticsData).toBeNull();

            a4pAnalytics.add('Uses', 'OnceTest-1',0);
            a4pAnalytics.add('Once', 'OnceTest-1');
            a4pAnalytics.add('Once', 'OnceTest-1',30);
            a4pAnalytics.add('Once', 'OnceTest-2',4);
            a4pAnalytics.add('Interest', 'OnceTest-2',6);
            expect(_gaq.list.length).toBe(2);
            expect(window.plugins.gaPlugin.list.length).toBe(0);
            analyticsData = srvLocalStorage.get('a4p.Analytics', null);
            expect(analyticsData.length).toBe(9);

            expect(analyticsData[0].vid).toBe('vid_undefined');
            expect(analyticsData[0].uid).toBe('uid_undefined');
            expect(analyticsData[0].type).toBe('event');
            expect(analyticsData[0].category).toBe('Uses');
            expect(analyticsData[0].action).toBe('OnceTest-1');
            expect(analyticsData[0].value).toBe(1);

            expect(analyticsData[2].vid).toBe('vid_undefined');
            expect(analyticsData[2].uid).toBe('uid_undefined');
            expect(analyticsData[2].type).toBe('event');
            expect(analyticsData[2].category).toBe('Once');
            expect(analyticsData[2].action).toBe('OnceTest-1');
            expect(analyticsData[2].value).toBe(1);

            expect(analyticsData[4].vid).toBe('vid_undefined');
            expect(analyticsData[4].uid).toBe('uid_undefined');
            expect(analyticsData[4].type).toBe('view');
            expect(analyticsData[4].category).toBe('Once');
            expect(analyticsData[4].action).toBe('OnceTest-1');
            expect(analyticsData[4].value).toBe(30);

            expect(analyticsData[5].vid).toBe('vid_undefined');
            expect(analyticsData[5].uid).toBe('uid_undefined');
            expect(analyticsData[5].type).toBe('event');
            expect(analyticsData[5].category).toBe('Once');
            expect(analyticsData[5].action).toBe('OnceTest-2');
            expect(analyticsData[5].value).toBe(4);

            expect(analyticsData[7].vid).toBe('vid_undefined');
            expect(analyticsData[7].uid).toBe('uid_undefined');
            expect(analyticsData[7].type).toBe('event');
            expect(analyticsData[7].category).toBe('Interest');
            expect(analyticsData[7].action).toBe('OnceTest-2');
            expect(analyticsData[7].value).toBe(6);

            a4pAnalytics.run();

            analyticsData = srvLocalStorage.get('a4p.Analytics', null);
            expect(analyticsData.length).toBe(0);

        });

        it('should be correctly customized', function () {

            //a4pAnalytics.init();
            var analyticsData = null;
            var a4pAnalytics = new a4p.Analytics(srvLocalStorage, 'UA-mocked-id');
            a4pAnalytics.init();

            //Online mode : disable queue
            a4p.BrowserCapabilities.online = true;
            a4pAnalytics.setVid('VID test');
            a4pAnalytics.setUid('UID test');
            a4pAnalytics.add('Uses', 'CustTest-1');
            analyticsData = srvLocalStorage.get('a4p.Analytics', null);
            expect(analyticsData.length).toBe(0);

            //Force offline mode : test queue
            a4p.BrowserCapabilities.online = false;
            a4pAnalytics.add('Uses', 'CustTest-2');
            a4pAnalytics.add('Uses', 'CustTest-3');
            analyticsData = srvLocalStorage.get('a4p.Analytics', null);
            expect(analyticsData.length).toBe(4);

            //Disabled
            a4pAnalytics.setEnabled(false);
            a4pAnalytics.add('Uses', 'CustTest-4');
            expect(_gaq.list.length).toBe(4);
            a4pAnalytics.run();
            analyticsData = srvLocalStorage.get('a4p.Analytics', null);
            expect(analyticsData.length).toBe(4);

            //Enabled
            a4pAnalytics.setEnabled(true);
            a4pAnalytics.run();
            analyticsData = srvLocalStorage.get('a4p.Analytics', null);
            expect(analyticsData.length).toBe(0);

        });

    });


});
