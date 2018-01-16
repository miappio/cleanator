import { LocalStorage } from '../tools/storage';
import { SdkInterface } from '../sdk/interfaces';
export declare class Client {
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
