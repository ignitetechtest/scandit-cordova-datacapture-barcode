import { BarcodeCountSessionProxy } from 'scandit-datacapture-frameworks-barcode';
export declare class NativeBarcodeCountSessionProxy implements BarcodeCountSessionProxy {
    private static get cordovaExec();
    getSpatialMap(): Promise<string | null>;
    getSpatialMapWithHints(expectedNumberOfRows: number, expectedNumberOfColumns: number): Promise<string | null>;
    resetSession(): Promise<void>;
}
export interface SpatialDataResult {
    data: string | null;
}
