export interface XhrOptionsInterface {
    url: string;
    data?: any;
    headers?: any;
    async?: boolean;
    username?: string;
    password?: string;
    withCredentials?: boolean;
}
export declare class Ajax {
    private xhr;
    constructor();
    post(args: XhrOptionsInterface): Promise<any>;
    put(args: XhrOptionsInterface): Promise<any>;
    delete(args: XhrOptionsInterface): Promise<any>;
    get(args: XhrOptionsInterface): Promise<any>;
}
