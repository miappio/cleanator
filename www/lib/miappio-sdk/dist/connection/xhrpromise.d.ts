export declare class XHRPromise {
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
