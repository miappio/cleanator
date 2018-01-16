declare module "sdk/interfaces" {
    /**
     * Interface used by all InternalService wrappers (angular.js, angular.io)
     *
     * @see MiappModule
     * @see MiappModule, MiappAngularService
     */
    export interface ModuleServiceInterface {
        init(miappId: string, options?: ModuleServiceInitOptionsInterface): Promise<boolean>;
        login(login: string, password: string): Promise<any>;
        loginAsDemo(options?: ModuleServiceLoginOptionsInterface): Promise<any>;
        isLoggedIn(): boolean;
        getRoles(): Array<string>;
        getEndpoints(): Array<string>;
        logout(): Promise<void>;
        sync(fnInitFirstData?: any): Promise<any>;
        put(data: any): Promise<any>;
        remove(dataId: any): Promise<any>;
        find(id: string): Promise<any>;
        findAll(): Promise<any>;
    }
    export interface ModuleServiceInitOptionsInterface {
        prod: boolean;
        crypto?: boolean;
    }
    export interface ModuleServiceLoginOptionsInterface {
        accessToken?: string;
        idToken?: string;
        refreshToken?: string;
    }
    export interface SdkInterface {
        org: string;
        version: string;
        prod: boolean;
    }
    export interface LoggerInterface {
        log: (a?, b?, c?, d?, e?, f?) => any;
        error: (a?, b?, c?, d?, e?, f?) => any;
        warn: (a?, b?, c?, d?, e?, f?) => any;
    }
}
declare module "version/index" {
    export const version = "2.0.19";
}
declare module "tools/base64" {
    export class Base64 {
        constructor();
        /**
         * Decodes string from Base64 string
         */
        static encode(input: string): string;
        static decode(input: string): string;
    }
}
declare module "tools/storage" {
    /**
     * localStorage class factory
     * Usage : var LocalStorage = miapp.LocalStorageFactory(window.localStorage); // to create a new class
     * Usage : var localStorageService = new LocalStorage(); // to create a new instance
     */
    export class LocalStorage {
        private storageKey;
        version: string;
        private storage;
        constructor(storageService: any, storageKey: any);
        /**
         * Sets a key's value.
         *
         * @param {String} key - Key to set. If this value is not set or not
         *              a string an exception is raised.
         * @param {Mixed} value - Value to set. This can be any value that is JSON
         *              compatible (Numbers, Strings, Objects etc.).
         * @returns the stored value which is a container of user value.
         */
        set(key: any, value: any): any;
        /**
         * Looks up a key in cache
         *
         * @param {String} key - Key to look up.
         * @param {mixed} def - Default value to return, if key didn't exist.
         * @returns the key value, default value or <null>
         */
        get(key: any, def?: any): any;
        /**
         * Deletes a key from cache.
         *
         * @param {String} key - Key to delete.
         * @returns true if key existed or false if it didn't
         */
        remove(key: any): boolean;
        /**
         * Deletes everything in cache.
         *
         * @return true
         */
        clear(): boolean;
        /**
         * How much space in bytes does the storage take?
         *
         * @returns Number
         */
        size(): any;
        /**
         * Call function f on the specified context for each element of the storage
         * from index 0 to index length-1.
         * WARNING : You should not modify the storage during the loop !!!
         *
         * @param {Function} f - Function to call on every item.
         * @param {Object} context - Context (this for example).
         * @returns Number of items in storage
         */
        foreach(f: any, context: any): any;
        private checkKey(key);
    }
}
declare module "tools/xor" {
    export class Xor {
        constructor();
        static encrypt(value: string, key: string): string;
        static decrypt(value: string, key: string): string;
        static keyCharAt(key: any, i: any): any;
    }
}
declare module "tools/index" {
    export * from "tools/base64";
    export * from "tools/storage";
    export * from "tools/xor";
}
declare module "connection/xhrpromise" {
    export class XHRPromise {
        DEFAULT_CONTENT_TYPE: string;
        private _xhr;
        private _unloadHandler;
        constructor();
        send(options: any): Promise<any>;
        getXHR(): any;
        private _attachWindowUnload();
        private _detachWindowUnload();
        private _getHeaders();
        private _getResponseText();
        private _getResponseUrl();
        private _handleError(reason, reject, status?, statusText?);
        private _handleWindowUnload();
        private trim(str);
        private isArray(arg);
        private forEach(list, iterator);
        private forEachArray(array, iterator, context);
        private forEachString(string, iterator, context);
        private forEachObject(object, iterator, context);
        private _parseHeaders(headers);
    }
}
declare module "connection/ajax" {
    export interface XhrOptionsInterface {
        url: string;
        data?: any;
        headers?: any;
        async?: boolean;
        username?: string;
        password?: string;
        withCredentials?: boolean;
    }
    export class Ajax {
        private xhr;
        constructor();
        post(args: XhrOptionsInterface): Promise<any>;
        put(args: XhrOptionsInterface): Promise<any>;
        delete(args: XhrOptionsInterface): Promise<any>;
        get(args: XhrOptionsInterface): Promise<any>;
    }
}
declare module "connection/client" {
    import { LocalStorage } from "tools/storage";
    import { SdkInterface } from "sdk/interfaces";
    export class Client {
        private appId;
        private URI;
        private storage;
        private sdk;
        clientId: string;
        private clientUuid;
        private clientInfo;
        private refreshToken;
        private static refreshCount;
        constructor(appId: string, URI: string, storage: LocalStorage, sdk: SdkInterface);
        setClientId(value: string): void;
        setClientUuid(value: string): void;
        setClientInfo(value: string): void;
        setRefreshToken(value: string): void;
        login(login: string, password: string, updateProperties?: any): Promise<any>;
        reAuthenticate(): Promise<any>;
        logout(): Promise<any>;
        isReady(): boolean;
    }
}
declare module "connection/error" {
    export class Error {
        code: number;
        msg: string;
        constructor(code: number, msg: string);
    }
}
declare module "connection/connection" {
    import { LocalStorage } from "tools/storage";
    import { Client } from "connection/client";
    import { ModuleServiceLoginOptionsInterface, SdkInterface } from "sdk/interfaces";
    export class Connection {
        private _sdk;
        private _storage;
        miappId: string;
        miappVersion: string;
        miappCrypto: boolean;
        private _cryptoSalt;
        private _client;
        private _user;
        accessToken: string;
        idToken: string;
        refreshToken: string;
        states: {
            [s: string]: {
                state: boolean;
                time: number;
            };
        };
        endpoints: Array<string>;
        accessTokenPrevious: string;
        constructor(_sdk: SdkInterface, _storage: LocalStorage);
        isReady(): boolean;
        destroy(): void;
        setClient(client: Client): void;
        setUser(user: any): void;
        getUser(): any;
        getUserId(): any;
        getClient(): Client;
        setCryptoSalt(value: string): void;
        encrypt(data: any): string;
        decrypt(data: string): any;
        isLogin(): boolean;
        getClientId(): string;
        getIdPayload(def?: any): string;
        getAccessPayload(def?: any): string;
        getPreviousAccessPayload(def?: any): string;
        refreshConnection(): Promise<any>;
        setConnection(clientUser: any): void;
        setConnectionOffline(options: ModuleServiceLoginOptionsInterface): void;
        getEndpoints(options?: any): Array<string>;
        getDBs(options?: any): string[];
        verifyConnectionStates(): Promise<any>;
    }
}
declare module "connection/index" {
    export * from "connection/client";
    export * from "connection/ajax";
    export * from "connection/error";
    export * from "connection/connection";
}
declare module "session/session" {
    export interface SessionCryptoInterface {
        obj: Object;
        method: string;
    }
    export class Session {
        dbRecordCount: number;
        dbLastSync: number;
        private db;
        private remoteDb;
        private remoteUri;
        private dbs;
        constructor();
        isReady(): boolean;
        create(force?: boolean): void;
        destroy(): Promise<void>;
        setRemote(dbs: Array<string>): void;
        sync(userId: string): Promise<void>;
        put(data: any, _id: string, uid: string, oid: string, ave: string, crypto?: SessionCryptoInterface): Promise<string>;
        remove(data_id: string): Promise<void>;
        get(data_id: string, crypto?: SessionCryptoInterface): Promise<any>;
        getAll(crypto?: SessionCryptoInterface): Promise<any[]>;
        isEmpty(): Promise<boolean>;
        info(): Promise<any>;
        private write(item);
        private value(item);
    }
}
declare module "session/error" {
    export class Error {
        constructor();
    }
}
declare module "session/index" {
    export * from "session/session";
    export * from "session/error";
}
declare module "sdk/internal.service" {
    import { LoggerInterface, ModuleServiceInitOptionsInterface, ModuleServiceLoginOptionsInterface } from "sdk/interfaces";
    /**
     * @private please use its angular.js or angular.io wrapper
     * usefull only for miapp.io dev team
     */
    export class InternalService {
        private sdk;
        private logger;
        private promise;
        private storage;
        private session;
        private connection;
        constructor(logger: LoggerInterface, promise: PromiseConstructor);
        /**
         * Init connection & session
         * Check uri
         * Done each app start
         *
         * @param options Optional settings
         * @param options.miappId {string} required use your customized endpoints
         * @param options.miappSalt {string} required use your customized endpoints
         * @param options.miappVersion {string} required use your customized endpoints
         * @param options.devMode {boolean} optional default false, use your customized endpoints
         * @returns {*}
         */
        miappInit(miappId: string, options?: ModuleServiceInitOptionsInterface): Promise<{}>;
        /**
         * Call it if miappIsLogin() === false
         * Erase all (db & storage)
         *
         * @param login
         * @param password
         * @returns {*}
         */
        miappLogin(login: string, password: string): Promise<any>;
        /**
         *
         * @param options
         * @param options.accessToken {string} optional
         * @param options.idToken {string} optional
         * @returns {*}
         */
        miappLoginInDemoMode(options?: ModuleServiceLoginOptionsInterface): Promise<{}>;
        miappRoles(): any;
        miappMessage(): any;
        miappIsLogin(): boolean;
        /**
         *
         * @returns {Promise<void>}
         */
        miappLogout(): Promise<void>;
        /**
         * Synchronize DB
         *
         *
         * @param fnInitFirstData a function with db as input and that return promise: call if DB is empty
         * @param fnInitFirstData_Arg arg to set to fnInitFirstData()
         * @returns {*} promise
         */
        miappSync(fnInitFirstData?: any, fnInitFirstData_Arg?: any): Promise<void>;
        miappPutInDb(data: any): Promise<string>;
        miappRemoveInDb(data_id: string): Promise<void>;
        miappFindInDb(data_id: string): Promise<any>;
        miappFindAllInDb(): Promise<any[]>;
        /**
         * Logout then Login
         *
         * @param login
         * @param password
         * @param updateProperties
         * @returns {*}
         * @private
         */
        private _loginInternal(login, password, updateProperties?);
        private _removeAll();
        private _createSession();
        /**
         * @private
         */
        private _testPromise(a?);
        /**
         * @private
         */
        private static _srvDataUniqId;
        /**
         * @private
         */
        private _generateObjectUniqueId(appName, type?, name?);
    }
}
declare module "sdk/angularjs.module" {
    import { ModuleServiceInterface, ModuleServiceInitOptionsInterface, ModuleServiceLoginOptionsInterface } from "sdk/interfaces";
    /**
     * Miapp Angular Auth SDK : Help your app to manage your users (login) and session shared data (sync)
     * with an angular module
     * @class MiappAngularjsService
     *
     * @exemple
     *      // ... after install :
     *      // $ bower miappio-sdk
     *      // then init your app.js & use it in your services
     *
     * <script src="https://gist.github.com/mlefree/ad64f7f6a345856f6bf45fd59ca8db46.js"></script>
     *
     * <script src="https://gist.github.com/mlefree/ad64f7f6a345856f6bf45fd59ca8db46.js"></script>
     *
     */
    export class MiappAngularjsService implements ModuleServiceInterface {
        private logger;
        private promise;
        private miappService;
        /**
         * @param $log
         * @param $q
         * @constructor
         */
        constructor($log?: any, $q?: any);
        /**
         * Init the service with miapp.io IDs
         * @param miappId {String} given miapp.io appId
         * @param options Optional settings
         * @param options._devMode {boolean} optional default false, use your customized endpoints
         * @param options._forceOnline {boolean} optional force connection to miapp.io hub
         * @param options._forceEndpoint {String} optional auth endpoint
         * @param options._forceDBEndpoint {String} optional db endpoint
         * @memberof miapp.angularService
         */
        init(miappId: string, options?: ModuleServiceInitOptionsInterface): Promise<boolean>;
        /**
         *
         * @param login
         * @param password
         * @memberof miapp.angularService
         */
        login(login: any, password: any): any;
        loginAsDemo(options?: ModuleServiceLoginOptionsInterface): Promise<any>;
        /**
         * @return true if logged in
         * @memberof miapp.angularService
         */
        isLoggedIn(): any;
        getRoles(): any;
        getEndpoints(): any;
        /**
         * Logout all miapp services
         * @memberof miapp.angularService
         */
        logout(): Promise<void>;
        sync(fnInitFirstData: any): Promise<boolean>;
        /**
         *
         * @param data
         * @returns {*}
         * @memberof miapp.angularService
         */
        put(data: any): Promise<boolean>;
        /**
         *
         * @param dataId
         * @returns {*}
         * @memberof miapp.angularService
         */
        remove(dataId: string): Promise<any>;
        /**
         *
         * @param id
         * @returns {*}
         * @memberof miapp.angularService
         */
        find(id: any): any;
        /**
         *
         * @returns {*}
         * @memberof miapp.angularService
         */
        findAll(): any;
        /**
         * @deprecated
         * @private
         */
        private _testPromise();
    }
}
declare module "sdk/index.angularjs" {
    export * from "sdk/angularjs.module";
}
declare module "miapp.angularjs" {
    export * from "sdk/index.angularjs";
}
