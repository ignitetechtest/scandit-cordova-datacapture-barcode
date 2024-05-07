import { BarcodePick, BarcodePickViewSettings, BarcodePickActionListener, BarcodePickViewUiListener, BarcodePickViewListener } from 'scandit-datacapture-frameworks-barcode';
import { CameraSettings, DataCaptureContext, DefaultSerializeable } from 'scandit-datacapture-frameworks-core';
interface BarcodePickViewProps {
    context: DataCaptureContext;
    barcodePick: BarcodePick;
    settings: BarcodePickViewSettings;
    cameraSettings: CameraSettings;
    style: any;
}
export declare class BarcodePickView extends DefaultSerializeable {
    private baseBarcodePickView;
    private viewProxy;
    private htmlElement;
    private _htmlElementState;
    private domObserver;
    private scrollListener;
    constructor(props: BarcodePickViewProps);
    get uiListener(): BarcodePickViewUiListener | null;
    set uiListener(value: BarcodePickViewUiListener | null);
    private orientationChangeListener;
    private set htmlElementState(value);
    private get htmlElementState();
    connectToElement(element: HTMLElement): void;
    detachFromElement(): void;
    private subscribeToChangesOnHTMLElement;
    private unsubscribeFromChangesOnHTMLElement;
    private elementDidChange;
    private updatePositionAndSize;
    start(): void;
    freeze(): void;
    stop(): void;
    addListener(listener: BarcodePickViewListener): void;
    removeListener(listener: BarcodePickViewListener): void;
    addActionListener(listener: BarcodePickActionListener): void;
    removeActionListener(listener: BarcodePickActionListener): void;
    release(): void;
}
export {};
