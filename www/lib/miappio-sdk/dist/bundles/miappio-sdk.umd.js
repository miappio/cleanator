(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common')) :
	typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/common'], factory) :
	(factory((global['miappio-sdk'] = {}),global.ng.core,global.ng.common));
}(this, (function (exports,core,common) { 'use strict';

// bumped version via gulp
var version = '2.0.19';
var Base64 = /** @class */ (function () {
    function Base64() {
    }
    
    /**
     * Decodes string from Base64 string
     * @param {?} input
     * @return {?}
     */
    Base64.encode = function (input) {
        if (!input) {
            return null;
        }
        return btoa(encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) {
            return String.fromCharCode(parseInt('0x' + p1, 16));
        }));
    };
    /**
     * @param {?} input
     * @return {?}
     */
    Base64.decode = function (input) {
        if (!input) {
            return null;
        }
        return decodeURIComponent(atob(input).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    };
    return Base64;
}());
/**
 * localStorage class factory
 * Usage : var LocalStorage = miapp.LocalStorageFactory(window.localStorage); // to create a new class
 * Usage : var localStorageService = new LocalStorage(); // to create a new instance
 */
var LocalStorage = /** @class */ (function () {
    /**
     * @param {?} storageService
     * @param {?} storageKey
     */
    function LocalStorage(storageService, storageKey) {
        this.storageKey = storageKey;
        this.version = '0.1';
        this.storage = storageService || window.localStorage;
        if (!this.storage) {
            throw new Error('miapp.LocalStorageFactory needs a storageService!');
        }
        /* todo huge refacto
                    if (!miapp.Xml) {
                        throw new Error('miapp.Xml needs to be loaded before miapp.LocalStorage!');
                    }
                    if (!miapp.Json) {
                        throw new Error('miapp.Json needs to be loaded before miapp.LocalStorage!');
                    }
                    if (!miapp.Xml.isXml || !miapp.Xml.xml2String || !miapp.Xml.string2Xml) {
                        throw new Error('miapp.Xml with isXml(), xml2String() and string2Xml() needs to be loaded before miapp.LocalStorage!');
                    }
                    if (!miapp.Json.object2String || !miapp.Json.string2Object) {
                        throw new Error('miapp.Json with object2String() and string2Object() needs to be loaded before miapp.LocalStorage!');
                    }
                    */
    }
    /**
     * Sets a key's value.
     *
     *              a string an exception is raised.
     *              compatible (Numbers, Strings, Objects etc.).
     * @param {?} key
     * @param {?} value
     * @return {?} the stored value which is a container of user value.
     */
    LocalStorage.prototype.set = function (key, value) {
        key = this.storageKey + key;
        this.checkKey(key);
        // clone the object before saving to storage
        var /** @type {?} */ t = typeof (value);
        if (t === 'undefined') {
            value = 'null';
        }
        else if (value === null) {
            value = 'null';
        }
        else if (t === 'string') {
            value = JSON.stringify({ string: value });
        }
        else if (t === 'number') {
            value = JSON.stringify({ number: value });
        }
        else if (t === 'boolean') {
            value = JSON.stringify({ bool: value });
        }
        else if (t === 'object') {
            value = JSON.stringify({ json: value });
        }
        else {
            // reject and do not insert
            // if (typeof value == "function") for example
            throw new TypeError('Value type ' + t + ' is invalid. It must be null, undefined, xml, string, number, boolean or object');
        }
        this.storage.setItem(key, value);
        return value;
    };
    
    /**
     * Looks up a key in cache
     *
     * @param {?} key
     * @param {?=} def
     * @return {?} the key value, default value or <null>
     */
    LocalStorage.prototype.get = function (key, def) {
        key = this.storageKey + key;
        this.checkKey(key);
        var /** @type {?} */ item = this.storage.getItem(key);
        if (item !== null) {
            if (item === 'null') {
                return null;
            }
            var /** @type {?} */ value = JSON.parse(item);
            /* todo
            var value = miapp.Json.string2Object(item);
            if ('xml' in value) {
                return miapp.Xml.string2Xml(value.xml);
            } else  */
            if ('string' in value) {
                return value.string;
            }
            else if ('number' in value) {
                return value.number.valueOf();
            }
            else if ('bool' in value) {
                return value.bool.valueOf();
            }
            else {
                return value.json;
            }
        }
        return !def ? null : def;
    };
    
    /**
     * Deletes a key from cache.
     *
     * @param {?} key
     * @return {?} true if key existed or false if it didn't
     */
    LocalStorage.prototype.remove = function (key) {
        key = this.storageKey + key;
        this.checkKey(key);
        var /** @type {?} */ existed = (this.storage.getItem(key) !== null);
        this.storage.removeItem(key);
        return existed;
    };
    
    /**
     * Deletes everything in cache.
     *
     * @return {?} true
     */
    LocalStorage.prototype.clear = function () {
        var /** @type {?} */ existed = (this.storage.length > 0);
        this.storage.clear();
        return existed;
    };
    
    /**
     * How much space in bytes does the storage take?
     *
     * @return {?} Number
     */
    LocalStorage.prototype.size = function () {
        return this.storage.length;
    };
    
    /**
     * Call function f on the specified context for each element of the storage
     * from index 0 to index length-1.
     * WARNING : You should not modify the storage during the loop !!!
     *
     * @param {?} f
     * @param {?} context
     * @return {?} Number of items in storage
     */
    LocalStorage.prototype.foreach = function (f, context) {
        var /** @type {?} */ n = this.storage.length;
        for (var /** @type {?} */ i = 0; i < n; i++) {
            var /** @type {?} */ key = this.storage.key(i);
            var /** @type {?} */ value = this.get(key);
            if (context) {
                // f is an instance method on instance context
                f.call(context, value);
            }
            else {
                // f is a function or class method
                f(value);
            }
        }
        return n;
    };
    
    /**
     * @param {?} key
     * @return {?}
     */
    LocalStorage.prototype.checkKey = function (key) {
        if (!key || (typeof key !== 'string')) {
            throw new TypeError('Key type must be string');
        }
        return true;
    };
    return LocalStorage;
}());
var Xor = /** @class */ (function () {
    function Xor() {
    }
    
    /**
     * @param {?} value
     * @param {?} key
     * @return {?}
     */
    Xor.encrypt = function (value, key) {
        var /** @type {?} */ result = '';
        for (var /** @type {?} */ i = 0; i < value.length; i++) {
            result += String.fromCharCode(((value[i].charCodeAt(0).toString(10))) ^ Xor.keyCharAt(key, i));
        }
        return Base64.encode(result);
    };
    
    /**
     * @param {?} value
     * @param {?} key
     * @return {?}
     */
    Xor.decrypt = function (value, key) {
        var /** @type {?} */ result = '';
        value = Base64.decode(value);
        for (var /** @type {?} */ i = 0; i < value.length; i++) {
            result += String.fromCharCode(((value[i].charCodeAt(0).toString(10))) ^ Xor.keyCharAt(key, i));
        }
        return result;
    };
    /**
     * @param {?} key
     * @param {?} i
     * @return {?}
     */
    Xor.keyCharAt = function (key, i) {
        return key[Math.floor(i % key.length)].charCodeAt(0).toString(10);
    };
    return Xor;
}());
var XHRPromise = /** @class */ (function () {
    function XHRPromise() {
        this.DEFAULT_CONTENT_TYPE = 'application/x-www-form-urlencoded; charset=UTF-8';
    }
    
    /**
     * @param {?} options
     * @return {?}
     */
    XHRPromise.prototype.send = function (options) {
        var /** @type {?} */ defaults;
        if (options == null) {
            options = {};
        }
        defaults = {
            method: 'GET',
            data: null,
            headers: {},
            async: true,
            username: null,
            password: null,
            withCredentials: false
        };
        options = Object.assign({}, defaults, options);
        return new Promise((function (_this) {
            return function (resolve, reject) {
                var /** @type {?} */ e, /** @type {?} */ header, /** @type {?} */ ref, /** @type {?} */ value, /** @type {?} */ xhr;
                if (!XMLHttpRequest) {
                    _this._handleError('browser', reject, null, 'browser doesn\'t support XMLHttpRequest');
                    return;
                }
                if (typeof options.url !== 'string' || options.url.length === 0) {
                    _this._handleError('url', reject, null, 'URL is a required parameter');
                    return;
                }
                _this._xhr = xhr = new XMLHttpRequest;
                xhr.onload = function () {
                    var /** @type {?} */ responseText;
                    _this._detachWindowUnload();
                    try {
                        responseText = _this._getResponseText();
                    }
                    catch (_error) {
                        _this._handleError('parse', reject, null, 'invalid JSON response');
                        return;
                    }
                    return resolve({
                        url: _this._getResponseUrl(),
                        status: xhr.status,
                        statusText: xhr.statusText,
                        responseText: responseText,
                        headers: _this._getHeaders(),
                        xhr: xhr
                    });
                };
                xhr.onerror = function () {
                    return _this._handleError('error', reject);
                };
                xhr.ontimeout = function () {
                    return _this._handleError('timeout', reject);
                };
                xhr.onabort = function () {
                    return _this._handleError('abort', reject);
                };
                _this._attachWindowUnload();
                xhr.open(options.method, options.url, options.async, options.username, options.password);
                if (options.withCredentials) {
                    xhr.withCredentials = true;
                }
                if ((options.data != null) && !options.headers['Content-Type']) {
                    options.headers['Content-Type'] = _this.DEFAULT_CONTENT_TYPE;
                }
                ref = options.headers;
                for (header in ref) {
                    if (ref.hasOwnProperty(header)) {
                        value = ref[header];
                        xhr.setRequestHeader(header, value);
                    }
                }
                try {
                    return xhr.send(options.data);
                }
                catch (_error) {
                    e = _error;
                    return _this._handleError('send', reject, null, e.toString());
                }
            };
        })(this));
    };
    
    /**
     * @return {?}
     */
    XHRPromise.prototype.getXHR = function () {
        return this._xhr;
    };
    
    /**
     * @return {?}
     */
    XHRPromise.prototype._attachWindowUnload = function () {
        this._unloadHandler = this._handleWindowUnload.bind(this);
        if (((window)).attachEvent) {
            return ((window)).attachEvent('onunload', this._unloadHandler);
        }
    };
    
    /**
     * @return {?}
     */
    XHRPromise.prototype._detachWindowUnload = function () {
        if (((window)).detachEvent) {
            return ((window)).detachEvent('onunload', this._unloadHandler);
        }
    };
    
    /**
     * @return {?}
     */
    XHRPromise.prototype._getHeaders = function () {
        return this._parseHeaders(this._xhr.getAllResponseHeaders());
    };
    
    /**
     * @return {?}
     */
    XHRPromise.prototype._getResponseText = function () {
        var /** @type {?} */ responseText;
        responseText = typeof this._xhr.responseText === 'string' ? this._xhr.responseText : '';
        switch ((this._xhr.getResponseHeader('Content-Type') || '').split(';')[0]) {
            case 'application/json':
            case 'text/javascript':
                responseText = JSON.parse(responseText + '');
        }
        return responseText;
    };
    
    /**
     * @return {?}
     */
    XHRPromise.prototype._getResponseUrl = function () {
        if (this._xhr.responseURL != null) {
            return this._xhr.responseURL;
        }
        if (/^X-Request-URL:/m.test(this._xhr.getAllResponseHeaders())) {
            return this._xhr.getResponseHeader('X-Request-URL');
        }
        return '';
    };
    
    /**
     * @param {?} reason
     * @param {?} reject
     * @param {?=} status
     * @param {?=} statusText
     * @return {?}
     */
    XHRPromise.prototype._handleError = function (reason, reject, status, statusText) {
        this._detachWindowUnload();
        return reject({
            reason: reason,
            status: status || this._xhr.status,
            statusText: statusText || this._xhr.statusText,
            xhr: this._xhr
        });
    };
    
    /**
     * @return {?}
     */
    XHRPromise.prototype._handleWindowUnload = function () {
        return this._xhr.abort();
    };
    
    /**
     * @param {?} str
     * @return {?}
     */
    XHRPromise.prototype.trim = function (str) {
        return str.replace(/^\s*|\s*$/g, '');
    };
    /**
     * @param {?} arg
     * @return {?}
     */
    XHRPromise.prototype.isArray = function (arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
    /**
     * @param {?} list
     * @param {?} iterator
     * @return {?}
     */
    XHRPromise.prototype.forEach = function (list, iterator) {
        if (toString.call(list) === '[object Array]') {
            this.forEachArray(list, iterator, this);
        }
        else if (typeof list === 'string') {
            this.forEachString(list, iterator, this);
        }
        else {
            this.forEachObject(list, iterator, this);
        }
    };
    /**
     * @param {?} array
     * @param {?} iterator
     * @param {?} context
     * @return {?}
     */
    XHRPromise.prototype.forEachArray = function (array, iterator, context) {
        for (var /** @type {?} */ i = 0, /** @type {?} */ len = array.length; i < len; i++) {
            if (array.hasOwnProperty(i)) {
                iterator.call(context, array[i], i, array);
            }
        }
    };
    /**
     * @param {?} string
     * @param {?} iterator
     * @param {?} context
     * @return {?}
     */
    XHRPromise.prototype.forEachString = function (string, iterator, context) {
        for (var /** @type {?} */ i = 0, /** @type {?} */ len = string.length; i < len; i++) {
            // no such thing as a sparse string.
            iterator.call(context, string.charAt(i), i, string);
        }
    };
    /**
     * @param {?} object
     * @param {?} iterator
     * @param {?} context
     * @return {?}
     */
    XHRPromise.prototype.forEachObject = function (object, iterator, context) {
        for (var /** @type {?} */ k in object) {
            if (object.hasOwnProperty(k)) {
                iterator.call(context, object[k], k, object);
            }
        }
    };
    /**
     * @param {?} headers
     * @return {?}
     */
    XHRPromise.prototype._parseHeaders = function (headers) {
        var _this = this;
        if (!headers) {
            return {};
        }
        var /** @type {?} */ result = {};
        this.forEach(this.trim(headers).split('\n'), function (row) {
            var /** @type {?} */ index = row.indexOf(':'), /** @type {?} */ key = _this.trim(row.slice(0, index)).toLowerCase(), /** @type {?} */ value = _this.trim(row.slice(index + 1));
            if (typeof (result[key]) === 'undefined') {
                result[key] = value;
            }
            else if (_this.isArray(result[key])) {
                result[key].push(value);
            }
            else {
                result[key] = [result[key], value];
            }
        });
        return result;
    };
    return XHRPromise;
}());
var Ajax = /** @class */ (function () {
    function Ajax() {
        this.xhr = new XHRPromise();
    }
    
    /**
     * @param {?} args
     * @return {?}
     */
    Ajax.prototype.post = function (args) {
        var /** @type {?} */ opt = {
            method: 'POST',
            url: args.url,
            data: JSON.stringify(args.data)
        };
        if (args.headers) {
            opt.headers = args.headers;
        }
        return this.xhr
            .send(opt)
            .then(function (res) {
            // console.log('res:', res);
            if (res.status &&
                (parseInt(res.status, 10) < 200 || parseInt(res.status, 10) >= 300)) {
                res.reason = 'status';
                return Promise.reject(res);
            }
            return Promise.resolve(res.responseText);
        });
    };
    /**
     * @param {?} args
     * @return {?}
     */
    Ajax.prototype.put = function (args) {
        var /** @type {?} */ opt = {
            method: 'PUT',
            url: args.url,
            data: JSON.stringify(args.data)
        };
        if (args.headers) {
            opt.headers = args.headers;
        }
        return this.xhr
            .send(opt)
            .then(function (res) {
            // console.log('res:', res);
            if (res.status &&
                (parseInt(res.status, 10) < 200 || parseInt(res.status, 10) >= 300)) {
                res.reason = 'status';
                return Promise.reject(res);
            }
            return Promise.resolve(res.responseText);
        });
    };
    /**
     * @param {?} args
     * @return {?}
     */
    Ajax.prototype.delete = function (args) {
        var /** @type {?} */ opt = {
            method: 'DELETE',
            url: args.url,
            data: JSON.stringify(args.data)
        };
        if (args.headers) {
            opt.headers = args.headers;
        }
        return this.xhr
            .send(opt)
            .then(function (res) {
            // console.log('res:', res);
            if (res.status &&
                (parseInt(res.status, 10) < 200 || parseInt(res.status, 10) >= 300)) {
                res.reason = 'status';
                return Promise.reject(res);
            }
            return Promise.resolve(res.responseText);
        });
    };
    /**
     * @param {?} args
     * @return {?}
     */
    Ajax.prototype.get = function (args) {
        var /** @type {?} */ opt = {
            method: 'GET',
            url: args.url
        };
        if (args.data) {
            opt.data = args.data;
        }
        if (args.headers) {
            opt.headers = args.headers;
        }
        // console.log('send:', opt);
        return this.xhr
            .send(opt)
            .then(function (res) {
            // console.log('res:', res);
            if (res.status &&
                (parseInt(res.status, 10) < 200 || parseInt(res.status, 10) >= 300)) {
                res.reason = 'status';
                return Promise.reject(res);
            }
            return Promise.resolve(res.responseText);
        });
    };
    return Ajax;
}());
var Client = /** @class */ (function () {
    /**
     * @param {?} appId
     * @param {?} URI
     * @param {?} storage
     * @param {?} sdk
     */
    function Client(appId, URI, storage, sdk) {
        this.appId = appId;
        this.URI = URI;
        this.storage = storage;
        this.sdk = sdk;
        var uuid = this.storage.get('uuid') || 'uuid-' + Math.random();
        var info = this.storage.get('info');
        if (!info && window && window.navigator) {
            info = window.navigator.appName + '@' + window.navigator.appVersion + '-' + window.navigator.userAgent;
        }
        if (window && window['device'] && window['device'].uuid) {
            uuid = window['device'].uuid;
        }
        this.setClientUuid(uuid);
        this.setClientInfo(info);
        this.refreshToken = this.storage.get('refreshToken');
        this.clientId = this.storage.get('clientId');
    }
    
    /**
     * @param {?} value
     * @return {?}
     */
    Client.prototype.setClientId = function (value) {
        this.clientId = value;
        this.storage.set('clientId', this.clientId);
    };
    /**
     * @param {?} value
     * @return {?}
     */
    Client.prototype.setClientUuid = function (value) {
        this.clientUuid = value;
        this.storage.set('clientUuid', this.clientUuid);
    };
    /**
     * @param {?} value
     * @return {?}
     */
    Client.prototype.setClientInfo = function (value) {
        this.clientInfo = value;
        // this.storage.set('clientInfo', this.clientInfo);
    };
    /**
     * @param {?} value
     * @return {?}
     */
    Client.prototype.setRefreshToken = function (value) {
        this.refreshToken = value;
        this.storage.set('refreshToken', this.refreshToken);
    };
    /**
     * @param {?} login
     * @param {?} password
     * @param {?=} updateProperties
     * @return {?}
     */
    Client.prototype.login = function (login, password, updateProperties) {
        var _this = this;
        if (!this.URI) {
            console.error('no api uri');
            return Promise.reject({ code: 408, msg: 'no api uri' });
        }
        var /** @type {?} */ urlLogin = this.URI + '/users';
        var /** @type {?} */ dataLogin = {
            name: login,
            username: login,
            email: login,
            password: password
        };
        return new Ajax()
            .post({
            url: urlLogin,
            data: dataLogin,
            headers: { 'Content-Type': 'application/json', 'Accept': 'text/json' }
        })
            .then(function (createdUser) {
            _this.setClientId(createdUser._id);
            var /** @type {?} */ urlToken = _this.URI + '/oauth/token';
            var /** @type {?} */ dataToken = {
                grant_type: 'client_credentials',
                client_id: _this.clientId,
                client_secret: password,
                client_udid: _this.clientUuid,
                client_info: _this.clientInfo,
                audience: _this.appId,
                scope: JSON.stringify(_this.sdk)
            };
            return new Ajax()
                .post({
                url: urlToken,
                data: dataToken,
                headers: { 'Content-Type': 'application/json', 'Accept': 'text/json' }
            });
        });
    };
    /**
     * @return {?}
     */
    Client.prototype.reAuthenticate = function () {
        if (!this.URI) {
            console.error('no api uri');
            return Promise.reject({ code: 408, msg: 'no api uri' });
        }
        var /** @type {?} */ url = this.URI + '/oauth/token';
        var /** @type {?} */ data = {
            grant_type: 'refresh_token',
            client_id: this.clientId,
            client_udid: this.clientUuid,
            client_info: this.clientInfo,
            audience: this.appId,
            scope: JSON.stringify(this.sdk),
            refresh_token: this.refreshToken,
            refresh_extra: Client.refreshCount++,
        };
        return new Ajax()
            .post({
            url: url,
            data: data,
            headers: { 'Content-Type': 'application/json', 'Accept': 'text/json' }
        });
    };
    /**
     * @return {?}
     */
    Client.prototype.logout = function () {
        if (!this.URI) {
            console.error('no api uri');
            return Promise.reject({ code: 408, msg: 'no api uri' });
        }
        var /** @type {?} */ url = this.URI + '/oauth/revoke';
        if (!this.refreshToken || !this.clientId) {
            return Promise.resolve();
        }
        var /** @type {?} */ data = {
            token: this.refreshToken,
            client_id: this.clientId,
            client_udid: this.clientUuid,
            client_info: this.clientInfo,
            audience: this.appId,
            scope: JSON.stringify(this.sdk)
        };
        this.setRefreshToken(null);
        Client.refreshCount = 0;
        return new Ajax()
            .post({
            url: url,
            data: data,
            headers: { 'Content-Type': 'application/json', 'Accept': 'text/json' }
        });
    };
    /**
     * @return {?}
     */
    Client.prototype.isReady = function () {
        return !!this.URI;
    };
    return Client;
}());
Client.refreshCount = 0;
var Connection = /** @class */ (function () {
    /**
     * @param {?} _sdk
     * @param {?} _storage
     */
    function Connection(_sdk, _storage) {
        this._sdk = _sdk;
        this._storage = _storage;
        this._client = null;
        this._user = null;
        this._cryptoSalt = this._storage.get('_cryptoSalt') || null;
        this.accessToken = this._storage.get('accessToken') || null;
        this.accessTokenPrevious = this._storage.get('accessTokenPrevious') || null;
        this.idToken = this._storage.get('idToken') || null;
        this.refreshToken = this._storage.get('refreshToken') || null;
        this.states = this._storage.get('states') || {};
        this.endpoints = [];
    }
    
    /**
     * @return {?}
     */
    Connection.prototype.isReady = function () {
        return !!this._client && this._client.isReady();
    };
    /**
     * @return {?}
     */
    Connection.prototype.destroy = function () {
        this._storage.remove('accessToken');
        this._storage.remove('idToken');
        this._storage.remove('refreshToken');
        this._storage.remove('states');
        this._storage.remove('_cryptoSalt');
        // Backup - do not remove : this._storage.remove('accessTokenPrevious');
        if (this.accessToken) {
            this.accessTokenPrevious = this.accessToken;
            this._storage.set('accessTokenPrevious', this.accessTokenPrevious);
        }
        this._user = null;
        if (this._client) {
            this._client.setClientId(null);
        }
        this.accessToken = null;
        this.idToken = null;
        this.refreshToken = null;
        this.states = {}; // new Map<string, boolean>();
    };
    /**
     * @param {?} client
     * @return {?}
     */
    Connection.prototype.setClient = function (client) {
        this._client = client;
        if (!this._user) {
            this._user = {};
        }
        this._user._id = this._client.clientId;
        this._user._name = JSON.parse(this.getIdPayload({ name: '' })).name;
    };
    /**
     * @param {?} user
     * @return {?}
     */
    Connection.prototype.setUser = function (user) {
        this._user = user;
        if (this._user._id) {
            this._client.setClientId(this._user._id);
        }
    };
    /**
     * @return {?}
     */
    Connection.prototype.getUser = function () {
        return this._user;
    };
    /**
     * @return {?}
     */
    Connection.prototype.getUserId = function () {
        return this._user ? this._user._id : null;
    };
    /**
     * @return {?}
     */
    Connection.prototype.getClient = function () {
        return this._client;
    };
    /**
     * @param {?} value
     * @return {?}
     */
    Connection.prototype.setCryptoSalt = function (value) {
        // this.miappCrypto = true;
        this._cryptoSalt = value;
        this._storage.set('_cryptoSalt', this._cryptoSalt);
    };
    /**
     * @param {?} data
     * @return {?}
     */
    Connection.prototype.encrypt = function (data) {
        if (typeof data !== 'string') {
            data = JSON.stringify(data);
        }
        if (this.miappCrypto && this._cryptoSalt) {
            // const key = '' + this.miappId + '' + this.getClientId();
            var /** @type {?} */ key = this._cryptoSalt;
            return Xor.encrypt(data, key);
        }
        else {
            return data;
        }
    };
    /**
     * @param {?} data
     * @return {?}
     */
    Connection.prototype.decrypt = function (data) {
        var /** @type {?} */ decrypted = data;
        if (this.miappCrypto && this._cryptoSalt) {
            // const key = '' + this.miappId + '' + this.getClientId();
            var /** @type {?} */ key = this._cryptoSalt;
            decrypted = Xor.decrypt(data, key);
        }
        try {
            decrypted = JSON.parse(decrypted);
        }
        catch (err) {
        }
        return decrypted;
    };
    /**
     * @return {?}
     */
    Connection.prototype.isLogin = function () {
        var /** @type {?} */ exp = true;
        try {
            var /** @type {?} */ payload = this.refreshToken.split('.')[1];
            var /** @type {?} */ decoded = JSON.parse(Base64.decode(payload));
            exp = ((new Date().getTime() / 1000) >= decoded.exp);
        }
        catch (e) {
        }
        return !exp;
    };
    
    /**
     * @return {?}
     */
    Connection.prototype.getClientId = function () {
        if (!this._client) {
            return null;
        }
        return this._client.clientId;
    };
    /**
     * @param {?=} def
     * @return {?}
     */
    Connection.prototype.getIdPayload = function (def) {
        if (def && typeof def !== 'string') {
            def = JSON.stringify(def);
        }
        try {
            var /** @type {?} */ payload = this.idToken.split('.')[1];
            if (payload) {
                return Base64.decode(payload);
            }
        }
        catch (e) {
        }
        return def ? def : null;
    };
    /**
     * @param {?=} def
     * @return {?}
     */
    Connection.prototype.getAccessPayload = function (def) {
        if (def && typeof def !== 'string') {
            def = JSON.stringify(def);
        }
        try {
            var /** @type {?} */ payload = this.accessToken.split('.')[1];
            if (payload) {
                return Base64.decode(payload);
            }
        }
        catch (e) {
        }
        return def ? def : null;
    };
    /**
     * @param {?=} def
     * @return {?}
     */
    Connection.prototype.getPreviousAccessPayload = function (def) {
        if (def && typeof def !== 'string') {
            def = JSON.stringify(def);
        }
        try {
            var /** @type {?} */ payload = this.accessTokenPrevious.split('.')[1];
            if (payload) {
                return Base64.decode(payload);
            }
        }
        catch (e) {
        }
        return def ? def : null;
    };
    /**
     * @return {?}
     */
    Connection.prototype.refreshConnection = function () {
        var _this = this;
        var /** @type {?} */ code = 0;
        // token not expired : ok
        if (this.accessToken) {
            var /** @type {?} */ payload = this.accessToken.split('.')[1];
            var /** @type {?} */ decoded = Base64.decode(payload);
            // console.log('new Date().getTime() < JSON.parse(decoded).exp :', (new Date().getTime() / 1000), JSON.parse(decoded).exp);
            if ((new Date().getTime() / 1000) < JSON.parse(decoded).exp) {
                return Promise.resolve(code);
            }
        }
        // remove expired refreshToken
        if (this.refreshToken) {
            var /** @type {?} */ payload = this.refreshToken.split('.')[1];
            var /** @type {?} */ decoded = Base64.decode(payload);
            if ((new Date().getTime() / 1000) >= JSON.parse(decoded).exp) {
                this._storage.remove('refreshToken');
            }
        }
        // remove expired accessToken & idToken & store it as Previous one
        this.accessTokenPrevious = this.accessToken;
        this._storage.set('accessTokenPrevious', this.accessTokenPrevious);
        this._storage.remove('accessToken');
        this._storage.remove('idToken');
        this.accessToken = null;
        this.idToken = null;
        // refresh authentication
        return new Promise(function (resolve, reject) {
            _this.getClient().reAuthenticate()
                .then(function (user) {
                _this.setConnection(user);
                resolve(user);
            })
                .catch(function (err) {
                if (err && err.code === 408) {
                    code = 408; // no api uri or basic timeout : offline
                }
                else if (err && err.code === 404) {
                    code = 404; // page not found : offline
                }
                else if (err && err.code === 410) {
                    code = 403; // token expired or device not sure : need relogin
                }
                else if (err) {
                    code = 403; // forbidden : need relogin
                }
                resolve(code);
            });
        });
    };
    
    /**
     * @param {?} clientUser
     * @return {?}
     */
    Connection.prototype.setConnection = function (clientUser) {
        // only in private storage
        if (clientUser.access_token) {
            this.accessToken = clientUser.access_token;
            this._storage.set('accessToken', this.accessToken);
            delete clientUser.access_token;
            var /** @type {?} */ salt = JSON.parse(this.getAccessPayload({ salt: '' })).salt;
            if (salt) {
                this.setCryptoSalt(salt);
            }
        }
        if (clientUser.id_token) {
            this.idToken = clientUser.id_token;
            this._storage.set('idToken', this.idToken);
            delete clientUser.id_token;
        }
        if (clientUser.refresh_token) {
            this.refreshToken = clientUser.refresh_token;
            this._storage.set('refreshToken', this.refreshToken);
            delete clientUser.refresh_token;
        }
        // expose roles, message
        // clientUser.roles = self.miappRoles();
        // clientUser.message = self.miappMessage();
        clientUser.roles = JSON.parse(this.getIdPayload({ roles: [] })).roles;
        clientUser.message = JSON.parse(this.getIdPayload({ message: '' })).message;
        this.setUser(clientUser);
    };
    
    /**
     * @param {?} options
     * @return {?}
     */
    Connection.prototype.setConnectionOffline = function (options) {
        // if (this.user) {
        //     this.user._id = 'demo';
        // }
        // if (this.client) {
        //     this.client.clientId = 'demo';
        // }
        // const tmp = tools.Base64.encode(JSON.stringify({}));
        // this.accessToken = tmp + '.' + tmp + '.' + tmp;
        this.accessToken = options.accessToken;
        this.idToken = options.idToken;
        this.refreshToken = options.refreshToken;
        this.setUser({
            roles: JSON.parse(this.getIdPayload({ roles: [] })).roles,
            message: JSON.parse(this.getIdPayload({ message: '' })).message,
            _id: 'demo'
        });
    };
    /**
     * @param {?=} options
     * @return {?}
     */
    Connection.prototype.getEndpoints = function (options) {
        var /** @type {?} */ ea = ['https://miapp.io/api', 'https://miapp-proxy.herokuapp.com/api'];
        var /** @type {?} */ filteredEa = [];
        if (!this._sdk.prod) {
            ea = ['http://localhost:5894/api', 'https://miapp-sandbox.herokuapp.com/api'];
        }
        if (this.accessToken) {
            var /** @type {?} */ endpoints = JSON.parse(this.getAccessPayload({ endpoints: {} })).endpoints;
            if (endpoints.length) {
                ea = [];
                endpoints.forEach(function (endpoint) {
                    ea.push(endpoint.uri);
                });
            }
        }
        if (this.accessTokenPrevious) {
            var /** @type {?} */ endpoints = JSON.parse(this.getPreviousAccessPayload({ endpoints: {} })).endpoints;
            if (endpoints.length) {
                endpoints.forEach(function (endpoint) {
                    if (ea.indexOf(endpoint.uri) < 0) {
                        ea.push(endpoint.uri);
                    }
                });
            }
        }
        if (options && options.filter && options.filter === 'theBestOne') {
            if (this.states && Object.keys(this.states).length) {
                for (var /** @type {?} */ i = 0; (i < ea.length) && (filteredEa.length === 0); i++) {
                    var /** @type {?} */ endpoint = ea[i];
                    if (this.states[endpoint] && this
                        .states[endpoint].state) {
                        filteredEa.push(endpoint);
                    }
                }
            }
            else if (ea.length) {
                filteredEa = [ea[0]];
            }
        }
        else {
            filteredEa = ea;
        }
        return filteredEa;
    };
    
    /**
     * @param {?=} options
     * @return {?}
     */
    Connection.prototype.getDBs = function (options) {
        if (!this.accessToken) {
            return [];
        }
        var /** @type {?} */ random = Math.random() % 2;
        var /** @type {?} */ dbs = JSON.parse(this.getAccessPayload({ dbs: [] })).dbs || [];
        // need to synchronize db
        if (random === 0) {
            dbs = dbs.sort();
        }
        else if (random === 1) {
            dbs = dbs.reverse();
        }
        var /** @type {?} */ filteredDBs = [];
        if (options && options.filter && options.filter === 'theBestOne') {
            if (this.states && Object.keys(this.states).length) {
                for (var /** @type {?} */ i = 0; (i < dbs.length) && (filteredDBs.length === 0); i++) {
                    var /** @type {?} */ endpoint = dbs[i];
                    if (this.states[endpoint].state) {
                        filteredDBs.push(endpoint);
                    }
                }
            }
            else if (dbs.length) {
                filteredDBs = [dbs[0]];
            }
        }
        else {
            filteredDBs = dbs;
        }
        return filteredDBs;
    };
    
    /**
     * @return {?}
     */
    Connection.prototype.verifyConnectionStates = function () {
        var _this = this;
        var /** @type {?} */ currentTime = new Date().getTime();
        // todo need verification ? not yet (cache)
        // if (Object.keys(this.states).length > 0) {
        //     const time = this.states[Object.keys(this.states)[0]].time;
        //     if (currentTime < time) {
        //         return Promise.resolve();
        //     }
        // }
        // verify via GET status on Endpoints & DBs
        var /** @type {?} */ promises = [];
        this.states = {};
        this.endpoints = this.getEndpoints();
        this.endpoints.forEach(function (endpoint) {
            promises.push(new Promise(function (resolve, reject) {
                // console.log(endpoint + '/status?isok=' + this._sdk.version);
                new Ajax()
                    .get({
                    url: endpoint + '/status?isok=' + _this._sdk.version,
                    headers: { 'Content-Type': 'application/json', 'Accept': 'text/json' }
                })
                    .then(function (data) {
                    var /** @type {?} */ state = false;
                    if (data && data.isok) {
                        state = true;
                    }
                    _this.states[endpoint] = { state: state, time: currentTime };
                    resolve();
                })
                    .catch(function (err) {
                    _this.states[endpoint] = { state: false, time: currentTime };
                    resolve();
                });
            }));
        });
        var /** @type {?} */ dbs = this.getDBs();
        dbs.forEach(function (dbEndpoint) {
            promises.push(new Promise(function (resolve, reject) {
                new Ajax()
                    .get({
                    url: dbEndpoint,
                    headers: { 'Content-Type': 'application/json', 'Accept': 'text/json' }
                })
                    .then(function (data) {
                    _this.states[dbEndpoint] = { state: true, time: currentTime };
                    resolve();
                })
                    .catch(function (err) {
                    _this.states[dbEndpoint] = { state: false, time: currentTime };
                    resolve();
                });
            }));
        });
        return Promise.all(promises);
    };
    
    return Connection;
}());
// import PouchDB from 'pouchdb';
// let PouchDB: any;
var Pouch = window['PouchDB'] || require('pouchdb').default;
var Session = /** @class */ (function () {
    function Session() {
        this.db = null;
        this.dbRecordCount = 0;
        this.dbLastSync = null;
        this.remoteDb = null;
        this.dbs = [];
    }
    
    /**
     * @return {?}
     */
    Session.prototype.isReady = function () {
        return !!this.db;
    };
    /**
     * @param {?=} force
     * @return {?}
     */
    Session.prototype.create = function (force) {
        if (force || !this.db) {
            this.dbRecordCount = 0;
            this.dbLastSync = new Date().getTime();
            this.db = {};
            this.db = new Pouch('miapp_db'); // , {adapter: 'websql'} ???
        }
    };
    /**
     * @return {?}
     */
    Session.prototype.destroy = function () {
        var _this = this;
        var /** @type {?} */ cleanSessionFn = function () {
            _this.dbRecordCount = 0;
            _this.dbLastSync = null;
        };
        if (!this.db) {
            cleanSessionFn();
            return Promise.resolve();
        }
        if (this.db && !this.db.destroy) {
            return Promise.reject('miapp.sdk.service._removeSession : DB clean impossible.');
        }
        return new Promise(function (resolve, reject) {
            _this.db.destroy(function (err, info) {
                if (err) {
                    reject(err);
                }
                else {
                    cleanSessionFn();
                    resolve();
                }
            });
        });
    };
    
    /**
     * @param {?} dbs
     * @return {?}
     */
    Session.prototype.setRemote = function (dbs) {
        this.dbs = dbs;
    };
    /**
     * @param {?} userId
     * @return {?}
     */
    Session.prototype.sync = function (userId) {
        var _this = this;
        if (!this.db) {
            return Promise.reject({ code: 408, msg: 'need db' });
        }
        if (!this.dbs || !this.dbs.length) {
            return Promise.reject({ code: 408, msg: 'need db remote' });
        }
        return new Promise(function (resolve, reject) {
            try {
                if (!_this.remoteDb || _this.remoteUri !== _this.dbs[0]) {
                    _this.remoteUri = _this.dbs[0];
                    _this.remoteDb = new Pouch(_this.remoteUri);
                    // todo , {headers: {'Authorization': 'Bearer ' + id_token}});
                }
                _this.db
                    .sync(_this.remoteDb, {
                    filter: function (doc) {
                        if (!userId) {
                            return;
                        }
                        else if (doc && doc.miappUserId === userId) {
                            return doc;
                        }
                    }
                })
                    .on('complete', function (info) { return resolve(info); })
                    .on('error', function (err) { return reject({ code: 401, msg: err }); })
                    .on('denied', function (err) { return reject({ code: 403, msg: err }); });
            }
            catch (err) {
                reject({ code: 500, msg: err });
            }
        });
    };
    /**
     * @param {?} data
     * @param {?} _id
     * @param {?} uid
     * @param {?} oid
     * @param {?} ave
     * @param {?=} crypto
     * @return {?}
     */
    Session.prototype.put = function (data, _id, uid, oid, ave, crypto) {
        var _this = this;
        if (!this.db) {
            return Promise.reject('need db');
        }
        if (!data || !_id || !uid || !oid || !ave) {
            return Promise.reject('need formated data');
        }
        var /** @type {?} */ dataWithoutIds = JSON.parse(JSON.stringify(data));
        delete dataWithoutIds._id;
        delete dataWithoutIds._rev;
        delete dataWithoutIds.miappUserId;
        delete dataWithoutIds.miappOrgId;
        delete dataWithoutIds.miappAppVersion;
        delete dataWithoutIds.miappData;
        var /** @type {?} */ resultAsString = this.write(this.value(dataWithoutIds));
        if (crypto) {
            resultAsString = crypto.obj[crypto.method](resultAsString);
        }
        var /** @type {?} */ toStore = {
            _id: _id,
            miappUserId: uid,
            miappOrgId: oid,
            miappAppVersion: ave,
            miappData: resultAsString
        };
        return new Promise(function (resolve, reject) {
            _this.db.put(toStore, function (err, response) {
                if (response && response.ok && response.id && response.rev) {
                    // data._id = response.id;
                    // data._rev = response.rev;
                    _this.dbRecordCount++;
                    resolve(response.id);
                }
                else {
                    reject(err);
                }
            });
        });
    };
    /**
     * @param {?} data_id
     * @return {?}
     */
    Session.prototype.remove = function (data_id) {
        var _this = this;
        if (!this.db) {
            return Promise.reject('need db');
        }
        return new Promise(function (resolve, reject) {
            _this.db.get(data_id)
                .then(function (doc) {
                doc._deleted = true;
                return _this.db.put(doc);
            })
                .then(function (result) {
                resolve();
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    /**
     * @param {?} data_id
     * @param {?=} crypto
     * @return {?}
     */
    Session.prototype.get = function (data_id, crypto) {
        var _this = this;
        if (!this.db) {
            return Promise.reject('need db');
        }
        return new Promise(function (resolve, reject) {
            _this.db.get(data_id)
                .then(function (row) {
                if (!!row && !!row.miappData) {
                    var /** @type {?} */ data = row.miappData;
                    if (crypto) {
                        data = crypto.obj[crypto.method](data);
                    }
                    else {
                        data = JSON.parse(data);
                    }
                    var /** @type {?} */ result = data;
                    result._id = row._id;
                    result._rev = row._rev;
                    result = JSON.parse(JSON.stringify(result));
                    resolve(result);
                }
                else {
                    reject('none');
                }
            })
                .catch(function (err) { return reject(err); });
        });
    };
    /**
     * @param {?=} crypto
     * @return {?}
     */
    Session.prototype.getAll = function (crypto) {
        var _this = this;
        if (!this.db) {
            return Promise.reject('need db');
        }
        return new Promise(function (resolve, reject) {
            _this.db.allDocs({ include_docs: true, descending: true })
                .then(function (rows) {
                var /** @type {?} */ all = [];
                rows.rows.forEach(function (row) {
                    if (!!row && !!row.doc.miappData && !!row.doc._id) {
                        var /** @type {?} */ data = row.doc.miappData;
                        if (crypto) {
                            data = crypto.obj[crypto.method](data);
                        }
                        else {
                            data = JSON.parse(data);
                        }
                        var /** @type {?} */ result = data;
                        result._id = row.doc._id;
                        result._rev = row.doc._rev;
                        result = JSON.parse(JSON.stringify(result));
                        all.push(result);
                    }
                    else {
                        // todo reject('row format pb');
                    }
                });
                resolve(all);
            })
                .catch(function (err) { return reject(err); });
        });
    };
    /**
     * @return {?}
     */
    Session.prototype.isEmpty = function () {
        var _this = this;
        if (!this.db) {
            return Promise.reject('need db');
        }
        return new Promise(function (resolve, reject) {
            _this.db
                .allDocs({})
                .then(function (response) {
                if (!response) {
                    reject();
                }
                else {
                    _this.dbRecordCount = response.total_rows;
                    if (response.total_rows && response.total_rows > 0) {
                        resolve(false);
                    }
                    else {
                        resolve(true);
                    }
                }
            })
                .catch(function (err) { return reject(err); });
        });
    };
    /**
     * @return {?}
     */
    Session.prototype.info = function () {
        if (!this.db) {
            return Promise.reject('none');
        }
        return this.db.info();
    };
    /**
     * @param {?} item
     * @return {?}
     */
    Session.prototype.write = function (item) {
        var /** @type {?} */ value = 'null';
        var /** @type {?} */ t = typeof (item);
        if (t === 'undefined') {
            value = 'null';
        }
        else if (value === null) {
            value = 'null';
        }
        else if (t === 'string') {
            value = JSON.stringify({ string: item });
        }
        else if (t === 'number') {
            value = JSON.stringify({ number: item });
        }
        else if (t === 'boolean') {
            value = JSON.stringify({ bool: item });
        }
        else if (t === 'object') {
            value = JSON.stringify({ json: item });
        }
        return value;
    };
    /**
     * @param {?} item
     * @return {?}
     */
    Session.prototype.value = function (item) {
        var /** @type {?} */ t = typeof (item);
        if (t !== 'object') {
            return item;
        }
        if ('string' in item) {
            return item.string;
        }
        else if ('number' in item) {
            return item.number.valueOf();
        }
        else if ('bool' in item) {
            return item.bool.valueOf();
        }
        else if ('json' in item) {
            return item.json;
        }
        else {
            return item;
        }
    };
    return Session;
}());
// import PouchDB from 'pouchdb';
// import * as PouchDB from 'pouchdb/dist/pouchdb.js';
// import PouchDB from 'pouchdb/dist/pouchdb.js';
/**
 * usefull only for miapp.io dev team
 */
var InternalService = /** @class */ (function () {
    /**
     * @param {?} logger
     * @param {?} promise
     */
    function InternalService(logger, promise) {
        this.sdk = {
            org: 'miapp.io',
            version: version,
            prod: false
        };
        this.logger = {
            log: function () {
            }, error: function () {
            }, warn: function () {
            }
        };
        if (logger) {
            this.logger = logger;
        }
        this.logger.log('miapp.sdk.service : constructor');
        if (promise) {
            this.promise = promise;
        }
        this.storage = new LocalStorage(window.localStorage, 'miapp.');
        this.session = new Session();
        this.connection = new Connection(this.sdk, this.storage);
    }
    /**
     * Init connection & session
     * Check uri
     * Done each app start
     *
     * @param {?} miappId
     * @param {?=} options Optional settings
     * @return {?}
     */
    InternalService.prototype.miappInit = function (miappId, options) {
        var /** @type {?} */ self = this;
        self.logger.log('miapp.sdk.service.miappInit : ', options);
        if (!miappId) {
            self.logger.error('miapp.sdk.service.miappInit : bad init');
            return self.promise.reject('miapp.sdk.service.miappInit : bad init');
        }
        self.sdk.prod = options ? !!options.prod : true;
        return new self.promise(function (resolve, reject) {
            self.connection.verifyConnectionStates()
                .then(function () {
                self.connection.miappId = miappId;
                self.connection.miappVersion = self.sdk.version;
                self.connection.miappCrypto = options ? !!options.crypto : false;
                var /** @type {?} */ url = self.connection.getEndpoints({ filter: 'theBestOne' })[0];
                if (!url && self.sdk.prod) {
                    self.logger.warn('miapp.sdk.service.miappInit : no endpoint is nowly available, switch to dev mode.');
                    reject('miapp.sdk.service.miappInit: endpoint connection required');
                }
                else {
                    self.connection.setClient(new Client(self.connection.miappId, url, self.storage, self.sdk));
                    resolve();
                }
            })
                .catch(function (err) {
                self.logger.error('miapp.sdk.service.miappInit : ', err);
                reject('miapp.sdk.service.miappInit: ' + err.toString());
            });
        });
    };
    
    /**
     * Call it if miappIsLogin() === false
     * Erase all (db & storage)
     *
     * @param {?} login
     * @param {?} password
     * @return {?}
     */
    InternalService.prototype.miappLogin = function (login, password) {
        var /** @type {?} */ self = this;
        self.logger.log('miapp.sdk.service.miappLogin');
        if (!self.connection.isReady()) {
            return self.promise.reject('miapp.sdk.service.miappLogin : Did you miapp.sdk.service.miappInit() ?');
        }
        return new self.promise(function (resolve, reject) {
            self._removeAll()
                .then(function () {
                return self.connection.verifyConnectionStates();
            })
                .then(function () {
                self._createSession();
                return self._loginInternal(login, password);
            })
                .then(function (user) {
                self.connection.setConnection(user);
                self.session.sync(self.connection.getUserId())
                    .then(function () { return resolve(self.connection.getUser()); })
                    .catch(function (err) { return resolve(self.connection.getUser()); });
            })
                .catch(function (err) {
                self.logger.error('miapp.sdk.service.miappLogin error: ', err);
                reject(err);
            });
        });
    };
    
    /**
     *
     * @param {?=} options
     * @return {?}
     */
    InternalService.prototype.miappLoginInDemoMode = function (options) {
        var /** @type {?} */ self = this;
        // generate one day tokens if not set
        if (!options || !options.accessToken) {
            var /** @type {?} */ now = new Date();
            now.setDate(now.getDate() + 1);
            var /** @type {?} */ tomorrow = now.getTime();
            var /** @type {?} */ payload = Base64.encode(JSON.stringify({ roles: [], message: 'demo', endpoints: {}, dbs: [], exp: tomorrow }));
            var /** @type {?} */ jwtSign = Base64.encode(JSON.stringify({}));
            var /** @type {?} */ token = jwtSign + '.' + payload + '.' + jwtSign;
            options = {
                accessToken: token,
                idToken: token,
                refreshToken: token,
            };
        }
        return new self.promise(function (resolve, reject) {
            self._removeAll()
                .then(function () {
                self._createSession();
                self.connection.setConnectionOffline(options);
                resolve(self.connection.getUser());
            })
                .catch(function (err) {
                self.logger.error('miapp.sdk.service.miappLogin error: ', err);
                reject(err);
            });
        });
    };
    
    /**
     * @return {?}
     */
    InternalService.prototype.miappRoles = function () {
        return JSON.parse(this.connection.getIdPayload({ roles: [] })).roles;
    };
    
    /**
     * @return {?}
     */
    InternalService.prototype.miappMessage = function () {
        return JSON.parse(this.connection.getIdPayload({ message: '' })).message;
    };
    
    /**
     * @return {?}
     */
    InternalService.prototype.miappIsLogin = function () {
        return this.connection.isLogin();
    };
    
    /**
     *
     * @return {?}
     */
    InternalService.prototype.miappLogout = function () {
        var /** @type {?} */ self = this;
        if (!self.connection.getClient()) {
            return self._removeAll();
        }
        return self.connection.getClient().logout()
            .then(function () {
            return self._removeAll();
        })
            .catch(function () {
            return self._removeAll();
        });
    };
    
    /**
     * Synchronize DB
     *
     *
     * @param {?=} fnInitFirstData a function with db as input and that return promise: call if DB is empty
     * @param {?=} fnInitFirstData_Arg arg to set to fnInitFirstData()
     * @return {?}
     */
    InternalService.prototype.miappSync = function (fnInitFirstData, fnInitFirstData_Arg) {
        var /** @type {?} */ self = this;
        self.logger.log('miapp.sdk.service.miappSync');
        if (!self.connection.isReady()) {
            return self.promise.reject('miapp.sdk.service.miappSync : DB sync impossible. Did you login ?');
        }
        var /** @type {?} */ firstSync = (self.session.dbLastSync === null);
        return new self.promise(function (resolve, reject) {
            self._createSession();
            self.session.sync(self.connection.getUserId())
                .then(function () {
                self.logger.log('miapp.sdk.service.miappSync resolved');
                return self.session.isEmpty();
            })
                .catch(function (err) {
                self.logger.warn('miapp.sdk.service.miappSync warn: ', err);
                return self.session.isEmpty();
            })
                .then(function (isEmpty) {
                self.logger.log('miapp.sdk.service.miappSync isEmpty : ', isEmpty, firstSync);
                if (isEmpty && firstSync && fnInitFirstData) {
                    var /** @type {?} */ ret = fnInitFirstData(fnInitFirstData_Arg);
                    if (ret && ret['catch'] instanceof Function) {
                        return ret;
                    }
                    if (typeof ret === 'string') {
                        self.logger.log(ret);
                    }
                }
                return self.promise.resolve(); // self.connection.getUser());
            })
                .then(function () {
                self.logger.log('miapp.sdk.service.miappSync fnInitFirstData resolved');
                self.session.dbLastSync = new Date().getTime();
                return self.session.info();
            })
                .then(function (result) {
                self.session.dbRecordCount = 0;
                if (result && result.doc_count) {
                    self.session.dbRecordCount = result.doc_count;
                }
                self.logger.log('miapp.sdk.service.miappSync _dbRecordCount : ' + self.session.dbRecordCount);
                return self.connection.refreshConnection();
            })
                .then(function (code) {
                if (code === 403) {
                    reject({ code: code, msg: 'unauthorized (need login)' });
                }
                else {
                    resolve(); // self.connection.getUser()
                }
            })
                .catch(function (err) {
                var /** @type {?} */ errMessage = 'miapp.sdk.service.miappSync err : ' + err.toString();
                // self.logger.error(errMessage);
                reject({ code: 500, msg: errMessage });
            });
        });
    };
    
    /**
     * @param {?} data
     * @return {?}
     */
    InternalService.prototype.miappPutInDb = function (data) {
        var /** @type {?} */ self = this;
        self.logger.log('miapp.sdk.service.miappPutInDb :', data);
        if (!self.connection.getClientId() || !self.session.isReady()) {
            return self.promise.reject('miapp.sdk.service.miappPutInDb : ' +
                'DB put impossible. Need a user logged in.');
        }
        var /** @type {?} */ _id;
        if (data && typeof data === 'object' && Object.keys(data).indexOf('_id')) {
            _id = data._id;
        }
        if (!_id) {
            _id = self._generateObjectUniqueId(self.connection.miappId);
        }
        var /** @type {?} */ crypto;
        if (self.connection.miappCrypto) {
            crypto = {
                obj: self.connection,
                method: 'encrypt'
            };
        }
        return self.session.put(data, _id, self.connection.getClientId(), self.sdk.org, self.connection.miappVersion, crypto);
    };
    
    /**
     * @param {?} data_id
     * @return {?}
     */
    InternalService.prototype.miappRemoveInDb = function (data_id) {
        var /** @type {?} */ self = this;
        self.logger.log('miapp.sdk.service.miappRemoveInDb ', data_id);
        if (!self.session.isReady()) {
            return self.promise.reject('miapp.sdk.service.miappRemoveInDb : DB put impossible. ' +
                'Need a user logged in.');
        }
        if (!data_id || typeof data_id !== 'string') {
            return self.promise.reject('miapp.sdk.service.miappRemoveInDb : DB put impossible. ' +
                'Need the data._id.');
        }
        return self.session.remove(data_id);
    };
    
    /**
     * @param {?} data_id
     * @return {?}
     */
    InternalService.prototype.miappFindInDb = function (data_id) {
        var /** @type {?} */ self = this;
        if (!self.connection.getClientId() || !self.session.isReady()) {
            return self.promise.reject('miapp.sdk.service.miappFindInDb : need a user logged in.');
        }
        var /** @type {?} */ crypto;
        if (self.connection.miappCrypto) {
            crypto = {
                obj: self.connection,
                method: 'decrypt'
            };
        }
        return self.session.get(data_id, crypto);
    };
    
    /**
     * @return {?}
     */
    InternalService.prototype.miappFindAllInDb = function () {
        var /** @type {?} */ self = this;
        if (!self.connection.getClientId() || !self.session.isReady()) {
            return self.promise.reject('miapp.sdk.service.miappFindAllInDb : need a user logged in.');
        }
        var /** @type {?} */ crypto;
        if (self.connection.miappCrypto) {
            crypto = {
                obj: self.connection,
                method: 'decrypt'
            };
        }
        return self.session.getAll(crypto);
    };
    
    /**
     * Logout then Login
     *
     * @param {?} login
     * @param {?} password
     * @param {?=} updateProperties
     * @return {?}
     */
    InternalService.prototype._loginInternal = function (login, password, updateProperties) {
        var /** @type {?} */ self = this;
        self.logger.log('miapp.sdk.service._loginInternal');
        if (!self.connection.isReady()) {
            return self.promise.reject('miapp.sdk.service._loginInternal : need init');
        }
        return new self.promise(function (resolve, reject) {
            self.connection.getClient().logout()
                .then(function (msg) {
                return self.connection.getClient().login(login, password, updateProperties);
            })
                .then(function (loginUser) {
                loginUser.email = login;
                resolve(loginUser);
            })
                .catch(function (err) {
                self.logger.error('miapp.sdk.service._loginInternal error : ' + err);
                reject(err);
            });
        });
    };
    
    /**
     * @return {?}
     */
    InternalService.prototype._removeAll = function () {
        this.connection.destroy();
        return this.session.destroy();
    };
    
    /**
     * @return {?}
     */
    InternalService.prototype._createSession = function () {
        var /** @type {?} */ dbs = this.connection.getDBs();
        this.session.create();
        this.session.setRemote(dbs);
    };
    
    /**
     * @param {?=} a
     * @return {?}
     */
    InternalService.prototype._testPromise = function (a) {
        if (a) {
            return this.promise.resolve('test promise ok ' + a);
        }
        return new this.promise(function (resolve, reject) {
            resolve('test promise ok');
        });
    };
    
    /**
     * @param {?} appName
     * @param {?=} type
     * @param {?=} name
     * @return {?}
     */
    InternalService.prototype._generateObjectUniqueId = function (appName, type, name) {
        // return null;
        var /** @type {?} */ now = new Date();
        var /** @type {?} */ simpleDate = '' + now.getFullYear() + '' + now.getMonth() + '' + now.getDate()
            + '' + now.getHours() + '' + now.getMinutes(); // new Date().toISOString();
        var /** @type {?} */ sequId = ++InternalService._srvDataUniqId;
        var /** @type {?} */ UId = '';
        if (appName && appName.charAt(0)) {
            UId += appName.charAt(0) + '';
        }
        if (type && type.length > 3) {
            UId += type.substring(0, 4);
        }
        if (name && name.length > 3) {
            UId += name.substring(0, 4);
        }
        UId += simpleDate + '' + sequId;
        return UId;
    };
    return InternalService;
}());
InternalService._srvDataUniqId = 0;
/**
 * Angular2+ MiappService
 * \@class MiappService
 * @see ModuleServiceInterface
 *
 */
var MiappService = /** @class */ (function () {
    function MiappService() {
        this.miappService = null;
        this.promise = null;
        this.logger = new LoggerService();
        this.promise = Promise;
        this.miappService = null;
        // let pouchdbRequired = PouchDB;
        // pouchdbRequired.error();
    }
    
    /**
     * @param {?} miappId
     * @param {?=} options
     * @return {?}
     */
    MiappService.prototype.init = function (miappId, options) {
        if (!this.miappService) {
            this.miappService = new InternalService(this.logger, this.promise);
        }
        /*
        if (options && options.forcedEndpoint) {
            this.miappService.setAuthEndpoint(options.forcedEndpoint);
        }
        if (options && options.forcedDBEndpoint) {
            this.miappService.setDBEndpoint(options.forcedDBEndpoint);
        }*/
        return this.miappService.miappInit(miappId, options);
    };
    
    /**
     * @param {?} login
     * @param {?} password
     * @return {?}
     */
    MiappService.prototype.login = function (login, password) {
        if (!this.miappService) {
            return this.promise.reject('miapp.sdk.angular2.login : not initialized.');
        }
        return this.miappService.miappLogin(login, password);
    };
    
    /**
     * @param {?=} options
     * @return {?}
     */
    MiappService.prototype.loginAsDemo = function (options) {
        if (!this.miappService) {
            return this.promise.reject('miapp.sdk.angular2.loginAsDemo : not initialized.');
        }
        return this.miappService.miappLoginInDemoMode(options);
    };
    
    /**
     * @return {?}
     */
    MiappService.prototype.isLoggedIn = function () {
        if (!this.miappService) {
            return this.promise.reject('miapp.sdk.angular2.isLoggedIn : not initialized.');
        }
        return this.miappService.miappIsLogin();
    };
    
    /**
     * @return {?}
     */
    MiappService.prototype.getRoles = function () {
        if (!this.miappService) {
            return [];
        }
        return this.miappService.miappRoles();
    };
    
    /**
     * @return {?}
     */
    MiappService.prototype.getEndpoints = function () {
        if (!this.miappService) {
            return [];
        }
        return this.miappService.getEndpoints();
    };
    
    /**
     * @return {?}
     */
    MiappService.prototype.logout = function () {
        if (!this.miappService) {
            return this.promise.reject('miapp.sdk.angular2.logout : not initialized.');
        }
        return this.miappService.miappLogout();
    };
    
    /**
     *
     * Synchronize DB
     * \@memberof miapp.angularService
     *
     * \@example
     *  let initDb = function() {
     *     this.miappService.put('my first row');
     *  };
     *  this.miappService.sync(initDb)
     *  .then(user => ...)
     *  .catch(err => ...)
     *
     * @param {?=} fnInitFirstData  a function with db as input and that return promise: call if DB is empty
     * @return {?}
     */
    MiappService.prototype.sync = function (fnInitFirstData) {
        if (!this.miappService) {
            return this.promise.reject('miapp.sdk.angular2.sync : not initialized.');
        }
        return this.miappService.miappSync(fnInitFirstData, this);
    };
    
    /**
     * Store data in your session
     *
     * @param {?} data
     * @return {?}
     */
    MiappService.prototype.put = function (data) {
        if (!this.miappService) {
            return this.promise.reject('miapp.sdk.angular2.put : not initialized.');
        }
        return this.miappService.miappPutInDb(data);
    };
    
    /**
     * Find object Id and remove it from your session
     *
     * @param {?} id
     * @return {?}
     */
    MiappService.prototype.remove = function (id) {
        if (!this.miappService) {
            return this.promise.reject('miapp.sdk.angular2.remove : not initialized.');
        }
        return this.miappService.miappRemoveInDb(id);
    };
    
    /**
     * Find
     * @param {?} id
     * @return {?}
     */
    MiappService.prototype.find = function (id) {
        if (!this.miappService) {
            return this.promise.reject('miapp.sdk.angular2.find : not initialized.');
        }
        return this.miappService.miappFindInDb(id);
    };
    
    /**
     * @return {?}
     */
    MiappService.prototype.findAll = function () {
        if (!this.miappService) {
            return this.promise.reject('miapp.sdk.angular2.findAll : not initialized.');
        }
        return this.miappService.miappFindAllInDb();
    };
    
    return MiappService;
}());
MiappService.decorators = [
    { type: core.Injectable },
];
/**
 * @nocollapse
 */
MiappService.ctorParameters = function () { return []; };
var LoggerService = /** @class */ (function () {
    function LoggerService() {
    }
    /**
     * @param {?} message
     * @return {?}
     */
    LoggerService.prototype.log = function (message) {
        // console.log(message);
    };
    /**
     * @param {?} message
     * @return {?}
     */
    LoggerService.prototype.error = function (message) {
        console.error(message);
    };
    /**
     * @param {?} message
     * @return {?}
     */
    LoggerService.prototype.warn = function (message) {
        console.warn(message);
    };
    return LoggerService;
}());
/**
 * `NgModule` which provides associated services.
 *
 * ...
 *
 * \@stable
 */
var MiappModule = /** @class */ (function () {
    function MiappModule() {
    }
    return MiappModule;
}());
MiappModule.decorators = [
    { type: core.NgModule, args: [{
                imports: [
                    common.CommonModule
                ],
                declarations: [],
                exports: [],
                providers: [MiappService]
            },] },
];
/**
 * @nocollapse
 */
MiappModule.ctorParameters = function () { return []; };

exports.MiappModule = MiappModule;
exports.MiappService = MiappService;
exports.LoggerService = LoggerService;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=miappio-sdk.umd.js.map
