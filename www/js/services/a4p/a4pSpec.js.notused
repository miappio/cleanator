


// GAnalytics possible queues cf analytics tests below
if (typeof _gaq === 'undefined') {
    var _gaq = null;
    //var analytics = null;
}

var testSrv = (function() {
    var privateClassVar = 0;

    function Service() {
        this.status = '';
    }
    Service.prototype.setStatus = function (status) {
        this.status = status;
    };
    Service.prototype.incrVar = function () {
        privateClassVar++;
    };
    Service.prototype.getVar = function () {
        return privateClassVar;
    };
    return Service;
})();


describe('a4p', function () {
'use strict';

    describe('formatError', function () {

        it('should format exception correctly', function () {

            var e1 = new Error('message');
            var msg1 = a4p.formatError(e1);
            var lines1 = msg1.split('\n');
            expect(lines1[0]).toEqual('Error: message');
            //expect(lines1[1]).toMatch('    at Error \\(');
            expect(lines1[1]).toMatch(/at null\.<anonymous>/);
            expect(lines1[1]).toMatch(/unit\/a4p\/a4pSpec.js/);

            var msg2;
            try {
                (function errorFct() { throw new Error('message'); })();
            } catch(e) {
                msg2 = a4p.formatError(e);
            }
            expect(msg2).not.toBeUndefined();
            var lines2 = msg2.split('\n');
            expect(lines2[0]).toEqual('Error: message');
            //expect(lines2[1]).toMatch('    at Error \\(');
            expect(lines2[1]).toMatch(/at errorFct/);
            expect(lines2[1]).toMatch(/unit\/a4p\/a4pSpec.js/);

        });

    });

    describe('nextUid', function () {

        it('should work correctly', function () {

            var oldUid = a4p.uid;
            a4p.uid  = ['Z'];
            expect(a4p.getUid()).toEqual('Z');
            var id;
            for (var i=0; i<36; i++) {
                for (var j=0; j<36; j++) {
                    id = a4p.nextUid();
                    if ((i==0) && (j==0)) {
                        expect(id).toEqual('00');
                    }
                    expect(id[0]).toEqual(a4p.idStr[i]);
                    expect(id[1]).toEqual(a4p.idStr[j]);
                }
            }
            expect(id).toEqual('ZZ');
            expect(a4p.getUid()).toEqual('ZZ');

            a4p.initUid();
            expect(a4p.getUid()).toEqual('000');
            id = a4p.nextUid();
            expect(id).toEqual('001');
            expect(a4p.getUid()).toEqual('001');

            a4p.initUid('-5');
            expect(a4p.getUid()).toEqual('005');
            id = a4p.nextUid();
            expect(id).toEqual('006');
            expect(a4p.getUid()).toEqual('006');

            a4p.initUid('az4');
            expect(a4p.getUid()).toEqual('AZ4');
            id = a4p.nextUid();
            expect(id).toEqual('AZ5');
            expect(a4p.getUid()).toEqual('AZ5');

        });

    });

    describe('isUndefined', function () {

        it('should work correctly', function () {

            var u;
            var i = 0;
            expect(a4p.isUndefined(u)).toEqual(true);
            expect(a4p.isUndefined(undefined)).toEqual(true);
            expect(a4p.isUndefined(null)).toEqual(false);
            expect(a4p.isUndefined(i)).toEqual(false);
            expect(a4p.isUndefined({})).toEqual(false);
            expect(a4p.isUndefined([])).toEqual(false);

        });

    });

    describe('isDefined', function () {

        it('should work correctly', function () {

            var u;
            var i = 0;
            expect(a4p.isDefined(u)).toEqual(false);
            expect(a4p.isDefined(undefined)).toEqual(false);
            expect(a4p.isDefined(null)).toEqual(true);
            expect(a4p.isDefined(i)).toEqual(true);
            expect(a4p.isDefined({})).toEqual(true);
            expect(a4p.isDefined([])).toEqual(true);

        });

    });

    describe('isUndefinedOrNull', function () {

        it('should work correctly', function () {

            var u;
            var i = 0;
            expect(a4p.isUndefinedOrNull(u)).toEqual(true);
            expect(a4p.isUndefinedOrNull(undefined)).toEqual(true);
            expect(a4p.isUndefinedOrNull(null)).toEqual(true);
            expect(a4p.isUndefinedOrNull(i)).toEqual(false);
            expect(a4p.isUndefinedOrNull({})).toEqual(false);
            expect(a4p.isUndefinedOrNull([])).toEqual(false);

        });

    });

    describe('isDefinedAndNotNull', function () {

        it('should work correctly', function () {

            var u;
            var i = 0;
            expect(a4p.isDefinedAndNotNull(u)).toEqual(false);
            expect(a4p.isDefinedAndNotNull(undefined)).toEqual(false);
            expect(a4p.isDefinedAndNotNull(null)).toEqual(false);
            expect(a4p.isDefinedAndNotNull(i)).toEqual(true);
            expect(a4p.isDefinedAndNotNull({})).toEqual(true);
            expect(a4p.isDefinedAndNotNull([])).toEqual(true);

        });

    });

    describe('isEmptyOrFalse', function () {

        it('should work correctly for object', function () {
            var u;
            expect(a4p.isEmptyOrFalse(u)).toEqual(true);
            expect(a4p.isEmptyOrFalse(undefined)).toEqual(true);
            expect(a4p.isEmptyOrFalse(null)).toEqual(true);
            expect(a4p.isEmptyOrFalse({})).toEqual(true);
            expect(a4p.isEmptyOrFalse([])).toEqual(true);
            expect(a4p.isEmptyOrFalse({length:0})).toEqual(false);
            expect(a4p.isEmptyOrFalse({a:0})).toEqual(false);
            expect(a4p.isEmptyOrFalse(['a'])).toEqual(false);
        });

        it('should work correctly for string', function () {
            expect(a4p.isEmptyOrFalse("")).toEqual(true);
            expect(a4p.isEmptyOrFalse('')).toEqual(true);
            expect(a4p.isEmptyOrFalse('c')).toEqual(false);
        });

        it('should work correctly for number', function () {
            expect(a4p.isEmptyOrFalse(0)).toEqual(true);
            expect(a4p.isEmptyOrFalse(1)).toEqual(false);
        });

        it('should work correctly for boolean', function () {
            expect(a4p.isEmptyOrFalse(false)).toEqual(true);
            expect(a4p.isEmptyOrFalse(true)).toEqual(false);
        });

        it('should work correctly for function', function () {
            expect(a4p.isEmptyOrFalse(function(){})).toEqual(false);
        });

    });

    describe('isTrueOrNonEmpty', function () {

        it('should work correctly for object', function () {
            var u;
            expect(a4p.isTrueOrNonEmpty(u)).toEqual(false);
            expect(a4p.isTrueOrNonEmpty(undefined)).toEqual(false);
            expect(a4p.isTrueOrNonEmpty(null)).toEqual(false);
            expect(a4p.isTrueOrNonEmpty({})).toEqual(false);
            expect(a4p.isTrueOrNonEmpty([])).toEqual(false);
            expect(a4p.isTrueOrNonEmpty({length:0})).toEqual(true);
            expect(a4p.isTrueOrNonEmpty({a:0})).toEqual(true);
            expect(a4p.isTrueOrNonEmpty(['a'])).toEqual(true);
        });

        it('should work correctly for string', function () {
            expect(a4p.isTrueOrNonEmpty("")).toEqual(false);
            expect(a4p.isTrueOrNonEmpty('')).toEqual(false);
            expect(a4p.isTrueOrNonEmpty('c')).toEqual(true);
        });

        it('should work correctly for number', function () {
            expect(a4p.isTrueOrNonEmpty(0)).toEqual(false);
            expect(a4p.isTrueOrNonEmpty(1)).toEqual(true);
        });

        it('should work correctly for boolean', function () {
            expect(a4p.isTrueOrNonEmpty(false)).toEqual(false);
            expect(a4p.isTrueOrNonEmpty(true)).toEqual(true);
        });

        it('should work correctly for function', function () {
            expect(a4p.isTrueOrNonEmpty(function(){})).toEqual(true);
        });

    });

    describe('safeApply', function () {

        it('TODO', function () {

            /*
            var injector = angular.injector();
            expect(injector.invoke(function() {
                $rootScope.a = 1;
                $rootScope.b = 2;
                $rootScope.c = 0;
                a4p.safeApply($rootScope, 'c = a+b');
                return $rootScope.c;
            })).toBe(3);
            */

        });

    });

    describe('promiseWakeup', function () {

        it('TODO', function () {

        });

    });

    describe('promiseWakeup', function () {

        it('TODO', function () {

        });

    });

    describe('private class variable', function () {

        it('should instanciate 2 services => same privateClassVar', function () {
            var srv1 = new testSrv();
            var srv2 = new testSrv();

            expect(srv1.getVar()).toEqual(0);
            expect(srv2.getVar()).toEqual(0);
            srv1.incrVar();
            expect(srv1.getVar()).toEqual(1);
            expect(srv2.getVar()).toEqual(1);
        });

    });

    describe('a4.isEmpty', function () {

        it('typeof', function () {
            var a;
            expect(typeof({})).toEqual('object');
            expect(typeof([])).toEqual('object');
            expect(typeof(null)).toEqual('object');
            expect(typeof('')).toEqual('string');
            expect(typeof(0)).toEqual('number');
            expect(typeof(false)).toEqual('boolean');
            expect(typeof(function() {})).toEqual('function');
            expect(typeof(a)).toEqual('undefined');
            expect(typeof(undefined)).toEqual('undefined');
        });

        it('truthy', function () {
            expect({}).toBeTruthy();
            expect([]).toBeTruthy();
            expect(function() {}).toBeTruthy();
        });

        it('falsy', function () {
            var a;
            expect(null).toBeFalsy();
            expect('').toBeFalsy();
            expect(0).toBeFalsy();
            expect(false).toBeFalsy();
            expect(a).toBeFalsy();
            expect(undefined).toBeFalsy();
        });

    });

    describe('array copy', function () {

        it('should not do a deep copy, but only a pointers copy', function () {

            var v1 = [];
            v1.push({a:'a1', b:'b1'});
            v1.push({a:'a2', b:'b2'});
            expect(v1.length).toBe(2);
            expect(v1[0].a).toBe('a1');
            expect(v1[0].b).toBe('b1');
            expect(v1[1].a).toBe('a2');
            expect(v1[1].b).toBe('b2');

            var v2 = v1.slice(0);
            expect(v2.length).toBe(2);
            expect(v2[0].a).toBe('a1');
            expect(v2[0].b).toBe('b1');
            expect(v2[1].a).toBe('a2');
            expect(v2[1].b).toBe('b2');

            v2[0].a = 'c3';
            expect(v2.length).toBe(2);
            expect(v2[0].a).toBe('c3');
            expect(v2[0].b).toBe('b1');
            expect(v2[1].a).toBe('a2');
            expect(v2[1].b).toBe('b2');
            expect(v1.length).toBe(2);
            expect(v1[0].a).toBe('c3');
            expect(v1[0].b).toBe('b1');
            expect(v1[1].a).toBe('a2');
            expect(v1[1].b).toBe('b2');
        });

    });

    describe('string and number comparison', function () {

        it('should equals 0 and ""', function () {
            expect(0 == '').toBe(true);
            expect(0 != '').toBe(false);
            expect(0 === '').toBe(false);
            expect(0 !== '').toBe(true);
            expect(0).not.toEqual('');
        });

        it('should have length attribute undefined for number', function () {
            var number = 0;
            expect(number.length).toBeUndefined();
            number = 24513;
            expect(number.length).toBeUndefined();
        });

        it('should have typeof() for string or number', function () {
            var s = '';
            expect(typeof(s)).toBe('string');
            var number = 0;
            expect(typeof(number)).toBe('number');
        });

    });

    describe('Log', function () {

        it('should log correctly', function () {

            var calls = [];
            var log = new a4p.Log(2);
            var h = log.addListener(function(id, logEntry) {
                calls.push({
                    'date':logEntry.date,
                    'msg':logEntry.msg,
                    'details':logEntry.details
                })
            });
            expect(h).toEqual(1);
            expect(log.callbackHandle).toEqual(1);
            expect(log.callbacks.length).toEqual(1);
            expect(log.nbMax).toEqual(2);
            expect(log.logEntries.length).toEqual(0);

            log.log('m1', 'd1');
            log.log('m2', 'd2');
            expect(log.logEntries.length).toEqual(2);
            expect(log.logEntries[0].msg).toEqual('m1');
            expect(log.logEntries[0].details).toEqual('d1');
            expect(log.logEntries[1].msg).toEqual('m2');
            expect(log.logEntries[1].details).toEqual('d2');

            log.log('m3', 'd3');
            expect(log.logEntries.length).toEqual(2);
            expect(log.logEntries[0].msg).toEqual('m2');
            expect(log.logEntries[0].details).toEqual('d2');
            expect(log.logEntries[1].msg).toEqual('m3');
            expect(log.logEntries[1].details).toEqual('d3');
            expect(calls.length).toEqual(3);
            expect(calls[0].msg).toEqual('m1');
            expect(calls[0].details).toEqual('d1');
            expect(calls[1].msg).toEqual('m2');
            expect(calls[1].details).toEqual('d2');
            expect(calls[2].msg).toEqual('m3');
            expect(calls[2].details).toEqual('d3');

            log.cancelListener(h);
            expect(log.callbacks.length).toEqual(0);
            log.log('m4', 'd4');
            expect(log.logEntries.length).toEqual(2);
            expect(log.logEntries[0].msg).toEqual('m3');
            expect(log.logEntries[0].details).toEqual('d3');
            expect(log.logEntries[1].msg).toEqual('m4');
            expect(log.logEntries[1].details).toEqual('d4');
            expect(calls.length).toEqual(3);
            expect(calls[0].msg).toEqual('m1');
            expect(calls[0].details).toEqual('d1');
            expect(calls[1].msg).toEqual('m2');
            expect(calls[1].details).toEqual('d2');
            expect(calls[2].msg).toEqual('m3');
            expect(calls[2].details).toEqual('d3');

            log.setNbMax(1);
            expect(log.logEntries.length).toEqual(1);
            expect(log.logEntries[0].msg).toEqual('m4');
            expect(log.logEntries[0].details).toEqual('d4');

            log.setNbMax(2);
            expect(log.logEntries.length).toEqual(1);
            expect(log.logEntries[0].msg).toEqual('m4');
            expect(log.logEntries[0].details).toEqual('d4');
            expect(log.getLog().length).toEqual(1);
            expect(log.getLog()[0].msg).toEqual('m4');
            expect(log.getLog()[0].details).toEqual('d4');

            log.clearLog();
            expect(log.logEntries.length).toEqual(0);

        });

        it('should have a4p.ErrorLog defined', function () {

            expect(a4p.ErrorLog).not.toBeUndefined();

            a4p.ErrorLog.log('m5', 'd5');
            expect(a4p.ErrorLog.getLog().length).toBeGreaterThan(0);
            expect(a4p.ErrorLog.getLog()[a4p.ErrorLog.getLog().length-1].msg).toEqual('m5');
            expect(a4p.ErrorLog.getLog()[a4p.ErrorLog.getLog().length-1].details).toEqual('d5');

        });

        it('should have a4p.InternalLog defined', function () {

            expect(a4p.InternalLog).not.toBeUndefined();

            a4p.InternalLog.log('m5', 'd5');
            expect(a4p.InternalLog.getLog().length).toBeGreaterThan(0);
            expect(a4p.InternalLog.getLog()[a4p.InternalLog.getLog().length-1].msg).toEqual('m5');
            expect(a4p.InternalLog.getLog()[a4p.InternalLog.getLog().length-1].details).toEqual('d5');

        });

    });

    describe('md5', function () {

        it('should hash correctly', function () {

            expect(calcMD5('')).toEqual('d41d8cd98f00b204e9800998ecf8427e');
            expect(calcMD5('a')).toEqual('0cc175b9c0f1b6a831c399e269772661');
            expect(calcMD5('abc')).toEqual('900150983cd24fb0d6963f7d28e17f72');
            expect(calcMD5('message digest')).toEqual('f96b697d7cb7938d525a2f31aaf161d0');
            expect(calcMD5('abcdefghijklmnopqrstuvwxyz')).toEqual('c3fcd3d76192e4007dfb496cca67e13b');
            expect(calcMD5('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')).toEqual('d174ab98d277d9f5a5611c2c9f419d9f');
            expect(calcMD5('12345678901234567890123456789012345678901234567890123456789012345678901234567890')).toEqual('57edf4a22be3c955ac49da2e2107b67a');

        });

        it('should encode a token correctly', function () {

            var time = 1366725395; //Math.floor(new Date().getTime()/1000);// seconds since 1/1/1970 // ex: 1578
            var md5 = calcMD5(time.toString() + '|' + 'toto' + '|' + 'titi');
            var token = '0|encoded|sign';
            expect(time + '|' + md5 + '|' + token).toEqual('1366725395|8a22055c114c386ae11e495d35be00f1|0|encoded|sign');

        });

    });

    describe('Date', function () {

        it('should create correctly', function () {

            var date = new Date(2013, 2, 11, 17, 0, 0, 0);
            expect(date.getFullYear()).toEqual(2013);
            expect(date.getMonth()).toEqual(2);
            expect(date.getDate()).toEqual(11);
            expect(date.getHours()).toEqual(17);
            expect(date.getMinutes()).toEqual(0);
            expect(date.getSeconds()).toEqual(0);

            expect(date.toString().substr(0, 25)).toEqual('Mon Mar 11 2013 17:00:00 ');

        });

        it('should parse correctly', function () {

            var text = "2013-03-11 17:00:00";
            // Date
            var dateStr = text.substring(0,10).replace(/-/g,'');
            var yearS = parseInt(dateStr.substring(0,4), 10) || 1970;
            var monthS = (parseInt(dateStr.substring(4,6), 10) || 1) - 1;
            var dayS = parseInt(dateStr.substring(6,8), 10) || 1;

            // Time
            var timeStr = text.substring(11,19).replace(/:/g,'');
            var hourS = parseInt(timeStr.substring(0,2), 10) || 0;
            var minuteS = parseInt(timeStr.substring(2,4), 10) || 0;
            var secS = parseInt(timeStr.substring(4,6), 10) || 0;

            var date = new Date(yearS, monthS, dayS, hourS,  minuteS,  secS, 0);
            expect(date.getFullYear()).toEqual(2013);
            expect(date.getMonth()).toEqual(2);
            expect(date.getDate()).toEqual(11);
            expect(date.getHours()).toEqual(17);
            expect(date.getMinutes()).toEqual(0);
            expect(date.getSeconds()).toEqual(0);

            expect(date.toString().substr(0, 25)).toEqual('Mon Mar 11 2013 17:00:00 ');

        });

    });

    describe('Hex', function () {

        it('should encode correctly', function () {

            expect(a4p.Hex.encode("01aA")).toEqual("30316141");
            expect(a4p.Hex.encode("Hi!")).toEqual("486921");
            expect(a4p.Hex.encode("\u0089PNG")).toEqual("89504e47");

        });

        it('should decode correctly', function () {

            expect(a4p.Hex.decode("30316141")).toEqual("01aA");
            expect(a4p.Hex.decode("486921")).toEqual("Hi!");
            expect(a4p.Hex.decode("89504e47")).toEqual("\u0089PNG");

        });

    });

    describe('Utf8', function () {

        var utf8ArrayBase = null;
        var utf8Base = null;
        beforeEach(function () {
            utf8ArrayBase = a4p.Base64.decodeToUint8Array("QmFzZSA2NCDigJQgTW96aWxsYSBEZXZlbG9wZXIgTmV0d29yaw==");
            utf8Base = a4p.Base64.decode("QmFzZSA2NCDigJQgTW96aWxsYSBEZXZlbG9wZXIgTmV0d29yaw==");
        });


        it('should encode correctly', function () {

            expect(a4p.Utf8.encodeToUint8Array("Base 64 \u2014 Mozilla Developer Network")).toEqual(utf8ArrayBase);
            expect(a4p.Utf8.encode("Base 64 \u2014 Mozilla Developer Network")).toEqual(utf8Base);

        });

        it('should decode correctly', function () {

            expect(a4p.Utf8.decodeFromUint8Array(utf8ArrayBase)).toEqual("Base 64 \u2014 Mozilla Developer Network");
            expect(a4p.Utf8.decode(utf8Base)).toEqual("Base 64 \u2014 Mozilla Developer Network");

        });

    });

    describe('Base64', function () {

        it('should encode correctly', function () {

            expect(a4p.Base64.encode('123')).toEqual('MTIz');
            expect(a4p.Base64.encode('123456')).toEqual('MTIzNDU2');
            expect(a4p.Base64.encode('123456789')).toEqual('MTIzNDU2Nzg5');

            expect(a4p.Base64.encode("Hi!")).toEqual("SGkh");
            expect(a4p.Base64.encode("\u0089PNG")).toEqual("iVBORw==");

        });

        it('should decode correctly', function () {

            expect(a4p.Base64.decode('MTIz')).toEqual('123');
            expect(a4p.Base64.decode('MTIzNDU2')).toEqual('123456');
            expect(a4p.Base64.decode('MTIzNDU2Nzg5')).toEqual('123456789');

            expect(a4p.Base64.decode("SGkh")).toEqual("Hi!");
            expect(a4p.Base64.decode("iVBORw==")).toEqual("\u0089PNG");

        });

        it('should encode and decode correctly', function () {

            expect(encodeURIComponent(a4p.Base64.encode("Hello, World!"))).toEqual("SGVsbG8sIFdvcmxkIQ%3D%3D");
            //expect(encodeURIComponent(a4p.Base64.encode("Hello%2C%20World!"))).toEqual("SGVsbG8sIFdvcmxkIQ%3D%3D");

            var sMyInput = "Base 64 \u2014 Mozilla Developer Network";

            var aMyUTF8Input = a4p.Utf8.encodeToUint8Array(sMyInput);
            var sMyBase64 = a4p.Base64.encodeFromUint8Array(aMyUTF8Input);

            var aMyUTF8Input2 = a4p.Utf8.encode(sMyInput);
            var sMyBase644 = a4p.Base64.encode(aMyUTF8Input2);

            expect(sMyBase64).toEqual("QmFzZSA2NCDigJQgTW96aWxsYSBEZXZlbG9wZXIgTmV0d29yaw==");
            expect(sMyBase644).toEqual("QmFzZSA2NCDigJQgTW96aWxsYSBEZXZlbG9wZXIgTmV0d29yaw==");

            var aMyUTF8Output = a4p.Base64.decodeToUint8Array(sMyBase64);
            var sMyOutput = a4p.Utf8.decodeFromUint8Array(aMyUTF8Output);

            var aMyUTF8Output2 = a4p.Base64.decode(sMyBase64);
            var sMyOutput4 = a4p.Utf8.decode(aMyUTF8Output2);

            expect(sMyOutput).toEqual(sMyInput);
            expect(sMyOutput4).toEqual(sMyInput);

        });

        it('should calculate pixel size correctly', function () {

            expect(a4pTranslateDateToPx('2013-05-13 00:00:00', 100)).toEqual(0);
            expect(a4pTranslateDateToPx('2013-05-13 12:00:00', 100)).toEqual(50);
            expect(a4pTranslateDateToPx('2013-05-13 23:59:00', 100)).toEqual(100);
        });

        it('should calculate pixel diff correctly', function () {

            expect(a4pTranslateDatesToPxSize('2013-05-13 00:00:00', '2013-05-13 00:00:00', 100)).toEqual(0);
            expect(a4pTranslateDatesToPxSize('2013-05-13 12:00:00', '2013-05-13 13:00:00', 24)).toEqual(1);
            expect(a4pTranslateDatesToPxSize('2013-05-13 00:00:00', '2013-05-13 12:00:00', 100)).toEqual(50);
            expect(a4pTranslateDatesToPxSize('2013-05-13 00:00:00', '2013-05-13 23:59:00', 100)).toEqual(100);
        });

        it('should format date correctly', function () {

            var dateS = "2013-05-13";
            var timeS = "09:35:12";
            var myDate1_s = dateS+' '+timeS;
            var myDate1_d = a4pDateParse(myDate1_s);
            var myDate1_s2 = a4pDateFormat(myDate1_d);
            var myDate1_s3 = a4pDateFormatObject(myDate1_d);
            var myDate1_s4 = a4pDateFormatObject(myDate1_s2);
            var myDate1_datepart = a4pDateExtractDate(myDate1_s4);
            var myDate1_timepart = a4pDateExtractTime(myDate1_s4);

            expect(myDate1_s).toEqual(myDate1_s2);
            expect(myDate1_s).toEqual(myDate1_s3);
            expect(myDate1_s).toEqual(myDate1_s4);
            expect(dateS).toEqual(myDate1_datepart);
            expect(timeS).toEqual(myDate1_timepart);
        });

    });

    describe('Sha1', function () {

        it('should hash correctly', function () {

            expect(a4p.Hex.encode(a4p.Sha1.hash("toto"))).toEqual('0b9c2625dc21ef05f6ad4ddf47c5f203837aa32c');
            expect(a4p.Hex.encode(a4p.Sha1.hash("abc"))).toEqual('a9993e364706816aba3e25717850c26c9cd0d89d');
            expect(a4p.Hex.encode(a4p.Sha1.hash("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq"))).toEqual('84983e441c3bd26ebaae4aa1f95129e5e54670f1');
            var a = '';
            for (var i=0; i<1000000; i++) { a += 'a'; }
            expect(a4p.Hex.encode(a4p.Sha1.hash(a))).toEqual('34aa973cd4c4daa4f61eeb2bdbad27316534016f');
            var b = '';
            for (var i=0; i<10; i++) { b += '0123456701234567012345670123456701234567012345670123456701234567'; }
            expect(a4p.Hex.encode(a4p.Sha1.hash(b))).toEqual('dea356a2cddd90c7a7ecedc5ebb563934f460452');

        });

    });

    describe('Aes', function () {

        it('should encrypt correctly', function () {

            var key128 = a4p.Hex.decode('000102030405060708090a0b0c0d0e0f');
            //var key128 = a4p.Hex.decode('2b7e151628aed2a6abf7158809cf4f3c');
            var plaintext = a4p.Hex.decode('00112233445566778899aabbccddeeff');
            var ciphertext = a4p.Hex.decode('69c4e0d86a7b0430d8cdb78070b4c55a');
            var c = a4p.Aes.encrypt(plaintext, key128);
            //console.log('encrypt(plaintext, key128)='+a4p.Hex.encode(c));
            expect(c).toEqual(ciphertext);
            c = a4p.Aes.decrypt(ciphertext, key128);
            //console.log('decrypt(ciphertext, key128)='+a4p.Hex.encode(c));
            expect(c).toEqual(plaintext);

            var key128 = a4p.Hex.decode('E8E9EAEBEDEEEFF0F2F3F4F5F7F8F9FA');
            var plaintext = a4p.Hex.decode('014BAF2278A69D331D5180103643E99A');
            var ciphertext = a4p.Hex.decode('6743C3D1519AB4F2CD9A78AB09A511BD');
            var c = a4p.Aes.encrypt(plaintext, key128);
            //console.log('encrypt(plaintext, key128)='+a4p.Hex.encode(c));
            expect(c).toEqual(ciphertext);
            c = a4p.Aes.decrypt(ciphertext, key128);
            //console.log('decrypt(ciphertext, key128)='+a4p.Hex.encode(c));
            expect(c).toEqual(plaintext);

            var key192 = a4p.Hex.decode('04050607090A0B0C0E0F10111314151618191A1B1D1E1F20');
            plaintext = a4p.Hex.decode('76777475F1F2F3F4F8F9E6E777707172');
            ciphertext = a4p.Hex.decode('5d1ef20dced6bcbc12131ac7c54788aa');
            c = a4p.Aes.encrypt(plaintext, key192);
            //console.log('encrypt(plaintext, key192)='+a4p.Hex.encode(c));
            expect(c).toEqual(ciphertext);
            c = a4p.Aes.decrypt(ciphertext, key192);
            //console.log('decrypt(ciphertext, key192)='+a4p.Hex.encode(c));
            expect(c).toEqual(plaintext);

            var key256 = a4p.Hex.decode('08090A0B0D0E0F10121314151718191A1C1D1E1F21222324262728292B2C2D2E');
            plaintext = a4p.Hex.decode('069A007FC76A459F98BAF917FEDF9521');
            ciphertext = a4p.Hex.decode('080e9517eb1677719acf728086040ae3');
            c = a4p.Aes.encrypt(plaintext, key256);
            //console.log('encrypt(plaintext, key256)='+a4p.Hex.encode(c));
            expect(c).toEqual(ciphertext);
            c = a4p.Aes.decrypt(ciphertext, key256);
            //console.log('decrypt(ciphertext, key256)='+a4p.Hex.encode(c));
            expect(c).toEqual(plaintext);

        });

    });

    describe('StringFormat', function () {

        it('should format multiple arguments', function () {

            var str = "{0} is a {1} and likes to {2}";
            expect(a4pFormat(str, "a", "b", "c d")).toEqual("a is a b and likes to c d");

        });

        it('should format repetitive pattern', function () {

            var str = "{0} is a {0} is a {0} and {1}";
            expect(a4pFormat(str, "a")).toEqual("a is a a is a a and {1}");

        });

        it('should find the first day of month/week', function () {

            var date = a4pFirstDayOfMonth(2013, 7);// Lundi 2013-07-01
            expect(date.getDay()).toEqual(1);
            expect(date.getDate()).toEqual(1);
            expect(date.getMonth()).toEqual(6);
            expect(date.getFullYear()).toEqual(2013);
            var date2 = a4pDayOfSameWeek(date, 1);// Lundi 2013-07-01
            expect(date2.getDay()).toEqual(1);
            expect(date2.getDate()).toEqual(1);
            expect(date2.getMonth()).toEqual(6);
            expect(date2.getFullYear()).toEqual(2013);

            date = a4pFirstDayOfMonth(2013, 8);// Jeudi 2013-08-01
            expect(date.getDay()).toEqual(4);
            expect(date.getDate()).toEqual(1);
            expect(date.getMonth()).toEqual(7);
            expect(date.getFullYear()).toEqual(2013);
            date2 = a4pDayOfSameWeek(date, 1);// Lundi 2013-07-29
            expect(date2.getDay()).toEqual(1);
            expect(date2.getDate()).toEqual(29);
            expect(date2.getMonth()).toEqual(6);
            expect(date2.getFullYear()).toEqual(2013);

            date = a4pFirstDayOfMonth(2013, 9);// Dimanche 2013-09-01
            expect(date.getDay()).toEqual(0);
            expect(date.getDate()).toEqual(1);
            expect(date.getMonth()).toEqual(8);
            expect(date.getFullYear()).toEqual(2013);
            date2 = a4pDayOfSameWeek(date, 1);// Lundi 2013-08-26
            expect(date2.getDay()).toEqual(1);
            expect(date2.getDate()).toEqual(26);
            expect(date2.getMonth()).toEqual(7);
            expect(date2.getFullYear()).toEqual(2013);

        });

        it('should find the last day of month/week', function () {

            var date = a4pLastDayOfMonth(2012, 2);// Mercredi 2012-02-29
            expect(date.getDay()).toEqual(3);
            expect(date.getDate()).toEqual(29);
            expect(date.getMonth()).toEqual(1);
            expect(date.getFullYear()).toEqual(2012);
            var date2 = a4pDayOfSameWeek(date, 7);// Dimanche 2012-03-04
            expect(date2.getDay()).toEqual(0);
            expect(date2.getDate()).toEqual(4);
            expect(date2.getMonth()).toEqual(2);
            expect(date2.getFullYear()).toEqual(2012);

            date = a4pLastDayOfMonth(2012, 4);// Lundi 2012-04-30
            expect(date.getDay()).toEqual(1);
            expect(date.getDate()).toEqual(30);
            expect(date.getMonth()).toEqual(3);
            expect(date.getFullYear()).toEqual(2012);
            date2 = a4pDayOfSameWeek(date, 7);// Dimanche 2012-05-06
            expect(date2.getDay()).toEqual(0);
            expect(date2.getDate()).toEqual(6);
            expect(date2.getMonth()).toEqual(4);
            expect(date2.getFullYear()).toEqual(2012);

            date = a4pLastDayOfMonth(2012, 9);// Dimanche 2012-09-30
            expect(date.getDay()).toEqual(0);
            expect(date.getDate()).toEqual(30);
            expect(date.getMonth()).toEqual(8);
            expect(date.getFullYear()).toEqual(2012);
            date2 = a4pDayOfSameWeek(date, 7);// Dimanche 2012-09-30
            expect(date2.getDay()).toEqual(0);
            expect(date2.getDate()).toEqual(30);
            expect(date2.getMonth()).toEqual(8);
            expect(date2.getFullYear()).toEqual(2012);

        });

        it('should get the week number', function () {

            var date = new Date(2014, 11, 29);// 2014-12-29 => week 1 of 2015
            expect(a4pWeek(date)).toEqual(1);

            date = new Date(2012, 0, 1);// 2012-01-01 => week 52 of 2011
            expect(a4pWeek(date)).toEqual(52);

            date = new Date(2004, 11, 26);// Dimanche 2004-12-26 => week 52 of 2004
            expect(date.getDay()).toEqual(0);
            expect(a4pWeek(date)).toEqual(52);

            date = new Date(2004, 11, 27);// Lundi 2004-12-27 => week 53 of 2004
            expect(date.getDay()).toEqual(1);
            expect(a4pWeek(date)).toEqual(53);

            date = new Date(2005, 0, 1);// Samedi 2005-01-01 => week 53 of 2004
            expect(date.getDay()).toEqual(6);
            expect(a4pWeek(date)).toEqual(53);

            date = new Date(2005, 0, 2);// Dimanche 2005-01-02 => week 53 of 2004
            expect(date.getDay()).toEqual(0);
            expect(a4pWeek(date)).toEqual(53);

            date = new Date(2007, 0, 1);// Lundi 2007-01-01 => week 1 of 2007
            expect(date.getDay()).toEqual(1);
            expect(a4pWeek(date)).toEqual(1);

            date = new Date(2007, 11, 30);// Dimanche 2007-12-30 => week 52 of 2007
            expect(date.getDay()).toEqual(0);
            expect(a4pWeek(date)).toEqual(52);

            date = new Date(2007, 11, 31);// Lundi 2007-12-21 => week 1 of 2008
            expect(date.getDay()).toEqual(1);
            expect(a4pWeek(date)).toEqual(1);

        });

    });

    describe('RegExp', function () {

        it('should find hh:mm:ss with double quoted string', function () {

            var parts, hourS, minuteS, secS;
            var reg=new RegExp("([01]\\d|2[0-3]):([0-5]\\d):([0-5]\\d)");
            var text = "dummy header 12 mars 2013 12:01:43.00 dummy footer";
            parts = text.match(reg);
            if (parts != null) {
                hourS = parts[1] || 0;
                minuteS = parts[2] || 0;
                secS = parts[3] || 0;
            } else {
                hourS = 0;
                minuteS = 0;
                secS = 0;
            }
            expect(hourS).toEqual('12');
            expect(minuteS).toEqual('01');
            expect(secS).toEqual('43');

        });

        it('should find hh:mm:ss with single quoted string', function () {

            var parts, hourS, minuteS, secS;
            var reg=new RegExp('([01]\\d|2[0-3]):([0-5]\\d):([0-5]\\d)');
            var text = "dummy header 12 mars 2013 12:01:43.00 dummy footer";
            parts = text.match(reg);
            if (parts != null) {
                hourS = parts[1] || 0;
                minuteS = parts[2] || 0;
                secS = parts[3] || 0;
            } else {
                hourS = 0;
                minuteS = 0;
                secS = 0;
            }
            expect(hourS).toEqual('12');
            expect(minuteS).toEqual('01');
            expect(secS).toEqual('43');

        });

    });

    describe('Json', function () {

        it('should have object2String() function', function () {

            var obj = new Array();
            obj.push({a:'b', c:'d'});
            obj.push({e:'f', g:'h'});
            var str = a4p.Json.object2String(obj);
            expect(str).toEqual('[{"a":"b","c":"d"},{"e":"f","g":"h"}]');

        });

        it('should have string2Object() function', function () {

            var obj = a4p.Json.string2Object('{"a":"b","c":"d"}');
            expect(obj.a).toEqual('b');
            expect(obj.c).toEqual('d');

        });

    });

    describe('Xml', function () {

        it('should have string2Xml() function', function () {

            var xml = a4p.Xml.string2Xml('<span><div><p></p></div></span>');

        });

        it('should have isXml() function', function () {

            var xml = a4p.Xml.string2Xml('<span><div><p></p></div></span>');
            expect(a4p.Xml.isXml(xml)).toBe(true);

        });

        it('should have xml2String() function', function () {

            var xml = a4p.Xml.string2Xml('<span><div><p></p></div></span>');
            expect(a4p.Xml.isXml(xml)).toBe(true);

            var str = a4p.Xml.xml2String(xml);
            expect(a4p.Xml.isXml(str)).toBe(false);

        });

        describe('xml2String()', function () {

            it('should format xml canonically', function () {

                var xml = a4p.Xml.string2Xml('<span><div><p></p></div></span>');
                expect(a4p.Xml.isXml(xml)).toBe(true);
                var str = a4p.Xml.xml2String(xml);
                expect(str).toEqual('<span><div><p/></div></span>');

            });

            it('should keep innerHtml', function () {

                var xml = a4p.Xml.string2Xml('<span><div><p> </p></div></span>');
                expect(a4p.Xml.isXml(xml)).toBe(true);
                var str = a4p.Xml.xml2String(xml);
                expect(str).toEqual('<span><div><p> </p></div></span>');

            });

            it('should keep space between nodes', function () {

                var xml = a4p.Xml.string2Xml(' <span> <div> <p> </p> </div> </span> ');
                expect(a4p.Xml.isXml(xml)).toBe(true);
                var str = a4p.Xml.xml2String(xml);
                expect(str).toEqual('<span> <div> <p> </p> </div> </span>');

            });

        });

    });

    describe('LocalStorage', function () {

        describe('with default storage', function () {

            var LocalStorage = null;
            var fs = null;
            beforeEach(function () {

                LocalStorage = new a4p.LocalStorageFactory();
                fs = new LocalStorage();

            });

            it('should be not null', function () {

                expect(fs).not.toBeNull();

            });

            it('should set a string item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', 'v');

                expect(v).toEqual('{"string":"v"}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v).toBe('v');

                v = fs.remove('a');
                expect(v).toBe(true);
                expect(fs.size()).toBe(0);

                v = fs.remove('a');
                expect(v).toBe(false);

            });

            it('should set a number item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', 15);

                expect(v).toEqual('{"number":15}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v).toBe(15);

                v = fs.clear();
                expect(v).toBe(true);
                expect(fs.size()).toBe(0);

                v = fs.clear();
                expect(v).toBe(false);

            });

            it('should set a boolean item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', true);

                expect(v).toEqual('{"bool":true}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v).toBe(true);

            });

            it('should set an object item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', {a:1, b:"s"});

                expect(v).toEqual('{"json":{"a":1,"b":"s"}}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v.a).toBe(1);
                expect(v.b).toBe('s');

            });

            it('should set an XML item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var xml = a4p.Xml.string2Xml('<span><div><p/></div></span>');
                var v = fs.set('a', xml);

                expect(v).toEqual('{"xml":"<span><div><p/></div></span>"}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');

                expect(v).not.toBeNull();
                expect(a4p.Xml.xml2String(v)).toEqual('<span><div><p/></div></span>');

            });

            it('should set null value', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', null);

                expect(v).toBe('null');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');

                expect(v).toBeNull();

            });

            it('should set undefined value', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var u;
                var v = fs.set('a', u);

                expect(typeof(u)).toEqual('undefined');
                expect(v).toBe('null');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');

                expect(v).toBeNull();

            });

            it('should reject function value', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;
                try {
                    var v = fs.set('a', function () {
                        return 1;
                    });
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Value type function is invalid. It must be null, undefined, xml, string, number, boolean or object');

                v = fs.get('a', 'default');

                expect(v).toBe('default');
                expect(fs.size()).toBe(0);

            });

            it('should reject number key', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;

                try {
                    var v = fs.set(2, 'v');
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');
                expect(fs.size()).toBe(0);

                try {
                    errorMsg = null;
                    var v = fs.get(2);
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');

            });

            it('should reject boolean key', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;

                try {
                    var v = fs.set(true, 'v');
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');
                expect(fs.size()).toBe(0);

                try {
                    errorMsg = null;
                    var v = fs.get(true);
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');

            });

            it('should reject object key', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;

                try {
                    var v = fs.set({a:"a", b:1}, 'v');
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');
                expect(fs.size()).toBe(0);

                try {
                    errorMsg = null;
                    var v = fs.get({a:"a", b:1});
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');

            });

            it('should browse all items with instance method', function () {

                function Index() {
                    this.list = [];
                }

                Index.prototype.add = function (n) {
                    this.list.push(n);
                };
                Index.prototype.get = function (n) {
                    return this.list[n];
                };
                Index.prototype.size = function () {
                    return this.list.length;
                };

                fs.clear();
                expect(fs.size()).toBe(0);

                fs.set('k', '1');
                fs.set('d', '2');
                fs.set('u', '3');

                expect(fs.size()).toBe(3);
                expect(fs.get('k')).toBe('1');
                expect(fs.get('d')).toBe('2');
                expect(fs.get('u')).toBe('3');

                var index = new Index();

                expect(index.size()).toBe(0);

                fs.foreach(Index.prototype.add, index);

                expect(index.size()).toBe(3);
                expect(index.get(0)).toBe('2');
                expect(index.get(1)).toBe('1');
                expect(index.get(2)).toBe('3');

            });

            it('should browse all items with class method', function () {

                var Index = (function () {
                    var list = [];

                    function Index() {
                    }

                    Index.add = function (n) {
                        list.push(n);
                    };
                    Index.get = function (n) {
                        return list[n];
                    };
                    Index.size = function () {
                        return list.length;
                    };

                    return Index;
                })();

                fs.clear();
                expect(fs.size()).toBe(0);

                fs.set('k', '1');
                fs.set('d', '2');
                fs.set('u', '3');

                expect(fs.size()).toBe(3);
                expect(fs.get('k')).toBe('1');
                expect(fs.get('d')).toBe('2');
                expect(fs.get('u')).toBe('3');
                expect(Index.size()).toBe(0);

                fs.foreach(Index.add);

                expect(Index.size()).toBe(3);
                expect(Index.get(0)).toBe('2');
                expect(Index.get(1)).toBe('1');
                expect(Index.get(2)).toBe('3');

            });

            it('should browse all items with function', function () {

                var list = [];

                fs.clear();
                expect(fs.size()).toBe(0);

                fs.set('k', '1');
                fs.set('d', '2');
                fs.set('u', '3');

                expect(fs.size()).toBe(3);
                expect(fs.get('k')).toBe('1');
                expect(fs.get('d')).toBe('2');
                expect(fs.get('u')).toBe('3');
                expect(list.length).toBe(0);

                fs.foreach(function (n) {
                    list.push(n);
                });

                expect(list.length).toBe(3);
                expect(list[0]).toBe('2');
                expect(list[1]).toBe('1');
                expect(list[2]).toBe('3');

            });

        });

        describe('with window storage', function () {

            var LocalStorage = null;
            var fs = null;
            beforeEach(function () {
                LocalStorage = new a4p.LocalStorageFactory(window.localStorage);
                fs = new LocalStorage();
            });

            it('should be not null', function () {

                expect(fs).not.toBeNull();

            });

            it('should set a string item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', 'v');

                expect(v).toEqual('{"string":"v"}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v).toBe('v');

                v = fs.remove('a');
                expect(v).toBe(true);
                expect(fs.size()).toBe(0);

                v = fs.remove('a');
                expect(v).toBe(false);

            });

            it('should set a number item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', 15);

                expect(v).toEqual('{"number":15}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v).toBe(15);

                v = fs.clear();
                expect(v).toBe(true);
                expect(fs.size()).toBe(0);

                v = fs.clear();
                expect(v).toBe(false);

            });

            it('should set a boolean item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', true);

                expect(v).toEqual('{"bool":true}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v).toBe(true);

            });

            it('should set an object item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', {a:1, b:"s"});

                expect(v).toEqual('{"json":{"a":1,"b":"s"}}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v.a).toBe(1);
                expect(v.b).toBe('s');

            });

            it('should set an XML item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var xml = a4p.Xml.string2Xml('<span><div><p/></div></span>');
                var v = fs.set('a', xml);

                expect(v).toEqual('{"xml":"<span><div><p/></div></span>"}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');

                expect(v).not.toBeNull();
                expect(a4p.Xml.xml2String(v)).toEqual('<span><div><p/></div></span>');

            });

            it('should set null value', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', null);

                expect(v).toBe('null');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');

                expect(v).toBeNull();

            });

            it('should set undefined value', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var u;
                var v = fs.set('a', u);

                expect(typeof(u)).toEqual('undefined');
                expect(v).toBe('null');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');

                expect(v).toBeNull();

            });

            it('should reject function value', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;
                try {
                    var v = fs.set('a', function () {
                        return 1;
                    });
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Value type function is invalid. It must be null, undefined, xml, string, number, boolean or object');

                v = fs.get('a', 'default');

                expect(v).toBe('default');
                expect(fs.size()).toBe(0);

            });

            it('should reject number key', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;

                try {
                    var v = fs.set(2, 'v');
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');
                expect(fs.size()).toBe(0);

                try {
                    errorMsg = null;
                    var v = fs.get(2);
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');

            });

            it('should reject boolean key', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;

                try {
                    var v = fs.set(true, 'v');
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');
                expect(fs.size()).toBe(0);

                try {
                    errorMsg = null;
                    var v = fs.get(true);
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');

            });

            it('should reject object key', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;

                try {
                    var v = fs.set({a:"a", b:1}, 'v');
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');
                expect(fs.size()).toBe(0);

                try {
                    errorMsg = null;
                    var v = fs.get({a:"a", b:1});
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');

            });

            it('should browse all items with instance method', function () {

                function Index() {
                    this.list = [];
                }

                Index.prototype.add = function (n) {
                    this.list.push(n);
                };
                Index.prototype.get = function (n) {
                    return this.list[n];
                };
                Index.prototype.size = function () {
                    return this.list.length;
                };

                fs.clear();
                expect(fs.size()).toBe(0);

                fs.set('k', '1');
                fs.set('d', '2');
                fs.set('u', '3');

                expect(fs.size()).toBe(3);
                expect(fs.get('k')).toBe('1');
                expect(fs.get('d')).toBe('2');
                expect(fs.get('u')).toBe('3');

                var index = new Index();

                expect(index.size()).toBe(0);

                fs.foreach(Index.prototype.add, index);

                expect(index.size()).toBe(3);
                expect(index.get(0)).toBe('2');
                expect(index.get(1)).toBe('1');
                expect(index.get(2)).toBe('3');

            });

            it('should browse all items with class method', function () {

                var Index = (function () {
                    var list = [];

                    function Index() {
                    }

                    Index.add = function (n) {
                        list.push(n);
                    };
                    Index.get = function (n) {
                        return list[n];
                    };
                    Index.size = function () {
                        return list.length;
                    };

                    return Index;
                })();

                fs.clear();
                expect(fs.size()).toBe(0);

                fs.set('k', '1');
                fs.set('d', '2');
                fs.set('u', '3');

                expect(fs.size()).toBe(3);
                expect(fs.get('k')).toBe('1');
                expect(fs.get('d')).toBe('2');
                expect(fs.get('u')).toBe('3');
                expect(Index.size()).toBe(0);

                fs.foreach(Index.add);

                expect(Index.size()).toBe(3);
                expect(Index.get(0)).toBe('2');
                expect(Index.get(1)).toBe('1');
                expect(Index.get(2)).toBe('3');

            });

            it('should browse all items with function', function () {

                var list = [];

                fs.clear();
                expect(fs.size()).toBe(0);

                fs.set('k', '1');
                fs.set('d', '2');
                fs.set('u', '3');

                expect(fs.size()).toBe(3);
                expect(fs.get('k')).toBe('1');
                expect(fs.get('d')).toBe('2');
                expect(fs.get('u')).toBe('3');
                expect(list.length).toBe(0);

                fs.foreach(function (n) {
                    list.push(n);
                });

                expect(list.length).toBe(3);
                expect(list[0]).toBe('2');
                expect(list[1]).toBe('1');
                expect(list[2]).toBe('3');

            });

        });

        describe('with memory storage', function () {

            var LocalStorage = null;
            var fs = null;
            beforeEach(function () {
                LocalStorage = new a4p.LocalStorageFactory(new a4p.MemoryStorage());
                fs = new LocalStorage();
            });

            it('should be not null', function () {

                expect(fs).not.toBeNull();

            });

            it('should set a string item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', 'v');

                expect(v).toEqual('{"string":"v"}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v).toBe('v');

                v = fs.remove('a');
                expect(v).toBe(true);
                expect(fs.size()).toBe(0);

                v = fs.remove('a');
                expect(v).toBe(false);

            });

            it('should set a number item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', 15);

                expect(v).toEqual('{"number":15}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v).toBe(15);

                v = fs.clear();
                expect(v).toBe(true);
                expect(fs.size()).toBe(0);

                v = fs.clear();
                expect(v).toBe(false);

            });

            it('should set a boolean item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', true);

                expect(v).toEqual('{"bool":true}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v).toBe(true);

            });

            it('should set an object item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', {a:1, b:"s"});

                expect(v).toEqual('{"json":{"a":1,"b":"s"}}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');
                expect(v.a).toBe(1);
                expect(v.b).toBe('s');

            });

            it('should set an XML item', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var xml = a4p.Xml.string2Xml('<span><div><p/></div></span>');
                var v = fs.set('a', xml);

                expect(v).toEqual('{"xml":"<span><div><p/></div></span>"}');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');

                expect(v).not.toBeNull();
                expect(a4p.Xml.xml2String(v)).toEqual('<span><div><p/></div></span>');

            });

            it('should set null value', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var v = fs.set('a', null);

                expect(v).toBe('null');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');

                expect(v).toBeNull();

            });

            it('should set undefined value', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var u;
                var v = fs.set('a', u);

                expect(typeof(u)).toEqual('undefined');
                expect(v).toBe('null');
                expect(fs.size()).toBe(1);

                v = fs.get('a', 'default');

                expect(v).toBeNull();

            });

            it('should reject function value', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;
                try {
                    var v = fs.set('a', function () {
                        return 1;
                    });
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Value type function is invalid. It must be null, undefined, xml, string, number, boolean or object');

                v = fs.get('a', 'default');

                expect(v).toBe('default');
                expect(fs.size()).toBe(0);

            });

            it('should reject number key', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;

                try {
                    var v = fs.set(2, 'v');
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');
                expect(fs.size()).toBe(0);

                try {
                    errorMsg = null;
                    var v = fs.get(2);
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');

            });

            it('should reject boolean key', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;

                try {
                    var v = fs.set(true, 'v');
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');
                expect(fs.size()).toBe(0);

                try {
                    errorMsg = null;
                    var v = fs.get(true);
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');

            });

            it('should reject object key', function () {

                fs.clear();
                expect(fs.size()).toBe(0);

                var errorMsg;

                try {
                    var v = fs.set({a:"a", b:1}, 'v');
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');
                expect(fs.size()).toBe(0);

                try {
                    errorMsg = null;
                    var v = fs.get({a:"a", b:1});
                } catch (e) {
                    errorMsg = e.message;
                }

                expect(errorMsg).toEqual('Key type must be string');

            });

            it('should browse all items with instance method', function () {

                function Index() {
                    this.list = [];
                }

                Index.prototype.add = function (n) {
                    this.list.push(n);
                };
                Index.prototype.get = function (n) {
                    return this.list[n];
                };
                Index.prototype.size = function () {
                    return this.list.length;
                };

                fs.clear();
                expect(fs.size()).toBe(0);

                fs.set('k', '1');
                fs.set('d', '2');
                fs.set('u', '3');

                expect(fs.size()).toBe(3);
                expect(fs.get('k')).toBe('1');
                expect(fs.get('d')).toBe('2');
                expect(fs.get('u')).toBe('3');

                var index = new Index();

                expect(index.size()).toBe(0);

                fs.foreach(Index.prototype.add, index);

                // Order in MemoryStorage is chronological while with window order is alphabetical
                expect(index.size()).toBe(3);
                expect(index.get(0)).toBe('1');
                expect(index.get(1)).toBe('2');
                expect(index.get(2)).toBe('3');

            });

            it('should browse all items with class method', function () {

                var Index = (function () {
                    var list = [];

                    function Index() {
                    }

                    Index.add = function (n) {
                        list.push(n);
                    };
                    Index.get = function (n) {
                        return list[n];
                    };
                    Index.size = function () {
                        return list.length;
                    };

                    return Index;
                })();

                fs.clear();
                expect(fs.size()).toBe(0);

                fs.set('k', '1');
                fs.set('d', '2');
                fs.set('u', '3');

                expect(fs.size()).toBe(3);
                expect(fs.get('k')).toBe('1');
                expect(fs.get('d')).toBe('2');
                expect(fs.get('u')).toBe('3');
                expect(Index.size()).toBe(0);

                fs.foreach(Index.add);

                // Order in MemoryStorage is chronological while with window order is alphabetical
                expect(Index.size()).toBe(3);
                expect(Index.get(0)).toBe('1');
                expect(Index.get(1)).toBe('2');
                expect(Index.get(2)).toBe('3');

            });

            it('should browse all items with function', function () {

                var list = [];

                fs.clear();
                expect(fs.size()).toBe(0);

                fs.set('k', '1');
                fs.set('d', '2');
                fs.set('u', '3');

                expect(fs.size()).toBe(3);
                expect(fs.get('k')).toBe('1');
                expect(fs.get('d')).toBe('2');
                expect(fs.get('u')).toBe('3');
                expect(list.length).toBe(0);

                fs.foreach(function (n) {
                    list.push(n);
                });

                // Order in MemoryStorage is chronological while with window order is alphabetical
                expect(list.length).toBe(3);
                expect(list[0]).toBe('1');
                expect(list[1]).toBe('2');
                expect(list[2]).toBe('3');

            });

        });

    });

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

    describe('FileStorage', function () {

        describe('internal treatments', function () {

            it('should calculate a good urlPrefix for http_localhost_0:Persistent', function () {

                var fs = 'http_localhost_0:Persistent';
                var urlPrefix = '';
                var pattern = /^http_([^_]+)_(\d+):Persistent$/;
                if (pattern.test(fs)) {
                    var name = fs;
                    name = name.replace(pattern, "$1:$2");
                    name = name.replace(/^(.*):0$/, "$1");
                    // Specific to Chrome where window.webkitResolveLocalFileSystemURI does not exist
                    // get URL from URI by prefixing fullPath with UrlPrefix
                    urlPrefix = 'filesystem:http://' + name + '/persistent';
                }
                expect(urlPrefix).toEqual('filesystem:http://localhost/persistent');

            });

            it('should calculate a good urlPrefix for http_127.0.0.1_0:Persistent', function () {

                var fs = 'http_127.0.0.1_0:Persistent';
                var urlPrefix = '';
                var pattern = /^http_([^_]+)_(\d+):Persistent$/;
                if (pattern.test(fs)) {
                    var name = fs;
                    name = name.replace(pattern, "$1:$2");
                    name = name.replace(/^(.*):0$/, "$1");
                    // Specific to Chrome where window.webkitResolveLocalFileSystemURI does not exist
                    // get URL from URI by prefixing fullPath with UrlPrefix
                    urlPrefix = 'filesystem:http://' + name + '/persistent';
                }
                expect(urlPrefix).toEqual('filesystem:http://127.0.0.1/persistent');

            });

            it('should calculate a good urlPrefix for http_localhost_9876:Persistent', function () {

                var fs = 'http_localhost_9876:Persistent';
                var urlPrefix = '';
                var pattern = /^http_([^_]+)_(\d+):Persistent$/;
                if (pattern.test(fs)) {
                    var name = fs;
                    name = name.replace(pattern, "$1:$2");
                    name = name.replace(/^(.*):0$/, "$1");
                    // Specific to Chrome where window.webkitResolveLocalFileSystemURI does not exist
                    // get URL from URI by prefixing fullPath with UrlPrefix
                    urlPrefix = 'filesystem:http://' + name + '/persistent';
                }
                expect(urlPrefix).toEqual('filesystem:http://localhost:9876/persistent');

            });

            it('should calculate a good urlPrefix for http_127.0.0.1_9876:Persistent', function () {

                var fs = 'http_127.0.0.1_9876:Persistent';
                var urlPrefix = '';
                var pattern = /^http_([^_]+)_(\d+):Persistent$/;
                if (pattern.test(fs)) {
                    var name = fs;
                    name = name.replace(pattern, "$1:$2");
                    name = name.replace(/^(.*):0$/, "$1");
                    // Specific to Chrome where window.webkitResolveLocalFileSystemURI does not exist
                    // get URL from URI by prefixing fullPath with UrlPrefix
                    urlPrefix = 'filesystem:http://' + name + '/persistent';
                }
                expect(urlPrefix).toEqual('filesystem:http://127.0.0.1:9876/persistent');

            });

        });

        describe('specific storage', function () {

            it('should be created with a given DOMFileSystem of 10Go', function () {

                var ok = false;
                var end = false;
                var error = null;
                var nbPolls = 0;
                var fileSystem;
                var fs;
                var storageType;
                if (a4p.isUndefinedOrNull(LocalFileSystem)) {
                    storageType = window.PERSISTENT;
                } else {
                    storageType = LocalFileSystem.PERSISTENT;
                }
                var fctOnSuccess = function (fs) {
                    fileSystem = fs;
                    ok = true;
                    end = true;
                };
                var fctOnFailure = function (e) {
                    switch (e.code) {
                        case FileError.QUOTA_EXCEEDED_ERR:
                            // You may need the --allow-file-access-from-files flag
                            // if you're debugging your app from file://.
                            error = 'QUOTA_EXCEEDED_ERR';
                            break;
                        case FileError.NOT_FOUND_ERR:
                            error = 'NOT_FOUND_ERR';
                            break;
                        case FileError.SECURITY_ERR:
                            // You may need the --allow-file-access-from-files flag
                            // if you're debugging your app from file://.
                            error = 'SECURITY_ERR';
                            break;
                        case FileError.INVALID_MODIFICATION_ERR:
                            error = 'INVALID_MODIFICATION_ERR';
                            break;
                        case FileError.INVALID_STATE_ERR:
                            error = 'INVALID_STATE_ERR';
                            break;
                        default:
                            error = 'Unknown Error ' + e;
                            break;
                    }
                    ;
                    end = true;
                };

                runs(function () {
                    try {
                        if (window.requestFileSystem) {
                            window.requestFileSystem(storageType, 10 * 1024 * 1024 * 1024, fctOnSuccess, fctOnFailure);
                        } else {
                            window.webkitRequestFileSystem(storageType, 10 * 1024 * 1024 * 1024, fctOnSuccess, fctOnFailure);
                        }
                    } catch (e) {
                        fctOnFailure(e);
                    }
                });

                // latch function polls until it returns true or 10s timeout expires
                // wait a longer time for this call (dialog sent to the user to authorize more quota)
                waitsFor(function () {
                        nbPolls++;
                        return end;
                    },
                    "The window.requestFileSystem should have called onSuccess or onFailure callback",
                    10000);

                runs(function () {
                    expect(fileSystem).not.toBeNull();
                    expect(fileSystem).not.toBeUndefined();
                    expect(ok).toBe(true);
                    expect(error).toBeNull();

                    fs = new a4p.PredefinedFileStorage(fileSystem, 10 * 1024 * 1024 * 1024);

                    expect(fs).not.toBeNull();
                    expect(fs).not.toBeUndefined();
                    expect(fs.grantedBytes).toBe(10 * 1024 * 1024 * 1024);
                    // Specific to Chrome
                    expect(fs.fs.name).toMatch('^https?_(localhost|127.0.0.1|192.168.127.127)_([0-9]+):Persistent$');
                });

            });

            it('should be created with a given mock DOMFileSystem of 10 bytes', function () {

                var fs;

                function MockedDOMFileSystem() {
                    this.name = 'mockedDOMFileSystem';
                    this.root = null;
                }

                fs = new a4p.PredefinedFileStorage(new MockedDOMFileSystem(), 10);

                expect(fs).not.toBeNull();
                expect(fs).not.toBeUndefined();
                expect(fs.grantedBytes).toBe(10);
                // Specific to Chrome
                expect(fs.fs.name).toBe('mockedDOMFileSystem');

            });

        });

        describe('default storage', function () {

            var fs;
            var scheme = 'http';
            var host = null;
            var port = '';

            beforeEach(inject(function ($injector) {

                var ok = false;
                var end = false;
                var error = null;
                var nbPolls = 0;

                runs(function () {
                    fs = new a4p.FileStorage($injector.get('$q'), $injector.get('$rootScope'));
                    fs.init().then(
                        function () {
                            ok = true;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 10s timeout expires
                // wait a longer time for the first call (dialog sent to the user to authorize quota)
                waitsFor(function () {
                        nbPolls++;
                        return end;
                    },
                    "FileStorage should be created",
                    10000);

                runs(function () {
                    expect(fs).not.toBeNull();
                    expect(fs).not.toBeUndefined();
                    expect(ok).toBe(true);
                    expect(error).toBeNull();
                    expect(fs.grantedBytes).toBe(4 * 1024 * 1024 * 1024);
                    // Specific to Chrome
                    expect(fs.fs.name).toMatch('^https?_(localhost|127.0.0.1|192.168.127.127)_([0-9]+):Persistent$');
                    var pattern = /^(https?)_([^_]+)_(\d+):Persistent$/;
                    var name = fs.fs.name;
                    scheme = name.replace(pattern, "$1");
                    host = name.replace(pattern, "$2");
                    name = fs.fs.name;
                    port = name.replace(pattern, ":$3");
                    port = port.replace(/^(.*):0$/, "$1");
                    expect(scheme).toMatch('^https?$');
                    expect(host).toMatch('^(localhost|127.0.0.1|192.168.127.127)$');
                    expect(port).toMatch('^(:[0-9]+)?$');
                });

                // remove all files

                runs(function () {
                    end = false;
                    error = null;
                    fs.deleteFullDir('/dir1', function () {
                        end = true;
                    }, function (message) {
                        error = message;
                        end = true;
                    });
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/dir1 should be deleted",
                    10000);

                runs(function () {
                    if (error) {
                        expect(error).toBe('File not found');
                    }
                });

                runs(function () {
                    end = false;
                    error = null;
                    // Pictures taken in ctrlNavigation or MeetingCtrl during controllerSpec.js tests
                    fs.deleteFullDir('/a4p/c4p', function () {
                        end = true;
                    }, function (message) {
                        error = message;
                        end = true;
                    });
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/a4p/c4p should be deleted",
                    10000);

                runs(function () {
                    if (error) {
                        expect(error).toBe('File not found');
                    }
                });

            }));

            // Specific to Chrome
            /* getGrantedBytes() and getUsedBytes() are not yet ready
             it('should have 10Mo granted and 0Mo used', function () {

             var used;
             var granted;
             var end = 0;

             runs(function() {
             var storageType;
             if (a4p.isUndefinedOrNull(LocalFileSystem)) {
             storageType = window.PERSISTENT;
             } else {
             storageType = LocalFileSystem.PERSISTENT;
             }
             expect(a4p.FileStorage.getGrantedBytes(storageType, function (n) {
             granted = n;
             end++;
             })).toBe(true);
             expect(a4p.FileStorage.getUsedBytes(storageType, function (n) {
             used = n;
             end++;
             })).toBe(true);
             });

             // latch function polls until it returns true or 60s timeout expires
             // wait a longer time for the first call (dialog sent to the user to authorize quota)
             waitsFor(function () {
             return (end >= 2);
             },
             "The getGrantedBytes() and getUsedBytes() should have called onSuccess callback",
             10000);

             runs(function() {
             expect(granted).toBe(10*1024*1024);
             expect(used).toBe(0);
             });

             });
             */

            it('should create a new file', function () {

                var filePath = null;
                var date = null;
                var fe = null;
                var de = null;
                var end = false;
                var error = null;

                // Get an inexistant dir

                runs(function () {
                    de = null;
                    end = false;
                    error = null;
                    fs.getDir('/dir1/dir2',
                        function (dirEntry) {
                            de = dirEntry;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/dir1/dir2 should be found",
                    1000);

                runs(function () {
                    expect(de).toBeNull();
                    expect(error).toMatch('getDirectory dir. from /(dir1)? failure : File not found');
                });

                // Get an inexistant file

                runs(function () {
                    fe = null;
                    end = false;
                    error = null;
                    fs.getFile('/dir1/dir2/dir3/file1.txt',
                        function (fileEntry) {
                            fe = fileEntry;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/dir1/dir2/dir3/file1.txt should not be found",
                    1000);

                runs(function () {
                    expect(fe).toBeNull();
                    expect(error).toMatch('getDirectory dir. from /(dir1)? failure : File not found');
                });

                // Create file

                runs(function () {
                    fe = null;
                    end = false;
                    error = null;
                    fs.newFile('/dir1/dir2/dir3/file1.txt',
                        function (fileEntry) {
                            fe = fileEntry;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/dir1/dir2/dir3/file1.txt should be created",
                    1000);

                runs(function () {
                    expect(fe).not.toBeNull();
                    expect(error).toBeNull();
                });

                // Get dir

                runs(function () {
                    de = null;
                    end = false;
                    error = null;
                    fs.getDir('/dir1/dir2/dir3',
                        function (dirEntry) {
                            de = dirEntry;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/dir1/dir2/dir3 should be found",
                    1000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(de).not.toBeNull();
                    expect(de.fullPath).toBe('/dir1/dir2/dir3');
                });

                // Get file

                runs(function () {
                    fe = null;
                    end = false;
                    error = null;
                    fs.getFile('/dir1/dir2/dir3/file1.txt',
                        function (fileEntry) {
                            fe = fileEntry;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/dir1/dir2/dir3/file1.txt should be found",
                    1000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(fe).not.toBeNull();
                    expect(fe.fullPath).toBe('/dir1/dir2/dir3/file1.txt');
                    //TODO MLE : expect(fe.toURL()).toBe('filesystem:' + scheme + '://' + host + port + '/persistent' + fe.fullPath);
                });

                // Get URL of file

                runs(function () {
                    fe = null;
                    end = false;
                    error = null;
                    fs.getUrlFromFile('/dir1/dir2/dir3/file1.txt',
                        function (fileUrl) {
                            fe = fileUrl;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/dir1/dir2/dir3/file1.txt should be found",
                    1000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(fe).toBe('filesystem:' + scheme + '://' + host + port + '/persistent/dir1/dir2/dir3/file1.txt');
                });

                // Get file from its URL

                runs(function () {
                    filePath = null;
                    end = false;
                    error = null;
                    // Chrome specific
                    fs.getFileFromUrl('filesystem:' + scheme + '://' + host + port + '/persistent/dir1/dir2/dir3/file1.txt',
                        function (fileEntry) {
                            filePath = fileEntry.fullPath;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/dir1/dir2/dir3/file1.txt should be found",
                    1000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(fe).not.toBeNull();
                    expect(filePath).toBe('/dir1/dir2/dir3/file1.txt');
                });

                // Get modification time of file

                runs(function () {
                    date = null;
                    end = false;
                    error = null;
                    fs.getModificationTimeFromFile('/dir1/dir2/dir3/file1.txt',
                        function (modificationTime) {
                            date = modificationTime;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/dir1/dir2/dir3/file1.txt should be found",
                    1000);

                runs(function () {
                    var now = new Date();

                    expect(error).toBeNull();
                    expect(date).not.toBeNull();
                    expect(date.getFullYear()).toBe(now.getFullYear());
                    expect(date.getMonth()).toBe(now.getMonth());
                    expect(date.getDay()).toBe(now.getDay());
                    expect(date.getHours()).toBe(now.getHours());
                });

            });

            it('should get or create a new file', function () {

                var fe = null;
                var end = false;
                var error = null;

                // Create file

                runs(function () {
                    fe = null;
                    end = false;
                    error = null;
                    fs.getOrNewFile('/dir1/dir2/dir3/file2.txt',
                        function (fileEntry) {
                            fe = fileEntry;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/dir1/dir2/dir3/file2.txt should be created",
                    1000);

                runs(function () {
                    expect(fe).not.toBeNull();
                    expect(error).toBeNull();
                });

                // Get file

                runs(function () {
                    fe = null;
                    end = false;
                    error = null;
                    fs.getOrNewFile('/dir1/dir2/dir3/file2.txt',
                        function (fileEntry) {
                            fe = fileEntry;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/dir1/dir2/dir3/file2.txt should be getted",
                    1000);

                runs(function () {
                    expect(fe).not.toBeNull();
                    expect(error).toBeNull();
                });

            });

            it('should not find an unknown file from its URL', function () {

                var filePath = null;
                var end = false;
                var error = null;

                runs(function () {
                    filePath = null;
                    end = false;
                    error = null;
                    fs.getFileFromUrl('filesystem:' + scheme + '://' + host + port + '/persistent/dir1/dir2/dir3/file999.txt',
                        function (fileEntry) {
                            filePath = fileEntry.fullPath;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/dir1/dir2/dir3/file999.txt should not be found",
                    10000);

                runs(function () {
                    expect(filePath).toBeNull();
                    expect(error).toMatch('(Security error|File not found)$');
                });

            });

            it('should write a new jpeg file', function () {

                var toFilePath = null;
                var data = null;
                var dirEntries = null;
                var fileEntries = null;
                var ok = false;
                var end = false;
                var error = null;
                var deleted = 0;

                // write file

                runs(function () {
                    // 16x16 pixels image created with gimp
                    var jpegData = "\xff\xd8\xff\xe0\x00\x10\x4a\x46\x49\x46\x00\x01\x01\x01\x00\x48\x00\x48\x00\x00\xff\xfe\x00\x13\x43\x72\x65\x61\x74\x65\x64\x20\x77\x69\x74\x68\x20\x47\x49\x4d\x50\xff\xdb\x00\x43\x00\x10\x0b\x0c\x0e\x0c\x0a\x10\x0e\x0d\x0e\x12\x11\x10\x13\x18\x28\x1a\x18\x16\x16\x18\x31\x23\x25\x1d\x28\x3a\x33\x3d\x3c\x39\x33\x38\x37\x40\x48\x5c\x4e\x40\x44\x57\x45\x37\x38\x50\x6d\x51\x57\x5f\x62\x67\x68\x67\x3e\x4d\x71\x79\x70\x64\x78\x5c\x65\x67\x63\xff\xdb\x00\x43\x01\x11\x12\x12\x18\x15\x18\x2f\x1a\x1a\x2f\x63\x42\x38\x42\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\x63\xff\xc2\x00\x11\x08\x00\x10\x00\x10\x03\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x16\x00\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\x05\xff\xc4\x00\x14\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x10\x03\x10\x00\x00\x01\xd8\x00\xa7\xff\xc4\x00\x17\x10\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x21\x01\x41\xff\xda\x00\x08\x01\x01\x00\x01\x05\x02\x8e\x36\xbf\xff\xc4\x00\x14\x11\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda\x00\x08\x01\x03\x01\x01\x3f\x01\x1f\xff\xc4\x00\x14\x11\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda\x00\x08\x01\x02\x01\x01\x3f\x01\x1f\xff\xc4\x00\x15\x10\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\x21\xff\xda\x00\x08\x01\x01\x00\x06\x3f\x02\xa3\xff\xc4\x00\x1b\x10\x00\x02\x02\x03\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\x11\x00\x21\x31\x41\x51\x71\xff\xda\x00\x08\x01\x01\x00\x01\x3f\x21\xb3\x24\xae\x1a\x6b\x6f\x73\x1a\x39\xe4\x31\xea\x7f\xff\xda\x00\x0c\x03\x01\x00\x02\x00\x03\x00\x00\x00\x10\x82\x4f\xff\xc4\x00\x14\x11\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda\x00\x08\x01\x03\x01\x01\x3f\x10\x1f\xff\xc4\x00\x14\x11\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x20\xff\xda\x00\x08\x01\x02\x01\x01\x3f\x10\x1f\xff\xc4\x00\x19\x10\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\x11\x00\x21\x31\x61\xff\xda\x00\x08\x01\x01\x00\x01\x3f\x10\x0a\xc0\x10\x47\xee\x90\x1e\x49\xd7\x97\x71\xd5\x63\x65\x61\x60\x31\x39\x1d\xff\xd9";

                    var byteArray = new Uint8Array(jpegData.length);
                    for (var i = 0; i < jpegData.length; i++) {
                        byteArray[i] = jpegData.charCodeAt(i) & 0xff;
                    }

                    ok = false;
                    end = false;
                    error = null;
                    fs.writeFile(
                        new Blob([byteArray], {type:'image/jpeg', endings:"transparent"}),
                        'a4p/img/dummy_picture.jpg',
                        function (fileEntry) {
                            ok = true;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "a4p/img/dummy_picture.jpg should be written",
                    1000);

                runs(function () {
                    expect(ok).toBe(true);
                    expect(error).toBeNull();
                });

                // Read image in Url base64 encoded format

                runs(function () {
                    data = null;
                    end = false;
                    error = null;
                    fs.readFileAsDataURL(
                        'a4p/img/dummy_picture.jpg',
                        function (dataUrl) {
                            data = dataUrl;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "a4p/img/dummy_picture.jpg should be read",
                    1000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(data).toBe('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD//gATQ3JlYXRlZCB3aXRoIEdJTVD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAAQABADAREAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAEF/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAB2ACn/8QAFxABAQEBAAAAAAAAAAAAAAAAACEBQf/aAAgBAQABBQKONr//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAEDAQE/AR//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAECAQE/AR//xAAVEAEBAAAAAAAAAAAAAAAAAAAgIf/aAAgBAQAGPwKj/8QAGxAAAgIDAQAAAAAAAAAAAAAAAREAITFBUXH/2gAIAQEAAT8hsySuGmtvcxo55DHqf//aAAwDAQACAAMAAAAQgk//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAEDAQE/EB//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAECAQE/EB//xAAZEAEBAQEBAQAAAAAAAAAAAAABEQAhMWH/2gAIAQEAAT8QCsAQR+6QHknXl3HVY2VhYDE5Hf/Z');
                });

                // Copy file in same directory

                runs(function () {
                    toFilePath = null;
                    end = false;
                    error = null;
                    fs.copyFile(
                        'a4p/img/dummy_picture.jpg',
                        'a4p/img/dummy_picture2.jpg',
                        function (fileEntry) {
                            toFilePath = fileEntry.fullPath;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "a4p/img/dummy_picture.jpg should be copied to a4p/img/dummy_picture2.jpg",
                    10000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(toFilePath).toBe('/a4p/img/dummy_picture2.jpg');
                });

                // Read file

                runs(function () {
                    data = null;
                    end = false;
                    error = null;
                    fs.readFileAsDataURL(
                        'a4p/img/dummy_picture.jpg',
                        function (dataUrl) {
                            data = dataUrl;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "a4p/img/dummy_picture.jpg should be read",
                    1000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(data).toBe('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD//gATQ3JlYXRlZCB3aXRoIEdJTVD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAAQABADAREAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAEF/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAB2ACn/8QAFxABAQEBAAAAAAAAAAAAAAAAACEBQf/aAAgBAQABBQKONr//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAEDAQE/AR//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAECAQE/AR//xAAVEAEBAAAAAAAAAAAAAAAAAAAgIf/aAAgBAQAGPwKj/8QAGxAAAgIDAQAAAAAAAAAAAAAAAREAITFBUXH/2gAIAQEAAT8hsySuGmtvcxo55DHqf//aAAwDAQACAAMAAAAQgk//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAEDAQE/EB//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAECAQE/EB//xAAZEAEBAQEBAQAAAAAAAAAAAAABEQAhMWH/2gAIAQEAAT8QCsAQR+6QHknXl3HVY2VhYDE5Hf/Z');
                });

                // Read file

                runs(function () {
                    data = null;
                    end = false;
                    error = null;
                    fs.readFileAsDataURL(
                        'a4p/img/dummy_picture2.jpg',
                        function (dataUrl) {
                            data = dataUrl;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "a4p/img/dummy_picture2.jpg should be read",
                    1000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(data).toBe('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD//gATQ3JlYXRlZCB3aXRoIEdJTVD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAAQABADAREAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAEF/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAB2ACn/8QAFxABAQEBAAAAAAAAAAAAAAAAACEBQf/aAAgBAQABBQKONr//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAEDAQE/AR//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAECAQE/AR//xAAVEAEBAAAAAAAAAAAAAAAAAAAgIf/aAAgBAQAGPwKj/8QAGxAAAgIDAQAAAAAAAAAAAAAAAREAITFBUXH/2gAIAQEAAT8hsySuGmtvcxo55DHqf//aAAwDAQACAAMAAAAQgk//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAEDAQE/EB//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAECAQE/EB//xAAZEAEBAQEBAQAAAAAAAAAAAAABEQAhMWH/2gAIAQEAAT8QCsAQR+6QHknXl3HVY2VhYDE5Hf/Z');
                });

                // Copy file in another directory

                runs(function () {
                    toFilePath = null;
                    end = false;
                    error = null;
                    fs.copyFile(
                        'a4p/img/dummy_picture.jpg',
                        'a4p/jpg/dummy_picture3.jpg',
                        function (fileEntry) {
                            toFilePath = fileEntry.fullPath;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "a4p/img/dummy_picture.jpg should be copied to a4p/jpg/dummy_picture3.jpg",
                    10000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(toFilePath).toBe('/a4p/jpg/dummy_picture3.jpg');
                });

                // Read file

                runs(function () {
                    data = null;
                    end = false;
                    error = null;
                    fs.readFileAsDataURL(
                        'a4p/img/dummy_picture.jpg',
                        function (dataUrl) {
                            data = dataUrl;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "a4p/img/dummy_picture.jpg should be read",
                    1000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(data).toBe('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD//gATQ3JlYXRlZCB3aXRoIEdJTVD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAAQABADAREAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAEF/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAB2ACn/8QAFxABAQEBAAAAAAAAAAAAAAAAACEBQf/aAAgBAQABBQKONr//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAEDAQE/AR//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAECAQE/AR//xAAVEAEBAAAAAAAAAAAAAAAAAAAgIf/aAAgBAQAGPwKj/8QAGxAAAgIDAQAAAAAAAAAAAAAAAREAITFBUXH/2gAIAQEAAT8hsySuGmtvcxo55DHqf//aAAwDAQACAAMAAAAQgk//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAEDAQE/EB//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAECAQE/EB//xAAZEAEBAQEBAQAAAAAAAAAAAAABEQAhMWH/2gAIAQEAAT8QCsAQR+6QHknXl3HVY2VhYDE5Hf/Z');
                });

                // Read file

                runs(function () {
                    data = null;
                    end = false;
                    error = null;
                    fs.readFileAsDataURL(
                        'a4p/jpg/dummy_picture3.jpg',
                        function (dataUrl) {
                            data = dataUrl;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "a4p/jpg/dummy_picture3.jpg should be read",
                    1000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(data).toBe('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD//gATQ3JlYXRlZCB3aXRoIEdJTVD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAAQABADAREAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAEF/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAB2ACn/8QAFxABAQEBAAAAAAAAAAAAAAAAACEBQf/aAAgBAQABBQKONr//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAEDAQE/AR//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAECAQE/AR//xAAVEAEBAAAAAAAAAAAAAAAAAAAgIf/aAAgBAQAGPwKj/8QAGxAAAgIDAQAAAAAAAAAAAAAAAREAITFBUXH/2gAIAQEAAT8hsySuGmtvcxo55DHqf//aAAwDAQACAAMAAAAQgk//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAEDAQE/EB//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAECAQE/EB//xAAZEAEBAQEBAQAAAAAAAAAAAAABEQAhMWH/2gAIAQEAAT8QCsAQR+6QHknXl3HVY2VhYDE5Hf/Z');
                });

                // Move file in another directory

                runs(function () {
                    toFilePath = null;
                    end = false;
                    error = null;
                    fs.moveFile(
                        'a4p/img/dummy_picture2.jpg',
                        'a4p/jpg/dummy_picture4.jpg',
                        function (fileEntry) {
                            toFilePath = fileEntry.fullPath;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "a4p/img/dummy_picture2.jpg should be moved to a4p/jpg/dummy_picture4.jpg",
                    10000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(toFilePath).toBe('/a4p/jpg/dummy_picture4.jpg');
                });

                // Read file

                runs(function () {
                    data = null;
                    end = false;
                    error = null;
                    fs.readFileAsDataURL(
                        'a4p/img/dummy_picture2.jpg',
                        function (dataUrl) {
                            data = dataUrl;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "a4p/img/dummy_picture2.jpg should be nowhere",
                    1000);

                runs(function () {
                    expect(data).toBeNull();
                    expect(error).toBe('getFile dummy_picture2.jpg from /a4p/img failure : File not found');
                });

                // Read file

                runs(function () {
                    data = null;
                    end = false;
                    error = null;
                    fs.readFileAsDataURL(
                        'a4p/jpg/dummy_picture4.jpg',
                        function (dataUrl) {
                            data = dataUrl;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "a4p/jpg/dummy_picture4.jpg should be read",
                    1000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(data).toBe('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD//gATQ3JlYXRlZCB3aXRoIEdJTVD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wgARCAAQABADAREAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAEF/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAB2ACn/8QAFxABAQEBAAAAAAAAAAAAAAAAACEBQf/aAAgBAQABBQKONr//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAEDAQE/AR//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAECAQE/AR//xAAVEAEBAAAAAAAAAAAAAAAAAAAgIf/aAAgBAQAGPwKj/8QAGxAAAgIDAQAAAAAAAAAAAAAAAREAITFBUXH/2gAIAQEAAT8hsySuGmtvcxo55DHqf//aAAwDAQACAAMAAAAQgk//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAEDAQE/EB//xAAUEQEAAAAAAAAAAAAAAAAAAAAg/9oACAECAQE/EB//xAAZEAEBAQEBAQAAAAAAAAAAAAABEQAhMWH/2gAIAQEAAT8QCsAQR+6QHknXl3HVY2VhYDE5Hf/Z');

                    fs.deleteFullDir('a4p/img', function () {
                        deleted++;
                    }, function (message) {
                        console.log('Delete error ' + message);
                    });
                    fs.deleteFullDir('a4p/jpg', function () {
                        deleted++;
                    }, function (message) {
                        console.log('Delete error ' + message);
                    });
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {
                        return (deleted >= 2);
                    },
                    "There should be 2 deletions",
                    10000);

            });

            it('should write a new text file', function () {

                var toFilePath = null;
                var data = null;
                var dirEntries = null;
                var fileEntries = null;
                var ok = false;
                var end = false;
                var error = null;

                // write file

                runs(function () {
                    ok = false;
                    end = false;
                    error = null;
                    fs.writeFile(
                        new Blob(['Bonjour'], {type:'text/plain'}),
                        '/dir1/dir2/dir3/file3.txt',
                        function (fileEntry) {
                            ok = true;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/dir1/dir2/dir3/file3.txt should be written",
                    1000);

                runs(function () {
                    expect(ok).toBe(true);
                    expect(error).toBeNull();
                });

                // Read 'Bonjour'

                runs(function () {
                    data = null;
                    end = false;
                    error = null;
                    fs.readFileAsText(
                        '/dir1/dir2/dir3/file3.txt',
                        function (text) {
                            data = text;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/dir1/dir2/dir3/file3.txt should be read",
                    1000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(data).toBe('Bonjour');
                });

                // Overwrite file

                runs(function () {
                    ok = false;
                    end = false;
                    error = null;
                    fs.writeFile(
                        new Blob(['Hello'], {type:'text/plain'}),
                        '/dir1/dir2/dir3/file3.txt',
                        function (fileEntry) {
                            ok = true;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/dir1/dir2/dir3/file3.txt should be written",
                    1000);

                runs(function () {
                    expect(ok).toBe(true);
                    expect(error).toBeNull();
                });

                // Read 'Hello'

                runs(function () {
                    data = null;
                    end = false;
                    error = null;
                    fs.readFileAsText(
                        '/dir1/dir2/dir3/file3.txt',
                        function (text) {
                            data = text;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/dir1/dir2/dir3/file3.txt should be read",
                    1000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(data).toBe('Hello');
                });

                // Append file

                runs(function () {
                    ok = false;
                    end = false;
                    error = null;
                    fs.appendFile(
                        new Blob([' World'], {type:'text/plain'}),
                        '/dir1/dir2/dir3/file3.txt',
                        function (fileEntry) {
                            ok = true;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/dir1/dir2/dir3/file3.txt should be appended",
                    1000);

                runs(function () {
                    expect(ok).toBe(true);
                    expect(error).toBeNull();
                });

                // Read 'Hello World'

                runs(function () {
                    data = null;
                    end = false;
                    error = null;
                    fs.readFileAsText(
                        '/dir1/dir2/dir3/file3.txt',
                        function (text) {
                            data = text;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/dir1/dir2/dir3/file3.txt should be read",
                    1000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(data).toBe('Hello World');
                });

                // Copy file in same directory

                runs(function () {
                    toFilePath = null;
                    end = false;
                    error = null;
                    fs.copyFile(
                        '/dir1/dir2/dir3/file3.txt',
                        'dir1/dir2/dir3/file4.txt',
                        function (fileEntry) {
                            toFilePath = fileEntry.fullPath;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "file3.txt should be copied to file4.txt",
                    10000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(toFilePath).toBe('/dir1/dir2/dir3/file4.txt');
                });

                // Read file

                runs(function () {
                    data = null;
                    end = false;
                    error = null;
                    fs.readFileAsText(
                        '/dir1/dir2/dir3/file3.txt',
                        function (text) {
                            data = text;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "file3.txt should be read",
                    1000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(data).toBe('Hello World');
                });

                // Read file

                runs(function () {
                    data = null;
                    end = false;
                    error = null;
                    fs.readFileAsText(
                        '/dir1/dir2/dir3/file4.txt',
                        function (text) {
                            data = text;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "file4.txt should be read",
                    1000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(data).toBe('Hello World');
                });

                // Copy file in another directory

                runs(function () {
                    toFilePath = null;
                    end = false;
                    error = null;
                    fs.copyFile(
                        '/dir1/dir2/dir3/file3.txt',
                        'dir1/dir2/dir4/file5.txt',
                        function (fileEntry) {
                            toFilePath = fileEntry.fullPath;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "dir3/file3.txt should be copied to dir4/file5.txt",
                    10000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(toFilePath).toBe('/dir1/dir2/dir4/file5.txt');
                });

                // Read file

                runs(function () {
                    data = null;
                    end = false;
                    error = null;
                    fs.readFileAsText(
                        '/dir1/dir2/dir3/file3.txt',
                        function (text) {
                            data = text;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "file3.txt should be read",
                    1000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(data).toBe('Hello World');
                });

                // Read file

                runs(function () {
                    data = null;
                    end = false;
                    error = null;
                    fs.readFileAsText(
                        '/dir1/dir2/dir4/file5.txt',
                        function (text) {
                            data = text;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "dir4/file5.txt should be read",
                    1000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(data).toBe('Hello World');
                });

                // Move file in another directory

                runs(function () {
                    toFilePath = null;
                    end = false;
                    error = null;
                    fs.moveFile(
                        '/dir1/dir2/dir3/file4.txt',
                        'dir1/dir2/dir4/file6.txt',
                        function (fileEntry) {
                            toFilePath = fileEntry.fullPath;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "dir3/file4 should be moved to dir4/file6.txt",
                    10000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(toFilePath).toBe('/dir1/dir2/dir4/file6.txt');
                });

                // Read file

                runs(function () {
                    data = null;
                    end = false;
                    error = null;
                    fs.readFileAsText(
                        '/dir1/dir2/dir3/file4.txt',
                        function (text) {
                            data = text;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "dir3/file4 should be nowhere",
                    1000);

                runs(function () {
                    expect(data).toBeNull();
                    expect(error).toBe('getFile file4.txt from /dir1/dir2/dir3 failure : File not found');
                });

                // Read file

                runs(function () {
                    data = null;
                    end = false;
                    error = null;
                    fs.readFileAsText(
                        '/dir1/dir2/dir4/file6.txt',
                        function (text) {
                            data = text;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "dir4/file6.txt should be read",
                    1000);

                runs(function () {
                    expect(error).toBeNull();
                    expect(data).toBe('Hello World');
                });

                // Read directory /dir1/dir2

                // '/dir1/dir2/dir3/file3.txt' : 'Hello World'
                // '/dir1/dir2/dir4/file5.txt' : 'Hello World'
                // '/dir1/dir2/dir4/file6.txt' : 'Hello World'

                runs(function () {
                    dirEntries = null;
                    fileEntries = null;
                    end = false;
                    error = null;
                    fs.readDirectory(
                        'dir1/dir2',
                        function (dirs, files) {
                            dirEntries = dirs;
                            fileEntries = files;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "dir1/dir2 should be read",
                    10000);

                runs(function () {
                    expect(dirEntries).not.toBeNull();
                    expect(fileEntries).not.toBeNull();
                    expect(error).toBeNull();
                    expect(dirEntries.length).toBe(2);
                    expect(fileEntries.length).toBe(0);
                    expect(dirEntries[0]).toBe('dir3');
                    expect(dirEntries[1]).toBe('dir4');
                });

                // Read directory /dir1/dir2/dir4

                // '/dir1/dir2/dir4/file5.txt' : 'Hello World'
                // '/dir1/dir2/dir4/file6.txt' : 'Hello World'

                runs(function () {
                    dirEntries = null;
                    fileEntries = null;
                    end = false;
                    error = null;
                    fs.readDirectory(
                        '/dir1/dir2/dir4',
                        function (dirs, files) {
                            dirEntries = dirs;
                            fileEntries = files;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "dir1/dir2 should be read",
                    10000);

                runs(function () {
                    expect(dirEntries).not.toBeNull();
                    expect(fileEntries).not.toBeNull();
                    expect(error).toBeNull();
                    expect(dirEntries.length).toBe(0);
                    expect(fileEntries.length).toBe(2);
                    expect(fileEntries[0]).toBe('file5.txt');
                    expect(fileEntries[1]).toBe('file6.txt');
                });

                // Read directory /
                // '/dir1/dir2/dir3/file3.txt' : 'Hello World'
                // '/dir1/dir2/dir4/file5.txt' : 'Hello World'
                // '/dir1/dir2/dir4/file6.txt' : 'Hello World'

                runs(function () {
                    fileEntries = null;
                    end = false;
                    error = null;
                    fs.readFullDirectory(
                        '/',
                        function (files) {
                            fileEntries = files;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/ should be read",
                    10000);

                runs(function () {
                    expect(fileEntries).not.toBeNull();
                    expect(error).toBeNull();
                    expect(fileEntries.length).toBe(3);
                    expect(fileEntries[0]).toBe('/dir1/dir2/dir3/file3.txt');
                    expect(fileEntries[1]).toBe('/dir1/dir2/dir4/file5.txt');
                    expect(fileEntries[2]).toBe('/dir1/dir2/dir4/file6.txt');
                });

                // Read directory /dir1/dir2/dir4
                // '/dir1/dir2/dir4/file5.txt' : 'Hello World'
                // '/dir1/dir2/dir4/file6.txt' : 'Hello World'

                runs(function () {
                    fileEntries = null;
                    end = false;
                    error = null;
                    fs.readFullDirectory(
                        'dir1/dir2/dir4',
                        function (files) {
                            fileEntries = files;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/ should be read",
                    10000);

                runs(function () {
                    expect(fileEntries).not.toBeNull();
                    expect(error).toBeNull();
                    expect(fileEntries.length).toBe(2);
                    expect(fileEntries[0]).toBe('/dir1/dir2/dir4/file5.txt');
                    expect(fileEntries[1]).toBe('/dir1/dir2/dir4/file6.txt');
                });

            });

            it('should read / directory contents', function () {

                var fileEntries = null;
                var end = false;
                var error = null;
                var news = 0;
                var deleted = 0;

                // add some more files

                runs(function () {
                    fs.getOrNewFile('/dir1/file15.txt', function () {
                        news++;
                    });
                    fs.getOrNewFile('/dir1/dir2/dir4/file6.txt', function () {
                        news++;
                    });
                    fs.getOrNewFile('/dir1/dir2/file7.txt', function () {
                        news++;
                    });
                    fs.getOrNewFile('/dir1/dir5/file11.txt', function () {
                        news++;
                    });
                    fs.getOrNewFile('/dir1/dir5/dir6/file12.txt', function () {
                        news++;
                    });
                    fs.getOrNewFile('/dir1/dir2/dir3/file1.txt', function () {
                        news++;
                    });
                    fs.getOrNewFile('/dir1/dir2/dir3/file2.txt', function () {
                        news++;
                    });
                    fs.getOrNewFile('/dir1/dir2/dir3/file3.txt', function () {
                        news++;
                    });
                    fs.getOrNewFile('/dir1/dir2/dir3/file4.txt', function () {
                        news++;
                    });
                    fs.getOrNewFile('/dir1/dir2/dir4/file5.txt', function () {
                        news++;
                    });
                    fs.getOrNewFile('/dir1/dir2/file8.txt', function () {
                        news++;
                    });
                    fs.getOrNewFile('/dir1/dir2/file9.txt', function () {
                        news++;
                    });
                    fs.getOrNewFile('/dir1/dir5/file10.txt', function () {
                        news++;
                    });
                    fs.getOrNewFile('/dir1/dir5/dir7/file13.txt', function () {
                        news++;
                    });
                    fs.getOrNewFile('/dir1/file14.txt', function () {
                        news++;
                    });
                    fs.getOrNewFile('/dir1/file16.txt', function () {
                        news++;
                    });
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {
                        return (news >= 16);
                    },
                    "There should be 11 creations",
                    10000);

                runs(function () {
                    fs.readFullDirectory(
                        '/',
                        function (files) {
                            fileEntries = files;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 1s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/ should be read",
                    10000);

                runs(function () {
                    expect(fileEntries).not.toBeNull();
                    expect(error).toBeNull();
                    expect(fileEntries.length).toBe(16);
                    expect(fileEntries[0]).toBe('/dir1/dir2/dir3/file1.txt');
                    expect(fileEntries[1]).toBe('/dir1/dir2/dir3/file2.txt');
                    expect(fileEntries[2]).toBe('/dir1/dir2/dir3/file3.txt');
                    expect(fileEntries[3]).toBe('/dir1/dir2/dir3/file4.txt');
                    expect(fileEntries[4]).toBe('/dir1/dir2/dir4/file5.txt');
                    expect(fileEntries[5]).toBe('/dir1/dir2/dir4/file6.txt');
                    expect(fileEntries[6]).toBe('/dir1/dir2/file7.txt');
                    expect(fileEntries[7]).toBe('/dir1/dir2/file8.txt');
                    expect(fileEntries[8]).toBe('/dir1/dir2/file9.txt');
                    expect(fileEntries[9]).toBe('/dir1/dir5/dir6/file12.txt');
                    expect(fileEntries[10]).toBe('/dir1/dir5/dir7/file13.txt');
                    expect(fileEntries[11]).toBe('/dir1/dir5/file10.txt');
                    expect(fileEntries[12]).toBe('/dir1/dir5/file11.txt');
                    expect(fileEntries[13]).toBe('/dir1/file14.txt');
                    expect(fileEntries[14]).toBe('/dir1/file15.txt');
                    expect(fileEntries[15]).toBe('/dir1/file16.txt');
                });

                // remove added files

                runs(function () {
                    fs.deleteFile('/dir1/dir2/dir3/file4.txt', function () {
                        deleted++;
                    }, function (message) {
                        console.log('Delete error ' + message);
                    });
                    fs.deleteFullDir('/dir1/dir2/dir4', function () {
                        deleted++;
                    }, function (message) {
                        console.log('Delete error ' + message);
                    });
                    fs.deleteFile('/dir1/dir2/file7.txt', function () {
                        deleted++;
                    }, function (message) {
                        console.log('Delete error ' + message);
                    });
                    fs.deleteFile('/dir1/dir2/file8.txt', function () {
                        deleted++;
                    }, function (message) {
                        console.log('Delete error ' + message);
                    });
                    fs.deleteFile('/dir1/dir2/file9.txt', function () {
                        deleted++;
                    }, function (message) {
                        console.log('Delete error ' + message);
                    });
                    fs.deleteFile('/dir1/file14.txt', function () {
                        deleted++;
                    }, function (message) {
                        console.log('Delete error ' + message);
                    });
                    fs.deleteFile('/dir1/file15.txt', function () {
                        deleted++;
                    }, function (message) {
                        console.log('Delete error ' + message);
                    });
                    fs.deleteFile('/dir1/file16.txt', function () {
                        deleted++;
                    }, function (message) {
                        console.log('Delete error ' + message);
                    });
                    fs.deleteFile('/dir1/dir5/dir6/file12.txt', function () {
                        deleted++;
                        fs.deleteDir('/dir1/dir5/dir6', function () {
                            deleted++;
                            fs.deleteFullDir('/dir1/dir5', function () {
                                deleted++;
                            }, function (message) {
                                console.log('Delete error ' + message);
                            });// Delete non-empty dir
                        }, function (message) {
                            console.log('Delete error ' + message);
                        });// Delete empty dir
                    }, function (message) {
                        console.log('Delete error ' + message);
                    });
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {
                        return (deleted >= 11);
                    },
                    "There should be 11 deletions",
                    10000);

                runs(function () {
                    fileEntries = null;
                    end = false;
                    error = null;
                    fs.readFullDirectory(
                        '/',
                        function (files) {
                            fileEntries = files;
                            end = true;
                        }, function (message) {
                            error = message;
                            end = true;
                        });
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/ should be read a second time",
                    10000);

                runs(function () {
                    expect(fileEntries).not.toBeNull();
                    expect(error).toBeNull();
                    expect(fileEntries.length).toBe(3);
                    expect(fileEntries[0]).toBe('/dir1/dir2/dir3/file1.txt');
                    expect(fileEntries[1]).toBe('/dir1/dir2/dir3/file2.txt');
                    expect(fileEntries[2]).toBe('/dir1/dir2/dir3/file3.txt');
                });

                // remove all files

                runs(function () {
                    end = false;
                    error = null;
                    fs.deleteFullDir('/dir1', function () {
                        end = true;
                    }, function (message) {
                        error = message;
                        end = true;
                    });
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "/dir1 should be deleted",
                    10000);

                runs(function () {
                    expect(error).toBeNull();
                });

            });

        });

    });

    describe('TaskReceiver', function () {

        describe('with provided dependencies', function () {

            var name = 'client1';
            var fifoName = 'task1';
            var http;
            var httpBackend;
            var localStorage;
            var ct;

            beforeEach(inject(function ($injector) {

                http = $injector.get('$http');
                httpBackend = $injector.get('$httpBackend');

                // backend definition common for all tests
                // BUG : passThrough() does not exists, contrary to doc :-(
                // $httpBackend.when('GET', 'models/data.json').passThrough();
                httpBackend.when('POST', 'synchro/client.php').respond(
                    [
                        {'id':'id1', 'action':'fct1', 'data':{'a':0, 'b':1}},
                        {'id':'id2', 'action':'fct2', 'data':{'a':1, 'b':1}}
                    ]
                );

            }));

            beforeEach(function () {

                var LocalStorage = a4p.LocalStorageFactory(new a4p.MemoryStorage());
                localStorage = new LocalStorage();
                spyOn(localStorage, 'set').andCallThrough();
                spyOn(localStorage, 'get').andCallThrough();
                ct = new a4p.TaskReceiver(name, http, localStorage);

            });

            afterEach(function () {

                httpBackend.verifyNoOutstandingExpectation();
                httpBackend.verifyNoOutstandingRequest();

            });

            it('should define one task without yet synchronization', function () {

                var nbAction = 0;

                ct.defineTaskList(fifoName, 'dummy', function (id, action, data) {
                    nbAction++;
                });

                expect(localStorage.set).not.toHaveBeenCalled();
                expect(localStorage.get).toHaveBeenCalled();
                expect(localStorage.get.calls.length).toEqual(2);

                ct.clearTaskList(fifoName);
                expect(nbAction).toBe(0);
                expect(ct.nbTaskTodo(fifoName)).toBe(0);
                expect(ct.nbTaskDone(fifoName)).toBe(0);

            });


            it('should synchronize and load 2 tasks', function () {

                var nbAction = 0;
                var done = [];
                var end = false;
                var ok = false;
                var error = null;

                runs(function () {
                    nbAction = 0;
                    end = false;
                    ok = false;
                    error = null;

                    httpBackend.expectPOST('synchro/client.php', '[]');

                    ct.defineTaskList(fifoName, 'synchro/client.php', function (id, action, data) {
                        nbAction++;
                        done.push({'n':id, 'a':action, 'd':data, 'todo':ct.nbTaskTodo(fifoName), 'done':ct.nbTaskDone(fifoName)});
                    });
                    expect(localStorage.get).toHaveBeenCalled();
                    expect(localStorage.get.calls.length).toEqual(2);
                    expect(localStorage.set).not.toHaveBeenCalled();
                    ct.clearTaskList(fifoName);
                    expect(localStorage.set).toHaveBeenCalled();
                    expect(localStorage.set.calls.length).toEqual(2);
                    ct.synchronize(fifoName, function () {
                        ok = true;
                        end = true;
                    }, function (message) {
                        error = message;
                        end = true;
                    });
                    httpBackend.flush();
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "a4p.TaskReceiver should have synchronized",
                    10000);

                runs(function () {
                    expect(ok).toBe(true);
                    expect(error).toBeNull();

                    expect(localStorage.set).toHaveBeenCalled();
                    expect(localStorage.set.calls.length).toEqual(4);
                    expect(localStorage.get).toHaveBeenCalled();
                    expect(localStorage.get.calls.length).toEqual(2);

                    var todo = localStorage.get('TaskReceiver-' + name + '-todoTasks', null);
                    var done = localStorage.get('TaskReceiver-' + name + '-doneTasks', null);

                    expect(ct.nbTaskTodo(fifoName)).toBe(2);
                    expect(ct.nbTaskDone(fifoName)).toBe(0);
                    expect(todo).not.toBeNull();
                    expect(done).not.toBeNull();

                    expect(done[fifoName]).not.toBeNull();
                    expect(done[fifoName]).not.toBeUndefined();
                    expect(done[fifoName].length).toBe(0);

                    expect(todo[fifoName]).not.toBeNull();
                    expect(todo[fifoName]).not.toBeUndefined();
                    expect(todo[fifoName].length).toBe(2);
                    expect(todo[fifoName][0].id).toBe('id1');
                    expect(todo[fifoName][0].action).toBe('fct1');
                    expect(todo[fifoName][0].data.a).toBe(0);
                    expect(todo[fifoName][0].data.b).toBe(1);
                    expect(todo[fifoName][1].id).toBe('id2');
                    expect(todo[fifoName][1].action).toBe('fct2');
                    expect(todo[fifoName][1].data.a).toBe(1);
                    expect(todo[fifoName][1].data.b).toBe(1);
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {
                        return (nbAction > 0);
                    },
                    "a4p.TaskReceiver should have run 1 task",
                    10000);

                runs(function () {
                    expect(done.length).toBe(1);
                    expect(done[0].n).toBe('id1');
                    expect(done[0].a).toBe('fct1');
                    expect(done[0].d.a).toBe(0);
                    expect(done[0].d.b).toBe(1);
                    expect(done[0].todo).toBe(2);
                    expect(done[0].done).toBe(0);

                    ct.doneTask(fifoName, 'ack' + nbAction);

                    expect(done.length).toBe(2);
                    expect(done[0].n).toBe('id1');
                    expect(done[0].a).toBe('fct1');
                    expect(done[0].d.a).toBe(0);
                    expect(done[0].d.b).toBe(1);
                    expect(done[0].todo).toBe(2);
                    expect(done[0].done).toBe(0);
                    expect(done[1].n).toBe('id2');
                    expect(done[1].a).toBe('fct2');
                    expect(done[1].d.a).toBe(1);
                    expect(done[1].d.b).toBe(1);
                    expect(done[1].todo).toBe(1);
                    expect(done[1].done).toBe(1);
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {
                        return (nbAction > 1);
                    },
                    "a4p.TaskReceiver should have run 2 tasks",
                    10000);

                runs(function () {
                    ct.doneTask(fifoName, 'ack' + nbAction);

                    expect(localStorage.set).toHaveBeenCalled();
                    expect(localStorage.get).toHaveBeenCalled();

                    var todo = localStorage.get('TaskReceiver-' + name + '-todoTasks', null);
                    var done = localStorage.get('TaskReceiver-' + name + '-doneTasks', null);

                    expect(ct.nbTaskTodo(fifoName)).toBe(0);
                    expect(ct.nbTaskDone(fifoName)).toBe(2);
                    expect(todo).not.toBeNull();
                    expect(done).not.toBeNull();

                    expect(todo[fifoName]).not.toBeNull();
                    expect(todo[fifoName]).not.toBeUndefined();
                    expect(todo[fifoName].length).toBe(0);

                    expect(done[fifoName]).not.toBeNull();
                    expect(done[fifoName]).not.toBeUndefined();
                    expect(done[fifoName].length).toBe(2);
                    expect(done[fifoName][0].id).toBe('id1');
                    expect(done[fifoName][0].ack).toBe('ack1');
                    expect(done[fifoName][1].id).toBe('id2');
                    expect(done[fifoName][1].ack).toBe('ack2');
                });

            });

        });

        describe('with default dependencies', function () {

            var name = 'client1';
            var fifoName = 'task1';
            var http;
            var httpBackend;
            var ct;

            beforeEach(inject(function ($injector) {

                http = $injector.get('$http');
                httpBackend = $injector.get('$httpBackend');

                // backend definition common for all tests
                // BUG : passThrough() does not exists, contrary to doc :-(
                // $httpBackend.when('GET', 'models/data.json').passThrough();
                httpBackend.when('POST', 'synchro/client.php').respond(
                    [
                        {'id':'id1', 'action':'fct1', 'data':{'a':0, 'b':1}},
                        {'id':'id2', 'action':'fct2', 'data':{'a':1, 'b':1}}
                    ]
                );
                httpBackend.when('POST', 'synchro/client2.php').respond(
                    [
                        {'id':'id3', 'action':'fct3', 'data':{'a':2, 'b':2}},
                        {'id':'id4', 'action':'fct4', 'data':{'a':3, 'b':2}}
                    ]
                );

            }));

            beforeEach(function () {

                ct = new a4p.TaskReceiver(name, http, null);

            });

            afterEach(function () {

                httpBackend.verifyNoOutstandingExpectation();
                httpBackend.verifyNoOutstandingRequest();

            });

            it('should define one task without yet synchronization', function () {

                var nbAction = 0;

                ct.defineTaskList(fifoName, 'dummy', function (id, action, data) {
                    nbAction++;
                });
                ct.clearTaskList(fifoName);

                expect(nbAction).toBe(0);
                expect(ct.nbTaskTodo(fifoName)).toBe(0);
                expect(ct.nbTaskDone(fifoName)).toBe(0);

            });

            it('should synchronize and load 2 tasks', function () {

                var nbAction = 0;
                var done = [];
                var end = false;
                var ok = false;
                var error = null;

                runs(function () {
                    nbAction = 0;
                    end = false;
                    ok = false;
                    error = null;

                    httpBackend.expectPOST('synchro/client.php', '[]');

                    ct.defineTaskList(fifoName, 'synchro/client.php', function (id, action, data) {
                        nbAction++;
                        done.push({'n':id, 'a':action, 'd':data, 'todo':ct.nbTaskTodo(fifoName), 'done':ct.nbTaskDone(fifoName)});
                    });
                    ct.clearTaskList(fifoName);
                    ct.synchronize(fifoName, function () {
                        ok = true;
                        end = true;
                    }, function (message) {
                        error = message;
                        end = true;
                    });

                    httpBackend.flush();
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "a4p.TaskReceiver should have synchronized",
                    10000);

                runs(function () {
                    expect(ok).toBe(true);
                    expect(error).toBeNull();

                    expect(ct.nbTaskTodo(fifoName)).toBe(2);
                    expect(ct.nbTaskDone(fifoName)).toBe(0);

                    expect(nbAction).toBe(1);
                    expect(done.length).toBe(1);
                    expect(done[0].n).toBe('id1');
                    expect(done[0].a).toBe('fct1');
                    expect(done[0].d.a).toBe(0);
                    expect(done[0].d.b).toBe(1);
                    expect(done[0].todo).toBe(2);
                    expect(done[0].done).toBe(0);

                    ct.doneTask(fifoName, 'ack1');

                    expect(done.length).toBe(2);
                    expect(done[0].n).toBe('id1');
                    expect(done[0].a).toBe('fct1');
                    expect(done[0].d.a).toBe(0);
                    expect(done[0].d.b).toBe(1);
                    expect(done[0].todo).toBe(2);
                    expect(done[0].done).toBe(0);
                    expect(done[1].n).toBe('id2');
                    expect(done[1].a).toBe('fct2');
                    expect(done[1].d.a).toBe(1);
                    expect(done[1].d.b).toBe(1);
                    expect(done[1].todo).toBe(1);
                    expect(done[1].done).toBe(1);
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {
                        return (nbAction > 1);
                    },
                    "a4p.TaskReceiver should have run 2 tasks",
                    10000);

                runs(function () {
                    ct.doneTask(fifoName, 'ack2');

                    expect(ct.nbTaskTodo(fifoName)).toBe(0);
                    expect(ct.nbTaskDone(fifoName)).toBe(2);
                });

                // Redo synchronize to add 2 new tasks and verify that done ones are acknowledged

                runs(function () {
                    nbAction = 0;
                    end = false;
                    ok = false;
                    error = null;
                    done = [];

                    httpBackend.expectPOST('synchro/client2.php', '[{"id":"id1","ack":"ack1"},{"id":"id2","ack":"ack2"}]');

                    ct.defineTaskList(fifoName, 'synchro/client2.php', function (id, action, data) {
                        nbAction++;
                        done.push({'n':id, 'a':action, 'd':data, 'todo':ct.nbTaskTodo(fifoName), 'done':ct.nbTaskDone(fifoName)});
                    });

                    expect(ct.nbTaskTodo(fifoName)).toBe(0);
                    expect(ct.nbTaskDone(fifoName)).toBe(2);

                    ct.synchronize(fifoName, function () {
                        ok = true;
                        end = true;
                    }, function (message) {
                        error = message;
                        end = true;
                    });

                    httpBackend.flush();
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "a4p.TaskReceiver should have synchronized",
                    10000);

                runs(function () {
                    expect(ok).toBe(true);
                    expect(error).toBeNull();

                    expect(ct.nbTaskTodo(fifoName)).toBe(2);
                    expect(ct.nbTaskDone(fifoName)).toBe(0);

                    expect(nbAction).toBe(1);
                    expect(done.length).toBe(1);
                    expect(done[0].n).toBe('id3');
                    expect(done[0].a).toBe('fct3');
                    expect(done[0].d.a).toBe(2);
                    expect(done[0].d.b).toBe(2);
                    expect(done[0].todo).toBe(2);
                    expect(done[0].done).toBe(0);

                    ct.doneTask(fifoName, 'ack3');

                    expect(done.length).toBe(2);
                    expect(done[0].n).toBe('id3');
                    expect(done[0].a).toBe('fct3');
                    expect(done[0].d.a).toBe(2);
                    expect(done[0].d.b).toBe(2);
                    expect(done[0].todo).toBe(2);
                    expect(done[0].done).toBe(0);
                    expect(done[1].n).toBe('id4');
                    expect(done[1].a).toBe('fct4');
                    expect(done[1].d.a).toBe(3);
                    expect(done[1].d.b).toBe(2);
                    expect(done[1].todo).toBe(1);
                    expect(done[1].done).toBe(1);

                    ct.doneTask(fifoName, 'ack4');

                    expect(ct.nbTaskTodo(fifoName)).toBe(0);
                    expect(ct.nbTaskDone(fifoName)).toBe(2);
                });

            });

        });

    });

    describe('TaskSender', function () {

        describe('with default dependencies', function () {

            var name = 'client1';
            var fifoName = 'task1';
            var http;
            var httpBackend;
            var st;

            beforeEach(inject(function ($injector) {

                http = $injector.get('$http');
                httpBackend = $injector.get('$httpBackend');

                // backend definition common for all tests
                // BUG : passThrough() does not exists, contrary to doc :-(
                // $httpBackend.when('GET', 'models/data.json').passThrough();
                httpBackend.when('POST', 'synchro/client3.php').respond(
                    []
                );
                httpBackend.when('POST', 'synchro/client4.php').respond(
                    [
                        {'id':'id1', 'ack':{'a':0, 'b':1}},
                        {'id':'id2', 'ack':{'a':1, 'b':1}}
                    ]
                );

            }));

            beforeEach(function () {

                st = new a4p.TaskSender(name, http, null);

            });

            afterEach(function () {

                httpBackend.verifyNoOutstandingExpectation();
                httpBackend.verifyNoOutstandingRequest();

            });

            it('should define one task without yet synchronization', function () {

                var nbAck = 0;

                st.defineTaskList(fifoName, 'dummy', function (id, ack) {
                    nbAck++;
                });
                st.clearTaskList(fifoName);

                expect(nbAck).toBe(0);
                expect(st.nbTaskTodo(fifoName)).toBe(0);
                expect(st.nbTaskSent(fifoName)).toBe(0);
                expect(st.nbTaskAck(fifoName)).toBe(0);

            });


            it('should synchronize and load 2 tasks', function () {

                var nbAck = 0;
                var ack = [];
                var end = false;
                var ok = false;
                var error = null;

                runs(function () {
                    nbAck = 0;
                    end = false;
                    ok = false;
                    error = null;

                    httpBackend.expectPOST('synchro/client3.php', '[{"id":"id1","action":"action1","data":"data1"},{"id":"id2","action":"action2","data":{"a":0,"b":"dummy"}}]');

                    st.defineTaskList(fifoName, 'synchro/client3.php', function (id, ackData) {
                        nbAck++;
                        ack.push({'n':id, 'a':ackData, 'todo':st.nbTaskTodo(fifoName),
                            'sent':st.nbTaskSent(fifoName), 'ack':st.nbTaskAck(fifoName)});
                    });
                    st.clearTaskList(fifoName);
                    st.todoTask(fifoName, 'id1', 'action1', 'data1');
                    st.todoTask(fifoName, 'id2', 'action2', {'a':0, 'b':'dummy'});

                    expect(st.nbTaskTodo(fifoName)).toBe(2);
                    expect(st.nbTaskSent(fifoName)).toBe(0);
                    expect(st.nbTaskAck(fifoName)).toBe(0);

                    st.synchronize(fifoName, function () {
                        ok = true;
                        end = true;
                    }, function (message) {
                        error = message;
                        end = true;
                    });

                    httpBackend.flush();
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "a4p.TaskSender should have synchronized",
                    10000);

                runs(function () {
                    expect(ok).toBe(true);
                    expect(error).toBeNull();

                    expect(nbAck).toBe(0);
                    expect(st.nbTaskTodo(fifoName)).toBe(0);
                    expect(st.nbTaskSent(fifoName)).toBe(2);
                    expect(st.nbTaskAck(fifoName)).toBe(0);
                });

                // Redo synchronize to verify that done ones are acknowledged

                runs(function () {
                    nbAck = 0;
                    end = false;
                    ok = false;
                    error = null;
                    ack = [];

                    httpBackend.expectPOST('synchro/client4.php', '[]');

                    st.defineTaskList(fifoName, 'synchro/client4.php', function (id, ackData) {
                        nbAck++;
                        ack.push({'n':id, 'a':ackData, 'todo':st.nbTaskTodo(fifoName),
                            'sent':st.nbTaskSent(fifoName), 'ack':st.nbTaskAck(fifoName)});
                    });

                    expect(st.nbTaskTodo(fifoName)).toBe(0);
                    expect(st.nbTaskSent(fifoName)).toBe(2);
                    expect(st.nbTaskAck(fifoName)).toBe(0);

                    st.synchronize(fifoName, function () {
                        ok = true;
                        end = true;
                    }, function (message) {
                        error = message;
                        end = true;
                    });

                    httpBackend.flush();
                });

                // latch function polls until it returns true or 10s timeout expires
                waitsFor(function () {
                        return end;
                    },
                    "a4p.TaskSender should have synchronized",
                    10000);

                runs(function () {
                    expect(ok).toBe(true);
                    expect(error).toBeNull();

                    expect(st.nbTaskTodo(fifoName)).toBe(0);
                    expect(st.nbTaskSent(fifoName)).toBe(0);
                    expect(st.nbTaskAck(fifoName)).toBe(2);

                    expect(nbAck).toBe(1);
                    expect(ack.length).toBe(1);
                    expect(ack[0].n).toBe('id1');
                    expect(ack[0].a.a).toBe(0);
                    expect(ack[0].a.b).toBe(1);
                    expect(ack[0].todo).toBe(0);
                    expect(ack[0].sent).toBe(0);
                    expect(ack[0].ack).toBe(2);

                    st.doneTask(fifoName);

                    expect(nbAck).toBe(2);
                    expect(ack.length).toBe(2);
                    expect(ack[0].n).toBe('id1');
                    expect(ack[0].a.a).toBe(0);
                    expect(ack[0].a.b).toBe(1);
                    expect(ack[0].todo).toBe(0);
                    expect(ack[0].sent).toBe(0);
                    expect(ack[0].ack).toBe(2);
                    expect(ack[1].n).toBe('id2');
                    expect(ack[1].a.a).toBe(1);
                    expect(ack[1].a.b).toBe(1);
                    expect(ack[1].todo).toBe(0);
                    expect(ack[1].sent).toBe(0);
                    expect(ack[1].ack).toBe(1);

                    st.doneTask(fifoName);

                    expect(st.nbTaskTodo(fifoName)).toBe(0);
                    expect(st.nbTaskSent(fifoName)).toBe(0);
                    expect(st.nbTaskAck(fifoName)).toBe(0);
                });

            });

        });

    });

    describe('throttle', function () {

        it('should execute callback once in 600ms', function () {

            var waitTimestamp = 0;
            var execNb = 0;
            var execTimestamp = 0;
            var callback = function() {
                execTimestamp = (new Date()).getTime();
                execNb++;
            };
            var fct = a4p.throttle(callback, 600);

            runs(function () {
                waitTimestamp = (new Date()).getTime();
            });

            waitsFor(function () {
                    fct();
                    return (execNb > 1);
                },
                "a4p.throttle should have waited for 600ms",
                1000);

            runs(function () {
                console.log('waitsFor-1 after at ' + (new Date()).getTime());
                expect((execTimestamp - waitTimestamp)).toBeGreaterThan(599);
                expect((execTimestamp - waitTimestamp)).toBeLessThan(650);
            });

        });

    });

    describe('delay', function () {

        it('should execute callback in 500ms', function () {

            var waitTimestamp = 0;
            var execNb = 0;
            var execTimestamp = 0;
            var callback = function() {
                execTimestamp = (new Date()).getTime();
                execNb++;
            };
            var fct = a4p.delay(callback, 500);

            runs(function () {
                waitTimestamp = (new Date()).getTime();
                fct();
                fct();
                fct();
                fct();
                fct();
                console.log('waitsFor-2 before at ' + (new Date()).getTime());
            });

            waitsFor(function () {
                    console.log('waitsFor-2 triggered at ' + (new Date()).getTime());
                    return (execNb > 0);
                },
                "a4p.delay should have waited for 500ms",
                1000);

            runs(function () {
                console.log('waitsFor-2 after at ' + (new Date()).getTime());
                expect((execTimestamp - waitTimestamp)).toBeGreaterThan(499);
                expect((execTimestamp - waitTimestamp)).toBeLessThan(550);
            });

        });

        it('should execute callback in 600ms+300ms', function () {

            var waitTimestamp = 0;
            var execNb = 0;
            var execTimestamp = 0;
            var callback = function() {
                execTimestamp = (new Date()).getTime();
                execNb++;
            };
            var fct = a4p.delay(callback, 600);

            runs(function () {
                waitTimestamp = (new Date()).getTime();
                fct();
                fct();
                fct();
                fct();
                fct();
                console.log('waitsFor-3 before at ' + (new Date()).getTime());
            });

            waitsFor(function () {
                    console.log('waitsFor-3 triggered at ' + (new Date()).getTime());
                    var now = (new Date()).getTime();
                    return ((now - waitTimestamp) > 300);
                },
                "a4p.delay should have waited for 300ms",
                500);

            runs(function () {
                console.log('waitsFor-3 after at ' + (new Date()).getTime());
                fct();// This call will delay callback execution for a new 600ms
                console.log('waitsFor-4 before at ' + (new Date()).getTime());
            });

            waitsFor(function () {
                    console.log('waitsFor-4 triggered at ' + (new Date()).getTime());
                    return (execNb > 0);
                },
                "a4p.delay should have waited for 600ms",
                1000);

            runs(function () {
                console.log('waitsFor-4 after at ' + (new Date()).getTime());
                expect((execTimestamp - waitTimestamp)).toBeGreaterThan(899);
                expect((execTimestamp - waitTimestamp)).toBeLessThan(2000); //1050 //950 //MLE ???
            });

        });

    });

    describe('even', function () {

        it('should determine even numbers', function () {
            expect(a4p.even(0)).toEqual(true);
            expect(a4p.even(1)).toEqual(false);
            expect(a4p.even(2)).toEqual(true);
            expect(a4p.even(3)).toEqual(false);
        });

    });

    describe('odd', function () {

        it('should determine odd numbers', function () {
            expect(a4p.odd(0)).toEqual(false);
            expect(a4p.odd(1)).toEqual(true);
            expect(a4p.odd(2)).toEqual(false);
            expect(a4p.odd(3)).toEqual(true);
        });

    });

    describe('Array.forEach', function () {

        it('should loop on all elements', function () {
            var data = [1,2,3,4,5];
            data.forEach(function(v, i, a) { a[i] = v + 1; }); // => [2,3,4,5,6]
            expect(data[0]).toEqual(2);
            expect(data[1]).toEqual(3);
            expect(data[2]).toEqual(4);
            expect(data[3]).toEqual(5);
            expect(data[4]).toEqual(6);
        });

    });

    describe('foreach', function () {

        it('should break on first foreach.break thrown', function () {
            var data = [1,2,3,4,5];
            a4p.foreach(data, function(v, i, a) { if (i==3) throw a4p.foreach.break; a[i] = v + 1; }); // => [2,3,4,4,5]
            expect(data[0]).toEqual(2);
            expect(data[1]).toEqual(3);
            expect(data[2]).toEqual(4);
            expect(data[3]).toEqual(4);
            expect(data[4]).toEqual(5);
        });

    });

    describe('Array.map', function () {

        it('should loop on all elements', function () {
            var data = [1,2,3,4,5];
            var data2 = data.map(function(v, i, a) { return v*v; }); // => [1,4,9,16,25]
            expect(data[0]).toEqual(1);
            expect(data[1]).toEqual(2);
            expect(data[2]).toEqual(3);
            expect(data[3]).toEqual(4);
            expect(data[4]).toEqual(5);
            expect(data2[0]).toEqual(1);
            expect(data2[1]).toEqual(4);
            expect(data2[2]).toEqual(9);
            expect(data2[3]).toEqual(16);
            expect(data2[4]).toEqual(25);
        });

    });

    describe('Array.filter', function () {

        it('should keep 2 first elements', function () {
            var data = [1,2,3,4,5];
            var data2 = data.filter(function(v, i, a) { return v < 3; }); // => [1,2]
            expect(data[0]).toEqual(1);
            expect(data[1]).toEqual(2);
            expect(data[2]).toEqual(3);
            expect(data[3]).toEqual(4);
            expect(data[4]).toEqual(5);
            expect(data2.length).toEqual(2);
            expect(data2[0]).toEqual(1);
            expect(data2[1]).toEqual(2);
        });

        it('should keep even indexed elements', function () {
            var data = [1,2,3,4,5];
            var data2 = data.filter(function(v, i, a) { return a4p.even(i); }); // => [1,3,5]
            expect(data[0]).toEqual(1);
            expect(data[1]).toEqual(2);
            expect(data[2]).toEqual(3);
            expect(data[3]).toEqual(4);
            expect(data[4]).toEqual(5);
            expect(data2.length).toEqual(3);
            expect(data2[0]).toEqual(1);
            expect(data2[1]).toEqual(3);
            expect(data2[2]).toEqual(5);
        });

    });

    describe('Array.every', function () {

        it('should find all elements are true', function () {
            var data = [1,2,3,4,5];
            var data2 = data.every(function(v, i, a) { return v < 10; }); // => true
            expect(data[0]).toEqual(1);
            expect(data[1]).toEqual(2);
            expect(data[2]).toEqual(3);
            expect(data[3]).toEqual(4);
            expect(data[4]).toEqual(5);
            expect(data2).toEqual(true);
        });

        it('should find at least one element is false', function () {
            var data = [1,2,3,4,5];
            var data2 = data.every(function(v, i, a) { return a4p.even(i); }); // => false
            expect(data[0]).toEqual(1);
            expect(data[1]).toEqual(2);
            expect(data[2]).toEqual(3);
            expect(data[3]).toEqual(4);
            expect(data[4]).toEqual(5);
            expect(data2).toEqual(false);
        });

    });

    describe('Array.some', function () {

        it('should find all elements are not NaN', function () {
            var data = [1,2,3,4,5];
            var data2 = data.some(isNaN); // => false
            expect(data[0]).toEqual(1);
            expect(data[1]).toEqual(2);
            expect(data[2]).toEqual(3);
            expect(data[3]).toEqual(4);
            expect(data[4]).toEqual(5);
            expect(data2).toEqual(false);
        });

        it('should find some element are even indexed', function () {
            var data = [1,2,3,4,5];
            var data2 = data.some(function(v, i, a) { return a4p.even(i); }); // => true
            expect(data[0]).toEqual(1);
            expect(data[1]).toEqual(2);
            expect(data[2]).toEqual(3);
            expect(data[3]).toEqual(4);
            expect(data[4]).toEqual(5);
            expect(data2).toEqual(true);
        });

    });

    describe('Array.reduce', function () {

        it('should sum all elements', function () {
            var data = [1,2,3,4,5];
            var called = 0;
            var sum = data.reduce(function(x, v, i, a) { called = called + 1; return x+v; }, 0); // => 15
            // Return initial value if array is empty
            expect(data[0]).toEqual(1);
            expect(data[1]).toEqual(2);
            expect(data[2]).toEqual(3);
            expect(data[3]).toEqual(4);
            expect(data[4]).toEqual(5);
            expect(sum).toEqual(15);
            expect(called).toEqual(5);
        });

        it('should return initial value', function () {
            var data = [];
            var called = false;
            var sum = data.reduce(function(x, v, i, a) { called = true; return x+v; }, 45); // => 0
            expect(sum).toEqual(45);
            expect(called).toEqual(false);
        });

        it('should product all elements', function () {
            var data = [1,2,3,4,5];
            var called = 0;
            var product = data.reduce(function(x, v, i, a) { called = called + 1; return x*v; }, 1); // => 120
            // Return initial value if array is empty
            expect(data[0]).toEqual(1);
            expect(data[1]).toEqual(2);
            expect(data[2]).toEqual(3);
            expect(data[3]).toEqual(4);
            expect(data[4]).toEqual(5);
            expect(product).toEqual(120);
            expect(called).toEqual(5);
        });

        it('should get max of all elements', function () {
            var data = [1,2,3,4,5];
            var called = 0;
            var max = data.reduce(function(x, v, i, a) { called = called + 1; return (x>v)?x:v; }); // => 5
            // NO second arg for reduce() => uses the first element of the array as the initial value
            // and start to call with second element of the array
            // => TypeError exception if the array is empty
            // => Return first element of the array if array has only ONE element
            expect(data[0]).toEqual(1);
            expect(data[1]).toEqual(2);
            expect(data[2]).toEqual(3);
            expect(data[3]).toEqual(4);
            expect(data[4]).toEqual(5);
            expect(max).toEqual(5);
            expect(called).toEqual(4);
        });

        it('should return first element', function () {
            var data = [47];
            var called = false;
            var max = data.reduce(function(x, v, i, a) { called = true; return (x>v)?x:v; }); // => 47
            expect(data[0]).toEqual(47);
            expect(max).toEqual(47);
            expect(called).toEqual(false);
        });

        it('should extend all attributes', function () {
            var objects = [{x:1}, {y:2}, {y:4, z:3}];
            var called = 0;
            var extended = objects.reduce(function(x, v, i, a) { called = called + 1; return a4p.extend(x, v); }, {}); // => {x:1, y:4, z:3}
            expect(extended.x).toEqual(1);
            expect(extended.y).toEqual(4);
            expect(extended.z).toEqual(3);
            expect(called).toEqual(3);
        });

        it('should merge all attributes', function () {
            var objects = [{x:1}, {y:2}, {y:4, z:3}];
            var called = 0;
            var merged = objects.reduce(function(x, v, i, a) { called = called + 1; return a4p.merge(x, v); }, {}); // => {x:1, y:2, z:3}
            expect(merged.x).toEqual(1);
            expect(merged.y).toEqual(2);
            expect(merged.z).toEqual(3);
            expect(called).toEqual(3);
        });

    });

    describe('Array.reduceRight', function () {

        it('should exponentiate from right to left', function () {
            var data = [2,2,3];
            var called = 0;
            var exp = data.reduceRight(function(x, v, i, a) { called = called + 1; return Math.pow(v, x); }); // => 2^(2^3) = 2^8 = 256
            expect(data[0]).toEqual(2);
            expect(data[1]).toEqual(2);
            expect(data[2]).toEqual(3);
            expect(exp).toEqual(256);// and NOT (2^2)^3 = 4^3 = 64
            expect(called).toEqual(2);
        });

    });

    describe('a4p.create', function () {

        it('should not work with constructor', function () {
            var F = function() {
                this.x = 1;
                this.y = 2;
                this.z = 3;
            };
            F.prototype.a = function () { return 4};
            F.prototype.b = function () { return 5};

            var o = a4p.create(F);
            expect(o.x).toBeUndefined();
            expect(o.y).toBeUndefined();
            expect(o.z).toBeUndefined();
            expect(o.a).toBeUndefined();
            expect(o.b).toBeUndefined();
        });

        it('should work with class prototype', function () {
            var F = function() {
                this.x = 1;
                this.y = 2;
                this.z = 3;
            };
            F.prototype.a = function () { return 4};
            F.prototype.b = function () { return 5};

            var o = a4p.create(F.prototype);
            expect(o.x).toBeUndefined();
            expect(o.y).toBeUndefined();
            expect(o.z).toBeUndefined();
            expect(o.a()).toEqual(4);
            expect(o.b()).toEqual(5);
        });

        it('should work with object and attributes', function () {
            var F = function() {
                this.x = 1;
                this.y = 2;
                this.z = 3;
            };
            F.prototype.a = function () { return 4};
            F.prototype.b = function () { return 5};

            var p = new F();
            expect(p.x).toEqual(1);
            expect(p.y).toEqual(2);
            expect(p.z).toEqual(3);
            expect(p.a()).toEqual(4);
            expect(p.b()).toEqual(5);
            expect(p.toString).toBeDefined();// Object class prototype
            var o = a4p.create(p);
            expect(o.x).toEqual(1);
            expect(o.y).toEqual(2);
            expect(o.z).toEqual(3);
            expect(o.a()).toEqual(4);
            expect(o.b()).toEqual(5);
            expect(o.toString).toBeDefined();// Object class prototype
        });

        it('should work with inheritance', function () {
            var F = function() {
                this.x = 1;
                this.y = 2;
                this.z = 3;
            };
            F.prototype.a = function () { return 4};
            F.prototype.b = function () { return 5};

            var G = function() {
                F.apply(this, arguments);// To call F constructor
                this.w = 8;
            };
            G.prototype.c = function () { return 9};
            a4p.merge(G.prototype, F.prototype);

            var p = new F();
            expect(p.x).toEqual(1);
            expect(p.y).toEqual(2);
            expect(p.z).toEqual(3);
            expect(p.a()).toEqual(4);
            expect(p.b()).toEqual(5);
            expect(p.toString).toBeDefined();// Object class prototype
            var q = new G();
            expect(q.x).toEqual(1);
            expect(q.y).toEqual(2);
            expect(q.z).toEqual(3);
            expect(q.w).toEqual(8);
            expect(q.a()).toEqual(4);
            expect(q.b()).toEqual(5);
            expect(q.c()).toEqual(9);
            expect(q.toString).toBeDefined();// Object class prototype
            var o = a4p.create(q, {
                x:{
                    value:6,
                    enumerable:true,
                    writable:true
                },
                y:{
                    value:7,
                    enumerable:true,
                    writable:true
                }
            });
            expect(o.x).toEqual(6);
            expect(o.y).toEqual(7);
            expect(o.w).toEqual(8);
            expect(o.z).toEqual(3);
            expect(o.a()).toEqual(4);
            expect(o.b()).toEqual(5);
            expect(o.c()).toEqual(9);
            expect(o.toString).toBeDefined();// Object class prototype
        });

        it('should work with structure (but you should not use it)', function () {
            var p = {x:1};

            expect(p.x).toEqual(1);
            expect(p.y).toBeUndefined();
            expect(p.z).toBeUndefined();
            expect(p.toString).toBeDefined();// Object class prototype
            var o = a4p.create(p);
            expect(o.x).toEqual(1);
            expect(o.y).toBeUndefined();
            expect(o.z).toBeUndefined();
            expect(o.toString).toBeDefined();// Object class prototype
        });

    });

    describe('getter and setter', function () {

        it('should work in object', function () {
            var p = {
                x: 1.0,
                y: 1.0,

                get r() {
                    return Math.sqrt(this.x * this.x + this.y * this.y);
                },
                set r(newvalue) {
                    var oldvalue = Math.sqrt(this.x * this.x + this.y * this.y);
                    var ratio = newvalue / oldvalue;
                    this.x *= ratio;
                    this.y *= ratio;
                },

                get theta() {
                    return Math.atan2(this.y, this.x);
                }
            };

            var q1 = a4p.create(p); // Create a new object that inherits getters and setters
            var q2 = a4p.create(p); // Create a new object that inherits getters and setters
            q1.x = 3;
            q1.y = 4;
            expect(q1.x).toEqual(3);
            expect(q1.y).toEqual(4);
            expect(q1.r).toEqual(5);
            expect(q1.theta).toEqual(Math.atan2(4, 3));
            expect(q2.x).toEqual(1);
            expect(q2.y).toEqual(1);
            expect(q2.r).toEqual(Math.sqrt(2));
            expect(q2.theta).toEqual(Math.PI/4);
        });

    });

});
