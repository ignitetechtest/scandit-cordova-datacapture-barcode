import { BaseNativeProxy } from 'scandit-datacapture-frameworks-core';
import { BarcodeCountListenerProxy } from 'scandit-datacapture-frameworks-barcode';
export declare class NativeBarcodeCountListenerProxy extends BaseNativeProxy implements BarcodeCountListenerProxy {
    private static get cordovaExec();
    isModeEnabled: () => boolean;
    updateMode(barcodeCountJson: string): Promise<void>;
    resetBarcodeCount(): Promise<void>;
    registerBarcodeCountListener(): Promise<void>;
    setModeEnabledState(enabled: boolean): void;
    unregisterBarcodeCountListener(): Promise<void>;
    subscribeDidScan(): Promise<void>;
    subscribeDidListSessionUpdate(): Promise<void>;
    finishOnScan(): void;
    startScanningPhase(): void;
    endScanningPhase(): void;
    setBarcodeCountCaptureList(captureListStr: string): void;
    private notifyListeners;
    emitInCallback(enabled: boolean): void;
}
