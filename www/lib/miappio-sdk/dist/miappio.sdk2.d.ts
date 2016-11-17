export declare class Miapp2Service {
    logger: LoggerService;
    miappService: any;
    constructor();
    init(miappId: any, miappSalt: any, isOffline: any): any;
    login(login: any, password: any): any;
    sync(fnInitFirstData: any): any;
    put(data: any): any;
    find(id: any): any;
    findAll(): any;
}
export declare class LoggerService {
    log(message: String): void;
    error(message: String): void;
}
