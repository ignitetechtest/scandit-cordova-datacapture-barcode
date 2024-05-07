import { SparkScanViewProxy } from "scandit-datacapture-frameworks-barcode";
import { BaseNativeProxy } from "scandit-datacapture-frameworks-core";
export declare class NativeSparkScanViewProxy extends BaseNativeProxy implements SparkScanViewProxy {
    private static get cordovaExec();
    updateSparkScanView(viewJson: string): Promise<void>;
    createSparkScanView(viewJson: string): Promise<void>;
    prepareScanning(): Promise<void>;
    disposeSparkScanView(): Promise<void>;
    showSparkScanView(): Promise<void>;
    hideSparkScanView(): Promise<void>;
    emitSparkScanViewFeedback(feedbackJson: string): Promise<void>;
    registerSparkScanViewListenerEvents(): void;
    unregisterSparkScanViewListenerEvents(): Promise<void>;
    stopSparkScanViewScanning(): Promise<void>;
    startSparkScanViewScanning(): Promise<void>;
    pauseSparkScanViewScanning(): Promise<void>;
    prepareSparkScanViewScanning(): Promise<void>;
    private notifyListeners;
    registerDelegateForEvents(): Promise<void>;
    unregisterDelegateForEvents(): Promise<void>;
    submitFeedbackForBarcode(feedbackJson: string): Promise<void>;
    showToast(text: string): Promise<void>;
    private onFeedbackForBarcodeHandler;
}
