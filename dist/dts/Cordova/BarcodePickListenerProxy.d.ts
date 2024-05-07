import { BarcodePickListenerProxy } from 'scandit-datacapture-frameworks-barcode';
import { BaseNativeProxy, EventEmitter } from 'scandit-datacapture-frameworks-core';
export declare class NativeBarcodePickListenerProxy extends BaseNativeProxy implements BarcodePickListenerProxy {
    private static get cordovaExec();
    protected eventEmitter: EventEmitter;
    subscribeBarcodePickListeners(): Promise<void>;
    unsubscribeBarcodePickListeners(): Promise<void>;
    subscribeDidCompleteScanningSessionListener(): Promise<void>;
    subscribeDidUpdateScanningSessionListener(): Promise<void>;
    private didCompleteScanningSessionListenerHandler;
    private didUpdateScanningSessionListenerHandler;
}
