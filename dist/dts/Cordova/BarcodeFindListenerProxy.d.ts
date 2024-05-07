import { BarcodeFindProxy } from 'scandit-datacapture-frameworks-barcode';
import { BaseNativeProxy } from 'scandit-datacapture-frameworks-core';
export declare class NativeBarcodeFindListenerProxy extends BaseNativeProxy implements BarcodeFindProxy {
    private static get cordovaExec();
    isModeEnabled: () => boolean;
    setItemList(itemsJson: string): Promise<void>;
    updateFindMode(barcodeFindJson: string): Promise<void>;
    barcodeFindModeStart(): Promise<void>;
    barcodeFindModePause(): Promise<void>;
    barcodeFindModeStop(): Promise<void>;
    setModeEnabledState(isEnabled: boolean): void;
    setBarcodeTransformer(): Promise<void>;
    submitBarcodeFindTransformerResult(transformedBarcode: string | null): Promise<void>;
    subscribeBarcodeFindListener(): Promise<void>;
    unsubscribeBarcodeFindListener(): Promise<void>;
    private notifyListeners;
}
