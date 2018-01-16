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
