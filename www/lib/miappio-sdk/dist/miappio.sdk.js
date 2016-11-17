

// Usefull
var miappBlockMove = function (evt,stopBubble) {
    'use strict';
    //console.log('miappBlockMove');
    // All but scrollable element = .c4p-container-scroll-y
    //if (evt.preventDefault) evt.preventDefault() ;
    //if (evt.preventDefault && !$(evt.target).parents('.c4p-container-scroll-y')[0]) {
    //    evt.preventDefault();
    //}
    if (evt.preventDefault && !$('.c4p-container-scroll-y').has($(evt.target)).length) {
        evt.preventDefault();
    }

    if (stopBubble && evt.stopPropagation) evt.stopPropagation();
    if (stopBubble && !evt.cancelBubble) evt.cancelBubble = true;


};

var miappAllowMove = function (e) {
    //console.log('miappAllowMove');
    return true ;
};


var miappFakeConsoleLog = function (e) {
    //console.log('miappAllowMove');
    return true;
};

// Should be created by Cordova (or CordovaMocks)
var LocalFileSystem;
var Metadata;
var FileError;
var ProgressEvent;
var File;
var DirectoryEntry;
var DirectoryReader;
var FileWriter;
var FileEntry;
var FileSystem;
var FileReader;
var FileTransferError;
var FileUploadOptions;
var FileUploadResult;
var FileTransfer;
var Camera;
//var calendarPlugin;
//var analytics;

/**
 * @namespace
 */

 var miapp;
 if (!miapp) miapp = {};

// A consistent way to create a unique ID which will never overflow.

miapp.uid  = ['0', '0', '0'];
miapp.idStr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
miapp.idNext = {
    '0':1, '1':2, '2':3, '3':4, '4':5, '5':6, '6':7, '7':8, '8':9, '9':10,
    'A':11, 'B':12, 'C':13, 'D':14, 'E':15, 'F':16, 'G':17, 'H':18, 'I':19, 'J':20,
    'K':21, 'L':22, 'M':23, 'N':24, 'O':25, 'P':26, 'Q':27, 'R':28, 'S':29, 'T':30,
    'U':31, 'V':32, 'W':33, 'X':34, 'Y':35, 'Z':0
};

miapp.nextUid = function() {
    var index = miapp.uid.length;
    while (index) {
        index--;
        var i = miapp.idNext[miapp.uid[index]];
        miapp.uid[index] = miapp.idStr[i];
        if (i > 0) {
            return miapp.uid.join('');
        }
    }
    miapp.uid.unshift('0');
    return miapp.uid.join('');
};

miapp.getUid = function() {
    return miapp.uid.join('');
};

miapp.initUid = function(seed) {
    if (miapp.isUndefined(seed)) {
        miapp.uid  = ['0', '0', '0'];
        return;
    }
    seed = seed.toUpperCase();
    miapp.uid  = [];
    for (var i = 0, n = seed.length; i < n; i++) {
        var c = seed.charAt(i);
        if (miapp.isDefined(miapp.idNext[c])) {
            miapp.uid.push(c);
        }
    }
    while (miapp.uid.length < 3) {
        miapp.uid.unshift('0');
    }
};

/**
 * Function to test the undefined of any variable
 *
 * @param obj
 * @returns {boolean}
 */
miapp.isUndefined = function(obj) {
    return (typeof(obj) == 'undefined');
};

/**
 * Function to test the non-undefined of any variable
 *
 * @param obj
 * @returns {boolean}
 */
miapp.isDefined = function(obj) {
    return (typeof(obj) != 'undefined');
};

/**
 * Function to test the undefined or nullity of any variable
 *
 * @param obj
 * @returns {boolean}
 */
miapp.isUndefinedOrNull = function(obj) {
    return (typeof(obj) == 'undefined') || (obj === null);
};

/**
 * Function to test the non-undefined and non-null of any variable
 *
 * @param obj
 * @returns {boolean}
 */
miapp.isDefinedAndNotNull = function(obj) {
    return (typeof(obj) != 'undefined') && (obj !== null);
};

// Speed up calls to hasOwnProperty
//var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Function to test the emptiest of any variable
 * Ex: undefined, null, {}, [], '' are empty
 *
 * @param obj
 * @returns {boolean}
 */
miapp.isEmptyOrFalse = function(obj) {
    'use strict';
    switch (typeof(obj)) {
        case 'object' :
            /*for (var key in obj) {
                if (hasOwnProperty.call(obj, key)) return false;
            }*/
            // Object.getOwnPropertyNames throw exception on null object
            if (obj === null) return true;
            if (Object.getOwnPropertyNames(obj).length === 0) return true;
            // Beware Document objects have a 'length' attr about the body attribute
            if (obj instanceof Array) {
                return (obj.length === 0);
            } else {
                return false;
            }
            break;
        case 'string' :
            return (obj.length === 0);
        case 'number' :
            return (obj === 0);
        case 'boolean' :
            return !obj;
        case 'function' :
            return false;
        case 'undefined' :
            return true;
    }
    return !obj;
};

/**
 * Function to test the emptiest of any variable
 * Ex: undefined, null, {}, [], '' are empty
 *
 * @param obj
 * @returns {boolean}
 */
miapp.isTrueOrNonEmpty = function(obj) {
    switch (typeof(obj)) {
        case 'object' :
            /*for (var key in obj) {
                if (hasOwnProperty.call(obj, key)) return false;
            }*/
            // Object.getOwnPropertyNames throw exception on null object
            if (obj === null) return false;
            if (Object.getOwnPropertyNames(obj).length === 0) return false;
            // Beware Document objects have a 'length' attr about the body attribute
            if (obj instanceof Array) {
                return (obj.length !== 0);
            } else {
                return true;
            }
            break;
        case 'string' :
            return (obj.length !== 0);
        case 'number' :
            return (obj !== 0);
        case 'boolean' :
            return obj;
        case 'function' :
            return true;
        case 'undefined' :
            return false;
    }
    return !!obj;
};

/**
 * Safe $apply with evaluation in scope context : asynchronous if we are already in $$phase, direct if not
 *
 * To execute expr in next $apply, you should use $timeout(function() {scope.$apply(expr);}, 0);
 *
 * @param scope
 * @param expr
 */
miapp.safeApply = function (scope, expr, beforeFct, afterFct) {

    if (beforeFct) miapp.safeApply(scope,beforeFct);

    // Check scope.$root.$$phase because it is always true during any $apply(), while scope.$$phase is NOT always true
    if (scope.$root && scope.$root.$$phase) {
        // Queue in scope.$root, because in scope it will not be evaluated in $digest()
        // scope.$digest() is not executed, ONLY $rootScope.$digest() is executed.
        console.log('safeApply - scope.$root outside the $digest');
        scope.$root.$evalAsync(function() {
            scope.$eval(expr);
        });
    }
    else if (scope.$treeScope && scope.$treeScope.$apply){
        console.log('safeApply - scope.$treeScope for callback');
        scope.$treeScope.$apply(expr);
    }
    else if (scope.$apply && (scope.$apply != angular.noop)) {
        console.log('safeApply - scope.$apply');
        scope.$apply(expr);
    }
    else {
        console.log('safeApply - na : dangerous ?');
        expr();
    }

    if (afterFct) miapp.safeApply(scope,afterFct);
};

/**
 * Solution to work around an XHR issue : sometimes no end if no $Apply under Chrome for example.
 * This solution trigger an $apply to hope triggering the XHR end.
 */
miapp.promiseWakeupNb = 0; // number of simultaneous active httpPromise
miapp.promiseWakeupTimeout = null;
miapp.promiseWakeup = function (scope, httpPromise, fctOnHttpSuccess, fctOnHttpError) {
    var promiseWakeupOnHttpSuccess = function(response) {
        //miapp.InternalLog.log("miapp.promiseWakeup.tick", "promiseWakeupOnHttpSuccess?");
        miapp.promiseWakeupNb--;
        // Keep tick function active until all httpPromise end
        if (miapp.promiseWakeupNb <= 0) {
            miapp.InternalLog.log("miapp.promiseWakeup.tick", "stop");
            miapp.promiseWakeupNb = 0;
            clearTimeout(miapp.promiseWakeupTimeout);
            miapp.promiseWakeupTimeout = null;
        }
        fctOnHttpSuccess(response);
    };
    var promiseWakeupOnHttpError = function(response) {
        //miapp.InternalLog.log("miapp.promiseWakeup.tick", "promiseWakeupOnHttpError?");
        miapp.promiseWakeupNb--;
        // Keep tick function active until all httpPromise end
        if (miapp.promiseWakeupNb <= 0) {
            miapp.InternalLog.log("miapp.promiseWakeup.tick", "stop");
            miapp.promiseWakeupNb = 0;
            clearTimeout(miapp.promiseWakeupTimeout);
            miapp.promiseWakeupTimeout = null;
        }
        fctOnHttpError(response);
    };
    function tick() {
        if (miapp.promiseWakeupNb > 0) {
            //miapp.InternalLog.log("miapp.promiseWakeup.tick", "scope.$apply");
            miapp.safeApply(scope);
            // Usage of $timeout breaks e2e tests for the moment : https://github.com/angular/angular.js/issues/2402
            //$timeout(tick, 1000, false);// DO NOT call $apply
            miapp.promiseWakeupTimeout = setTimeout(tick, 1000);
        } else {
            //miapp.InternalLog.log("miapp.promiseWakeup.tick", "ignored");
        }
    }
    // Launch only one tick function if many httpPromise occur
    if (miapp.promiseWakeupNb === 0) {
        //miapp.InternalLog.log("miapp.promiseWakeup.tick", "start");
        miapp.promiseWakeupTimeout = setTimeout(tick, 1000);
    }
    miapp.promiseWakeupNb++;
    //miapp.InternalLog.log("miapp.promiseWakeup.tick", "before?");
    httpPromise.then(promiseWakeupOnHttpSuccess, promiseWakeupOnHttpError);
    //miapp.InternalLog.log("miapp.promiseWakeup.tick", "after?");
};

function openChildBrowser(url, extension, onLocationChange, onClose) {

    //miapp.InternalLog.log('openChildBrowser', url+' extension:'+extension);
    var closeChildBrowserAfterLocationChange = false;// To NOT call onClose() if onLocationChange() has been called
    if (!window.device){
        // Chrome case
        // We can not bind on window events because Salesforce page modify/erase our event bindings.
        miapp.InternalLog.log('openChildBrowser', 'window.open');
        var new_window = window.open(url, '_blank', 'menubar=no,scrollbars=yes,resizable=1,height=400,width=600');
        var initialLocation;
        var initialUrl;
        if (miapp.isDefinedAndNotNull(new_window.location)) {
            initialLocation = new_window.location.href;
        }
        if (miapp.isDefinedAndNotNull(new_window.document)) {
            initialUrl = new_window.document.URL;
        }
        miapp.InternalLog.log('openChildBrowser', 'initialLocation=' + initialLocation + ' initialUrl=' + initialUrl);
        var locationChanged = false;
        //if (onLocationChange) new_window.onbeforeunload = onLocationChange;
        var new_window_tracker = function () {
            if (miapp.isDefinedAndNotNull(new_window.location) && (typeof new_window.location.href == "string")) {
                //miapp.InternalLog.log('openChildBrowser', 'new location=' + new_window.location.href);
            } else if (miapp.isDefinedAndNotNull(new_window.document) && (typeof new_window.document.URL == "string")) {
                //miapp.InternalLog.log('openChildBrowser', 'new url=' + new_window.document.URL);
            }
            if (!locationChanged) {
                if (miapp.isDefinedAndNotNull(new_window.location) &&
                    (typeof new_window.location.href == "string") &&
                    (initialLocation != new_window.location.href)) {
                    miapp.InternalLog.log('openChildBrowser', 'new location=' + new_window.location.href);
                    locationChanged = true;
                    setTimeout(new_window_tracker, 100);
                    return;
                } else if (miapp.isDefinedAndNotNull(new_window.document) &&
                    (typeof new_window.document.URL == "string") &&
                    (initialUrl != new_window.document.URL)) {
                    miapp.InternalLog.log('openChildBrowser', 'new url=' + new_window.document.URL);
                    locationChanged = true;
                    setTimeout(new_window_tracker, 100);
                    return;
                }
            } else {
                if (miapp.isDefinedAndNotNull(new_window.location) &&
                    (typeof new_window.location.href == "string") &&
                    (new_window.location.href.indexOf('about:blank') >= 0)) {
                    miapp.InternalLog.log('openChildBrowser', 'onLocationChange');
                    if (onLocationChange) onLocationChange();
                    closeChildBrowserAfterLocationChange = true;
                    new_window.close();
                    return;
                } else if (miapp.isDefinedAndNotNull(new_window.document) &&
                    (typeof new_window.document.URL == "string") &&
                    (new_window.document.URL.indexOf('about:blank') >= 0)) {
                    miapp.InternalLog.log('openChildBrowser', 'onUrlChange');
                    if (onLocationChange) onLocationChange();
                    closeChildBrowserAfterLocationChange = true;
                    new_window.close();
                    return;
                }
            }
            if (new_window.closed) {
                miapp.InternalLog.log('openChildBrowser', 'onClose');
                if (!closeChildBrowserAfterLocationChange) {
                    if (onClose) onClose();
                }
                return;
            }
            //miapp.InternalLog.log('openChildBrowser', 'track locationChanged=' + locationChanged);
            setTimeout(new_window_tracker, 100);
        };
        setTimeout(new_window_tracker, 100);
        return;
  }
  else {
        miapp.InternalLog.log('openChildBrowser', 'cordova : window.open');
        var target = '_blank';
        if (extension != 'url' && window.device.platform === "Android") target = '_system';
        var ref = window.open(url, target,'location=no' );//'_blank', 'location=yes');'_system','location=no'
        ref.addEventListener('loadstart', function(e){
          miapp.InternalLog.log('openChildBrowser', 'loadstart '+e.url);
        });
        ref.addEventListener('loadstop', function(e){
          miapp.InternalLog.log('openChildBrowser', 'loadstop '+e.url);
          if (typeof e.url == "string" && e.url.indexOf("about:blank") >= 0) {
              closeChildBrowserAfterLocationChange = true;
              if (onLocationChange) onLocationChange();
              ref.close();
          }
        });
        ref.addEventListener('loaderror', function(e){
          miapp.InternalLog.log('openChildBrowser', 'loaderror '+e.url);
        });
        ref.addEventListener('exit', function(e){
          miapp.InternalLog.log('openChildBrowser', 'exit '+e.url);
          if(!closeChildBrowserAfterLocationChange){
            if (onClose) onClose();
          }
        });
  }
}

function closeWindow()
{
   window.close();
}

function isArray(obj) {
    // do an instanceof check first
    if (obj instanceof Array) {
        return true;
    }
    // then check for obvious falses
    if (typeof obj !== 'object') {
        return false;
    }
    if (miapp.isUndefined(obj) || (obj === null)) {
        return false;
    }
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        return true;
    }
    return false;
}

function updateImage(source,img) {
  if (img && img != '/.')
    source.src = img;
  else
    source.src = "./img/broken.png";

  source.onerror = "";
  return true;
}

function ImgError(source, img){

    setTimeout(function() {updateImage(source,img);}, 10000);
    return false;
}

function getErrorObject(){
    try { throw Error(''); } catch(err) { return err; }
}

function miappExportJson(input, maxDepth) {
    var str = '{\n', key, first = true, type;
    for (key in input) {
        if (!input.hasOwnProperty(key)) continue;
        if (key != 'Contact' && key != 'Attendee' && key != 'Account' &&
           key != 'Opportunity' && key != 'Event' && key != 'Document') continue;
        type = key;
        if (first) {
            first = false;
        } else {
            str += ',\n';
        }
        str +='\t' + '\"' + key + '\":[\n';

        if (typeof input[key] === "object") {
            if (maxDepth > 0) {
                str += miappExportJsonObject('\t\t', input[key], maxDepth-1, type);
            }
        }
        str +='\t' + ']';
    }
    str +='\n}\n';

    return str;
}

function miappExportJsonObject(offset, input, maxDepth, type) {
    var str = "", key, first = true;
    for (key in input) {
        if (!input.hasOwnProperty(key)) continue;
        if (first) {
            first = false;
        } else {
            str += ',\n';
        }
        if (typeof input[key] === "object") {
            if (maxDepth > 0) {
                if (maxDepth == 2) {
                    str += offset + '{\n';
                } else {
                    str += offset + '\"' +key+ '\":{';
                }
                str += miappExportJsonObject(offset + '\t', input[key], maxDepth-1, type);

                if (maxDepth == 2) {
                    str += offset + '}';
                } else {
                    str += '}';
                }
            }
        } else {
            if (typeof input[key] == 'string') {
                input[key] = input[key].replace(/\r/ig, ' ').replace(/\n/ig, ' ');
            }
            if (maxDepth === 0) {
                str += '\"' +key + '\":\"' + input[key] + '\"';
            } else {
                str += offset + '\"' +key + '\":\"' + input[key] + '\"';
            }

        }
    }
    if(maxDepth == 1 && type == 'Document'){
      str += ',\n' + offset +'\"url\":\"img/samples/docs/' + input.name + '\"';
    }
    if(maxDepth !== 0){
      str +='\n';
    }

    return str;
}


var cache = window.applicationCache;
var cacheStatusValues = [];

function logEvent(e) {
    var online, status, type, message;
    var bCon = checkConnection();
    online = (bCon) ? 'yes' : 'no';
    status = cacheStatusValues[cache.status];
    type = e.type;
    message = 'CACHE online: ' + online;
    message+= ', event: ' + type;
    message+= ', status: ' + status;
    if (type == 'error' && bCon) {
        message+= ' (prolly a syntax error in manifest)';
    }
    miapp.InternalLog.log(message);
}

//window.applicationCache.addEventListener(
//    'updateready',
//    function(){
//        window.applicationCache.swapCache();
//        miapp.InternalLog.log('swap cache has been called');
//    },
//    false
//);

//setInterval(function(){cache.update()}, 10000);


function checkCache() {
// Check if new appcache is available, load it, and reload page.
//if (window.applicationCache) {
//  window.applicationCache.addEventListener('updateready', function(e) {
//    if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
//      window.applicationCache.swapCache();
//      if (confirm('A new version of this site is available. Load it?')) {
//        window.location.reload();
//      }
//    }
//  }, false);
//}

	if(cache) {

		cacheStatusValues[0] = 'uncached';
		cacheStatusValues[1] = 'idle';
		cacheStatusValues[2] = 'checking';
		cacheStatusValues[3] = 'downloading';
		cacheStatusValues[4] = 'updateready';
		cacheStatusValues[5] = 'obsolete';

		cache.addEventListener('cached', logEvent, false);
		cache.addEventListener('checking', logEvent, false);
		cache.addEventListener('downloading', logEvent, false);
		cache.addEventListener('error', logEvent, false);
		cache.addEventListener('noupdate', logEvent, false);
		cache.addEventListener('obsolete', logEvent, false);
		cache.addEventListener('progress', logEvent, false);
		cache.addEventListener('updateready', logEvent, false);
	}

}

function checkConnection() {

    var bCon = false;
    miapp.InternalLog.log('checkConnection','launched');
    /*
        if (!navigator.onLine) used or not ?
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

    alert('Connection type: ' + states[networkState]);


	if (navigator.network && navigator.network.connection && !navigator.network.connection.type) return false;

	if (!navigator.network || !navigator.network.connection){
		if (navigator.onLine) {
            miapp.InternalLog.log('checkConnection','without cordova but online');
			return true;
		}
        else {
            miapp.InternalLog.log('checkConnection','without cordova but online');
            return false;
        }
	}

    var networkState = navigator.network.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';

    miapp.InternalLog.log('checkConnection','Connection type: ' + states[networkState]);
    bCon = (networkState != Connection.NONE);
    return bCon;
     */

     if (!navigator.connection || !navigator.connection.type){
        if (miapp.BrowserCapabilities && miapp.BrowserCapabilities.online) {
            bCon = true;
        }
        else if (!miapp.BrowserCapabilities) {
            bCon = navigator.onLine;
        }
        miapp.InternalLog.log('checkConnection','without Cordova but online ? '+bCon);
    }
    else {

        var networkState = navigator.connection.type;
        var states = {};
        states[Connection.UNKNOWN]  = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI]     = 'WiFi connection';
        states[Connection.CELL_2G]  = 'Cell 2G connection';
        states[Connection.CELL_3G]  = 'Cell 3G connection';
        states[Connection.CELL_4G]  = 'Cell 4G connection';
        states[Connection.CELL]     = 'Cell generic connection';
        states[Connection.NONE]     = 'No network connection';
        miapp.InternalLog.log('checkConnection','Cordova Connection type: ' + states[networkState]);
        bCon = (networkState != Connection.NONE);
    }
    return bCon;
}



function getUrlVars(ihref)
{
	var href = ihref;
	if(miapp.isUndefined(href) || !href) href = window.location.href;

    miapp.InternalLog.log('getUrlVars','href:'+href);

    var vars = [], hash;
    var hashes = href.slice(href.indexOf('#') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function SHA256(s){

    if (s.length === 0) return '';
	var chrsz   = 8;
	var hexcase = 0;

	function safe_add (x, y) {
		var lsw = (x & 0xFFFF) + (y & 0xFFFF);
		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xFFFF);
	}

	function S (X, n) { return ( X >>> n ) | (X << (32 - n)); }
	function R (X, n) { return ( X >>> n ); }
	function Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }
	function Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }
	function Sigma0256(x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)); }
	function Sigma1256(x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)); }
	function Gamma0256(x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)); }
	function Gamma1256(x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)); }

	function core_sha256 (m, l) {
		var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);
		var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
		var W = new Array(64);
		var a, b, c, d, e, f, g, h, i, j;
		var T1, T2;

		m[l >> 5] |= 0x80 << (24 - l % 32);
		m[((l + 64 >> 9) << 4) + 15] = l;

		for ( i = 0; i<m.length; i+=16 ) {
			a = HASH[0];
			b = HASH[1];
			c = HASH[2];
			d = HASH[3];
			e = HASH[4];
			f = HASH[5];
			g = HASH[6];
			h = HASH[7];

			for ( j = 0; j<64; j++) {
				if (j < 16) W[j] = m[j + i];
				else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);

				T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
				T2 = safe_add(Sigma0256(a), Maj(a, b, c));

				h = g;
				g = f;
				f = e;
				e = safe_add(d, T1);
				d = c;
				c = b;
				b = a;
				a = safe_add(T1, T2);
			}

			HASH[0] = safe_add(a, HASH[0]);
			HASH[1] = safe_add(b, HASH[1]);
			HASH[2] = safe_add(c, HASH[2]);
			HASH[3] = safe_add(d, HASH[3]);
			HASH[4] = safe_add(e, HASH[4]);
			HASH[5] = safe_add(f, HASH[5]);
			HASH[6] = safe_add(g, HASH[6]);
			HASH[7] = safe_add(h, HASH[7]);
		}
		return HASH;
	}

	function str2binb (str) {
		var bin = Array();
		var mask = (1 << chrsz) - 1;
		for(var i = 0; i < str.length * chrsz; i += chrsz) {
			bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i%32);
		}
		return bin;
	}

	function Utf8Encode(string) {
		if (string.length === 0) return string;


		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	}

	function binb2hex (binarray) {
		var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
		var str = "";
		for(var i = 0; i < binarray.length * 4; i++) {
			str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
			hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
		}
		return str;
	}

	s = Utf8Encode(s);
	return binb2hex(core_sha256(str2binb(s), s.length * chrsz));

}

var miappTranslateDatesToPxSize = function(date_start, date_end, totalSize) {
    var date1 = date_start;
    if (typeof date1 == 'string') date1 = miappDateParse(date_start);
    if (!date1) return totalSize;// date_start is invalid

    var date2 = date_end;
    if (typeof date2 == 'string') date2 = miappDateParse(date_end);
    if (!date2) return totalSize;// date_end is invalid

    var milliseconds = date2.getTime() - date1.getTime();
    if (milliseconds < 0) return totalSize; // date_end is before date_start

    var days = milliseconds / 1000 / 86400;
    // TODO : Calendar does not yet support events over many days => limit duration to 1 day.
    if (days > 1) days = 1;

    return Math.round(days * totalSize);
};

var miappTranslateDateToPx = function(date, totalSize) {
    var date1 = date;
    if (typeof date1 == 'string') date1 = miappDateParse(date);
    if (!date1) return 0;// date is invalid

    var days = (date1.getHours()*60 + date1.getMinutes()) / 1440;

    return Math.round(days * totalSize);
};

// Higher-order functions (functions that operate on functions)

/**
 * Create a new function that passes its arguments to f and returns the logical negation of f's return value.
 *
 * @param f
 * @returns {Function}
 */
miapp.not = function(f) {
    return function () {
        var result = f.apply(this, arguments);
        return !result;
    };
};

/**
 * Create a new function that expects an array argument and applies f to each element,
 * returning the array of return values.
 *
 * @param f
 * @returns {Function}
 */
// Contrast this with the map() function from earlier.
miapp.mapper = function(f) {
    return function(a) {
        return map(a, f);
    };
};

/**
 * Create a new function which cache its results based on its arguments string representations
 *
 * @param f idempotent function keyed on its arguments string representations
 * @returns {Function}
 */
miapp.memoize = function(f) {
    var cache = {}; // Value cache stored in the closure.
    return function () {
        // Create a string version of the arguments to use as a cache key.
        var key = arguments.length + Array.prototype.join.call(arguments, ",");
        if (key in cache) return cache.key;
        else {
          cache.key = f.apply(this, arguments);
          return cache.key;
        }
    };
};

/*
// Note that when we write a recursive function that we will be memoizing,
// we typically want to recurse to the memoized version, not the original.
var factorial = miapp.memoize(function(n) {
    return (n <= 1) ? 1 : n * factorial(n-1);
});
factorial(5) // => 120. Also caches values for 4, 3, 2 and 1.
 */

// Helper functions

/**
 * Copy the enumerable properties of p to o, and return o.
 * If o and p have a property by the same name, o's property is overwritten.
 * This function does not handle getters and setters or copy attributes.
 * Return o.
 *
 * @param o
 * @param p
 * @returns {*}
 */
miapp.extend = function(o, p) {
    for (var prop in p) { // For all props in p.
        o[prop] = p[prop]; // Add the property to o.
    }
    return o;
};

/**
 * Copy the enumerable properties of p to o, and return o.
 * If o and p have a property by the same name, o's property is left alone.
 * This function does not handle getters and setters or copy attributes.
 * Return o.
 *
 * @param o
 * @param p
 * @returns {*}
 */
miapp.merge = function(o, p) {
    for (var prop in p) { // For all props in p.
        if (o.hasOwnProperty(prop)) continue; // Except those already in o.
        o[prop] = p[prop]; // Add the property to o.
    }
    return o;
};

/**
 * Remove properties from o if there is not a property with the same name in p.
 * Return o.
 *
 * @param o
 * @param p
 * @returns {*}
 */
miapp.restrict = function(o, p) {
    for (var prop in o) { // For all props in o
        if (!(prop in p)) delete o[prop]; // Delete if not in p
    }
    return o;
};

/**
 * For each property of p, delete the property with the same name from o.
 * Return o.
 *
 * @param o
 * @param p
 * @returns {*}
 */
miapp.subtract = function(o, p) {
    for (var prop in p) { // For all props in p
        delete o[prop]; // Delete from o (deleting a nonexistent prop is harmless)
    }
    return o;
};

/**
 * Return a new object that holds the properties of both o and p.
 * If o and p have properties by the same name, the values from o are used.
 * Return new object.
 *
 * @param o
 * @param p
 * @returns {*}
 */
miapp.union = function(o, p) {
    return miapp.extend(miapp.extend({}, o), p);
};

/**
 * Return a new object that holds only the properties of o that also appear in p.
 * This is something like the intersection of o and p, but the values of the properties in p are discarded.
 *
 * @param o
 * @param p
 * @returns {*}
 */
miapp.intersection = function(o, p) {
    return miapp.restrict(miapp.extend({}, o), p);
};

/**
 * Return an array that holds the names of the enumerable own properties of o.
 *
 * @param o
 * @returns {Array}
 */
miapp.keys = function(o) {
    if (typeof o !== "object") throw new TypeError();
    var result = [];
    for (var prop in o) {
        if (o.hasOwnProperty(prop)) {
            result.push(prop);
        }
    }
    return result;
};

/**
 * Create a new object that inherits properties from the prototype object p.
 * It uses the ECMAScript 5 function Object.create() if it is defined,
 * and otherwise falls back to an older technique.
 *
 * @param proto
 * @param props
 * @returns {*}
 */
miapp.create = function(proto, props) {
    if (proto === null) throw new TypeError();
    if (Object.create) {
        return Object.create(proto, props);
    }
    var t = typeof proto;
    if (t !== "object" && t !== "function") throw new TypeError();
    function F() {} // dummy constructor function.
    F.prototype = proto;
    var o = new F();
    return miapp.extend(o, props);
};

/**
 * Determine if a number is even
 *
 * @param x
 * @returns {boolean}
 */
miapp.even = function(x) {
    return x % 2 === 0;
};

/**
 * Determine if a number is odd
 *
 * @param x
 * @returns {boolean}
 */
miapp.odd = miapp.not(miapp.even);

/**
 * Loop via Array.forEach method.
 * If the function passed to foreach() throws miapp.foreach.break, the loop will terminate early.
 *
 * @param a array object
 * @param f callback function as first argument in Array.forEach()
 * @param t thisObject as second argument in Array.forEach()
 * @returns {boolean}
 */
miapp.foreach = function(a, f, t) {
    try {
        a.forEach(f, t);
    } catch (e) {
        if (e === miapp.foreach.break) return;
        throw e;
    }
};
miapp.foreach.break = new Error("StopIteration");



/**
* @fileOverview Analytics functions
*
**/





//Namespace miapp
var miapp;
if (!miapp) miapp = {};

function successHandler(data) {
    miapp.InternalLog.log('Analytics', "initialization success : "+data);
}
function errorHandler(data) {
    miapp.InternalLog.log('Analytics', "initialization pb : "+data);
}


miapp.Analytics = (function() {
    'use strict';

    var mAnalyticsLS = 'miapp.Analytics';
    var mAnalyticsFunctionnalitiesLS = 'miapp.Analytics.functionalities';


	function Analytics(localStorage, googleAnalytics_UA_ID) {

        this.localStorage = null;
        if (miapp.isDefined(localStorage) && localStorage)
          this.localStorage = localStorage;

        this.mAnalyticsArray = [];
        this.mAnalyticsFunctionnalitiesArray = [];
        if (this.localStorage) {
            this.mAnalyticsArray = this.localStorage.get(mAnalyticsLS, this.mAnalyticsArray);
            this.mAnalyticsFunctionnalitiesArray = this.localStorage.get(mAnalyticsFunctionnalitiesLS, this.mAnalyticsFunctionnalitiesArray);
        }
        //this.uuid = '';
        //this.isDemo = false;
        //this.env = 'P';
        this.vid = 'vid_undefined';
        this.uid = 'uid_undefined';
        this.initDone = false;
        this.bEnabled = true;
        this.googleAnalytics_UA_ID = googleAnalytics_UA_ID; // GA UA-XXXXXXXX-X
        this.gaQueue = null;// GA official queue
        this.gaPanalytics = null; // used ? todelete ?
        this.gaPlugin = null; // GAPlugin queue
	}

    // Public API
    Analytics.prototype.init = function() {
        if (this.initDone) return;

        // GA Official queue
        if(typeof _gaq !== 'undefined') {
          miapp.InternalLog.log('Analytics', 'googleAnalytics official launched.');
          this.gaQueue = _gaq || [];
          this.gaQueue.push(['_setAccount', this.googleAnalytics_UA_ID]);
          this.gaQueue.push(['_trackPageview']);
        }
        else {miapp.InternalLog.log('Analytics', 'googleAnalytics not defined.');}

        // Plugin ? used ?
        /*if(typeof analytics !== 'undefined') {
            console.log('srvAnalytics', "GA analytics? launched.");
            this.gaPanalytics = analytics;
            analytics.startTrackerWithId(this.googleAnalytics_UA_ID);
        }*/

        // GAPlugin
        if (typeof window.plugins !== 'undefined') {
            if(typeof window.plugins.gaPlugin !== 'undefined') {
                miapp.InternalLog.log('Analytics', "GAPlugin launched.");
                this.gaPlugin = window.plugins.gaPlugin;
                this.gaPlugin.init(successHandler, errorHandler, this.googleAnalytics_UA_ID, 10);
            }
        }

        this.initDone = true;
    };

    /*Analytics.prototype.setDemo = function(isDemo) {
        this.isDemo = isDemo;
    };*/

    Analytics.prototype.setVid = function(vid) {
        this.vid = vid;
        miapp.InternalLog.log('Analytics', 'set vid ' + this.vid);
    };
    Analytics.prototype.setUid = function(uid) {
        miapp.InternalLog.log('Analytics', 'set uid ' + uid);
        if (!uid || uid === '') return;
        this.uid = uid;
    };
    Analytics.prototype.setEnabled = function(enable) {
        this.bEnabled = (enable === true);
        miapp.InternalLog.log('Analytics', 'set enabled ' + this.bEnabled);
    };


    // 1)  category - This is the type of event you are sending :
    //          this.vid(14XXX - VERSION) + category(Once, Uses, Interest)
    // 2)  eventAction - This is the type of event you are sending :
    //          category(Once, Uses, Interest) + action(Login, Contact Creation, Meeting Show ...)
    // 3)  eventLabel - A label that describes the event :
    //          this.uid(user email)
    // 4)  eventValue - An application defined integer value :
    //          value(1 .. N)
    //
    //
    // 1)  category - This is the type of event you are sending :
    //          this.vid(14XXX - VERSION) + category(Once, Uses, Interest)

    Analytics.prototype.add = function(category, action, value) {

        if (!this.bEnabled || !category || !action) return;

        //Check <action> functionnalities if Once.
        var shouldBeTrackedAsEvent = true;
        if (category == 'Once') {
            for (var i = 0; i < this.mAnalyticsFunctionnalitiesArray.length && shouldBeTrackedAsEvent; i++) {
                if (this.mAnalyticsFunctionnalitiesArray[i] === action) {
                    shouldBeTrackedAsEvent = false;
                }
            }
            if (shouldBeTrackedAsEvent) this.mAnalyticsFunctionnalitiesArray.push(action);
        }
        miapp.InternalLog.log('Analytics', 'shouldBeTrackedAsEvent ?' + shouldBeTrackedAsEvent);

        //Store event & view
        var paramEvent = {
            vid : this.vid,
            uid : this.uid,
            type : 'event',
            category: category,
            action : action,
            value : value || 1
        };
        var paramView = {
            vid : this.vid,
            uid : this.uid,
            type : 'view',
            category: category,
            action : action,
            value : value || 1
        };

        // Push arr into message queue to be stored in local storage
        miapp.InternalLog.log('Analytics', 'add ' + paramEvent.toString());
        if (shouldBeTrackedAsEvent) this.mAnalyticsArray.push(paramEvent);
        this.mAnalyticsArray.push(paramView);
        if (this.localStorage) this.localStorage.set(mAnalyticsLS, this.mAnalyticsArray);
        if (this.localStorage) this.localStorage.set(mAnalyticsFunctionnalitiesLS, this.mAnalyticsFunctionnalitiesArray);

        // online, we launch events
        if (checkConnection()) this.run();
	};

	Analytics.prototype.run = function() {

      if (!this.bEnabled) return;
      miapp.InternalLog.log('Analytics', 'run - pushing ' + this.mAnalyticsArray.length + ' elements');
      //if (this.uuid == '') {
      //    this.uuid = (window.device) ? window.device.uuid : window.location.hostname;
      //}
      var bOK = true;

      try {
            for(var i=0; i<this.mAnalyticsArray.length; i++) {
                    var param = this.mAnalyticsArray[i];
                    if(param.type == 'view') {
                        // this.vid(14XXX - VERSION) + category(Once, Uses, Interest) + action(Login, Contact Creation, Meeting Show ...)
                        var url = '' + this.vid + ' - ' + param.category + ' - ' + param.action;
                        miapp.InternalLog.log('Analytics', 'track view ' + url);
                        if (this.gaQueue) this.gaQueue.push(['_trackPageview', url]);
                        if (this.gaPanalytics) this.gaPanalytics.trackView(url);
                        if (this.gaPlugin) this.gaPlugin.trackPage( successHandler, errorHandler, url);
                    } else  // if(param.type == 'event')
                    {
                        // cat : this.vid(14XXX - VERSION) + category(Once, Uses, Interest)
                        // act : category(Once, Uses, Interest) + action(Login, Contact Creation, Meeting Show ...)
                        var cat = this.vid +' - '+ param.category;
                        var act = param.category +' - '+ param.action;
                        var lab = param.uid;
                        var val = param.value;
                        miapp.InternalLog.log('Analytics', 'track event ' + cat + ', ' + act + ', ' + lab + ', ' + val);
                        if (this.gaQueue) this.gaQueue.push(['_trackEvent', cat, act, lab, val]);
                        //this.gaPanalytics.trackEvent(param.category, param.action, param.mode);
                        if (this.gaPanalytics) this.gaPanalytics.trackEvent(cat, act, lab, val);
                        if (this.gaPlugin) this.gaPlugin.trackEvent(successHandler, errorHandler, cat, act, lab, val);
                    }
            }
        }
        catch(e) {
              miapp.ErrorLog.log('Analytics', ' run pb : ' + miapp.formatError(e));
              bOK = false;
        }

        if (bOK) {
          this.mAnalyticsArray = [];
          if (this.localStorage) {
                    this.localStorage.set(mAnalyticsLS, this.mAnalyticsArray);
                }
        }

	};

    return Analytics;
})();



// Namespace miapp
var miapp;
if (!miapp) miapp = {};

miapp.Base64 = (function () {
'use strict';

    var Base64 = {};

    // Public API

    /**
     * Encodes string to Base64 string
     */
    Base64.encode = function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        //input = utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                keyStr.charAt(enc3) + keyStr.charAt(enc4);

        }

        return output;
    };

    Base64.encodeFromUint8Array = function (input) {
        var nMod3, sB64Enc = "";
        for (var nLen = input.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
            nMod3 = nIdx % 3;
            if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) {
                sB64Enc += "\r\n";
            }
            nUint24 |= input[nIdx] << (16 >>> nMod3 & 24);
            if (nMod3 === 2 || input.length - nIdx === 1) {
                sB64Enc += String.fromCharCode(uint6ToB64(nUint24 >>> 18 & 63),
                    uint6ToB64(nUint24 >>> 12 & 63),
                    uint6ToB64(nUint24 >>> 6 & 63),
                    uint6ToB64(nUint24 & 63));
                nUint24 = 0;
            }
        }
        return sB64Enc.replace(/A(?=A$|$)/g, "=");
    };

    /**
     * Decodes string from Base64 string
     */
    Base64.decode = function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = keyStr.indexOf(input.charAt(i++));
            enc2 = keyStr.indexOf(input.charAt(i++));
            enc3 = keyStr.indexOf(input.charAt(i++));
            enc4 = keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        //output = utf8_decode(output);

        return output;
    };

    Base64.decodeToUint8Array = function (input) {
        var nBlocksSize = 1;// for ASCII, binary strings or UTF-8-encoded strings
        //var nBlocksSize = 2;// for UTF-16 strings
        //var nBlocksSize = 4;// for UTF-32 strings
        var sB64Enc = input.replace(/[^A-Za-z0-9\+\/]/g, ""),
            nInLen = sB64Enc.length,
            nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2,
            taBytes = new Uint8Array(nOutLen);
        for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
            nMod4 = nInIdx & 3;
            nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
            if (nMod4 === 3 || nInLen - nInIdx === 1) {
                for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
                    taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
                }
                nUint24 = 0;
            }
        }
        return taBytes;
    };

    // Private API
    // helper functions and variables hidden within this function scope

    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    function uint6ToB64(nUint6) {
        return nUint6 < 26 ?
            nUint6 + 65
            : nUint6 < 52 ?
            nUint6 + 71
            : nUint6 < 62 ?
            nUint6 - 4
            : nUint6 === 62 ?
            43
            : nUint6 === 63 ?
            47
            :
            65;
    }

    function b64ToUint6(nChr) {
        return nChr > 64 && nChr < 91 ?
            nChr - 65
            : nChr > 96 && nChr < 123 ?
            nChr - 71
            : nChr > 47 && nChr < 58 ?
            nChr + 4
            : nChr === 43 ?
            62
            : nChr === 47 ?
            63
            :
            0;
    }

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return Base64;
})(); // Invoke the function immediately to create this class.

'use strict';

// Namespace miapp
var miapp;
if (!miapp) miapp = {};

/**
 * Management of browser capabilities
 */
miapp.BrowserCapabilities = (function (navigator, window, document) {
    var capacities = {vendor: '', cssVendor: ''};

    function prefixStyle(style) {
        if (capacities.vendor === '') return style;
        style = style.charAt(0).toUpperCase() + style.substr(1);
        return capacities.vendor + style;
    }

    var dummyStyle = document.createElement('div').style;
    var vendors = 't,webkitT,MozT,msT,OT'.split(',');
    var nbVendors = vendors.length;
    for (var i = 0; i < nbVendors; i++) {
        var t = vendors[i] + 'ransform';
        if (t in dummyStyle) {
            capacities.vendor = vendors[i].substr(0, vendors[i].length - 1);
            capacities.cssVendor = '-' + capacities.vendor.toLowerCase() + '-';
            break;
        }
    }

    capacities.transform = prefixStyle('transform');
    capacities.transitionProperty = prefixStyle('transitionProperty');
    capacities.transitionDuration = prefixStyle('transitionDuration');
    capacities.transformOrigin = prefixStyle('transformOrigin');
    capacities.transitionTimingFunction = prefixStyle('transitionTimingFunction');
    capacities.transitionDelay = prefixStyle('transitionDelay');

    capacities.isAndroid = (/android/gi).test(navigator.appVersion);
    capacities.isIDevice = (/iphone|ipad/gi).test(navigator.appVersion);
    capacities.isTouchPad = (/hp-tablet/gi).test(navigator.appVersion);
    capacities.isPhantom = (/phantom/gi).test(navigator.userAgent);
    //capacities.hasTouch = (('ontouchstart' in window) || ('createTouch' in document)) && !capacities.isTouchPad && !capacities.isPhantom;
    capacities.hasTouch = (('ontouchstart' in window) || ('createTouch' in document)) && (capacities.isAndroid || capacities.isIDevice) && !capacities.isPhantom;
    capacities.has3d = prefixStyle('perspective') in dummyStyle;
    capacities.hasTransform = (capacities.vendor != '');
    capacities.hasTransitionEnd = prefixStyle('transition') in dummyStyle;

    capacities.online = navigator.onLine;

    capacities.RESIZE_EVENT = 'onorientationchange' in window ? 'orientationchange' : 'resize';
    capacities.TRNEND_EVENT = (function () {
        if (capacities.vendor == '') return false;
        var transitionEnd = {
            '': 'transitionend',
            'webkit': 'webkitTransitionEnd',
            'Moz': 'transitionend',
            'O': 'otransitionend',
            'ms': 'MSTransitionEnd'
        };
        return transitionEnd[capacities.vendor];
    })();
    if (window.requestAnimationFrame) {
        //capacities.nextFrame.call(window, callback);
        capacities.nextFrame = function (callback) {
            return window.requestAnimationFrame(callback);
        };
    } else if (window.webkitRequestAnimationFrame) {
        capacities.nextFrame = function (callback) {
            return window.webkitRequestAnimationFrame(callback);
        };
    } else if (window.mozRequestAnimationFrame) {
        capacities.nextFrame = function (callback) {
            return window.mozRequestAnimationFrame(callback);
        };
    } else if (window.oRequestAnimationFrame) {
        capacities.nextFrame = function (callback) {
            return window.oRequestAnimationFrame(callback);
        };
    } else if (window.msRequestAnimationFrame) {
        capacities.nextFrame = function (callback) {
            return window.msRequestAnimationFrame(callback);
        };
    } else {
        capacities.nextFrame = function (callback) {
            return setTimeout(callback, 1);
        };
    }
    if (window.cancelRequestAnimationFrame) {
        //capacities.cancelFrame.call(window, handle);
        capacities.cancelFrame = function (handle) {
            return window.cancelRequestAnimationFrame(handle);
        };
    } else if (window.webkitCancelAnimationFrame) {
        capacities.cancelFrame = function (handle) {
            return window.webkitCancelAnimationFrame(handle);
        };
    } else if (window.webkitCancelRequestAnimationFrame) {
        capacities.cancelFrame = function (handle) {
            return window.webkitCancelRequestAnimationFrame(handle);
        };
    } else if (window.mozCancelRequestAnimationFrame) {
        capacities.cancelFrame = function (handle) {
            return window.mozCancelRequestAnimationFrame(handle);
        };
    } else if (window.oCancelRequestAnimationFrame) {
        capacities.cancelFrame = function (handle) {
            return window.oCancelRequestAnimationFrame(handle);
        };
    } else if (window.msCancelRequestAnimationFrame) {
        capacities.cancelFrame = function (handle) {
            return window.msCancelRequestAnimationFrame(handle);
        };
    } else {
        capacities.cancelFrame = function (handle) {
            return clearTimeout(handle);
        };
    }
    // FIX ANDROID BUG : translate3d and scale doesn't work together => deactivate translate3d (in case user uses scale) !
    capacities.translateZ = (capacities.has3d && !capacities.isAndroid) ? ' translateZ(0)' : '';

    dummyStyle = null;

    return capacities;
})(navigator, window, document);


// Namespace miapp
var miapp;
if (!miapp) miapp = {};

miapp.Json = (function($)
{
    'use strict';

    if(!(Object.toJSON || window.JSON)){
        throw new Error("Object.toJSON or window.JSON needs to be loaded before miapp.Json!");
    }

    // Constructor
    function Json()
    {
        this.version = "0.1";
    }

    // Public API

    /**
     * Encodes object to JSON string
     *
     * Do not use $.param() which causes havoc in ANGULAR.
     * See http://victorblog.com/2012/12/20/make-angularjs-http-service-behave-like-jquery-ajax/
     */
    Json.uriEncode = function(obj) {
        var query = '';
        var name, value, fullSubName, subName, subValue, innerObj, i;

        for (name in obj) {
            if (!obj.hasOwnProperty(name)) continue;
            value = obj[name];
            if (value instanceof Array) {
                for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += Json.uriEncode(innerObj) + '&';
                }
            } else if (value instanceof Object) {
                for (subName in value) {
                    if (!value.hasOwnProperty(subName)) continue;
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += Json.uriEncode(innerObj) + '&';
                }
            } else if (value !== undefined && value !== null) {
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
            }
        }
        return query.length ? query.substr(0, query.length - 1) : query;
    };

    /**
     * Encodes object to JSON string
     */
    Json.object2String = Object.toJSON || (window.JSON && (JSON.encode || JSON.stringify));

    /**
     * Decodes object from JSON string
     */
    Json.string2Object = (window.JSON && (JSON.decode || JSON.parse)) || function (str) {
        return String(str).evalJSON();
    };

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return Json;
})(window.$ || window.jQuery); // Invoke the function immediately to create this class.

'use strict';

// Namespace miapp
var miapp;
if (!miapp) miapp = {};

function miappDumpData(input, maxDepth) {
    var str = "";
    if (typeof input === "object") {
        if (input instanceof Array) {
            if (maxDepth > 0) {
                str += "[\n";
                str += miappDumpArray("  ", input, maxDepth-1);
                str += "]\n";
            } else {
                str += "[Array]\n";
            }
        } else {
            if (maxDepth > 0) {
                str += "{\n";
                str += miappDumpObject("  ", input, maxDepth-1);
                str += "}\n";
            } else {
                str += "[" + typeof(input) + "]\n";
            }
        }
    } else {
        str += input + "\n";
    }
    return str;
}

function miappDumpArray(offset, input, maxDepth) {
    var str = "";
    for (var key = 0,nb = input.length; key<nb; key++) {
        if (typeof input[key] === "object") {
            if (input[key] instanceof Array) {
                if (maxDepth > 0) {
                    str += offset + key + " : [\n";
                    str += miappDumpArray(offset + "  ", input[key], maxDepth-1);
                    str += offset + "]\n";
                } else {
                    str += offset + key + " : [Array]\n";
                }
            } else {
                if (maxDepth > 0) {
                    str += offset + key + " : {\n";
                    str += miappDumpObject(offset + "  ", input[key], maxDepth-1);
                    str += offset + "}\n";
                } else {
                    str += offset + key + " : [" + typeof(input[key]) + "]\n";
                }
            }
        } else {
            str += offset + key + " : " + input[key] + "\n";
        }
    }
    return str;
}

function miappDumpObject(offset, input, maxDepth) {
    var str = "", key;
    for (key in input) {
        if (!input.hasOwnProperty(key)) continue;
        if (typeof input[key] === "object") {
            if (input[key] instanceof Array) {
                if (maxDepth > 0) {
                    str += offset + key + " : [\n";
                    str += miappDumpArray(offset + "  ", input[key], maxDepth-1);
                    str += offset + "]\n";
                } else {
                    str += offset + key + " : [Array]\n";
                }
            } else {
                if (maxDepth > 0) {
                    str += offset + key + " : {\n";
                    str += miappDumpObject(offset + "  ", input[key], maxDepth-1);
                    str += offset + "}\n";
                } else {
                    str += offset + key + " : [" + typeof(input[key]) + "]\n";
                }
            }
        } else {
            str += offset + key + " : " + input[key] + "\n";
        }
    }
    return str;
}

/**
 * Return a string format "yyyy-MM-dd HH:mm:ss" from a Number which is the result of any Date.getTime (timestamp in ms).
 * @param {Number} timestamp in ms since 1/1/1970
 * @returns {string} result
 */
function miappTimestampFormat(timestamp) {
    var date = new Date(timestamp);
    return miappPadNumber(date.getFullYear(), 4) + '-' +
        miappPadNumber(date.getMonth() + 1, 2) + '-' +
        miappPadNumber(date.getDate(), 2) + ' ' +
        miappPadNumber(date.getHours(), 2) + ':' +
        miappPadNumber(date.getMinutes(), 2) + ':' +
        miappPadNumber(date.getSeconds(), 2);
}

/**
 * Return a string format "yyyy-MM-dd HH:mm:ss" from a Date object.
 * @param {Date} date to format
 * @returns {string} result
 */
function miappDateFormat(date) {
    if (!date) return '';
    return miappPadNumber(date.getFullYear(), 4) + '-' +
        miappPadNumber(date.getMonth() + 1, 2) + '-' +
        miappPadNumber(date.getDate(), 2) + ' ' +
        miappPadNumber(date.getHours(), 2) + ':' +
        miappPadNumber(date.getMinutes(), 2) + ':' +
        miappPadNumber(date.getSeconds(), 2);
}

/**
 * Return a string format "yyMMdd_HHmmss" from a Date object.
 * @param {Date} date to format
 * @returns {string} result
 */
function miappDateCompactFormat(date) {
    if (!date) return '';
    return miappPadNumber(date.getFullYear(), 2) +
        miappPadNumber(date.getMonth() + 1, 2) +
        miappPadNumber(date.getDate(), 2) + '_' +
        miappPadNumber(date.getHours(), 2) +
        miappPadNumber(date.getMinutes(), 2) +
        miappPadNumber(date.getSeconds(), 2);
}

/**
 * Parse a date string to create a Date object
 * @param {string} date string at format "yyyy-MM-dd HH:mm:ss"
 * @returns {Number} Number resulting from Date.getTime or 0 if invalid date
 */
function miappTimestampParse(date) {
    var newDate = miappDateParse(date);
    return (newDate !== false) ? newDate.getTime() : 0;
}

/**
 * Parse a date string to create a Date object
 * @param {string} date string at format "yyyy-MM-dd HH:mm:ss"
 * @returns {Date} Date object or false if invalid date
 */
function miappDateParse(date) {
    if (!date || typeof date != 'string' || date == '') return false;
    // Date (choose 0 in date to force an error if parseInt fails)
    var yearS = parseInt(date.substr(0,4), 10) || 0;
    var monthS = parseInt(date.substr(5,2), 10) || 0;
    var dayS = parseInt(date.substr(8,2), 10) || 0;
    var hourS = parseInt(date.substr(11,2), 10) || 0;
    var minuteS = parseInt(date.substr(14,2),10) || 0;
    var secS = parseInt(date.substr(17,2),10) || 0;
    /*
    BEWARE : here are the ONLY formats supported by all browsers in creating a Date object
    var d = new Date(2011, 01, 07); // yyyy, mm-1, dd
    var d = new Date(2011, 01, 07, 11, 05, 00); // yyyy, mm-1, dd, hh, mm, ss
    var d = new Date("02/07/2011"); // "mm/dd/yyyy"
    var d = new Date("02/07/2011 11:05:00"); // "mm/dd/yyyy hh:mm:ss"
    var d = new Date(1297076700000); // milliseconds
    var d = new Date("Mon Feb 07 2011 11:05:00 GMT"); // ""Day Mon dd yyyy hh:mm:ss GMT/UTC
     */

    var newDate = new Date(yearS, monthS-1, dayS, hourS, minuteS, secS, 0);
    if ((newDate.getFullYear() !== yearS) || (newDate.getMonth() !== (monthS-1)) || (newDate.getDate() !== dayS)) {
        // Invalid date
        return false;
    }
    return newDate;
}

// @input date or string
// @return String formatted as date
function miappDateFormatObject(object) {

    var yearS = '1970';
    var monthS = '01';
    var dayS = '01';
    var hourS = "00";
    var minuteS = "00";
    var secondS = "00";
   
    if ( Object.prototype.toString.call(object) === "[object Date]" ) {
      // it is a date
      if ( isNaN(object.getTime() ) ) {  // d.valueOf() could also work
        // date is not valid
      }
      else {
        // date is valid
        yearS = ''+object.getFullYear();
        monthS = ''+(object.getMonth()+1);
        dayS = ''+object.getDate();
        hourS = ''+object.getHours();
        minuteS = ''+object.getMinutes();
        secondS = ''+object.getSeconds();
      }
    }
    else if (typeof object == "string") {
        // string
        var dateReg = new RegExp("([0-9][0-9][0-9][0-9])-([0-9]\\d)-([0-9]\\d)+", "g");
        var dateParts = object.split(dateReg);
        yearS = dateParts[1] || '0';
        monthS = dateParts[2] || '0';
        dayS = dateParts[3] || '0';

        var timeReg = new RegExp("([01]\\d|2[0-9]):([0-5]\\d):([0-5]\\d)");
        var timeParts = object.match(timeReg);
        if (timeParts != null) {
            hourS = timeParts[1] || '00';
            minuteS = timeParts[2] || '00';
            secondS = timeParts[3] || '00';
        } else {
            hourS = '00';
            minuteS = '00';
            secondS = '00';
        }
    }
    // 4-2-2 2:2  
    while (yearS.length < 4) yearS = '0' + yearS;
    while (monthS.length < 2) monthS = '0' + monthS;
    while (dayS.length < 2) dayS = '0' + dayS;
    while (hourS.length < 2) hourS = '0' + hourS;
    while (minuteS.length < 2) minuteS = '0' + minuteS;
    while (secondS.length < 2) secondS = '0' + secondS;

    var newDate = yearS + '-' + monthS + '-' + dayS + ' ' + hourS + ':' + minuteS + ':'+secondS;
    return newDate;
}


function miappDateExtractDate(dateString) {

    var dateReg = new RegExp("([0-9][0-9][0-9][0-9])-([0-9]\\d)-([0-9]\\d)+", "g");
    var dateParts = dateString.split(dateReg);
    var yearS = dateParts[1] || '0';
    var monthS = dateParts[2] || '0';
    var dayS = dateParts[3] || '0';
    while (yearS.length < 4) yearS = '0' + yearS;
    while (monthS.length < 2) monthS = '0' + monthS;
    while (dayS.length < 2) dayS = '0' + dayS;
    return ''+ yearS + '-' + monthS + '-' + dayS;
}

function miappDateExtractTime(dateString) {
    var timeReg = new RegExp("([01]\\d|2[0-9]):([0-5]\\d):([0-5]\\d)");
    var timeParts = dateString.match(timeReg);
    var hourS = "00";
    var minuteS = "00";
    var secondS = "00";
    if (timeParts != null) {
        hourS = timeParts[1] || '00';
        minuteS = timeParts[2] || '00';
        secondS = timeParts[3] || '00';
    } else {
        hourS = '00';
        minuteS = '00';
        secondS = '00';
    }
    while (hourS.length < 2) hourS = '0' + hourS;
    while (minuteS.length < 2) minuteS = '0' + minuteS;
    while (secondS.length < 2) secondS = '0' + secondS;

    return '' + hourS + ':' + minuteS + ':'+secondS;
}


function miappPadNumber(num, digits, trim) {
    var neg = '';
    if (num < 0) {
        neg = '-';
        num = -num;
    }
    num = '' + num;
    while (num.length < digits) {
        num = '0' + num;
    }
    if (trim && (num.length > digits)) {
        num = num.substr(num.length - digits);
    }
    return neg + num;
}

miapp.formatError = function(arg) {
    if (arg instanceof Error) {
        if (arg.stack) {
            arg = (arg.message && arg.stack.indexOf(arg.message) === -1)
                ? 'Error: ' + arg.message + '\n' + arg.stack
                : arg.stack;
        } else if (arg.sourceURL) {
            arg = arg.message + '\n' + arg.sourceURL + ':' + arg.line;
        }
    }
    return arg;
};

miapp.Log = (function () {

    function Log(nbMax) {
        this.nbMax = nbMax || 1000;
        if (this.nbMax < 1) this.nbMax = 1;
        this.logEntries = [];
        this.callbackHandle = 0;
        this.callbacks = [];
    }

    Log.prototype.getLog = function () {
        return this.logEntries;
    };

    Log.prototype.clearLog = function () {
        this.logEntries = [];
    };

    Log.prototype.setNbMax = function (nbMax) {
        this.nbMax = nbMax || 1000;
        if (this.nbMax < 1) this.nbMax = 1;
        if (this.logEntries.length > this.nbMax) {
            this.logEntries.splice(0, (this.logEntries.length - this.nbMax));
        }
    };

    Log.prototype.log = function (msg, details, traceStackOffset) {
    	
    	//REMOVE_IN_PROD return {'date':'','msg':msg,'details':details};
    	    	
        details = details || '';
        var now = new Date();
        now = miappDateFormat(now) + '.' + now.getMilliseconds();
        // TODO : get the file and line of caller
        //var nb = (new Error).lineNumber;
        var from = '';
       	var stack;
        /*
        try {
            throw Error('');
        } catch(e) {
            stack = e.stack;
        }
        */
        traceStackOffset = traceStackOffset || 0;
        stack = (new Error).stack;
       	if (stack) {
            var caller_stack = stack.split("\n");
            var caller_line = caller_stack[2+traceStackOffset];
       		if (caller_line) {
       			var index = caller_line.indexOf("at ") + 3;
                from = ' at ' + caller_line.substr(index);
       		}
       	}
        if (details) {
            //MLE //TODO prod ? var ? console.log(now + from + ' : ' + msg + " : " + details);
        } else {
            //MLE console.log(now + from + ' : ' + msg);
        }
        var logEntry = {
            'date':now,
            'msg':msg,
            'details':details
        };
        if (this.logEntries.length >= this.nbMax) {
            this.logEntries.splice(0, 1);
        }
        this.logEntries.push(logEntry);

        for (var idx = 0, nb = this.callbacks.length; idx < nb; idx++) {
            try {
                this.callbacks[idx].callback(this.callbacks[idx].id, logEntry);
            } catch (e) {
                console.log("Error on callback#" + idx
                    + " called from Log for the logEntry " + miappDumpData(logEntry, 1)
                    + " : " + miapp.formatError(e));
            }
        }
        return logEntry;
    };

    Log.prototype.addListener = function (fct) {
        this.callbackHandle++;
        this.callbacks.push({id:this.callbackHandle, callback:fct});
        return this.callbackHandle;
    };

    Log.prototype.cancelListener = function (callbackHandle) {
        for (var idx = this.callbacks.length - 1; idx >= 0; idx--) {
            if (this.callbacks[idx].id == callbackHandle) {
                this.callbacks.splice(idx, 1);
                return true;
            }
        }
        return false;
    };

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return Log;
})(); // Invoke the function immediately to create this class.

miapp.ErrorLog = new miapp.Log(1000);
miapp.InternalLog = new miapp.Log(1000);



// Namespace miapp
var miapp;
if (!miapp) miapp = {};

/**
 *
 *  Secure Hash Algorithm (SHA1)
 *  http://www.webtoolkit.info/
 *
 **/
miapp.Sha1 = (function () {
'use strict';

    var Sha1 = {};

    // Public API

    /**
     * Hash string
     */
    Sha1.hash = function (input) {
        var s = miapp.Utf8.encode(input);
        return binb2rstr(binb_sha1(rstr2binb(s), s.length * 8));
    };

    /**
     * Create a 256 bits key from a password
     */
    Sha1.key256 = function (password) {
        var nBytes = 256 / 8;  // no bytes in key
        var halfLen = password.length / 2;
        var hash1 = miapp.Sha1.hash(password.substr(0, halfLen));
        var hash2 = miapp.Sha1.hash(password.substr(halfLen));
        return hash1.substr(0, 16) + hash2.substr(0, nBytes - 16);  // expand key to 16/24/32 bytes long
    };

    /*
     * Convert a raw string to an array of big-endian words
     * Characters >255 have their high-byte silently ignored.
     */
    function rstr2binb(input) {
        var output = new Array(input.length >> 2);
        for (var i = 0; i < output.length; i++)
            output[i] = 0;
        for (var j = 0; j < input.length * 8; j += 8)
            output[j >> 5] |= (input.charCodeAt(j / 8) & 0xFF) << (24 - j % 32);
        return output;
    }

    /*
     * Convert an array of big-endian words to a string
     */
    function binb2rstr(input) {
        var output = "";
        for (var i = 0; i < input.length * 32; i += 8)
            output += String.fromCharCode((input[i >> 5] >>> (24 - i % 32)) & 0xFF);
        return output;
    }

    /*
     * Calculate the SHA-1 of an array of big-endian words, and a bit length
     */
    function binb_sha1(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << (24 - len % 32);
        x[((len + 64 >> 9) << 4) + 15] = len;

        var w = new Array(80);
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;
        var e = -1009589776;

        for (var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;
            var olde = e;

            for (var j = 0; j < 80; j++) {
                if (j < 16) w[j] = x[i + j];
                else w[j] = bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                var t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)),
                    safe_add(safe_add(e, w[j]), sha1_kt(j)));
                e = d;
                d = c;
                c = bit_rol(b, 30);
                b = a;
                a = t;
            }

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
            e = safe_add(e, olde);
        }
        return [a, b, c, d, e];

    }

    /*
     * Perform the appropriate triplet combination function for the current
     * iteration
     */
    function sha1_ft(t, b, c, d) {
        if (t < 20) return (b & c) | ((~b) & d);
        if (t < 40) return b ^ c ^ d;
        if (t < 60) return (b & c) | (b & d) | (c & d);
        return b ^ c ^ d;
    }

    /*
     * Determine the appropriate additive constant for the current iteration
     */
    function sha1_kt(t) {
        return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 :
            (t < 60) ? -1894007588 : -899497514;
    }

    /*
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
     * Bitwise rotate a 32-bit number to the left.
     */
    function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return Sha1;
})(); // Invoke the function immediately to create this class.



/*
Pour recopier un fichier externe au navigateur dans le localStorage ou le fileStorage, il faut passer par <input type="file"/>
Exemple :

<!--<input id="file" type="file" multiple />-->
<!-- multiple does not work on Android -->
<input id="file" type="file" />
<div id="prev"></div>

<script>
var fileInput = document.querySelector('#file');
var prev = document.querySelector('#prev');

fileInput.onchange = function() {

    var files = this.files;
    var filesLen = files.length;
    var allowedTypes = ['png', 'jpg', 'jpeg', 'gif']

    for (var i = 0 ; i < filesLen ; i++) {
        var reader = new FileReader();
        // Lecture du contenu de fichier
        reader.onload = function() {
            alert('Contenu du fichier "' + fileInput.files[i].name + '" :\n\n' + reader.result);
        };
        reader.readAsText(files[i]);

        // Previsualisation de fichier image
        var fileNames = files[i].name.split('.');
        var fileExt = fileNames[fileNames.length - 1];
        if (allowedTypes.indexOf(fileExt) != -1) {
            var reader = new FileReader();
            reader.onload = function() {
                var imgElement = document.createElement('img');
                imgElement.style.maxWidth = '150px';
                imgElement.style.maxHeight = '150px';
                imgElement.src = this.result;
                prev.appendChild(imgElement);
            };
            reader.readAsDataURL(files[i]);
        }
    }
};
</script>

 */

// Create a new module
/*angular.module("miapp", [
    "miapp.all",
    "miapp.file",
    "miapp.analytics",
    "miapp.storage",
    "miapp.stringFormat",
    "miapp.base64",
    "miapp.json",
    "miapp.xml",
    "miapp.fileDownloader",
    "miapp.fileUploader",
    "miapp.taskReceiver",
    "miapp.taskSender",
    "miapp.sense"
]);*/

// Create a new module
//var miappStorageModule = angular.module('miapp.storage', ['miapp.xml', 'miapp.json']);

/**
 * localStorage service provides an interface to manage in memory data repository.
 * @param {object} storageService The object window.localStorage or an equivalent object which implements it.
 */
/*miappStorageModule.factory('localStorage', ['miappXml', 'miappJson', function(miappXml, miappJson) {
    var LocalStorage = function(storageService) {
        storageService = storageService || window.localStorage;
    };
    return LocalStorage;
}]);*/

// Namespace miapp
var miapp;
if (!miapp) miapp = {};

/**
 * Memory storage (used mainly for tests).
 * Usage : miapp.LocalStorageFactory(new miapp.MemoryStorage());
 */
miapp.MemoryStorage = (function () {
"use strict";

    function Storage() {
        this.keyes = [];
        this.set = {};
        this.length = 0;
    }
    Storage.prototype.clear = function () {
        this.keyes = [];
        this.set = {};
        this.length = 0;
    };
    Storage.prototype.key = function (idx) {
        return this.keyes[idx];
    };
    Storage.prototype.getItem = function (key) {
        if (miapp.isUndefined(this.set[key])) return null;
        return this.set[key];
    };
    Storage.prototype.setItem = function (key, value) {
        this.set[key] = value;
        for (var i = 0; i < this.keyes.length; i++) {
            if (this.keyes[i] == key) return;
        }
        this.keyes.push(key);
        this.length = this.keyes.length;
    };
    Storage.prototype.removeItem = function (key) {
        delete this.set[key];
        for (var i = 0; i < this.keyes.length; i++) {
            if (this.keyes[i] == key) {
                this.keyes.splice(i, 1);
                this.length = this.keyes.length;
            }
        }
    };
    return Storage;
})();

/**
 * localStorage class factory
 * Usage : var LocalStorage = miapp.LocalStorageFactory(window.localStorage); // to create a new class
 * Usage : var localStorageService = new LocalStorage(); // to create a new instance
 */
miapp.LocalStorageFactory = function (storageService) {
"use strict";

    var storage = storageService || window.localStorage;
    if (!storage) {
        throw new Error("miapp.LocalStorageFactory needs a storageService!");
    }

    // Constructor
    function LocalStorage() {
        this.version = "0.1";
        if (!miapp.Xml) {
            throw new Error("miapp.Xml needs to be loaded before miapp.LocalStorage!");
        }
        if (!miapp.Json) {
            throw new Error("miapp.Json needs to be loaded before miapp.LocalStorage!");
        }
        if (!miapp.Xml.isXml || !miapp.Xml.xml2String || !miapp.Xml.string2Xml) {
            throw new Error("miapp.Xml with isXml(), xml2String() and string2Xml() needs to be loaded before miapp.LocalStorage!");
        }
        if (!miapp.Json.object2String || !miapp.Json.string2Object) {
            throw new Error("miapp.Json with object2String() and string2Object() needs to be loaded before miapp.LocalStorage!");
        }
    }

    // Public API

    /**
     * Sets a key's value.
     *
     * @param {String} key - Key to set. If this value is not set or not
     *              a string an exception is raised.
     * @param {Mixed} value - Value to set. This can be any value that is JSON
     *              compatible (Numbers, Strings, Objects etc.).
     * @returns the stored value which is a container of user value.
     */
    LocalStorage.prototype.set = function (key, value) {
        checkKey(key);
        // clone the object before saving to storage
        var t = typeof(value);
        if (t == "undefined")
            value = 'null';
        else if (value === null)
            value = 'null';
        else if (miapp.Xml.isXml(value))
            value = miapp.Json.object2String({xml:miapp.Xml.xml2String(value)});
        else if (t == "string")
            value = miapp.Json.object2String({string:value});
        else if (t == "number")
            value = miapp.Json.object2String({number:value});
        else if (t == "boolean")
            value = miapp.Json.object2String({ bool : value });
        else if (t == "object")
            value = miapp.Json.object2String( { json : value } );
        else {
            // reject and do not insert
            // if (typeof value == "function") for example
            throw new TypeError('Value type ' + t + ' is invalid. It must be null, undefined, xml, string, number, boolean or object');
        }
        storage.setItem(key, value);
        return value;
    };

    /**
     * Looks up a key in cache
     *
     * @param {String} key - Key to look up.
     * @param {mixed} def - Default value to return, if key didn't exist.
     * @returns the key value, default value or <null>
     */
    LocalStorage.prototype.get = function (key, def) {
        checkKey(key);
        var item = storage.getItem(key);
        if (item !== null) {
            if (item == 'null') {
                return null;
            }
            var value = miapp.Json.string2Object(item);
            if ('xml' in value) {
                return miapp.Xml.string2Xml(value.xml);
            } else if ('string' in value) {
                return value.string;
            } else if ('number' in value) {
                return value.number.valueOf();
            } else if ('bool' in value) {
                return value.bool.valueOf();
            } else {
                return value.json;
            }
        }
        return miapp.isUndefined(def) ? null : def;
    };

    /**
     * Deletes a key from cache.
     *
     * @param {String} key - Key to delete.
     * @returns true if key existed or false if it didn't
     */
    LocalStorage.prototype.remove = function (key) {
        checkKey(key);
        var existed = (storage.getItem(key) !== null);
        storage.removeItem(key);
        return existed;
    };

    /**
     * Deletes everything in cache.
     *
     * @return true
     */
    LocalStorage.prototype.clear = function () {
        var existed = (storage.length > 0);
        storage.clear();
        return existed;
    };

    /**
     * How much space in bytes does the storage take?
     *
     * @returns Number
     */
    LocalStorage.prototype.size = function () {
        return storage.length;
    };

    /**
     * Call function f on the specified context for each element of the storage
     * from index 0 to index length-1.
     * WARNING : You should not modify the storage during the loop !!!
     *
     * @param {Function} f - Function to call on every item.
     * @param {Object} context - Context (this for example).
     * @returns Number of items in storage
     */
    LocalStorage.prototype.foreach = function (f, context) {
        var n = storage.length;
        for (var i = 0; i < n; i++) {
            var key = storage.key(i);
            var value = this.get(key);
            if (context) {
                // f is an instance method on instance context
                f.call(context, value);
            } else {
                // f is a function or class method
                f(value);
            }
        }
        return n;
    };

    // Private API
    // helper functions and variables hidden within this function scope

    function checkKey(key) {
        if (!key || (typeof key != "string")) {
            throw new TypeError('Key type must be string');
        }
        return true;
    }

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return LocalStorage;
};

miapp.FileStorage = (function () {
    "use strict";

    // Constructor
    function FileStorage($q, $rootScope) {
        this.version = "0.1";
        this.q = $q;
        this.rootScope = $rootScope;
        this.grantedBytes = 0;
        this.fs = null;
        this.urlPrefix = '';
        this.storageType = null;

        this.initDone = false;
        this.initPromises = [];
        this.initTimer = null;
    }

    // Public API

    function initEnd(self) {
        miapp.safeApply(self.rootScope, function() {
            for (var i= 0; i < self.initPromises.length; i++) {
                self.initTrigger(self.initPromises[i]);
            }
            self.initDone = true;
            self.initPromises = [];
            self.initTimer = null;
        });
    }

    function launchEnd(self) {
        if (self.initTimer === null) {
            self.initTimer = setTimeout(function() { initEnd(self); }, 100);
        }
    }

    function tryQuota(self, grantBytes) {
        try {
            var fctOnSuccess = function (fs) {
                //miapp.InternalLog.log('miapp.FileStorage', 'opened file system ' + fs.name);
                self.fs = fs;
                self.urlPrefix = '';
                var pattern = /^(https?)_([^_]+)_(\d+):Persistent$/;
                if (pattern.test(fs.name)) {
                    var name = fs.name;
                    name = name.replace(pattern, "$1://$2:$3");// remove ':Persistent' and '_'
                    name = name.replace(/^(.*):0$/, "$1");// remove ':0'
                    // Specific to Chrome where window.webkitResolveLocalFileSystemURI does not exist
                    // get URL from URI by prefixing fullPath with urlPrefix
                    self.urlPrefix = 'filesystem:' + name + '/persistent';
                }
                //miapp.InternalLog.log('miapp.FileStorage', 'urlPrefix = ' + self.urlPrefix);
                self.initTrigger = function(deferred) { deferred.resolve(); };
                launchEnd(self);
            };
            var fctOnFailure = function (fileError) {
                if (fileError.code == FileError.QUOTA_EXCEEDED_ERR) {
                    setTimeout(function() { tryQuota(self, grantBytes/2); }, 100);
                } else {
                    var message = "requestFileSystem failure : " + errorMessage(fileError);
                    self.initTrigger = function(deferred) { deferred.reject(message); };
                    launchEnd(self);
                }
            };
            var requestFs = function(grantedBytes) {
                try {
                    if (miapp.isDefined(window.requestFileSystem)) {
                        window.requestFileSystem(self.storageType, grantedBytes, fctOnSuccess, fctOnFailure);
                    } else {
                        window.webkitRequestFileSystem(self.storageType, grantedBytes, fctOnSuccess, fctOnFailure);
                    }
                } catch (e) {
                    var message = e.message;
                    self.initTrigger = function(deferred) { deferred.reject(message); };
                    launchEnd(self);
                }
            };

            if (miapp.isDefined(window.webkitPersistentStorage)) {
                // In Chrome 27+
                if (miapp.isDefined(window.webkitPersistentStorage.requestQuota)) {
                    window.webkitPersistentStorage.requestQuota(grantBytes, function (grantedBytes) {
                        self.grantedBytes = grantedBytes;
                        requestFs(grantedBytes);
                    }, function (fileError) {
                        if (fileError.code == FileError.QUOTA_EXCEEDED_ERR) {
                            setTimeout(function() { tryQuota(self, grantBytes/2); }, 100);
                        } else {
                            var message = "requestQuota failure : " + errorMessage(fileError);
                            self.initTrigger = function(deferred) { deferred.reject(message); };
                            launchEnd(self);
                        }
                    });
                } else {
                    requestFs(grantBytes);
                }
            } else if (miapp.isDefined(navigator.webkitPersistentStorage)){//MLE deprecated ? (miapp.isDefined(window.webkitStorageInfo)) {
                // In Chrome 13
                if (miapp.isDefined(navigator.webkitPersistentStorage.requestQuota)) {
                    navigator.webkitPersistentStorage.requestQuota(self.storageType, grantBytes, function (grantedBytes) {
                        self.grantedBytes = grantedBytes;
                        requestFs(grantedBytes);
                    }, function (fileError) {
                        if (fileError.code == FileError.QUOTA_EXCEEDED_ERR) {
                            setTimeout(function() { tryQuota(self, grantBytes/2); }, 100);
                        } else {
                            var message = "requestQuota failure : " + errorMessage(fileError);
                            self.initTrigger = function(deferred) { deferred.reject(message); };
                            launchEnd(self);
                        }
                    });
                } else {
                    requestFs(grantBytes);
                }
            } else {
                requestFs(grantBytes);
            }
        } catch (e) {
            var message = e.message;
            self.initTrigger = function(deferred) { deferred.reject(message); };
            launchEnd(self);
        }
    }

    FileStorage.prototype.init = function () {
        var deferred = this.q.defer();
        this.initPromises.push(deferred);
        var message;
        if (this.initDone) {
            // Init already finished
            launchEnd(this);
        } else if (this.initPromises.length == 1) {
            // Init not yet started
            this.initPromises.push(deferred);
            if (miapp.isUndefinedOrNull(LocalFileSystem)) {
                this.storageType = window.PERSISTENT;
            } else {
                this.storageType = LocalFileSystem.PERSISTENT;
            }
            if (!window.File || !window.FileReader || !window.Blob) {
                message = "window.File, window.FileReader and window.Blob need to be loaded before miapp.FileStorage!";
                this.initTrigger = function(deferred) { deferred.reject(message); };
                launchEnd(this);
            } else if (miapp.isUndefined(window.requestFileSystem) && miapp.isUndefined(window.webkitRequestFileSystem)) {
                message = "window.requestFileSystem() or window.webkitRequestFileSystem() required by miapp.FileStorage!";
                this.initTrigger = function(deferred) { deferred.reject(message); };
                launchEnd(this);
            } else if (miapp.isUndefined(window.resolveLocalFileSystemURL) &&
                miapp.isUndefined(window.webkitResolveLocalFileSystemURL) &&
                miapp.isUndefined(window.resolveLocalFileSystemURI) &&
                miapp.isUndefined(window.webkitResolveLocalFileSystemURI)) {
                message = "window.resolveLocalFileSystemURI or equivalent required by miapp.FileStorage!";
                this.initTrigger = function(deferred) { deferred.reject(message); };
                launchEnd(this);
            } else {
                var grantBytes = 4 * 1024 * 1024 * 1024;
                var self = this;
                setTimeout(function() { tryQuota(self, grantBytes); }, 100);
            }
        } else {
            // Init already started but not yet finished
        }
        return deferred.promise;
    };

    /**
     * Get granted space.
     *
     * @param {Int} storageType - LocalFileSystem.TEMPORARY or LocalFileSystem.PERSISTENT or window.TEMPORARY or window.PERSISTENT value.
     * @param {Function} onSuccess - Callback function with long long argument giving grantedQuotaInBytes or 0 if not available.
     * @returns true.
     */
    /* getGrantedBytes() and getUsedBytes() are not yet ready
     FileStorage.getGrantedBytes = function (storageType, onSuccess) {
     // In Chrome 13
            if ((miapp.isUndefinedOrNull(storageType)) {
                if (miapp.isUndefinedOrNull(LocalFileSystem)) {
                    storageType = window.PERSISTENT;
                } else {
                    storageType = LocalFileSystem.PERSISTENT;
                }
            }
     if (miapp.isUndefined(navigator.webkitPersistentStorage)) {
     if (miapp.isUndefined(navigator.webkitPersistentStorage.queryUsageAndQuota)) {
     navigator.webkitPersistentStorage.queryUsageAndQuota(storageType,
     function (currentUsageInBytes) {
     },
     function (grantedQuotaInBytes) {
     onSuccess(grantedQuotaInBytes);
     });
     return true;
     }
     }
     onSuccess(0);
     return true;
     };
     */

    /**
     * Get used space.
     *
     * @param {Int} storageType - LocalFileSystem.TEMPORARY or LocalFileSystem.PERSISTENT or window.TEMPORARY or window.PERSISTENT value.
     * @param {Function} onSuccess - Callback function with long long argument giving currentUsageInBytes or 0 if not available.
     * @returns true.
     */
    /* getGrantedBytes() and getUsedBytes() are not yet ready
     FileStorage.getUsedBytes = function (storageType, onSuccess) {
     // In Chrome 13
            if (miapp.isUndefinedOrNull(storageType)) {
                if (miapp.isUndefinedOrNull(LocalFileSystem)) {
                    storageType = window.PERSISTENT;
                } else {
                    storageType = LocalFileSystem.PERSISTENT;
                }
            }
     if (miapp.isDefined(navigator.webkitPersistentStorage)) {
     if (miapp.isDefined(navigator.webkitPersistentStorage.queryUsageAndQuota)) {
     navigator.webkitPersistentStorage.queryUsageAndQuota(storageType,
     function (currentUsageInBytes) {
     onSuccess(currentUsageInBytes);
     },
     function (grantedQuotaInBytes) {
     });
     return true;
     }
     }
     onSuccess(0);
     return true;
     };
     */


    /**
     * get FileSystem ... usefull ? prefer using inside
     */
    FileStorage.prototype.getFS = function () {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        return this.fs;
    };

    /**
     * Create a directory in root directory.
     *
     * @param {String} dirPath - Directory path (relative or absolute). All directories in path will be created.
     * @param {Function} onSuccess - Called with dirEntry argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.createDir = function (dirPath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        var self = this;
        var names = dirPath.split('/');
        var max = names.length;
        var dirs = [];
        for (var i = 0; i < max; i++) {
            if ((names[i] != '.') && (names[i] !== '')) {
                dirs.push(names[i]);
            }
        }
        var dirOptions = {create:true, exclusive:false};
        getDirEntry(this.fs.root, dirOptions, dirs,
            function (dirEntry) {
                if (onSuccess) {
                    onSuccess(dirEntry);
                }
            }, onFailure);

    };

    /**
     * Get a directory in root directory.
     * Will get nothing if directory does not already exist.
     *
     * @param {String} dirPath - Directory path (relative or absolute). Its direct parent directory must already exist.
     * @param {Function} onSuccess - Called with dirEntry argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.getDir = function (dirPath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        var names = dirPath.split('/');
        var max = names.length;
        var dirs = [];
        for (var i = 0; i < max; i++) {
            if ((names[i] != '.') && (names[i] !== '')) {
                dirs.push(names[i]);
            }
        }
        var dirOptions = {create:false, exclusive:false};
        getDirEntry(this.fs.root, dirOptions, dirs, onSuccess, onFailure);
    };

    /**
     * Read the content of a directory.
     * Will get nothing if directory does not already exist.
     *
     * @param {String} dirPath - Directory path (relative or absolute). Its parent directories must already exist.
     * @param {Function} onSuccess - Called with dirNames and fileNames sorted Array arguments if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.readDirectory = function (dirPath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        var names = dirPath.split('/');
        var max = names.length;
        var dirs = [];
        for (var i = 0; i < max; i++) {
            if ((names[i] != '.') && (names[i] !== '')) {
                dirs.push(names[i]);
            }
        }
        var dirOptions = {create:false, exclusive:false};
        var dirContentReader = function (dirEntry) {
            var dirReader = dirEntry.createReader();
            var fileEntries = [];
            var dirEntries = [];
            // There is no guarantee that all entries are read in ony one call to readEntries()
            // call readEntries() until no more results are returned
            var readEntries = function () {
                dirReader.readEntries(function (results) {
                    if (!results.length) {
                        // All entries have been read
                        if (onSuccess) {
                            dirEntries.sort();
                            fileEntries.sort();
                            onSuccess(dirEntries, fileEntries);
                        }
                    } else {
                        // New entries to add
                        var max = results.length;
                        for (var i = 0; i < max; i++) {
                            if (results[i].isFile) {
                                //fileEntries.push(results[i].fullPath);
                                fileEntries.push(results[i].name);
                            } else {
                                //dirEntries.push(results[i].fullPath);
                                dirEntries.push(results[i].name);
                            }
                        }
                        readEntries();
                    }
                }, function (fileError) {
                    if (onFailure) {
                        onFailure("readEntries from " + dirEntry.fullPath + " failure : " + errorMessage(fileError));
                    }
                });
            };
            // Start to read entries
            readEntries();
        };
        getDirEntry(this.fs.root, dirOptions, dirs, dirContentReader, onFailure);
    };

    /**
     * Read the content of a directory and all its subdirectories.
     * Will get nothing if directory does not already exist.
     *
     * @param {String} dirPath - Directory path (relative or absolute). Its parent directories must already exist.
     * @param {Function} onSuccess - Called with fileFullPaths sorted Array argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.readFullDirectory = function (dirPath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        var names = dirPath.split('/');
        var max = names.length;
        var dirs = [];
        for (var i = 0; i < max; i++) {
            if ((names[i] != '.') && (names[i] !== '')) {
                dirs.push(names[i]);
            }
        }
        var dirOptions = {create:false, exclusive:false};
        var dirEntries = [];
        var fileEntries = [];
        var dirContentReader = function (dirEntry) {
            //miapp.InternalLog.log('miapp.FileStorage', 'Reading dir ' + dirEntry.fullPath);
            var dirReader = dirEntry.createReader();
            // There is no guarantee that all entries are read in ony one call to readEntries()
            // call readEntries() until no more results are returned
            var readEntries = function () {
                dirReader.readEntries(function (results) {
                    if (!results.length) {
                        // All entries of this dirEntry have been read
                        if (dirEntries.length <= 0) {
                            // All entries of all dirEntries have been read
                            if (onSuccess) {
                                fileEntries.sort();
                                onSuccess(fileEntries);
                            }
                        } else {
                            dirContentReader(dirEntries.shift());
                        }
                    } else {
                        // New entries to add
                        var max = results.length;
                        for (var i = 0; i < max; i++) {
                            if (results[i].isFile) {
                                fileEntries.push(results[i].fullPath);
                            } else {
                                dirEntries.push(results[i]);
                            }
                        }
                        readEntries();
                    }
                }, function (fileError) {
                    if (onFailure) {
                        onFailure("readEntries from " + dirEntry.fullPath + " failure : " + errorMessage(fileError));
                    }
                });
            };
            // Start to read entries
            readEntries();
        };
        getDirEntry(this.fs.root, dirOptions, dirs, dirContentReader, onFailure);
    };

    FileStorage.prototype.deleteDir = function (dirPath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        var names = dirPath.split('/');
        var max = names.length;
        var dirs = [];
        for (var i = 0; i < max; i++) {
            if ((names[i] != '.') && (names[i] !== '')) {
                dirs.push(names[i]);
            }
        }
        var dirOptions = {create:false, exclusive:false};
        getDirEntry(this.fs.root, dirOptions, dirs,
            function (dirEntry) {
                dirEntry.remove(function () {
                    if (onSuccess) {
                        onSuccess();
                    }
                }, function (fileError) {
                    if (onFailure) {
                        onFailure("remove " + dirEntry.fullPath + " failure : " + errorMessage(fileError));
                    }
                });
            }, function(message) {
                // Ignore error if dir unknown. It is also a success
                if (onSuccess) {
                    onSuccess();
                }
            });
    };

    FileStorage.prototype.deleteFullDir = function (dirPath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        var names = dirPath.split('/');
        var max = names.length;
        var dirs = [];
        for (var i = 0; i < max; i++) {
            if ((names[i] != '.') && (names[i] !== '')) {
                dirs.push(names[i]);
            }
        }
        var dirOptions = {create:false, exclusive:false};
        getDirEntry(this.fs.root, dirOptions, dirs,
            function (dirEntry) {
                dirEntry.removeRecursively(function () {
                    if (onSuccess) {
                        onSuccess();
                    }
                }, function (fileError) {
                    if (onFailure) {
                        onFailure("removeRecursively " + dirEntry.fullPath + " failure : " + errorMessage(fileError));
                    }
                });
            }, function (message) {
                // Ignore error if dir unknown. It is also a success
                if (onSuccess) {
                    onSuccess();
                }
            });
    };

    /**
     * Get a fileEntry from its URL.
     * Will get nothing if file does not already exist.
     *
     * @param {String} fileUrl - File URL.
     * @param {Function} onSuccess - Called with fileEntry argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.getFileFromUrl = function (fileUrl, onSuccess, onFailure) {
        //miapp.InternalLog.log('miapp.FileStorage','getFileFromUrl : '+ fileUrl);
        if (!this.fs) {
            //miapp.InternalLog.log('miapp.FileStorage','FileStorage No FS !');
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        // resolve File in private or localhost fs
        fileUrl = fileUrl.replace('/private/','/');
        fileUrl = fileUrl.replace('/localhost/','/');

        if (miapp.isDefined(window.resolveLocalFileSystemURL)) {
            //miapp.InternalLog.log('miapp.FileStorage','window.resolveLocalFileSystemURL '+fileUrl);
            window.resolveLocalFileSystemURL(fileUrl, function (fileEntry) {
                    if (onSuccess) {
                        onSuccess(fileEntry);
                    }
                },
                function (fileError) {
                    if (onFailure) {
                        onFailure("resolveLocalFileSystemURL " + fileUrl + " failure : " + errorMessage(fileError));
                    }
                });
        } else if (miapp.isDefined(window.webkitResolveLocalFileSystemURL)) {
            //miapp.InternalLog.log('miapp.FileStorage','window.webkitResolveLocalFileSystemURL '+fileUrl);
            window.webkitResolveLocalFileSystemURL(fileUrl, function (fileEntry) {
                    if (onSuccess) {
                        onSuccess(fileEntry);
                    }
                },
                function (fileError) {
                    if (onFailure) {
                        onFailure("webkitResolveLocalFileSystemURL " + fileUrl + " failure : " + errorMessage(fileError));
                    }
                });
        }
        else {
            //miapp.InternalLog.log('miapp.FileStorage','cordova.getFileFromUri '+fileUrl);
            // In Cordova window.webkitResolveLocalFileSystemURL does not exist
            this.getFileFromUri(fileUrl, onSuccess, onFailure);
        }
    };

    /**
     * Get a fileEntry from its URI.
     * Will get nothing if file does not already exist.
     *
     * @param {String} fileUri - File URI.
     * @param {Function} onSuccess - Called with fileEntry argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.getFileFromUri = function (fileUri, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        // resolve File in private or localhost fs
        fileUri = fileUri.replace('/private/','/');
        fileUri = fileUri.replace('/localhost/','/');

        if (miapp.isDefined(window.resolveLocalFileSystemURI)) {
            //miapp.InternalLog.log('miapp.FileStorage','window.resolveLocalFileSystemURI '+fileUri);
            window.resolveLocalFileSystemURI(fileUri, function (fileEntry) {
                    if (onSuccess) {
                        onSuccess(fileEntry);
                    }
                },
                function (fileError) {
                    if (onFailure) {
                        onFailure("resolveLocalFileSystemURI " + fileUri + " failure : " + errorMessage(fileError));
                    }
                });
        } else if (miapp.isDefined(window.webkitResolveLocalFileSystemURI)) {
            //miapp.InternalLog.log('miapp.FileStorage','window.webkitResolveLocalFileSystemURI '+fileUri);
            window.webkitResolveLocalFileSystemURI(fileUri, function (fileEntry) {
                    if (onSuccess) {
                        onSuccess(fileEntry);
                    }
                },
                function (fileError) {
                    if (onFailure) {
                        onFailure("webkitResolveLocalFileSystemURI " + fileUri + " failure : " + errorMessage(fileError));
                    }
                });
        } else {
            //miapp.InternalLog.log('miapp.FileStorage','cordova.getFileFromUrl '+fileUri);
            // In Chrome window.webkitResolveLocalFileSystemURI does not exist
            this.getFileFromUrl(self.urlPrefix + fileUri, onSuccess, onFailure);
        }
    };

    /**
     * Get a URL from its filePath.
     * Will get nothing if file does not already exist.
     *
     * @param {String} filePath - File path.
     * @param {Function} onSuccess - Called with fileURL argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.getUrlFromFile = function (filePath, onSuccess, onFailure) {
        //miapp.InternalLog.log('miapp.FileStorage','getUrlFromFile '+filePath);
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }

        //miapp.InternalLog.log('miapp.FileStorage','getUrlFromFile .. '+filePath);
        getFileEntry(this.fs.root, filePath, {create:false, exclusive:false},
            function (fileEntry) {

                //miapp.InternalLog.log('miapp.FileStorage','getUrlFromFile result  toURL '+fileEntry.toURL());
                //miapp.InternalLog.log('miapp.FileStorage','getUrlFromFile result  fullPath '+fileEntry.fullPath);

                if (miapp.isDefined(fileEntry.toNativeURL)){
                    //miapp.InternalLog.log('miapp.FileStorage','getUrlFromFile result  toNativeURL '+fileEntry.toNativeURL());
                    if (onSuccess) onSuccess(fileEntry.toNativeURL());
                } else {
                    //miapp.InternalLog.log('miapp.FileStorage','toNativeURL not defined, use toUrl');
                    if (onSuccess) onSuccess(fileEntry.toURL());
                }

            }, onFailure);
    };

    /**
     * Get a URI from its filePath.
     * Will get nothing if file does not already exist.
     *
     * @param {String} filePath - File path.
     * @param {Function} onSuccess - Called with fileURI argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.getUriFromFile = function (filePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, filePath, {create:false, exclusive:false},
            function (fileEntry) {
                if (onSuccess) {
                    onSuccess(fileEntry.toURI());
                }
            }, onFailure);
    };

    /**
     * Get a modification time from its filePath.
     * Will get nothing if file does not already exist.
     *
     * @param {String} filePath - File URL.
     * @param {Function} onSuccess - Called with Date object argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.getModificationTimeFromFile = function (filePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, filePath, {create:false, exclusive:false},
            function (fileEntry) {
                fileEntry.getMetadata(
                    function (metadata) {
                        if (onSuccess) {
                            onSuccess(metadata.modificationTime);
                        }
                    },
                    function (fileError) {
                        if (onFailure) {
                            onFailure("getMetadata " + fileEntry.fullPath + " failure : " + errorMessage(fileError));
                        }
                    });
            }, onFailure);
    };

    /**
     * Get a file in root directory.
     * Will get nothing if file does not already exist.
     *
     * @param {String} filePath - File path (relative or absolute). Its direct parent directory must already exist.
     * @param {Function} onSuccess - Called with fileEntry argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.getFile = function (filePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, filePath, {create:false, exclusive:false}, onSuccess, onFailure);
    };

    /**
     * Creates a new file in root directory.
     * Will create file if file does not already exist. Will fail if file already exist.
     *
     * @param {String} filePath - File path (relative or absolute). Its direct parent directory must already exist.
     * @param {Function} onSuccess - Called with fileEntry argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.newFile = function (filePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, filePath, {create:true, exclusive:true}, onSuccess, onFailure);
    };

    /**
     * Get a existant file or create a new file in root directory.
     * Will create file if file does not already exist. Will reuse the same file if file already exist.
     *
     * @param {String} filePath - File path (relative or absolute). Its direct parent directory must already exist.
     * @param {Function} onSuccess - Called with fileEntry argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.getOrNewFile = function (filePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, filePath, {create:true, exclusive:false}, onSuccess, onFailure);
    };

    /**
     * Read the content of a file in root directory.
     * Will get nothing if file does not already exist.
     *
     * @param {String} filePath - File path (relative or absolute). Its direct parent directory must already exist.
     * @param {Function} onSuccess - Called with text argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.readFileAsDataURL = function (filePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, filePath, {create:false, exclusive:false},
            function (fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();
                    if (onSuccess) {
                        reader.onload = function (evt) {
                            onSuccess(evt.target.result);
                        };
                    }
                    if (onFailure) {
                        reader.onerror = function (fileError) {
                            onFailure("readAsDataURL " + file.fullPath + " failure : " + errorMessage(fileError));
                        };
                    }
                    reader.readAsDataURL(file);
                }, function (fileError) {
                    if (onFailure) {
                        onFailure("file " + file.fullPath + " failure : " + errorMessage(fileError));
                    }
                });
            }, onFailure);
    };
    FileStorage.prototype.readFileAsText = function (filePath, onSuccess, onFailure, onProgress, from, length) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, filePath, {create:false, exclusive:false},
            function (fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();
                    //var blob = createBlobToReadByChunks(file, reader, onSuccess, onFailure, onProgress, from, length);
                    //reader.readAsText(blob);// use 'UTF-8' encoding
                    if (onSuccess) {
                        reader.onload = function (evt) {
                            onSuccess(evt.target.result);
                        };
                    }
                    if (onFailure) {
                        reader.onerror = function (fileError) {
                            onFailure("readAsText " + file.fullPath + " failure : " + errorMessage(fileError));
                        };
                    }
                    reader.readAsText(file);
                }, function (fileError) {
                    if (onFailure) {
                        onFailure("file " + file.fullPath + " failure : " + errorMessage(fileError));
                    }
                });
            }, onFailure);
    };

    // Not yet implemented in Cordova
    FileStorage.prototype.readFileAsArrayBuffer = function (filePath, onSuccess, onFailure, onProgress, from, length) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, filePath, {create:false, exclusive:false},
            function (fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();
                    //var blob = createBlobToReadByChunks(file, reader, onSuccess, onFailure, onProgress, from, length);
                    //reader.readAsArrayBuffer(blob);
                    if (onSuccess) {
                        reader.onload = function (evt) {
                            onSuccess(evt.target.result);
                        };
                    }
                    if (onFailure) {
                        reader.onerror = function (fileError) {
                            onFailure("readAsText " + file.fullPath + " failure : " + errorMessage(fileError));
                        };
                    }
                    reader.readAsArrayBuffer(file);
                }, function (fileError) {
                    if (onFailure) {
                        onFailure("file " + file.fullPath + " failure : " + errorMessage(fileError));
                    }
                });
            }, onFailure);
    };

    // Not yet implemented in Cordova
    FileStorage.prototype.readFileAsBinaryString = function (filePath, onSuccess, onFailure, onProgress, from, length) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, filePath, {create:false, exclusive:false},
            function (fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();
                    //var blob = createBlobToReadByChunks(file, reader, onSuccess, onFailure, onProgress, from, length);
                    //reader.readAsBinaryString(blob);
                    if (onSuccess) {
                        reader.onload = function (evt) {
                            onSuccess(evt.target.result);
                        };
                    }
                    if (onFailure) {
                        reader.onerror = function (fileError) {
                            onFailure("readAsText " + file.fullPath + " failure : " + errorMessage(fileError));
                        };
                    }
                    reader.readAsBinaryString(file);
                }, function (fileError) {
                    if (onFailure) {
                        onFailure("file " + file.fullPath + " failure : " + errorMessage(fileError));
                    }
                });
            }, onFailure);
    };

    FileStorage.prototype.writeFile = function (fromBlob, toFilePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, toFilePath, {create:true, exclusive:false},
            function (fileEntry) {
                fileEntry.createWriter(function (fileWriter) {
                    // WARNING : can not do truncate() + write() at the same time
                    fileWriter.onwriteend = function (evt) {
                        fileWriter.onwriteend = null;
                        if (onSuccess) {
                            fileWriter.onwrite = function (evt) {
                                onSuccess(fileEntry);
                            };
                        }
                        if (onFailure) {
                            fileWriter.onerror = function (fileError) {
                                onFailure("write or truncate " + fileEntry.fullPath + " failure : " + errorMessage(fileError));
                            };
                        }
                        fileWriter.write(fromBlob);
                    };
                    fileWriter.truncate(0);// Required if new text is shorter than previous text
                }, function (fileError) {
                    if (onFailure) {
                        onFailure("createWriter " + fileEntry.fullPath + " failure : " + errorMessage(fileError));
                    }
                });
            }, onFailure);
    };

    FileStorage.prototype.appendFile = function (fromBlob, toFilePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, toFilePath, {create:true, exclusive:false},
            function (fileEntry) {
                fileEntry.createWriter(function (fileWriter) {
                    if (onSuccess) {
                        fileWriter.onwrite = function (e) {
                            onSuccess(fileEntry);
                        };
                    }
                    if (onFailure) {
                        fileWriter.onerror = function (fileError) {
                            onFailure("write or seek " + fileEntry.fullPath + " failure : " + errorMessage(fileError));
                        };
                    }
                    // can do seek() + write() at the same time
                    fileWriter.seek(fileWriter.length);
                    fileWriter.write(fromBlob);
                }, function (fileError) {
                    if (onFailure) {
                        onFailure("createWriter " + fileEntry.fullPath + " failure : " + errorMessage(fileError));
                    }
                });
            }, onFailure);
    };

    FileStorage.prototype.deleteFile = function (filePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, filePath, {create:false, exclusive:false},
            function (fileEntry) {
                fileEntry.remove(function () {
                    if (onSuccess) {
                        onSuccess();
                    }
                }, function (fileError) {
                    if (onFailure) {
                        onFailure("remove " + fileEntry.fullPath + " failure : " + errorMessage(fileError));
                    }
                });
            }, function (message) {
                // Ignore error if file unknown. It is also a success
                if (onSuccess) {
                    onSuccess();
                }
            });
    };

    FileStorage.prototype.copyFile = function (fromFilePath, toFilePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        //miapp.InternalLog.log('miapp.FileStorage','copyFile :'+fromFilePath+" to:"+toFilePath);
        var self = this;
        var names = toFilePath.split('/');
        var max = names.length - 1;
        var fileName = names[max];
        var dirs = [];
        for (var i = 0; i < max; i++) {
            if ((names[i] != '.') && (names[i] !== '')) {
                dirs.push(names[i]);
            }
        }
        var dirOptions = {create:true, exclusive:false};
        getDirEntry(this.fs.root, dirOptions, dirs,
            function (dirEntry) {
                //miapp.InternalLog.log('miapp.FileStorage','copyFile in :'+fromFilePath+" to:"+toFilePath);
                getFileEntry(self.fs.root, fromFilePath, {create:false, exclusive:false},
                    function (fileEntry) {
                        //miapp.InternalLog.log('miapp.FileStorage','copyFile in2 :'+fromFilePath+" to:"+toFilePath);
                        fileEntry.copyTo(dirEntry, fileName, function (toFileEntry) {
                            if (onSuccess) {
                                onSuccess(toFileEntry);
                            }
                        }, function (fileError) {
                            if (onFailure) {
                                onFailure("copy " + fileEntry.fullPath + " to " + dirEntry.fullPath + "/" + fileName + " failure : " + errorMessage(fileError));
                            }
                        });
                    }, onFailure);
            }, onFailure);

    };

    FileStorage.prototype.copyFileFromUrl = function (fromFileUrl, toFilePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        //miapp.InternalLog.log('miapp.FileStorage','copyFileFromUrl :'+fromFileUrl+" to:"+toFilePath);
        var self = this;
        var names = toFilePath.split('/');
        var max = names.length - 1;
        var fileName = names[max];
        var dirs = [];
        for (var i = 0; i < max; i++) {
            if ((names[i] != '.') && (names[i] !== '')) {
                dirs.push(names[i]);
            }
        }
        var dirOptions = {create:true, exclusive:false};
        getDirEntry(this.fs.root, dirOptions, dirs,
            function (dirEntry) {
                //miapp.InternalLog.log('miapp.FileStorage','copyFileFromUrl in :'+fromFileUrl+" to:"+toFilePath);
                self.getFileFromUrl(fromFileUrl,
                    function (fileEntry) {
                        //miapp.InternalLog.log('miapp.FileStorage','copyFileFromUrl in2 :'+fromFileUrl+" to:"+toFilePath);
                        fileEntry.copyTo(dirEntry, fileName, function (toFileEntry) {
                            if (onSuccess) {
                                onSuccess(toFileEntry);
                            }
                        }, function (fileError) {
                            if (onFailure) {
                                onFailure("copy " + fileEntry.fullPath + " to " + dirEntry.fullPath + "/" + fileName + " failure : " + errorMessage(fileError));
                            }
                        });
                    }, onFailure);
            }, onFailure);
    };

    FileStorage.prototype.moveFile = function (fromFilePath, toFilePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        var self = this;
        var names = toFilePath.split('/');
        var max = names.length - 1;
        var fileName = names[max];
        var dirs = [];
        for (var i = 0; i < max; i++) {
            if ((names[i] != '.') && (names[i] !== '')) {
                dirs.push(names[i]);
            }
        }
        var dirOptions = {create:true, exclusive:false};
        getDirEntry(this.fs.root, dirOptions, dirs,
            function (dirEntry) {
                getFileEntry(self.fs.root, fromFilePath, {create:false, exclusive:false},
                    function (fileEntry) {
                        fileEntry.moveTo(dirEntry, fileName, function (toFileEntry) {
                            if (onSuccess) {
                                onSuccess(toFileEntry);
                            }
                        }, function (fileError) {
                            if (onFailure) {
                                onFailure("move " + fileEntry.fullPath + " to " + dirEntry.fullPath + "/" + fileName + " failure : " + errorMessage(fileError));
                            }
                        });
                    }, onFailure);
            }, onFailure);

    };

    FileStorage.prototype.moveFileEntry = function (fromFileEntry, toFilePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        var self = this;
        var names = toFilePath.split('/');
        var max = names.length - 1;
        var fileName = names[max];
        var dirs = [];
        for (var i = 0; i < max; i++) {
            if ((names[i] != '.') && (names[i] !== '')) {
                dirs.push(names[i]);
            }
        }
        var dirOptions = {create:true, exclusive:false};
        getDirEntry(this.fs.root, dirOptions, dirs,
            function (dirEntry) {
    			fromFileEntry.moveTo(dirEntry, fileName, function (toFileEntry) {
                        if (onSuccess) {
                            onSuccess(toFileEntry);
                        }
                    }, function (fileError) {
                        if (onFailure) {
                            onFailure("move " + fileEntry.fullPath + " to " + dirEntry.fullPath + "/" + fileName + " failure : " + errorMessage(fileError));
                        }
                    });
            }, onFailure);

    };

    // Private API
    // helper functions and variables hidden within this function scope

    function errorMessage(fileError) {
        var msg = '';
        switch (fileError.code) {
            case FileError.NOT_FOUND_ERR:
                msg = 'File not found';
                break;
            case FileError.SECURITY_ERR:
                // You may need the --allow-file-access-from-files flag
                // if you're debugging your app from file://.
                msg = 'Security error';
                break;
            case FileError.ABORT_ERR:
                msg = 'Aborted';
                break;
            case FileError.NOT_READABLE_ERR:
                msg = 'File not readable';
                break;
            case FileError.ENCODING_ERR:
                msg = 'Encoding error';
                break;
            case FileError.NO_MODIFICATION_ALLOWED_ERR:
                msg = 'File not modifiable';
                break;
            case FileError.INVALID_STATE_ERR:
                msg = 'Invalid state';
                break;
            case FileError.SYNTAX_ERR:
                msg = 'Syntax error';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = 'Invalid modification';
                break;
            case FileError.QUOTA_EXCEEDED_ERR:
                // You may need the --allow-file-access-from-files flag
                // if you're debugging your app from file://.
                msg = 'Quota exceeded';
                break;
            case FileError.TYPE_MISMATCH_ERR:
                msg = 'Type mismatch';
                break;
            case FileError.PATH_EXISTS_ERR:
                msg = 'File already exists';
                break;
            default:
                msg = 'Unknown FileError code (code= ' + fileError.code + ', type=' + typeof(fileError) + ')';
                break;
        }
        return msg;
    }

    function getDirEntry(dirEntry, dirOptions, dirs, onSuccess, onFailure) {

        if (dirs.length <= 0) {
            //miapp.InternalLog.log('miapp.FileStorage','getDirEntry success1');
            if (onSuccess) onSuccess(dirEntry);
            return;
        }

        var bWillThrow = false;
        var dirName = dirs[0];
        dirs = dirs.slice(1);

        //miapp.InternalLog.log('miapp.FileStorage','getDirEntry '+dirName+' '+dirOptions);
        dirEntry.getDirectory(dirName, dirOptions,
            function (dirEntry) {
                bWillThrow = true;
                //miapp.InternalLog.log('miapp.FileStorage','getDirEntry in '+dirName);
                if (dirs.length) {
                    //miapp.InternalLog.log('miapp.FileStorage','getDirEntry in2 '+dirName);
                    getDirEntry(dirEntry, dirOptions, dirs, onSuccess, onFailure);
                } else {
                    //miapp.InternalLog.log('miapp.FileStorage','getDirEntry success2 '+dirName);
                    if (onSuccess) onSuccess(dirEntry);
                }
            },
            function (fileError) {
                //miapp.InternalLog.log('miapp.FileStorage','getDirEntry fail '+dirName+' '+fileError+' '+dirOptions);
                bWillThrow = true;
                if (onFailure) onFailure("getDirectory " + dirName + " from " + dirEntry.fullPath + " failure : " + errorMessage(fileError));
            }
        );

        //setTimeout(function() {
            //miapp.InternalLog.log('miapp.FileStorage','bWillThrow ? '+bWillThrow+' '+dirName);
            // window.setTimeout(function(){console.log('wait...');},1000);
            // console.log('bWillThrow... ? '+bWillThrow);

            // if (!bWillThrow) {
            //     console.log('getDirEntry not throw pb'+' '+dirName+' '+dirOptions);
            //     //if (onFailure) onFailure("getDirectory " + dirName + " from " + dirEntry.fullPath + " failure : unknow ?");
            // }
        //},500);
    }

    function getFileEntry(rootEntry, filePath, fileOptions, onSuccess, onFailure) {
        var names = filePath.split('/');
        var max = names.length - 1;
        var fileName = names[max];
        var dirs = [];
        for (var i = 0; i < max; i++) {
            if ((names[i] !== '.') && (names[i] !== '')) {
                dirs.push(names[i]);
            }
        }

        //miapp.InternalLog.log('miapp.FileStorage','getFileEntry filePath :'+filePath+" fileOptions:"+fileOptions.create+' dirs:'+miappDumpObject("  ", dirs, 1));
        var dirOptions;
        if (fileOptions.create) {
            dirOptions = {create:true, exclusive:false};
        } else {
            dirOptions = {create:false, exclusive:false};
        }
        getDirEntry(rootEntry, dirOptions, dirs,
            function (dirEntry) {
                //miapp.InternalLog.log('miapp.FileStorage','getFileEntry in filePath :'+filePath+" fileOptions:"+fileOptions.create);
                dirEntry.getFile(fileName, fileOptions,
                    function (fileEntry) {
                        //miapp.InternalLog.log('miapp.FileStorage','getFileEntry in success filePath :'+filePath+" fileOptions:"+fileOptions.create);
                        if (onSuccess) {
                            onSuccess(fileEntry);
                        }
                    }, function (fileError) {
                        //miapp.InternalLog.log('miapp.FileStorage','getFileEntry in failure filePath :'+filePath+" fileOptions:"+fileOptions.create);
                        if (onFailure) {
                            onFailure("getFile " + fileName + " from " + dirEntry.fullPath + " failure : " + errorMessage(fileError));
                        }
                    });
            }, onFailure);
    }

    function createBlobToReadByChunks(file, reader, onSuccess, onFailure, onProgress, from, length) {
        var start = parseInt(from) || 0;
        var stop = parseInt(length) || (file.size - start);
        if (onProgress) {
            reader.onloadstart = function (evt) {
                onProgress(0, stop - start);
            };
            reader.onprogress = function (evt) {
                if (evt.lengthComputable) {
                    //var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
                    onProgress(evt.loaded, evt.total);
                }
            };
            if (onSuccess) {
                reader.onloadend = function (evt) {
                    if (evt.target.readyState == FileReader.DONE) {
                        onProgress(stop - start, stop - start);
                        onSuccess(evt.target.result);
                    }
                };
            } else {
                reader.onloadend = function (evt) {
                    if (evt.target.readyState == FileReader.DONE) {
                        onProgress(stop - start, stop - start);
                    }
                };
            }
        } else if (onSuccess) {
            reader.onloadend = function (evt) {
                if (evt.target.readyState == FileReader.DONE) {
                    onSuccess(evt.target.result);
                }
            };
        }
        if (onFailure) {
            reader.onerror = function (fileError) {
                onFailure("FileReader " + file.fullPath + " failure : " + errorMessage(fileError));
            };
            reader.onabort = function (evt) {
                onFailure('Aborted by user');
            };
        }
        var blob = file.slice(start, stop);
        return blob;
    }

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return FileStorage;
})(); // Invoke the function immediately to create this class.

// An auxiliary constructor for the FileStorage class.
miapp.PredefinedFileStorage = (function () {
    // Constructor
    function PredefinedFileStorage(fileSystem, grantedBytes) {
        this.version = "0.1";
        this.fs = fileSystem;
        this.grantedBytes = grantedBytes;
    }

    // Set the prototype so that PredefinedFileStorage creates instances of FileStorage
    PredefinedFileStorage.prototype = miapp.FileStorage.prototype;

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return PredefinedFileStorage;
})(); // Invoke the function immediately to create this class.

// Namespace miapp
var miapp;
if (!miapp) miapp = {};


// Services
if (typeof angular !== 'undefined')
    angular.module('miapp.services', [])
        .factory('srvLocalStorage', function () {

            var LocalStorage = miapp.LocalStorageFactory(window.localStorage);
            return new LocalStorage();

        });



// Namespace miapp
var miapp;
if (!miapp) miapp = {};


miapp.Utf8 = (function () {
'use strict';

    var Utf8 = {};

    // Public API


    /**
     * Encodes multi-byte Unicode string to utf-8 encoded characters
     *
     * @param {String} input Unicode string to be encoded into utf-8
     * @returns {String} UTF-8 string
     */
    Utf8.encode = function (input) {
        var utftext = '', nChr, nStrLen = input.length;
        /* transcription... */
        for (var nChrIdx = 0; nChrIdx < nStrLen; nChrIdx++) {
            nChr = input.charCodeAt(nChrIdx);
            if (nChr < 128) {
                /* one byte */
                utftext += String.fromCharCode(nChr);
            } else if (nChr < 0x800) {
                /* two bytes */
                utftext += String.fromCharCode(192 + (nChr >>> 6));
                utftext += String.fromCharCode(128 + (nChr & 63));
            } else if (nChr < 0x10000) {
                /* three bytes */
                utftext += String.fromCharCode(224 + (nChr >>> 12));
                utftext += String.fromCharCode(128 + (nChr >>> 6 & 63));
                utftext += String.fromCharCode(128 + (nChr & 63));
            } else if (nChr < 0x200000) {
                /* four bytes */
                utftext += String.fromCharCode(240 + (nChr >>> 18));
                utftext += String.fromCharCode(128 + (nChr >>> 12 & 63));
                utftext += String.fromCharCode(128 + (nChr >>> 6 & 63));
                utftext += String.fromCharCode(128 + (nChr & 63));
            } else if (nChr < 0x4000000) {
                /* five bytes */
                utftext += String.fromCharCode(248 + (nChr >>> 24));
                utftext += String.fromCharCode(128 + (nChr >>> 18 & 63));
                utftext += String.fromCharCode(128 + (nChr >>> 12 & 63));
                utftext += String.fromCharCode(128 + (nChr >>> 6 & 63));
                utftext += String.fromCharCode(128 + (nChr & 63));
            } else /* if (nChr <= 0x7fffffff) */ {
                /* six bytes */
                utftext += String.fromCharCode(252 + /* (nChr >>> 32) is not possible in ECMAScript! So...: */ (nChr / 1073741824));
                utftext += String.fromCharCode(128 + (nChr >>> 24 & 63));
                utftext += String.fromCharCode(128 + (nChr >>> 18 & 63));
                utftext += String.fromCharCode(128 + (nChr >>> 12 & 63));
                utftext += String.fromCharCode(128 + (nChr >>> 6 & 63));
                utftext += String.fromCharCode(128 + (nChr & 63));
            }
        }
        return utftext;
    };

    /**
     * Encodes multi-byte Unicode string to Uint8Array characters
     *
     * @param {String} input Unicode string to be encoded into Uint8Array
     * @returns {String} Uint8Array
     */
    Utf8.encodeToUint8Array = function (input) {
        var aBytes, nChr, nStrLen = input.length, nArrLen = 0;
        /* mapping... */
        for (var nMapIdx = 0; nMapIdx < nStrLen; nMapIdx++) {
            nChr = input.charCodeAt(nMapIdx);
            nArrLen += nChr < 0x80 ? 1 : nChr < 0x800 ? 2 : nChr < 0x10000 ? 3 : nChr < 0x200000 ? 4 : nChr < 0x4000000 ? 5 : 6;
        }
        aBytes = new Uint8Array(nArrLen);
        /* transcription... */
        for (var nIdx = 0, nChrIdx = 0; nIdx < nArrLen; nChrIdx++) {
            nChr = input.charCodeAt(nChrIdx);
            if (nChr < 128) {
                /* one byte */
                aBytes[nIdx++] = nChr;
            } else if (nChr < 0x800) {
                /* two bytes */
                aBytes[nIdx++] = 192 + (nChr >>> 6);
                aBytes[nIdx++] = 128 + (nChr & 63);
            } else if (nChr < 0x10000) {
                /* three bytes */
                aBytes[nIdx++] = 224 + (nChr >>> 12);
                aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                aBytes[nIdx++] = 128 + (nChr & 63);
            } else if (nChr < 0x200000) {
                /* four bytes */
                aBytes[nIdx++] = 240 + (nChr >>> 18);
                aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                aBytes[nIdx++] = 128 + (nChr & 63);
            } else if (nChr < 0x4000000) {
                /* five bytes */
                aBytes[nIdx++] = 248 + (nChr >>> 24);
                aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                aBytes[nIdx++] = 128 + (nChr & 63);
            } else /* if (nChr <= 0x7fffffff) */ {
                /* six bytes */
                aBytes[nIdx++] = 252 + /* (nChr >>> 32) is not possible in ECMAScript! So...: */ (nChr / 1073741824);
                aBytes[nIdx++] = 128 + (nChr >>> 24 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                aBytes[nIdx++] = 128 + (nChr & 63);
            }
        }
        return aBytes;
    };

    /**
     * Decodes utf-8 encoded string to multi-byte Unicode characters
     *
     * @param {String} input UTF-8 string to be decoded into Unicode
     * @returns {String} Unicode string
     */
    Utf8.decode = function (input) {
        var sView = "", nChr, nCode, nStrLen = input.length;
        for (var nChrIdx = 0; nChrIdx < nStrLen; nChrIdx++) {
            nChr = input.charCodeAt(nChrIdx);
            if ((nChr >= 0xfc) && (nChr <= 0xfd) && ((nChrIdx + 5) < nStrLen)) {
                /* six bytes */
                /* (nChr - 252 << 32) is not possible in ECMAScript! So...: */
                nCode = (nChr & 0x01) * 1073741824;
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= ((nChr & 0x3f) << 24);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= ((nChr & 0x3f) << 18);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= ((nChr & 0x3f) << 12);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= ((nChr & 0x3f) << 6);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= (nChr & 0x3f);
                sView += String.fromCharCode(nCode);
            } else if ((nChr >= 0xf8) && (nChr <= 0xfb) && ((nChrIdx + 4) < nStrLen)) {
                /* five bytes */
                nCode = ((nChr & 0x03) << 24);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= ((nChr & 0x3f) << 18);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= ((nChr & 0x3f) << 12);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= ((nChr & 0x3f) << 6);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= (nChr & 0x3f);
                sView += String.fromCharCode(nCode);
            } else if ((nChr >= 0xf0) && (nChr <= 0xf7) && ((nChrIdx + 3) < nStrLen)) {
                /* four bytes */
                nCode = ((nChr & 0x07) << 18);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= ((nChr & 0x3f) << 12);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= ((nChr & 0x3f) << 6);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= (nChr & 0x3f);
                sView += String.fromCharCode(nCode);
            } else if ((nChr >= 0xe0) && (nChr <= 0xef) && ((nChrIdx + 2) < nStrLen)) {
                /* three bytes */
                nCode = ((nChr & 0x0f) << 12);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= ((nChr & 0x3f) << 6);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= (nChr & 0x3f);
                sView += String.fromCharCode(nCode);
            } else if ((nChr >= 0xc0) && (nChr <= 0xdf) && ((nChrIdx + 1) < nStrLen)) {
                /* two bytes */
                nCode = ((nChr & 0x1f) << 6);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= (nChr & 0x3f);
                sView += String.fromCharCode(nCode);
            } else {
                /* one byte */
                sView += String.fromCharCode(nChr & 0x7f);
            }
        }
        return sView;
    };

    /**
     * Decodes Uint8Array to to multi-byte Unicode characters
     *
     * @param {String} aBytes Uint8Array to be decoded into Unicode
     * @returns {String} Unicode string
     */
    Utf8.decodeFromUint8Array = function (aBytes) {
        var sView = "", nPart, nCode, nLen = aBytes.length;
        for (var nIdx = 0; nIdx < nLen; nIdx++) {
            nPart = aBytes[nIdx];
            if ((nPart >= 0xfc) && (nPart <= 0xfd) && ((nIdx + 5) < nLen)) {
                /* six bytes */
                /* (nPart - 252 << 32) is not possible in ECMAScript! So...: */
                nCode = (nPart & 0x01) * 1073741824;
                nPart = aBytes[++nIdx];
                nCode += ((nPart & 0x3f) << 24);
                nPart = aBytes[++nIdx];
                nCode += ((nPart & 0x3f) << 18);
                nPart = aBytes[++nIdx];
                nCode += ((nPart & 0x3f) << 12);
                nPart = aBytes[++nIdx];
                nCode += ((nPart & 0x3f) << 6);
                nPart = aBytes[++nIdx];
                nCode += (nPart & 0x3f);
                sView += String.fromCharCode(nCode);
            } else if ((nPart >= 0xf8) && (nPart <= 0xfb) && ((nIdx + 4) < nLen)) {
                /* five bytes */
                nCode = ((nPart & 0x03) << 24);
                nPart = aBytes[++nIdx];
                nCode += ((nPart & 0x3f) << 18);
                nPart = aBytes[++nIdx];
                nCode += ((nPart & 0x3f) << 12);
                nPart = aBytes[++nIdx];
                nCode += ((nPart & 0x3f) << 6);
                nPart = aBytes[++nIdx];
                nCode += (nPart & 0x3f);
                sView += String.fromCharCode(nCode);
            } else if ((nPart >= 0xf0) && (nPart <= 0xf7) && ((nIdx + 3) < nLen)) {
                /* four bytes */
                nCode = ((nPart & 0x07) << 18);
                nPart = aBytes[++nIdx];
                nCode += ((nPart & 0x3f) << 12);
                nPart = aBytes[++nIdx];
                nCode += ((nPart & 0x3f) << 6);
                nPart = aBytes[++nIdx];
                nCode += (nPart & 0x3f);
                sView += String.fromCharCode(nCode);
            } else if ((nPart >= 0xe0) && (nPart <= 0xef) && ((nIdx + 2) < nLen)) {
                /* three bytes */
                nCode = ((nPart & 0x0f) << 12);
                nPart = aBytes[++nIdx];
                nCode += ((nPart & 0x3f) << 6);
                nPart = aBytes[++nIdx];
                nCode += (nPart & 0x3f);
                sView += String.fromCharCode(nCode);
            } else if ((nPart >= 0xc0) && (nPart <= 0xdf) && ((nIdx + 1) < nLen)) {
                /* two bytes */
                nCode = ((nPart & 0x1f) << 6);
                nPart = aBytes[++nIdx];
                nCode += (nPart & 0x3f);
                sView += String.fromCharCode(nCode);
            } else {
                /* one byte */
                sView += String.fromCharCode(nPart & 0x7f);
            }
        }
        return sView;
    };

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return Utf8;
})(); // Invoke the function immediately to create this class.

'use strict';

// Namespace miapp
var miapp;
if (!miapp) miapp = {};

miapp.Xml = (function()
{
    // Constructor
    function Xml()
    {
        this.version = "0.1";
    }

    // Public API

    Xml.isXml = function (elm) {
        // based on jQuery.isXML function
        var documentElement = (elm ? elm.ownerDocument || elm : 0).documentElement;
        return documentElement ? documentElement.nodeName !== "HTML" : false;
    };

    /**
     * Encodes a XML node to string
     */
    Xml.xml2String = function(xmlNode) {
        // based on http://www.mercurytide.co.uk/news/article/issues-when-working-ajax/
        if (!Xml.isXml(xmlNode)) {
            return false;
        }
        try { // Mozilla, Webkit, Opera
            return new XMLSerializer().serializeToString(xmlNode);
        } catch (E1) {
            try {  // IE
                return xmlNode.xml;
            } catch (E2) {

            }
        }
        return false;
    };

    /**
     * Decodes a XML node from string
     */
    Xml.string2Xml = function(xmlString) {
        // based on http://outwestmedia.com/jquery-plugins/xmldom/
        if (!dom_parser) {
            return false;
        }
        var resultXML = dom_parser.call("DOMParser" in window && (new DOMParser()) || window,
            xmlString, 'text/xml');
        return this.isXml(resultXML) ? resultXML : false;
    };

    // Private API
    // helper functions and variables hidden within this function scope

    var dom_parser = ("DOMParser" in window && (new DOMParser()).parseFromString) ||
        (window.ActiveXObject && function(_xmlString) {
            var xml_doc = new ActiveXObject('Microsoft.XMLDOM');
            xml_doc.async = 'false';
            xml_doc.loadXML(_xmlString);
            return xml_doc;
        });

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return Xml;
})(); // Invoke the function immediately to create this class.

if (typeof angular !== 'undefined')
    angular
        .module('MiappService', [])
        .factory('MiappService', function ($log, $q) {
            return new MiappService($log, $q);
        });

var MiappService = (function() {
    'use strict';

    function Service($log, $q) {
        this.logger = $log;
        this.promise = $q;
        this.miappService = null;
        //this._dbRecordCount = 0;
    }

    Service.prototype.init = function (miappId, miappSalt, isOffline) {
        if (this.miappService) return this.promise.reject('miapp.sdk.angular.init : already initialized.');
        this.miappService = new SrvMiapp(this.logger, this.promise);
        return this.miappService.init(miappId, miappSalt, isOffline);
    };

    Service.prototype.login = function (login, password) {
        if (!this.miappService) return this.promise.reject('miapp.sdk.angular.login : not initialized.');
        return this.miappService.initDBWithLogin(login, password);
    };

    Service.prototype.sync = function (fnInitFirstData) {
        if (!this.miappService) return this.promise.reject('miapp.sdk.angular.sync : not initialized.');
        return this.miappService.syncComplete(fnInitFirstData, this);
    };

    Service.prototype.put = function (data) {
        if (!this.miappService) return this.promise.reject('miapp.sdk.angular.put : not initialized.');
        return this.miappService.putInDb(data);
    };

    Service.prototype.find = function (id) {
        if (!this.miappService) return this.promise.reject('miapp.sdk.angular.find : not initialized.');
        return this.miappService.findInDb(id);
    };

    Service.prototype.findAll = function () {
        if (!this.miappService) return this.promise.reject('miapp.sdk.angular.findAll : not initialized.');
        return this.miappService.findAllInDb();
    };


    Service.prototype._testPromise = function () {
        if (!this.miappService) return this.promise.reject('miapp.sdk.angular.testPromise : not initialized.');
        return this.miappService._testPromise();
    };

    return Service;
})();


var MiappEventable = function() {
    throw Error("'MiappEventable' is not intended to be invoked directly");
};

MiappEventable.prototype = {
    bind: function(event, fn) {
        this._events = this._events || {};
        this._events[event] = this._events[event] || [];
        this._events[event].push(fn);
    },
    unbind: function(event, fn) {
        this._events = this._events || {};
        if (event in this._events === false) return;
        this._events[event].splice(this._events[event].indexOf(fn), 1);
    },
    trigger: function(event) {
        this._events = this._events || {};
        if (event in this._events === false) return;
        for (var i = 0; i < this._events[event].length; i++) {
            this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
        }
    }
};

MiappEventable.mixin = function(destObject) {
    var props = [ "bind", "unbind", "trigger" ];
    for (var i = 0; i < props.length; i++) {
        if (props[i] in destObject.prototype) {
            console.warn("overwriting '" + props[i] + "' on '" + destObject.name + "'.");
            console.warn("the previous version can be found at '_" + props[i] + "' on '" + destObject.name + "'.");
            destObject.prototype["_" + props[i]] = destObject.prototype[props[i]];
        }
        destObject.prototype[props[i]] = MiappEventable.prototype[props[i]];
    }
};

(function (global) {
    var name = "Logger", overwrittenName = global[name], exports;
    /* logging */
    function Logger(name) {
        this.logEnabled = true;
        this.init(name, true);
    }
    Logger.METHODS = [ "log", "error", "warn", "info", "debug", "assert", "clear", "count", "dir", "dirxml", "exception", "group", "groupCollapsed", "groupEnd", "profile", "profileEnd", "table", "time", "timeEnd", "trace" ];
    Logger.prototype.init = function(name, logEnabled) {
        this.name = name || "UNKNOWN";
        this.logEnabled = logEnabled || true;
        var addMethod = function(method) {
            this[method] = this.createLogMethod(method);
        }.bind(this);
        Logger.METHODS.forEach(addMethod);
    };
    Logger.prototype.createLogMethod = function(method) {
        return Logger.prototype.log.bind(this, method);
    };
    Logger.prototype.prefix = function(method, args) {
        var prepend = "[" + method.toUpperCase() + "][" + name + "]:	";
        if ([ "log", "error", "warn", "info" ].indexOf(method) !== -1) {
            if ("string" === typeof args[0]) {
                args[0] = prepend + args[0];
            } else {
                args.unshift(prepend);
            }
        }
        return args;
    };
    Logger.prototype.log = function() {
        var args = [].slice.call(arguments);
        var method = args.shift();
        if (Logger.METHODS.indexOf(method) === -1) {
            method = "log";
        }
        if (!(this.logEnabled && console && console[method])) return;
        args = this.prefix(method, args);
        console[method].apply(console, args);
    };
    Logger.prototype.setLogEnabled = function(logEnabled) {
        this.logEnabled = logEnabled || true;
    };
    Logger.mixin = function(destObject) {
        destObject.__logger = new Logger(destObject.name || "UNKNOWN");
        var addMethod = function(method) {
            if (method in destObject.prototype) {
                console.warn("overwriting '" + method + "' on '" + destObject.name + "'.");
                console.warn("the previous version can be found at '_" + method + "' on '" + destObject.name + "'.");
                destObject.prototype["_" + method] = destObject.prototype[method];
            }
            destObject.prototype[method] = destObject.__logger.createLogMethod(method);
        };
        Logger.METHODS.forEach(addMethod);
    };
    global[name] = Logger;
    global[name].noConflict = function() {
        if (overwrittenName) {
            global[name] = overwrittenName;
        }
        return Logger;
    };
    return global[name];
})(this || window);

(function(global) {
    var name = "MiappPromise", overwrittenName = global[name], exports;

    function MiappPromise() {
        this.complete = false;
        this.error = null;
        this.result = null;
        this.callbacks = [];
    }

    MiappPromise.prototype.then = function (callback, context) {
        var f = function() {
            return callback.apply(context, arguments);
        };
        if (this.complete) {
            f(this.error, this.result);
        } else {
            this.callbacks.push(f);
        }
    };
    MiappPromise.prototype.done = function (error, result) {
        this.complete = true;
        this.error = error;
        this.result = result;
        if (this.callbacks) {
            for (var i = 0; i < this.callbacks.length; i++) this.callbacks[i](error, result);
            this.callbacks.length = 0;
        }
    };
    MiappPromise.join = function (promises) {
        var p = new MiappPromise(), total = promises.length, completed = 0, errors = [], results = [];
        function notifier(i) {
            return function(error, result) {
                completed += 1;
                errors[i] = error;
                results[i] = result;
                if (completed === total) {
                    p.done(errors, results);
                }
            };
        }
        for (var i = 0; i < total; i++) {
            promises[i]().then(notifier(i));
        }
        return p;
    };
    MiappPromise.chain = function (promises, error, result) {
        var p = new MiappPromise();
        if (promises === null || promises.length === 0) {
            p.done(error, result);
        } else {
            promises[0](error, result).then(function(res, err) {
                promises.splice(0, 1);
                if (promises) {
                    MiappPromise.chain(promises, res, err).then(function (r, e) {
                        p.done(r, e);
                    });
                } else {
                    p.done(res, err);
                }
            });
        }
        return p;
    };
    global[name] = MiappPromise;
    global[name].noConflict = function() {
        if (overwrittenName) {
            global[name] = overwrittenName;
        }
        return MiappPromise;
    };
    return global[name];
})(this || window);


(function (global) {
    var name = "Ajax", overwrittenName = global[name], exports;
    function partial() {
        var args = Array.prototype.slice.call(arguments);
        var fn = args.shift();
        return fn.bind(this, args);
    }
    function Ajax() {
        this.logger = new global.Logger(name);
        var self = this;
        function encode(data) {
            var result = "";
            if (typeof data === "string") {
                result = data;
            } else {
                var e = encodeURIComponent;
                for (var i in data) {
                    if (data.hasOwnProperty(i)) {
                        result += "&" + e(i) + "=" + e(data[i]);
                    }
                }
            }
            return result;
        }
        function request(m, u, d, token) {
            var p = new MiappPromise(), timeout;
            self.logger.time(m + " " + u);
            (function(xhr) {
                xhr.onreadystatechange = function() {
                    if (this.readyState === 4) {
                        self.logger.timeEnd(m + " " + u);
                        clearTimeout(timeout);
                        p.done(null, this);
                    }
                };
                xhr.onerror = function(response) {
                    clearTimeout(timeout);
                    p.done(response, null);
                };
                xhr.oncomplete = function(response) {
                    clearTimeout(timeout);
                    self.logger.timeEnd(m + " " + u);
                    self.info("%s request to %s returned %s", m, u, this.status);
                };
                xhr.open(m, u);
                if (d) {
                    if ("object" === typeof d) {
                        d = JSON.stringify(d);
                    }
                    xhr.setRequestHeader("Content-Type", "application/json");
                    xhr.setRequestHeader("Accept", "application/json");

                    //var token = token;//self.getToken();
                    console.log('TODO token : ' + token);
                    //MLE ? xhr.withCredentials = true;
                    //MLE ? if (token) xhr.setRequestHeader('Cookie', "miapptoken=" + token);
                    //if (token) xhr.setRequestHeader('X-CSRF-Token', token);
                }
                timeout = setTimeout(function() {
                    xhr.abort();
                    p.done("API Call timed out.", null);
                }, 3e4);
                xhr.send(encode(d));
            })(new XMLHttpRequest());
            return p;
        }
        this.request = request;
        this.get = partial(request, "GET");
        this.post = partial(request, "POST");
        this.put = partial(request, "PUT");
        this.delete = partial(request, "DELETE");
    }
    global[name] = new Ajax();
    global[name].noConflict = function() {
        if (overwrittenName) {
            global[name] = overwrittenName;
        }
        return exports;
    };
    return global[name];
})(this || window);

/*
 *  This module is a collection of classes designed to make working with
 *  the Appigee App Services API as easy as possible.
 *  Learn more at http://Miapp.com/docs/miapp
 *
 *   Copyright 2012 Miapp Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 *  @author rod simpson (rod@Miapp.com)
 *  @author matt dobson (matt@Miapp.com)
 *  @author ryan bridges (rbridges@Miapp.com)
 */
window.console = window.console || {};

window.console.log = window.console.log || function() {};

function extend(subClass, superClass) {
    var F = function() {};
    F.prototype = superClass.prototype;
    subClass.prototype = new F();
    subClass.prototype.constructor = subClass;
    subClass.superclass = superClass.prototype;
    if (superClass.prototype.constructor == Object.prototype.constructor) {
        superClass.prototype.constructor = superClass;
    }
    return subClass;
}

function propCopy(from, to) {
    for (var prop in from) {
        if (from.hasOwnProperty(prop)) {
            if ("object" === typeof from[prop] && "object" === typeof to[prop]) {
                to[prop] = propCopy(from[prop], to[prop]);
            } else {
                to[prop] = from[prop];
            }
        }
    }
    return to;
}

function NOOP() {}

function isValidUrl(url) {
    if (!url) return false;
    var doc, base, anchor, isValid = false;
    try {
        doc = document.implementation.createHTMLDocument("");
        base = doc.createElement("base");
        base.href = base || window.lo;
        doc.head.appendChild(base);
        anchor = doc.createElement("a");
        anchor.href = url;
        doc.body.appendChild(anchor);
        isValid = !(anchor.href === "");
    } catch (e) {
        console.error(e);
    } finally {
        doc.head.removeChild(base);
        doc.body.removeChild(anchor);
        base = null;
        anchor = null;
        doc = null;
        return isValid;
    }
}

/*
 * Tests if the string is a uuid
 *
 * @public
 * @method isUUID
 * @param {string} uuid The string to test
 * @returns {Boolean} true if string is uuid
 */
var uuidValueRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isUUID(uuid) {
    return !uuid ? false : uuidValueRegex.test(uuid);
}

/*
 *  method to encode the query string parameters
 *
 *  @method encodeParams
 *  @public
 *  @params {object} params - an object of name value pairs that will be urlencoded
 *  @return {string} Returns the encoded string
 */
function encodeParams(params) {
    var queryString;
    if (params && Object.keys(params)) {
        queryString = [].slice.call(arguments).reduce(function(a, b) {
            return a.concat(b instanceof Array ? b : [ b ]);
        }, []).filter(function(c) {
            return "object" === typeof c;
        }).reduce(function(p, c) {
            !(c instanceof Array) ? p = p.concat(Object.keys(c).map(function(key) {
                return [ key, c[key] ];
            })) : p.push(c);
            return p;
        }, []).reduce(function(p, c) {
            c.length === 2 ? p.push(c) : p = p.concat(c);
            return p;
        }, []).reduce(function(p, c) {
            c[1] instanceof Array ? c[1].forEach(function(v) {
                p.push([ c[0], v ]);
            }) : p.push(c);
            return p;
        }, []).map(function(c) {
            c[1] = encodeURIComponent(c[1]);
            return c.join("=");
        }).join("&");
    }
    return queryString;
}

/*
 *  method to determine whether or not the passed variable is a function
 *
 *  @method isFunction
 *  @public
 *  @params {any} f - any variable
 *  @return {boolean} Returns true or false
 */
function isFunction(f) {
    return f && f !== null && typeof f === "function";
}

/*
 *  a safe wrapper for executing a callback
 *
 *  @method doCallback
 *  @public
 *  @params {Function} callback - the passed-in callback method
 *  @params {Array} params - an array of arguments to pass to the callback
 *  @params {Object} context - an optional calling context for the callback
 *  @return Returns whatever would be returned by the callback. or false.
 */
function doCallback(callback, params, context) {
    var returnValue;
    if (isFunction(callback)) {
        if (!params) params = [];
        if (!context) context = this;
        params.push(context);
        returnValue = callback.apply(context, params);
    }
    return returnValue;
}

(function(global) {
    var name = "Miapp", overwrittenName = global[name];
    var VALID_REQUEST_METHODS = [ "GET", "POST", "PUT", "DELETE" ];
    function Miapp() {
        this.logger = new Logger(name);
    }
    Miapp.isValidEndpoint = function(endpoint) {
        return true;
    };
    Miapp.Request = function(method, endpoint, query_params, data, callback) {
        var p = new MiappPromise();
        /*
         Create a logger
         */
        this.logger = new global.Logger("Miapp.Request");
        this.logger.time("process request " + method + " " + endpoint);
        /*
         Validate our input
         */
        this.endpoint = endpoint + "?" + encodeParams(query_params);
        this.method = method.toUpperCase();
        this.data = "object" === typeof data ? JSON.stringify(data) : data;
        if (VALID_REQUEST_METHODS.indexOf(this.method) === -1) {
            throw new MiappInvalidHTTPMethodError("invalid request method '" + this.method + "'");
        }
        /*
         Prepare our request
         */
        if (!isValidUrl(this.endpoint)) {
            this.logger.error(endpoint, this.endpoint, /^https:\/\//.test(endpoint));
            throw new MiappInvalidURIError("The provided endpoint is not valid: " + this.endpoint);
        }
        /* a callback to make the request */
        var token = null;
        if (query_params) token = query_params.access_token;
        var request = function() {
            return Ajax.request(this.method, this.endpoint, this.data, token);
        }.bind(this);
        /* a callback to process the response */
        var response = function(err, request) {
            return new Miapp.Response(err, request);
        }.bind(this);
        /* a callback to clean up and return data to the client */
        var oncomplete = function(err, response) {
            p.done(err, response);
            this.logger.info("REQUEST", err, response);
            doCallback(callback, [ err, response ]);
            this.logger.timeEnd("process request " + method + " " + endpoint);
        }.bind(this);
        /* and a promise to chain them all together */
        MiappPromise.chain([request, response]).then(oncomplete);
        return p;
    };
    Miapp.Response = function(err, response) {
        var p = new MiappPromise();
        var data = null;
        try {
            data = JSON.parse(response.responseText);
        } catch (e) {
            data = {};
        }
        Object.keys(data).forEach(function(key) {
            Object.defineProperty(this, key, {
                value: data[key],
                enumerable: true
            });
        }.bind(this));
        Object.defineProperty(this, "logger", {
            enumerable: false,
            configurable: false,
            writable: false,
            value: new global.Logger(name)
        });
        Object.defineProperty(this, "success", {
            enumerable: false,
            configurable: false,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "err", {
            enumerable: false,
            configurable: false,
            writable: true,
            value: err
        });
        Object.defineProperty(this, "status", {
            enumerable: false,
            configurable: false,
            writable: true,
            value: parseInt(response.status)
        });
        Object.defineProperty(this, "statusGroup", {
            enumerable: false,
            configurable: false,
            writable: true,
            value: this.status - this.status % 100
        });
        switch (this.statusGroup) {
          case 200:
            this.success = true;
            break;

          case 400:
          case 500:
          case 300:
          case 100:
          default:
            this.success = false;
            break;
        }
        if (this.success) {
            p.done(null, this);
        } else {
            p.done(MiappError.fromResponse(data), this);
        }
        return p;
    };
    Miapp.Response.prototype.getEntities = function() {
        var entities;
        if (this.success) {
            entities = this.data ? this.data.entities : this.entities;
        }
        return entities || [];
    };
    Miapp.Response.prototype.getEntity = function() {
        var entities = this.getEntities();
        return entities[0];
    };
    Miapp.VERSION = Miapp.USERGRID_SDK_VERSION = "0.11.0";
    global[name] = Miapp;
    global[name].noConflict = function() {
        if (overwrittenName) {
            global[name] = overwrittenName;
        }
        return Miapp;
    };
    return global[name];
})(this || window);

(function (global) {
    var name = "Client", overwrittenName = global[name], exports;
    var AUTH_ERRORS = [ "auth_expired_session_token", "auth_missing_credentials", "auth_unverified_oath", "expired_token", "unauthorized", "auth_invalid" ];
    Miapp.Client = function(options) {
        //console.log(this);
        this.URI = options.URI;
        if (options.orgName) {
            this.set("orgName", options.orgName);
        }
        if (options.appName) {
            this.set("appName", options.appName);
        }
        if (options.qs) {
            this.setObject("default_qs", options.qs);
        }
        this.buildCurl = options.buildCurl || false;
        this.logging = options.logging || false;
    };
    /*
   *  Main function for making requests to the API.  Can be called directly.
   *
   *  options object:
   *  `method` - http method (GET, POST, PUT, or DELETE), defaults to GET
   *  `qs` - object containing querystring values to be appended to the uri
   *  `body` - object containing entity body for POST and PUT requests
   *  `endpoint` - API endpoint, for example 'users/fred'
   *  `mQuery` - boolean, set to true if running management query, defaults to false
   *
   *  @method request
   *  @public
   *  @params {object} options
   *  @param {function} callback
   *  @return {callback} callback(err, data)
   */
    Miapp.Client.prototype.request = function(options, callback) {
        var method = options.method || "GET";
        var endpoint = options.endpoint;
        var body = options.body || {};
        var qs = options.qs || {};
        var mQuery = options.mQuery || false;
        var orgName = this.get("orgName");
        var appName = this.get("appName");
        var default_qs = this.getObject("default_qs");
        var uri;
        /*var logoutCallback=function(){
        if (typeof(this.logoutCallback) === 'function') {
            return this.logoutCallback(true, 'no_org_or_app_name_specified');
        }
    }.bind(this);*/
        if (!mQuery && !orgName && !appName) {
            return logoutCallback();
        }
        if (mQuery) {
            uri = this.URI + "/" + endpoint;
        } else {
            uri = this.URI + "/" + orgName + "/" + appName + "/" + endpoint;
        }
        if (this.getToken()) {
            qs.access_token = this.getToken();
        }
        if (default_qs) {
            qs = propCopy(qs, default_qs);
        }
        var self = this;
        var req = new Miapp.Request(method, uri, qs, body, function(err, response) {
            /*if (AUTH_ERRORS.indexOf(response.error) !== -1) {
            return logoutCallback();
        }*/
            if (err) {
                doCallback(callback, [ err, response, self ], self);
            } else {
                doCallback(callback, [ null, response, self ], self);
            }
        });
    };
    /*
   *  function for building asset urls
   *
   *  @method buildAssetURL
   *  @public
   *  @params {string} uuid
   *  @return {string} assetURL
   */
    Miapp.Client.prototype.buildAssetURL = function(uuid) {
        var self = this;
        var qs = {};
        var assetURL = this.URI + "/" + this.orgName + "/" + this.appName + "/assets/" + uuid + "/data";
        if (self.getToken()) {
            qs.access_token = self.getToken();
        }
        var encoded_params = encodeParams(qs);
        if (encoded_params) {
            assetURL += "?" + encoded_params;
        }
        return assetURL;
    };
    /*
   *  Main function for creating new groups. Call this directly.
   *
   *  @method createGroup
   *  @public
   *  @params {string} path
   *  @param {function} callback
   *  @return {callback} callback(err, data)
   */
    Miapp.Client.prototype.createGroup = function(options, callback) {
        var group = new Miapp.Group({
            path: options.path,
            client: this,
            data: options
        });
        group.save(function(err, response) {
            doCallback(callback, [ err, response, group ], group);
        });
    };
    /*
   *  Main function for creating new entities - should be called directly.
   *
   *  options object: options {data:{'type':'collection_type', 'key':'value'}, uuid:uuid}}
   *
   *  @method createEntity
   *  @public
   *  @params {object} options
   *  @param {function} callback
   *  @return {callback} callback(err, data)
   */
    Miapp.Client.prototype.createEntity = function(options, callback) {
        var entity = new Miapp.Entity({
            client: this,
            data: options
        });
        entity.save(function(err, response) {
            doCallback(callback, [ err, response, entity ], entity);
        });
    };
    /*
   *  Main function for getting existing entities - should be called directly.
   *
   *  You must supply a uuid or (username or name). Username only applies to users.
   *  Name applies to all custom entities
   *
   *  options object: options {data:{'type':'collection_type', 'name':'value', 'username':'value'}, uuid:uuid}}
   *
   *  @method createEntity
   *  @public
   *  @params {object} options
   *  @param {function} callback
   *  @return {callback} callback(err, data)
   */
    Miapp.Client.prototype.getEntity = function(options, callback) {
        var entity = new Miapp.Entity({
            client: this,
            data: options
        });
        entity.fetch(function(err, response) {
            doCallback(callback, [ err, response, entity ], entity);
        });
    };
    /*
   *  Main function for restoring an entity from serialized data.
   *
   *  serializedObject should have come from entityObject.serialize();
   *
   *  @method restoreEntity
   *  @public
   *  @param {string} serializedObject
   *  @return {object} Entity Object
   */
    Miapp.Client.prototype.restoreEntity = function(serializedObject) {
        var data = JSON.parse(serializedObject);
        var options = {
            client: this,
            data: data
        };
        var entity = new Miapp.Entity(options);
        return entity;
    };
    /*
   *  Main function for creating new counters - should be called directly.
   *
   *  options object: options {timestamp:0, category:'value', counters:{name : value}}
   *
   *  @method createCounter
   *  @public
   *  @params {object} options
   *  @param {function} callback
   *  @return {callback} callback(err, response, counter)
   */
    Miapp.Client.prototype.createCounter = function(options, callback) {
        var counter = new Miapp.Counter({
            client: this,
            data: options
        });
        counter.save(callback);
    };
    /*
   *  Main function for creating new assets - should be called directly.
   *
   *  options object: options {name:"photo.jpg", path:"/user/uploads", "content-type":"image/jpeg", owner:"F01DE600-0000-0000-0000-000000000000", file: FileOrBlobObject }
   *
   *  @method createCounter
   *  @public
   *  @params {object} options
   *  @param {function} callback
   *  @return {callback} callback(err, response, counter)
   */
    Miapp.Client.prototype.createAsset = function(options, callback) {
        var file = options.file;
        if (file) {
            options.name = options.name || file.name;
            options["content-type"] = options["content-type"] || file.type;
            options.path = options.path || "/";
            delete options.file;
        }
        var asset = new Miapp.Asset({
            client: this,
            data: options
        });
        asset.save(function(err, response, asset) {
            if (file && !err) {
                asset.upload(file, callback);
            } else {
                doCallback(callback, [ err, response, asset ], asset);
            }
        });
    };
    /*
   *  Main function for creating new collections - should be called directly.
   *
   *  options object: options {client:client, type: type, qs:qs}
   *
   *  @method createCollection
   *  @public
   *  @params {object} options
   *  @param {function} callback
   *  @return {callback} callback(err, data)
   */
    Miapp.Client.prototype.createCollection = function(options, callback) {
        options.client = this;
        return new Miapp.Collection(options, function(err, data, collection) {
            console.log("createCollection", arguments);
            doCallback(callback, [ err, collection, data ]);
        });
    };
    /*
   *  Main function for restoring a collection from serialized data.
   *
   *  serializedObject should have come from collectionObject.serialize();
   *
   *  @method restoreCollection
   *  @public
   *  @param {string} serializedObject
   *  @return {object} Collection Object
   */
    Miapp.Client.prototype.restoreCollection = function(serializedObject) {
        var data = JSON.parse(serializedObject);
        data.client = this;
        var collection = new Miapp.Collection(data);
        return collection;
    };
    /*
   *  Main function for retrieving a user's activity feed.
   *
   *  @method getFeedForUser
   *  @public
   *  @params {string} username
   *  @param {function} callback
   *  @return {callback} callback(err, data, activities)
   */
    Miapp.Client.prototype.getFeedForUser = function(username, callback) {
        var options = {
            method: "GET",
            endpoint: "users/" + username + "/feed"
        };
        this.request(options, function(err, data) {
            if (err) {
                doCallback(callback, [ err ]);
            } else {
                doCallback(callback, [ err, data, data.getEntities() ]);
            }
        });
    };
    /*
   *  Function for creating new activities for the current user - should be called directly.
   *
   *  //user can be any of the following: "me", a uuid, a username
   *  Note: the "me" alias will reference the currently logged in user (e.g. 'users/me/activties')
   *
   *  //build a json object that looks like this:
   *  var options =
   *  {
   *    "actor" : {
   *      "displayName" :"myusername",
   *      "uuid" : "myuserid",
   *      "username" : "myusername",
   *      "email" : "myemail",
   *      "picture": "http://path/to/picture",
   *      "image" : {
   *          "duration" : 0,
   *          "height" : 80,
   *          "url" : "http://www.gravatar.com/avatar/",
   *          "width" : 80
   *      },
   *    },
   *    "verb" : "post",
   *    "content" : "My cool message",
   *    "lat" : 48.856614,
   *    "lon" : 2.352222
   *  }
   *
   *  @method createEntity
   *  @public
   *  @params {string} user // "me", a uuid, or a username
   *  @params {object} options
   *  @param {function} callback
   *  @return {callback} callback(err, data)
   */
    Miapp.Client.prototype.createUserActivity = function(user, options, callback) {
        options.type = "users/" + user + "/activities";
        options = {
            client: this,
            data: options
        };
        var entity = new Miapp.Entity(options);
        entity.save(function(err, data) {
            doCallback(callback, [ err, data, entity ]);
        });
    };
    /*
   *  Function for creating user activities with an associated user entity.
   *
   *  user object:
   *  The user object passed into this function is an instance of Miapp.Entity.
   *
   *  @method createUserActivityWithEntity
   *  @public
   *  @params {object} user
   *  @params {string} content
   *  @param {function} callback
   *  @return {callback} callback(err, data)
   */
    Miapp.Client.prototype.createUserActivityWithEntity = function(user, content, callback) {
        var username = user.get("username");
        var options = {
            actor: {
                displayName: username,
                uuid: user.get("uuid"),
                username: username,
                email: user.get("email"),
                picture: user.get("picture"),
                image: {
                    duration: 0,
                    height: 80,
                    url: user.get("picture"),
                    width: 80
                }
            },
            verb: "post",
            content: content
        };
        this.createUserActivity(username, options, callback);
    };
    /*
   *  A private method to get call timing of last call
   */
    Miapp.Client.prototype.calcTimeDiff = function() {
        var seconds = 0;
        var time = this._end - this._start;
        try {
            seconds = (time / 10 / 60).toFixed(2);
        } catch (e) {
            return 0;
        }
        return seconds;
    };
    /*
   *  A public method to store the OAuth token for later use - uses localstorage if available
   *
   *  @method setToken
   *  @public
   *  @params {string} token
   *  @return none
   */
    Miapp.Client.prototype.setToken = function(token) {
        this.set("token", token);
    };

    Miapp.Client.prototype.setEndpoint = function(endpoint) {
        this.set("endpoint", endpoint);
    };
    
    Miapp.Client.prototype.setUserId = function(userId) {
        this.set("userid", userId);
    };
    Miapp.Client.prototype.setAppId = function(appId) {
        this.set("miappid", appId);
    };
    
    


    /*
   *  A public method to get the OAuth token
   *
   *  @method getToken
   *  @public
   *  @return {string} token
   */
    Miapp.Client.prototype.getToken = function() {
        return this.get("token");
    };

    Miapp.Client.prototype.getEndpoint = function() {
        return this.get("endpoint");
    };
    
    Miapp.Client.prototype.getUserId = function() {
        return this.get("userid");
    };
    Miapp.Client.prototype.getAppId = function() {
        return this.get("miappid");
    };

    Miapp.Client.prototype.setObject = function(key, value) {
        if (value) {
            value = JSON.stringify(value);
        }
        this.set(key, value);
    };
    Miapp.Client.prototype.set = function(key, value) {
        var keyStore = "apigee_" + key;
        this[key] = value;
        if (typeof Storage !== "undefined") {
            if (value) {
                localStorage.setItem(keyStore, value);
            } else {
                localStorage.removeItem(keyStore);
            }
        }
    };
    Miapp.Client.prototype.getObject = function(key) {
        return JSON.parse(this.get(key));
    };
    Miapp.Client.prototype.get = function(key) {
        var keyStore = "apigee_" + key;
        var value = null;
        if (this[key]) {
            value = this[key];
        } else if (typeof Storage !== "undefined") {
            value = localStorage.getItem(keyStore);
        }
        return value;
    };
    /*
   * A public facing helper method for signing up users
   *
   * @method signup
   * @public
   * @params {string} username
   * @params {string} password
   * @params {string} email
   * @params {string} name
   * @param {function} callback
   * @return {callback} callback(err, data)
   */
    Miapp.Client.prototype.signup = function(username, password, email, name, callback) {
        var self = this;
        var options = {
            type: "users",
            username: username,
            password: password,
            email: email,
            name: name
        };
        this.createEntity(options, callback);
    };
    /*
   *
   *  A public method to log in an app user - stores the token for later use
   *
   *  @method login
   *  @public
   *  @params {string} username
   *  @params {string} password
   *  @param {function} callback
   *  @return {callback} callback(err, data)
   */
    Miapp.Client.prototype.login = function(username, password, callback) {
        var self = this;
        var options = {
            method: "POST",
            endpoint: "token",
            body: {
                username: username,
                password: password,
                grant_type: "password"
            }
        };
        self.request(options, function(err, response) {
            var user = {};
            if (err) {
                if (self.logging) console.log("error trying to log user in");
            } else {
                var options = {
                    client: self,
                    data: response.user
                };
                user = new Miapp.Entity(options);
                self.setToken(response.access_token);
            }
            doCallback(callback, [ err, response, user ]);
        });
    };


    Miapp.Client.prototype.authMLE = function(callback) {
        var self = this;
        var userId = self.getUserId();
        var appId = self.getAppId();
        
        
        // var cookieToken = Token.encryptTokenData('apifootoken');
        // request(app).post('/api/auth').set('Cookie', 'miapptoken=' + cookieToken)
        
        var options = {
            method: "POST",
            mQuery: true,
            endpoint: "auth",
            body: {
                userId: userId,
                appId: appId,
                userSrc: 'miapp_fwk'
            }
        };


        self.request(options, function(err, response) {
            var user = {};
            if (err) {
                if (self.logging) console.log("error trying to auth user in");
            } else {
                var options = {
                    client: self,
                    data: { _id : userId }
                };
                user = new Miapp.Entity(options);
                self.setToken(response.authToken);
                self.setEndpoint(response.endpoint);
            }
            doCallback(callback, [ err, response, user ]);
        });
    };


    Miapp.Client.prototype.loginMLE = function(appid, login, password, updateProperties, callback) {
        var self = this;
        
        self.setAppId(appid);
            
        var options = {
            method: "POST",
            mQuery: true,
            endpoint: "users",
            body: {
                name: login,
                username: login,
                email: login,
                password: password,
                grant_type: "password"
            }
        };


        self.request(options, function(err, response) {
            /*var user = {};
            if (err) {
                if (self.logging) console.log("error trying to log user in");
            } else {
                var options = {
                    client: self,
                    data: { _id : response._id }
                };
                user = new Miapp.Entity(options);
                self.setToken(response.authToken);
                self.setEndpoint(response.endpoint);
            }
            doCallback(callback, [ err, response, user ]);*/
            
                self.setToken(password); //FIX //TODO resolve double auth
                self.setUserId(response._id);
            return self.authMLE(callback);
        });
    };


    Miapp.Client.prototype.deleteUserMLE = function(userIDToDelete, callback) {
        var self = this;
        var options = {
            method: "DELETE",
            mQuery: true,
            endpoint: "users/"+userIDToDelete
        };

        // 1) userId + (cookie) src && version  && valid token 2) body vide + 204
        self.request(options, function(err, response) {
            if (err && self.logging) console.log("error trying to log user in");

            doCallback(callback, [ err, response ]);
        });
    };



    Miapp.Client.prototype.reAuthenticateLite = function(callback) {
        var self = this;
        var options = {
            method: "GET",
            endpoint: "management/me",
            mQuery: true
        };
        this.request(options, function(err, response) {
            if (err && self.logging) {
                console.log("error trying to re-authenticate user");
            } else {
                self.setToken(response.data.access_token);
            }
            doCallback(callback, [ err ]);
        });
    };
    Miapp.Client.prototype.reAuthenticate = function(email, callback) {
        var self = this;
        var options = {
            method: "GET",
            endpoint: "management/users/" + email,
            mQuery: true
        };
        this.request(options, function(err, response) {
            var organizations = {};
            var applications = {};
            var user = {};
            var data;
            if (err && self.logging) {
                console.log("error trying to full authenticate user");
            } else {
                data = response.data;
                self.setToken(data.token);
                self.set("email", data.email);
                localStorage.setItem("accessToken", data.token);
                localStorage.setItem("userUUID", data.uuid);
                localStorage.setItem("userEmail", data.email);
                var userData = {
                    username: data.username,
                    email: data.email,
                    name: data.name,
                    uuid: data.uuid
                };
                var options = {
                    client: self,
                    data: userData
                };
                user = new Miapp.Entity(options);
                organizations = data.organizations;
                var org = "";
                try {
                    var existingOrg = self.get("orgName");
                    org = organizations[existingOrg] ? organizations[existingOrg] : organizations[Object.keys(organizations)[0]];
                    self.set("orgName", org.name);
                } catch (e) {
                    err = true;
                    if (self.logging) {
                        console.log("error selecting org");
                    }
                }
                applications = self.parseApplicationsArray(org);
                self.selectFirstApp(applications);
                self.setObject("organizations", organizations);
                self.setObject("applications", applications);
            }
            doCallback(callback, [ err, data, user, organizations, applications ], self);
        });
    };
    /*
   *  A public method to log in an app user with facebook - stores the token for later use
   *
   *  @method loginFacebook
   *  @public
   *  @params {string} username
   *  @params {string} password
   *  @param {function} callback
   *  @return {callback} callback(err, data)
   */
    Miapp.Client.prototype.loginFacebook = function(facebookToken, callback) {
        var self = this;
        var options = {
            method: "GET",
            endpoint: "auth/facebook",
            qs: {
                fb_access_token: facebookToken
            }
        };
        this.request(options, function(err, data) {
            var user = {};
            if (err && self.logging) {
                console.log("error trying to log user in");
            } else {
                var options = {
                    client: self,
                    data: data.user
                };
                user = new Miapp.Entity(options);
                self.setToken(data.access_token);
            }
            doCallback(callback, [ err, data, user ], self);
        });
    };
    /*
   *  A public method to get the currently logged in user entity
   *
   *  @method getLoggedInUser
   *  @public
   *  @param {function} callback
   *  @return {callback} callback(err, data)
   */
    Miapp.Client.prototype.getLoggedInUser = function(callback) {
        var self = this;
        if (!this.getToken()) {
            doCallback(callback, [ new MiappError("Access Token not set"), null, self ], self);
        } else {
            var options = {
                method: "GET",
                endpoint: "users/me"
            };
            this.request(options, function(err, response) {
                if (err) {
                    if (self.logging) {
                        console.log("error trying to log user in");
                    }
                    console.error(err, response);
                    doCallback(callback, [ err, response, self ], self);
                } else {
                    var options = {
                        client: self,
                        data: response.getEntity()
                    };
                    var user = new Miapp.Entity(options);
                    doCallback(callback, [ null, response, user ], self);
                }
            });
        }
    };
    /*
   *  A public method to test if a user is logged in - does not guarantee that the token is still valid,
   *  but rather that one exists
   *
   *  @method isLoggedIn
   *  @public
   *  @return {boolean} Returns true the user is logged in (has token and uuid), false if not
   */
    Miapp.Client.prototype.isLoggedIn = function() {
        var token = this.getToken();
        return "undefined" !== typeof token && token !== null;
    };
    /*
   *  A public method to log out an app user - clears all user fields from client
   *
   *  @method logout
   *  @public
   *  @return none
   */
    Miapp.Client.prototype.logout = function() {
        this.setToken();
    };
    /*
   *  A public method to destroy access tokens on the server
   *
   *  @method logout
   *  @public
   *  @param {string} username	the user associated with the token to revoke
   *  @param {string} token set to 'null' to revoke the token of the currently logged in user
   *    or set to token value to revoke a specific token
   *  @param {string} revokeAll set to 'true' to revoke all tokens for the user
   *  @return none
   */
    Miapp.Client.prototype.destroyToken = function(username, token, revokeAll, callback) {
        var options = {
            client: self,
            method: "PUT"
        };
        if (revokeAll === true) {
            options.endpoint = "users/" + username + "/revoketokens";
        } else if (token === null) {
            options.endpoint = "users/" + username + "/revoketoken?token=" + this.getToken();
        } else {
            options.endpoint = "users/" + username + "/revoketoken?token=" + token;
        }
        this.request(options, function(err, data) {
            if (err) {
                if (self.logging) {
                    console.log("error destroying access token");
                }
                doCallback(callback, [ err, data, null ], self);
            } else {
                if (revokeAll === true) {
                    console.log("all user tokens invalidated");
                } else {
                    console.log("token invalidated");
                }
                doCallback(callback, [ err, data, null ], self);
            }
        });
    };
    /*
   *  A public method to log out an app user - clears all user fields from client
   *  and destroys the access token on the server.
   *
   *  @method logout
   *  @public
   *  @param {string} username the user associated with the token to revoke
   *  @param {string} token set to 'null' to revoke the token of the currently logged in user
   *   or set to token value to revoke a specific token
   *  @param {string} revokeAll set to 'true' to revoke all tokens for the user
   *  @return none
   */
    Miapp.Client.prototype.logoutAndDestroyToken = function(username, token, revokeAll, callback) {
        if (username === null) {
            console.log("username required to revoke tokens");
        } else {
            this.destroyToken(username, token, revokeAll, callback);
            if (revokeAll === true || token === this.getToken() || token === null) {
                this.setToken(null);
            }
        }
    };
    /*
   *  A private method to build the curl call to display on the command line
   *
   *  @method buildCurlCall
   *  @private
   *  @param {object} options
   *  @return {string} curl
   */
    Miapp.Client.prototype.buildCurlCall = function(options) {
        var curl = [ "curl" ];
        var method = (options.method || "GET").toUpperCase();
        var body = options.body;
        var uri = options.uri;
        curl.push("-X");
        curl.push([ "POST", "PUT", "DELETE" ].indexOf(method) >= 0 ? method : "GET");
        curl.push(uri);
        if ("object" === typeof body && Object.keys(body).length > 0 && [ "POST", "PUT" ].indexOf(method) !== -1) {
            curl.push("-d");
            curl.push("'" + JSON.stringify(body) + "'");
        }
        curl = curl.join(" ");
        console.log(curl);
        return curl;
    };
    Miapp.Client.prototype.getDisplayImage = function(email, picture, size) {
        size = size || 50;
        var image = "https://apigee.com/miapp/images/user_profile.png";
        try {
            if (picture) {
                image = picture;
            } else if (email.length) {
                image = "https://secure.gravatar.com/avatar/" + MD5(email) + "?s=" + size + encodeURI("&d=https://apigee.com/miapp/images/user_profile.png");
            }
        } catch (e) {} finally {
            return image;
        }
    };
    global[name] = Miapp.Client;
    global[name].noConflict = function() {
        if (overwrittenName) {
            global[name] = overwrittenName;
        }
        return exports;
    };
    return global[name];
})(this || window);

var ENTITY_SYSTEM_PROPERTIES = [ "metadata", "created", "modified", "oldpassword", "newpassword", "type", "activated", "uuid" ];

/*
 *  A class to Model a Miapp Entity.
 *  Set the type and uuid of entity in the 'data' json object
 *
 *  @constructor
 *  @param {object} options {client:client, data:{'type':'collection_type', uuid:'uuid', 'key':'value'}}
 */
Miapp.Entity = function(options) {
    this._data = {};
    this._client = undefined;
    if (options) {
        this.set(options.data || {});
        this._client = options.client || {};
    }
};

/*
 *  method to determine whether or not the passed variable is a Miapp Entity
 *
 *  @method isEntity
 *  @public
 *  @params {any} obj - any variable
 *  @return {boolean} Returns true or false
 */
Miapp.Entity.isEntity = function(obj) {
    return obj && obj instanceof Miapp.Entity;
};

/*
 *  method to determine whether or not the passed variable is a Miapp Entity
 *  That has been saved.
 *
 *  @method isPersistedEntity
 *  @public
 *  @params {any} obj - any variable
 *  @return {boolean} Returns true or false
 */
Miapp.Entity.isPersistedEntity = function(obj) {
    return isEntity(obj) && isUUID(obj.get("uuid"));
};

/*
 *  returns a serialized version of the entity object
 *
 *  Note: use the client.restoreEntity() function to restore
 *
 *  @method serialize
 *  @return {string} data
 */
Miapp.Entity.prototype.serialize = function() {
    return JSON.stringify(this._data);
};

/*
 *  gets a specific field or the entire data object. If null or no argument
 *  passed, will return all data, else, will return a specific field
 *
 *  @method get
 *  @param {string} field
 *  @return {string} || {object} data
 */
Miapp.Entity.prototype.get = function(key) {
    var value;
    if (arguments.length === 0) {
        value = this._data;
    } else if (arguments.length > 1) {
        key = [].slice.call(arguments).reduce(function(p, c, i, a) {
            if (c instanceof Array) {
                p = p.concat(c);
            } else {
                p.push(c);
            }
            return p;
        }, []);
    }
    if (key instanceof Array) {
        var self = this;
        value = key.map(function(k) {
            return self.get(k);
        });
    } else if ("undefined" !== typeof key) {
        value = this._data[key];
    }
    return value;
};

/*
 *  adds a specific key value pair or object to the Entity's data
 *  is additive - will not overwrite existing values unless they
 *  are explicitly specified
 *
 *  @method set
 *  @param {string} key || {object}
 *  @param {string} value
 *  @return none
 */
Miapp.Entity.prototype.set = function(key, value) {
    if (typeof key === "object") {
        for (var field in key) {
            this._data[field] = key[field];
        }
    } else if (typeof key === "string") {
        if (value === null) {
            delete this._data[key];
        } else {
            this._data[key] = value;
        }
    } else {
        this._data = {};
    }
};

Miapp.Entity.prototype.getEndpoint = function() {
    var type = this.get("type"), nameProperties = [ "uuid", "name" ], name;
    if (type === undefined) {
        throw new MiappError("cannot fetch entity, no entity type specified", "no_type_specified");
    } else if (/^users?$/.test(type)) {
        nameProperties.unshift("username");
    }
    name = this.get(nameProperties).filter(function(x) {
        return x !== null && "undefined" !== typeof x;
    }).shift();
    return name ? [ type, name ].join("/") : type;
};

/*
 *  Saves the entity back to the database
 *
 *  @method save
 *  @public
 *  @param {function} callback
 *  @return {callback} callback(err, response, self)
 */
Miapp.Entity.prototype.save = function(callback) {
    var self = this, type = this.get("type"), method = "POST", entityId = this.get("uuid"), changePassword, entityData = this.get(), options = {
        method: method,
        endpoint: type
    };
    if (entityId) {
        options.method = "PUT";
        options.endpoint += "/" + entityId;
    }
    options.body = Object.keys(entityData).filter(function(key) {
        return ENTITY_SYSTEM_PROPERTIES.indexOf(key) === -1;
    }).reduce(function(data, key) {
        data[key] = entityData[key];
        return data;
    }, {});
    self._client.request(options, function(err, response) {
        var entity = response.getEntity();
        if (entity) {
            self.set(entity);
            self.set("type", /^\//.test(response.path) ? response.path.substring(1) : response.path);
        }
        if (err && self._client.logging) {
            console.log("could not save entity");
        }
        doCallback(callback, [ err, response, self ], self);
    });
};

/*
 *
 * Updates the user's password
 */
Miapp.Entity.prototype.changePassword = function(oldpassword, newpassword, callback) {
    var self = this;
    if ("function" === typeof oldpassword && callback === undefined) {
        callback = oldpassword;
        oldpassword = self.get("oldpassword");
        newpassword = self.get("newpassword");
    }
    self.set({
        password: null,
        oldpassword: null,
        newpassword: null
    });
    if (/^users?$/.test(self.get("type")) && oldpassword && newpassword) {
        var options = {
            method: "PUT",
            endpoint: "users/" + self.get("uuid") + "/password",
            body: {
                uuid: self.get("uuid"),
                username: self.get("username"),
                oldpassword: oldpassword,
                newpassword: newpassword
            }
        };
        self._client.request(options, function(err, response) {
            if (err && self._client.logging) {
                console.log("could not update user");
            }
            doCallback(callback, [ err, response, self ], self);
        });
    } else {
        throw new MiappInvalidArgumentError("Invalid arguments passed to 'changePassword'");
    }
};

/*
 *  refreshes the entity by making a GET call back to the database
 *
 *  @method fetch
 *  @public
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 */
Miapp.Entity.prototype.fetch = function(callback) {
    var endpoint, self = this;
    endpoint = this.getEndpoint();
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function(err, response) {
        var entity = response.getEntity();
        if (entity) {
            self.set(entity);
        }
        doCallback(callback, [ err, response, self ], self);
    });
};

/*
 *  deletes the entity from the database - will only delete
 *  if the object has a valid uuid
 *
 *  @method destroy
 *  @public
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 *
 */
Miapp.Entity.prototype.destroy = function(callback) {
    var self = this;
    var endpoint = this.getEndpoint();
    var options = {
        method: "DELETE",
        endpoint: endpoint
    };
    this._client.request(options, function(err, response) {
        if (!err) {
            self.set(null);
        }
        doCallback(callback, [ err, response, self ], self);
    });
};

/*
 *  connects one entity to another
 *
 *  @method connect
 *  @public
 *  @param {string} connection
 *  @param {object} entity
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 *
 */
Miapp.Entity.prototype.connect = function(connection, entity, callback) {
    this.addOrRemoveConnection("POST", connection, entity, callback);
};

/*
 *  disconnects one entity from another
 *
 *  @method disconnect
 *  @public
 *  @param {string} connection
 *  @param {object} entity
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 *
 */
Miapp.Entity.prototype.disconnect = function(connection, entity, callback) {
    this.addOrRemoveConnection("DELETE", connection, entity, callback);
};

/*
 *  adds or removes a connection between two entities
 *
 *  @method addOrRemoveConnection
 *  @public
 *  @param {string} method
 *  @param {string} connection
 *  @param {object} entity
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 *
 */
Miapp.Entity.prototype.addOrRemoveConnection = function(method, connection, entity, callback) {
    var self = this;
    if ([ "POST", "DELETE" ].indexOf(method.toUpperCase()) == -1) {
        throw new MiappInvalidArgumentError("invalid method for connection call. must be 'POST' or 'DELETE'");
    }
    var connecteeType = entity.get("type");
    var connectee = this.getEntityId(entity);
    if (!connectee) {
        throw new MiappInvalidArgumentError("connectee could not be identified");
    }
    var connectorType = this.get("type");
    var connector = this.getEntityId(this);
    if (!connector) {
        throw new MiappInvalidArgumentError("connector could not be identified");
    }
    var endpoint = [ connectorType, connector, connection, connecteeType, connectee ].join("/");
    var options = {
        method: method,
        endpoint: endpoint
    };
    this._client.request(options, function(err, response) {
        if (err && self._client.logging) {
            console.log("There was an error with the connection call");
        }
        doCallback(callback, [ err, response, self ], self);
    });
};

/*
 *  returns a unique identifier for an entity
 *
 *  @method connect
 *  @public
 *  @param {object} entity
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 *
 */
Miapp.Entity.prototype.getEntityId = function(entity) {
    var id;
    if (isUUID(entity.get("uuid"))) {
        id = entity.get("uuid");
    } else if (this.get("type") === "users" || this.get("type") === "user") {
        id = entity.get("username");
    } else {
        id = entity.get("name");
    }
    return id;
};

/*
 *  gets an entities connections
 *
 *  @method getConnections
 *  @public
 *  @param {string} connection
 *  @param {object} entity
 *  @param {function} callback
 *  @return {callback} callback(err, data, connections)
 *
 */
Miapp.Entity.prototype.getConnections = function(connection, callback) {
    var self = this;
    var connectorType = this.get("type");
    var connector = this.getEntityId(this);
    if (!connector) {
        if (typeof callback === "function") {
            var error = "Error in getConnections - no uuid specified.";
            if (self._client.logging) {
                console.log(error);
            }
            doCallback(callback, [ true, error ], self);
        }
        return;
    }
    var endpoint = connectorType + "/" + connector + "/" + connection + "/";
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function(err, data) {
        if (err && self._client.logging) {
            console.log("entity could not be connected");
        }
        self[connection] = {};
        var length = data && data.entities ? data.entities.length : 0;
        for (var i = 0; i < length; i++) {
            if (data.entities[i].type === "user") {
                self[connection][data.entities[i].username] = data.entities[i];
            } else {
                self[connection][data.entities[i].name] = data.entities[i];
            }
        }
        doCallback(callback, [ err, data, data.entities ], self);
    });
};

Miapp.Entity.prototype.getGroups = function(callback) {
    var self = this;
    var endpoint = "users" + "/" + this.get("uuid") + "/groups";
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function(err, data) {
        if (err && self._client.logging) {
            console.log("entity could not be connected");
        }
        self.groups = data.entities;
        doCallback(callback, [ err, data, data.entities ], self);
    });
};

Miapp.Entity.prototype.getActivities = function(callback) {
    var self = this;
    var endpoint = this.get("type") + "/" + this.get("uuid") + "/activities";
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function(err, data) {
        if (err && self._client.logging) {
            console.log("entity could not be connected");
        }
        for (var entity in data.entities) {
            data.entities[entity].createdDate = new Date(data.entities[entity].created).toUTCString();
        }
        self.activities = data.entities;
        doCallback(callback, [ err, data, data.entities ], self);
    });
};

Miapp.Entity.prototype.getFollowing = function(callback) {
    var self = this;
    var endpoint = "users" + "/" + this.get("uuid") + "/following";
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function(err, data) {
        if (err && self._client.logging) {
            console.log("could not get user following");
        }
        for (var entity in data.entities) {
            data.entities[entity].createdDate = new Date(data.entities[entity].created).toUTCString();
            var image = self._client.getDisplayImage(data.entities[entity].email, data.entities[entity].picture);
            data.entities[entity]._portal_image_icon = image;
        }
        self.following = data.entities;
        doCallback(callback, [ err, data, data.entities ], self);
    });
};

Miapp.Entity.prototype.getFollowers = function(callback) {
    var self = this;
    var endpoint = "users" + "/" + this.get("uuid") + "/followers";
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function(err, data) {
        if (err && self._client.logging) {
            console.log("could not get user followers");
        }
        for (var entity in data.entities) {
            data.entities[entity].createdDate = new Date(data.entities[entity].created).toUTCString();
            var image = self._client.getDisplayImage(data.entities[entity].email, data.entities[entity].picture);
            data.entities[entity]._portal_image_icon = image;
        }
        self.followers = data.entities;
        doCallback(callback, [ err, data, data.entities ], self);
    });
};

Miapp.Client.prototype.createRole = function(roleName, permissions, callback) {
    var options = {
        type: "role",
        name: roleName
    };
    this.createEntity(options, function(err, response, entity) {
        if (err) {
            doCallback(callback, [ err, response, self ]);
        } else {
            entity.assignPermissions(permissions, function(err, data) {
                if (err) {
                    doCallback(callback, [ err, response, self ]);
                } else {
                    doCallback(callback, [ err, data, data.data ], self);
                }
            });
        }
    });
};

Miapp.Entity.prototype.getRoles = function(callback) {
    var self = this;
    var endpoint = this.get("type") + "/" + this.get("uuid") + "/roles";
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function(err, data) {
        if (err && self._client.logging) {
            console.log("could not get user roles");
        }
        self.roles = data.entities;
        doCallback(callback, [ err, data, data.entities ], self);
    });
};

Miapp.Entity.prototype.assignRole = function(roleName, callback) {
    var self = this;
    var type = self.get("type");
    var collection = type + "s";
    var entityID;
    if (type == "user" && this.get("username") != null) {
        entityID = self.get("username");
    } else if (type == "group" && this.get("name") != null) {
        entityID = self.get("name");
    } else if (this.get("uuid") != null) {
        entityID = self.get("uuid");
    }
    if (type != "users" && type != "groups") {
        doCallback(callback, [ new MiappError("entity must be a group or user", "invalid_entity_type"), null, this ], this);
    }
    var endpoint = "roles/" + roleName + "/" + collection + "/" + entityID;
    var options = {
        method: "POST",
        endpoint: endpoint
    };
    this._client.request(options, function(err, response) {
        if (err) {
            console.log("Could not assign role.");
        }
        doCallback(callback, [ err, response, self ]);
    });
};

Miapp.Entity.prototype.removeRole = function(roleName, callback) {
    var self = this;
    var type = self.get("type");
    var collection = type + "s";
    var entityID;
    if (type == "user" && this.get("username") != null) {
        entityID = this.get("username");
    } else if (type == "group" && this.get("name") != null) {
        entityID = this.get("name");
    } else if (this.get("uuid") != null) {
        entityID = this.get("uuid");
    }
    if (type != "users" && type != "groups") {
        doCallback(callback, [ new MiappError("entity must be a group or user", "invalid_entity_type"), null, this ], this);
    }
    var endpoint = "roles/" + roleName + "/" + collection + "/" + entityID;
    var options = {
        method: "DELETE",
        endpoint: endpoint
    };
    this._client.request(options, function(err, response) {
        if (err) {
            console.log("Could not assign role.");
        }
        doCallback(callback, [ err, response, self ]);
    });
};

Miapp.Entity.prototype.assignPermissions = function(permissions, callback) {
    var self = this;
    var entityID;
    var type = this.get("type");
    if (type != "user" && type != "users" && type != "group" && type != "groups" && type != "role" && type != "roles") {
        doCallback(callback, [ new MiappError("entity must be a group, user, or role", "invalid_entity_type"), null, this ], this);
    }
    if (type == "user" && this.get("username") != null) {
        entityID = this.get("username");
    } else if (type == "group" && this.get("name") != null) {
        entityID = this.get("name");
    } else if (this.get("uuid") != null) {
        entityID = this.get("uuid");
    }
    var endpoint = type + "/" + entityID + "/permissions";
    var options = {
        method: "POST",
        endpoint: endpoint,
        body: {
            permission: permissions
        }
    };
    this._client.request(options, function(err, data) {
        if (err && self._client.logging) {
            console.log("could not assign permissions");
        }
        doCallback(callback, [ err, data, data.data ], self);
    });
};

Miapp.Entity.prototype.removePermissions = function(permissions, callback) {
    var self = this;
    var entityID;
    var type = this.get("type");
    if (type != "user" && type != "users" && type != "group" && type != "groups" && type != "role" && type != "roles") {
        doCallback(callback, [ new MiappError("entity must be a group, user, or role", "invalid_entity_type"), null, this ], this);
    }
    if (type == "user" && this.get("username") != null) {
        entityID = this.get("username");
    } else if (type == "group" && this.get("name") != null) {
        entityID = this.get("name");
    } else if (this.get("uuid") != null) {
        entityID = this.get("uuid");
    }
    var endpoint = type + "/" + entityID + "/permissions";
    var options = {
        method: "DELETE",
        endpoint: endpoint,
        qs: {
            permission: permissions
        }
    };
    this._client.request(options, function(err, data) {
        if (err && self._client.logging) {
            console.log("could not remove permissions");
        }
        doCallback(callback, [ err, data, data.params.permission ], self);
    });
};

Miapp.Entity.prototype.getPermissions = function(callback) {
    var self = this;
    var endpoint = this.get("type") + "/" + this.get("uuid") + "/permissions";
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function(err, data) {
        if (err && self._client.logging) {
            console.log("could not get user permissions");
        }
        var permissions = [];
        if (data.data) {
            var perms = data.data;
            var count = 0;
            for (var i in perms) {
                count++;
                var perm = perms[i];
                var parts = perm.split(":");
                var ops_part = "";
                var path_part = parts[0];
                if (parts.length > 1) {
                    ops_part = parts[0];
                    path_part = parts[1];
                }
                ops_part = ops_part.replace("*", "get,post,put,delete");
                var ops = ops_part.split(",");
                var ops_object = {};
                ops_object.get = "no";
                ops_object.post = "no";
                ops_object.put = "no";
                ops_object.delete = "no";
                for (var j in ops) {
                    ops_object[ops[j]] = "yes";
                }
                permissions.push({
                    operations: ops_object,
                    path: path_part,
                    perm: perm
                });
            }
        }
        self.permissions = permissions;
        doCallback(callback, [ err, data, data.entities ], self);
    });
};

/*
 *  The Collection class models Miapp Collections.  It essentially
 *  acts as a container for holding Entity objects, while providing
 *  additional funcitonality such as paging, and saving
 *
 *  @constructor
 *  @param {string} options - configuration object
 *  @return {Collection} collection
 */
Miapp.Collection = function(options) {
    if (options) {
        this._client = options.client;
        this._type = options.type;
        this.qs = options.qs || {};
        this._list = options.list || [];
        this._iterator = options.iterator || -1;
        this._previous = options.previous || [];
        this._next = options.next || null;
        this._cursor = options.cursor || null;
        if (options.list) {
            var count = options.list.length;
            for (var i = 0; i < count; i++) {
                var entity = this._client.restoreEntity(options.list[i]);
                this._list[i] = entity;
            }
        }
    }
};

/*
 *  method to determine whether or not the passed variable is a Miapp Collection
 *
 *  @method isCollection
 *  @public
 *  @params {any} obj - any variable
 *  @return {boolean} Returns true or false
 */
Miapp.isCollection = function(obj) {
    return obj && obj instanceof Miapp.Collection;
};

/*
 *  gets the data from the collection object for serialization
 *
 *  @method serialize
 *  @return {object} data
 */
Miapp.Collection.prototype.serialize = function() {
    var data = {};
    data.type = this._type;
    data.qs = this.qs;
    data.iterator = this._iterator;
    data.previous = this._previous;
    data.next = this._next;
    data.cursor = this._cursor;
    this.resetEntityPointer();
    var i = 0;
    data.list = [];
    while (this.hasNextEntity()) {
        var entity = this.getNextEntity();
        data.list[i] = entity.serialize();
        i++;
    }
    data = JSON.stringify(data);
    return data;
};

/*Miapp.Collection.prototype.addCollection = function (collectionName, options, callback) {
  self = this;
  options.client = this._client;
  var collection = new Miapp.Collection(options, function(err, data) {
    if (typeof(callback) === 'function') {

      collection.resetEntityPointer();
      while(collection.hasNextEntity()) {
        var user = collection.getNextEntity();
        var email = user.get('email');
        var image = self._client.getDisplayImage(user.get('email'), user.get('picture'));
        user._portal_image_icon = image;
      }

      self[collectionName] = collection;
      doCallback(callback, [err, collection], self);
    }
  });
};*/
/*
 *  Populates the collection from the server
 *
 *  @method fetch
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 */
Miapp.Collection.prototype.fetch = function(callback) {
    var self = this;
    var qs = this.qs;
    if (this._cursor) {
        qs.cursor = this._cursor;
    } else {
        delete qs.cursor;
    }
    var options = {
        method: "GET",
        endpoint: this._type,
        qs: this.qs
    };
    this._client.request(options, function(err, response) {
        if (err && self._client.logging) {
            console.log("error getting collection");
        } else {
            self.saveCursor(response.cursor || null);
            self.resetEntityPointer();
            self._list = response.getEntities().filter(function(entity) {
                return isUUID(entity.uuid);
            }).map(function(entity) {
                var ent = new Miapp.Entity({
                    client: self._client
                });
                ent.set(entity);
                ent.type = self._type;
                return ent;
            });
        }
        doCallback(callback, [ err, response, self ], self);
    });
};

/*
 *  Adds a new Entity to the collection (saves, then adds to the local object)
 *
 *  @method addNewEntity
 *  @param {object} entity
 *  @param {function} callback
 *  @return {callback} callback(err, data, entity)
 */
Miapp.Collection.prototype.addEntity = function(entityObject, callback) {
    var self = this;
    entityObject.type = this._type;
    this._client.createEntity(entityObject, function(err, response, entity) {
        if (!err) {
            self.addExistingEntity(entity);
        }
        doCallback(callback, [ err, response, self ], self);
    });
};

Miapp.Collection.prototype.addExistingEntity = function(entity) {
    var count = this._list.length;
    this._list[count] = entity;
};

/*
 *  Removes the Entity from the collection, then destroys the object on the server
 *
 *  @method destroyEntity
 *  @param {object} entity
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 */
Miapp.Collection.prototype.destroyEntity = function(entity, callback) {
    var self = this;
    entity.destroy(function(err, response) {
        if (err) {
            if (self._client.logging) {
                console.log("could not destroy entity");
            }
            doCallback(callback, [ err, response, self ], self);
        } else {
            self.fetch(callback);
        }
        self.removeEntity(entity);
    });
};

/*
 * Filters the list of entities based on the supplied criteria function
 * works like Array.prototype.filter
 *
 *  @method getEntitiesByCriteria
 *  @param {function} criteria  A function that takes each entity as an argument and returns true or false
 *  @return {Entity[]} returns a list of entities that caused the criteria function to return true
 */
Miapp.Collection.prototype.getEntitiesByCriteria = function(criteria) {
    return this._list.filter(criteria);
};

/*
 * Returns the first entity from the list of entities based on the supplied criteria function
 * works like Array.prototype.filter
 *
 *  @method getEntitiesByCriteria
 *  @param {function} criteria  A function that takes each entity as an argument and returns true or false
 *  @return {Entity[]} returns a list of entities that caused the criteria function to return true
 */
Miapp.Collection.prototype.getEntityByCriteria = function(criteria) {
    return this.getEntitiesByCriteria(criteria).shift();
};

/*
 * Removed an entity from the collection without destroying it on the server
 *
 *  @method removeEntity
 *  @param {object} entity
 *  @return {Entity} returns the removed entity or undefined if it was not found
 */
Miapp.Collection.prototype.removeEntity = function(entity) {
    var removedEntity = this.getEntityByCriteria(function(item) {
        return entity.uuid === item.get("uuid");
    });
    delete this._list[this._list.indexOf(removedEntity)];
    return removedEntity;
};

/*
 *  Looks up an Entity by UUID
 *
 *  @method getEntityByUUID
 *  @param {string} UUID
 *  @param {function} callback
 *  @return {callback} callback(err, data, entity)
 */
Miapp.Collection.prototype.getEntityByUUID = function(uuid, callback) {
    var entity = this.getEntityByCriteria(function(item) {
        return item.get("uuid") === uuid;
    });
    if (entity) {
        doCallback(callback, [ null, entity, entity ], this);
    } else {
        var options = {
            data: {
                type: this._type,
                uuid: uuid
            },
            client: this._client
        };
        entity = new Miapp.Entity(options);
        entity.fetch(callback);
    }
};

/*
 *  Returns the first Entity of the Entity list - does not affect the iterator
 *
 *  @method getFirstEntity
 *  @return {object} returns an entity object
 */
Miapp.Collection.prototype.getFirstEntity = function() {
    var count = this._list.length;
    if (count > 0) {
        return this._list[0];
    }
    return null;
};

/*
 *  Returns the last Entity of the Entity list - does not affect the iterator
 *
 *  @method getLastEntity
 *  @return {object} returns an entity object
 */
Miapp.Collection.prototype.getLastEntity = function() {
    var count = this._list.length;
    if (count > 0) {
        return this._list[count - 1];
    }
    return null;
};

/*
 *  Entity iteration -Checks to see if there is a "next" entity
 *  in the list.  The first time this method is called on an entity
 *  list, or after the resetEntityPointer method is called, it will
 *  return true referencing the first entity in the list
 *
 *  @method hasNextEntity
 *  @return {boolean} true if there is a next entity, false if not
 */
Miapp.Collection.prototype.hasNextEntity = function() {
    var next = this._iterator + 1;
    var hasNextElement = next >= 0 && next < this._list.length;
    if (hasNextElement) {
        return true;
    }
    return false;
};

/*
 *  Entity iteration - Gets the "next" entity in the list.  The first
 *  time this method is called on an entity list, or after the method
 *  resetEntityPointer is called, it will return the,
 *  first entity in the list
 *
 *  @method hasNextEntity
 *  @return {object} entity
 */
Miapp.Collection.prototype.getNextEntity = function() {
    this._iterator++;
    var hasNextElement = this._iterator >= 0 && this._iterator <= this._list.length;
    if (hasNextElement) {
        return this._list[this._iterator];
    }
    return false;
};

/*
 *  Entity iteration - Checks to see if there is a "previous"
 *  entity in the list.
 *
 *  @method hasPrevEntity
 *  @return {boolean} true if there is a previous entity, false if not
 */
Miapp.Collection.prototype.hasPrevEntity = function() {
    var previous = this._iterator - 1;
    var hasPreviousElement = previous >= 0 && previous < this._list.length;
    if (hasPreviousElement) {
        return true;
    }
    return false;
};

/*
 *  Entity iteration - Gets the "previous" entity in the list.
 *
 *  @method getPrevEntity
 *  @return {object} entity
 */
Miapp.Collection.prototype.getPrevEntity = function() {
    this._iterator--;
    var hasPreviousElement = this._iterator >= 0 && this._iterator <= this._list.length;
    if (hasPreviousElement) {
        return this._list[this._iterator];
    }
    return false;
};

/*
 *  Entity iteration - Resets the iterator back to the beginning
 *  of the list
 *
 *  @method resetEntityPointer
 *  @return none
 */
Miapp.Collection.prototype.resetEntityPointer = function() {
    this._iterator = -1;
};

/*
 * Method to save off the cursor just returned by the last API call
 *
 * @public
 * @method saveCursor
 * @return none
 */
Miapp.Collection.prototype.saveCursor = function(cursor) {
    if (this._next !== cursor) {
        this._next = cursor;
    }
};

/*
 * Resets the paging pointer (back to original page)
 *
 * @public
 * @method resetPaging
 * @return none
 */
Miapp.Collection.prototype.resetPaging = function() {
    this._previous = [];
    this._next = null;
    this._cursor = null;
};

/*
 *  Paging -  checks to see if there is a next page od data
 *
 *  @method hasNextPage
 *  @return {boolean} returns true if there is a next page of data, false otherwise
 */
Miapp.Collection.prototype.hasNextPage = function() {
    return this._next;
};

/*
 *  Paging - advances the cursor and gets the next
 *  page of data from the API.  Stores returned entities
 *  in the Entity list.
 *
 *  @method getNextPage
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 */
Miapp.Collection.prototype.getNextPage = function(callback) {
    if (this.hasNextPage()) {
        this._previous.push(this._cursor);
        this._cursor = this._next;
        this._list = [];
        this.fetch(callback);
    }
};

/*
 *  Paging -  checks to see if there is a previous page od data
 *
 *  @method hasPreviousPage
 *  @return {boolean} returns true if there is a previous page of data, false otherwise
 */
Miapp.Collection.prototype.hasPreviousPage = function() {
    return this._previous.length > 0;
};

/*
 *  Paging - reverts the cursor and gets the previous
 *  page of data from the API.  Stores returned entities
 *  in the Entity list.
 *
 *  @method getPreviousPage
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 */
Miapp.Collection.prototype.getPreviousPage = function(callback) {
    if (this.hasPreviousPage()) {
        this._next = null;
        this._cursor = this._previous.pop();
        this._list = [];
        this.fetch(callback);
    }
};

/*
 *  A class to model a Miapp group.
 *  Set the path in the options object.
 *
 *  @constructor
 *  @param {object} options {client:client, data: {'key': 'value'}, path:'path'}
 */
Miapp.Group = function(options, callback) {
    this._path = options.path;
    this._list = [];
    this._client = options.client;
    this._data = options.data || {};
    this._data.type = "groups";
};

/*
 *  Inherit from Miapp.Entity.
 *  Note: This only accounts for data on the group object itself.
 *  You need to use add and remove to manipulate group membership.
 */
Miapp.Group.prototype = new Miapp.Entity();

/*
 *  Fetches current group data, and members.
 *
 *  @method fetch
 *  @public
 *  @param {function} callback
 *  @returns {function} callback(err, data)
 */
Miapp.Group.prototype.fetch = function(callback) {
    var self = this;
    var groupEndpoint = "groups/" + this._path;
    var memberEndpoint = "groups/" + this._path + "/users";
    var groupOptions = {
        method: "GET",
        endpoint: groupEndpoint
    };
    var memberOptions = {
        method: "GET",
        endpoint: memberEndpoint
    };
    this._client.request(groupOptions, function(err, response) {
        if (err) {
            if (self._client.logging) {
                console.log("error getting group");
            }
            doCallback(callback, [ err, response ], self);
        } else {
            var entities = response.getEntities();
            if (entities && entities.length) {
                var groupresponse = entities.shift();
                self._client.request(memberOptions, function(err, response) {
                    if (err && self._client.logging) {
                        console.log("error getting group users");
                    } else {
                        self._list = response.getEntities().filter(function(entity) {
                            return isUUID(entity.uuid);
                        }).map(function(entity) {
                            return new Miapp.Entity({
                                type: entity.type,
                                client: self._client,
                                uuid: entity.uuid,
                                response: entity
                            });
                        });
                    }
                    doCallback(callback, [ err, response, self ], self);
                });
            }
        }
    });
};

/*
 *  Retrieves the members of a group.
 *
 *  @method members
 *  @public
 *  @param {function} callback
 *  @return {function} callback(err, data);
 */
Miapp.Group.prototype.members = function(callback) {
    return this._list;
};

/*
 *  Adds an existing user to the group, and refreshes the group object.
 *
 *  Options object: {user: user_entity}
 *
 *  @method add
 *  @public
 *  @params {object} options
 *  @param {function} callback
 *  @return {function} callback(err, data)
 */
Miapp.Group.prototype.add = function(options, callback) {
    var self = this;
    if (options.user) {
        options = {
            method: "POST",
            endpoint: "groups/" + this._path + "/users/" + options.user.get("username")
        };
        this._client.request(options, function(error, response) {
            if (error) {
                doCallback(callback, [ error, response, self ], self);
            } else {
                self.fetch(callback);
            }
        });
    } else {
        doCallback(callback, [ new MiappError("no user specified", "no_user_specified"), null, this ], this);
    }
};

/*
 *  Removes a user from a group, and refreshes the group object.
 *
 *  Options object: {user: user_entity}
 *
 *  @method remove
 *  @public
 *  @params {object} options
 *  @param {function} callback
 *  @return {function} callback(err, data)
 */
Miapp.Group.prototype.remove = function(options, callback) {
    var self = this;
    if (options.user) {
        options = {
            method: "DELETE",
            endpoint: "groups/" + this._path + "/users/" + options.user.username
        };
        this._client.request(options, function(error, response) {
            if (error) {
                doCallback(callback, [ error, response, self ], self);
            } else {
                self.fetch(callback);
            }
        });
    } else {
        doCallback(callback, [ new MiappError("no user specified", "no_user_specified"), null, this ], this);
    }
};

/*
 * Gets feed for a group.
 *
 * @public
 * @method feed
 * @param {function} callback
 * @returns {callback} callback(err, data, activities)
 */
Miapp.Group.prototype.feed = function(callback) {
    var self = this;
    var options = {
        method: "GET",
        endpoint: "groups/" + this._path + "/feed"
    };
    this._client.request(options, function(err, response) {
        doCallback(callback, [ err, response, self ], self);
    });
};

/*
 * Creates activity and posts to group feed.
 *
 * options object: {user: user_entity, content: "activity content"}
 *
 * @public
 * @method createGroupActivity
 * @params {object} options
 * @param {function} callback
 * @returns {callback} callback(err, entity)
 */
Miapp.Group.prototype.createGroupActivity = function(options, callback) {
    var self = this;
    var user = options.user;
    var entity = new Miapp.Entity({
        client: this._client,
        data: {
            actor: {
                displayName: user.get("username"),
                uuid: user.get("uuid"),
                username: user.get("username"),
                email: user.get("email"),
                picture: user.get("picture"),
                image: {
                    duration: 0,
                    height: 80,
                    url: user.get("picture"),
                    width: 80
                }
            },
            verb: "post",
            content: options.content,
            type: "groups/" + this._path + "/activities"
        }
    });
    entity.save(function(err, response, entity) {
        doCallback(callback, [ err, response, self ]);
    });
};

/*
 *  A class to model a Miapp event.
 *
 *  @constructor
 *  @param {object} options {timestamp:0, category:'value', counters:{name : value}}
 *  @returns {callback} callback(err, event)
 */
Miapp.Counter = function(options) {
    this._client = options.client;
    this._data = options.data || {};
    this._data.category = options.category || "UNKNOWN";
    this._data.timestamp = options.timestamp || 0;
    this._data.type = "events";
    this._data.counters = options.counters || {};
};

var COUNTER_RESOLUTIONS = [ "all", "minute", "five_minutes", "half_hour", "hour", "six_day", "day", "week", "month" ];

/*
 *  Inherit from Miapp.Entity.
 *  Note: This only accounts for data on the group object itself.
 *  You need to use add and remove to manipulate group membership.
 */
Miapp.Counter.prototype = new Miapp.Entity();

/*
 * overrides Entity.prototype.fetch. Returns all data for counters
 * associated with the object as specified in the constructor
 *
 * @public
 * @method increment
 * @param {function} callback
 * @returns {callback} callback(err, event)
 */
Miapp.Counter.prototype.fetch = function(callback) {
    this.getData({}, callback);
};

/*
 * increments the counter for a specific event
 *
 * options object: {name: counter_name}
 *
 * @public
 * @method increment
 * @params {object} options
 * @param {function} callback
 * @returns {callback} callback(err, event)
 */
Miapp.Counter.prototype.increment = function(options, callback) {
    var self = this, name = options.name, value = options.value;
    if (!name) {
        return doCallback(callback, [ new MiappInvalidArgumentError("'name' for increment, decrement must be a number"), null, self ], self);
    } else if (isNaN(value)) {
        return doCallback(callback, [ new MiappInvalidArgumentError("'value' for increment, decrement must be a number"), null, self ], self);
    } else {
        self._data.counters[name] = parseInt(value) || 1;
        return self.save(callback);
    }
};

/*
 * decrements the counter for a specific event
 *
 * options object: {name: counter_name}
 *
 * @public
 * @method decrement
 * @params {object} options
 * @param {function} callback
 * @returns {callback} callback(err, event)
 */
Miapp.Counter.prototype.decrement = function(options, callback) {
    var self = this, name = options.name, value = options.value;
    self.increment({
        name: name,
        value: -(parseInt(value) || 1)
    }, callback);
};

/*
 * resets the counter for a specific event
 *
 * options object: {name: counter_name}
 *
 * @public
 * @method reset
 * @params {object} options
 * @param {function} callback
 * @returns {callback} callback(err, event)
 */
Miapp.Counter.prototype.reset = function(options, callback) {
    var self = this, name = options.name;
    self.increment({
        name: name,
        value: 0
    }, callback);
};

/*
 * gets data for one or more counters over a given
 * time period at a specified resolution
 *
 * options object: {
 *                   counters: ['counter1', 'counter2', ...],
 *                   start: epoch timestamp or ISO date string,
 *                   end: epoch timestamp or ISO date string,
 *                   resolution: one of ('all', 'minute', 'five_minutes', 'half_hour', 'hour', 'six_day', 'day', 'week', or 'month')
 *                   }
 *
 * @public
 * @method getData
 * @params {object} options
 * @param {function} callback
 * @returns {callback} callback(err, event)
 */
Miapp.Counter.prototype.getData = function(options, callback) {
    var start_time, end_time, start = options.start || 0, end = options.end || Date.now(), resolution = (options.resolution || "all").toLowerCase(), counters = options.counters || Object.keys(this._data.counters), res = (resolution || "all").toLowerCase();
    if (COUNTER_RESOLUTIONS.indexOf(res) === -1) {
        res = "all";
    }
    start_time = getSafeTime(start);
    end_time = getSafeTime(end);
    var self = this;
    var params = Object.keys(counters).map(function(counter) {
        return [ "counter", encodeURIComponent(counters[counter]) ].join("=");
    });
    params.push("resolution=" + res);
    params.push("start_time=" + String(start_time));
    params.push("end_time=" + String(end_time));
    var endpoint = "counters?" + params.join("&");
    this._client.request({
        endpoint: endpoint
    }, function(err, data) {
        if (data.counters && data.counters.length) {
            data.counters.forEach(function(counter) {
                self._data.counters[counter.name] = counter.value || counter.values;
            });
        }
        return doCallback(callback, [ err, data, self ], self);
    });
};

function getSafeTime(prop) {
    var time;
    switch (typeof prop) {
      case "undefined":
        time = Date.now();
        break;

      case "number":
        time = prop;
        break;

      case "string":
        time = isNaN(prop) ? Date.parse(prop) : parseInt(prop);
        break;

      default:
        time = Date.parse(prop.toString());
    }
    return time;
}

/*
 *  A class to model a Miapp folder.
 *
 *  @constructor
 *  @param {object} options {name:"MyPhotos", path:"/user/uploads", owner:"00000000-0000-0000-0000-000000000000" }
 *  @returns {callback} callback(err, folder)
 */
Miapp.Folder = function(options, callback) {
    var self = this, messages = [];
    console.log("FOLDER OPTIONS", options);
    self._client = options.client;
    self._data = options.data || {};
    self._data.type = "folders";
    var missingData = [ "name", "owner", "path" ].some(function(required) {
        return !(required in self._data);
    });
    if (missingData) {
        return doCallback(callback, [ new MiappInvalidArgumentError("Invalid asset data: 'name', 'owner', and 'path' are required properties."), null, self ], self);
    }
    self.save(function(err, response) {
        if (err) {
            doCallback(callback, [ new MiappError(response), response, self ], self);
        } else {
            if (response && response.entities && response.entities.length) {
                self.set(response.entities[0]);
            }
            doCallback(callback, [ null, response, self ], self);
        }
    });
};

/*
 *  Inherit from Miapp.Entity.
 */
Miapp.Folder.prototype = new Miapp.Entity();

/*
 *  fetch the folder and associated assets
 *
 *  @method fetch
 *  @public
 *  @param {function} callback(err, self)
 *  @returns {callback} callback(err, self)
 */
Miapp.Folder.prototype.fetch = function(callback) {
    var self = this;
    Miapp.Entity.prototype.fetch.call(self, function(err, data) {
        console.log("self", self.get());
        console.log("data", data);
        if (!err) {
            self.getAssets(function(err, response) {
                if (err) {
                    doCallback(callback, [ new MiappError(response), resonse, self ], self);
                } else {
                    doCallback(callback, [ null, self ], self);
                }
            });
        } else {
            doCallback(callback, [ null, data, self ], self);
        }
    });
};

/*
 *  Add an asset to the folder.
 *
 *  @method addAsset
 *  @public
 *  @param {object} options {asset:(uuid || Miapp.Asset || {name:"photo.jpg", path:"/user/uploads", "content-type":"image/jpeg", owner:"F01DE600-0000-0000-0000-000000000000" }) }
 *  @returns {callback} callback(err, folder)
 */
Miapp.Folder.prototype.addAsset = function(options, callback) {
    var self = this;
    if ("asset" in options) {
        var asset = null;
        switch (typeof options.asset) {
          case "object":
            asset = options.asset;
            if (!(asset instanceof Miapp.Entity)) {
                asset = new Miapp.Asset(asset);
            }
            break;

          case "string":
            if (isUUID(options.asset)) {
                asset = new Miapp.Asset({
                    client: self._client,
                    data: {
                        uuid: options.asset,
                        type: "assets"
                    }
                });
            }
            break;
        }
        if (asset && asset instanceof Miapp.Entity) {
            asset.fetch(function(err, data) {
                if (err) {
                    doCallback(callback, [ new MiappError(data), data, self ], self);
                } else {
                    var endpoint = [ "folders", self.get("uuid"), "assets", asset.get("uuid") ].join("/");
                    var options = {
                        method: "POST",
                        endpoint: endpoint
                    };
                    self._client.request(options, callback);
                }
            });
        }
    } else {
        doCallback(callback, [ new MiappInvalidArgumentError("No asset specified"), null, self ], self);
    }
};

/*
 *  Remove an asset from the folder.
 *
 *  @method removeAsset
 *  @public
 *  @param {object} options {asset:(uuid || Miapp.Asset || {name:"photo.jpg", path:"/user/uploads", "content-type":"image/jpeg", owner:"F01DE600-0000-0000-0000-000000000000" }) }
 *  @returns {callback} callback(err, folder)
 */
Miapp.Folder.prototype.removeAsset = function(options, callback) {
    var self = this;
    if ("asset" in options) {
        var asset = null;
        switch (typeof options.asset) {
          case "object":
            asset = options.asset;
            break;

          case "string":
            if (isUUID(options.asset)) {
                asset = new Miapp.Asset({
                    client: self._client,
                    data: {
                        uuid: options.asset,
                        type: "assets"
                    }
                });
            }
            break;
        }
        if (asset && asset !== null) {
            var endpoint = [ "folders", self.get("uuid"), "assets", asset.get("uuid") ].join("/");
            self._client.request({
                method: "DELETE",
                endpoint: endpoint
            }, function(err, response) {
                if (err) {
                    doCallback(callback, [ new MiappError(response), response, self ], self);
                } else {
                    doCallback(callback, [ null, response, self ], self);
                }
            });
        }
    } else {
        doCallback(callback, [ new MiappInvalidArgumentError("No asset specified"), null, self ], self);
    }
};

/*
 *  List the assets in the folder.
 *
 *  @method getAssets
 *  @public
 *  @returns {callback} callback(err, assets)
 */
Miapp.Folder.prototype.getAssets = function(callback) {
    return this.getConnections("assets", callback);
};

/*
 *  XMLHttpRequest.prototype.sendAsBinary polyfill
 *  from: https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#sendAsBinary()
 *
 *  @method sendAsBinary
 *  @param {string} sData
 */
if (!XMLHttpRequest.prototype.sendAsBinary) {
    XMLHttpRequest.prototype.sendAsBinary = function(sData) {
        var nBytes = sData.length, ui8Data = new Uint8Array(nBytes);
        for (var nIdx = 0; nIdx < nBytes; nIdx++) {
            ui8Data[nIdx] = sData.charCodeAt(nIdx) & 255;
        }
        this.send(ui8Data);
    };
}

/*
 *  A class to model a Miapp asset.
 *
 *  @constructor
 *  @param {object} options {name:"photo.jpg", path:"/user/uploads", "content-type":"image/jpeg", owner:"F01DE600-0000-0000-0000-000000000000" }
 *  @returns {callback} callback(err, asset)
 */
Miapp.Asset = function(options, callback) {
    var self = this, messages = [];
    self._client = options.client;
    self._data = options.data || {};
    self._data.type = "assets";
    var missingData = [ "name", "owner", "path" ].some(function(required) {
        return !(required in self._data);
    });
    if (missingData) {
        doCallback(callback, [ new MiappError("Invalid asset data: 'name', 'owner', and 'path' are required properties."), null, self ], self);
    } else {
        self.save(function(err, data) {
            if (err) {
                doCallback(callback, [ new MiappError(data), data, self ], self);
            } else {
                if (data && data.entities && data.entities.length) {
                    self.set(data.entities[0]);
                }
                doCallback(callback, [ null, data, self ], self);
            }
        });
    }
};

/*
 *  Inherit from Miapp.Entity.
 */
Miapp.Asset.prototype = new Miapp.Entity();

/*
 *  Add an asset to a folder.
 *
 *  @method connect
 *  @public
 *  @param {object} options {folder:"F01DE600-0000-0000-0000-000000000000"}
 *  @returns {callback} callback(err, asset)
 */
Miapp.Asset.prototype.addToFolder = function(options, callback) {
    var self = this, error = null;
    if ("folder" in options && isUUID(options.folder)) {
        var folder = Miapp.Folder({
            uuid: options.folder
        }, function(err, folder) {
            if (err) {
                doCallback(callback, [ MiappError.fromResponse(folder), folder, self ], self);
            } else {
                var endpoint = [ "folders", folder.get("uuid"), "assets", self.get("uuid") ].join("/");
                var options = {
                    method: "POST",
                    endpoint: endpoint
                };
                this._client.request(options, function(err, response) {
                    if (err) {
                        doCallback(callback, [ MiappError.fromResponse(folder), response, self ], self);
                    } else {
                        doCallback(callback, [ null, folder, self ], self);
                    }
                });
            }
        });
    } else {
        doCallback(callback, [ new MiappError("folder not specified"), null, self ], self);
    }
};

Miapp.Entity.prototype.attachAsset = function(file, callback) {
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        doCallback(callback, [ new MiappError("The File APIs are not fully supported by your browser."), null, this ], this);
        return;
    }
    var self = this;
    var args = arguments;
    var type = this._data.type;
    var attempts = self.get("attempts");
    if (isNaN(attempts)) {
        attempts = 3;
    }
    if (type != "assets" && type != "asset") {
        var endpoint = [ this._client.URI, this._client.orgName, this._client.appName, type, self.get("uuid") ].join("/");
    } else {
        self.set("content-type", file.type);
        self.set("size", file.size);
        var endpoint = [ this._client.URI, this._client.orgName, this._client.appName, "assets", self.get("uuid"), "data" ].join("/");
    }
    var xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, true);
    xhr.onerror = function(err) {
        doCallback(callback, [ new MiappError("The File APIs are not fully supported by your browser.") ], xhr, self);
    };
    xhr.onload = function(ev) {
        if (xhr.status >= 500 && attempts > 0) {
            self.set("attempts", --attempts);
            setTimeout(function() {
                self.attachAsset.apply(self, args);
            }, 100);
        } else if (xhr.status >= 300) {
            self.set("attempts");
            doCallback(callback, [ new MiappError(JSON.parse(xhr.responseText)), xhr, self ], self);
        } else {
            self.set("attempts");
            self.fetch();
            doCallback(callback, [ null, xhr, self ], self);
        }
    };
    var fr = new FileReader();
    fr.onload = function() {
        var binary = fr.result;
        if (type === "assets" || type === "asset") {
            xhr.overrideMimeType("application/octet-stream");
            xhr.setRequestHeader("Content-Type", "application/octet-stream");
        }
        xhr.sendAsBinary(binary);
    };
    fr.readAsBinaryString(file);
};

/*
 *  Upload Asset data
 *
 *  @method upload
 *  @public
 *  @param {object} data Can be a javascript Blob or File object
 *  @returns {callback} callback(err, asset)
 */
Miapp.Asset.prototype.upload = function(data, callback) {
    this.attachAsset(data, function(err, response) {
        if (!err) {
            doCallback(callback, [ null, response, self ], self);
        } else {
            doCallback(callback, [ new MiappError(err), response, self ], self);
        }
    });
};

/*
 *  Download Asset data
 *
 *  @method download
 *  @public
 *  @returns {callback} callback(err, blob) blob is a javascript Blob object.
 */
Miapp.Entity.prototype.downloadAsset = function(callback) {
    var self = this;
    var endpoint;
    var type = this._data.type;
    var xhr = new XMLHttpRequest();
    if (type != "assets" && type != "asset") {
        endpoint = [ this._client.URI, this._client.orgName, this._client.appName, type, self.get("uuid") ].join("/");
    } else {
        endpoint = [ this._client.URI, this._client.orgName, this._client.appName, "assets", self.get("uuid"), "data" ].join("/");
    }
    xhr.open("GET", endpoint, true);
    xhr.responseType = "blob";
    xhr.onload = function(ev) {
        var blob = xhr.response;
        if (type != "assets" && type != "asset") {
            doCallback(callback, [ null, blob, xhr ], self);
        } else {
            doCallback(callback, [ null, xhr, self ], self);
        }
    };
    xhr.onerror = function(err) {
        callback(true, err);
        doCallback(callback, [ new MiappError(err), xhr, self ], self);
    };
    if (type != "assets" && type != "asset") {
        xhr.setRequestHeader("Accept", self._data["file-metadata"]["content-type"]);
    } else {
        xhr.overrideMimeType(self.get("content-type"));
    }
    xhr.send();
};

/*
 *  Download Asset data
 *
 *  @method download
 *  @public
 *  @returns {callback} callback(err, blob) blob is a javascript Blob object.
 */
Miapp.Asset.prototype.download = function(callback) {
    this.downloadAsset(function(err, response) {
        if (!err) {
            doCallback(callback, [ null, response, self ], self);
        } else {
            doCallback(callback, [ new MiappError(err), response, self ], self);
        }
    });
};

/**
 * Created by ryan bridges on 2014-02-05.
 */
(function(global) {
    var name = "MiappError", short, _name = global[name], _short = short && short !== undefined ? global[short] : undefined;
    /*
     *  Instantiates a new MiappError
     *
     *  @method MiappError
     *  @public
     *  @params {<string>} message
     *  @params {<string>} id       - the error code, id, or name
     *  @params {<int>} timestamp
     *  @params {<int>} duration
     *  @params {<string>} exception    - the Java exception from Miapp
     *  @return Returns - a new MiappError object
     *
     *  Example:
     *
     *  MiappError(message);
     */
    function MiappError(message, name, timestamp, duration, exception) {
        this.message = message;
        this.name = name;
        this.timestamp = timestamp || Date.now();
        this.duration = duration || 0;
        this.exception = exception;
    }
    MiappError.prototype = new Error();
    MiappError.prototype.constructor = MiappError;
    /*
     *  Creates a MiappError from the JSON response returned from the backend
     *
     *  @method fromResponse
     *  @public
     *  @params {object} response - the deserialized HTTP response from the Miapp API
     *  @return Returns a new MiappError object.
     *
     *  Example:
     *  {
     *  "error":"organization_application_not_found",
     *  "timestamp":1391618508079,
     *  "duration":0,
     *  "exception":"org.miapp.rest.exceptions.OrganizationApplicationNotFoundException",
     *  "error_description":"Could not find application for yourorgname/sandboxxxxx from URI: yourorgname/sandboxxxxx"
     *  }
     */
    MiappError.fromResponse = function(response) {
        if (response && "undefined" !== typeof response) {
            return new MiappError(response.error_description, response.error, response.timestamp, response.duration, response.exception);
        } else {
            return new MiappError();
        }
    };
    MiappError.createSubClass = function(name) {
        if (name in global && global[name]) return global[name];
        global[name] = function() {};
        global[name].name = name;
        global[name].prototype = new MiappError();
        return global[name];
    };
    function MiappHTTPResponseError(message, name, timestamp, duration, exception) {
        this.message = message;
        this.name = name;
        this.timestamp = timestamp || Date.now();
        this.duration = duration || 0;
        this.exception = exception;
    }
    MiappHTTPResponseError.prototype = new MiappError();
    function MiappInvalidHTTPMethodError(message, name, timestamp, duration, exception) {
        this.message = message;
        this.name = name || "invalid_http_method";
        this.timestamp = timestamp || Date.now();
        this.duration = duration || 0;
        this.exception = exception;
    }
    MiappInvalidHTTPMethodError.prototype = new MiappError();
    function MiappInvalidURIError(message, name, timestamp, duration, exception) {
        this.message = message;
        this.name = name || "invalid_uri";
        this.timestamp = timestamp || Date.now();
        this.duration = duration || 0;
        this.exception = exception;
    }
    MiappInvalidURIError.prototype = new MiappError();
    function MiappInvalidArgumentError(message, name, timestamp, duration, exception) {
        this.message = message;
        this.name = name || "invalid_argument";
        this.timestamp = timestamp || Date.now();
        this.duration = duration || 0;
        this.exception = exception;
    }
    MiappInvalidArgumentError.prototype = new MiappError();
    function MiappKeystoreDatabaseUpgradeNeededError(message, name, timestamp, duration, exception) {
        this.message = message;
        this.name = name;
        this.timestamp = timestamp || Date.now();
        this.duration = duration || 0;
        this.exception = exception;
    }
    MiappKeystoreDatabaseUpgradeNeededError.prototype = new MiappError();
    global.MiappHTTPResponseError = MiappHTTPResponseError;
    global.MiappInvalidHTTPMethodError = MiappInvalidHTTPMethodError;
    global.MiappInvalidURIError = MiappInvalidURIError;
    global.MiappInvalidArgumentError = MiappInvalidArgumentError;
    global.MiappKeystoreDatabaseUpgradeNeededError = MiappKeystoreDatabaseUpgradeNeededError;
    global[name] = MiappError;
    if (short !== undefined) {
        global[short] = MiappError;
    }
    global[name].noConflict = function() {
        if (_name) {
            global[name] = _name;
        }
        if (short !== undefined) {
            global[short] = _short;
        }
        return MiappError;
    };
    return global[name];
})(this || window);



var SrvMiapp = (function() {
'use strict';

    function Service(logger, promise) {

        this.logger = logger;
        this.promise = promise;
        //this.$q = $q;
        //this.$timeout = $timeout;
        this.logger.log('miapp.sdk.service : init');

        this.miappClient = null;
        this.currentUser = getObjectFromLocalStorage('miappCurrentUser') || null;

        this.miappId = null;
        this.miappSalt = 'SALT_TOKEN';
        this.miappOrg = null;
        this.miappAppVersion = null;
        //this.miappTestURI = null;

        this.miappIsOffline = getObjectFromLocalStorage('miappIsOffline') || false;
        this.miappURI = getObjectFromLocalStorage('miappURI') || 'https://miapp.io/api';
        this.miappDBURI = getObjectFromLocalStorage('miappDBURI') || 'https://couchdb_notfound';
        
        this._db = new PouchDB('miapp_db', { adapter: 'websql' });
        this._dbRecordCount = 0;
        this._dbInitialized = false;
    }


    Service.prototype._testPromise = function (a) {
        if (a) return this.promise.resolve('test promise ok '+ a);
        return new this.promise(function (resolve, reject) {
            resolve('test promise ok');
        });
    };

    Service.prototype.init = function (miappId, miappSalt, isOffline) {

        this.miappIsOffline = (typeof isOffline === 'undefined') ? this.miappIsOffline : isOffline;
        if (!this.miappIsOffline) {
            this.miappClient = new Miapp.Client({
                orgName: 'miappio',
                appName: miappId,
                logging: true, // Optional - turn on logging, off by default
                buildCurl: false, // Optional - turn on curl commands, off by default
                URI : this.miappURI
            });
        }


        this.miappId = miappId;
        this.miappOrg = null;
        this.miappAppVersion = null;

    };

    Service.prototype.setAuthEndpoint = function (endpointURI) {
        this.miappURI = endpointURI;
        setObjectFromLocalStorage('miappURI',this.miappURI);
    };
    Service.prototype.setDBEndpoint = function (endpointURI) {
        this.miappDBURI = endpointURI;
        setObjectFromLocalStorage('miappDBURI',this.miappDBURI);
    };
    Service.prototype.setOffline = function (b) {
        this.miappIsOffline = (b == true);
        setObjectFromLocalStorage('miappIsOffline',this.miappIsOffline);
    };

    Service.prototype.isLogin = function () {
        if (!this.currentUser) return false;
        return true;
    };

    Service.prototype.login = function (login, password, updateProperties) {
        var self = this;
        return new self.promise(function(resolve,reject) {
            if (!self.miappClient && !self.miappIsOffline) {
                reject('miapp.sdk.service.login : not initialized. Did you miapp.sdk.service.init() ?');
                return;
            }

            // TODO encrypting and salt stuff
            //var encrypted = CryptoJS.AES.encrypt(password, 'SALT_TOKEN');
            //var encrypted_json_str = encrypted.toString();
            var encrypted_json_str = password;
            self.logger.log('miapp.sdk.service.login : '+ login+ ' / '+ encrypted_json_str);

            if (self.currentUser) {
                // Not a pb recheck
                if (self.currentUser.email === login && self.currentUser.password === encrypted_json_str) {
                    resolve(self.currentUser);
                    return;
                }
                //return self.$q.reject('miappServ already login');
                self.currentUser = null;
            }

            if (self.miappIsOffline) {
                var offlineUser = {};
                offlineUser.email = login;
                offlineUser.password = encrypted_json_str;
                self.setCurrentUser(offlineUser);
                resolve(self.currentUser);
                return;
            }

            self.miappClient.loginMLE(self.miappId, login, encrypted_json_str, updateProperties, function (err, loginUser) {
                // self.logger.log('miapp.sdk.service.callback done :' + err + ' user:' + user);
                if (err) {
                    // Error - could not log user in
                    self.logger.error('miapp.sdk.service.login error : '+ err);
                    reject(err);
                } else {
                    // Success - user has been logged in
                    loginUser.email = login;
                    self.setCurrentUser(loginUser);
                    resolve(self.currentUser);
                }
            });
        });
    };

    
    Service.prototype.logoff = function () {
        var self = this;
        if (!self.currentUser) return self.$q.reject('miapp.sdk.service not login');
        
        return self.deleteUser(self.currentUser._id);
    };

    

    Service.prototype.deleteUser = function (userIDToDelete) {
        var self = this;
        if (self.miappIsOffline) {
            return self.promise.resolve(null);
        }

        if (!self.miappClient) {
            return self.promise.reject('miapp.sdk.service not initialized');
        }

        return new self.promise(function(resolve,reject){
            self.miappClient.deleteUserMLE(userIDToDelete,function (err) {
                // self.logger.log('miapp.sdk.service.deleteUserMLE callback done :' + err);
                if (err) {
                    // Error - could not log user in
                    return reject(err);
                } else {
                    // Success - user has been logged in
                    self.currentUser = null;
                    removeObjectFromLocalStorage('miappCurrentUser');
                    return resolve(self.currentUser);
                }
            });
        });
    };


    Service.prototype.syncDb = function(){
        var self = this;
        self.logger.log('miapp.sdk.service.syncDb');
        
        if (self.miappIsOffline) {
            return self.promise.resolve();
        }

        var pouchdbEndpoint = self.miappDBURI;
        var getendpoint = self.miappClient ? self.miappClient.getEndpoint() : null;
        if (!pouchdbEndpoint && getendpoint) pouchdbEndpoint = getendpoint;
        if (!self.currentUser || !self.currentUser.email || !pouchdbEndpoint || !pouchDB)
            return self.promise.reject('miapp.sdk.service.syncDb : DB sync impossible. Need a user logged in. (' + pouchdbEndpoint + ' -' + self.currentUser+')');

        self.logger.log('miapp.sdk.service.syncDb call');

        return new self.promise(function(resolve,reject){
            self._db.sync(pouchdbEndpoint,{
                filter : function(doc){
                    if (doc.appUser_Id == self.currentUser.email) return doc;
                }
            }).on('complete', function (info) {
                self.logger.log('miapp.sdk.service.syncDb : db complete : '+info);
                resolve();
            })
            .on('error', function (err) {
                self.logger.error('miapp.sdk.service.syncDb : db error, we set db temporary offline : '+err);
                self.miappIsOffline =true;
                reject(err);
            }).on('change', function (info) {
                self.logger.log('miapp.sdk.service.syncDb : db change : '+ info);
            }).on('paused', function (err) {
                self.logger.log('miapp.sdk.service.syncDb : db paused : '+err);
            }).on('active', function () {
                self.logger.log('miapp.sdk.service.syncDb : db activate');
            }).on('denied', function (info) {
                self.logger.error('miapp.sdk.service.syncDb : db denied, we set db temporary offline : '+info);
                self.miappIsOffline =true;
                reject('miapp.sdk.service.syncDb : db denied : '+info);
            });
        });

    };


    Service.prototype.putInDb = function(data){
        var self = this;
        
        if (!self.currentUser || !self.currentUser._id || !self._db)
            return self.promise.reject('miapp.sdk.service.putInDb : DB put impossible. Need a user logged in. (' + self.currentUser+')');

        data.miappUserId = self.currentUser._id;
        data.miappOrgId = self.appName;
        data.miappAppVersion = self.appVersion;

        var dataId = data._id;
        if (!dataId) dataId = generateObjectUniqueId(self.appName);
        delete data._id;
        data._id = dataId;
        return new self.promise(function(resolve,reject){
            self._db.put(data, function(err, response) {
                if (response && response.ok && response.id && response.rev) {
                    data._id = response.id;
                    data._rev = response.rev;
                    self._dbRecordCount++;
                    self.logger.log("updatedData: "+data._id+" - "+data._rev);
                    resolve(data);
                    return;
                }
                reject(err);
            });
        });

    };

    Service.prototype.findInDb = function (id) {
        var self = this;

        if (!self.currentUser || !self.currentUser._id || !self._db)
            return self.promise.reject('miapp.sdk.service.findInDb : need a user logged in. (' + self.currentUser + ')');

        return self._db.get(id);
    };

    Service.prototype.findAllInDb = function () {
        var self = this;

        if (!self.currentUser || !self.currentUser._id || !self._db)
            return self.promise.reject('miapp.sdk.service.findAllInDb : need a user logged in. (' + self.currentUser + ')');

        return self._db.allDocs({include_docs: true, descending: true});
    };


    var _srvDataUniqId = 0;
    function generateObjectUniqueId(appName, type, name){
    
        //return null;
        var now = new Date();
        var simpleDate = ""+now.getYear()+""+now.getMonth()+""+now.getDate()+""+now.getHours()+""+now.getMinutes();//new Date().toISOString();
        var sequId = ++_srvDataUniqId;
        var UId = '';
        if (appName && appName.charAt(0)) UId += appName.charAt(0);
        if (type && type.length > 3) UId += type.substring(0,4);
        if (name && name.length > 3) UId += name.substring(0,4);
        UId += simpleDate+'_'+sequId;
        return UId;
    }

/* todo ?
    Service.prototype._dbFilter= function(doc){
        var dataUserLoggedIn = this.getUserLoggedIn();
        if (doc.miappUserId == dataUserLoggedIn.email)
            return doc;
        return null;
    };
    */


    Service.prototype.isDbEmpty = function () {
        var self = this;
        self.logger.log('miapp.sdk.service.isDbEmpty ..');
        if (!self._db) {//if (!self.currentUser || !self.currentUser.email || !pouchDB) {
            var error = 'miapp.sdk.service.isDbEmpty : DB search impossible. Need a user logged in. (' + self.currentUser + ')';
            self.logger.error(error);
            return self.promise.reject(error);
        }

        self.logger.log('miapp.sdk.service.isDbEmpty call');
        return new self.promise(function(resolve,reject){
            self._db.allDocs({
                filter : function(doc){
                    if (!self.currentUser) return doc;
                    if (doc.miappUserId == self.currentUser._id) return doc;
                }
            },function(err, response) {
                self.logger.log('miapp.sdk.service.isDbEmpty callback');
                if (err || !response) { reject(err); return;}

                self._dbRecordCount = response.total_rows;
                //if (response && response.total_rows && response.total_rows > 5) return resolve(false);
                if (response.total_rows && response.total_rows > 0) { resolve(false); return;}

                self.logger.log('miapp.sdk.service.isDbEmpty callback: '+ response.total_rows);
                resolve(true);

            });
        });
    };

    Service.prototype.setCurrentUser = function (user) {
        var self = this;
        if (!user)
            return self.logger.log('miapp.sdk.service.setCurrentUser : need a valid user');

        var firstUserId = user._id;
        if (!firstUserId && self.currentUser) firstUserId = self.currentUser._id;
        if (!firstUserId) firstUserId = generateObjectUniqueId(self.appName, 'user');

        user._id = firstUserId;
        user.miappUserId = firstUserId;
        user.miappOrgId = self.appName;
        user.miappAppVersion = self.appVersion;
        self.currentUser = user;
        setObjectFromLocalStorage('miappCurrentUser', self.currentUser);
        self.logger.log('miapp.sdk.service.setCurrentUser :');
        self.logger.log(self.currentUser);
    };

    Service.prototype.putFirstUserInEmptyDb = function (firstUser) {
        var self = this;
        if (!firstUser || !self.currentUser || !self.currentUser.email || !self._db)
            return self.promise.reject('miapp.sdk.service.putFirstUserInEmptyBd : DB put impossible. Need a user logged in. (' + self.currentUser+')_');

        var firstUserId = firstUser._id;
        if (!firstUserId) firstUserId = self.currentUser._id;
        if (!firstUserId) firstUserId = generateObjectUniqueId(self.appName,'user');
        
        firstUser.miappUserId = firstUserId;
        firstUser.miappOrgId = self.appName;
        firstUser.miappAppVersion = self.appVersion;
        delete firstUser._id;
        firstUser._id = firstUserId;

        return new self.promise(function(resolve,reject){
            self._db.put(firstUser, function(err, response) {
                if (response && response.ok && response.id && response.rev) {
                    firstUser._id = response.id;
                    firstUser._rev = response.rev;
                    self.logger.log("miapp.sdk.service.putFirstUserInEmptyBd : firstUser: "+firstUser._id+" - "+firstUser._rev);

                    self._dbRecordCount++;
                    self.setCurrentUser(firstUser);
                    return resolve(firstUser);
                }
                return reject(err);
            });
        });
    };
    
    Service.prototype.becarefulCleanDb = function() {
        var self = this;
        self.logger.log('miapp.sdk.service.becarefulCleanDb');
        if (!self._db)
            return self.promise.reject('miapp.sdk.service.becarefulCleanDb : DB clean impossible.');

        return new self.promise(function (resolve, reject) {

            self._db.destroy(function (err, info) {
                if (err) return reject(err);

                self._db = new PouchDB('miapp_db', {adapter: 'websql'});
                delete self.currentUser;
                self.currentUser = null;
                self._dbRecordCount = 0;
                removeObjectFromLocalStorage('miappCurrentUser');
                self.logger.log('miapp.sdk.service.becarefulCleanDb .. done : ' + info);
                return resolve();
            });
        });
    };


    // Call it on each app start
    // Set User login in DB if db empty
    // Return self.promise with this._db
    Service.prototype.initDBWithLogin = function (login, password) {
        var self = this;
        self.logger.log('miapp.sdk.service.initDBWithLogin');
        if (self._dbInitialized) return self.promise.reject('miapp.sdk.service.initDBWithLogin : DB already initialized. Do the miapp.sdk.service.login() once each app start.');

        return new self.promise(function (resolve, reject) {

            self.isDbEmpty()
                .then(function (isEmpty) {
                    if (!isEmpty && self.currentUser) {
                        self._dbInitialized = true;
                        resolve(self.currentUser); // already set
                        return;
                    }

                    self.becarefulCleanDb()
                        .then(function (msg) {
                            console.log(self.currentUser);
                            return self.login(login, password);
                        })
                        .then(function (firstUser) {
                            console.log(self.currentUser);
                            if (firstUser && !self.currentUser) {
                                self.setCurrentUser(firstUser);
                                //self.putFirstUserInEmptyDb(firstUser);
                            }

                            console.log(self.currentUser);
                            return self.syncDb();
                        })
                        .then(function (ret) {

                            console.log(self.currentUser);
                            if (!self.currentUser) {
                                reject('miapp.sdk.service.initDBWithLogin : Pb with user get.' + ret);
                            }
                            else {
                                self._dbInitialized = true;
                                resolve(self.currentUser);
                            }
                        })
                        .catch(function (err) {
                            reject(err);
                        });
                })
                .catch(function (err) {
                    reject(err);
                });
        });


    };

    // Sync Data
    // If empty call fnInitFirstData(this._db), should return self.promise to call sync
    // Return self.promise with this._db
    Service.prototype.syncComplete = function (fnInitFirstData, service) {
        var self = this;
        self.logger.log('miapp.sdk.service.syncComplete');
        if (!self.currentUser || !self._db)
            return self.promise.reject('miapp.sdk.service.syncComplete : DB sync impossible. Did you miapp.sdk.service.login() ?');

        return new self.promise(function (resolve, reject) {
            self.isDbEmpty()
                .then(function (isEmpty) {
                    if (isEmpty && fnInitFirstData) {
                        var ret = fnInitFirstData(service);
                        if (ret && ret["catch"] instanceof Function) return ret;
                        if (typeof ret === 'string') self.logger.log(ret);
                    }
                    return self.promise.resolve('miapp.sdk.service.syncComplete : ready to sync');
                })
                .then(function (ret) {
                    if (typeof ret === 'string') self.logger.log(ret);
                    return self.syncDb();
                })
                .then(function (err) {
                    if (err) return reject(err);
                    self.logger.log('miapp.sdk.service.syncComplete sync resolved');
                    return self._db.info();
                })
                .then(function (result) {
                    self._dbRecordCount = result.doc_count;
                    self.logger.log('miapp.sdk.service.syncComplete _dbRecordCount : ' + self._dbRecordCount);
                    resolve(self._dbRecordCount);
                })
                .catch(function (err) {
                    var errMessage = err ? err : 'miapp.sdk.service.syncComplete : DB pb with getting data';
                    //self.logger.error(errMessage);
                    reject(errMessage);
                })
            ;
        });
    };

     



    //Local Storage utilities
    function setObjectFromLocalStorage(id, object){
      //if(typeof(Storage) === "undefined") return null;
      var jsonObj = JSON.stringify(object);
      if (window.localStorage) window.localStorage.setItem(id,jsonObj);
      //this.logger.log('miapp.sdk.service.retrievedObject: ', JSON.parse(retrievedObject));
      return jsonObj;
    }
    function getObjectFromLocalStorage(id){
        //if(typeof(Storage) === "undefined") return null;
        // Retrieve the object from storage
        var retrievedObject;
        if (window.localStorage) retrievedObject = window.localStorage.getItem(id);
        var obj = JSON.parse(retrievedObject);
        //this.logger.log('miapp.sdk.service.retrievedObject: ', JSON.parse(retrievedObject));
        return obj;
    }
    function removeObjectFromLocalStorage(id){
        if (window.localStorage) window.localStorage.removeItem(id);
    }

    return Service;
})();
