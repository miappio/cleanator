import { LocalStorage } from '../tools/storage';
import { Client } from './client';
import { ModuleServiceLoginOptionsInterface, SdkInterface } from '../sdk/interfaces';
export declare class Connection {
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
