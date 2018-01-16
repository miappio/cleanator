import { LoggerInterface, ModuleServiceInitOptionsInterface, ModuleServiceLoginOptionsInterface } from './interfaces';
/**
 * @private please use its angular.js or angular.io wrapper
 * usefull only for miapp.io dev team
 */
export declare class InternalService {
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
