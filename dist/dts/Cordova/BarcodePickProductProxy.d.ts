import { BarcodePickProductProxy } from 'scandit-datacapture-frameworks-barcode';
import { BaseNativeProxy } from 'scandit-datacapture-frameworks-core';
export declare class NativeBarcodePickProductProxy extends BaseNativeProxy implements BarcodePickProductProxy {
    private static get cordovaExec();
    subscribeProductIdentifierForItemsListener(): Promise<void>;
    unsubscribeListeners(): Promise<void>;
    finishOnProductIdentifierForItems(jsonData: string): Promise<void>;
    private productIdentifierForItemsListenerHandler;
}
