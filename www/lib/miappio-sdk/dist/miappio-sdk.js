import { Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// bumped version via gulp
const version = '2.0.19';

class Base64 {
    constructor() {
    }
    ;
    /**
     * Decodes string from Base64 string
     * @param {?} input
     * @return {?}
     */
    static encode(input) {
        if (!input) {
            return null;
        }
        return btoa(encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) {
            return String.fromCharCode(parseInt('0x' + p1, 16));
        }));
    }
    /**
     * @param {?} input
     * @return {?}
     */
    static decode(input) {
        if (!input) {
            return null;
        }
        return decodeURIComponent(atob(input).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }
}

/**
 * localStorage class factory
 * Usage : var LocalStorage = miapp.LocalStorageFactory(window.localStorage); // to create a new class
 * Usage : var localStorageService = new LocalStorage(); // to create a new instance
 */
class LocalStorage {
    /**
     * @param {?} storageService
     * @param {?} storageKey
     */
    constructor(storageService, storageKey) {
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
    set(key, value) {
        key = this.storageKey + key;
        this.checkKey(key);
        // clone the object before saving to storage
        const /** @type {?} */ t = typeof (value);
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
    }
    ;
    /**
     * Looks up a key in cache
     *
     * @param {?} key
     * @param {?=} def
     * @return {?} the key value, default value or <null>
     */
    get(key, def) {
        key = this.storageKey + key;
        this.checkKey(key);
        const /** @type {?} */ item = this.storage.getItem(key);
        if (item !== null) {
            if (item === 'null') {
                return null;
            }
            const /** @type {?} */ value = JSON.parse(item);
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
    }
    ;
    /**
     * Deletes a key from cache.
     *
     * @param {?} key
     * @return {?} true if key existed or false if it didn't
     */
    remove(key) {
        key = this.storageKey + key;
        this.checkKey(key);
        const /** @type {?} */ existed = (this.storage.getItem(key) !== null);
        this.storage.removeItem(key);
        return existed;
    }
    ;
    /**
     * Deletes everything in cache.
     *
     * @return {?} true
     */
    clear() {
        const /** @type {?} */ existed = (this.storage.length > 0);
        this.storage.clear();
        return existed;
    }
    ;
    /**
     * How much space in bytes does the storage take?
     *
     * @return {?} Number
     */
    size() {
        return this.storage.length;
    }
    ;
    /**
     * Call function f on the specified context for each element of the storage
     * from index 0 to index length-1.
     * WARNING : You should not modify the storage during the loop !!!
     *
     * @param {?} f
     * @param {?} context
     * @return {?} Number of items in storage
     */
    foreach(f, context) {
        const /** @type {?} */ n = this.storage.length;
        for (let /** @type {?} */ i = 0; i < n; i++) {
            const /** @type {?} */ key = this.storage.key(i);
            const /** @type {?} */ value = this.get(key);
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
    }
    ;
    /**
     * @param {?} key
     * @return {?}
     */
    checkKey(key) {
        if (!key || (typeof key !== 'string')) {
            throw new TypeError('Key type must be string');
        }
        return true;
    }
}

class Xor {
    constructor() {
    }
    ;
    /**
     * @param {?} value
     * @param {?} key
     * @return {?}
     */
    static encrypt(value, key) {
        let /** @type {?} */ result = '';
        for (let /** @type {?} */ i = 0; i < value.length; i++) {
            result += String.fromCharCode(((value[i].charCodeAt(0).toString(10))) ^ Xor.keyCharAt(key, i));
        }
        return Base64.encode(result);
    }
    ;
    /**
     * @param {?} value
     * @param {?} key
     * @return {?}
     */
    static decrypt(value, key) {
        let /** @type {?} */ result = '';
        value = Base64.decode(value);
        for (let /** @type {?} */ i = 0; i < value.length; i++) {
            result += String.fromCharCode(((value[i].charCodeAt(0).toString(10))) ^ Xor.keyCharAt(key, i));
        }
        return result;
    }
    /**
     * @param {?} key
     * @param {?} i
     * @return {?}
     */
    static keyCharAt(key, i) {
        return key[Math.floor(i % key.length)].charCodeAt(0).toString(10);
    }
}

class XHRPromise {
    constructor() {
        this.DEFAULT_CONTENT_TYPE = 'application/x-www-form-urlencoded; charset=UTF-8';
    }
    ;
    /**
     * @param {?} options
     * @return {?}
     */
    send(options) {
        let /** @type {?} */ defaults;
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
                let /** @type {?} */ e, /** @type {?} */ header, /** @type {?} */ ref, /** @type {?} */ value, /** @type {?} */ xhr;
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
                    let /** @type {?} */ responseText;
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
    }
    ;
    /**
     * @return {?}
     */
    getXHR() {
        return this._xhr;
    }
    ;
    /**
     * @return {?}
     */
    _attachWindowUnload() {
        this._unloadHandler = this._handleWindowUnload.bind(this);
        if (((window)).attachEvent) {
            return ((window)).attachEvent('onunload', this._unloadHandler);
        }
    }
    ;
    /**
     * @return {?}
     */
    _detachWindowUnload() {
        if (((window)).detachEvent) {
            return ((window)).detachEvent('onunload', this._unloadHandler);
        }
    }
    ;
    /**
     * @return {?}
     */
    _getHeaders() {
        return this._parseHeaders(this._xhr.getAllResponseHeaders());
    }
    ;
    /**
     * @return {?}
     */
    _getResponseText() {
        let /** @type {?} */ responseText;
        responseText = typeof this._xhr.responseText === 'string' ? this._xhr.responseText : '';
        switch ((this._xhr.getResponseHeader('Content-Type') || '').split(';')[0]) {
            case 'application/json':
            case 'text/javascript':
                responseText = JSON.parse(responseText + '');
        }
        return responseText;
    }
    ;
    /**
     * @return {?}
     */
    _getResponseUrl() {
        if (this._xhr.responseURL != null) {
            return this._xhr.responseURL;
        }
        if (/^X-Request-URL:/m.test(this._xhr.getAllResponseHeaders())) {
            return this._xhr.getResponseHeader('X-Request-URL');
        }
        return '';
    }
    ;
    /**
     * @param {?} reason
     * @param {?} reject
     * @param {?=} status
     * @param {?=} statusText
     * @return {?}
     */
    _handleError(reason, reject, status, statusText) {
        this._detachWindowUnload();
        return reject({
            reason: reason,
            status: status || this._xhr.status,
            statusText: statusText || this._xhr.statusText,
            xhr: this._xhr
        });
    }
    ;
    /**
     * @return {?}
     */
    _handleWindowUnload() {
        return this._xhr.abort();
    }
    ;
    /**
     * @param {?} str
     * @return {?}
     */
    trim(str) {
        return str.replace(/^\s*|\s*$/g, '');
    }
    /**
     * @param {?} arg
     * @return {?}
     */
    isArray(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    }
    /**
     * @param {?} list
     * @param {?} iterator
     * @return {?}
     */
    forEach(list, iterator) {
        if (toString.call(list) === '[object Array]') {
            this.forEachArray(list, iterator, this);
        }
        else if (typeof list === 'string') {
            this.forEachString(list, iterator, this);
        }
        else {
            this.forEachObject(list, iterator, this);
        }
    }
    /**
     * @param {?} array
     * @param {?} iterator
     * @param {?} context
     * @return {?}
     */
    forEachArray(array, iterator, context) {
        for (let /** @type {?} */ i = 0, /** @type {?} */ len = array.length; i < len; i++) {
            if (array.hasOwnProperty(i)) {
                iterator.call(context, array[i], i, array);
            }
        }
    }
    /**
     * @param {?} string
     * @param {?} iterator
     * @param {?} context
     * @return {?}
     */
    forEachString(string, iterator, context) {
        for (let /** @type {?} */ i = 0, /** @type {?} */ len = string.length; i < len; i++) {
            // no such thing as a sparse string.
            iterator.call(context, string.charAt(i), i, string);
        }
    }
    /**
     * @param {?} object
     * @param {?} iterator
     * @param {?} context
     * @return {?}
     */
    forEachObject(object, iterator, context) {
        for (const /** @type {?} */ k in object) {
            if (object.hasOwnProperty(k)) {
                iterator.call(context, object[k], k, object);
            }
        }
    }
    /**
     * @param {?} headers
     * @return {?}
     */
    _parseHeaders(headers) {
        if (!headers) {
            return {};
        }
        const /** @type {?} */ result = {};
        this.forEach(this.trim(headers).split('\n'), (row) => {
            const /** @type {?} */ index = row.indexOf(':'), /** @type {?} */ key = this.trim(row.slice(0, index)).toLowerCase(), /** @type {?} */ value = this.trim(row.slice(index + 1));
            if (typeof (result[key]) === 'undefined') {
                result[key] = value;
            }
            else if (this.isArray(result[key])) {
                result[key].push(value);
            }
            else {
                result[key] = [result[key], value];
            }
        });
        return result;
    }
}

class Ajax {
    constructor() {
        this.xhr = new XHRPromise();
    }
    ;
    /**
     * @param {?} args
     * @return {?}
     */
    post(args) {
        const /** @type {?} */ opt = {
            method: 'POST',
            url: args.url,
            data: JSON.stringify(args.data)
        };
        if (args.headers) {
            opt.headers = args.headers;
        }
        return this.xhr
            .send(opt)
            .then(res => {
            // console.log('res:', res);
            if (res.status &&
                (parseInt(res.status, 10) < 200 || parseInt(res.status, 10) >= 300)) {
                res.reason = 'status';
                return Promise.reject(res);
            }
            return Promise.resolve(res.responseText);
        });
    }
    /**
     * @param {?} args
     * @return {?}
     */
    put(args) {
        const /** @type {?} */ opt = {
            method: 'PUT',
            url: args.url,
            data: JSON.stringify(args.data)
        };
        if (args.headers) {
            opt.headers = args.headers;
        }
        return this.xhr
            .send(opt)
            .then(res => {
            // console.log('res:', res);
            if (res.status &&
                (parseInt(res.status, 10) < 200 || parseInt(res.status, 10) >= 300)) {
                res.reason = 'status';
                return Promise.reject(res);
            }
            return Promise.resolve(res.responseText);
        });
    }
    /**
     * @param {?} args
     * @return {?}
     */
    delete(args) {
        const /** @type {?} */ opt = {
            method: 'DELETE',
            url: args.url,
            data: JSON.stringify(args.data)
        };
        if (args.headers) {
            opt.headers = args.headers;
        }
        return this.xhr
            .send(opt)
            .then(res => {
            // console.log('res:', res);
            if (res.status &&
                (parseInt(res.status, 10) < 200 || parseInt(res.status, 10) >= 300)) {
                res.reason = 'status';
                return Promise.reject(res);
            }
            return Promise.resolve(res.responseText);
        });
    }
    /**
     * @param {?} args
     * @return {?}
     */
    get(args) {
        const /** @type {?} */ opt = {
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
            .then(res => {
            // console.log('res:', res);
            if (res.status &&
                (parseInt(res.status, 10) < 200 || parseInt(res.status, 10) >= 300)) {
                res.reason = 'status';
                return Promise.reject(res);
            }
            return Promise.resolve(res.responseText);
        });
    }
}

class Client {
    /**
     * @param {?} appId
     * @param {?} URI
     * @param {?} storage
     * @param {?} sdk
     */
    constructor(appId, URI, storage, sdk) {
        this.appId = appId;
        this.URI = URI;
        this.storage = storage;
        this.sdk = sdk;
        let uuid = this.storage.get('uuid') || 'uuid-' + Math.random();
        let info = this.storage.get('info');
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
    ;
    /**
     * @param {?} value
     * @return {?}
     */
    setClientId(value) {
        this.clientId = value;
        this.storage.set('clientId', this.clientId);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    setClientUuid(value) {
        this.clientUuid = value;
        this.storage.set('clientUuid', this.clientUuid);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    setClientInfo(value) {
        this.clientInfo = value;
        // this.storage.set('clientInfo', this.clientInfo);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    setRefreshToken(value) {
        this.refreshToken = value;
        this.storage.set('refreshToken', this.refreshToken);
    }
    /**
     * @param {?} login
     * @param {?} password
     * @param {?=} updateProperties
     * @return {?}
     */
    login(login, password, updateProperties) {
        if (!this.URI) {
            console.error('no api uri');
            return Promise.reject({ code: 408, msg: 'no api uri' });
        }
        const /** @type {?} */ urlLogin = this.URI + '/users';
        const /** @type {?} */ dataLogin = {
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
            .then(createdUser => {
            this.setClientId(createdUser._id);
            const /** @type {?} */ urlToken = this.URI + '/oauth/token';
            const /** @type {?} */ dataToken = {
                grant_type: 'client_credentials',
                client_id: this.clientId,
                client_secret: password,
                client_udid: this.clientUuid,
                client_info: this.clientInfo,
                audience: this.appId,
                scope: JSON.stringify(this.sdk)
            };
            return new Ajax()
                .post({
                url: urlToken,
                data: dataToken,
                headers: { 'Content-Type': 'application/json', 'Accept': 'text/json' }
            });
        });
    }
    /**
     * @return {?}
     */
    reAuthenticate() {
        if (!this.URI) {
            console.error('no api uri');
            return Promise.reject({ code: 408, msg: 'no api uri' });
        }
        const /** @type {?} */ url = this.URI + '/oauth/token';
        const /** @type {?} */ data = {
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
    }
    /**
     * @return {?}
     */
    logout() {
        if (!this.URI) {
            console.error('no api uri');
            return Promise.reject({ code: 408, msg: 'no api uri' });
        }
        const /** @type {?} */ url = this.URI + '/oauth/revoke';
        if (!this.refreshToken || !this.clientId) {
            return Promise.resolve();
        }
        const /** @type {?} */ data = {
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
    }
    /**
     * @return {?}
     */
    isReady() {
        return !!this.URI;
    }
}
Client.refreshCount = 0;

class Connection {
    /**
     * @param {?} _sdk
     * @param {?} _storage
     */
    constructor(_sdk, _storage) {
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
    ;
    /**
     * @return {?}
     */
    isReady() {
        return !!this._client && this._client.isReady();
    }
    /**
     * @return {?}
     */
    destroy() {
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
    }
    /**
     * @param {?} client
     * @return {?}
     */
    setClient(client) {
        this._client = client;
        if (!this._user) {
            this._user = {};
        }
        this._user._id = this._client.clientId;
        this._user._name = JSON.parse(this.getIdPayload({ name: '' })).name;
    }
    /**
     * @param {?} user
     * @return {?}
     */
    setUser(user) {
        this._user = user;
        if (this._user._id) {
            this._client.setClientId(this._user._id);
        }
    }
    /**
     * @return {?}
     */
    getUser() {
        return this._user;
    }
    /**
     * @return {?}
     */
    getUserId() {
        return this._user ? this._user._id : null;
    }
    /**
     * @return {?}
     */
    getClient() {
        return this._client;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    setCryptoSalt(value) {
        // this.miappCrypto = true;
        this._cryptoSalt = value;
        this._storage.set('_cryptoSalt', this._cryptoSalt);
    }
    /**
     * @param {?} data
     * @return {?}
     */
    encrypt(data) {
        if (typeof data !== 'string') {
            data = JSON.stringify(data);
        }
        if (this.miappCrypto && this._cryptoSalt) {
            // const key = '' + this.miappId + '' + this.getClientId();
            const /** @type {?} */ key = this._cryptoSalt;
            return Xor.encrypt(data, key);
        }
        else {
            return data;
        }
    }
    /**
     * @param {?} data
     * @return {?}
     */
    decrypt(data) {
        let /** @type {?} */ decrypted = data;
        if (this.miappCrypto && this._cryptoSalt) {
            // const key = '' + this.miappId + '' + this.getClientId();
            const /** @type {?} */ key = this._cryptoSalt;
            decrypted = Xor.decrypt(data, key);
        }
        try {
            decrypted = JSON.parse(decrypted);
        }
        catch (err) {
        }
        return decrypted;
    }
    /**
     * @return {?}
     */
    isLogin() {
        let /** @type {?} */ exp = true;
        try {
            const /** @type {?} */ payload = this.refreshToken.split('.')[1];
            const /** @type {?} */ decoded = JSON.parse(Base64.decode(payload));
            exp = ((new Date().getTime() / 1000) >= decoded.exp);
        }
        catch (e) {
        }
        return !exp;
    }
    ;
    /**
     * @return {?}
     */
    getClientId() {
        if (!this._client) {
            return null;
        }
        return this._client.clientId;
    }
    /**
     * @param {?=} def
     * @return {?}
     */
    getIdPayload(def) {
        if (def && typeof def !== 'string') {
            def = JSON.stringify(def);
        }
        try {
            const /** @type {?} */ payload = this.idToken.split('.')[1];
            if (payload) {
                return Base64.decode(payload);
            }
        }
        catch (e) {
        }
        return def ? def : null;
    }
    /**
     * @param {?=} def
     * @return {?}
     */
    getAccessPayload(def) {
        if (def && typeof def !== 'string') {
            def = JSON.stringify(def);
        }
        try {
            const /** @type {?} */ payload = this.accessToken.split('.')[1];
            if (payload) {
                return Base64.decode(payload);
            }
        }
        catch (e) {
        }
        return def ? def : null;
    }
    /**
     * @param {?=} def
     * @return {?}
     */
    getPreviousAccessPayload(def) {
        if (def && typeof def !== 'string') {
            def = JSON.stringify(def);
        }
        try {
            const /** @type {?} */ payload = this.accessTokenPrevious.split('.')[1];
            if (payload) {
                return Base64.decode(payload);
            }
        }
        catch (e) {
        }
        return def ? def : null;
    }
    /**
     * @return {?}
     */
    refreshConnection() {
        let /** @type {?} */ code = 0;
        // token not expired : ok
        if (this.accessToken) {
            const /** @type {?} */ payload = this.accessToken.split('.')[1];
            const /** @type {?} */ decoded = Base64.decode(payload);
            // console.log('new Date().getTime() < JSON.parse(decoded).exp :', (new Date().getTime() / 1000), JSON.parse(decoded).exp);
            if ((new Date().getTime() / 1000) < JSON.parse(decoded).exp) {
                return Promise.resolve(code);
            }
        }
        // remove expired refreshToken
        if (this.refreshToken) {
            const /** @type {?} */ payload = this.refreshToken.split('.')[1];
            const /** @type {?} */ decoded = Base64.decode(payload);
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
        return new Promise((resolve, reject) => {
            this.getClient().reAuthenticate()
                .then(user => {
                this.setConnection(user);
                resolve(user);
            })
                .catch(err => {
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
    }
    ;
    /**
     * @param {?} clientUser
     * @return {?}
     */
    setConnection(clientUser) {
        // only in private storage
        if (clientUser.access_token) {
            this.accessToken = clientUser.access_token;
            this._storage.set('accessToken', this.accessToken);
            delete clientUser.access_token;
            const /** @type {?} */ salt = JSON.parse(this.getAccessPayload({ salt: '' })).salt;
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
    }
    ;
    /**
     * @param {?} options
     * @return {?}
     */
    setConnectionOffline(options) {
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
    }
    /**
     * @param {?=} options
     * @return {?}
     */
    getEndpoints(options) {
        let /** @type {?} */ ea = ['https://miapp.io/api', 'https://miapp-proxy.herokuapp.com/api'];
        let /** @type {?} */ filteredEa = [];
        if (!this._sdk.prod) {
            ea = ['http://localhost:5894/api', 'https://miapp-sandbox.herokuapp.com/api'];
        }
        if (this.accessToken) {
            const /** @type {?} */ endpoints = JSON.parse(this.getAccessPayload({ endpoints: {} })).endpoints;
            if (endpoints.length) {
                ea = [];
                endpoints.forEach((endpoint) => {
                    ea.push(endpoint.uri);
                });
            }
        }
        if (this.accessTokenPrevious) {
            const /** @type {?} */ endpoints = JSON.parse(this.getPreviousAccessPayload({ endpoints: {} })).endpoints;
            if (endpoints.length) {
                endpoints.forEach((endpoint) => {
                    if (ea.indexOf(endpoint.uri) < 0) {
                        ea.push(endpoint.uri);
                    }
                });
            }
        }
        if (options && options.filter && options.filter === 'theBestOne') {
            if (this.states && Object.keys(this.states).length) {
                for (let /** @type {?} */ i = 0; (i < ea.length) && (filteredEa.length === 0); i++) {
                    const /** @type {?} */ endpoint = ea[i];
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
    }
    ;
    /**
     * @param {?=} options
     * @return {?}
     */
    getDBs(options) {
        if (!this.accessToken) {
            return [];
        }
        const /** @type {?} */ random = Math.random() % 2;
        let /** @type {?} */ dbs = JSON.parse(this.getAccessPayload({ dbs: [] })).dbs || [];
        // need to synchronize db
        if (random === 0) {
            dbs = dbs.sort();
        }
        else if (random === 1) {
            dbs = dbs.reverse();
        }
        let /** @type {?} */ filteredDBs = [];
        if (options && options.filter && options.filter === 'theBestOne') {
            if (this.states && Object.keys(this.states).length) {
                for (let /** @type {?} */ i = 0; (i < dbs.length) && (filteredDBs.length === 0); i++) {
                    const /** @type {?} */ endpoint = dbs[i];
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
    }
    ;
    /**
     * @return {?}
     */
    verifyConnectionStates() {
        const /** @type {?} */ currentTime = new Date().getTime();
        // todo need verification ? not yet (cache)
        // if (Object.keys(this.states).length > 0) {
        //     const time = this.states[Object.keys(this.states)[0]].time;
        //     if (currentTime < time) {
        //         return Promise.resolve();
        //     }
        // }
        // verify via GET status on Endpoints & DBs
        const /** @type {?} */ promises = [];
        this.states = {};
        this.endpoints = this.getEndpoints();
        this.endpoints.forEach((endpoint) => {
            promises.push(new Promise((resolve, reject) => {
                // console.log(endpoint + '/status?isok=' + this._sdk.version);
                new Ajax()
                    .get({
                    url: endpoint + '/status?isok=' + this._sdk.version,
                    headers: { 'Content-Type': 'application/json', 'Accept': 'text/json' }
                })
                    .then(data => {
                    let /** @type {?} */ state = false;
                    if (data && data.isok) {
                        state = true;
                    }
                    this.states[endpoint] = { state: state, time: currentTime };
                    resolve();
                })
                    .catch(err => {
                    this.states[endpoint] = { state: false, time: currentTime };
                    resolve();
                });
            }));
        });
        const /** @type {?} */ dbs = this.getDBs();
        dbs.forEach((dbEndpoint) => {
            promises.push(new Promise((resolve, reject) => {
                new Ajax()
                    .get({
                    url: dbEndpoint,
                    headers: { 'Content-Type': 'application/json', 'Accept': 'text/json' }
                })
                    .then(data => {
                    this.states[dbEndpoint] = { state: true, time: currentTime };
                    resolve();
                })
                    .catch(err => {
                    this.states[dbEndpoint] = { state: false, time: currentTime };
                    resolve();
                });
            }));
        });
        return Promise.all(promises);
    }
    ;
}

// import PouchDB from 'pouchdb';
// let PouchDB: any;
const Pouch = window['PouchDB'] || require('pouchdb').default;
class Session {
    constructor() {
        this.db = null;
        this.dbRecordCount = 0;
        this.dbLastSync = null;
        this.remoteDb = null;
        this.dbs = [];
    }
    ;
    /**
     * @return {?}
     */
    isReady() {
        return !!this.db;
    }
    /**
     * @param {?=} force
     * @return {?}
     */
    create(force) {
        if (force || !this.db) {
            this.dbRecordCount = 0;
            this.dbLastSync = new Date().getTime();
            this.db = {};
            this.db = new Pouch('miapp_db'); // , {adapter: 'websql'} ???
        }
    }
    /**
     * @return {?}
     */
    destroy() {
        const /** @type {?} */ cleanSessionFn = () => {
            this.dbRecordCount = 0;
            this.dbLastSync = null;
        };
        if (!this.db) {
            cleanSessionFn();
            return Promise.resolve();
        }
        if (this.db && !this.db.destroy) {
            return Promise.reject('miapp.sdk.service._removeSession : DB clean impossible.');
        }
        return new Promise((resolve, reject) => {
            this.db.destroy((err, info) => {
                if (err) {
                    reject(err);
                }
                else {
                    cleanSessionFn();
                    resolve();
                }
            });
        });
    }
    ;
    /**
     * @param {?} dbs
     * @return {?}
     */
    setRemote(dbs) {
        this.dbs = dbs;
    }
    /**
     * @param {?} userId
     * @return {?}
     */
    sync(userId) {
        if (!this.db) {
            return Promise.reject({ code: 408, msg: 'need db' });
        }
        if (!this.dbs || !this.dbs.length) {
            return Promise.reject({ code: 408, msg: 'need db remote' });
        }
        return new Promise((resolve, reject) => {
            try {
                if (!this.remoteDb || this.remoteUri !== this.dbs[0]) {
                    this.remoteUri = this.dbs[0];
                    this.remoteDb = new Pouch(this.remoteUri);
                    // todo , {headers: {'Authorization': 'Bearer ' + id_token}});
                }
                this.db
                    .sync(this.remoteDb, {
                    filter: (doc) => {
                        if (!userId) {
                            return;
                        }
                        else if (doc && doc.miappUserId === userId) {
                            return doc;
                        }
                    }
                })
                    .on('complete', (info) => resolve(info))
                    .on('error', (err) => reject({ code: 401, msg: err }))
                    .on('denied', (err) => reject({ code: 403, msg: err }));
            }
            catch (err) {
                reject({ code: 500, msg: err });
            }
        });
    }
    /**
     * @param {?} data
     * @param {?} _id
     * @param {?} uid
     * @param {?} oid
     * @param {?} ave
     * @param {?=} crypto
     * @return {?}
     */
    put(data, _id, uid, oid, ave, crypto) {
        if (!this.db) {
            return Promise.reject('need db');
        }
        if (!data || !_id || !uid || !oid || !ave) {
            return Promise.reject('need formated data');
        }
        const /** @type {?} */ dataWithoutIds = JSON.parse(JSON.stringify(data));
        delete dataWithoutIds._id;
        delete dataWithoutIds._rev;
        delete dataWithoutIds.miappUserId;
        delete dataWithoutIds.miappOrgId;
        delete dataWithoutIds.miappAppVersion;
        delete dataWithoutIds.miappData;
        let /** @type {?} */ resultAsString = this.write(this.value(dataWithoutIds));
        if (crypto) {
            resultAsString = crypto.obj[crypto.method](resultAsString);
        }
        const /** @type {?} */ toStore = {
            _id: _id,
            miappUserId: uid,
            miappOrgId: oid,
            miappAppVersion: ave,
            miappData: resultAsString
        };
        return new Promise((resolve, reject) => {
            this.db.put(toStore, (err, response) => {
                if (response && response.ok && response.id && response.rev) {
                    // data._id = response.id;
                    // data._rev = response.rev;
                    this.dbRecordCount++;
                    resolve(response.id);
                }
                else {
                    reject(err);
                }
            });
        });
    }
    /**
     * @param {?} data_id
     * @return {?}
     */
    remove(data_id) {
        if (!this.db) {
            return Promise.reject('need db');
        }
        return new Promise((resolve, reject) => {
            this.db.get(data_id)
                .then((doc) => {
                doc._deleted = true;
                return this.db.put(doc);
            })
                .then((result) => {
                resolve();
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
    /**
     * @param {?} data_id
     * @param {?=} crypto
     * @return {?}
     */
    get(data_id, crypto) {
        if (!this.db) {
            return Promise.reject('need db');
        }
        return new Promise((resolve, reject) => {
            this.db.get(data_id)
                .then(row => {
                if (!!row && !!row.miappData) {
                    let /** @type {?} */ data = row.miappData;
                    if (crypto) {
                        data = crypto.obj[crypto.method](data);
                    }
                    else {
                        data = JSON.parse(data);
                    }
                    let /** @type {?} */ result = data;
                    result._id = row._id;
                    result._rev = row._rev;
                    result = JSON.parse(JSON.stringify(result));
                    resolve(result);
                }
                else {
                    reject('none');
                }
            })
                .catch(err => reject(err));
        });
    }
    /**
     * @param {?=} crypto
     * @return {?}
     */
    getAll(crypto) {
        if (!this.db) {
            return Promise.reject('need db');
        }
        return new Promise((resolve, reject) => {
            this.db.allDocs({ include_docs: true, descending: true })
                .then(rows => {
                const /** @type {?} */ all = [];
                rows.rows.forEach(row => {
                    if (!!row && !!row.doc.miappData && !!row.doc._id) {
                        let /** @type {?} */ data = row.doc.miappData;
                        if (crypto) {
                            data = crypto.obj[crypto.method](data);
                        }
                        else {
                            data = JSON.parse(data);
                        }
                        let /** @type {?} */ result = data;
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
                .catch(err => reject(err));
        });
    }
    /**
     * @return {?}
     */
    isEmpty() {
        if (!this.db) {
            return Promise.reject('need db');
        }
        return new Promise((resolve, reject) => {
            this.db
                .allDocs({})
                .then((response) => {
                if (!response) {
                    reject();
                }
                else {
                    this.dbRecordCount = response.total_rows;
                    if (response.total_rows && response.total_rows > 0) {
                        resolve(false);
                    }
                    else {
                        resolve(true);
                    }
                }
            })
                .catch((err) => reject(err));
        });
    }
    /**
     * @return {?}
     */
    info() {
        if (!this.db) {
            return Promise.reject('none');
        }
        return this.db.info();
    }
    /**
     * @param {?} item
     * @return {?}
     */
    write(item) {
        let /** @type {?} */ value = 'null';
        const /** @type {?} */ t = typeof (item);
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
    }
    /**
     * @param {?} item
     * @return {?}
     */
    value(item) {
        const /** @type {?} */ t = typeof (item);
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
    }
}

// import PouchDB from 'pouchdb';
// import * as PouchDB from 'pouchdb/dist/pouchdb.js';
// import PouchDB from 'pouchdb/dist/pouchdb.js';
/**
 * usefull only for miapp.io dev team
 */
class InternalService {
    /**
     * @param {?} logger
     * @param {?} promise
     */
    constructor(logger, promise) {
        this.sdk = {
            org: 'miapp.io',
            version: version,
            prod: false
        };
        this.logger = {
            log: () => {
            }, error: () => {
            }, warn: () => {
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
    miappInit(miappId, options) {
        const /** @type {?} */ self = this;
        self.logger.log('miapp.sdk.service.miappInit : ', options);
        if (!miappId) {
            self.logger.error('miapp.sdk.service.miappInit : bad init');
            return self.promise.reject('miapp.sdk.service.miappInit : bad init');
        }
        self.sdk.prod = options ? !!options.prod : true;
        return new self.promise((resolve, reject) => {
            self.connection.verifyConnectionStates()
                .then(() => {
                self.connection.miappId = miappId;
                self.connection.miappVersion = self.sdk.version;
                self.connection.miappCrypto = options ? !!options.crypto : false;
                const /** @type {?} */ url = self.connection.getEndpoints({ filter: 'theBestOne' })[0];
                if (!url && self.sdk.prod) {
                    self.logger.warn('miapp.sdk.service.miappInit : no endpoint is nowly available, switch to dev mode.');
                    reject('miapp.sdk.service.miappInit: endpoint connection required');
                }
                else {
                    self.connection.setClient(new Client(self.connection.miappId, url, self.storage, self.sdk));
                    resolve();
                }
            })
                .catch((err) => {
                self.logger.error('miapp.sdk.service.miappInit : ', err);
                reject('miapp.sdk.service.miappInit: ' + err.toString());
            });
        });
    }
    ;
    /**
     * Call it if miappIsLogin() === false
     * Erase all (db & storage)
     *
     * @param {?} login
     * @param {?} password
     * @return {?}
     */
    miappLogin(login, password) {
        const /** @type {?} */ self = this;
        self.logger.log('miapp.sdk.service.miappLogin');
        if (!self.connection.isReady()) {
            return self.promise.reject('miapp.sdk.service.miappLogin : Did you miapp.sdk.service.miappInit() ?');
        }
        return new self.promise((resolve, reject) => {
            self._removeAll()
                .then(() => {
                return self.connection.verifyConnectionStates();
            })
                .then(() => {
                self._createSession();
                return self._loginInternal(login, password);
            })
                .then((user) => {
                self.connection.setConnection(user);
                self.session.sync(self.connection.getUserId())
                    .then(() => resolve(self.connection.getUser()))
                    .catch((err) => resolve(self.connection.getUser()));
            })
                .catch((err) => {
                self.logger.error('miapp.sdk.service.miappLogin error: ', err);
                reject(err);
            });
        });
    }
    ;
    /**
     *
     * @param {?=} options
     * @return {?}
     */
    miappLoginInDemoMode(options) {
        const /** @type {?} */ self = this;
        // generate one day tokens if not set
        if (!options || !options.accessToken) {
            const /** @type {?} */ now = new Date();
            now.setDate(now.getDate() + 1);
            const /** @type {?} */ tomorrow = now.getTime();
            const /** @type {?} */ payload = Base64.encode(JSON.stringify({ roles: [], message: 'demo', endpoints: {}, dbs: [], exp: tomorrow }));
            const /** @type {?} */ jwtSign = Base64.encode(JSON.stringify({}));
            const /** @type {?} */ token = jwtSign + '.' + payload + '.' + jwtSign;
            options = {
                accessToken: token,
                idToken: token,
                refreshToken: token,
            };
        }
        return new self.promise((resolve, reject) => {
            self._removeAll()
                .then(() => {
                self._createSession();
                self.connection.setConnectionOffline(options);
                resolve(self.connection.getUser());
            })
                .catch((err) => {
                self.logger.error('miapp.sdk.service.miappLogin error: ', err);
                reject(err);
            });
        });
    }
    ;
    /**
     * @return {?}
     */
    miappRoles() {
        return JSON.parse(this.connection.getIdPayload({ roles: [] })).roles;
    }
    ;
    /**
     * @return {?}
     */
    miappMessage() {
        return JSON.parse(this.connection.getIdPayload({ message: '' })).message;
    }
    ;
    /**
     * @return {?}
     */
    miappIsLogin() {
        return this.connection.isLogin();
    }
    ;
    /**
     *
     * @return {?}
     */
    miappLogout() {
        const /** @type {?} */ self = this;
        if (!self.connection.getClient()) {
            return self._removeAll();
        }
        return self.connection.getClient().logout()
            .then(() => {
            return self._removeAll();
        })
            .catch(() => {
            return self._removeAll();
        });
    }
    ;
    /**
     * Synchronize DB
     *
     *
     * @param {?=} fnInitFirstData a function with db as input and that return promise: call if DB is empty
     * @param {?=} fnInitFirstData_Arg arg to set to fnInitFirstData()
     * @return {?}
     */
    miappSync(fnInitFirstData, fnInitFirstData_Arg) {
        const /** @type {?} */ self = this;
        self.logger.log('miapp.sdk.service.miappSync');
        if (!self.connection.isReady()) {
            return self.promise.reject('miapp.sdk.service.miappSync : DB sync impossible. Did you login ?');
        }
        const /** @type {?} */ firstSync = (self.session.dbLastSync === null);
        return new self.promise((resolve, reject) => {
            self._createSession();
            self.session.sync(self.connection.getUserId())
                .then(() => {
                self.logger.log('miapp.sdk.service.miappSync resolved');
                return self.session.isEmpty();
            })
                .catch((err) => {
                self.logger.warn('miapp.sdk.service.miappSync warn: ', err);
                return self.session.isEmpty();
            })
                .then((isEmpty) => {
                self.logger.log('miapp.sdk.service.miappSync isEmpty : ', isEmpty, firstSync);
                if (isEmpty && firstSync && fnInitFirstData) {
                    const /** @type {?} */ ret = fnInitFirstData(fnInitFirstData_Arg);
                    if (ret && ret['catch'] instanceof Function) {
                        return ret;
                    }
                    if (typeof ret === 'string') {
                        self.logger.log(ret);
                    }
                }
                return self.promise.resolve(); // self.connection.getUser());
            })
                .then(() => {
                self.logger.log('miapp.sdk.service.miappSync fnInitFirstData resolved');
                self.session.dbLastSync = new Date().getTime();
                return self.session.info();
            })
                .then((result) => {
                self.session.dbRecordCount = 0;
                if (result && result.doc_count) {
                    self.session.dbRecordCount = result.doc_count;
                }
                self.logger.log('miapp.sdk.service.miappSync _dbRecordCount : ' + self.session.dbRecordCount);
                return self.connection.refreshConnection();
            })
                .then((code) => {
                if (code === 403) {
                    reject({ code: code, msg: 'unauthorized (need login)' });
                }
                else {
                    resolve(); // self.connection.getUser()
                }
            })
                .catch((err) => {
                const /** @type {?} */ errMessage = 'miapp.sdk.service.miappSync err : ' + err.toString();
                // self.logger.error(errMessage);
                reject({ code: 500, msg: errMessage });
            });
        });
    }
    ;
    /**
     * @param {?} data
     * @return {?}
     */
    miappPutInDb(data) {
        const /** @type {?} */ self = this;
        self.logger.log('miapp.sdk.service.miappPutInDb :', data);
        if (!self.connection.getClientId() || !self.session.isReady()) {
            return self.promise.reject('miapp.sdk.service.miappPutInDb : ' +
                'DB put impossible. Need a user logged in.');
        }
        let /** @type {?} */ _id;
        if (data && typeof data === 'object' && Object.keys(data).indexOf('_id')) {
            _id = data._id;
        }
        if (!_id) {
            _id = self._generateObjectUniqueId(self.connection.miappId);
        }
        let /** @type {?} */ crypto;
        if (self.connection.miappCrypto) {
            crypto = {
                obj: self.connection,
                method: 'encrypt'
            };
        }
        return self.session.put(data, _id, self.connection.getClientId(), self.sdk.org, self.connection.miappVersion, crypto);
    }
    ;
    /**
     * @param {?} data_id
     * @return {?}
     */
    miappRemoveInDb(data_id) {
        const /** @type {?} */ self = this;
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
    }
    ;
    /**
     * @param {?} data_id
     * @return {?}
     */
    miappFindInDb(data_id) {
        const /** @type {?} */ self = this;
        if (!self.connection.getClientId() || !self.session.isReady()) {
            return self.promise.reject('miapp.sdk.service.miappFindInDb : need a user logged in.');
        }
        let /** @type {?} */ crypto;
        if (self.connection.miappCrypto) {
            crypto = {
                obj: self.connection,
                method: 'decrypt'
            };
        }
        return self.session.get(data_id, crypto);
    }
    ;
    /**
     * @return {?}
     */
    miappFindAllInDb() {
        const /** @type {?} */ self = this;
        if (!self.connection.getClientId() || !self.session.isReady()) {
            return self.promise.reject('miapp.sdk.service.miappFindAllInDb : need a user logged in.');
        }
        let /** @type {?} */ crypto;
        if (self.connection.miappCrypto) {
            crypto = {
                obj: self.connection,
                method: 'decrypt'
            };
        }
        return self.session.getAll(crypto);
    }
    ;
    /**
     * Logout then Login
     *
     * @param {?} login
     * @param {?} password
     * @param {?=} updateProperties
     * @return {?}
     */
    _loginInternal(login, password, updateProperties) {
        const /** @type {?} */ self = this;
        self.logger.log('miapp.sdk.service._loginInternal');
        if (!self.connection.isReady()) {
            return self.promise.reject('miapp.sdk.service._loginInternal : need init');
        }
        return new self.promise((resolve, reject) => {
            self.connection.getClient().logout()
                .then(msg => {
                return self.connection.getClient().login(login, password, updateProperties);
            })
                .then(loginUser => {
                loginUser.email = login;
                resolve(loginUser);
            })
                .catch(err => {
                self.logger.error('miapp.sdk.service._loginInternal error : ' + err);
                reject(err);
            });
        });
    }
    ;
    /**
     * @return {?}
     */
    _removeAll() {
        this.connection.destroy();
        return this.session.destroy();
    }
    ;
    /**
     * @return {?}
     */
    _createSession() {
        const /** @type {?} */ dbs = this.connection.getDBs();
        this.session.create();
        this.session.setRemote(dbs);
    }
    ;
    /**
     * @param {?=} a
     * @return {?}
     */
    _testPromise(a) {
        if (a) {
            return this.promise.resolve('test promise ok ' + a);
        }
        return new this.promise((resolve, reject) => {
            resolve('test promise ok');
        });
    }
    ;
    /**
     * @param {?} appName
     * @param {?=} type
     * @param {?=} name
     * @return {?}
     */
    _generateObjectUniqueId(appName, type, name) {
        // return null;
        const /** @type {?} */ now = new Date();
        const /** @type {?} */ simpleDate = '' + now.getFullYear() + '' + now.getMonth() + '' + now.getDate()
            + '' + now.getHours() + '' + now.getMinutes(); // new Date().toISOString();
        const /** @type {?} */ sequId = ++InternalService._srvDataUniqId;
        let /** @type {?} */ UId = '';
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
    }
}
InternalService._srvDataUniqId = 0;

/**
 * Angular2+ MiappService
 * \@class MiappService
 * @see ModuleServiceInterface
 *
 */
class MiappService {
    constructor() {
        this.miappService = null;
        this.promise = null;
        this.logger = new LoggerService();
        this.promise = Promise;
        this.miappService = null;
        // let pouchdbRequired = PouchDB;
        // pouchdbRequired.error();
    }
    ;
    /**
     * @param {?} miappId
     * @param {?=} options
     * @return {?}
     */
    init(miappId, options) {
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
    }
    ;
    /**
     * @param {?} login
     * @param {?} password
     * @return {?}
     */
    login(login, password) {
        if (!this.miappService) {
            return this.promise.reject('miapp.sdk.angular2.login : not initialized.');
        }
        return this.miappService.miappLogin(login, password);
    }
    ;
    /**
     * @param {?=} options
     * @return {?}
     */
    loginAsDemo(options) {
        if (!this.miappService) {
            return this.promise.reject('miapp.sdk.angular2.loginAsDemo : not initialized.');
        }
        return this.miappService.miappLoginInDemoMode(options);
    }
    ;
    /**
     * @return {?}
     */
    isLoggedIn() {
        if (!this.miappService) {
            return this.promise.reject('miapp.sdk.angular2.isLoggedIn : not initialized.');
        }
        return this.miappService.miappIsLogin();
    }
    ;
    /**
     * @return {?}
     */
    getRoles() {
        if (!this.miappService) {
            return [];
        }
        return this.miappService.miappRoles();
    }
    ;
    /**
     * @return {?}
     */
    getEndpoints() {
        if (!this.miappService) {
            return [];
        }
        return this.miappService.getEndpoints();
    }
    ;
    /**
     * @return {?}
     */
    logout() {
        if (!this.miappService) {
            return this.promise.reject('miapp.sdk.angular2.logout : not initialized.');
        }
        return this.miappService.miappLogout();
    }
    ;
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
    sync(fnInitFirstData) {
        if (!this.miappService) {
            return this.promise.reject('miapp.sdk.angular2.sync : not initialized.');
        }
        return this.miappService.miappSync(fnInitFirstData, this);
    }
    ;
    /**
     * Store data in your session
     *
     * @param {?} data
     * @return {?}
     */
    put(data) {
        if (!this.miappService) {
            return this.promise.reject('miapp.sdk.angular2.put : not initialized.');
        }
        return this.miappService.miappPutInDb(data);
    }
    ;
    /**
     * Find object Id and remove it from your session
     *
     * @param {?} id
     * @return {?}
     */
    remove(id) {
        if (!this.miappService) {
            return this.promise.reject('miapp.sdk.angular2.remove : not initialized.');
        }
        return this.miappService.miappRemoveInDb(id);
    }
    ;
    /**
     * Find
     * @param {?} id
     * @return {?}
     */
    find(id) {
        if (!this.miappService) {
            return this.promise.reject('miapp.sdk.angular2.find : not initialized.');
        }
        return this.miappService.miappFindInDb(id);
    }
    ;
    /**
     * @return {?}
     */
    findAll() {
        if (!this.miappService) {
            return this.promise.reject('miapp.sdk.angular2.findAll : not initialized.');
        }
        return this.miappService.miappFindAllInDb();
    }
    ;
}
MiappService.decorators = [
    { type: Injectable },
];
/**
 * @nocollapse
 */
MiappService.ctorParameters = () => [];
class LoggerService {
    /**
     * @param {?} message
     * @return {?}
     */
    log(message) {
        // console.log(message);
    }
    /**
     * @param {?} message
     * @return {?}
     */
    error(message) {
        console.error(message);
    }
    /**
     * @param {?} message
     * @return {?}
     */
    warn(message) {
        console.warn(message);
    }
}

/**
 * `NgModule` which provides associated services.
 *
 * ...
 *
 * \@stable
 */
class MiappModule {
    constructor() {
    }
}
MiappModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule
                ],
                declarations: [],
                exports: [],
                providers: [MiappService]
            },] },
];
/**
 * @nocollapse
 */
MiappModule.ctorParameters = () => [];

// export * from './tools'

/**
 * Generated bundle index. Do not edit.
 */

export { MiappModule, MiappService, LoggerService };
//# sourceMappingURL=miappio-sdk.js.map
