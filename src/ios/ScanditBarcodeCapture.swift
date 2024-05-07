import ScanditBarcodeCapture
import ScanditFrameworksBarcode
import ScanditFrameworksCore
import WebKit

fileprivate struct NoOpCordovaResult: FrameworksResult {
    func success(result: Any?) {}

    func reject(code: String, message: String?, details: Any?) {}

    func reject(error: Error) {}
}

fileprivate extension FrameworksResult where Self == NoOpCordovaResult {
    static func noOp() -> Self {
        .init()
    }
}

fileprivate extension CordovaEventEmitter {
    func registerCallback(with event: FrameworksBarcodeCaptureEvent, call: CDVInvokedUrlCommand) {
        registerCallback(with: event.rawValue, call: call)
    }

    func registerCallback(with event: FrameworksBarcodeTrackingEvent, call: CDVInvokedUrlCommand) {
        registerCallback(with: event.rawValue, call: call)
    }

    func registerCallback(with event: FrameworksBarcodeSelectionEvent, call: CDVInvokedUrlCommand) {
        registerCallback(with: event.rawValue, call: call)
    }

    func registerCallback(with event: FrameworksBarcodeFindEvent, call: CDVInvokedUrlCommand) {
        registerCallback(with: event.rawValue, call: call)
    }

    func unregisterCallback(with event: FrameworksBarcodeFindEvent) {
        unregisterCallback(with: event.rawValue)
    }

    func registerCallback(with event: BarcodePickEvent, call: CDVInvokedUrlCommand) {
        registerCallback(with: event.rawValue, call: call)
    }

    func unregisterCallback(with event: BarcodePickEvent) {
        unregisterCallback(with: event.rawValue)
    }

    func registerCallback(with event: BarcodePickViewListenerEvents, call: CDVInvokedUrlCommand) {
        registerCallback(with: event.rawValue, call: call)
    }

    func unregisterCallback(with event: BarcodePickViewListenerEvents) {
        unregisterCallback(with: event.rawValue)
    }

    func registerCallback(with event: BarcodePickViewUiListenerEvents, call: CDVInvokedUrlCommand) {
        registerCallback(with: event.rawValue, call: call)
    }

    func unregisterCallback(with event: BarcodePickViewUiListenerEvents) {
        unregisterCallback(with: event.rawValue)
    }

    func registerCallback(with event: BarcodePickScanningEvent, call: CDVInvokedUrlCommand) {
        registerCallback(with: event.rawValue, call: call)
    }

    func unregisterCallback(with event: BarcodePickScanningEvent) {
        unregisterCallback(with: event.rawValue)
    }

    func registerCallback(with event: FrameworksBarcodeSelectionAimedBrushProviderEvent, call: CDVInvokedUrlCommand) {
        registerCallback(with: event.rawValue, call: call)
    }

    func unregisterCallback(with event: FrameworksBarcodeSelectionAimedBrushProviderEvent) {
        unregisterCallback(with: event.rawValue)
    }

    func registerCallback(with event: FrameworksBarcodeSelectionTrackedBrushProviderEvent, call: CDVInvokedUrlCommand) {
        registerCallback(with: event.rawValue, call: call)
    }

    func unregisterCallback(with event: FrameworksBarcodeSelectionTrackedBrushProviderEvent) {
        unregisterCallback(with: event.rawValue)
    }

    func registerCallback(with event: FrameworksSparkScanFeedbackDelegateEvent, call: CDVInvokedUrlCommand) {
        registerCallback(with: event.rawValue, call: call)
    }

    func unregisterCallback(with event: FrameworksSparkScanFeedbackDelegateEvent) {
        unregisterCallback(with: event.rawValue)
    }
}

@objc(ScanditBarcodeCapture)
class ScanditBarcodeCapture: CDVPlugin {
    private let brushProviderQueue = DispatchQueue(label: "com.scandit.frameworks.cordova.brushprovider")
    var barcodeModule: BarcodeModule!
    var barcodeCaptureModule: BarcodeCaptureModule!
    var barcodeTrackingModule: BarcodeTrackingModule!
    var barcodeSelectionModule: BarcodeSelectionModule!
    var barcodeFindModule: BarcodeFindModule!
    var barcodePickModule: BarcodePickModule!
    var emitter: CordovaEventEmitter!
    var barcodeFindViewHandler: BarcodeFindViewHandler!
    var barcodePickViewHandler: BarcodePickViewHandler!
    var sparkScanModule: SparkScanModule!
    var barcodeCountModule: BarcodeCountModule!
    
    private lazy var barcodeCountViewConstraints = NativeViewConstraints(relativeTo: webView as! WKWebView)

    override func pluginInitialize() {
        super.pluginInitialize()
        barcodeModule = BarcodeModule()
        emitter = CordovaEventEmitter(commandDelegate: commandDelegate)

        barcodeCaptureModule = BarcodeCaptureModule(
            barcodeCaptureListener: FrameworksBarcodeCaptureListener(emitter: emitter)
        )
        barcodeTrackingModule = BarcodeTrackingModule(
            barcodeTrackingListener: FrameworksBarcodeTrackingListener(emitter: emitter),
            barcodeTrackingBasicOverlayListener: FrameworksBarcodeTrackingBasicOverlayListener(emitter: emitter),
            barcodeTrackingAdvancedOverlayListener: FrameworksBarcodeTrackingAdvancedOverlayListener(emitter: emitter),
            emitter: emitter
        )
        barcodeSelectionModule = BarcodeSelectionModule(
            barcodeSelectionListener: FrameworksBarcodeSelectionListener(emitter: emitter),
            aimedBrushProvider: FrameworksBarcodeSelectionAimedBrushProvider(emitter: emitter, queue: brushProviderQueue),
            trackedBrushProvider: FrameworksBarcodeSelectionTrackedBrushProvider(emitter: emitter, queue: brushProviderQueue)
        )
        barcodeFindModule = BarcodeFindModule(
            listener: FrameworksBarcodeFindListener(emitter: emitter),
            viewListener: FrameworksBarcodeFindViewUIListener(emitter: emitter),
            barcodeTransformer: FrameworksBarcodeFindTransformer(emitter: emitter)
        )
        barcodePickModule = BarcodePickModule(emitter: emitter)
        sparkScanModule = SparkScanModule(
            sparkScanListener: FrameworksSparkScanListener(emitter: emitter),
            sparkScanViewUIListener: FrameworksSparkScanViewUIListener(emitter: emitter),
            feedbackDelegate: FrameworksSparkScanFeedbackDelegate(emitter: emitter)
        )
        
        barcodeCountModule = BarcodeCountModule(
            barcodeCountListener: FrameworksBarcodeCountListener(emitter: emitter),
            captureListListener: FrameworksBarcodeCountCaptureListListener(emitter: emitter),
            viewListener: FrameworksBarcodeCountViewListener(emitter: emitter),
            viewUiListener: FrameworksBarcodeCountViewUIListener(emitter: emitter)
        )

        barcodeModule.didStart()
        barcodeCaptureModule.didStart()
        barcodeTrackingModule.didStart()
        barcodeSelectionModule.didStart()
        barcodeFindModule.didStart()
        barcodePickModule.didStart()
        sparkScanModule.didStart()
        barcodeCountModule.didStart()

        barcodeFindViewHandler = BarcodeFindViewHandler(relativeTo: webView as! WKWebView)
        barcodePickViewHandler = BarcodePickViewHandler(relativeTo: webView as! WKWebView)
    }

    override func dispose() {
        barcodeModule.didStop()
        barcodeCaptureModule.didStop()
        barcodeCaptureModule.removeListener()
        barcodeTrackingModule.didStop()
        barcodeTrackingModule.removeBarcodeTrackingListener()
        barcodeTrackingModule.removeBasicOverlayListener()
        barcodeTrackingModule.removeAdvancedOverlayListener()
        barcodeSelectionModule.didStop()
        barcodeSelectionModule.removeListener()
        barcodeFindModule.removeBarcodeFindListener(result: .noOp())
        barcodeFindModule.removeBarcodeFindViewListener(result: .noOp())
        barcodeFindModule.didStop()
        barcodePickModule.removeActionListener()
        barcodePickModule.removeScanningListener()
        barcodePickModule.removeViewListener()
        barcodePickModule.removeViewUiListener()
        barcodePickModule.didStop()
        sparkScanModule.didStop()
        sparkScanModule.removeSparkScanListener()
        sparkScanModule.removeSparkScanViewUiListener()
        barcodeCountModule.didStop()
        super.dispose()
    }

    @objc(getDefaults:)
    func getDefaults(command: CDVInvokedUrlCommand) {
        var defaults = barcodeModule.defaults.toEncodable() as CDVPluginResult.JSONMessage
        defaults["BarcodeCapture"] = barcodeCaptureModule.defaults.toEncodable()
        defaults["BarcodeTracking"] = barcodeTrackingModule.defaults.toEncodable()
        defaults["BarcodeSelection"] = barcodeSelectionModule.defaults.toEncodable()
        defaults["BarcodeFind"] = barcodeFindModule.defaults.toEncodable()
        defaults["BarcodePick"] = barcodePickModule.defaults.toEncodable()
        defaults["SparkScan"] = sparkScanModule.defaults.toEncodable()
        defaults["BarcodeCount"] = barcodeCountModule.defaults.toEncodable()
        commandDelegate.send(.success(message: defaults), callbackId: command.callbackId)
    }

    // MARK: - Subscribe listeners

    @objc(subscribeBarcodeCaptureListener:)
    func subscribeBarcodeCaptureListener(command: CDVInvokedUrlCommand) {
        emitter.registerCallback(with: .barcodeScanned, call: command)
        emitter.registerCallback(with: FrameworksBarcodeCaptureEvent.sessionUpdated, call: command)
        barcodeCaptureModule.addListener()
        commandDelegate.send(.keepCallback, callbackId: command.callbackId)
    }

    @objc(unsubscribeBarcodeCaptureListener:)
    func unsubscribeBarcodeCaptureListener(command: CDVInvokedUrlCommand) {
        emitter.unregisterCallback(with: FrameworksBarcodeCaptureEvent.barcodeScanned.rawValue)
        emitter.unregisterCallback(with: FrameworksBarcodeCaptureEvent.sessionUpdated.rawValue)
        barcodeCaptureModule.addListener()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(subscribeBarcodeTrackingListener:)
    func subscribeBarcodeTrackingListener(command: CDVInvokedUrlCommand) {
        emitter.registerCallback(with: FrameworksBarcodeTrackingEvent.sessionUpdated, call: command)
        barcodeTrackingModule.addBarcodeTrackingListener()
        commandDelegate.send(.keepCallback, callbackId: command.callbackId)
    }

    @objc(unregisterBarcodeTrackingListener:)
    func unregisterBarcodeTrackingListener(command: CDVInvokedUrlCommand) {
        emitter.unregisterCallback(with: FrameworksBarcodeTrackingEvent.sessionUpdated.rawValue)
        barcodeTrackingModule.removeBarcodeTrackingListener()
        commandDelegate.send(.keepCallback, callbackId: command.callbackId)
    }

    @objc(subscribeBarcodeTrackingBasicOverlayListener:)
    func subscribeBarcodeTrackingBasicOverlayListener(command: CDVInvokedUrlCommand) {
        emitter.registerCallback(with: FrameworksBarcodeTrackingEvent.brushForTrackedBarcode, call: command)
        emitter.registerCallback(with: FrameworksBarcodeTrackingEvent.didTapOnTrackedBarcode, call: command)
        barcodeTrackingModule.addBasicOverlayListener()
        commandDelegate.send(.keepCallback, callbackId: command.callbackId)
    }

    @objc(unregisterBarcodeTrackingBasicOverlayListener:)
    func unregisterBarcodeTrackingBasicOverlayListener(command: CDVInvokedUrlCommand) {
        emitter.unregisterCallback(with: FrameworksBarcodeTrackingEvent.brushForTrackedBarcode.rawValue)
        emitter.unregisterCallback(with: FrameworksBarcodeTrackingEvent.didTapOnTrackedBarcode.rawValue)
        barcodeTrackingModule.removeBasicOverlayListener()
        commandDelegate.send(.keepCallback, callbackId: command.callbackId)
    }

    @objc(subscribeBarcodeTrackingAdvancedOverlayListener:)
    func subscribeBarcodeTrackingAdvancedOverlayListener(command: CDVInvokedUrlCommand) {
        emitter.registerCallback(with: .anchorForTrackedBarcode, call: command)
        emitter.registerCallback(with: .offsetForTrackedBarcode, call: command)
        emitter.registerCallback(with: .widgetForTrackedBarcode, call: command)
        emitter.registerCallback(with: .didTapViewForTrackedBarcode, call: command)
        barcodeTrackingModule.addAdvancedOverlayListener()
        commandDelegate.send(.keepCallback, callbackId: command.callbackId)
    }

    @objc(unregisterBarcodeTrackingAdvancedOverlayListener:)
    func unregisterBarcodeTrackingAdvancedOverlayListener(command: CDVInvokedUrlCommand) {
        emitter.unregisterCallback(with: FrameworksBarcodeTrackingEvent.anchorForTrackedBarcode.rawValue)
        emitter.unregisterCallback(with: FrameworksBarcodeTrackingEvent.offsetForTrackedBarcode.rawValue)
        emitter.unregisterCallback(with: FrameworksBarcodeTrackingEvent.widgetForTrackedBarcode.rawValue)
        emitter.unregisterCallback(with: FrameworksBarcodeTrackingEvent.didTapViewForTrackedBarcode.rawValue)
        barcodeTrackingModule.removeAdvancedOverlayListener()
        commandDelegate.send(.keepCallback, callbackId: command.callbackId)
    }

    @objc(subscribeBarcodeSelectionListener:)
    func subscribeBarcodeSelectionListener(command: CDVInvokedUrlCommand) {
        emitter.registerCallback(with: .didUpdateSelection, call: command)
        emitter.registerCallback(with: FrameworksBarcodeSelectionEvent.didUpdateSession, call: command)
        barcodeSelectionModule.addListener()
        commandDelegate.send(.keepCallback, callbackId: command.callbackId)
    }

    @objc(unsubscribeBarcodeSelectionListener:)
    func unsubscribeBarcodeSelectionListener(command: CDVInvokedUrlCommand) {
        emitter.unregisterCallback(with: FrameworksBarcodeSelectionEvent.didUpdateSelection.rawValue)
        emitter.unregisterCallback(with: FrameworksBarcodeSelectionEvent.didUpdateSession.rawValue)
        barcodeSelectionModule.removeListener()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    // MARK: - Barcode Capture

    @objc(finishBarcodeCaptureDidUpdateSession:)
    func finishBarcodeCaptureDidUpdateSession(command: CDVInvokedUrlCommand) {
        var enabled = false
        if let payload = command.defaultArgumentAsDictionary, let value = payload["enabled"] as? Bool {
            enabled = value
        }
        barcodeCaptureModule.finishDidUpdateSession(enabled: enabled)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(finishBarcodeCaptureDidScan:)
    func finishBarcodeCaptureDidScan(command: CDVInvokedUrlCommand) {
        var enabled = false
        if let payload = command.defaultArgumentAsDictionary, let value = payload["enabled"] as? Bool {
            enabled = value
        }
        barcodeCaptureModule.finishDidScan(enabled: enabled)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(resetBarcodeCaptureSession:)
    func resetBarcodeCaptureSession(command: CDVInvokedUrlCommand) {
        barcodeCaptureModule.resetSession(frameSequenceId: nil)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(setBarcodeCaptureModeEnabledState:)
    func setBarcodeCaptureModeEnabledState(command: CDVInvokedUrlCommand) {
        var enabled = false
        if let payload = command.defaultArgumentAsDictionary, let value = payload["enabled"] as? Bool {
            enabled = value
        }
        barcodeCaptureModule.setModeEnabled(enabled: enabled)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    // MARK: - Barcode Tracking

    @objc(finishBarcodeTrackingDidUpdateSession:)
    func finishBarcodeTrackingDidUpdateSession(command: CDVInvokedUrlCommand) {
        var enabled = false
        if let payload = command.defaultArgumentAsDictionary, let value = payload["enabled"] as? Bool {
            enabled = value
        }
        barcodeTrackingModule.finishDidUpdateSession(enabled: enabled)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(resetBarcodeTrackingSession:)
    func resetBarcodeTrackingSession(command: CDVInvokedUrlCommand) {
        barcodeTrackingModule.resetSession(frameSequenceId: nil)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(setBarcodeTrackingModeEnabledState:)
    func setBarcodeTrackingModeEnabledState(command: CDVInvokedUrlCommand) {
        var enabled = false
        if let payload = command.defaultArgumentAsDictionary, let value = payload["enabled"] as? Bool {
            enabled = value
        }
        barcodeTrackingModule.setModeEnabled(enabled: enabled)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    // MARK: - Barcode Tracking Basic Overlay

    @objc(finishBarcodeTrackingBrushForTrackedBarcode:)
    func finishBarcodeTrackingBrushForTrackedBarcode(command: CDVInvokedUrlCommand) {
        guard let json = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        barcodeTrackingModule.setBasicOverlayBrush(with: json)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(setBrushForTrackedBarcode:)
    func setBrushForTrackedBarcode(command: CDVInvokedUrlCommand) {
        guard let json = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        barcodeTrackingModule.setBasicOverlayBrush(with: json)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(clearTrackedBarcodeBrushes:)
    func clearTrackedBarcodeBrushes(command: CDVInvokedUrlCommand) {
        barcodeTrackingModule.clearBasicOverlayTrackedBarcodeBrushes()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    // MARK: Barcode Tracking Advanced Overlay

    @objc(setViewForTrackedBarcode:)
    func setViewForTrackedBarcode(command: CDVInvokedUrlCommand) {
        guard let json = try? ViewAndTrackedBarcodeJSON.fromCommand(command) else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }

        guard let id = Int(json.trackedBarcodeID),
              let trackedBarcode = barcodeTrackingModule.trackedBarcode(by: id) else {
            commandDelegate.send(.failure(with: .trackedBarcodeNotFound), callbackId: command.callbackId)
            return
        }

        var view: TrackedBarcodeView?
        dispatchMainSync {
            if let viewJson = json.view {
                view = TrackedBarcodeView(json: viewJson)
                view?.didTap = { [weak self] in
                    guard let self = self else { return }
                    self.emitter.emit(name: FrameworksBarcodeTrackingEvent.didTapViewForTrackedBarcode.rawValue,
                                      payload: ["trackedBarcode": trackedBarcode.jsonString])
                }
            }
        }
        guard let view = view else { return }
        barcodeTrackingModule.setViewForTrackedBarcode(view: view, trackedBarcodeId: id, sessionFrameSequenceId: nil)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(setAnchorForTrackedBarcode:)
    func setAnchorForTrackedBarcode(command: CDVInvokedUrlCommand) {
        guard var json = command.defaultArgumentAsDictionary,
              let trackedBarcodeIdString = json["trackedBarcodeID"] as? String,
              let identifier = Int(trackedBarcodeIdString) else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        json["identifier"] = identifier
        json.removeValue(forKey: "trackedBarcodeID")
        barcodeTrackingModule.setAnchorForTrackedBarcode(anchorParams: json)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(setOffsetForTrackedBarcode:)
    func setOffsetForTrackedBarcode(command: CDVInvokedUrlCommand) {
        guard var json = command.defaultArgumentAsDictionary,
              let trackedBarcodeIdString = json["trackedBarcodeID"] as? String,
              let identifier = Int(trackedBarcodeIdString) else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        json["identifier"] = identifier
        json.removeValue(forKey: "trackedBarcodeID")
        barcodeTrackingModule.setOffsetForTrackedBarcode(offsetParams: json)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(clearTrackedBarcodeViews:)
    func clearTrackedBarcodeViews(command: CDVInvokedUrlCommand) {
        barcodeTrackingModule.clearAdvancedOverlayTrackedBarcodeViews()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    // MARK: Barcode Selection

    @objc(finishBarcodeSelectionDidUpdateSession:)
    func finishBarcodeSelectionDidUpdateSession(command: CDVInvokedUrlCommand) {
        var enabled = false
        if let payload = command.defaultArgumentAsDictionary, let value = payload["enabled"] as? Bool {
            enabled = value
        }
        barcodeSelectionModule.finishDidUpdate(enabled: enabled)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(finishBarcodeSelectionDidUpdateSelection:)
    func finishBarcodeSelectionDidUpdateSelection(command: CDVInvokedUrlCommand) {
        var enabled = false
        if let payload = command.defaultArgumentAsDictionary, let value = payload["enabled"] as? Bool {
            enabled = value
        }
        barcodeSelectionModule.finishDidSelect(enabled: enabled)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(resetBarcodeSelectionSession:)
    func resetBarcodeSelectionSession(command: CDVInvokedUrlCommand) {
        barcodeSelectionModule.resetLatestSession(frameSequenceId: nil)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(resetBarcodeSelection:)
    func resetBarcodeSelection(command: CDVInvokedUrlCommand) {
        barcodeSelectionModule.resetSelection()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(unfreezeCameraInBarcodeSelection:)
    func unfreezeCameraInBarcodeSelection(command: CDVInvokedUrlCommand) {
        barcodeSelectionModule.unfreezeCamera()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(getCountForBarcodeInBarcodeSelectionSession:)
    func getCountForBarcodeInBarcodeSelectionSession(command: CDVInvokedUrlCommand) {
        guard let sessionId = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .noBarcodeSelectionSession), callbackId: command.callbackId)
            return
        }
        let count = barcodeSelectionModule.getBarcodeCount(selectionIdentifier: sessionId)
        commandDelegate.send(.success(message: count), callbackId: command.callbackId)
    }

    @objc(setBarcodeSelectionModeEnabledState:)
    func setBarcodeSelectionModeEnabledState(command: CDVInvokedUrlCommand) {
        var enabled = false
        if let payload = command.defaultArgumentAsDictionary, let value = payload["enabled"] as? Bool {
            enabled = value
        }
        barcodeSelectionModule.setModeEnabled(enabled: enabled)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(unselectBarcodes:)
    func unselectBarcodes(command: CDVInvokedUrlCommand) {
        guard let barcodesJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        barcodeSelectionModule.unselectBarcodes(barcodesJson: barcodesJson, result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(setSelectBarcodeEnabled:)
    func setSelectBarcodeEnabled(command: CDVInvokedUrlCommand) {
        guard let json = command.defaultArgumentAsDictionary else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }

        guard let enabled = json["enabled"] as? Bool else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        guard let barcodeJson = json["barcode"] as? String else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        barcodeSelectionModule.setSelectBarcodeEnabled(barcodesJson: barcodeJson, enabled: enabled, result: CordovaResult(commandDelegate, command.callbackId))
    }

    // MARK: Barcode Find

    @objc(createFindView:)
    func createFindView(command: CDVInvokedUrlCommand) {
        let viewJson = command.defaultArgumentAsString!
        barcodeFindModule.addViewToContainer(container: barcodeFindViewHandler.webView,
                                             jsonString: viewJson,
                                             result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(updateFindView:)
    func updateFindView(command: CDVInvokedUrlCommand) {
        let viewJson = command.defaultArgumentAsString!
        barcodeFindModule.updateBarcodeFindView(viewJson: viewJson,
                                                result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(updateFindMode:)
    func updateFindMode(command: CDVInvokedUrlCommand) {
        let payload = command.defaultArgumentAsDictionary!
        let modeJson = payload["BarcodeFind"] as! String
        barcodeFindModule.updateBarcodeFindMode(modeJson: modeJson,
                                                result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(registerBarcodeFindListener:)
    func registerBarcodeFindListener(command: CDVInvokedUrlCommand) {
        emitter.registerCallback(with: .didPauseSearch, call: command)
        emitter.registerCallback(with: .didStartSearch, call: command)
        emitter.registerCallback(with: .didStopSearch, call: command)
        barcodeFindModule.addBarcodeFindListener(result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(unregisterBarcodeFindListener:)
    func unregisterBarcodeFindListener(command: CDVInvokedUrlCommand) {
        emitter.unregisterCallback(with: .didPauseSearch)
        emitter.unregisterCallback(with: .didStartSearch)
        emitter.unregisterCallback(with: .didStopSearch)
        barcodeFindModule.removeBarcodeFindListener(result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(registerBarcodeFindViewListener:)
    func registerBarcodeFindViewListener(command: CDVInvokedUrlCommand) {
        emitter.registerCallback(with: .finishButtonTapped, call: command)
        barcodeFindModule.addBarcodeFindViewListener(result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(unregisterBarcodeFindViewListener:)
    func unregisterBarcodeFindViewListener(command: CDVInvokedUrlCommand) {
        emitter.unregisterCallback(with: .finishButtonTapped)
        barcodeFindModule.removeBarcodeFindViewListener(result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(barcodeFindViewOnPause:)
    func barcodeFindViewOnPause(command: CDVInvokedUrlCommand) {
        // No iOS implementation
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(barcodeFindViewOnResume:)
    func barcodeFindViewOnResume(command: CDVInvokedUrlCommand) {
        barcodeFindModule.prepareSearching(result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(barcodeFindSetItemList:)
    func barcodeFindSetItemList(command: CDVInvokedUrlCommand) {
        let json = command.defaultArgumentAsString!
        barcodeFindModule.setItemList(barcodeFindItemsJson: json,
                                      result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(barcodeFindViewStopSearching:)
    func barcodeFindViewStopSearching(command: CDVInvokedUrlCommand) {
        barcodeFindModule.stopSearching(result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(barcodeFindViewStartSearching:)
    func barcodeFindViewStartSearching(command: CDVInvokedUrlCommand) {
        barcodeFindModule.startSearching(result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(barcodeFindViewPauseSearching:)
    func barcodeFindViewPauseSearching(command: CDVInvokedUrlCommand) {
        barcodeFindModule.pauseSearching(result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(barcodeFindModeStart:)
    func barcodeFindModeStart(command: CDVInvokedUrlCommand) {
        barcodeFindModule.startMode(result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(barcodeFindModePause:)
    func barcodeFindModePause(command: CDVInvokedUrlCommand) {
        barcodeFindModule.pauseMode(result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(barcodeFindModeStop:)
    func barcodeFindModeStop(command: CDVInvokedUrlCommand) {
        barcodeFindModule.stopMode(result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(setBarcodeFindTransformer:)
    func setBarcodeFindTransformer(command: CDVInvokedUrlCommand) {
        barcodeFindModule.setBarcodeFindTransformer(result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(submitBarcodeFindTransformerResult:)
    func submitBarcodeFindTransformerResult(command: CDVInvokedUrlCommand) {
        let transformedBarcode = command.defaultArgumentAsString!
        barcodeFindModule.submitBarcodeFindTransformerResult(
            transformedData: transformedBarcode,
            result: CordovaResult(commandDelegate, command.callbackId)
        )
    }

    @objc(showFindView:)
    func showFindView(command: CDVInvokedUrlCommand) {
        dispatchMainSync {
            guard let barcodeFindView = self.barcodeFindViewHandler.barcodeFindView else {
                commandDelegate.send(.failure(with: .noViewToBeShown), callbackId: command.callbackId)
                return
            }
            barcodeFindView.isHidden = false
            commandDelegate.send(.success, callbackId: command.callbackId)
        }
    }

    @objc(hideFindView:)
    func hideFindView(command: CDVInvokedUrlCommand) {
        dispatchMainSync {
            guard let barcodeFindView = self.barcodeFindViewHandler.barcodeFindView else {
                commandDelegate.send(.failure(with: .noViewToBeShown), callbackId: command.callbackId)
                return
            }
            barcodeFindView.isHidden = true
            commandDelegate.send(.success, callbackId: command.callbackId)
        }
    }

    @objc(setBarcodeFindModeEnabledState:)
    func setBarcodeFindModeEnabledState(command: CDVInvokedUrlCommand) {
        var enabled = false
        if let payload = command.defaultArgumentAsDictionary, let value = payload["enabled"] as? Bool {
            enabled = value
        }
        barcodeFindModule.setModeEnabled(enabled: enabled)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    // MARK: Barcode Pick


    @objc(subscribeDidPickItemListener:)
    func subscribeDidPickItemListener(command: CDVInvokedUrlCommand) {
        emitter.registerCallback(with: .pick, call: command)
    }

    @objc(subscribeDidUnpickItemListener:)
    func subscribeDidUnpickItemListener(command: CDVInvokedUrlCommand) {
        emitter.registerCallback(with: .unpick, call: command)
    }

    @objc(subscribeProductIdentifierForItemsListener:)
    func subscribeProductIdentifierForItemsListener(command: CDVInvokedUrlCommand) {
        emitter.registerCallback(with: .onProductIdentifierForItems, call: command)
    }

    @objc(unsubscribeListeners:)
    func unsubscribeListeners(command: CDVInvokedUrlCommand) {
        emitter.unregisterCallback(with: .pick)
        emitter.unregisterCallback(with: .unpick)
        emitter.unregisterCallback(with: .onProductIdentifierForItems)
        emitter.unregisterCallback(with: .didStartScanning)
        emitter.unregisterCallback(with: .didStopScanning)
        emitter.unregisterCallback(with: .didPauseScanning)
        emitter.unregisterCallback(with: .didFreezeScanning)

        barcodePickModule.removeActionListener()
        barcodePickModule.removeScanningListener()
        barcodePickModule.removeViewListener()
    }

    @objc(createPickView:)
    func createPickView(command: CDVInvokedUrlCommand) {
        guard let viewJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }

        dispatchMainSync {
            barcodePickModule.addViewToContainer(container: barcodePickViewHandler.webView,
                                                 jsonString: viewJson,
                                                 result: CordovaResult(commandDelegate, command.callbackId))
            barcodePickViewHandler.barcodePickView = barcodePickModule.barcodePickView
        }
    }

    @objc(updateePickView:)
    func updatePickView(command: CDVInvokedUrlCommand) {
        guard let viewJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }

        barcodePickModule.updateView(viewJson: viewJson,
                                     result: CordovaResult(commandDelegate, command.callbackId))

    }

    @objc(setPickViewPositionAndSize:)
    func setPickViewPositionAndSize(command: CDVInvokedUrlCommand) {
        guard let jsonObject = command.defaultArgumentAsDictionary else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        dispatchMainSync {
            guard let viewPositionAndSizeJSON = try? ViewPositionAndSizeJSON.fromJSONObject(jsonObject as Any) else {
                commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
                return
            }

            self.barcodePickViewHandler.updatePositionAndSize(fromJSON: viewPositionAndSizeJSON)

            if viewPositionAndSizeJSON.shouldBeUnderWebView {
                // Make the WebView transparent, so we can see views behind
                self.webView?.isOpaque = false
                self.webView?.backgroundColor = .clear
                self.webView?.scrollView.backgroundColor = .clear
            } else {
                self.webView?.isOpaque = true
                self.webView?.backgroundColor = nil
                self.webView?.scrollView.backgroundColor = nil
            }

            commandDelegate.send(.success, callbackId: command.callbackId)
        }
    }

    @objc(addActionListener:)
    func addActionListener(command: CDVInvokedUrlCommand) {
        barcodePickModule.addActionListener()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(removeActionListener:)
    func removeActionListener(command: CDVInvokedUrlCommand) {
        barcodePickModule.removeActionListener()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(addScanningListener:)
    func addScanningListener(command: CDVInvokedUrlCommand) {
        barcodePickModule.addScanningListener()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(removeScanningListener:)
    func removeScanningListener(command: CDVInvokedUrlCommand) {
        barcodePickModule.removeScanningListener()
        emitter.unregisterCallback(with: .didCompleteScanningSession)
        emitter.unregisterCallback(with: .didUpdateScanningSession)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(addViewListener:)
    func addViewListener(command: CDVInvokedUrlCommand) {
        barcodePickModule.addViewListener()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(subscribeDidStartScanningListener:)
    func subscribeDidStartScanningListener(command: CDVInvokedUrlCommand) {
        emitter.registerCallback(with: .didStartScanning, call: command)
    }

    @objc(subscribeDidFreezeScanningListener:)
    func subscribeDidFreezeScanningListener(command: CDVInvokedUrlCommand) {
        emitter.registerCallback(with: .didFreezeScanning, call: command)
    }

    @objc(subscribeDidPauseScanningListener:)
    func subscribeDidPauseScanningListener(command: CDVInvokedUrlCommand) {
        emitter.registerCallback(with: .didPauseScanning, call: command)
    }

    @objc(subscribeDidStopScanningListener:)
    func subscribeDidStopScanningListener(command: CDVInvokedUrlCommand) {
        emitter.registerCallback(with: .didStopScanning, call: command)
    }

    @objc(subscribeDidCompleteScanningSessionListener:)
    func subscribeDidCompleteScanningSessionListener(command: CDVInvokedUrlCommand) {
        emitter.registerCallback(with: .didCompleteScanningSession, call: command)
    }

    @objc(subscribeDidUpdateScanningSessionListener:)
    func subscribeDidUpdateScanningSessionListener(command: CDVInvokedUrlCommand) {
        emitter.registerCallback(with: .didUpdateScanningSession, call: command)
    }

    @objc(registerBarcodePickViewUiListener:)
    func registerBarcodePickViewUiListener(command: CDVInvokedUrlCommand) {
        barcodePickModule.addViewUiListener()
    }

    @objc(subscribeBarcodePickViewUiListener:)
    func subscribeBarcodePickViewUiListener(command: CDVInvokedUrlCommand) {
        emitter.registerCallback(with: .didTapFinishButton, call: command)
    }

    @objc(unsubscribeBarcodePickViewUiListener:)
    func unsubscribeBarcodePickViewUiListener(command: CDVInvokedUrlCommand) {
        barcodePickModule.removeViewUiListener()
        emitter.unregisterCallback(with: .didTapFinishButton)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(finishOnProductIdentifierForItems:)
    func finishOnProductIdentifierForItems(command: CDVInvokedUrlCommand) {
        guard let itemsJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        barcodePickModule.finishProductIdentifierForItems(barcodePickProductProviderCallbackItemsJson: itemsJson)
    }

    @objc(viewStop:)
    func viewStop(command: CDVInvokedUrlCommand) {
        barcodePickModule.viewStop()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(viewStart:)
    func viewStart(command: CDVInvokedUrlCommand) {
        barcodePickModule.viewStart()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(viewFreeze:)
    func viewFreeze(command: CDVInvokedUrlCommand) {
        barcodePickModule.viewFreeze()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(finishPickAction:)
    func finishPickAction(command: CDVInvokedUrlCommand) {
        guard let json = command.defaultArgumentAsDictionary else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }

        guard let actionData = json["code"] as? String, let result = json["result"] as? Bool else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }

        barcodePickModule.finishPickAction(data: actionData, result: result)
    }


    @objc(updateBarcodeCaptureOverlay:)
    func updateBarcodeCaptureOverlay(command: CDVInvokedUrlCommand) {
        guard let overlayJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        barcodeCaptureModule.updateOverlay(overlayJson: overlayJson,
                                           result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(updateBarcodeCaptureMode:)
    func updateBarcodeCaptureMode(command: CDVInvokedUrlCommand) {
        guard let modeJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        barcodeCaptureModule.updateModeFromJson(modeJson: modeJson,
                                                result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(applyBarcodeCaptureModeSettings:)
    func applyBarcodeCaptureModeSettings(command: CDVInvokedUrlCommand) {
        guard let modeSettingsJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        barcodeCaptureModule.applyModeSettings(modeSettingsJson: modeSettingsJson,
                                               result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(updateBarcodeSelectionBasicOverlay:)
    func updateBarcodeSelectionBasicOverlay(command: CDVInvokedUrlCommand) {
        guard let overlayJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        barcodeSelectionModule.updateBasicOverlay(overlayJson: overlayJson,
                                                  result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(updateBarcodeSelectionMode:)
    func updateBarcodeSelectionMode(command: CDVInvokedUrlCommand) {
        guard let modeJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        barcodeSelectionModule.updateModeFromJson(modeJson: modeJson,
                                                  result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(applyBarcodeSelectionModeSettings:)
    func applyBarcodeSelectionModeSettings(command: CDVInvokedUrlCommand) {
        guard let modeSettingsJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        barcodeSelectionModule.applyModeSettings(modeSettingsJson: modeSettingsJson,
                                               result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(updateBarcodeTrackingBasicOverlay:)
    func updateBarcodeTrackingBasicOverlay(command: CDVInvokedUrlCommand) {
        guard let overlayJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        barcodeTrackingModule.updateBasicOverlay(overlayJson: overlayJson,
                                                 result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(updateBarcodeTrackingAdvancedOverlay:)
    func updateBarcodeTrackingAdvancedOverlay(command: CDVInvokedUrlCommand) {
        guard let overlayJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        barcodeTrackingModule.updateAdvancedOverlay(overlayJson: overlayJson,
                                                    result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(updateBarcodeTrackingMode:)
    func updateBarcodeTrackingMode(command: CDVInvokedUrlCommand) {
        guard let modeJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        barcodeTrackingModule.updateModeFromJson(modeJson: modeJson,
                                                 result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(applyBarcodeTrackingModeSettings:)
    func applyBarcodeTrackingModeSettings(command: CDVInvokedUrlCommand) {
        guard let modeSettingsJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        barcodeTrackingModule.applyModeSettings(modeSettingsJson: modeSettingsJson,
                                                result: CordovaResult(commandDelegate, command.callbackId))
    }


    @objc(setTextForAimToSelectAutoHint:)
    func setTextForAimToSelectAutoHint(command: CDVInvokedUrlCommand) {
        guard let hintText = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        barcodeSelectionModule.setTextForAimToSelectAutoHint(text: hintText,
                                                             result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(removeAimedBarcodeBrushProvider:)
    func removeAimedBarcodeBrushProvider(command: CDVInvokedUrlCommand) {
        barcodeSelectionModule.removeAimedBarcodeBrushProvider()
        self.emitter.unregisterCallback(with: FrameworksBarcodeSelectionAimedBrushProviderEvent.brushForBarcode)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(setAimedBarcodeBrushProvider:)
    func setAimedBarcodeBrushProvider(command: CDVInvokedUrlCommand) {
        barcodeSelectionModule.setAimedBrushProvider(result: CordovaResult(commandDelegate, command.callbackId))
        self.emitter.registerCallback(with: FrameworksBarcodeSelectionAimedBrushProviderEvent.brushForBarcode, call: command)
    }

    @objc(selectAimedBarcode:)
    func selectAimedBarcode(command: CDVInvokedUrlCommand) {
        barcodeSelectionModule.selectAimedBarcode()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(increaseCountForBarcodes:)
    func increaseCountForBarcodes(command: CDVInvokedUrlCommand) {
        guard let json = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }

        barcodeSelectionModule.increaseCountForBarcodes(barcodesJson: json, result: CordovaResult(commandDelegate, command.callbackId))
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(finishBrushForAimedBarcodeCallback:)
    func finishBrushForAimedBarcodeCallback(command: CDVInvokedUrlCommand) {
        guard let json = command.defaultArgumentAsDictionary else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }

        let brush = json["brush"] as? String
        guard let selectionIdentifier = json["selectionIdentifier"] as? String else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }

        barcodeSelectionModule.finishBrushForAimedBarcode(brushJson: brush, selectionIdentifier: selectionIdentifier)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(removeTrackedBarcodeBrushProvider:)
    func removeTrackedBarcodeBrushProvider(command: CDVInvokedUrlCommand) {
        barcodeSelectionModule.removeTrackedBarcodeBrushProvider()
        self.emitter.unregisterCallback(with: FrameworksBarcodeSelectionTrackedBrushProviderEvent.brushForBarcode)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(setTrackedBarcodeBrushProvider:)
    func setTrackedBarcodeBrushProvider(command: CDVInvokedUrlCommand) {
        barcodeSelectionModule.setTrackedBrushProvider(result: CordovaResult(commandDelegate, command.callbackId))
        self.emitter.registerCallback(with: FrameworksBarcodeSelectionTrackedBrushProviderEvent.brushForBarcode, call: command)
    }

    @objc(finishBrushForTrackedBarcodeCallback:)
    func finishBrushForTrackedBarcodeCallback(command: CDVInvokedUrlCommand) {
        guard let json = command.defaultArgumentAsDictionary else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }

        let brush = json["brush"] as? String
        guard let selectionIdentifier = json["selectionIdentifier"] as? String else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }

        barcodeSelectionModule.finishBrushForTrackedBarcode(brushJson: brush, selectionIdentifier: selectionIdentifier)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    // Mark: Spark Scan

    @objc(updateSparkScanView:)
    func updateSparkScanView(command: CDVInvokedUrlCommand) {
        guard let viewJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        sparkScanModule.updateView(viewJson: viewJson, result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(createSparkScanView:)
    func createSparkScanView(command: CDVInvokedUrlCommand){

        guard let viewJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }

        dispatchMainSync {
            sparkScanModule.addViewToContainer(self.webView,
                                               jsonString: viewJson,
                                               result: CordovaResult(commandDelegate, command.callbackId))
        }
    }

    @objc(disposeSparkScanView:)
    func disposeSparkScanView(command: CDVInvokedUrlCommand) {
        dispatchMainSync {
            sparkScanModule.disposeView()
            commandDelegate.send(.success, callbackId: command.callbackId)
        }
    }

    @objc(showSparkScanView:)
    func showSparkScanView(command: CDVInvokedUrlCommand) {
        dispatchMainSync {
            guard let sparkScanView = self.sparkScanModule.sparkScanView else {
                commandDelegate.send(.failure(with: .noViewToBeShown), callbackId: command.callbackId)
                return
            }
            sparkScanView.isHidden = false
            commandDelegate.send(.success, callbackId: command.callbackId)
        }
    }

    @objc(hideSparkScanView:)
    func hideSparkScanView(command: CDVInvokedUrlCommand) {
        dispatchMainSync {
            guard let sparkScanView = self.sparkScanModule.sparkScanView else {
                commandDelegate.send(.failure(with: .noViewToBeShown), callbackId: command.callbackId)
                return
            }
            sparkScanView.isHidden = true
            commandDelegate.send(.success, callbackId: command.callbackId)
        }
    }

    @objc(emitSparkScanViewFeedback:)
    func emitSparkScanViewFeedback(command: CDVInvokedUrlCommand) {
        guard let feedbackJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        sparkScanModule.emitFeedback(feedbackJson: feedbackJson, result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(registerSparkScanViewListenerEvents:)
    func registerSparkScanViewListenerEvents(command: CDVInvokedUrlCommand) {
        sparkScanModule.addSparkScanViewUiListener()

        emitter.registerCallback(with: FrameworksSparkScanViewUIEvent.barcodeCountButtonTapped.rawValue, call: command)
        emitter.registerCallback(with: FrameworksSparkScanViewUIEvent.fastFindButtonTapped.rawValue, call: command)

        commandDelegate.send(.keepCallback, callbackId: command.callbackId)
    }

    @objc(unregisterListenerForViewEvents:)
    func unregisterSparkScanViewListenerEvents(command: CDVInvokedUrlCommand) {
        sparkScanModule.removeSparkScanViewUiListener()

        emitter.unregisterCallback(with: FrameworksSparkScanViewUIEvent.barcodeCountButtonTapped.rawValue)
        emitter.unregisterCallback(with: FrameworksSparkScanViewUIEvent.fastFindButtonTapped.rawValue)

        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(stopSparkScanViewScanning:)
    func stopSparkScanViewScanning(command: CDVInvokedUrlCommand) {
        sparkScanModule.onPause(result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(startSparkScanViewScanning:)
    func startSparkScanViewScanning(command: CDVInvokedUrlCommand) {
        sparkScanModule.startScanning(result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(pauseSparkScanViewScanning:)
    func pauseSparkScanViewScanning(command: CDVInvokedUrlCommand) {
        sparkScanModule.pauseScanning()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(prepareSparkScanViewScanning:)
    func prepareSparkScanViewScanning(command: CDVInvokedUrlCommand) {
        sparkScanModule.onResume(result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(resetSparkScanSession:)
    func resetSparkScanSession(command: CDVInvokedUrlCommand) {
        sparkScanModule.resetSession()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(updateSparkScanMode:)
    func updateSparkScanMode(command: CDVInvokedUrlCommand) {
        guard let modeJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }

        sparkScanModule.updateMode(modeJson: modeJson, result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(registerSparkScanListenerForEvents:)
    func registerSparkScanListenerForEvents(command: CDVInvokedUrlCommand) {
        sparkScanModule.addSparkScanListener()

        emitter.registerCallback(with: FrameworksSparkScanEvent.didScan.rawValue, call: command)
        emitter.registerCallback(with: FrameworksSparkScanEvent.didUpdate.rawValue, call: command)

        commandDelegate.send(.keepCallback, callbackId: command.callbackId)
    }

    @objc(unregisterSparkScanListenerForEvents:)
    func unregisterSparkScanListenerForEvents(command: CDVInvokedUrlCommand) {
        sparkScanModule.removeSparkScanListener()

        emitter.registerCallback(with: FrameworksSparkScanEvent.didScan.rawValue, call: command)
        emitter.registerCallback(with: FrameworksSparkScanEvent.didUpdate.rawValue, call: command)

        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(finishSparkScanDidUpdateSessionCallback:)
    func finishSparkScanDidUpdateSessionCallback(command: CDVInvokedUrlCommand) {
        var enabled = false
        if let payload = command.defaultArgumentAsDictionary, let value = payload["enabled"] as? Bool {
            enabled = value
        }
        sparkScanModule.finishDidUpdateSession(enabled: enabled)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(finishSparkScanDidScanCallback:)
    func finishSparkScanDidScanCallback(command: CDVInvokedUrlCommand) {
        var enabled = false
        if let payload = command.defaultArgumentAsDictionary, let value = payload["enabled"] as? Bool {
            enabled = value
        }
        sparkScanModule.finishDidScan(enabled: enabled)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(setSparkScanModeEnabledState:)
    func setSparkScanModeEnabledState(command: CDVInvokedUrlCommand) {
        var enabled = false
        if let payload = command.defaultArgumentAsDictionary, let value = payload["enabled"] as? Bool {
            enabled = value
        }
        sparkScanModule.setModeEnabled(enabled: enabled)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }

    @objc(addSparkScanFeedbackDelegate:)
    func addSparkScanFeedbackDelegate(command: CDVInvokedUrlCommand) {
        emitter.registerCallback(with: .feedbackForBarcode, call: command)
        sparkScanModule.addFeedbackDelegate(result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(removeSparkScanFeedbackDelegate:)
    func removeSparkScanFeedbackDelegate(command: CDVInvokedUrlCommand) {
        emitter.unregisterCallback(with: .feedbackForBarcode)
        sparkScanModule.removeFeedbackDelegate(result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(submitSparkScanFeedbackForBarcode:)
    func submitSparkScanFeedbackForBarcode(command: CDVInvokedUrlCommand) {
        sparkScanModule.submitFeedbackForBarcode(
            feedbackJson: command.defaultArgumentAsString,
            result: CordovaResult(commandDelegate, command.callbackId))
    }

    @objc(showToast:)
    func showToast(command: CDVInvokedUrlCommand) {
        guard let text = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        sparkScanModule.showToast(text: text, result: CordovaResult(commandDelegate, command.callbackId))
    }
    
    // MARK: Barcode Count
    
    @objc(updateMode:)
    func updateMode(command: CDVInvokedUrlCommand) {
        guard let modeJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        barcodeCountModule.updateBarcodeCount(modeJson: modeJson)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }
    
    @objc(resetBarcodeCount:)
    func resetBarcodeCount(command: CDVInvokedUrlCommand) {
        barcodeCountModule.resetBarcodeCount()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }
    
    @objc(registerBarcodeCountListener:)
    func registerBarcodeCountListener(command: CDVInvokedUrlCommand) {
        emitter.registerCallback(with: FrameworksBarcodeCountListener.Constants.barcodeScanned, call: command)
        barcodeCountModule.addBarcodeCountListener()
        commandDelegate.send(.keepCallback, callbackId: command.callbackId)
    }
    
    @objc(unregisterBarcodeCountListener:)
    func unregisterBarcodeCountListener(command: CDVInvokedUrlCommand) {
        emitter.unregisterCallback(with: FrameworksBarcodeCountListener.Constants.barcodeScanned)
        barcodeCountModule.removeBarcodeCountListener()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }
    
    @objc(setBarcodeCountModeEnabledState:)
    func setBarcodeCountModeEnabledState(command: CDVInvokedUrlCommand) {
        let enabled = (command.defaultArgument as? Bool) ?? (command.defaultArgument == nil ? true : false)
        
        barcodeCountModule.setModeEnabled(enabled: enabled)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }
    
    @objc(finishBarcodeCountListenerOnScan:)
    func finishBarcodeCountListenerOnScan(command: CDVInvokedUrlCommand) {
        barcodeCountModule.finishOnScan(enabled: true)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }
    
    @objc(startScanningPhase:)
    func startScanningPhase(command: CDVInvokedUrlCommand) {
        barcodeCountModule.startScanningPhase()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }
    
    @objc(endScanningPhase:)
    func endScanningPhase(command: CDVInvokedUrlCommand) {
        barcodeCountModule.endScanningPhase()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }
    
    @objc(setBarcodeCountCaptureList:)
    func setBarcodeCountCaptureList(command: CDVInvokedUrlCommand) {
        guard let barcodesJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        barcodeCountModule.setBarcodeCountCaptureList(barcodesJson: barcodesJson)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }
    
    @objc(getSpatialMap:)
    func getSpatialMap(command: CDVInvokedUrlCommand) {
        let spacialMap = barcodeCountModule.getSpatialMap()
        commandDelegate.send(.success(message: spacialMap?.jsonString), callbackId: command.callbackId)
    }
    
    @objc(getSpatialMapWithHints:)
    func getSpatialMapWithHints(command: CDVInvokedUrlCommand) {
        if let hints = command.defaultArgumentAsDictionary,
           let expectedNumberOfRows = hints["expectedNumberOfRows"] as? Int,
           let expectedNumberOfColumns = hints["expectedNumberOfColumns"] as? Int {
            
            let spacialMap = barcodeCountModule.getSpatialMap(expectedNumberOfRows: expectedNumberOfRows, expectedNumberOfColumns: expectedNumberOfColumns)
        
            commandDelegate.send(.success(message: spacialMap?.jsonString), callbackId: command.callbackId)
        } else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
        }
    }
    
    @objc(resetBarcodeCountSession:)
    func resetBarcodeCountSession(command: CDVInvokedUrlCommand) {
        barcodeCountModule.resetBarcodeCountSession(frameSequenceId: nil)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }
    
    @objc(updateBarcodeCountView:)
    func updateBarcodeCountView(command: CDVInvokedUrlCommand) {
        guard let viewJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        barcodeCountModule.updateBarcodeCountView(viewJson: viewJson)
        commandDelegate.send(.success, callbackId: command.callbackId)
    }
    
    @objc(createBarcodeCountView:)
    func createBarcodeCountView(command: CDVInvokedUrlCommand) {
        guard let viewJson = command.defaultArgumentAsString else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }
        
        barcodeCountViewConstraints.captureView?.removeFromSuperview()
        barcodeCountViewConstraints.captureView = nil
        
        barcodeCountModule.addViewFromJson(parent: viewController.view, viewJson: viewJson)
        
        if let barcodeCountView = barcodeCountModule.barcodeCountView {
            barcodeCountView.isHidden = true
            barcodeCountView.translatesAutoresizingMaskIntoConstraints = false
            barcodeCountViewConstraints.captureView = barcodeCountView
        }
        
        commandDelegate.send(.success, callbackId: command.callbackId)
    }
    
    @objc(registerBarcodeCountViewUiListener:)
    func registerBarcodeCountViewUiListener(command: CDVInvokedUrlCommand) {
        emitter.registerCallback(with: FrameworksBarcodeCountViewUIListener.Constants.exitButtonTapped, call: command)
        emitter.registerCallback(with: FrameworksBarcodeCountViewUIListener.Constants.listButtonTapped, call: command)
        emitter.registerCallback(with: FrameworksBarcodeCountViewUIListener.Constants.singleScanButtonTapped, call: command)
        
        barcodeCountModule.addBarcodeCountViewUiListener()
        
        commandDelegate.send(.keepCallback, callbackId: command.callbackId)
    }
    
    @objc(unregisterBarcodeCountViewUiListener:)
    func unregisterBarcodeCountViewUiListener(command: CDVInvokedUrlCommand) {
        emitter.unregisterCallback(with: FrameworksBarcodeCountViewUIListener.Constants.exitButtonTapped)
        emitter.unregisterCallback(with: FrameworksBarcodeCountViewUIListener.Constants.listButtonTapped)
        emitter.unregisterCallback(with: FrameworksBarcodeCountViewUIListener.Constants.singleScanButtonTapped)
        
        barcodeCountModule.removeBarcodeCountViewUiListener()
        
        commandDelegate.send(.success, callbackId: command.callbackId)
    }
    
    @objc(registerBarcodeCountViewListener:)
    func registerBarcodeCountViewListener(command: CDVInvokedUrlCommand) {
        emitter.registerCallback(with: BarcodeCountViewListenerEvent.brushForRecognizedBarcode.rawValue, call: command)
        emitter.registerCallback(with: BarcodeCountViewListenerEvent.brushForRecognizedBarcodeNotInList.rawValue, call: command)
        emitter.registerCallback(with: BarcodeCountViewListenerEvent.brushForUnrecognizedBarcode.rawValue, call: command)
        emitter.registerCallback(with: BarcodeCountViewListenerEvent.didTapFilteredBarcode.rawValue, call: command)
        emitter.registerCallback(with: BarcodeCountViewListenerEvent.didTapRecognizedBarcode.rawValue, call: command)
        emitter.registerCallback(with: BarcodeCountViewListenerEvent.didTapRecognizedBarcodeNotInList.rawValue, call: command)
        emitter.registerCallback(with: BarcodeCountViewListenerEvent.didTapUnrecognizedBarcode.rawValue, call: command)
        
        barcodeCountModule.addBarcodeCountViewListener()
        
        commandDelegate.send(.keepCallback, callbackId: command.callbackId)
    }
    
    @objc(unregisterBarcodeCountViewListener:)
    func unregisterBarcodeCountViewListener(command: CDVInvokedUrlCommand) {
        emitter.unregisterCallback(with: BarcodeCountViewListenerEvent.brushForRecognizedBarcode.rawValue)
        emitter.unregisterCallback(with: BarcodeCountViewListenerEvent.brushForRecognizedBarcodeNotInList.rawValue)
        emitter.unregisterCallback(with: BarcodeCountViewListenerEvent.brushForUnrecognizedBarcode.rawValue)
        emitter.unregisterCallback(with: BarcodeCountViewListenerEvent.didTapFilteredBarcode.rawValue)
        emitter.unregisterCallback(with: BarcodeCountViewListenerEvent.didTapRecognizedBarcode.rawValue)
        emitter.unregisterCallback(with: BarcodeCountViewListenerEvent.didTapRecognizedBarcodeNotInList.rawValue)
        emitter.unregisterCallback(with: BarcodeCountViewListenerEvent.didTapUnrecognizedBarcode.rawValue)
        
        barcodeCountModule.removeBarcodeCountViewListener()
        
        commandDelegate.send(.success, callbackId: command.callbackId)
    }
    
    @objc(clearBarcodeCountViewHighlights:)
    func clearBarcodeCountViewHighlights(command: CDVInvokedUrlCommand) {
        barcodeCountModule.clearHighlights()
        commandDelegate.send(.success, callbackId: command.callbackId)
    }
    
    @objc(setBarcodeCountViewPositionAndSize:)
    func setBarcodeCountViewPositionAndSize(command: CDVInvokedUrlCommand) {
        guard let viewPositionAndSizeJSON = try? ViewPositionAndSizeJSON.fromCommand(command) else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
            return
        }

        barcodeCountViewConstraints.updatePositionAndSize(fromJSON: viewPositionAndSizeJSON)

        if viewPositionAndSizeJSON.shouldBeUnderWebView {
            // Make the WebView transparent, so we can see views behind
            webView.isOpaque = false
            webView.backgroundColor = .clear
            webView.scrollView.backgroundColor = .clear
        }

        commandDelegate.send(.success, callbackId: command.callbackId)
    }
    
    @objc(showBarcodeCountView:)
    func showBarcodeCountView(command: CDVInvokedUrlCommand) {
        barcodeCountViewConstraints.captureView?.isHidden = false
        commandDelegate.send(.success, callbackId: command.callbackId)
    }
    
    @objc(hideBarcodeCountView:)
    func hideBarcodeCountView(command: CDVInvokedUrlCommand) {
        barcodeCountViewConstraints.captureView?.isHidden = true
        commandDelegate.send(.success, callbackId: command.callbackId)
    }
    
    @objc(finishBarcodeCountViewListenerBrushForRecognizedBarcode:)
    func finishBarcodeCountViewListenerBrushForRecognizedBarcode(command: CDVInvokedUrlCommand) {
        if let hints = command.defaultArgumentAsDictionary,
           let brushJson = hints["brush"] as? String,
           let trackedBarcodeId = hints["trackedBarcodeID"] as? Int {
            
            let brush = Brush(jsonString: brushJson)
            
            barcodeCountModule.finishBrushForRecognizedBarcodeEvent(brush: brush, trackedBarcodeId: trackedBarcodeId)
        
            commandDelegate.send(.success, callbackId: command.callbackId)
        } else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
        }
    }
    
    @objc(finishBarcodeCountViewListenerBrushForRecognizedBarcodeNotInList:)
    func finishBarcodeCountViewListenerBrushForRecognizedBarcodeNotInList(command: CDVInvokedUrlCommand) {
        if let hints = command.defaultArgumentAsDictionary,
           let brushJson = hints["brush"] as? String,
           let trackedBarcodeId = hints["trackedBarcodeID"] as? Int {
            
            let brush = Brush(jsonString: brushJson)
            
            barcodeCountModule.finishBrushForRecognizedBarcodeNotInListEvent(brush: brush, trackedBarcodeId: trackedBarcodeId)
        
            commandDelegate.send(.success, callbackId: command.callbackId)
        } else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
        }
    }
    
    @objc(finishBarcodeCountViewListenerOnBrushForUnrecognizedBarcode:)
    func finishBarcodeCountViewListenerOnBrushForUnrecognizedBarcode(command: CDVInvokedUrlCommand) {
        if let hints = command.defaultArgumentAsDictionary,
           let brushJson = hints["brush"] as? String,
           let trackedBarcodeId = hints["trackedBarcodeID"] as? Int {
            
            let brush = Brush(jsonString: brushJson)
            
            barcodeCountModule.finishBrushForUnrecognizedBarcodeEvent(brush: brush, trackedBarcodeId: trackedBarcodeId)
        
            commandDelegate.send(.success, callbackId: command.callbackId)
        } else {
            commandDelegate.send(.failure(with: .invalidJSON), callbackId: command.callbackId)
        }
    }
}
