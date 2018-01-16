export interface SessionCryptoInterface {
    obj: Object;
    method: string;
}
export declare class Session {
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
