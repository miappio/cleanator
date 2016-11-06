import { Injectable } from '@angular/core';


//declare var Miapp:any
//import PouchDB from 'pouchdb'
declare var SrvMiapp:any;


@Injectable()
export class Miapp2Service {

    logger: LoggerService = new LoggerService();
    miappService : SrvMiapp = null;

    constructor() {
    };

    public init(miappId, miappSalt, isOffline) {
        if (this.miappService) return Promise.reject('miapp.sdk.angular2.login : already initialized.');
        this.miappService = new SrvMiapp(logger, Promise);
        return this.miappService.init(miappId, miappSalt, isOffline);
    };

    public login(login, password) {
        if (!this.miappService) return Promise.reject('miapp.sdk.angular2.login : not initialized.');
        return this.miappService.initDBWithLogin(login, password);
    };

    public sync(fnInitFirstData) {
        if (!this.miappService) return Promise.reject('miapp.sdk.angular2.sync : not initialized.');
        return this.miappService.syncComplete(fnInitFirstData);
    };

    public put(data) {
        if (!this.miappService) return Promise.reject('miapp.sdk.angular2.put : not initialized.');
        return this.miappService.putInDb(data);
    };

    public find(id) {
        if (!this.miappService) return Promise.reject('miapp.sdk.angular2.find : not initialized.');
        return this.miappService.findInDb(id);
    };
};

export class LoggerService {
    log(message: String) {
        console.log(message);
    }

    error(message: String) {
        alert(message);
    }
}