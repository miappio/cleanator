import { LoggerInterface, ModuleServiceInterface, ModuleServiceInitOptionsInterface, ModuleServiceLoginOptionsInterface } from './interfaces';
/**
 * Angular2+ MiappService
 * @class MiappService
 * @see ModuleServiceInterface
 *
 */
export declare class MiappService implements ModuleServiceInterface {
    private logger;
    private miappService;
    private promise;
    constructor();
    init(miappId: any, options?: ModuleServiceInitOptionsInterface): Promise<boolean>;
    login(login: any, password: any): Promise<any>;
    loginAsDemo(options?: ModuleServiceLoginOptionsInterface): Promise<any>;
    isLoggedIn(): boolean;
    getRoles(): Array<string>;
    getEndpoints(): Array<string>;
    logout(): Promise<void>;
    /**
     *
     * Synchronize DB
     * @param fnInitFirstData  a function with db as input and that return promise: call if DB is empty
     * @returns {*} promise with this.session.db
     * @memberof miapp.angularService
     *
     * @example
     *  let initDb = function() {
     *     this.miappService.put('my first row');
     *  };
     *  this.miappService.sync(initDb)
     *  .then(user => ...)
     *  .catch(err => ...)
     *
     */
    sync(fnInitFirstData?: any): Promise<any>;
    /**
     * Store data in your session
     *
     * @param {Object} data to store
     * @returns {Promise<any>}
     */
    put(data: any): Promise<any>;
    /**
     * Find object Id and remove it from your session
     *
     * @param {string} id of object to find and remove
     * @returns {Promise<any>}
     */
    remove(id: string): Promise<any>;
    /**
     * Find
     * @param {string} id
     * @returns {Promise<any>}
     */
    find(id: string): Promise<any>;
    findAll(): Promise<any>;
}
export declare class LoggerService implements LoggerInterface {
    log(message: string): void;
    error(message: string): void;
    warn(message: string): void;
}
