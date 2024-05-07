import { BarcodeFindViewProxy } from "scandit-datacapture-frameworks-barcode";
import { BaseNativeProxy } from "scandit-datacapture-frameworks-core";
import { BarcodeFindView } from "../BarcodeFindView";
export declare class NativeBarcodeFindViewProxy extends BaseNativeProxy implements BarcodeFindViewProxy {
    private static get cordovaExec();
    showView(): Promise<void>;
    hideView(): Promise<void>;
    onPause(): Promise<void>;
    onResume(): Promise<void>;
    startSearching(): Promise<void>;
    stopSearching(): Promise<void>;
    pauseSearching(): Promise<void>;
    findNodeHandle(_view?: BarcodeFindView | undefined): number | null;
    createView(_id: number | null, barcodeFindViewJson: string): Promise<void>;
    updateView(barcodeFindViewJson: string): Promise<void>;
    subscribeBarcodeFindViewListener(): Promise<void>;
    unsubscribeBarcodeFindViewListener(): Promise<void>;
    private notifyListeners;
}
