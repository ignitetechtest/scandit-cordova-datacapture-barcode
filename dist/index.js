var barcode = require('scandit-cordova-datacapture-barcode.Barcode');
var scanditCordovaDatacaptureCore = require('scandit-cordova-datacapture-core.Core');
var scanditDatacaptureFrameworksCore = require('scandit-cordova-datacapture-core.Core');

class NativeBarcodeCaptureListenerProxy extends scanditDatacaptureFrameworksCore.BaseNativeProxy {
    constructor() {
        super(...arguments);
        this.isModeEnabled = () => false;
    }
    static get cordovaExec() {
        return Cordova.exec;
    }
    resetSession() {
        return new Promise((resolve, reject) => {
            NativeBarcodeCaptureListenerProxy.cordovaExec(resolve, reject, CordovaFunction.ResetBarcodeCaptureSession, null);
        });
    }
    registerListenerForEvents() {
        NativeBarcodeCaptureListenerProxy.cordovaExec(this.notifyListeners.bind(this), null, CordovaFunction.SubscribeBarcodeCaptureListener, null);
    }
    setModeEnabledState(enabled) {
        NativeBarcodeCaptureListenerProxy.cordovaExec(null, null, CordovaFunction.SetBarcodeCaptureModeEnabledState, [{ 'enabled': enabled }]);
    }
    unregisterListenerForEvents() {
        NativeBarcodeCaptureListenerProxy.cordovaExec(null, null, CordovaFunction.UnsubscribeBarcodeCaptureListener, null);
    }
    finishDidUpdateSessionCallback(isFinished) {
        NativeBarcodeCaptureListenerProxy.cordovaExec(null, null, CordovaFunction.FinishBarcodeCaptureDidUpdateSession, [{ 'enabled': isFinished }]);
    }
    finishDidScanCallback(isFinished) {
        NativeBarcodeCaptureListenerProxy.cordovaExec(null, null, CordovaFunction.FinishBarcodeCaptureDidScan, [{ 'enabled': isFinished }]);
    }
    updateBarcodeCaptureMode(modeJson) {
        return new Promise((resolve, reject) => {
            NativeBarcodeCaptureListenerProxy.cordovaExec(resolve, reject, CordovaFunction.UpdateBarcodeCaptureMode, [modeJson]);
        });
    }
    applyBarcodeCaptureModeSettings(newSettingsJson) {
        return new Promise((resolve, reject) => {
            NativeBarcodeCaptureListenerProxy.cordovaExec(resolve, reject, CordovaFunction.ApplyBarcodeCaptureModeSettings, [newSettingsJson]);
        });
    }
    updateBarcodeCaptureOverlay(overlayJson) {
        return new Promise((resolve, reject) => {
            NativeBarcodeCaptureListenerProxy.cordovaExec(resolve, reject, CordovaFunction.UpdateBarcodeCaptureOverlay, [overlayJson]);
        });
    }
    emitInCallback(enabled) {
        this.eventEmitter.emit(barcode.BarcodeCaptureListenerEvents.inCallback, enabled);
    }
    notifyListeners(event) {
        const done = () => {
            this.emitInCallback(false);
            return { enabled: this.isModeEnabled() };
        };
        this.emitInCallback(true);
        if (!event) {
            // The event could be undefined/null in case the plugin result did not pass a "message",
            // which could happen e.g. in case of "ok" results, which could signal e.g. successful
            // listener subscriptions.
            return done();
        }
        switch (event.name) {
            case barcode.BarcodeCaptureListenerEvents.didScan:
                this.eventEmitter.emit(barcode.BarcodeCaptureListenerEvents.didScan, JSON.stringify(event.argument));
                break;
            case barcode.BarcodeCaptureListenerEvents.didUpdateSession:
                this.eventEmitter.emit(barcode.BarcodeCaptureListenerEvents.didUpdateSession, JSON.stringify(event.argument));
                break;
        }
        return done();
    }
}

class NativeBarcodeSelectionListenerProxy extends scanditDatacaptureFrameworksCore.BaseNativeProxy {
    static get cordovaExec() {
        return Cordova.exec;
    }
    getCount(selectionIdentifier) {
        return new Promise((resolve, reject) => {
            NativeBarcodeSelectionListenerProxy.cordovaExec(resolve, reject, CordovaFunction.GetCountForBarcodeInBarcodeSelectionSession, [selectionIdentifier]);
        });
    }
    resetSession() {
        return new Promise((resolve, reject) => {
            NativeBarcodeSelectionListenerProxy.cordovaExec(resolve, reject, CordovaFunction.ResetBarcodeSelectionSession, null);
        });
    }
    registerListenerForEvents() {
        NativeBarcodeSelectionListenerProxy.cordovaExec(this.notifyListeners.bind(this), null, CordovaFunction.SubscribeBarcodeSelectionListener, null);
    }
    finishDidUpdateSelectionCallback(isEnabled) {
        NativeBarcodeSelectionListenerProxy.cordovaExec(null, null, CordovaFunction.FinishBarcodeSelectionDidUpdateSelection, [{ 'enabled': isEnabled }]);
    }
    finishDidUpdateSessionCallback(isEnabled) {
        NativeBarcodeSelectionListenerProxy.cordovaExec(null, null, CordovaFunction.FinishBarcodeSelectionDidUpdateSession, [{ 'enabled': isEnabled }]);
    }
    unregisterListenerForEvents() {
        NativeBarcodeSelectionListenerProxy.cordovaExec(null, null, CordovaFunction.UnsubscribeBarcodeSelectionListener, null);
    }
    notifyListeners(event) {
        const done = () => {
            this.eventEmitter.emit(barcode.BarcodeSelectionListenerEvents.inCallback, false);
            return { enabled: this.isModeEnabled() };
        };
        this.eventEmitter.emit(barcode.BarcodeSelectionListenerEvents.inCallback, true);
        if (!event) {
            // The event could be undefined/null in case the plugin result did not pass a "message",
            // which could happen e.g. in case of "ok" results, which could signal e.g. successful
            // listener subscriptions.
            return done();
        }
        switch (event.name) {
            case barcode.BarcodeSelectionListenerEvents.didUpdateSelection:
                this.eventEmitter.emit(barcode.BarcodeSelectionListenerEvents.didUpdateSelection, JSON.stringify(event.argument));
                break;
            case barcode.BarcodeSelectionListenerEvents.didUpdateSession:
                this.eventEmitter.emit(barcode.BarcodeSelectionListenerEvents.didUpdateSession, JSON.stringify(event.argument));
                break;
        }
        return done();
    }
}

class NativeBarcodeSelectionProxy extends scanditDatacaptureFrameworksCore.BaseNativeProxy {
    static get cordovaExec() {
        return Cordova.exec;
    }
    unfreezeCamera() {
        return new Promise((resolve, reject) => {
            NativeBarcodeSelectionProxy.cordovaExec(resolve, reject, CordovaFunction.UnfreezeCameraInBarcodeSelection, null);
        });
    }
    resetMode() {
        return new Promise((resolve, reject) => {
            NativeBarcodeSelectionProxy.cordovaExec(resolve, reject, CordovaFunction.ResetBarcodeSelection, null);
        });
    }
    selectAimedBarcode() {
        return new Promise((resolve, reject) => {
            NativeBarcodeSelectionProxy.cordovaExec(resolve, reject, CordovaFunction.SelectAimedBarcode, null);
        });
    }
    unselectBarcodes(barcodesStr) {
        return new Promise((resolve, reject) => {
            NativeBarcodeSelectionProxy.cordovaExec(resolve, reject, CordovaFunction.UnselectBarcodes, [barcodesStr]);
        });
    }
    setSelectBarcodeEnabled(barcodeStr, enabled) {
        return new Promise((resolve, reject) => {
            NativeBarcodeSelectionProxy.cordovaExec(resolve, reject, CordovaFunction.SetSelectBarcodeEnabled, [[{ barcode: barcodeStr, enabled }]]);
        });
    }
    increaseCountForBarcodes(barcodeStr) {
        return new Promise((resolve, reject) => {
            NativeBarcodeSelectionProxy.cordovaExec(resolve, reject, CordovaFunction.IncreaseCountForBarcodes, [barcodeStr]);
        });
    }
    setModeEnabledState(enabled) {
        NativeBarcodeSelectionProxy.cordovaExec(null, null, CordovaFunction.SetBarcodeSelectionModeEnabledState, [{ 'enabled': enabled }]);
    }
    updateBarcodeSelectionMode(modeJson) {
        return new Promise((resolve, reject) => {
            NativeBarcodeSelectionProxy.cordovaExec(resolve, reject, CordovaFunction.UpdateBarcodeSelectionMode, [modeJson]);
        });
    }
    applyBarcodeSelectionModeSettings(newSettingsJson) {
        return new Promise((resolve, reject) => {
            NativeBarcodeSelectionProxy.cordovaExec(resolve, reject, CordovaFunction.ApplyBarcodeSelectionModeSettings, [newSettingsJson]);
        });
    }
}

class NativeBarcodeSelectionOverlayProxy extends scanditDatacaptureFrameworksCore.BaseNativeProxy {
    static get cordovaExec() {
        return Cordova.exec;
    }
    setTextForAimToSelectAutoHint(text) {
        return new Promise((resolve, reject) => {
            NativeBarcodeSelectionOverlayProxy.cordovaExec(resolve, reject, CordovaFunction.SetTextForAimToSelectAutoHint, [{ 'text': text }]);
        });
    }
    removeAimedBarcodeBrushProvider() {
        return new Promise((resolve, reject) => {
            NativeBarcodeSelectionOverlayProxy.cordovaExec(resolve, reject, CordovaFunction.RemoveAimedBarcodeBrushProvider, null);
        });
    }
    setAimedBarcodeBrushProvider() {
        return new Promise((resolve, reject) => {
            NativeBarcodeSelectionOverlayProxy.cordovaExec(resolve, reject, CordovaFunction.SetAimedBarcodeBrushProvider, null);
        });
    }
    finishBrushForAimedBarcodeCallback(brushStr, selectionIdentifier) {
        NativeBarcodeSelectionOverlayProxy.cordovaExec(null, null, CordovaFunction.FinishBrushForAimedBarcodeCallback, [{ 'brush': brushStr, 'selectionIdentifier': selectionIdentifier }]);
    }
    removeTrackedBarcodeBrushProvider() {
        return new Promise((resolve, reject) => {
            NativeBarcodeSelectionOverlayProxy.cordovaExec(resolve, reject, CordovaFunction.RemoveTrackedBarcodeBrushProvider, null);
        });
    }
    setTrackedBarcodeBrushProvider() {
        return new Promise((resolve, reject) => {
            NativeBarcodeSelectionOverlayProxy.cordovaExec(resolve, reject, CordovaFunction.SetTrackedBarcodeBrushProvider, null);
        });
    }
    finishBrushForTrackedBarcodeCallback(brushStr, selectionIdentifier) {
        NativeBarcodeSelectionOverlayProxy.cordovaExec(null, null, CordovaFunction.FinishBrushForTrackedBarcodeCallback, [{ 'brush': brushStr, 'selectionIdentifier': selectionIdentifier }]);
    }
    updateBarcodeSelectionBasicOverlay(overlayJson) {
        return new Promise((resolve, reject) => {
            NativeBarcodeSelectionOverlayProxy.cordovaExec(resolve, reject, CordovaFunction.UpdateBarcodeSelectionBasicOverlay, [overlayJson]);
        });
    }
    subscribeBrushForTrackedBarcode() {
        // setTrackedBarcodeBrushProvider is also subscribing for events on Cordova
    }
    subscribeBrushForAimedBarcode() {
        // setAimedBarcodeBrushProvider is also subscribing for events on Cordova
    }
    notifyListeners(event) {
        const done = () => {
            this.eventEmitter.emit(barcode.BarcodeSelectionBrushProviderEvents.inCallback, false);
            return { enabled: this.isModeEnabled() };
        };
        this.eventEmitter.emit(barcode.BarcodeSelectionBrushProviderEvents.inCallback, true);
        if (!event) {
            // The event could be undefined/null in case the plugin result did not pass a "message",
            // which could happen e.g. in case of "ok" results, which could signal e.g. successful
            // listener subscriptions.
            return done();
        }
        switch (event.name) {
            case barcode.BarcodeSelectionBrushProviderEvents.brushForAimedBarcode:
                this.eventEmitter.emit(barcode.BarcodeSelectionBrushProviderEvents.brushForAimedBarcode, JSON.stringify(event.argument));
                break;
            case barcode.BarcodeSelectionBrushProviderEvents.brushForTrackedBarcode:
                this.eventEmitter.emit(barcode.BarcodeSelectionBrushProviderEvents.brushForAimedBarcode, JSON.stringify(event.argument));
                break;
        }
        return done();
    }
}

class NativeBarcodeTrackingListenerProxy extends scanditDatacaptureFrameworksCore.BaseNativeProxy {
    constructor() {
        super(...arguments);
        this.isModeEnabled = () => false;
    }
    static get cordovaExec() {
        return Cordova.exec;
    }
    resetSession() {
        return new Promise((resolve, reject) => {
            NativeBarcodeTrackingListenerProxy.cordovaExec(resolve, reject, CordovaFunction.ResetBarcodeTrackingSession, null);
        });
    }
    registerListenerForEvents() {
        NativeBarcodeTrackingListenerProxy.cordovaExec(this.notifyListeners.bind(this), null, CordovaFunction.SubscribeBarcodeTrackingListener, null);
    }
    unregisterListenerForEvents() {
        NativeBarcodeTrackingListenerProxy.cordovaExec(this.notifyListeners.bind(this), null, CordovaFunction.UnregisterBarcodeTrackingListener, null);
    }
    setModeEnabledState(enabled) {
        NativeBarcodeTrackingListenerProxy.cordovaExec(null, null, CordovaFunction.SetBarcodeTrackingModeEnabledState, [{ 'enabled': enabled }]);
    }
    updateBarcodeTrackingMode(modeJson) {
        return new Promise((resolve, reject) => {
            NativeBarcodeTrackingListenerProxy.cordovaExec(resolve, reject, CordovaFunction.UpdateBarcodeTrackingMode, [modeJson]);
        });
    }
    applyBarcodeTrackingModeSettings(newSettingsJson) {
        return new Promise((resolve, reject) => {
            NativeBarcodeTrackingListenerProxy.cordovaExec(resolve, reject, CordovaFunction.ApplyBarcodeTrackingModeSettings, [newSettingsJson]);
        });
    }
    finishDidUpdateSessionCallback(enabled) {
        NativeBarcodeTrackingListenerProxy.cordovaExec(null, null, CordovaFunction.FinishBarcodeTrackingDidUpdateSession, [{ 'enabled': enabled }]);
    }
    notifyListeners(event) {
        const done = () => {
            this.eventEmitter.emit(barcode.BarcodeTrackingListenerEvents.inCallback, false);
            return { enabled: this.isModeEnabled() };
        };
        this.eventEmitter.emit(barcode.BarcodeTrackingListenerEvents.inCallback, true);
        if (!event) {
            // The event could be undefined/null in case the plugin result did not pass a "message",
            // which could happen e.g. in case of "ok" results, which could signal e.g. successful
            // listener subscriptions.
            return done();
        }
        switch (event.name) {
            case barcode.BarcodeTrackingListenerEvents.didUpdateSession:
                this.eventEmitter.emit(barcode.BarcodeTrackingListenerEvents.didUpdateSession, JSON.stringify(event.argument));
                break;
        }
        return done();
    }
}

class NativeBarcodeTrackingBasicOverlayProxy extends scanditDatacaptureFrameworksCore.BaseNativeProxy {
    static get cordovaExec() {
        return Cordova.exec;
    }
    setBrushForTrackedBarcode(brushJson, trackedBarcodeIdentifier, sessionFrameSequenceID) {
        return new Promise((resolve, reject) => {
            NativeBarcodeTrackingBasicOverlayProxy.cordovaExec(resolve, reject, CordovaFunction.SetBrushForTrackedBarcode, [{
                    brush: brushJson,
                    sessionFrameSequenceID: sessionFrameSequenceID,
                    trackedBarcodeID: trackedBarcodeIdentifier,
                }]);
        });
    }
    clearTrackedBarcodeBrushes() {
        return new Promise((resolve, reject) => {
            NativeBarcodeTrackingBasicOverlayProxy.cordovaExec(resolve, reject, CordovaFunction.ClearTrackedBarcodeBrushes, null);
        });
    }
    registerListenerForBasicOverlayEvents() {
        NativeBarcodeTrackingBasicOverlayProxy.cordovaExec(this.notifyListeners.bind(this), null, CordovaFunction.SubscribeBarcodeTrackingBasicOverlayListener, null);
    }
    updateBarcodeTrackingBasicOverlay(overlayJson) {
        return new Promise((resolve, reject) => {
            NativeBarcodeTrackingBasicOverlayProxy.cordovaExec(resolve, reject, CordovaFunction.UpdateBarcodeTrackingBasicOverlay, [overlayJson]);
        });
    }
    unregisterListenerForBasicOverlayEvents() {
        return new Promise((resolve, reject) => {
            NativeBarcodeTrackingBasicOverlayProxy.cordovaExec(resolve, reject, CordovaFunction.UnregisterBarcodeTrackingBasicOverlayListener, null);
        });
    }
    notifyListeners(event) {
        if (!event) {
            // The event could be undefined/null in case the plugin result did not pass a "message",
            // which could happen e.g. in case of "ok" results, which could signal e.g. successful
            // listener subscriptions.
            return null;
        }
        switch (event.name) {
            case barcode.BarcodeTrackingBasicOverlayListenerEvents.brushForTrackedBarcode:
                this.eventEmitter.emit(barcode.BarcodeTrackingBasicOverlayListenerEvents.brushForTrackedBarcode, JSON.stringify(event.argument));
                break;
            case barcode.BarcodeTrackingBasicOverlayListenerEvents.didTapTrackedBarcode:
                this.eventEmitter.emit(barcode.BarcodeTrackingBasicOverlayListenerEvents.didTapTrackedBarcode, JSON.stringify(event.argument));
                break;
        }
        return null;
    }
}

class NativeBarcodeTrackingAdvancedOverlayProxy extends scanditDatacaptureFrameworksCore.BaseNativeProxy {
    static get cordovaExec() {
        return Cordova.exec;
    }
    setBrushForTrackedBarcode(_brushJson, _sessionFrameSequenceID, _trackedBarcodeIdentifier) {
        return Promise.resolve();
    }
    setViewForTrackedBarcode(viewJson, trackedBarcodeIdentifier, sessionFrameSequenceID) {
        return new Promise((resolve, reject) => {
            NativeBarcodeTrackingAdvancedOverlayProxy.cordovaExec(resolve, reject, CordovaFunction.SetViewForTrackedBarcode, [{
                    view: viewJson,
                    sessionFrameSequenceID: sessionFrameSequenceID === null || sessionFrameSequenceID === void 0 ? void 0 : sessionFrameSequenceID.toString(),
                    trackedBarcodeID: trackedBarcodeIdentifier.toString(),
                }]);
        });
    }
    setAnchorForTrackedBarcode(anchor, trackedBarcodeIdentifier, sessionFrameSequenceID) {
        return new Promise((resolve, reject) => {
            NativeBarcodeTrackingAdvancedOverlayProxy.cordovaExec(resolve, reject, CordovaFunction.SetAnchorForTrackedBarcode, [{
                    anchor,
                    sessionFrameSequenceID: sessionFrameSequenceID === null || sessionFrameSequenceID === void 0 ? void 0 : sessionFrameSequenceID.toString(),
                    trackedBarcodeID: trackedBarcodeIdentifier.toString(),
                }]);
        });
    }
    setOffsetForTrackedBarcode(offsetJson, trackedBarcodeIdentifier, sessionFrameSequenceID) {
        return new Promise((resolve, reject) => {
            NativeBarcodeTrackingAdvancedOverlayProxy.cordovaExec(resolve, reject, CordovaFunction.SetOffsetForTrackedBarcode, [{
                    offset: offsetJson,
                    sessionFrameSequenceID: sessionFrameSequenceID === null || sessionFrameSequenceID === void 0 ? void 0 : sessionFrameSequenceID.toString(),
                    trackedBarcodeID: trackedBarcodeIdentifier.toString(),
                }]);
        });
    }
    clearTrackedBarcodeViews() {
        return new Promise((resolve, reject) => {
            NativeBarcodeTrackingAdvancedOverlayProxy.cordovaExec(resolve, reject, CordovaFunction.ClearTrackedBarcodeViews, null);
        });
    }
    registerListenerForAdvancedOverlayEvents() {
        NativeBarcodeTrackingAdvancedOverlayProxy.cordovaExec(this.notifyListeners.bind(this), null, CordovaFunction.SubscribeBarcodeTrackingAdvancedOverlayListener, null);
    }
    updateBarcodeTrackingAdvancedOverlay(overlayJson) {
        return new Promise((resolve, reject) => {
            NativeBarcodeTrackingAdvancedOverlayProxy.cordovaExec(resolve, reject, CordovaFunction.UpdateBarcodeTrackingAdvancedOverlay, [overlayJson]);
        });
    }
    unregisterListenerForAdvancedOverlayEvents() {
        return new Promise((resolve, reject) => {
            NativeBarcodeTrackingAdvancedOverlayProxy.cordovaExec(resolve, reject, CordovaFunction.UnregisterBarcodeTrackingAdvancedOverlayListener, null);
        });
    }
    getJSONStringForView(view) {
        return view ? view.toJSON() : null;
    }
    notifyListeners(event) {
        if (!event) {
            // The event could be undefined/null in case the plugin result did not pass a "message",
            // which could happen e.g. in case of "ok" results, which could signal e.g. successful
            // listener subscriptions.
            return null;
        }
        switch (event.name) {
            case barcode.BarcodeTrackingAdvancedOverlayListenerEvents.viewForTrackedBarcode:
                this.eventEmitter.emit(barcode.BarcodeTrackingAdvancedOverlayListenerEvents.viewForTrackedBarcode, JSON.stringify(event.argument));
                break;
            case barcode.BarcodeTrackingAdvancedOverlayListenerEvents.anchorForTrackedBarcode:
                this.eventEmitter.emit(barcode.BarcodeTrackingAdvancedOverlayListenerEvents.anchorForTrackedBarcode, JSON.stringify(event.argument));
                break;
            case barcode.BarcodeTrackingAdvancedOverlayListenerEvents.offsetForTrackedBarcode:
                this.eventEmitter.emit(barcode.BarcodeTrackingAdvancedOverlayListenerEvents.offsetForTrackedBarcode, JSON.stringify(event.argument));
                break;
            case barcode.BarcodeTrackingAdvancedOverlayListenerEvents.didTapViewForTrackedBarcode:
                this.eventEmitter.emit(barcode.BarcodeTrackingAdvancedOverlayListenerEvents.didTapViewForTrackedBarcode, JSON.stringify(event.argument));
                break;
        }
        return null;
    }
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

class NativeBarcodePickProductProxy extends scanditDatacaptureFrameworksCore.BaseNativeProxy {
    static get cordovaExec() {
        return Cordova.exec;
    }
    subscribeProductIdentifierForItemsListener() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((_, reject) => {
                NativeBarcodePickProductProxy.cordovaExec(this.productIdentifierForItemsListenerHandler.bind(this), reject, CordovaFunction.SubscribeProductIdentifierForItemsListener, null);
            });
        });
    }
    unsubscribeListeners() {
        return new Promise((resolve, reject) => {
            NativeBarcodePickProductProxy.cordovaExec(resolve, reject, CordovaFunction.UnsubscribeProductIdentifierForItemsListener, null);
        });
    }
    finishOnProductIdentifierForItems(jsonData) {
        return new Promise((resolve, reject) => {
            NativeBarcodePickProductProxy.cordovaExec(resolve, reject, CordovaFunction.FinishOnProductIdentifierForItems, [jsonData]);
        });
    }
    productIdentifierForItemsListenerHandler(event) {
        this.eventEmitter.emit(barcode.BarcodePickEvents.OnProductIdentifierForItems, JSON.stringify(event));
    }
}

class NativeBarcodePickViewProxy extends scanditDatacaptureFrameworksCore.BaseNativeProxy {
    static get cordovaExec() {
        return Cordova.exec;
    }
    registerFrameworkEvents() {
        this.addViewListener();
        this.subscribeDidPickItemListener();
        this.subscribeDidUnpickItemListener();
    }
    addViewListener() {
        this.subscribeDidStartScanningListener();
        this.subscribeDidFreezeScanningListener();
        this.subscribeDidPauseScanningListener();
        this.subscribeDidStopScanningListener();
        return new Promise((resolve, reject) => {
            NativeBarcodePickViewProxy.cordovaExec(resolve, reject, CordovaFunction.AddViewListener, null);
        });
    }
    unregisterFrameworkEvents() {
        this.unsubscribeListeners();
    }
    initialize(_view) {
        return Promise.resolve();
    }
    findNodeHandle(_view) {
        // This is only needed on React Native
        return null;
    }
    createView(_, json) {
        return new Promise((resolve, reject) => {
            NativeBarcodePickViewProxy.cordovaExec(resolve, reject, CordovaFunction.CreatePickView, [json]);
        });
    }
    viewStart() {
        return new Promise((resolve, reject) => {
            NativeBarcodePickViewProxy.cordovaExec(resolve, reject, CordovaFunction.PickViewStart, null);
        });
    }
    viewPause() {
        // NOOP because lifecycle is handled automatically on the android module
        return Promise.resolve();
    }
    viewFreeze() {
        return new Promise((resolve, reject) => {
            NativeBarcodePickViewProxy.cordovaExec(resolve, reject, CordovaFunction.PickViewFreeze, null);
        });
    }
    viewStop() {
        return new Promise((resolve, reject) => {
            NativeBarcodePickViewProxy.cordovaExec(resolve, reject, CordovaFunction.PickViewFreeze, null);
        });
    }
    viewResume() {
        // NOOP because lifecycle is handled automatically on the android module
        return Promise.resolve();
    }
    updateView(json) {
        return new Promise((resolve, reject) => {
            NativeBarcodePickViewProxy.cordovaExec(resolve, reject, CordovaFunction.UpdatePickView, [json]);
        });
    }
    setPositionAndSize(top, left, width, height, shouldBeUnderWebView) {
        return new Promise((resolve, reject) => {
            NativeBarcodePickViewProxy.cordovaExec(resolve, reject, CordovaFunction.SetPositionAndSize, [{ top: top, left: left, width: width, height: height, shouldBeUnderWebView: shouldBeUnderWebView }]);
        });
    }
    subscribeDidPickItemListener() {
        return new Promise((_, reject) => {
            NativeBarcodePickViewProxy.cordovaExec(this.didPickItemListenerHandler.bind(this), reject, CordovaFunction.SubscribeDidPickItemListener, null);
        });
    }
    subscribeDidUnpickItemListener() {
        return new Promise((_, reject) => {
            NativeBarcodePickViewProxy.cordovaExec(this.didUnpickItemListenerHandler.bind(this), reject, CordovaFunction.SubscribeDidUnpickItemListener, null);
        });
    }
    addActionListener() {
        return new Promise((resolve, reject) => {
            NativeBarcodePickViewProxy.cordovaExec(resolve, reject, CordovaFunction.AddActionListener, null);
        });
    }
    subscribeBarcodePickViewUiListener() {
        this.registerBarcodePickViewUiListener();
        return new Promise((_, reject) => {
            NativeBarcodePickViewProxy.cordovaExec(this.viewUiListenerHandler.bind(this), reject, CordovaFunction.SubscribeBarcodePickViewUiListener, null);
        });
    }
    registerBarcodePickViewUiListener() {
        return new Promise((resolve, reject) => {
            NativeBarcodePickViewProxy.cordovaExec(resolve, reject, CordovaFunction.RegisterBarcodePickViewUiListener, null);
        });
    }
    unsubscribeBarcodePickViewUiListener() {
        return new Promise((resolve, reject) => {
            NativeBarcodePickViewProxy.cordovaExec(resolve, reject, CordovaFunction.UnsubscribeBarcodePickViewUiListener, null);
        });
    }
    subscribeDidStartScanningListener() {
        return new Promise((_, reject) => {
            NativeBarcodePickViewProxy.cordovaExec(this.didStartScanningListenerHandler.bind(this), reject, CordovaFunction.SubscribeDidStartScanningListener, null);
        });
    }
    subscribeDidFreezeScanningListener() {
        return new Promise((_, reject) => {
            NativeBarcodePickViewProxy.cordovaExec(this.didFreezeScanningListenerHandler.bind(this), reject, CordovaFunction.SubscribeDidFreezeScanningListener, null);
        });
    }
    subscribeDidPauseScanningListener() {
        return new Promise((_, reject) => {
            NativeBarcodePickViewProxy.cordovaExec(this.didPauseScanningListenerHandler.bind(this), reject, CordovaFunction.SubscribeDidPauseScanningListener, null);
        });
    }
    subscribeDidStopScanningListener() {
        return new Promise((_, reject) => {
            NativeBarcodePickViewProxy.cordovaExec(this.didStopScanningListenerHandler.bind(this), reject, CordovaFunction.SubscribeDidStopScanningListener, null);
        });
    }
    finishPickAction(code, result) {
        return new Promise((resolve, reject) => {
            NativeBarcodePickViewProxy.cordovaExec(resolve, reject, CordovaFunction.FinishPickAction, [{ code: code, result: result }]);
        });
    }
    unsubscribeListeners() {
        return new Promise((resolve, reject) => {
            NativeBarcodePickViewProxy.cordovaExec(resolve, reject, CordovaFunction.UnsubscribeListeners, null);
        });
    }
    didPickItemListenerHandler(event) {
        this.eventEmitter.emit(barcode.BarcodePickEvents.DidPick, JSON.stringify(event.argument));
    }
    didUnpickItemListenerHandler(event) {
        this.eventEmitter.emit(barcode.BarcodePickEvents.DidUnpick, JSON.stringify(event.argument));
    }
    viewUiListenerHandler(event) {
        this.eventEmitter.emit(barcode.BarcodePickViewUiListenerEvents.DidTapFinishButton, JSON.stringify(event.argument));
    }
    didStartScanningListenerHandler(event) {
        this.eventEmitter.emit(barcode.BarcodePickViewListenerEvents.DidStartScanning, JSON.stringify(event.argument));
    }
    didFreezeScanningListenerHandler(event) {
        this.eventEmitter.emit(barcode.BarcodePickViewListenerEvents.DidFreezeScanning, JSON.stringify(event.argument));
    }
    didPauseScanningListenerHandler(event) {
        this.eventEmitter.emit(barcode.BarcodePickViewListenerEvents.DidPauseScanning, JSON.stringify(event.argument));
    }
    didStopScanningListenerHandler(event) {
        this.eventEmitter.emit(barcode.BarcodePickViewListenerEvents.DidStopScanning, JSON.stringify(event.argument));
    }
}

class NativeSparkScanListenerProxy extends scanditDatacaptureFrameworksCore.BaseNativeProxy {
    static get cordovaExec() {
        return Cordova.exec;
    }
    resetSession() {
        return new Promise((resolve, reject) => {
            NativeSparkScanListenerProxy.cordovaExec(resolve, reject, CordovaFunction.ResetSparkScanSession, null);
        });
    }
    updateMode(sparkScanJson) {
        return new Promise((resolve, reject) => {
            NativeSparkScanListenerProxy.cordovaExec(resolve, reject, CordovaFunction.UpdateSparkScanMode, [sparkScanJson]);
        });
    }
    registerListenerForEvents() {
        NativeSparkScanListenerProxy.cordovaExec(this.notifyListeners.bind(this), null, CordovaFunction.RegisterSparkScanListenerForEvents, null);
    }
    unregisterListenerForEvents() {
        return new Promise((resolve, reject) => {
            NativeSparkScanListenerProxy.cordovaExec(resolve, reject, CordovaFunction.UnregisterSparkScanListenerForEvents, null);
        });
    }
    subscribeDidUpdateSessionListener() {
    }
    subscribeDidScanListener() {
    }
    finishDidUpdateSessionCallback(enabled) {
        return new Promise((resolve, reject) => {
            NativeSparkScanListenerProxy.cordovaExec(resolve, reject, CordovaFunction.FinishSparkScanDidUpdateSessionCallback, [{ 'enabled': enabled }]);
        });
    }
    finishDidScanCallback(enabled) {
        return new Promise((resolve, reject) => {
            NativeSparkScanListenerProxy.cordovaExec(resolve, reject, CordovaFunction.FinishSparkScanDidScanCallback, [{ 'enabled': enabled }]);
        });
    }
    setModeEnabledState(enabled) {
        return new Promise((resolve, reject) => {
            NativeSparkScanListenerProxy.cordovaExec(resolve, reject, CordovaFunction.SetSparkScanModeEnabledState, [enabled]);
        });
    }
    notifyListeners(event) {
        const done = () => {
            return {};
        };
        if (!event) {
            // The event could be undefined/null in case the plugin result did not pass a "message",
            // which could happen e.g. in case of "ok" results, which could signal e.g. successful
            // listener subscriptions.
            return done();
        }
        switch (event.name) {
            case barcode.SparkScanListenerEvents.didScan:
                this.eventEmitter.emit(barcode.SparkScanListenerEvents.didScan, JSON.stringify(event.argument));
                break;
            case barcode.SparkScanListenerEvents.didUpdateSession:
                this.eventEmitter.emit(barcode.SparkScanListenerEvents.didUpdateSession, JSON.stringify(event.argument));
                break;
        }
        return done();
    }
}

class NativeSparkScanViewProxy extends scanditDatacaptureFrameworksCore.BaseNativeProxy {
    static get cordovaExec() {
        return Cordova.exec;
    }
    updateSparkScanView(viewJson) {
        return new Promise((resolve, reject) => {
            NativeSparkScanViewProxy.cordovaExec(resolve, reject, CordovaFunction.UpdateSparkScanView, [viewJson]);
        });
    }
    createSparkScanView(viewJson) {
        return new Promise((resolve, reject) => {
            NativeSparkScanViewProxy.cordovaExec(resolve, reject, CordovaFunction.CreateSparkScanView, [viewJson]);
        });
    }
    prepareScanning() {
        return new Promise((resolve, reject) => {
            NativeSparkScanViewProxy.cordovaExec(resolve, reject, CordovaFunction.PrepareSparkScanViewScanning, null);
        });
    }
    disposeSparkScanView() {
        return new Promise((resolve, reject) => {
            NativeSparkScanViewProxy.cordovaExec(resolve, reject, CordovaFunction.DisposeSparkScanView, null);
        });
    }
    showSparkScanView() {
        return new Promise((resolve, reject) => {
            NativeSparkScanViewProxy.cordovaExec(resolve, reject, CordovaFunction.ShowSparkScanView, null);
        });
    }
    hideSparkScanView() {
        return new Promise((resolve, reject) => {
            NativeSparkScanViewProxy.cordovaExec(resolve, reject, CordovaFunction.HideSparkScanView, null);
        });
    }
    emitSparkScanViewFeedback(feedbackJson) {
        return new Promise((resolve, reject) => {
            NativeSparkScanViewProxy.cordovaExec(resolve, reject, CordovaFunction.EmitSparkScanViewFeedback, [feedbackJson]);
        });
    }
    registerSparkScanViewListenerEvents() {
        NativeSparkScanViewProxy.cordovaExec(this.notifyListeners.bind(this), null, CordovaFunction.RegisterSparkScanViewListenerEvents, null);
    }
    unregisterSparkScanViewListenerEvents() {
        return new Promise((resolve, reject) => {
            NativeSparkScanViewProxy.cordovaExec(resolve, reject, CordovaFunction.UnregisterSparkScanViewListenerEvents, null);
        });
    }
    stopSparkScanViewScanning() {
        return new Promise((resolve, reject) => {
            NativeSparkScanViewProxy.cordovaExec(resolve, reject, CordovaFunction.StopSparkScanViewScanning, null);
        });
    }
    startSparkScanViewScanning() {
        return new Promise((resolve, reject) => {
            NativeSparkScanViewProxy.cordovaExec(resolve, reject, CordovaFunction.StartSparkScanViewScanning, null);
        });
    }
    pauseSparkScanViewScanning() {
        return new Promise((resolve, reject) => {
            NativeSparkScanViewProxy.cordovaExec(resolve, reject, CordovaFunction.PauseSparkScanViewScanning, null);
        });
    }
    prepareSparkScanViewScanning() {
        return new Promise((resolve, reject) => {
            NativeSparkScanViewProxy.cordovaExec(resolve, reject, CordovaFunction.PrepareSparkScanViewScanning, null);
        });
    }
    notifyListeners(event) {
        const done = () => {
            return {};
        };
        if (!event) {
            // The event could be undefined/null in case the plugin result did not pass a "message",
            // which could happen e.g. in case of "ok" results, which could signal e.g. successful
            // listener subscriptions.
            return done();
        }
        event = Object.assign(Object.assign(Object.assign({}, event), event.argument), { argument: undefined });
        switch (event.name) {
            case barcode.SparkScanViewEvents.barcodeCountButtonTapped:
                this.eventEmitter.emit(barcode.SparkScanViewEvents.barcodeCountButtonTapped);
                break;
            case barcode.SparkScanViewEvents.fastFindButtonTapped:
                this.eventEmitter.emit(barcode.SparkScanViewEvents.fastFindButtonTapped);
                break;
        }
        return done();
    }
    registerDelegateForEvents() {
        NativeSparkScanViewProxy.cordovaExec(this.onFeedbackForBarcodeHandler.bind(this), null, CordovaFunction.AddSparkScanFeedbackDelegate, null);
        return Promise.resolve();
    }
    unregisterDelegateForEvents() {
        return new Promise((resolve, reject) => {
            NativeSparkScanViewProxy.cordovaExec(resolve, reject, CordovaFunction.RemoveSparkScanFeedbackDelegate, null);
        });
    }
    submitFeedbackForBarcode(feedbackJson) {
        return new Promise((resolve, reject) => {
            NativeSparkScanViewProxy.cordovaExec(resolve, reject, CordovaFunction.SubmitSparkScanFeedbackForBarcode, [feedbackJson]);
        });
    }
    showToast(text) {
        return new Promise((resolve, reject) => {
            NativeSparkScanViewProxy.cordovaExec(resolve, reject, CordovaFunction.ShowToast, [text]);
        });
    }
    onFeedbackForBarcodeHandler(event) {
        const done = () => {
            return {};
        };
        if (event.name !== barcode.SparkScanFeedbackDelegateEvents.feedbackForBarcode) {
            return done();
        }
        this.eventEmitter.emit(barcode.SparkScanFeedbackDelegateEvents.feedbackForBarcode, event.argument.barcode);
        return done();
    }
}

class NativeBarcodePickListenerProxy extends scanditDatacaptureFrameworksCore.BaseNativeProxy {
    static get cordovaExec() {
        return Cordova.exec;
    }
    subscribeBarcodePickListeners() {
        this.subscribeDidCompleteScanningSessionListener();
        this.subscribeDidUpdateScanningSessionListener();
        return new Promise((resolve, reject) => {
            NativeBarcodePickListenerProxy.cordovaExec(resolve, reject, CordovaFunction.AddScanningListener, null);
        });
    }
    unsubscribeBarcodePickListeners() {
        return new Promise((resolve, reject) => {
            NativeBarcodePickListenerProxy.cordovaExec(resolve, reject, CordovaFunction.RemoveScanningListener, null);
        });
    }
    subscribeDidCompleteScanningSessionListener() {
        return new Promise((_, reject) => {
            NativeBarcodePickListenerProxy.cordovaExec(this.didCompleteScanningSessionListenerHandler.bind(this), reject, CordovaFunction.SubscribeDidCompleteScanningSessionListener, null);
        });
    }
    subscribeDidUpdateScanningSessionListener() {
        return new Promise((_, reject) => {
            NativeBarcodePickListenerProxy.cordovaExec(this.didUpdateScanningSessionListenerHandler.bind(this), reject, CordovaFunction.SubscribeDidUpdateScanningSessionListener, null);
        });
    }
    didCompleteScanningSessionListenerHandler(event) {
        this.eventEmitter.emit(barcode.BarcodePickListenerEvents.DidCompleteScanningSession, JSON.stringify(event.argument));
    }
    didUpdateScanningSessionListenerHandler(event) {
        this.eventEmitter.emit(barcode.BarcodePickListenerEvents.DidUpdateScanningSession, JSON.stringify(event.argument));
    }
}

class NativeBarcodeFindListenerProxy extends scanditDatacaptureFrameworksCore.BaseNativeProxy {
    constructor() {
        super(...arguments);
        this.isModeEnabled = () => false;
    }
    static get cordovaExec() {
        return Cordova.exec;
    }
    setItemList(itemsJson) {
        return new Promise((resolve, reject) => {
            NativeBarcodeFindListenerProxy.cordovaExec(resolve, reject, CordovaFunction.BarcodeFindSetItemList, [itemsJson]);
        });
    }
    updateFindMode(barcodeFindJson) {
        return new Promise((resolve, reject) => {
            NativeBarcodeFindListenerProxy.cordovaExec(resolve, reject, CordovaFunction.UpdateFindMode, [barcodeFindJson]);
        });
    }
    barcodeFindModeStart() {
        return new Promise((resolve, reject) => {
            NativeBarcodeFindListenerProxy.cordovaExec(resolve, reject, CordovaFunction.BarcodeFindModeStart, [null]);
        });
    }
    barcodeFindModePause() {
        return new Promise((resolve, reject) => {
            NativeBarcodeFindListenerProxy.cordovaExec(resolve, reject, CordovaFunction.BarcodeFindModePause, [null]);
        });
    }
    barcodeFindModeStop() {
        return new Promise((resolve, reject) => {
            NativeBarcodeFindListenerProxy.cordovaExec(resolve, reject, CordovaFunction.BarcodeFindModeStop, [null]);
        });
    }
    setModeEnabledState(isEnabled) {
        new Promise((resolve, reject) => {
            NativeBarcodeFindListenerProxy.cordovaExec(resolve, reject, CordovaFunction.SetBarcodeFindModeEnabledState, [isEnabled]);
        });
    }
    setBarcodeTransformer() {
        return new Promise((resolve, reject) => {
            NativeBarcodeFindListenerProxy.cordovaExec(resolve, reject, CordovaFunction.setBarcodeFindTransformer, [null]);
        });
    }
    submitBarcodeFindTransformerResult(transformedBarcode) {
        return new Promise((resolve, reject) => {
            NativeBarcodeFindListenerProxy.cordovaExec(resolve, reject, CordovaFunction.SubmitBarcodeFindTransformerResult, [transformedBarcode]);
        });
    }
    subscribeBarcodeFindListener() {
        return new Promise((_resolve, reject) => {
            NativeBarcodeFindListenerProxy.cordovaExec(this.notifyListeners.bind(this), reject, CordovaFunction.RegisterBarcodeFindListener, null);
        });
    }
    unsubscribeBarcodeFindListener() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                NativeBarcodeFindListenerProxy.cordovaExec(resolve, reject, CordovaFunction.UnregisterBarcodeFindListener, null);
            });
        });
    }
    notifyListeners(event) {
        const done = () => {
            this.eventEmitter.emit(barcode.BarcodeFindListenerEvents.inCallback, false);
            return { enabled: this.isModeEnabled() };
        };
        this.eventEmitter.emit(barcode.BarcodeFindListenerEvents.inCallback, true);
        if (!event) {
            // The event could be undefined/null in case the plugin result did not pass a "message",
            // which could happen e.g. in case of "ok" results, which could signal e.g. successful
            // listener subscriptions.
            return done();
        }
        event = Object.assign(Object.assign(Object.assign({}, event), event.argument), { argument: undefined });
        switch (event.name) {
            case barcode.BarcodeFindListenerEvents.onSearchStartedEvent:
                this.eventEmitter.emit(barcode.BarcodeFindListenerEvents.onSearchStartedEvent, JSON.stringify(event));
                break;
            case barcode.BarcodeFindListenerEvents.onSearchPausedEvent:
                this.eventEmitter.emit(barcode.BarcodeFindListenerEvents.onSearchPausedEvent, JSON.stringify(event));
                break;
            case barcode.BarcodeFindListenerEvents.onSearchStoppedEvent:
                this.eventEmitter.emit(barcode.BarcodeFindListenerEvents.onSearchStoppedEvent, JSON.stringify(event));
                break;
            case barcode.BarcodeFindListenerEvents.onTransformBarcodeData:
                this.eventEmitter.emit(barcode.BarcodeFindListenerEvents.onTransformBarcodeData, JSON.stringify(event));
                break;
        }
    }
}

class NativeBarcodeFindViewProxy extends scanditDatacaptureFrameworksCore.BaseNativeProxy {
    static get cordovaExec() {
        return Cordova.exec;
    }
    showView() {
        return new Promise((resolve, reject) => {
            NativeBarcodeFindViewProxy.cordovaExec(resolve, reject, CordovaFunction.ShowFindView, [null]);
        });
    }
    hideView() {
        return new Promise((resolve, reject) => {
            NativeBarcodeFindViewProxy.cordovaExec(resolve, reject, CordovaFunction.HideFindView, [null]);
        });
    }
    onPause() {
        return new Promise((resolve, reject) => {
            NativeBarcodeFindViewProxy.cordovaExec(resolve, reject, CordovaFunction.BarcodeFindModePause, [null]);
        });
    }
    onResume() {
        return new Promise((resolve, reject) => {
            NativeBarcodeFindViewProxy.cordovaExec(resolve, reject, CordovaFunction.BarcodeFindViewOnResume, [null]);
        });
    }
    startSearching() {
        return new Promise((resolve, reject) => {
            NativeBarcodeFindViewProxy.cordovaExec(resolve, reject, CordovaFunction.BarcodeFindViewStartSearching, [null]);
        });
    }
    stopSearching() {
        return new Promise((resolve, reject) => {
            NativeBarcodeFindViewProxy.cordovaExec(resolve, reject, CordovaFunction.BarcodeFindViewStopSearching, [null]);
        });
    }
    pauseSearching() {
        return new Promise((resolve, reject) => {
            NativeBarcodeFindViewProxy.cordovaExec(resolve, reject, CordovaFunction.BarcodeFindViewPauseSearching, [null]);
        });
    }
    findNodeHandle(_view) {
        // This is used on RN only to retrieve the view id
        return null;
    }
    createView(_id, barcodeFindViewJson) {
        return new Promise((resolve, reject) => {
            NativeBarcodeFindViewProxy.cordovaExec(resolve, reject, CordovaFunction.CreateFindView, [barcodeFindViewJson]);
        });
    }
    updateView(barcodeFindViewJson) {
        return new Promise((resolve, reject) => {
            NativeBarcodeFindViewProxy.cordovaExec(resolve, reject, CordovaFunction.UpdateFindView, [barcodeFindViewJson]);
        });
    }
    subscribeBarcodeFindViewListener() {
        return new Promise((_resolve, reject) => {
            NativeBarcodeFindViewProxy.cordovaExec(this.notifyListeners.bind(this), reject, CordovaFunction.RegisterBarcodeFindViewListener, null);
        });
    }
    unsubscribeBarcodeFindViewListener() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                NativeBarcodeFindViewProxy.cordovaExec(resolve, reject, CordovaFunction.UnregisterBarcodeFindViewListener, null);
            });
        });
    }
    notifyListeners(event) {
        const done = () => {
            return {};
        };
        if (!event) {
            // The event could be undefined/null in case the plugin result did not pass a "message",
            // which could happen e.g. in case of "ok" results, which could signal e.g. successful
            // listener subscriptions.
            return done();
        }
        event = Object.assign(Object.assign(Object.assign({}, event), event.argument), { argument: undefined });
        switch (event.name) {
            case barcode.BarcodeFindViewEvents.onFinishButtonTappedEventName:
                this.eventEmitter.emit(barcode.BarcodeFindViewEvents.onFinishButtonTappedEventName, JSON.stringify(event));
                break;
        }
    }
}

class NativeBarcodeCountListenerProxy extends scanditDatacaptureFrameworksCore.BaseNativeProxy {
    static get cordovaExec() {
        return Cordova.exec;
    }
    updateMode(barcodeCountJson) {
        return new Promise((resolve, reject) => {
            NativeBarcodeCountListenerProxy.cordovaExec(resolve, reject, CordovaFunction.BarcodeCountUpdateMode, [barcodeCountJson]);
        });
    }
    resetBarcodeCount() {
        return new Promise((resolve, reject) => {
            NativeBarcodeCountListenerProxy.cordovaExec(resolve, reject, CordovaFunction.ResetBarcodeCount, null);
        });
    }
    registerBarcodeCountListener() {
        return new Promise((_, reject) => {
            NativeBarcodeCountListenerProxy.cordovaExec(this.notifyListeners.bind(this), reject, CordovaFunction.RegisterBarcodeCountListener, null);
        });
    }
    setModeEnabledState(enabled) {
        NativeBarcodeCountListenerProxy.cordovaExec(null, null, CordovaFunction.SetBarcodeCountModeEnabledState, [enabled]);
    }
    unregisterBarcodeCountListener() {
        return new Promise((resolve, reject) => {
            NativeBarcodeCountListenerProxy.cordovaExec(resolve, reject, CordovaFunction.UnregisterBarcodeCountListener, null);
        });
    }
    subscribeDidScan() {
        return __awaiter(this, void 0, void 0, function* () {
            // Nothing to do here
        });
    }
    subscribeDidListSessionUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            // Nothing to do here
        });
    }
    finishOnScan() {
        NativeBarcodeCountListenerProxy.cordovaExec(null, null, CordovaFunction.FinishBarcodeCountListenerOnScan, null);
    }
    startScanningPhase() {
        NativeBarcodeCountListenerProxy.cordovaExec(null, null, CordovaFunction.StartScanningPhase, null);
    }
    endScanningPhase() {
        NativeBarcodeCountListenerProxy.cordovaExec(null, null, CordovaFunction.EndScanningPhase, null);
    }
    setBarcodeCountCaptureList(captureListStr) {
        NativeBarcodeCountListenerProxy.cordovaExec(null, null, CordovaFunction.SetBarcodeCountCaptureList, [captureListStr]);
    }
    notifyListeners(event) {
        const done = () => {
            this.emitInCallback(false);
            return { enabled: this.isModeEnabled() };
        };
        this.emitInCallback(true);
        if (!event) {
            // The event could be undefined/null in case the plugin result did not pass a "message",
            // which could happen e.g. in case of "ok" results, which could signal e.g. successful
            // listener subscriptions.
            return done();
        }
        switch (event.name) {
            case barcode.BarcodeCountListenerEvents.didScan:
                this.eventEmitter.emit(barcode.BarcodeCountListenerEvents.didScan, JSON.stringify(event.argument));
                break;
            case barcode.BarcodeCountListenerEvents.didListSessionUpdate:
                this.eventEmitter.emit(barcode.BarcodeCountListenerEvents.didListSessionUpdate, JSON.stringify(event.argument));
                break;
        }
        return done();
    }
    emitInCallback(enabled) {
        this.eventEmitter.emit(barcode.BarcodeCountListenerEvents.inCallback, enabled);
    }
}

class NativeBarcodeCountSessionProxy {
    static get cordovaExec() {
        return Cordova.exec;
    }
    getSpatialMap() {
        return new Promise((resolve, reject) => {
            NativeBarcodeCountSessionProxy.cordovaExec((result) => resolve(result.data), reject, CordovaFunction.GetSpatialMap, null);
        });
    }
    getSpatialMapWithHints(expectedNumberOfRows, expectedNumberOfColumns) {
        return new Promise((resolve, reject) => {
            NativeBarcodeCountSessionProxy.cordovaExec((result) => resolve(result.data), reject, CordovaFunction.GetSpatialMapWithHints, [{ expectedNumberOfRows: expectedNumberOfRows, expectedNumberOfColumns: expectedNumberOfColumns }]);
        });
    }
    resetSession() {
        return new Promise((resolve, reject) => {
            NativeBarcodeCountSessionProxy.cordovaExec(resolve, reject, CordovaFunction.ResetBarcodeCountSession, null);
        });
    }
}

function initBarcodeProxies() {
    scanditDatacaptureFrameworksCore.FactoryMaker.bindLazyInstance('BarcodeCaptureListenerProxy', () => new NativeBarcodeCaptureListenerProxy());
    scanditDatacaptureFrameworksCore.FactoryMaker.bindLazyInstance('BarcodeSelectionListenerProxy', () => new NativeBarcodeSelectionListenerProxy());
    scanditDatacaptureFrameworksCore.FactoryMaker.bindLazyInstance('BarcodeSelectionProxy', () => new NativeBarcodeSelectionProxy());
    scanditDatacaptureFrameworksCore.FactoryMaker.bindLazyInstance('BarcodeSelectionOverlayProxy', () => new NativeBarcodeSelectionOverlayProxy());
    scanditDatacaptureFrameworksCore.FactoryMaker.bindLazyInstance('BarcodeTrackingListenerProxy', () => new NativeBarcodeTrackingListenerProxy());
    scanditDatacaptureFrameworksCore.FactoryMaker.bindLazyInstance('BarcodeTrackingBasicOverlayProxy', () => new NativeBarcodeTrackingBasicOverlayProxy());
    scanditDatacaptureFrameworksCore.FactoryMaker.bindLazyInstance('BarcodeTrackingAdvancedOverlayProxy', () => new NativeBarcodeTrackingAdvancedOverlayProxy());
    scanditDatacaptureFrameworksCore.FactoryMaker.bindLazyInstance('BarcodePickProductProxy', () => new NativeBarcodePickProductProxy());
    scanditDatacaptureFrameworksCore.FactoryMaker.bindLazyInstance('BarcodePickViewProxy', () => new NativeBarcodePickViewProxy());
    scanditDatacaptureFrameworksCore.FactoryMaker.bindLazyInstance('SparkScanListenerProxy', () => new NativeSparkScanListenerProxy());
    scanditDatacaptureFrameworksCore.FactoryMaker.bindLazyInstance('SparkScanViewProxy', () => new NativeSparkScanViewProxy());
    scanditDatacaptureFrameworksCore.FactoryMaker.bindLazyInstance('BarcodePickListenerProxy', () => new NativeBarcodePickListenerProxy());
    scanditDatacaptureFrameworksCore.FactoryMaker.bindLazyInstance('BarcodeFindProxy', () => new NativeBarcodeFindListenerProxy());
    scanditDatacaptureFrameworksCore.FactoryMaker.bindLazyInstance('BarcodeFindViewProxy', () => new NativeBarcodeFindViewProxy());
    scanditDatacaptureFrameworksCore.FactoryMaker.bindLazyInstance('BarcodeCountListenerProxy', () => new NativeBarcodeCountListenerProxy());
    scanditDatacaptureFrameworksCore.FactoryMaker.bindLazyInstance('BarcodeCountSessionProxy', () => new NativeBarcodeCountSessionProxy());
}

// tslint:disable-next-line:variable-name
const Cordova = {
    pluginName: 'ScanditBarcodeCapture',
    defaults: {},
    exec: (success, error, functionName, args) => scanditCordovaDatacaptureCore.cordovaExec(success, error, Cordova.pluginName, functionName, args),
};
function getDefaults() {
    return new Promise((resolve, reject) => {
        Cordova.exec((defaultsJSON) => {
            barcode.loadBarcodeDefaults(defaultsJSON);
            barcode.loadBarcodeCaptureDefaults(defaultsJSON.BarcodeCapture);
            barcode.loadBarcodeSelectionDefaults(defaultsJSON.BarcodeSelection);
            barcode.loadBarcodeTrackingDefaults(defaultsJSON.BarcodeTracking);
            barcode.loadBarcodePickDefaults(defaultsJSON.BarcodePick);
            barcode.loadSparkScanDefaults(defaultsJSON.SparkScan);
            barcode.loadBarcodeFindDefaults(defaultsJSON.BarcodeFind);
            barcode.loadBarcodeCountDefaults(defaultsJSON.BarcodeCount);
            initBarcodeProxies();
            resolve();
        }, reject, 'getDefaults', null);
    });
}
function initializeBarcodeCordova() {
    scanditCordovaDatacaptureCore.initializePlugin(Cordova.pluginName, getDefaults);
}
var CordovaFunction;
(function (CordovaFunction) {
    CordovaFunction["SubscribeBarcodeCaptureListener"] = "subscribeBarcodeCaptureListener";
    CordovaFunction["UnsubscribeBarcodeCaptureListener"] = "unsubscribeBarcodeCaptureListener";
    CordovaFunction["FinishBarcodeCaptureDidScan"] = "finishBarcodeCaptureDidScan";
    CordovaFunction["FinishBarcodeCaptureDidUpdateSession"] = "finishBarcodeCaptureDidUpdateSession";
    CordovaFunction["SetBarcodeCaptureModeEnabledState"] = "setBarcodeCaptureModeEnabledState";
    CordovaFunction["SetBarcodeSelectionModeEnabledState"] = "setBarcodeSelectionModeEnabledState";
    CordovaFunction["SubscribeBarcodeSelectionListener"] = "subscribeBarcodeSelectionListener";
    CordovaFunction["UnsubscribeBarcodeSelectionListener"] = "unsubscribeBarcodeSelectionListener";
    CordovaFunction["GetCountForBarcodeInBarcodeSelectionSession"] = "getCountForBarcodeInBarcodeSelectionSession";
    CordovaFunction["ResetBarcodeCaptureSession"] = "resetBarcodeCaptureSession";
    CordovaFunction["ResetBarcodeSelectionSession"] = "resetBarcodeSelectionSession";
    CordovaFunction["ResetBarcodeSelection"] = "resetBarcodeSelection";
    CordovaFunction["UnfreezeCameraInBarcodeSelection"] = "unfreezeCameraInBarcodeSelection";
    CordovaFunction["SelectAimedBarcode"] = "selectAimedBarcode";
    CordovaFunction["IncreaseCountForBarcodes"] = "increaseCountForBarcodes";
    CordovaFunction["UnselectBarcodes"] = "unselectBarcodes";
    CordovaFunction["SetSelectBarcodeEnabled"] = "setSelectBarcodeEnabled";
    CordovaFunction["FinishBarcodeSelectionDidUpdateSelection"] = "finishBarcodeSelectionDidUpdateSelection";
    CordovaFunction["FinishBarcodeSelectionDidUpdateSession"] = "finishBarcodeSelectionDidUpdateSession";
    CordovaFunction["UpdateBarcodeSelectionBasicOverlay"] = "updateBarcodeSelectionBasicOverlay";
    CordovaFunction["UpdateBarcodeSelectionMode"] = "updateBarcodeSelectionMode";
    CordovaFunction["ApplyBarcodeSelectionModeSettings"] = "applyBarcodeSelectionModeSettings";
    CordovaFunction["UpdateBarcodeCaptureOverlay"] = "updateBarcodeCaptureOverlay";
    CordovaFunction["UpdateBarcodeCaptureMode"] = "updateBarcodeCaptureMode";
    CordovaFunction["ApplyBarcodeCaptureModeSettings"] = "applyBarcodeCaptureModeSettings";
    CordovaFunction["SetTextForAimToSelectAutoHint"] = "setTextForAimToSelectAutoHint";
    CordovaFunction["RemoveAimedBarcodeBrushProvider"] = "removeAimedBarcodeBrushProvider";
    CordovaFunction["SetAimedBarcodeBrushProvider"] = "setAimedBarcodeBrushProvider";
    CordovaFunction["FinishBrushForAimedBarcodeCallback"] = "finishBrushForAimedBarcodeCallback";
    CordovaFunction["RemoveTrackedBarcodeBrushProvider"] = "removeTrackedBarcodeBrushProvider";
    CordovaFunction["SetTrackedBarcodeBrushProvider"] = "setTrackedBarcodeBrushProvider";
    CordovaFunction["FinishBrushForTrackedBarcodeCallback"] = "finishBrushForTrackedBarcodeCallback";
    CordovaFunction["SetViewForTrackedBarcode"] = "setViewForTrackedBarcode";
    CordovaFunction["SetAnchorForTrackedBarcode"] = "setAnchorForTrackedBarcode";
    CordovaFunction["SetOffsetForTrackedBarcode"] = "setOffsetForTrackedBarcode";
    CordovaFunction["ClearTrackedBarcodeViews"] = "clearTrackedBarcodeViews";
    CordovaFunction["SetBrushForTrackedBarcode"] = "setBrushForTrackedBarcode";
    CordovaFunction["ClearTrackedBarcodeBrushes"] = "clearTrackedBarcodeBrushes";
    CordovaFunction["SetBarcodeTrackingModeEnabledState"] = "setBarcodeTrackingModeEnabledState";
    CordovaFunction["SubscribeBarcodeTrackingListener"] = "subscribeBarcodeTrackingListener";
    CordovaFunction["UnregisterBarcodeTrackingListener"] = "unregisterBarcodeTrackingListener";
    CordovaFunction["SubscribeBarcodeTrackingAdvancedOverlayListener"] = "subscribeBarcodeTrackingAdvancedOverlayListener";
    CordovaFunction["SubscribeBarcodeTrackingBasicOverlayListener"] = "subscribeBarcodeTrackingBasicOverlayListener";
    CordovaFunction["ResetBarcodeTrackingSession"] = "resetBarcodeTrackingSession";
    CordovaFunction["UpdateBarcodeTrackingAdvancedOverlay"] = "updateBarcodeTrackingAdvancedOverlay";
    CordovaFunction["UpdateBarcodeTrackingBasicOverlay"] = "updateBarcodeTrackingBasicOverlay";
    CordovaFunction["UpdateBarcodeTrackingMode"] = "updateBarcodeTrackingMode";
    CordovaFunction["ApplyBarcodeTrackingModeSettings"] = "applyBarcodeTrackingModeSettings";
    CordovaFunction["FinishBarcodeTrackingDidUpdateSession"] = "finishBarcodeTrackingDidUpdateSession";
    CordovaFunction["FinishBarcodeTrackingBrushForTrackedBarcode"] = "finishBarcodeTrackingBrushForTrackedBarcode";
    CordovaFunction["UnregisterBarcodeTrackingAdvancedOverlayListener"] = "unregisterBarcodeTrackingAdvancedOverlayListener";
    CordovaFunction["UnregisterBarcodeTrackingBasicOverlayListener"] = "unregisterBarcodeTrackingBasicOverlayListener";
    CordovaFunction["CreatePickView"] = "createPickView";
    CordovaFunction["PickViewStart"] = "viewStart";
    CordovaFunction["PickViewStop"] = "viewStop";
    CordovaFunction["PickViewFreeze"] = "viewFreeze";
    CordovaFunction["SetPositionAndSize"] = "setPickViewPositionAndSize";
    CordovaFunction["UpdatePickView"] = "updatePickView";
    CordovaFunction["SubscribeDidPickItemListener"] = "subscribeDidPickItemListener";
    CordovaFunction["SubscribeDidUnpickItemListener"] = "subscribeDidUnpickItemListener";
    CordovaFunction["AddActionListener"] = "addActionListener";
    CordovaFunction["AddViewListener"] = "addViewListener";
    CordovaFunction["RegisterBarcodePickViewUiListener"] = "registerBarcodePickViewUiListener";
    CordovaFunction["SubscribeBarcodePickViewUiListener"] = "subscribeBarcodePickViewUiListener";
    CordovaFunction["UnsubscribeBarcodePickViewUiListener"] = "unsubscribeBarcodePickViewUiListener";
    CordovaFunction["SubscribeDidStartScanningListener"] = "subscribeDidStartScanningListener";
    CordovaFunction["SubscribeDidFreezeScanningListener"] = "subscribeDidFreezeScanningListener";
    CordovaFunction["SubscribeDidPauseScanningListener"] = "subscribeDidPauseScanningListener";
    CordovaFunction["SubscribeDidStopScanningListener"] = "subscribeDidStopScanningListener";
    CordovaFunction["FinishPickAction"] = "finishPickAction";
    CordovaFunction["UnsubscribeListeners"] = "unsubscribeListeners";
    CordovaFunction["AddScanningListener"] = "addScanningListener";
    CordovaFunction["RemoveScanningListener"] = "removeScanningListener";
    CordovaFunction["SubscribeDidCompleteScanningSessionListener"] = "subscribeDidCompleteScanningSessionListener";
    CordovaFunction["SubscribeDidUpdateScanningSessionListener"] = "subscribeDidUpdateScanningSessionListener";
    CordovaFunction["SubscribeProductIdentifierForItemsListener"] = "subscribeProductIdentifierForItemsListener";
    CordovaFunction["UnsubscribeProductIdentifierForItemsListener"] = "unsubscribeProductIdentifierForItemsListener";
    CordovaFunction["FinishOnProductIdentifierForItems"] = "finishOnProductIdentifierForItems";
    CordovaFunction["UnregisterSparkScanViewListenerEvents"] = "unregisterSparkScanViewListenerEvents";
    CordovaFunction["RegisterSparkScanViewListenerEvents"] = "registerSparkScanViewListenerEvents";
    CordovaFunction["PrepareSparkScanViewScanning"] = "prepareSparkScanViewScanning";
    CordovaFunction["StartSparkScanViewScanning"] = "startSparkScanViewScanning";
    CordovaFunction["PauseSparkScanViewScanning"] = "pauseSparkScanViewScanning";
    CordovaFunction["StopSparkScanViewScanning"] = "stopSparkScanViewScanning";
    CordovaFunction["EmitSparkScanViewFeedback"] = "emitSparkScanViewFeedback";
    CordovaFunction["FinishSparkScanDidUpdateSessionCallback"] = "finishSparkScanDidUpdateSessionCallback";
    CordovaFunction["FinishSparkScanDidScanCallback"] = "finishSparkScanDidScanCallback";
    CordovaFunction["RegisterSparkScanListenerForEvents"] = "registerSparkScanListenerForEvents";
    CordovaFunction["UnregisterSparkScanListenerForEvents"] = "unregisterSparkScanListenerForEvents";
    CordovaFunction["SetSparkScanModeEnabledState"] = "setSparkScanModeEnabledState";
    CordovaFunction["ResetSparkScanSession"] = "resetSparkScanSession";
    CordovaFunction["CreateSparkScanView"] = "createSparkScanView";
    CordovaFunction["DisposeSparkScanView"] = "disposeSparkScanView";
    CordovaFunction["UpdateSparkScanView"] = "updateSparkScanView";
    CordovaFunction["UpdateSparkScanMode"] = "updateSparkScanMode";
    CordovaFunction["ShowSparkScanView"] = "showSparkScanView";
    CordovaFunction["HideSparkScanView"] = "hideSparkScanView";
    CordovaFunction["AddSparkScanFeedbackDelegate"] = "addSparkScanFeedbackDelegate";
    CordovaFunction["RemoveSparkScanFeedbackDelegate"] = "removeSparkScanFeedbackDelegate";
    CordovaFunction["SubmitSparkScanFeedbackForBarcode"] = "submitSparkScanFeedbackForBarcode";
    CordovaFunction["ShowToast"] = "showToast";
    CordovaFunction["BarcodeFindSetItemList"] = "barcodeFindSetItemList";
    CordovaFunction["UpdateFindMode"] = "updateFindMode";
    CordovaFunction["BarcodeFindModeStart"] = "barcodeFindModeStart";
    CordovaFunction["BarcodeFindModePause"] = "barcodeFindModePause";
    CordovaFunction["BarcodeFindModeStop"] = "barcodeFindModeStop";
    CordovaFunction["SetBarcodeFindModeEnabledState"] = "setBarcodeFindModeEnabledState";
    CordovaFunction["setBarcodeFindTransformer"] = "setBarcodeFindTransformer";
    CordovaFunction["SubmitBarcodeFindTransformerResult"] = "submitBarcodeFindTransformerResult";
    CordovaFunction["RegisterBarcodeFindListener"] = "registerBarcodeFindListener";
    CordovaFunction["UnregisterBarcodeFindListener"] = "unregisterBarcodeFindListener";
    CordovaFunction["ShowFindView"] = "showFindView";
    CordovaFunction["HideFindView"] = "hideFindView";
    CordovaFunction["BarcodeFindViewOnResume"] = "barcodeFindViewOnResume";
    CordovaFunction["BarcodeFindViewStartSearching"] = "barcodeFindViewStartSearching";
    CordovaFunction["BarcodeFindViewPauseSearching"] = "barcodeFindViewPauseSearching";
    CordovaFunction["BarcodeFindViewStopSearching"] = "barcodeFindViewStopSearching";
    CordovaFunction["CreateFindView"] = "createFindView";
    CordovaFunction["UpdateFindView"] = "updateFindView";
    CordovaFunction["RegisterBarcodeFindViewListener"] = "registerBarcodeFindViewListener";
    CordovaFunction["UnregisterBarcodeFindViewListener"] = "unregisterBarcodeFindViewListener";
    CordovaFunction["BarcodeCountUpdateMode"] = "updateMode";
    CordovaFunction["ResetBarcodeCount"] = "resetBarcodeCount";
    CordovaFunction["RegisterBarcodeCountListener"] = "registerBarcodeCountListener";
    CordovaFunction["SetBarcodeCountModeEnabledState"] = "setBarcodeCountModeEnabledState";
    CordovaFunction["UnregisterBarcodeCountListener"] = "unregisterBarcodeCountListener";
    CordovaFunction["FinishBarcodeCountListenerOnScan"] = "finishBarcodeCountListenerOnScan";
    CordovaFunction["StartScanningPhase"] = "startScanningPhase";
    CordovaFunction["EndScanningPhase"] = "endScanningPhase";
    CordovaFunction["SetBarcodeCountCaptureList"] = "setBarcodeCountCaptureList";
    CordovaFunction["GetSpatialMap"] = "getSpatialMap";
    CordovaFunction["GetSpatialMapWithHints"] = "getSpatialMapWithHints";
    CordovaFunction["ResetBarcodeCountSession"] = "resetBarcodeCountSession";
    CordovaFunction["UpdateBarcodeCountView"] = "updateBarcodeCountView";
    CordovaFunction["CreateBarcodeCountView"] = "createBarcodeCountView";
    CordovaFunction["RegisterBarcodeCountViewUiListener"] = "registerBarcodeCountViewUiListener";
    CordovaFunction["UnregisterBarcodeCountViewUiListener"] = "unregisterBarcodeCountViewUiListener";
    CordovaFunction["RegisterBarcodeCountViewListener"] = "registerBarcodeCountViewListener";
    CordovaFunction["UnregisterBarcodeCountViewListener"] = "unregisterBarcodeCountViewListener";
    CordovaFunction["ClearBarcodeCountViewHighlights"] = "clearBarcodeCountViewHighlights";
    CordovaFunction["SetBarcodeCountViewPositionAndSize"] = "setBarcodeCountViewPositionAndSize";
    CordovaFunction["ShowBarcodeCountView"] = "showBarcodeCountView";
    CordovaFunction["HideBarcodeCountView"] = "hideBarcodeCountView";
    CordovaFunction["FinishBarcodeCountViewListenerBrushForRecognizedBarcode"] = "finishBarcodeCountViewListenerBrushForRecognizedBarcode";
    CordovaFunction["FinishBarcodeCountViewListenerBrushForRecognizedBarcodeNotInList"] = "finishBarcodeCountViewListenerBrushForRecognizedBarcodeNotInList";
    CordovaFunction["FinishBarcodeCountViewListenerOnBrushForUnrecognizedBarcode"] = "finishBarcodeCountViewListenerOnBrushForUnrecognizedBarcode";
})(CordovaFunction || (CordovaFunction = {}));

class BarcodeFindView {
    static forMode(dataCaptureContext, barcodeFind) {
        return new BarcodeFindView(dataCaptureContext, barcodeFind);
    }
    static forModeWithViewSettings(dataCaptureContext, barcodeFind, viewSettings) {
        return new BarcodeFindView(dataCaptureContext, barcodeFind, viewSettings);
    }
    static forModeWithViewSettingsAndCameraSettings(dataCaptureContext, barcodeFind, viewSettings, cameraSettings) {
        return new BarcodeFindView(dataCaptureContext, barcodeFind, viewSettings, cameraSettings);
    }
    constructor(dataCaptureContext, barcodeFind, barcodeFindViewSettings, cameraSettings) {
        this.htmlElement = null;
        this.htmlElementState = new scanditCordovaDatacaptureCore.HTMLElementState();
        this.domObserver = new MutationObserver(this.elementDidChange.bind(this));
        this.scrollListener = this.elementDidChange.bind(this);
        this.orientationChangeListener = (() => {
            this.elementDidChange();
            // SDC-1784 -> workaround because at the moment of this callback the element doesn't have the updated size.
            setTimeout(this.elementDidChange.bind(this), 100);
            setTimeout(this.elementDidChange.bind(this), 300);
            setTimeout(this.elementDidChange.bind(this), 1000);
        });
        this.baseBarcodeFindView = new barcode.BaseBarcodeFindView(dataCaptureContext, barcodeFind, barcodeFindViewSettings, cameraSettings);
        this.baseBarcodeFindView.initialize(this);
    }
    get barcodeFindViewUiListener() {
        return this.baseBarcodeFindView.barcodeFindViewUiListener;
    }
    set barcodeFindViewUiListener(value) {
        this.baseBarcodeFindView.barcodeFindViewUiListener = value;
    }
    get shouldShowUserGuidanceView() {
        return this.baseBarcodeFindView.shouldShowUserGuidanceView;
    }
    set shouldShowUserGuidanceView(value) {
        this.baseBarcodeFindView.shouldShowUserGuidanceView = value;
    }
    get shouldShowHints() {
        return this.baseBarcodeFindView.shouldShowHints;
    }
    set shouldShowHints(value) {
        this.baseBarcodeFindView.shouldShowHints = value;
    }
    get shouldShowCarousel() {
        return this.baseBarcodeFindView.shouldShowCarousel;
    }
    set shouldShowCarousel(value) {
        this.baseBarcodeFindView.shouldShowCarousel = value;
    }
    get shouldShowPauseButton() {
        return this.baseBarcodeFindView.shouldShowPauseButton;
    }
    set shouldShowPauseButton(value) {
        this.baseBarcodeFindView.shouldShowPauseButton = value;
    }
    get shouldShowFinishButton() {
        return this.baseBarcodeFindView.shouldShowFinishButton;
    }
    set shouldShowFinishButton(value) {
        this.baseBarcodeFindView.shouldShowFinishButton = value;
    }
    get shouldShowProgressBar() {
        return this.baseBarcodeFindView.shouldShowProgressBar;
    }
    set shouldShowProgressBar(value) {
        this.baseBarcodeFindView.shouldShowProgressBar = value;
    }
    get shouldShowTorchControl() {
        return this.baseBarcodeFindView.shouldShowTorchControl;
    }
    set shouldShowTorchControl(value) {
        this.baseBarcodeFindView.shouldShowTorchControl = value;
    }
    get torchControlPosition() {
        return this.baseBarcodeFindView.torchControlPosition;
    }
    set torchControlPosition(value) {
        this.baseBarcodeFindView.torchControlPosition = value;
    }
    get textForCollapseCardsButton() {
        return this.baseBarcodeFindView.textForCollapseCardsButton;
    }
    set textForCollapseCardsButton(value) {
        this.baseBarcodeFindView.textForCollapseCardsButton = value;
    }
    get textForAllItemsFoundSuccessfullyHint() {
        return this.baseBarcodeFindView.textForAllItemsFoundSuccessfullyHint;
    }
    set textForAllItemsFoundSuccessfullyHint(value) {
        this.baseBarcodeFindView.textForAllItemsFoundSuccessfullyHint = value;
    }
    get textForItemListUpdatedHint() {
        return this.baseBarcodeFindView.textForItemListUpdatedHint;
    }
    set textForItemListUpdatedHint(value) {
        this.baseBarcodeFindView.textForItemListUpdatedHint = value;
    }
    get textForItemListUpdatedWhenPausedHint() {
        return this.baseBarcodeFindView.textForItemListUpdatedWhenPausedHint;
    }
    set textForItemListUpdatedWhenPausedHint(value) {
        this.baseBarcodeFindView.textForItemListUpdatedWhenPausedHint = value;
    }
    get textForPointAtBarcodesToSearchHint() {
        return this.baseBarcodeFindView.textForPointAtBarcodesToSearchHint;
    }
    set textForPointAtBarcodesToSearchHint(value) {
        this.baseBarcodeFindView.textForPointAtBarcodesToSearchHint = value;
    }
    get textForMoveCloserToBarcodesHint() {
        return this.baseBarcodeFindView.textForMoveCloserToBarcodesHint;
    }
    set textForMoveCloserToBarcodesHint(value) {
        this.baseBarcodeFindView.textForMoveCloserToBarcodesHint = value;
    }
    get textForTapShutterToPauseScreenHint() {
        return this.baseBarcodeFindView.textForTapShutterToPauseScreenHint;
    }
    set textForTapShutterToPauseScreenHint(value) {
        this.baseBarcodeFindView.textForTapShutterToPauseScreenHint = value;
    }
    get textForTapShutterToResumeSearchHint() {
        return this.baseBarcodeFindView.textForTapShutterToResumeSearchHint;
    }
    set textForTapShutterToResumeSearchHint(value) {
        this.baseBarcodeFindView.textForTapShutterToResumeSearchHint = value;
    }
    stopSearching() {
        return this.baseBarcodeFindView.stopSearching();
    }
    startSearching() {
        return this.baseBarcodeFindView.startSearching();
    }
    pauseSearching() {
        return this.baseBarcodeFindView.pauseSearching();
    }
    connectToElement(element) {
        this.htmlElement = element;
        this.htmlElementState = new scanditCordovaDatacaptureCore.HTMLElementState();
        // Initial update
        this.elementDidChange();
        this.subscribeToChangesOnHTMLElement();
    }
    detachFromElement() {
        this.unsubscribeFromChangesOnHTMLElement();
        this.htmlElement = null;
        this.elementDidChange();
    }
    show() {
        if (this.htmlElement) {
            throw new Error("Views should only be manually shown if they're manually sized using setFrame");
        }
        return this._show();
    }
    hide() {
        if (this.htmlElement) {
            throw new Error("Views should only be manually hidden if they're manually sized using setFrame");
        }
        return this._hide();
    }
    subscribeToChangesOnHTMLElement() {
        this.domObserver.observe(document, { attributes: true, childList: true, subtree: true });
        window.addEventListener('scroll', this.scrollListener);
        window.addEventListener('orientationchange', this.orientationChangeListener);
    }
    unsubscribeFromChangesOnHTMLElement() {
        this.domObserver.disconnect();
        window.removeEventListener('scroll', this.scrollListener);
        window.removeEventListener('orientationchange', this.orientationChangeListener);
    }
    elementDidChange() {
        if (!this.htmlElement) {
            this.htmlElementState = new scanditCordovaDatacaptureCore.HTMLElementState();
            return;
        }
        const newState = new scanditCordovaDatacaptureCore.HTMLElementState();
        const boundingRect = this.htmlElement.getBoundingClientRect();
        newState.position = { top: boundingRect.top, left: boundingRect.left };
        newState.size = { width: boundingRect.width, height: boundingRect.height };
        newState.shouldBeUnderContent = parseInt(this.htmlElement.style.zIndex || '1', 10) < 0
            || parseInt(getComputedStyle(this.htmlElement).zIndex || '1', 10) < 0;
        const isDisplayed = getComputedStyle(this.htmlElement).display !== 'none'
            && this.htmlElement.style.display !== 'none';
        const isInDOM = document.body.contains(this.htmlElement);
        newState.isShown = isDisplayed && isInDOM && !this.htmlElement.hidden;
        this.htmlElementState = newState;
    }
    _show() {
        return this.baseBarcodeFindView.show();
    }
    _hide() {
        return this.baseBarcodeFindView.hide();
    }
    toJSON() {
        return this.baseBarcodeFindView.toJSON();
    }
}

class BarcodePickView extends scanditDatacaptureFrameworksCore.DefaultSerializeable {
    constructor(props) {
        super();
        this.htmlElement = null;
        this._htmlElementState = new scanditCordovaDatacaptureCore.HTMLElementState();
        this.domObserver = new MutationObserver(this.elementDidChange.bind(this));
        this.scrollListener = this.elementDidChange.bind(this);
        this.orientationChangeListener = (() => {
            this.elementDidChange();
            // SDC-1784 -> workaround because at the moment of this callback the element doesn't have the updated size.
            setTimeout(this.elementDidChange.bind(this), 100);
            setTimeout(this.elementDidChange.bind(this), 300);
            setTimeout(this.elementDidChange.bind(this), 1000);
        });
        this.baseBarcodePickView = new barcode.BaseBarcodePickView({
            context: props.context,
            barcodePick: props.barcodePick,
            settings: props.settings,
            cameraSettings: props.cameraSettings
        });
        this.viewProxy = scanditDatacaptureFrameworksCore.FactoryMaker.getInstance('BarcodePickViewProxy');
        this.baseBarcodePickView.initialize(this);
    }
    get uiListener() {
        return this.baseBarcodePickView.uiListener;
    }
    set uiListener(value) {
        this.baseBarcodePickView.uiListener = value;
    }
    set htmlElementState(newState) {
        const didChangeShown = this._htmlElementState.isShown !== newState.isShown;
        const didChangePositionOrSize = this._htmlElementState.didChangeComparedTo(newState);
        this._htmlElementState = newState;
        if (didChangePositionOrSize) {
            this.updatePositionAndSize();
        }
        if (didChangeShown) {
            if (this._htmlElementState.isShown) {
                this.start();
            }
        }
    }
    get htmlElementState() {
        return this._htmlElementState;
    }
    connectToElement(element) {
        this.htmlElement = element;
        this.htmlElementState = new scanditCordovaDatacaptureCore.HTMLElementState();
        // Initial update
        this.elementDidChange();
        this.subscribeToChangesOnHTMLElement();
    }
    detachFromElement() {
        this.unsubscribeFromChangesOnHTMLElement();
        this.htmlElement = null;
        this.elementDidChange();
    }
    subscribeToChangesOnHTMLElement() {
        this.domObserver.observe(document, { attributes: true, childList: true, subtree: true });
        window.addEventListener('scroll', this.scrollListener);
        window.addEventListener('orientationchange', this.orientationChangeListener);
    }
    unsubscribeFromChangesOnHTMLElement() {
        this.domObserver.disconnect();
        window.removeEventListener('scroll', this.scrollListener);
        window.removeEventListener('orientationchange', this.orientationChangeListener);
    }
    elementDidChange() {
        if (!this.htmlElement) {
            this.htmlElementState = new scanditCordovaDatacaptureCore.HTMLElementState();
            return;
        }
        const newState = new scanditCordovaDatacaptureCore.HTMLElementState();
        const boundingRect = this.htmlElement.getBoundingClientRect();
        newState.position = { top: boundingRect.top, left: boundingRect.left };
        newState.size = { width: boundingRect.width, height: boundingRect.height };
        newState.shouldBeUnderContent = parseInt(this.htmlElement.style.zIndex || '1', 10) < 0
            || parseInt(getComputedStyle(this.htmlElement).zIndex || '1', 10) < 0;
        const isDisplayed = getComputedStyle(this.htmlElement).display !== 'none'
            && this.htmlElement.style.display !== 'none';
        const isInDOM = document.body.contains(this.htmlElement);
        newState.isShown = isDisplayed && isInDOM && !this.htmlElement.hidden;
        this.htmlElementState = newState;
    }
    updatePositionAndSize() {
        if (!this.htmlElementState || !this.htmlElementState.isValid) {
            return;
        }
        this.viewProxy.setPositionAndSize(this.htmlElementState.position.top, this.htmlElementState.position.left, this.htmlElementState.size.width, this.htmlElementState.size.height, this.htmlElementState.shouldBeUnderContent);
    }
    start() {
        this.baseBarcodePickView.start();
    }
    freeze() {
        this.baseBarcodePickView.freeze();
    }
    stop() {
        this.baseBarcodePickView.stop();
    }
    addListener(listener) {
        this.baseBarcodePickView.addListener(listener);
    }
    removeListener(listener) {
        this.baseBarcodePickView.removeListener(listener);
    }
    addActionListener(listener) {
        this.baseBarcodePickView.addActionListener(listener);
    }
    removeActionListener(listener) {
        this.baseBarcodePickView.removeActionListener(listener);
    }
    release() {
        this.baseBarcodePickView.dispose();
    }
}
__decorate([
    scanditDatacaptureFrameworksCore.ignoreFromSerialization
], BarcodePickView.prototype, "baseBarcodePickView", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.ignoreFromSerialization
], BarcodePickView.prototype, "viewProxy", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.ignoreFromSerialization
], BarcodePickView.prototype, "htmlElement", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.ignoreFromSerialization
], BarcodePickView.prototype, "_htmlElementState", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.ignoreFromSerialization
], BarcodePickView.prototype, "domObserver", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.ignoreFromSerialization
], BarcodePickView.prototype, "scrollListener", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.ignoreFromSerialization
], BarcodePickView.prototype, "orientationChangeListener", void 0);

class TrackedBarcodeView extends scanditDatacaptureFrameworksCore.DefaultSerializeable {
    static withHTMLElement(element, options) {
        return this.getEncodedImageData(element).then(data => new TrackedBarcodeView(data, options));
    }
    static withBase64EncodedData(data, options) {
        return Promise.resolve(new TrackedBarcodeView(data, options));
    }
    static getEncodedImageData(element) {
        return this.getBase64DataForSVG(this.getSVGDataForElement(element));
    }
    static getSize(element) {
        const isInDOM = document.body.contains(element);
        if (!isInDOM) {
            document.body.appendChild(element);
        }
        const size = element.getBoundingClientRect();
        if (!isInDOM) {
            document.body.removeChild(element);
        }
        return new scanditDatacaptureFrameworksCore.Size(size.width, size.height);
    }
    static getSVGDataForElement(element) {
        const size = this.getSize(element);
        const data = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}px" height="${size.height}px">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${element.outerHTML}
          </div>
        </foreignObject>
      </svg>`);
        return { data, size };
    }
    static getCanvasWithSize(size) {
        const canvas = document.createElement('canvas');
        canvas.width = size.width;
        canvas.height = size.height;
        return canvas;
    }
    static getBase64DataForSVG(svgData) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                const canvas = this.getCanvasWithSize(svgData.size);
                canvas.getContext('2d').drawImage(image, 0, 0);
                resolve(canvas.toDataURL('image/png', 1));
            };
            image.onerror = reject;
            image.src = 'data:image/svg+xml,' + svgData.data;
        });
    }
    constructor(encodedData, options) {
        super();
        if (options == null) {
            options = { scale: 1 };
        }
        this.data = encodedData;
        this.options = options;
    }
}

class BarcodeTrackingAdvancedOverlay {
    get type() {
        return this.baseBarcodeTrackingOverlay.type;
    }
    get shouldShowScanAreaGuides() {
        return this.baseBarcodeTrackingOverlay.shouldShowScanAreaGuides;
    }
    set shouldShowScanAreaGuides(shouldShow) {
        this.baseBarcodeTrackingOverlay.shouldShowScanAreaGuides = shouldShow;
    }
    get listener() {
        return this.baseBarcodeTrackingOverlay.listener;
    }
    set listener(listener) {
        this.baseBarcodeTrackingOverlay.listener = listener;
    }
    static withBarcodeTrackingForView(barcodeTracking, view) {
        const overlay = new BarcodeTrackingAdvancedOverlay();
        overlay.baseBarcodeTrackingOverlay.initialize(barcodeTracking, view);
        return overlay;
    }
    constructor() {
        this.baseBarcodeTrackingOverlay = new barcode.BaseBarcodeTrackingAdvancedOverlay();
    }
    setViewForTrackedBarcode(view, trackedBarcode) {
        return this.baseBarcodeTrackingOverlay.setViewForTrackedBarcode(view, trackedBarcode);
    }
    setAnchorForTrackedBarcode(anchor, trackedBarcode) {
        return this.baseBarcodeTrackingOverlay.setAnchorForTrackedBarcode(anchor, trackedBarcode);
    }
    setOffsetForTrackedBarcode(offset, trackedBarcode) {
        return this.baseBarcodeTrackingOverlay.setOffsetForTrackedBarcode(offset, trackedBarcode);
    }
    clearTrackedBarcodeViews() {
        return this.baseBarcodeTrackingOverlay.clearTrackedBarcodeViews();
    }
    toJSON() {
        return this.baseBarcodeTrackingOverlay.toJSON();
    }
}

class SparkScanView {
    get uiListener() {
        return this.baseSparkScanView.uiListener;
    }
    set uiListener(newValue) {
        this.baseSparkScanView.uiListener = newValue;
    }
    static forContext(context, sparkScan, settings) {
        const view = new SparkScanView({ context, sparkScan, settings });
        return view;
    }
    static get defaultBrush() {
        return barcode.BaseSparkScanView.defaultBrush;
    }
    constructor({ context, sparkScan, settings }) {
        this.baseSparkScanView = barcode.BaseSparkScanView.forContext(context, sparkScan, settings);
    }
    get shouldShowScanAreaGuides() {
        return this.baseSparkScanView.shouldShowScanAreaGuides;
    }
    set shouldShowScanAreaGuides(newValue) {
        this.baseSparkScanView.shouldShowScanAreaGuides = newValue;
    }
    get brush() {
        return this.baseSparkScanView.brush;
    }
    set brush(newValue) {
        this.baseSparkScanView.brush = newValue;
    }
    get previewSizeControlVisible() {
        return this.baseSparkScanView.previewSizeControlVisible;
    }
    set previewSizeControlVisible(newValue) {
        this.baseSparkScanView.previewSizeControlVisible = newValue;
    }
    get torchButtonVisible() {
        return this.baseSparkScanView.torchButtonVisible;
    }
    set torchButtonVisible(newValue) {
        this.baseSparkScanView.torchButtonVisible = newValue;
    }
    get scanningBehaviorButtonVisible() {
        return this.baseSparkScanView.scanningBehaviorButtonVisible;
    }
    set scanningBehaviorButtonVisible(newValue) {
        this.baseSparkScanView.scanningBehaviorButtonVisible = newValue;
    }
    get handModeButtonVisible() {
        return this.baseSparkScanView.handModeButtonVisible;
    }
    set handModeButtonVisible(newValue) {
        this.baseSparkScanView.handModeButtonVisible = newValue;
    }
    get barcodeCountButtonVisible() {
        return this.baseSparkScanView.barcodeCountButtonVisible;
    }
    set barcodeCountButtonVisible(newValue) {
        this.baseSparkScanView.barcodeCountButtonVisible = newValue;
    }
    get fastFindButtonVisible() {
        return this.baseSparkScanView.fastFindButtonVisible;
    }
    set fastFindButtonVisible(newValue) {
        this.baseSparkScanView.fastFindButtonVisible = newValue;
    }
    get targetModeButtonVisible() {
        return this.baseSparkScanView.targetModeButtonVisible;
    }
    set targetModeButtonVisible(newValue) {
        this.baseSparkScanView.targetModeButtonVisible = newValue;
    }
    get soundModeButtonVisible() {
        return this.baseSparkScanView.soundModeButtonVisible;
    }
    set soundModeButtonVisible(newValue) {
        this.baseSparkScanView.soundModeButtonVisible = newValue;
    }
    get hapticModeButtonVisible() {
        return this.baseSparkScanView.hapticModeButtonVisible;
    }
    set hapticModeButtonVisible(newValue) {
        this.baseSparkScanView.hapticModeButtonVisible = newValue;
    }
    get stopCapturingText() {
        return this.baseSparkScanView.stopCapturingText;
    }
    set stopCapturingText(newValue) {
        this.baseSparkScanView.stopCapturingText = newValue;
    }
    get startCapturingText() {
        return this.baseSparkScanView.startCapturingText;
    }
    set startCapturingText(newValue) {
        this.baseSparkScanView.startCapturingText = newValue;
    }
    get resumeCapturingText() {
        return this.baseSparkScanView.resumeCapturingText;
    }
    set resumeCapturingText(newValue) {
        this.baseSparkScanView.resumeCapturingText = newValue;
    }
    get scanningCapturingText() {
        return this.baseSparkScanView.scanningCapturingText;
    }
    set scanningCapturingText(newValue) {
        this.baseSparkScanView.scanningCapturingText = newValue;
    }
    get captureButtonActiveBackgroundColor() {
        return this.baseSparkScanView.captureButtonActiveBackgroundColor;
    }
    set captureButtonActiveBackgroundColor(newValue) {
        this.baseSparkScanView.captureButtonActiveBackgroundColor = newValue;
    }
    get captureButtonBackgroundColor() {
        return this.baseSparkScanView.captureButtonBackgroundColor;
    }
    set captureButtonBackgroundColor(newValue) {
        this.baseSparkScanView.captureButtonBackgroundColor = newValue;
    }
    get captureButtonTintColor() {
        return this.baseSparkScanView.captureButtonTintColor;
    }
    set captureButtonTintColor(newValue) {
        this.baseSparkScanView.captureButtonTintColor = newValue;
    }
    get toolbarBackgroundColor() {
        return this.baseSparkScanView.toolbarBackgroundColor;
    }
    set toolbarBackgroundColor(newValue) {
        this.baseSparkScanView.toolbarBackgroundColor = newValue;
    }
    get toolbarIconActiveTintColor() {
        return this.baseSparkScanView.toolbarIconActiveTintColor;
    }
    set toolbarIconActiveTintColor(newValue) {
        this.baseSparkScanView.toolbarIconActiveTintColor = newValue;
    }
    get toolbarIconInactiveTintColor() {
        return this.baseSparkScanView.toolbarIconInactiveTintColor;
    }
    set toolbarIconInactiveTintColor(newValue) {
        this.baseSparkScanView.toolbarIconInactiveTintColor = newValue;
    }
    get targetModeHintText() {
        return this.baseSparkScanView.targetModeHintText;
    }
    set targetModeHintText(newValue) {
        this.baseSparkScanView.targetModeHintText = newValue;
    }
    get shouldShowTargetModeHint() {
        return this.baseSparkScanView.shouldShowTargetModeHint;
    }
    set shouldShowTargetModeHint(newValue) {
        this.baseSparkScanView.shouldShowTargetModeHint = newValue;
    }
    get cameraSwitchButtonVisible() {
        return this.baseSparkScanView.cameraSwitchButtonVisible;
    }
    set cameraSwitchButtonVisible(newValue) {
        this.baseSparkScanView.cameraSwitchButtonVisible = newValue;
    }
    emitFeedback(feedback) {
        this.baseSparkScanView.emitFeedback(feedback);
    }
    prepareScanning() {
        this.baseSparkScanView.prepareScanning();
    }
    startScanning() {
        this.baseSparkScanView.startScanning();
    }
    pauseScanning() {
        this.baseSparkScanView.pauseScanning();
    }
    stopScanning() {
        this.baseSparkScanView.stopScanning();
    }
    dispose() {
        this.baseSparkScanView.dispose();
    }
    show() {
        return this.baseSparkScanView.show();
    }
    hide() {
        return this.baseSparkScanView.hide();
    }
    get feedbackDelegate() {
        return this.baseSparkScanView.feedbackDelegate;
    }
    set feedbackDelegate(delegate) {
        this.baseSparkScanView.feedbackDelegate = delegate;
    }
    showToast(text) {
        return this.baseSparkScanView.showToast(text);
    }
    toJSON() {
        return this.baseSparkScanView.toJSON();
    }
}

var BarcodeCountViewEventName;
(function (BarcodeCountViewEventName) {
    BarcodeCountViewEventName["singleScanButtonTapped"] = "BarcodeCountViewUiListener.onSingleScanButtonTapped";
    BarcodeCountViewEventName["listButtonTapped"] = "BarcodeCountViewUiListener.onListButtonTapped";
    BarcodeCountViewEventName["exitButtonTapped"] = "BarcodeCountViewUiListener.onExitButtonTapped";
    BarcodeCountViewEventName["brushForRecognizedBarcode"] = "BarcodeCountViewListener.brushForRecognizedBarcode";
    BarcodeCountViewEventName["brushForRecognizedBarcodeNotInList"] = "BarcodeCountViewListener.brushForRecognizedBarcodeNotInList";
    BarcodeCountViewEventName["brushForUnrecognizedBarcode"] = "BarcodeCountViewListener.brushForUnrecognizedBarcode";
    BarcodeCountViewEventName["filteredBarcodeTapped"] = "BarcodeCountViewListener.didTapFilteredBarcode";
    BarcodeCountViewEventName["recognizedBarcodeNotInListTapped"] = "BarcodeCountViewListener.didTapRecognizedBarcodeNotInList";
    BarcodeCountViewEventName["recognizedBarcodeTapped"] = "BarcodeCountViewListener.didTapRecognizedBarcode";
    BarcodeCountViewEventName["unrecognizedBarcodeTapped"] = "BarcodeCountViewListener.didTapUnrecognizedBarcode";
    BarcodeCountViewEventName["captureListCompleted"] = "BarcodeCountViewListener.didCompleteCaptureList";
})(BarcodeCountViewEventName || (BarcodeCountViewEventName = {}));
class BarcodeCountViewProxy {
    static get cordovaExec() {
        return Cordova.exec;
    }
    static forBarcodeCount(view) {
        const viewProxy = new BarcodeCountViewProxy();
        viewProxy.barcodeCount = view._barcodeCount;
        viewProxy.view = view;
        // // First we need to initialize the context, so it will set up the DataCaptureContextProxy.
        view._context.initialize();
        // // We call update because it returns a promise, this guarantees, that by the time
        // // we need the deserialized context, it will be set in the native layer.
        // (view.context as any as PrivateDataCaptureContext).update().then(() => {
        //   viewProxy.create();
        // });
        view._context.update();
        viewProxy.create();
        return viewProxy;
    }
    update() {
        const barcodeCountView = this.view.toJSON();
        const json = JSON.stringify(barcodeCountView);
        return new Promise((resolve, reject) => {
            BarcodeCountViewProxy.cordovaExec(resolve, reject, CordovaFunction.UpdateBarcodeCountView, [json]);
        });
    }
    create() {
        const barcodeCountView = this.view.toJSON();
        const json = {
            BarcodeCount: this.view._barcodeCount.toJSON(),
            View: JSON.stringify(barcodeCountView)
        };
        return new Promise((resolve, reject) => {
            BarcodeCountViewProxy.cordovaExec(resolve, reject, CordovaFunction.CreateBarcodeCountView, [json]);
        });
    }
    dispose() {
        this.unsubscribeListeners();
        this.unsubscribeUiListeners();
    }
    setUiListener(listener) {
        if (!!listener) {
            this.subscribeUiListeners();
        }
        else {
            this.unsubscribeUiListeners();
        }
    }
    setListener(listener) {
        if (!!listener) {
            this.subscribeListeners();
        }
        else {
            this.unsubscribeListeners();
        }
    }
    clearHighlights() {
        return new Promise((resolve, reject) => {
            BarcodeCountViewProxy.cordovaExec(resolve, reject, CordovaFunction.ClearBarcodeCountViewHighlights, null);
        });
    }
    setPositionAndSize(top, left, width, height, shouldBeUnderWebView) {
        return new Promise((resolve, reject) => {
            BarcodeCountViewProxy.cordovaExec(resolve, reject, CordovaFunction.SetBarcodeCountViewPositionAndSize, [{ top: top, left: left, width: width, height: height, shouldBeUnderWebView: shouldBeUnderWebView }]);
        });
    }
    show() {
        return new Promise((resolve, reject) => {
            BarcodeCountViewProxy.cordovaExec(resolve, reject, CordovaFunction.ShowBarcodeCountView, null);
        });
    }
    hide() {
        return new Promise((resolve, reject) => {
            BarcodeCountViewProxy.cordovaExec(resolve, reject, CordovaFunction.HideBarcodeCountView, null);
        });
    }
    subscribeListeners() {
        BarcodeCountViewProxy.cordovaExec(this.notifyListeners.bind(this), null, CordovaFunction.RegisterBarcodeCountViewListener, null);
    }
    unsubscribeListeners() {
        BarcodeCountViewProxy.cordovaExec(null, null, CordovaFunction.UnregisterBarcodeCountViewListener, null);
    }
    subscribeUiListeners() {
        BarcodeCountViewProxy.cordovaExec(this.notifyListeners.bind(this), null, CordovaFunction.RegisterBarcodeCountViewUiListener, null);
    }
    unsubscribeUiListeners() {
        BarcodeCountViewProxy.cordovaExec(null, null, CordovaFunction.UnregisterBarcodeCountViewUiListener, null);
    }
    singleScanButtonTappedHandler() {
        var _a, _b;
        (_b = (_a = this.view.uiListener) === null || _a === void 0 ? void 0 : _a.didTapSingleScanButton) === null || _b === void 0 ? void 0 : _b.call(_a, this.view);
    }
    listButtonTappedHandler() {
        var _a, _b;
        (_b = (_a = this.view.uiListener) === null || _a === void 0 ? void 0 : _a.didTapListButton) === null || _b === void 0 ? void 0 : _b.call(_a, this.view);
    }
    exitButtonTappedHandler() {
        var _a, _b;
        (_b = (_a = this.view.uiListener) === null || _a === void 0 ? void 0 : _a.didTapExitButton) === null || _b === void 0 ? void 0 : _b.call(_a, this.view);
    }
    filteredBarcodeTappedHandler(trackedBarcode) {
        if (this.view.listener && this.view.listener.didTapFilteredBarcode) {
            this.view.listener.didTapFilteredBarcode(this.view, trackedBarcode);
        }
    }
    recognizedBarcodeNotInListTappedHandler(trackedBarcode) {
        if (this.view.listener && this.view.listener.didTapRecognizedBarcodeNotInList) {
            this.view.listener.didTapRecognizedBarcodeNotInList(this.view, trackedBarcode);
        }
    }
    recognizedBarcodeTappedHandler(trackedBarcode) {
        if (this.view.listener && this.view.listener.didTapRecognizedBarcode) {
            this.view.listener.didTapRecognizedBarcode(this.view, trackedBarcode);
        }
    }
    unrecognizedBarcodeTappedHandler(trackedBarcode) {
        if (this.view.listener && this.view.listener.didTapUnrecognizedBarcode) {
            this.view.listener.didTapUnrecognizedBarcode(this.view, trackedBarcode);
        }
    }
    captureListCompletedHandler() {
        if (this.view.listener && this.view.listener.didCompleteCaptureList) {
            this.view.listener.didCompleteCaptureList(this.view);
        }
    }
    brushForRecognizedBarcodeHandler(trackedBarcode) {
        let brush = this.view.recognizedBrush;
        if (this.view.listener && this.view.listener.brushForRecognizedBarcode) {
            brush = this.view.listener.brushForRecognizedBarcode(this.view, trackedBarcode);
        }
        const brushForRecognizedBarcodePayload = {
            brush: brush ? JSON.stringify(brush.toJSON()) : null,
            trackedBarcodeID: trackedBarcode.identifier,
        };
        BarcodeCountViewProxy.cordovaExec(null, null, CordovaFunction.FinishBarcodeCountViewListenerBrushForRecognizedBarcode, [brushForRecognizedBarcodePayload]);
    }
    brushForUnrecognizedBarcodeHandler(trackedBarcode) {
        let brush = this.view.unrecognizedBrush;
        if (this.view.listener && this.view.listener.brushForUnrecognizedBarcode) {
            brush = this.view.listener.brushForUnrecognizedBarcode(this.view, trackedBarcode);
        }
        const brushForUnecognizedBarcodePayload = {
            brush: brush ? JSON.stringify(brush.toJSON()) : null,
            trackedBarcodeID: trackedBarcode.identifier,
        };
        BarcodeCountViewProxy.cordovaExec(null, null, CordovaFunction.FinishBarcodeCountViewListenerOnBrushForUnrecognizedBarcode, [brushForUnecognizedBarcodePayload]);
    }
    brushForRecognizedBarcodeNotInListHandler(trackedBarcode) {
        let brush = this.view.notInListBrush;
        if (this.view.listener && this.view.listener.brushForRecognizedBarcodeNotInList) {
            brush = this.view.listener.brushForRecognizedBarcodeNotInList(this.view, trackedBarcode);
        }
        const brushForRecognizedBarcodeNotInListPayload = {
            brush: brush ? JSON.stringify(brush.toJSON()) : null,
            trackedBarcodeID: trackedBarcode.identifier,
        };
        BarcodeCountViewProxy.cordovaExec(null, null, CordovaFunction.FinishBarcodeCountViewListenerBrushForRecognizedBarcodeNotInList, [brushForRecognizedBarcodeNotInListPayload]);
    }
    notifyListeners(event) {
        var _a, _b, _c, _d, _e, _f, _g;
        const done = () => {
            this.barcodeCount.isInListenerCallback = false;
            return { enabled: this.barcodeCount.isEnabled };
        };
        this.barcodeCount.isInListenerCallback = true;
        if (!event) {
            // The event could be undefined/null in case the plugin result did not pass a "message",
            // which could happen e.g. in case of "ok" results, which could signal e.g. successful
            // listener subscriptions.
            return done();
        }
        let trackedBarcode;
        event = Object.assign(Object.assign(Object.assign({}, event), event.argument), { argument: undefined });
        switch (event.name) {
            case BarcodeCountViewEventName.brushForRecognizedBarcode:
                trackedBarcode = barcode.TrackedBarcode
                    .fromJSON(JSON.parse((_a = event.trackedBarcode) !== null && _a !== void 0 ? _a : ''));
                this.brushForRecognizedBarcodeHandler(trackedBarcode);
                break;
            case BarcodeCountViewEventName.brushForRecognizedBarcodeNotInList:
                trackedBarcode = barcode.TrackedBarcode
                    .fromJSON(JSON.parse((_b = event.trackedBarcode) !== null && _b !== void 0 ? _b : ''));
                this.brushForRecognizedBarcodeNotInListHandler(trackedBarcode);
                break;
            case BarcodeCountViewEventName.brushForUnrecognizedBarcode:
                trackedBarcode = barcode.TrackedBarcode
                    .fromJSON(JSON.parse((_c = event.trackedBarcode) !== null && _c !== void 0 ? _c : ''));
                this.brushForUnrecognizedBarcodeHandler(trackedBarcode);
                break;
            case BarcodeCountViewEventName.captureListCompleted:
                this.captureListCompletedHandler();
                break;
            case BarcodeCountViewEventName.exitButtonTapped:
                this.exitButtonTappedHandler();
                break;
            case BarcodeCountViewEventName.filteredBarcodeTapped:
                trackedBarcode = barcode.TrackedBarcode
                    .fromJSON(JSON.parse((_d = event.trackedBarcode) !== null && _d !== void 0 ? _d : ''));
                this.filteredBarcodeTappedHandler(trackedBarcode);
                break;
            case BarcodeCountViewEventName.listButtonTapped:
                this.listButtonTappedHandler();
                break;
            case BarcodeCountViewEventName.recognizedBarcodeNotInListTapped:
                trackedBarcode = barcode.TrackedBarcode
                    .fromJSON(JSON.parse((_e = event.trackedBarcode) !== null && _e !== void 0 ? _e : ''));
                this.recognizedBarcodeNotInListTappedHandler(trackedBarcode);
                break;
            case BarcodeCountViewEventName.recognizedBarcodeTapped:
                trackedBarcode = barcode.TrackedBarcode
                    .fromJSON(JSON.parse((_f = event.trackedBarcode) !== null && _f !== void 0 ? _f : ''));
                this.recognizedBarcodeTappedHandler(trackedBarcode);
                break;
            case BarcodeCountViewEventName.singleScanButtonTapped:
                this.singleScanButtonTappedHandler();
                break;
            case BarcodeCountViewEventName.unrecognizedBarcodeTapped:
                trackedBarcode = barcode.TrackedBarcode
                    .fromJSON(JSON.parse((_g = event.trackedBarcode) !== null && _g !== void 0 ? _g : ''));
                this.unrecognizedBarcodeTappedHandler(trackedBarcode);
                break;
        }
        return done();
    }
}

const BarcodeCountDefaults = {
    get BarcodeCountView() {
        const defaults = barcode.getBarcodeCountDefaults();
        return defaults.BarcodeCountView;
    }
};
class BarcodeCountView extends scanditDatacaptureFrameworksCore.DefaultSerializeable {
    get uiListener() {
        return this._uiListener;
    }
    set uiListener(listener) {
        this._uiListener = listener;
        this.viewProxy.setUiListener(listener);
    }
    get listener() {
        return this._listener;
    }
    set listener(listener) {
        this._listener = listener;
        this.viewProxy.setListener(listener);
    }
    get shouldShowUserGuidanceView() {
        return this._shouldShowUserGuidanceView;
    }
    set shouldShowUserGuidanceView(newValue) {
        this._shouldShowUserGuidanceView = newValue;
        this.updateNative();
    }
    get shouldShowListButton() {
        return this._shouldShowListButton;
    }
    set shouldShowListButton(newValue) {
        this._shouldShowListButton = newValue;
        this.updateNative();
    }
    get shouldShowExitButton() {
        return this._shouldShowExitButton;
    }
    set shouldShowExitButton(newValue) {
        this._shouldShowExitButton = newValue;
        this.updateNative();
    }
    get shouldShowShutterButton() {
        return this._shouldShowShutterButton;
    }
    set shouldShowShutterButton(newValue) {
        this._shouldShowShutterButton = newValue;
        this.updateNative();
    }
    get shouldShowHints() {
        return this._shouldShowHints;
    }
    set shouldShowHints(newValue) {
        this._shouldShowHints = newValue;
        this.updateNative();
    }
    get shouldShowClearHighlightsButton() {
        return this._shouldShowClearHighlightsButton;
    }
    set shouldShowClearHighlightsButton(newValue) {
        this._shouldShowClearHighlightsButton = newValue;
        this.updateNative();
    }
    get shouldShowSingleScanButton() {
        return this._shouldShowSingleScanButton;
    }
    set shouldShowSingleScanButton(newValue) {
        this._shouldShowSingleScanButton = newValue;
        this.updateNative();
    }
    get shouldShowFloatingShutterButton() {
        return this._shouldShowFloatingShutterButton;
    }
    set shouldShowFloatingShutterButton(newValue) {
        this._shouldShowFloatingShutterButton = newValue;
        this.updateNative();
    }
    get shouldShowToolbar() {
        return this._shouldShowToolbar;
    }
    set shouldShowToolbar(newValue) {
        this._shouldShowToolbar = newValue;
        this.updateNative();
    }
    get shouldShowScanAreaGuides() {
        return this._shouldShowScanAreaGuides;
    }
    set shouldShowScanAreaGuides(newValue) {
        this._shouldShowScanAreaGuides = newValue;
        this.updateNative();
    }
    static get defaultRecognizedBrush() {
        return BarcodeCountDefaults.BarcodeCountView.defaultRecognizedBrush;
    }
    static get defaultUnrecognizedBrush() {
        return BarcodeCountDefaults.BarcodeCountView.defaultUnrecognizedBrush;
    }
    static get defaultNotInListBrush() {
        return BarcodeCountDefaults.BarcodeCountView.defaultNotInListBrush;
    }
    get recognizedBrush() {
        return this._recognizedBrush;
    }
    set recognizedBrush(newValue) {
        this._recognizedBrush = newValue;
        this.updateNative();
    }
    get unrecognizedBrush() {
        return this._unrecognizedBrush;
    }
    set unrecognizedBrush(newValue) {
        this._unrecognizedBrush = newValue;
        this.updateNative();
    }
    get notInListBrush() {
        return this._notInListBrush;
    }
    set notInListBrush(newValue) {
        this._notInListBrush = newValue;
        this.updateNative();
    }
    get filterSettings() {
        return this._filterSettings;
    }
    set filterSettings(newValue) {
        this._filterSettings = newValue;
        this.updateNative();
    }
    get style() {
        return this._style;
    }
    get listButtonAccessibilityHint() {
        return this._listButtonAccessibilityHint;
    }
    set listButtonAccessibilityHint(newValue) {
        this._listButtonAccessibilityHint = newValue;
        this.updateNative();
    }
    get listButtonAccessibilityLabel() {
        return this._listButtonAccessibilityLabel;
    }
    set listButtonAccessibilityLabel(newValue) {
        this._listButtonAccessibilityLabel = newValue;
        this.updateNative();
    }
    get listButtonContentDescription() {
        return this._listButtonContentDescription;
    }
    set listButtonContentDescription(newValue) {
        this._listButtonContentDescription = newValue;
        this.updateNative();
    }
    get exitButtonAccessibilityHint() {
        return this._exitButtonAccessibilityHint;
    }
    set exitButtonAccessibilityHint(newValue) {
        this._exitButtonAccessibilityHint = newValue;
        this.updateNative();
    }
    get exitButtonAccessibilityLabel() {
        return this._exitButtonAccessibilityLabel;
    }
    set exitButtonAccessibilityLabel(newValue) {
        this._exitButtonAccessibilityLabel = newValue;
        this.updateNative();
    }
    get exitButtonContentDescription() {
        return this._exitButtonContentDescription;
    }
    set exitButtonContentDescription(newValue) {
        this._exitButtonContentDescription = newValue;
        this.updateNative();
    }
    get shutterButtonAccessibilityHint() {
        return this._shutterButtonAccessibilityHint;
    }
    set shutterButtonAccessibilityHint(newValue) {
        this._shutterButtonAccessibilityHint = newValue;
        this.updateNative();
    }
    get shutterButtonAccessibilityLabel() {
        return this._shutterButtonAccessibilityLabel;
    }
    set shutterButtonAccessibilityLabel(newValue) {
        this._shutterButtonAccessibilityLabel = newValue;
        this.updateNative();
    }
    get shutterButtonContentDescription() {
        return this._shutterButtonContentDescription;
    }
    set shutterButtonContentDescription(newValue) {
        this._shutterButtonContentDescription = newValue;
        this.updateNative();
    }
    get floatingShutterButtonAccessibilityHint() {
        return this._floatingShutterButtonAccessibilityHint;
    }
    set floatingShutterButtonAccessibilityHint(newValue) {
        this._floatingShutterButtonAccessibilityHint = newValue;
        this.updateNative();
    }
    get floatingShutterButtonAccessibilityLabel() {
        return this._floatingShutterButtonAccessibilityLabel;
    }
    set floatingShutterButtonAccessibilityLabel(newValue) {
        this._floatingShutterButtonAccessibilityLabel = newValue;
        this.updateNative();
    }
    get floatingShutterButtonContentDescription() {
        return this._floatingShutterButtonContentDescription;
    }
    set floatingShutterButtonContentDescription(newValue) {
        this._floatingShutterButtonContentDescription = newValue;
        this.updateNative();
    }
    get clearHighlightsButtonAccessibilityHint() {
        return this._clearHighlightsButtonAccessibilityHint;
    }
    set clearHighlightsButtonAccessibilityHint(newValue) {
        this._clearHighlightsButtonAccessibilityHint = newValue;
        this.updateNative();
    }
    get clearHighlightsButtonAccessibilityLabel() {
        return this._clearHighlightsButtonAccessibilityLabel;
    }
    set clearHighlightsButtonAccessibilityLabel(newValue) {
        this._clearHighlightsButtonAccessibilityLabel = newValue;
        this.updateNative();
    }
    get clearHighlightsButtonContentDescription() {
        return this._clearHighlightsButtonContentDescription;
    }
    set clearHighlightsButtonContentDescription(newValue) {
        this.clearHighlightsButtonContentDescription = newValue;
        this.updateNative();
    }
    get singleScanButtonAccessibilityHint() {
        return this._singleScanButtonAccessibilityHint;
    }
    set singleScanButtonAccessibilityHint(newValue) {
        this._singleScanButtonAccessibilityHint = newValue;
        this.updateNative();
    }
    get singleScanButtonAccessibilityLabel() {
        return this._singleScanButtonAccessibilityLabel;
    }
    set singleScanButtonAccessibilityLabel(newValue) {
        this._singleScanButtonAccessibilityLabel = newValue;
        this.updateNative();
    }
    get singleScanButtonContentDescription() {
        return this._singleScanButtonContentDescription;
    }
    set singleScanButtonContentDescription(newValue) {
        this._singleScanButtonContentDescription = newValue;
        this.updateNative();
    }
    get clearHighlightsButtonText() {
        return this._clearHighlightsButtonText;
    }
    set clearHighlightsButtonText(newValue) {
        this._clearHighlightsButtonText = newValue;
        this.updateNative();
    }
    get exitButtonText() {
        return this._exitButtonText;
    }
    set exitButtonText(newValue) {
        this._exitButtonText = newValue;
        this.updateNative();
    }
    get textForTapShutterToScanHint() {
        return this._textForTapShutterToScanHint;
    }
    set textForTapShutterToScanHint(newValue) {
        this._textForTapShutterToScanHint = newValue;
        this.updateNative();
    }
    get textForScanningHint() {
        return this._textForScanningHint;
    }
    set textForScanningHint(newValue) {
        this._textForScanningHint = newValue;
        this.updateNative();
    }
    get textForMoveCloserAndRescanHint() {
        return this._textForMoveCloserAndRescanHint;
    }
    set textForMoveCloserAndRescanHint(newValue) {
        this._textForMoveCloserAndRescanHint = newValue;
        this.updateNative();
    }
    get textForMoveFurtherAndRescanHint() {
        return this._textForMoveFurtherAndRescanHint;
    }
    set textForMoveFurtherAndRescanHint(newValue) {
        this._textForMoveFurtherAndRescanHint = newValue;
        this.updateNative();
    }
    get textForUnrecognizedBarcodesDetectedHint() {
        return this._textForUnrecognizedBarcodesDetectedHint;
    }
    set textForUnrecognizedBarcodesDetectedHint(newValue) {
        this._textForUnrecognizedBarcodesDetectedHint = newValue;
        this.updateNative();
    }
    set htmlElementState(newState) {
        const didChangeShown = this._htmlElementState.isShown !== newState.isShown;
        const didChangePositionOrSize = this._htmlElementState.didChangeComparedTo(newState);
        this._htmlElementState = newState;
        if (didChangePositionOrSize) {
            this.updatePositionAndSize();
        }
        if (didChangeShown) {
            if (this._htmlElementState.isShown) {
                this._show();
            }
            else {
                this._hide();
            }
        }
    }
    get htmlElementState() {
        return this._htmlElementState;
    }
    static forContextWithMode(context, barcodeCount) {
        const style = BarcodeCountDefaults.BarcodeCountView.style;
        const view = new BarcodeCountView({ context, barcodeCount, style });
        return view;
    }
    static forContextWithModeAndStyle(context, barcodeCount, style) {
        const view = new BarcodeCountView({ context, barcodeCount, style });
        return view;
    }
    constructor({ context, barcodeCount, style }) {
        super();
        this._uiListener = null;
        this._listener = null;
        this._shouldShowUserGuidanceView = BarcodeCountDefaults.BarcodeCountView.shouldShowUserGuidanceView;
        this._shouldShowListButton = BarcodeCountDefaults.BarcodeCountView.shouldShowListButton;
        this._shouldShowExitButton = BarcodeCountDefaults.BarcodeCountView.shouldShowExitButton;
        this._shouldShowShutterButton = BarcodeCountDefaults.BarcodeCountView.shouldShowShutterButton;
        this._shouldShowHints = BarcodeCountDefaults.BarcodeCountView.shouldShowHints;
        this._shouldShowClearHighlightsButton = BarcodeCountDefaults.BarcodeCountView.shouldShowClearHighlightsButton;
        this._shouldShowSingleScanButton = BarcodeCountDefaults.BarcodeCountView.shouldShowSingleScanButton;
        this._shouldShowFloatingShutterButton = BarcodeCountDefaults.BarcodeCountView.shouldShowFloatingShutterButton;
        this._shouldShowToolbar = BarcodeCountDefaults.BarcodeCountView.shouldShowToolbar;
        this._shouldShowScanAreaGuides = BarcodeCountDefaults.BarcodeCountView.shouldShowScanAreaGuides;
        this._recognizedBrush = BarcodeCountDefaults.BarcodeCountView.defaultRecognizedBrush;
        this._unrecognizedBrush = BarcodeCountDefaults.BarcodeCountView.defaultUnrecognizedBrush;
        this._notInListBrush = BarcodeCountDefaults.BarcodeCountView.defaultNotInListBrush;
        this._filterSettings = null;
        this._style = BarcodeCountDefaults.BarcodeCountView.style;
        this._listButtonAccessibilityHint = BarcodeCountDefaults.BarcodeCountView.listButtonAccessibilityHint;
        this._listButtonAccessibilityLabel = BarcodeCountDefaults.BarcodeCountView.listButtonAccessibilityLabel;
        this._listButtonContentDescription = BarcodeCountDefaults.BarcodeCountView.listButtonContentDescription;
        this._exitButtonAccessibilityHint = BarcodeCountDefaults.BarcodeCountView.exitButtonAccessibilityHint;
        this._exitButtonAccessibilityLabel = BarcodeCountDefaults.BarcodeCountView.exitButtonAccessibilityLabel;
        this._exitButtonContentDescription = BarcodeCountDefaults.BarcodeCountView.exitButtonContentDescription;
        this._shutterButtonAccessibilityHint = BarcodeCountDefaults.BarcodeCountView.shutterButtonAccessibilityHint;
        this._shutterButtonAccessibilityLabel = BarcodeCountDefaults.BarcodeCountView.shutterButtonAccessibilityLabel;
        this._shutterButtonContentDescription = BarcodeCountDefaults.BarcodeCountView.shutterButtonContentDescription;
        this._floatingShutterButtonAccessibilityHint = BarcodeCountDefaults.BarcodeCountView.floatingShutterButtonAccessibilityHint;
        this._floatingShutterButtonAccessibilityLabel = BarcodeCountDefaults.BarcodeCountView.floatingShutterButtonAccessibilityLabel;
        this._floatingShutterButtonContentDescription = BarcodeCountDefaults.BarcodeCountView.floatingShutterButtonContentDescription;
        this._clearHighlightsButtonAccessibilityHint = BarcodeCountDefaults.BarcodeCountView.clearHighlightsButtonAccessibilityHint;
        this._clearHighlightsButtonAccessibilityLabel = BarcodeCountDefaults.BarcodeCountView.clearHighlightsButtonAccessibilityLabel;
        this._clearHighlightsButtonContentDescription = BarcodeCountDefaults.BarcodeCountView.clearHighlightsButtonContentDescription;
        this._singleScanButtonAccessibilityHint = BarcodeCountDefaults.BarcodeCountView.singleScanButtonAccessibilityHint;
        this._singleScanButtonAccessibilityLabel = BarcodeCountDefaults.BarcodeCountView.singleScanButtonAccessibilityLabel;
        this._singleScanButtonContentDescription = BarcodeCountDefaults.BarcodeCountView.singleScanButtonContentDescription;
        this._clearHighlightsButtonText = BarcodeCountDefaults.BarcodeCountView.clearHighlightsButtonText;
        this._exitButtonText = BarcodeCountDefaults.BarcodeCountView.exitButtonText;
        this._textForTapShutterToScanHint = BarcodeCountDefaults.BarcodeCountView.textForTapShutterToScanHint;
        this._textForScanningHint = BarcodeCountDefaults.BarcodeCountView.textForScanningHint;
        this._textForMoveCloserAndRescanHint = BarcodeCountDefaults.BarcodeCountView.textForMoveCloserAndRescanHint;
        this._textForMoveFurtherAndRescanHint = BarcodeCountDefaults.BarcodeCountView.textForMoveFurtherAndRescanHint;
        this._textForUnrecognizedBarcodesDetectedHint = BarcodeCountDefaults.BarcodeCountView.textForUnrecognizedBarcodesDetectedHint;
        this._toolbarSettings = null;
        this.htmlElement = null;
        this._htmlElementState = new scanditCordovaDatacaptureCore.HTMLElementState();
        this.scrollListener = this.elementDidChange.bind(this);
        this.domObserver = new MutationObserver(this.elementDidChange.bind(this));
        this.orientationChangeListener = (() => {
            this.elementDidChange();
            // SDC-1784 -> workaround because at the moment of this callback the element doesn't have the updated size.
            setTimeout(this.elementDidChange.bind(this), 100);
            setTimeout(this.elementDidChange.bind(this), 300);
            setTimeout(this.elementDidChange.bind(this), 1000);
        });
        this._style = style;
        this._barcodeCount = barcodeCount;
        this._context = context;
        barcodeCount._context = context;
        this.viewProxy = BarcodeCountViewProxy.forBarcodeCount(this);
    }
    clearHighlights() {
        return this.viewProxy.clearHighlights();
    }
    setToolbarSettings(settings) {
        this._toolbarSettings = settings;
        this.updateNative();
    }
    updateNative() {
        return this.viewProxy.update();
    }
    connectToElement(element) {
        this.htmlElement = element;
        this.htmlElementState = new scanditCordovaDatacaptureCore.HTMLElementState();
        // Initial update
        this.elementDidChange();
        this.subscribeToChangesOnHTMLElement();
    }
    detachFromElement() {
        this.unsubscribeFromChangesOnHTMLElement();
        this.htmlElement = null;
        this.elementDidChange();
    }
    setFrame(frame, isUnderContent = false) {
        return this.viewProxy.setPositionAndSize(frame.origin.y, frame.origin.x, frame.size.width, frame.size.height, isUnderContent);
    }
    show() {
        if (this.htmlElement) {
            throw new Error("Views should only be manually shown if they're manually sized using setFrame");
        }
        return this._show();
    }
    hide() {
        if (this.htmlElement) {
            throw new Error("Views should only be manually hidden if they're manually sized using setFrame");
        }
        return this._hide();
    }
    subscribeToChangesOnHTMLElement() {
        this.domObserver.observe(document, { attributes: true, childList: true, subtree: true });
        window.addEventListener('scroll', this.scrollListener);
        window.addEventListener('orientationchange', this.orientationChangeListener);
    }
    unsubscribeFromChangesOnHTMLElement() {
        this.domObserver.disconnect();
        window.removeEventListener('scroll', this.scrollListener);
        window.removeEventListener('orientationchange', this.orientationChangeListener);
    }
    elementDidChange() {
        if (!this.htmlElement) {
            this.htmlElementState = new scanditCordovaDatacaptureCore.HTMLElementState();
            return;
        }
        const newState = new scanditCordovaDatacaptureCore.HTMLElementState();
        const boundingRect = this.htmlElement.getBoundingClientRect();
        newState.position = { top: boundingRect.top, left: boundingRect.left };
        newState.size = { width: boundingRect.width, height: boundingRect.height };
        newState.shouldBeUnderContent = parseInt(this.htmlElement.style.zIndex || '1', 10) < 0
            || parseInt(getComputedStyle(this.htmlElement).zIndex || '1', 10) < 0;
        const isDisplayed = getComputedStyle(this.htmlElement).display !== 'none'
            && this.htmlElement.style.display !== 'none';
        const isInDOM = document.body.contains(this.htmlElement);
        newState.isShown = isDisplayed && isInDOM && !this.htmlElement.hidden;
        this.htmlElementState = newState;
    }
    updatePositionAndSize() {
        if (!this.htmlElementState || !this.htmlElementState.isValid) {
            return;
        }
        this.viewProxy.setPositionAndSize(this.htmlElementState.position.top, this.htmlElementState.position.left, this.htmlElementState.size.width, this.htmlElementState.size.height, this.htmlElementState.shouldBeUnderContent);
    }
    _show() {
        if (!this._context) {
            throw new Error('There should be a context attached to a view that should be shown');
        }
        return this.viewProxy.show();
    }
    _hide() {
        if (!this._context) {
            throw new Error('There should be a context attached to a view that should be shown');
        }
        return this.viewProxy.hide();
    }
}
__decorate([
    scanditDatacaptureFrameworksCore.ignoreFromSerialization
], BarcodeCountView.prototype, "_barcodeCount", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.ignoreFromSerialization
], BarcodeCountView.prototype, "_context", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.ignoreFromSerialization
], BarcodeCountView.prototype, "viewProxy", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.ignoreFromSerialization
], BarcodeCountView.prototype, "_uiListener", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.ignoreFromSerialization
], BarcodeCountView.prototype, "_listener", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('shouldShowUserGuidanceView')
], BarcodeCountView.prototype, "_shouldShowUserGuidanceView", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('shouldShowListButton')
], BarcodeCountView.prototype, "_shouldShowListButton", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('shouldShowExitButton')
], BarcodeCountView.prototype, "_shouldShowExitButton", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('shouldShowShutterButton')
], BarcodeCountView.prototype, "_shouldShowShutterButton", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('shouldShowHints')
], BarcodeCountView.prototype, "_shouldShowHints", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('shouldShowClearHighlightsButton')
], BarcodeCountView.prototype, "_shouldShowClearHighlightsButton", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('shouldShowSingleScanButton')
], BarcodeCountView.prototype, "_shouldShowSingleScanButton", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('shouldShowFloatingShutterButton')
], BarcodeCountView.prototype, "_shouldShowFloatingShutterButton", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('shouldShowToolbar')
], BarcodeCountView.prototype, "_shouldShowToolbar", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('shouldShowScanAreaGuides')
], BarcodeCountView.prototype, "_shouldShowScanAreaGuides", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('recognizedBrush')
], BarcodeCountView.prototype, "_recognizedBrush", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('unrecognizedBrush')
], BarcodeCountView.prototype, "_unrecognizedBrush", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('notInListBrush')
], BarcodeCountView.prototype, "_notInListBrush", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('filterSettings')
], BarcodeCountView.prototype, "_filterSettings", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('style')
], BarcodeCountView.prototype, "_style", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('listButtonAccessibilityHint')
], BarcodeCountView.prototype, "_listButtonAccessibilityHint", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('listButtonAccessibilityLabel')
], BarcodeCountView.prototype, "_listButtonAccessibilityLabel", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('listButtonContentDescription')
], BarcodeCountView.prototype, "_listButtonContentDescription", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('exitButtonAccessibilityHint')
], BarcodeCountView.prototype, "_exitButtonAccessibilityHint", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('exitButtonAccessibilityLabel')
], BarcodeCountView.prototype, "_exitButtonAccessibilityLabel", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('exitButtonContentDescription')
], BarcodeCountView.prototype, "_exitButtonContentDescription", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('shutterButtonAccessibilityHint')
], BarcodeCountView.prototype, "_shutterButtonAccessibilityHint", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('shutterButtonAccessibilityLabel')
], BarcodeCountView.prototype, "_shutterButtonAccessibilityLabel", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('shutterButtonContentDescription')
], BarcodeCountView.prototype, "_shutterButtonContentDescription", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('floatingShutterButtonAccessibilityHint')
], BarcodeCountView.prototype, "_floatingShutterButtonAccessibilityHint", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('floatingShutterButtonAccessibilityLabel')
], BarcodeCountView.prototype, "_floatingShutterButtonAccessibilityLabel", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('floatingShutterButtonContentDescription')
], BarcodeCountView.prototype, "_floatingShutterButtonContentDescription", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('clearHighlightsButtonAccessibilityHint')
], BarcodeCountView.prototype, "_clearHighlightsButtonAccessibilityHint", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('clearHighlightsButtonAccessibilityLabel')
], BarcodeCountView.prototype, "_clearHighlightsButtonAccessibilityLabel", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('clearHighlightsButtonContentDescription')
], BarcodeCountView.prototype, "_clearHighlightsButtonContentDescription", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('singleScanButtonAccessibilityHint')
], BarcodeCountView.prototype, "_singleScanButtonAccessibilityHint", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('singleScanButtonAccessibilityLabel')
], BarcodeCountView.prototype, "_singleScanButtonAccessibilityLabel", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('singleScanButtonContentDescription')
], BarcodeCountView.prototype, "_singleScanButtonContentDescription", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('clearHighlightsButtonText')
], BarcodeCountView.prototype, "_clearHighlightsButtonText", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('exitButtonText')
], BarcodeCountView.prototype, "_exitButtonText", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('textForTapShutterToScanHint')
], BarcodeCountView.prototype, "_textForTapShutterToScanHint", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('textForScanningHint')
], BarcodeCountView.prototype, "_textForScanningHint", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('textForMoveCloserAndRescanHint')
], BarcodeCountView.prototype, "_textForMoveCloserAndRescanHint", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('textForMoveFurtherAndRescanHint')
], BarcodeCountView.prototype, "_textForMoveFurtherAndRescanHint", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('textForUnrecognizedBarcodesDetectedHint')
], BarcodeCountView.prototype, "_textForUnrecognizedBarcodesDetectedHint", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.nameForSerialization('toolbarSettings')
], BarcodeCountView.prototype, "_toolbarSettings", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.ignoreFromSerialization
], BarcodeCountView.prototype, "htmlElement", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.ignoreFromSerialization
], BarcodeCountView.prototype, "_htmlElementState", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.ignoreFromSerialization
], BarcodeCountView.prototype, "scrollListener", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.ignoreFromSerialization
], BarcodeCountView.prototype, "domObserver", void 0);
__decorate([
    scanditDatacaptureFrameworksCore.ignoreFromSerialization
], BarcodeCountView.prototype, "orientationChangeListener", void 0);

initializeBarcodeCordova();

exports.ArucoDictionary = barcode.ArucoDictionary;
Object.defineProperty(exports, "ArucoDictionaryPreset", {
    enumerable: true,
    get: function () { return barcode.ArucoDictionaryPreset; }
});
exports.ArucoMarker = barcode.ArucoMarker;
exports.Barcode = barcode.Barcode;
exports.BarcodeCapture = barcode.BarcodeCapture;
exports.BarcodeCaptureFeedback = barcode.BarcodeCaptureFeedback;
exports.BarcodeCaptureOverlay = barcode.BarcodeCaptureOverlay;
Object.defineProperty(exports, "BarcodeCaptureOverlayStyle", {
    enumerable: true,
    get: function () { return barcode.BarcodeCaptureOverlayStyle; }
});
exports.BarcodeCaptureSession = barcode.BarcodeCaptureSession;
exports.BarcodeCaptureSettings = barcode.BarcodeCaptureSettings;
exports.BarcodeCount = barcode.BarcodeCount;
exports.BarcodeCountCaptureList = barcode.BarcodeCountCaptureList;
exports.BarcodeCountCaptureListSession = barcode.BarcodeCountCaptureListSession;
exports.BarcodeCountFeedback = barcode.BarcodeCountFeedback;
exports.BarcodeCountSession = barcode.BarcodeCountSession;
exports.BarcodeCountSettings = barcode.BarcodeCountSettings;
exports.BarcodeCountToolbarSettings = barcode.BarcodeCountToolbarSettings;
Object.defineProperty(exports, "BarcodeCountViewStyle", {
    enumerable: true,
    get: function () { return barcode.BarcodeCountViewStyle; }
});
exports.BarcodeFilterHighlightSettingsBrush = barcode.BarcodeFilterHighlightSettingsBrush;
Object.defineProperty(exports, "BarcodeFilterHighlightType", {
    enumerable: true,
    get: function () { return barcode.BarcodeFilterHighlightType; }
});
exports.BarcodeFilterSettings = barcode.BarcodeFilterSettings;
exports.BarcodeFind = barcode.BarcodeFind;
exports.BarcodeFindFeedback = barcode.BarcodeFindFeedback;
exports.BarcodeFindItem = barcode.BarcodeFindItem;
exports.BarcodeFindItemContent = barcode.BarcodeFindItemContent;
exports.BarcodeFindItemSearchOptions = barcode.BarcodeFindItemSearchOptions;
exports.BarcodeFindSettings = barcode.BarcodeFindSettings;
exports.BarcodeFindViewSettings = barcode.BarcodeFindViewSettings;
exports.BarcodePick = barcode.BarcodePick;
exports.BarcodePickActionCallback = barcode.BarcodePickActionCallback;
exports.BarcodePickAsyncMapperProductProvider = barcode.BarcodePickAsyncMapperProductProvider;
Object.defineProperty(exports, "BarcodePickIconStyle", {
    enumerable: true,
    get: function () { return barcode.BarcodePickIconStyle; }
});
exports.BarcodePickProduct = barcode.BarcodePickProduct;
exports.BarcodePickProductProviderCallback = barcode.BarcodePickProductProviderCallback;
exports.BarcodePickProductProviderCallbackItem = barcode.BarcodePickProductProviderCallbackItem;
exports.BarcodePickScanningSession = barcode.BarcodePickScanningSession;
exports.BarcodePickSettings = barcode.BarcodePickSettings;
Object.defineProperty(exports, "BarcodePickState", {
    enumerable: true,
    get: function () { return barcode.BarcodePickState; }
});
exports.BarcodePickViewSettings = barcode.BarcodePickViewSettings;
exports.BarcodeSelection = barcode.BarcodeSelection;
exports.BarcodeSelectionAimerSelection = barcode.BarcodeSelectionAimerSelection;
exports.BarcodeSelectionAutoSelectionStrategy = barcode.BarcodeSelectionAutoSelectionStrategy;
exports.BarcodeSelectionBasicOverlay = barcode.BarcodeSelectionBasicOverlay;
Object.defineProperty(exports, "BarcodeSelectionBasicOverlayStyle", {
    enumerable: true,
    get: function () { return barcode.BarcodeSelectionBasicOverlayStyle; }
});
exports.BarcodeSelectionFeedback = barcode.BarcodeSelectionFeedback;
Object.defineProperty(exports, "BarcodeSelectionFreezeBehavior", {
    enumerable: true,
    get: function () { return barcode.BarcodeSelectionFreezeBehavior; }
});
exports.BarcodeSelectionManualSelectionStrategy = barcode.BarcodeSelectionManualSelectionStrategy;
exports.BarcodeSelectionSession = barcode.BarcodeSelectionSession;
exports.BarcodeSelectionSettings = barcode.BarcodeSelectionSettings;
Object.defineProperty(exports, "BarcodeSelectionTapBehavior", {
    enumerable: true,
    get: function () { return barcode.BarcodeSelectionTapBehavior; }
});
exports.BarcodeSelectionTapSelection = barcode.BarcodeSelectionTapSelection;
exports.BarcodeSpatialGrid = barcode.BarcodeSpatialGrid;
exports.BarcodeTracking = barcode.BarcodeTracking;
exports.BarcodeTrackingBasicOverlay = barcode.BarcodeTrackingBasicOverlay;
Object.defineProperty(exports, "BarcodeTrackingBasicOverlayStyle", {
    enumerable: true,
    get: function () { return barcode.BarcodeTrackingBasicOverlayStyle; }
});
Object.defineProperty(exports, "BarcodeTrackingScenario", {
    enumerable: true,
    get: function () { return barcode.BarcodeTrackingScenario; }
});
exports.BarcodeTrackingSession = barcode.BarcodeTrackingSession;
exports.BarcodeTrackingSettings = barcode.BarcodeTrackingSettings;
Object.defineProperty(exports, "BatterySavingMode", {
    enumerable: true,
    get: function () { return barcode.BatterySavingMode; }
});
Object.defineProperty(exports, "Checksum", {
    enumerable: true,
    get: function () { return barcode.Checksum; }
});
Object.defineProperty(exports, "CompositeFlag", {
    enumerable: true,
    get: function () { return barcode.CompositeFlag; }
});
Object.defineProperty(exports, "CompositeType", {
    enumerable: true,
    get: function () { return barcode.CompositeType; }
});
exports.Dot = barcode.Dot;
exports.DotWithIcons = barcode.DotWithIcons;
exports.Ean13UpcaClassification = barcode.Ean13UpcaClassification;
exports.EncodingRange = barcode.EncodingRange;
exports.LocalizedOnlyBarcode = barcode.LocalizedOnlyBarcode;
exports.Range = barcode.Range;
exports.Rectangular = barcode.Rectangular;
exports.RectangularWithIcons = barcode.RectangularWithIcons;
exports.SparkScan = barcode.SparkScan;
exports.SparkScanBarcodeErrorFeedback = barcode.SparkScanBarcodeErrorFeedback;
exports.SparkScanBarcodeFeedback = barcode.SparkScanBarcodeFeedback;
exports.SparkScanBarcodeSuccessFeedback = barcode.SparkScanBarcodeSuccessFeedback;
exports.SparkScanFeedback = barcode.SparkScanFeedback;
Object.defineProperty(exports, "SparkScanPreviewBehavior", {
    enumerable: true,
    get: function () { return barcode.SparkScanPreviewBehavior; }
});
Object.defineProperty(exports, "SparkScanScanningBehavior", {
    enumerable: true,
    get: function () { return barcode.SparkScanScanningBehavior; }
});
exports.SparkScanScanningModeDefault = barcode.SparkScanScanningModeDefault;
exports.SparkScanScanningModeTarget = barcode.SparkScanScanningModeTarget;
Object.defineProperty(exports, "SparkScanScanningPrecision", {
    enumerable: true,
    get: function () { return barcode.SparkScanScanningPrecision; }
});
exports.SparkScanSession = barcode.SparkScanSession;
exports.SparkScanSettings = barcode.SparkScanSettings;
exports.SparkScanToastSettings = barcode.SparkScanToastSettings;
exports.SparkScanViewErrorFeedback = barcode.SparkScanViewErrorFeedback;
exports.SparkScanViewFeedback = barcode.SparkScanViewFeedback;
Object.defineProperty(exports, "SparkScanViewHandMode", {
    enumerable: true,
    get: function () { return barcode.SparkScanViewHandMode; }
});
exports.SparkScanViewSettings = barcode.SparkScanViewSettings;
exports.SparkScanViewSuccessFeedback = barcode.SparkScanViewSuccessFeedback;
exports.StructuredAppendData = barcode.StructuredAppendData;
Object.defineProperty(exports, "Symbology", {
    enumerable: true,
    get: function () { return barcode.Symbology; }
});
exports.SymbologyDescription = barcode.SymbologyDescription;
exports.SymbologySettings = barcode.SymbologySettings;
exports.TargetBarcode = barcode.TargetBarcode;
exports.TrackedBarcode = barcode.TrackedBarcode;
exports.BarcodeCountView = BarcodeCountView;
exports.BarcodeFindView = BarcodeFindView;
exports.BarcodePickView = BarcodePickView;
exports.BarcodeTrackingAdvancedOverlay = BarcodeTrackingAdvancedOverlay;
exports.SparkScanView = SparkScanView;
exports.TrackedBarcodeView = TrackedBarcodeView;
