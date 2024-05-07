/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2019- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.barcode

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
import android.view.View
import android.view.ViewGroup
import com.scandit.datacapture.barcode.spark.serialization.SparkScanDeserializer
import com.scandit.datacapture.barcode.spark.serialization.SparkScanViewDeserializer
import com.scandit.datacapture.cordova.barcode.data.SerializableAdvancedOverlayViewActionData
import com.scandit.datacapture.cordova.barcode.handlers.BarcodeCountViewHandler
import com.scandit.datacapture.cordova.barcode.handlers.BarcodeFindViewHandler
import com.scandit.datacapture.cordova.barcode.handlers.BarcodePickViewHandler
import com.scandit.datacapture.cordova.core.ScanditCaptureCore
import com.scandit.datacapture.cordova.core.data.ResizeAndMoveInfo
import com.scandit.datacapture.cordova.core.errors.JsonParseError
import com.scandit.datacapture.cordova.core.utils.CordovaEventEmitter
import com.scandit.datacapture.cordova.core.utils.CordovaResult
import com.scandit.datacapture.cordova.core.utils.CordovaResultKeepCallback
import com.scandit.datacapture.cordova.core.utils.PluginMethod
import com.scandit.datacapture.cordova.core.utils.defaultArgumentAsString
import com.scandit.datacapture.cordova.core.utils.optBoolean
import com.scandit.datacapture.cordova.core.utils.optString
import com.scandit.datacapture.cordova.core.utils.successAndKeepCallback
import com.scandit.datacapture.core.ui.style.BrushDeserializer
import com.scandit.datacapture.frameworks.barcode.BarcodeModule
import com.scandit.datacapture.frameworks.barcode.capture.BarcodeCaptureModule
import com.scandit.datacapture.frameworks.barcode.capture.listeners.FrameworksBarcodeCaptureListener
import com.scandit.datacapture.frameworks.barcode.count.BarcodeCountModule
import com.scandit.datacapture.frameworks.barcode.count.listeners.FrameworksBarcodeCountCaptureListListener
import com.scandit.datacapture.frameworks.barcode.count.listeners.FrameworksBarcodeCountListener
import com.scandit.datacapture.frameworks.barcode.count.listeners.FrameworksBarcodeCountViewListener
import com.scandit.datacapture.frameworks.barcode.count.listeners.FrameworksBarcodeCountViewUiListener
import com.scandit.datacapture.frameworks.barcode.find.BarcodeFindModule
import com.scandit.datacapture.frameworks.barcode.find.listeners.FrameworksBarcodeFindListener
import com.scandit.datacapture.frameworks.barcode.find.listeners.FrameworksBarcodeFindViewUiListener
import com.scandit.datacapture.frameworks.barcode.find.transformer.FrameworksBarcodeFindTransformer
import com.scandit.datacapture.frameworks.barcode.pick.BarcodePickModule
import com.scandit.datacapture.frameworks.barcode.pick.listeners.FrameworksBarcodePickActionListener
import com.scandit.datacapture.frameworks.barcode.pick.listeners.FrameworksBarcodePickAsyncMapperProductProviderCallback
import com.scandit.datacapture.frameworks.barcode.pick.listeners.FrameworksBarcodePickScanningListener
import com.scandit.datacapture.frameworks.barcode.pick.listeners.FrameworksBarcodePickViewListener
import com.scandit.datacapture.frameworks.barcode.pick.listeners.FrameworksBarcodePickViewUiListener
import com.scandit.datacapture.frameworks.barcode.selection.BarcodeSelectionModule
import com.scandit.datacapture.frameworks.barcode.selection.listeners.FrameworksBarcodeSelectionAimedBrushProvider
import com.scandit.datacapture.frameworks.barcode.selection.listeners.FrameworksBarcodeSelectionListener
import com.scandit.datacapture.frameworks.barcode.selection.listeners.FrameworksBarcodeSelectionTrackedBrushProvider
import com.scandit.datacapture.frameworks.barcode.spark.SparkScanModule
import com.scandit.datacapture.frameworks.barcode.spark.delegates.FrameworksSparkScanFeedbackDelegate
import com.scandit.datacapture.frameworks.barcode.spark.listeners.FrameworksSparkScanListener
import com.scandit.datacapture.frameworks.barcode.spark.listeners.FrameworksSparkScanViewUiListener
import com.scandit.datacapture.frameworks.barcode.tracking.BarcodeTrackingModule
import com.scandit.datacapture.frameworks.barcode.tracking.listeners.FrameworksBarcodeTrackingAdvancedOverlayListener
import com.scandit.datacapture.frameworks.barcode.tracking.listeners.FrameworksBarcodeTrackingBasicOverlayListener
import com.scandit.datacapture.frameworks.barcode.tracking.listeners.FrameworksBarcodeTrackingListener
import com.scandit.datacapture.frameworks.core.extensions.getOrNull
import com.scandit.datacapture.frameworks.core.utils.DefaultMainThread
import com.scandit.datacapture.frameworks.core.utils.MainThread
import org.apache.cordova.CallbackContext
import org.apache.cordova.CordovaPlugin
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.lang.reflect.Method

class ScanditBarcodeCapture :
    CordovaPlugin() {

    private val eventEmitter = CordovaEventEmitter()

    private val mainThread: MainThread = DefaultMainThread.getInstance()

    private val barcodeModule = BarcodeModule()
    private val barcodeCaptureModule = BarcodeCaptureModule(
        FrameworksBarcodeCaptureListener(eventEmitter)
    )
    private val barcodeTrackingModule = BarcodeTrackingModule(
        FrameworksBarcodeTrackingListener(eventEmitter),
        FrameworksBarcodeTrackingBasicOverlayListener(eventEmitter),
        FrameworksBarcodeTrackingAdvancedOverlayListener(eventEmitter)
    )
    private val barcodeSelectionModule = BarcodeSelectionModule(
        FrameworksBarcodeSelectionListener(eventEmitter),
        FrameworksBarcodeSelectionAimedBrushProvider(eventEmitter),
        FrameworksBarcodeSelectionTrackedBrushProvider(eventEmitter)
    )

    private val barcodeFindModule = BarcodeFindModule(
        FrameworksBarcodeFindListener(eventEmitter),
        FrameworksBarcodeFindViewUiListener(eventEmitter),
        FrameworksBarcodeFindTransformer(eventEmitter)
    )
    private val barcodeFindViewHandler: BarcodeFindViewHandler = BarcodeFindViewHandler()

    private val barcodePickModule = BarcodePickModule(
        eventEmitter,
        FrameworksBarcodePickActionListener(eventEmitter),
        FrameworksBarcodePickScanningListener(eventEmitter),
        FrameworksBarcodePickViewListener(eventEmitter),
        FrameworksBarcodePickViewUiListener(eventEmitter)
    )
    private val barcodePickViewHandler: BarcodePickViewHandler = BarcodePickViewHandler()

    private val sparkScanModule: SparkScanModule = SparkScanModule(
        FrameworksSparkScanListener(eventEmitter),
        FrameworksSparkScanViewUiListener(eventEmitter),
        FrameworksSparkScanFeedbackDelegate(eventEmitter),
        SparkScanDeserializer(),
        SparkScanViewDeserializer()
    )

    private val barcodeCountModule = BarcodeCountModule(
        FrameworksBarcodeCountListener(eventEmitter),
        FrameworksBarcodeCountCaptureListListener(eventEmitter),
        FrameworksBarcodeCountViewListener(eventEmitter),
        FrameworksBarcodeCountViewUiListener(eventEmitter)
    )
    private val barcodeCountViewHandler: BarcodeCountViewHandler = BarcodeCountViewHandler()

    private lateinit var exposedFunctionsToJs: Map<String, Method>

    private var lastBarcodeCaptureEnabledState: Boolean = false
    private var lastBarcodeTrackingEnabledState: Boolean = false
    private var lastBarcodeSelectionEnabledState: Boolean = false
    private var lastBarcodeFindEnabledState: Boolean = false
    private var lastSparkScanEnabledState: Boolean = false
    private var lastBarcodeCountEnabledState: Boolean = false

    override fun pluginInitialize() {
        barcodeFindViewHandler.attachWebView(webView.view, cordova.activity)
        barcodePickViewHandler.attachWebView(webView.view, cordova.activity)
        super.pluginInitialize()

        ScanditCaptureCore.addPlugin(serviceName)
        barcodeModule.onCreate(cordova.context)
        barcodeCaptureModule.onCreate(cordova.context)
        barcodeTrackingModule.onCreate(cordova.context)
        barcodeSelectionModule.onCreate(cordova.context)
        barcodeFindModule.onCreate(cordova.context)
        barcodePickModule.onCreate(cordova.context)
        sparkScanModule.onCreate(cordova.context)
        barcodeCountModule.onCreate(cordova.context)

        // Init functions exposed to JS
        exposedFunctionsToJs =
            this.javaClass.methods.filter { it.getAnnotation(PluginMethod::class.java) != null }
                .associateBy { it.name }
    }

    override fun onStop() {
        lastBarcodeCaptureEnabledState = barcodeCaptureModule.isModeEnabled()
        barcodeCaptureModule.setModeEnabled(false)

        lastBarcodeTrackingEnabledState = barcodeTrackingModule.isModeEnabled()
        barcodeTrackingModule.setModeEnabled(false)

        lastBarcodeSelectionEnabledState = barcodeSelectionModule.isModeEnabled()
        barcodeSelectionModule.setModeEnabled(false)

        lastBarcodeFindEnabledState = barcodeFindModule.isModeEnabled()
        barcodeFindModule.setModeEnabled(false)

        lastSparkScanEnabledState = sparkScanModule.isModeEnabled()
        sparkScanModule.setModeEnabled(false)

        lastBarcodeCountEnabledState = barcodeCountModule.isModeEnabled()
        barcodeCountModule.setModeEnabled(false)
    }

    override fun onStart() {
        barcodeCaptureModule.setModeEnabled(lastBarcodeCaptureEnabledState)
        barcodeTrackingModule.setModeEnabled(lastBarcodeTrackingEnabledState)
        barcodeSelectionModule.setModeEnabled(lastBarcodeSelectionEnabledState)
        barcodeFindModule.setModeEnabled(lastBarcodeFindEnabledState)
        barcodeCountModule.setModeEnabled(lastBarcodeCountEnabledState)
    }

    override fun onPause(multitasking: Boolean) {
        super.onPause(multitasking)
        barcodePickModule.viewOnPause()
    }

    override fun onResume(multitasking: Boolean) {
        super.onResume(multitasking)
        barcodePickModule.viewOnResume()
    }

    override fun onReset() {
        destroy()
        pluginInitialize()
    }

    override fun onDestroy() {
        destroy()
        super.onDestroy()
    }

    private fun destroy() {
        barcodeModule.onDestroy()
        barcodeCaptureModule.onDestroy()
        barcodeTrackingModule.onDestroy()
        barcodeSelectionModule.onDestroy()
        barcodeFindModule.onDestroy()
        barcodePickModule.onDestroy()
        barcodeCountModule.onDestroy()
    }

    override fun execute(
        action: String,
        args: JSONArray,
        callbackContext: CallbackContext
    ): Boolean {
        return if (exposedFunctionsToJs.contains(action)) {
            exposedFunctionsToJs[action]?.invoke(this, args, callbackContext)
            true
        } else {
            false
        }
    }

    @PluginMethod
    fun getDefaults(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        val default = JSONObject(
            barcodeModule.getDefaults() +
                    mapOf("BarcodeCapture" to barcodeCaptureModule.getDefaults()) +
                    mapOf("BarcodeTracking" to barcodeTrackingModule.getDefaults()) +
                    mapOf("BarcodeSelection" to barcodeSelectionModule.getDefaults()) +
                    mapOf("BarcodeFind" to barcodeFindModule.getDefaults()) +
                    mapOf("BarcodePick" to barcodePickModule.getDefaults()) +
                    mapOf("SparkScan" to sparkScanModule.getDefaults()) +
                    mapOf("BarcodeCount" to barcodeCountModule.getDefaults())
        )

        callbackContext.success(default)
    }

    @PluginMethod
    fun subscribeBarcodeCaptureListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(
            FrameworksBarcodeCaptureListener.ON_SESSION_UPDATED_EVENT_NAME,
            callbackContext
        )
        eventEmitter.registerCallback(
            FrameworksBarcodeCaptureListener.ON_BARCODE_SCANNED_EVENT_NAME,
            callbackContext
        )
        barcodeCaptureModule.addListener()
        callbackContext.successAndKeepCallback()
    }

    @PluginMethod
    fun unsubscribeBarcodeCaptureListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.unregisterCallback(
            FrameworksBarcodeCaptureListener.ON_SESSION_UPDATED_EVENT_NAME
        )
        eventEmitter.unregisterCallback(
            FrameworksBarcodeCaptureListener.ON_BARCODE_SCANNED_EVENT_NAME
        )
        barcodeCaptureModule.removeListener()
        callbackContext.success()
    }

    @PluginMethod
    fun subscribeBarcodeTrackingListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(
            FrameworksBarcodeTrackingListener.ON_SESSION_UPDATED_EVENT_NAME,
            callbackContext
        )
        barcodeTrackingModule.addBarcodeTrackingListener()
        callbackContext.successAndKeepCallback()
    }

    @PluginMethod
    fun unregisterBarcodeTrackingListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.unregisterCallback(
            FrameworksBarcodeTrackingListener.ON_SESSION_UPDATED_EVENT_NAME
        )

        barcodeTrackingModule.removeBarcodeTrackingListener()
        callbackContext.success()
    }

    @PluginMethod
    fun subscribeBarcodeSelectionListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(
            FrameworksBarcodeSelectionListener.ON_SESSION_UPDATE_EVENT_NAME,
            callbackContext
        )
        eventEmitter.registerCallback(
            FrameworksBarcodeSelectionListener.ON_SELECTION_UPDATE_EVENT_NAME,
            callbackContext
        )
        barcodeSelectionModule.addListener()
        callbackContext.successAndKeepCallback()
    }

    @PluginMethod
    fun unsubscribeBarcodeSelectionListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.unregisterCallback(
            FrameworksBarcodeSelectionListener.ON_SESSION_UPDATE_EVENT_NAME
        )
        eventEmitter.unregisterCallback(
            FrameworksBarcodeSelectionListener.ON_SELECTION_UPDATE_EVENT_NAME
        )
        barcodeSelectionModule.removeListener()
        callbackContext.success()
    }

    @PluginMethod
    fun finishBarcodeCaptureDidUpdateSession(args: JSONArray, callbackContext: CallbackContext) {
        barcodeCaptureModule.finishDidUpdateSession(args.optBoolean("enabled", true))
        callbackContext.successAndKeepCallback()
    }

    @PluginMethod
    fun finishBarcodeCaptureDidScan(args: JSONArray, callbackContext: CallbackContext) {
        barcodeCaptureModule.finishDidScan(args.optBoolean("enabled", true))
        callbackContext.successAndKeepCallback()
    }

    @PluginMethod
    fun finishBarcodeSelectionDidUpdateSelection(
        args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodeSelectionModule.finishDidSelect(args.optBoolean("enabled", true))
        callbackContext.successAndKeepCallback()
    }

    @PluginMethod
    fun finishBarcodeSelectionDidUpdateSession(args: JSONArray, callbackContext: CallbackContext) {
        barcodeSelectionModule.finishDidUpdateSession(args.optBoolean("enabled", true))
        callbackContext.successAndKeepCallback()
    }

    @PluginMethod
    fun finishBarcodeTrackingDidUpdateSession(args: JSONArray, callbackContext: CallbackContext) {
        barcodeTrackingModule.finishDidUpdateSession(args.optBoolean("enabled", true))
        callbackContext.successAndKeepCallback()
    }

    @PluginMethod
    fun subscribeBarcodeTrackingBasicOverlayListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(
            FrameworksBarcodeTrackingBasicOverlayListener.EVENT_ON_TRACKED_BARCODE_TAPPED,
            callbackContext
        )
        eventEmitter.registerCallback(
            FrameworksBarcodeTrackingBasicOverlayListener.EVENT_SET_BRUSH_FOR_TRACKED_BARCODE,
            callbackContext
        )
        barcodeTrackingModule.addBasicOverlayListener()
        callbackContext.successAndKeepCallback()
    }

    @PluginMethod
    fun unregisterBarcodeTrackingBasicOverlayListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.unregisterCallback(
            FrameworksBarcodeTrackingBasicOverlayListener.EVENT_ON_TRACKED_BARCODE_TAPPED
        )
        eventEmitter.unregisterCallback(
            FrameworksBarcodeTrackingBasicOverlayListener.EVENT_SET_BRUSH_FOR_TRACKED_BARCODE
        )
        barcodeTrackingModule.removeBasicOverlayListener()
        callbackContext.success()
    }

    @PluginMethod
    fun setBrushForTrackedBarcode(args: JSONArray, callbackContext: CallbackContext) {
        try {
            val payload = args.getJSONObject(0)
            barcodeTrackingModule.setBasicOverlayBrushForTrackedBarcode(
                payload.toString()
            )

            callbackContext.success()
        } catch (e: JSONException) {
            callbackContext.error(JsonParseError(e.message).toString())
        } catch (e: RuntimeException) {
            callbackContext.error(JsonParseError(e.message).toString())
        }
    }

    @PluginMethod
    fun clearTrackedBarcodeBrushes(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodeTrackingModule.clearBasicOverlayTrackedBarcodeBrushes()
        callbackContext.success()
    }

    @PluginMethod
    fun subscribeBarcodeTrackingAdvancedOverlayListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(
            FrameworksBarcodeTrackingAdvancedOverlayListener.EVENT_ANCHOR_FOR_TRACKED_BARCODE,
            callbackContext
        )
        eventEmitter.registerCallback(
            FrameworksBarcodeTrackingAdvancedOverlayListener.EVENT_OFFSET_FOR_TRACKED_BARCODE,
            callbackContext
        )
        eventEmitter.registerCallback(
            FrameworksBarcodeTrackingAdvancedOverlayListener.EVENT_WIDGET_FOR_TRACKED_BARCODE,
            callbackContext
        )
        eventEmitter.registerCallback(
            FrameworksBarcodeTrackingAdvancedOverlayListener.EVENT_DID_TAP_VIEW_FOR_TRACKED_BARCODE,
            callbackContext
        )
        barcodeTrackingModule.addAdvancedOverlayListener()
        callbackContext.successAndKeepCallback()
    }

    @PluginMethod
    fun unregisterBarcodeTrackingAdvancedOverlayListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.unregisterCallback(
            FrameworksBarcodeTrackingAdvancedOverlayListener.EVENT_ANCHOR_FOR_TRACKED_BARCODE
        )
        eventEmitter.unregisterCallback(
            FrameworksBarcodeTrackingAdvancedOverlayListener.EVENT_OFFSET_FOR_TRACKED_BARCODE
        )
        eventEmitter.unregisterCallback(
            FrameworksBarcodeTrackingAdvancedOverlayListener.EVENT_WIDGET_FOR_TRACKED_BARCODE
        )
        eventEmitter.unregisterCallback(
            FrameworksBarcodeTrackingAdvancedOverlayListener.EVENT_DID_TAP_VIEW_FOR_TRACKED_BARCODE
        )
        barcodeTrackingModule.removeAdvancedOverlayListener()
        callbackContext.success()
    }

    @PluginMethod
    fun setViewForTrackedBarcode(args: JSONArray, callbackContext: CallbackContext) {
        try {
            val data = SerializableAdvancedOverlayViewActionData(
                args.getJSONObject(0)
            )

            val image = getBitmapFromBase64String(data.view?.data)

            mainThread.runOnMainThread {
                val view = barcodeTrackingModule.getTrackedBarcodeViewFromBitmap(
                    data.trackedBarcodeId,
                    image
                ) ?: return@runOnMainThread

                view.layoutParams = ViewGroup.MarginLayoutParams(
                    data.view?.options?.width ?: ViewGroup.LayoutParams.WRAP_CONTENT,
                    data.view?.options?.height ?: ViewGroup.LayoutParams.WRAP_CONTENT
                )

                barcodeTrackingModule.setViewForTrackedBarcode(
                    view,
                    data.trackedBarcodeId,
                    data.sessionFrameSequenceId
                )
            }

            callbackContext.success()
        } catch (e: JSONException) {
            println(e)
            callbackContext.error(JsonParseError(e.message).toString())
        } catch (e: RuntimeException) {
            callbackContext.error(JsonParseError(e.message).toString())
        }
    }

    private fun getBitmapFromBase64String(string: String?): Bitmap? {
        string ?: return null

        val index = string.indexOf(",")
        return try {
            val trimmedString = string.removeRange(0, index)
            val bytes = Base64.decode(trimmedString, Base64.DEFAULT)
            BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
        } catch (e: Exception) {
            println(e)
            null
        }
    }

    @PluginMethod
    fun setOffsetForTrackedBarcode(args: JSONArray, callbackContext: CallbackContext) {
        try {
            val payload = args.getJSONObject(0)
            barcodeTrackingModule.setOffsetForTrackedBarcode(
                hashMapOf(
                    "offset" to payload.getString("offset"),
                    "identifier" to payload.getInt("trackedBarcodeID"),
                    "sessionFrameSequenceID" to if (payload.has("sessionFrameSequenceID")) {
                        payload.getLong("sessionFrameSequenceID")
                    } else null
                )
            )

            callbackContext.success()
        } catch (e: JSONException) {
            callbackContext.error(JsonParseError(e.message).toString())
        } catch (e: RuntimeException) {
            callbackContext.error(JsonParseError(e.message).toString())
        }
    }

    @PluginMethod
    fun setAnchorForTrackedBarcode(args: JSONArray, callbackContext: CallbackContext) {
        try {
            val argument = args.getJSONObject(0)
            val payload = hashMapOf<String, Any?>(
                "anchor" to argument.getString("anchor"),
                "identifier" to argument.getInt("trackedBarcodeID"),
                "sessionFrameSequenceID" to if (argument.has("sessionFrameSequenceID")) {
                    argument.getLong("sessionFrameSequenceID")
                } else null
            )
            barcodeTrackingModule.setAnchorForTrackedBarcode(payload)

            callbackContext.success()
        } catch (e: JSONException) {
            callbackContext.error(JsonParseError(e.message).toString())
        } catch (e: RuntimeException) {
            callbackContext.error(JsonParseError(e.message).toString())
        }
    }

    @PluginMethod
    fun clearTrackedBarcodeViews(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodeTrackingModule.clearAdvancedOverlayTrackedBarcodeViews()
        callbackContext.success()
    }


    @PluginMethod
    fun getCountForBarcodeInBarcodeSelectionSession(
        args: JSONArray,
        callbackContext: CallbackContext
    ) {
        val selectionCount = barcodeSelectionModule.getBarcodeCount(args.defaultArgumentAsString)
        callbackContext.success(selectionCount)
    }

    @PluginMethod
    fun resetBarcodeCaptureSession(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodeCaptureModule.resetSession(null)
        callbackContext.success()
    }

    @PluginMethod
    fun resetBarcodeTrackingSession(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodeTrackingModule.resetSession(null)
        callbackContext.success()
    }

    @PluginMethod
    fun resetBarcodeSelectionSession(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodeSelectionModule.resetLatestSession(null)
        callbackContext.success()
    }

    @PluginMethod
    fun resetBarcodeSelection(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodeSelectionModule.resetSelection()
        callbackContext.success()
    }

    @PluginMethod
    fun unfreezeCameraInBarcodeSelection(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodeSelectionModule.unfreezeCamera()
        callbackContext.success()
    }

    @PluginMethod
    fun selectAimedBarcode(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodeSelectionModule.selectAimedBarcode()
        callbackContext.success()
    }

    @PluginMethod
    fun increaseCountForBarcodes(args: JSONArray, callbackContext: CallbackContext) {
        barcodeSelectionModule.increaseCountForBarcodes(
            args.defaultArgumentAsString,
            CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun unselectBarcodes(args: JSONArray, callbackContext: CallbackContext) {
        barcodeSelectionModule.unselectBarcodes(
            args.defaultArgumentAsString,
            CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun setSelectBarcodeEnabled(args: JSONArray, callbackContext: CallbackContext) {
        val argument = args.getJSONObject(0)
        val enabled = argument.optBoolean("enabled", false)
        val barcodeJson = argument["barcode"].toString()
        barcodeSelectionModule.setSelectBarcodeEnabled(
            barcodeJson,
            enabled,
            CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun createFindView(args: JSONArray, callbackContext: CallbackContext) {
        val viewJson = args.defaultArgumentAsString
        val container = barcodeFindViewHandler.prepareContainer()

        val result = barcodeFindModule.getView(container, viewJson)
        if (result.isFailure) {
            callbackContext.error(
                result.exceptionOrNull()?.message
                    ?: "Unable to create the BarcodeFindView from the given json=$viewJson"
            )
            return
        }

        barcodeFindViewHandler.addBarcodeFindViewContainer(container)
        barcodeFindViewHandler.render()
        callbackContext.success()
    }

    @PluginMethod
    fun updateFindView(args: JSONArray, callbackContext: CallbackContext) {
        val viewJson = args.toString()
        barcodeFindModule.updateBarcodeFindView(viewJson, CordovaResult(callbackContext))
    }

    @PluginMethod
    fun updateFindMode(args: JSONArray, callbackContext: CallbackContext) {
        barcodeFindModule.updateBarcodeFindMode(
            args.defaultArgumentAsString,
            CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun setBarcodeFindTransformer(args: JSONArray, callbackContext: CallbackContext) {
        barcodeFindModule.setBarcodeFindTransformer(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun submitBarcodeFindTransformerResult(args: JSONArray, callbackContext: CallbackContext) {
        val transformedBarcode = args.toString()
        barcodeFindModule.submitBarcodeFindTransformerResult(transformedBarcode, CordovaResult(callbackContext))
    }

    @PluginMethod
    fun registerBarcodeFindListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(
            FrameworksBarcodeFindListener.ON_SEARCH_PAUSED_EVENT_NAME,
            callbackContext
        )
        eventEmitter.registerCallback(
            FrameworksBarcodeFindListener.ON_SEARCH_STARTED_EVENT_NAME,
            callbackContext
        )
        eventEmitter.registerCallback(
            FrameworksBarcodeFindListener.ON_SEARCH_STARTED_EVENT_NAME,
            callbackContext
        )

        barcodeFindModule.addBarcodeFindListener(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun unregisterBarcodeFindListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.unregisterCallback(
            FrameworksBarcodeFindListener.ON_SEARCH_PAUSED_EVENT_NAME
        )
        eventEmitter.unregisterCallback(
            FrameworksBarcodeFindListener.ON_SEARCH_STARTED_EVENT_NAME
        )
        eventEmitter.unregisterCallback(
            FrameworksBarcodeFindListener.ON_SEARCH_STARTED_EVENT_NAME
        )

        barcodeFindModule.removeBarcodeFindListener(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun registerBarcodeFindViewListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(
            FrameworksBarcodeFindViewUiListener.ON_FINISH_BUTTON_TAPPED_EVENT_NAME,
            callbackContext
        )

        barcodeFindModule.addBarcodeFindViewListener(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun unregisterBarcodeFindViewListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.unregisterCallback(
            FrameworksBarcodeFindViewUiListener.ON_FINISH_BUTTON_TAPPED_EVENT_NAME
        )

        barcodeFindModule.removeBarcodeFindViewListener(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun barcodeFindViewOnPause(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodeFindModule.viewOnPause(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun barcodeFindViewOnResume(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodeFindModule.viewOnResume(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun barcodeFindSetItemList(args: JSONArray, callbackContext: CallbackContext) {
        barcodeFindModule.setItemList(args.defaultArgumentAsString, CordovaResult(callbackContext))
    }

    @PluginMethod
    fun barcodeFindViewStopSearching(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodeFindModule.viewStopSearching(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun barcodeFindViewStartSearching(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodeFindModule.viewStartSearching(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun barcodeFindViewPauseSearching(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodeFindModule.viewPauseSearching(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun barcodeFindModeStart(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodeFindModule.modeStart(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun barcodeFindModePause(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodeFindModule.modePause(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun barcodeFindModeStop(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodeFindModule.modeStop(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun showFindView(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodeFindViewHandler.setVisible()
        callbackContext.success()
    }

    @PluginMethod
    fun hideFindView(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodeFindViewHandler.setInvisible()
        callbackContext.success()
    }

    @PluginMethod
    fun createPickView(args: JSONArray, callbackContext: CallbackContext) {
        val viewJson = args.defaultArgumentAsString
        val container = barcodePickViewHandler.prepareContainer()

        barcodePickModule.addViewToContainer(container, viewJson, CordovaResult(callbackContext))

        barcodePickViewHandler.addBarcodePickViewContainer(container)
        barcodePickViewHandler.render()
    }

    @PluginMethod
    fun viewStart(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodePickModule.viewStart()
        callbackContext.success()
    }

    @PluginMethod
    fun viewStop(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodePickModule.viewStop()
        callbackContext.success()
    }

    @PluginMethod
    fun viewFreeze(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodePickModule.viewFreeze(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun setPickViewPositionAndSize(args: JSONArray, callbackContext: CallbackContext) {
        val positionJson = args.getJSONObject(0) ?: return callbackContext.error(
            "No position was given for setting the view"
        )
        barcodePickViewHandler.setResizeAndMoveInfo(ResizeAndMoveInfo(positionJson))
        callbackContext.success()
    }

    @PluginMethod
    fun updatePickView(args: JSONArray, callbackContext: CallbackContext) {
        val viewJson = args.toString()
        barcodePickModule.updateView(viewJson, CordovaResult(callbackContext))
    }

    @PluginMethod
    fun subscribeDidPickItemListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(
            FrameworksBarcodePickActionListener.DID_PICK_EVENT_NAME, callbackContext
        )
        callbackContext.successAndKeepCallback()
    }

    @PluginMethod
    fun subscribeDidUnpickItemListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(
            FrameworksBarcodePickActionListener.DID_UNPICK_EVENT_NAME, callbackContext
        )
        callbackContext.successAndKeepCallback()
    }

    @PluginMethod
    fun addActionListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodePickModule.addActionListener()
        callbackContext.success()
    }

    @PluginMethod
    fun finishPickAction(args: JSONArray, callbackContext: CallbackContext) {
        val itemDataJson = args.optString("code", "")
        val result = args.optBoolean("result", false)

        barcodePickModule.finishPickAction(itemData = itemDataJson, result)
        callbackContext.success()
    }

    @PluginMethod
    fun unsubscribeListeners(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodePickModule.removeActionListener()
        barcodePickModule.removeScanningListener(CordovaResult(callbackContext))
        barcodePickModule.removeViewListener(CordovaResult(callbackContext))
        barcodePickModule.removeViewUiListener(CordovaResult(callbackContext))

        eventEmitter.unregisterCallback(FrameworksBarcodePickActionListener.DID_PICK_EVENT_NAME)
        eventEmitter.unregisterCallback(FrameworksBarcodePickActionListener.DID_UNPICK_EVENT_NAME)

        eventEmitter.unregisterCallback(FrameworksBarcodePickScanningListener.ON_COMPLETE_SCANNING)
        eventEmitter.unregisterCallback(FrameworksBarcodePickScanningListener.ON_UPDATE_SCANNING)

        eventEmitter.unregisterCallback(FrameworksBarcodePickViewListener.DID_START_SCANNING_EVENT)
        eventEmitter.unregisterCallback(FrameworksBarcodePickViewListener.DID_STOP_SCANNING_EVENT)
        eventEmitter.unregisterCallback(FrameworksBarcodePickViewListener.DID_PAUSE_SCANNING_EVENT)
        eventEmitter.unregisterCallback(FrameworksBarcodePickViewListener.DID_FREEZE_SCANNING_EVENT)

        eventEmitter.unregisterCallback(
            FrameworksBarcodePickViewUiListener.DID_TAP_FINISH_BUTTON_EVENT
        )
    }

    @PluginMethod
    fun subscribeProductIdentifierForItemsListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(
            FrameworksBarcodePickAsyncMapperProductProviderCallback
                .ON_PRODUCT_IDENTIFIERS_FOR_ITEMS_EVENT_NAME,
            callbackContext
        )
        callbackContext.successAndKeepCallback()
    }

    @PluginMethod
    fun unsubscribeProductIdentifierForItemsListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.unregisterCallback(
            FrameworksBarcodePickAsyncMapperProductProviderCallback
                .ON_PRODUCT_IDENTIFIERS_FOR_ITEMS_EVENT_NAME
        )
        callbackContext.success()
    }

    @PluginMethod
    fun addScanningListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodePickModule.addScanningListener(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun removeScanningListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.unregisterCallback(
            FrameworksBarcodePickScanningListener
                .ON_COMPLETE_SCANNING
        )
        eventEmitter.unregisterCallback(
            FrameworksBarcodePickScanningListener
                .ON_UPDATE_SCANNING
        )
        barcodePickModule.removeScanningListener(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun addViewListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodePickModule.addViewListener(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun subscribeDidStartScanningListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(
            FrameworksBarcodePickViewListener
                .DID_START_SCANNING_EVENT,
            callbackContext
        )
    }

    @PluginMethod
    fun subscribeDidFreezeScanningListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(
            FrameworksBarcodePickViewListener
                .DID_FREEZE_SCANNING_EVENT,
            callbackContext
        )
    }

    @PluginMethod
    fun subscribeDidPauseScanningListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(
            FrameworksBarcodePickViewListener
                .DID_PAUSE_SCANNING_EVENT,
            callbackContext
        )
    }

    @PluginMethod
    fun subscribeDidStopScanningListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(
            FrameworksBarcodePickViewListener
                .DID_STOP_SCANNING_EVENT,
            callbackContext
        )
    }

    @PluginMethod
    fun subscribeDidCompleteScanningSessionListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(
            FrameworksBarcodePickScanningListener
                .ON_COMPLETE_SCANNING,
            callbackContext
        )
    }

    @PluginMethod
    fun subscribeDidUpdateScanningSessionListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(
            FrameworksBarcodePickScanningListener
                .ON_UPDATE_SCANNING,
            callbackContext
        )
    }

    @PluginMethod
    fun registerBarcodePickViewUiListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        barcodePickModule.addViewUiListener(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun subscribeBarcodePickViewUiListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(
            FrameworksBarcodePickViewUiListener
                .DID_TAP_FINISH_BUTTON_EVENT,
            callbackContext
        )
    }

    @PluginMethod
    fun unsubscribeBarcodePickViewUiListener(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.unregisterCallback(
            FrameworksBarcodePickViewUiListener
                .DID_TAP_FINISH_BUTTON_EVENT
        )
        barcodePickModule.removeViewUiListener(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun finishOnProductIdentifierForItems(args: JSONArray, callbackContext: CallbackContext) {
        barcodePickModule.finishOnProductIdentifierForItems(
            args.defaultArgumentAsString
        )
        callbackContext.success()
    }

    @PluginMethod
    fun updateBarcodeCaptureOverlay(args: JSONArray, callbackContext: CallbackContext) {
        barcodeCaptureModule.updateOverlay(
            args.defaultArgumentAsString,
            CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun updateBarcodeCaptureMode(args: JSONArray, callbackContext: CallbackContext) {
        barcodeCaptureModule.updateModeFromJson(
            args.defaultArgumentAsString,
            CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun applyBarcodeCaptureModeSettings(args: JSONArray, callbackContext: CallbackContext) {
        barcodeCaptureModule.applyModeSettings(
            args.defaultArgumentAsString,
            CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun updateBarcodeSelectionBasicOverlay(args: JSONArray, callbackContext: CallbackContext) {
        barcodeSelectionModule.updateBasicOverlay(
            args.defaultArgumentAsString, CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun updateBarcodeSelectionMode(args: JSONArray, callbackContext: CallbackContext) {
        barcodeSelectionModule.updateModeFromJson(
            args.defaultArgumentAsString, CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun applyBarcodeSelectionModeSettings(args: JSONArray, callbackContext: CallbackContext) {
        barcodeSelectionModule.applyModeSettings(
            args.defaultArgumentAsString,
            CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun setTextForAimToSelectAutoHint(args: JSONArray, callbackContext: CallbackContext) {
        barcodeSelectionModule.setTextForAimToSelectAutoHint(
            args.defaultArgumentAsString,
            CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun removeAimedBarcodeBrushProvider(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.unregisterCallback(
            FrameworksBarcodeSelectionAimedBrushProvider.BRUSH_FOR_AIMED_BARCODE_EVENT_NAME
        )
        barcodeSelectionModule.removeAimedBarcodeBrushProvider()
        callbackContext.success()
    }

    @PluginMethod
    fun setAimedBarcodeBrushProvider(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(
            FrameworksBarcodeSelectionAimedBrushProvider.BRUSH_FOR_AIMED_BARCODE_EVENT_NAME,
            callbackContext
        )
        barcodeSelectionModule.setAimedBarcodeBrushProvider(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun finishBrushForAimedBarcodeCallback(args: JSONArray, callbackContext: CallbackContext) {
        val payload = args.getJSONObject(0)
        barcodeSelectionModule.finishBrushForAimedBarcode(
            payload["brush"] as? String?,
            payload["selectionIdentifier"].toString()
        )
        callbackContext.success()
    }

    @PluginMethod
    fun removeTrackedBarcodeBrushProvider(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.unregisterCallback(
            FrameworksBarcodeSelectionTrackedBrushProvider.BRUSH_FOR_TRACKED_BARCODE_EVENT_NAME
        )
        barcodeSelectionModule.removeTrackedBarcodeBrushProvider()
        callbackContext.success()
    }

    @PluginMethod
    fun setTrackedBarcodeBrushProvider(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        eventEmitter.registerCallback(
            FrameworksBarcodeSelectionTrackedBrushProvider.BRUSH_FOR_TRACKED_BARCODE_EVENT_NAME,
            callbackContext
        )
        barcodeSelectionModule.setTrackedBarcodeBrushProvider(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun finishBrushForTrackedBarcodeCallback(args: JSONArray, callbackContext: CallbackContext) {
        val payload = args.getJSONObject(0)
        barcodeSelectionModule.finishBrushForTrackedBarcode(
            payload["brush"] as? String?,
            payload["selectionIdentifier"].toString()
        )
        callbackContext.success()
    }

    @PluginMethod
    fun setBarcodeCaptureModeEnabledState(args: JSONArray, callbackContext: CallbackContext) {
        barcodeCaptureModule.setModeEnabled(args.optBoolean("enabled", false))
        callbackContext.success()
    }

    @PluginMethod
    fun setBarcodeSelectionModeEnabledState(args: JSONArray, callbackContext: CallbackContext) {
        barcodeSelectionModule.setModeEnabled(args.optBoolean("enabled", false))
        callbackContext.success()
    }

    @PluginMethod
    fun setBarcodeTrackingModeEnabledState(args: JSONArray, callbackContext: CallbackContext) {
        barcodeTrackingModule.setModeEnabled(args.optBoolean("enabled", false))
        callbackContext.success()
    }

    @PluginMethod
    fun setBarcodeFindModeEnabledState(args: JSONArray, callbackContext: CallbackContext) {
        barcodeFindModule.setModeEnabled(args.optBoolean("enabled", false))
        callbackContext.success()
    }

    @PluginMethod
    fun updateBarcodeTrackingAdvancedOverlay(args: JSONArray, callbackContext: CallbackContext) {
        barcodeTrackingModule.updateAdvancedOverlay(
            args.defaultArgumentAsString, CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun updateBarcodeTrackingBasicOverlay(args: JSONArray, callbackContext: CallbackContext) {
        barcodeTrackingModule.updateBasicOverlay(
            args.defaultArgumentAsString, CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun updateBarcodeTrackingMode(args: JSONArray, callbackContext: CallbackContext) {
        barcodeTrackingModule.updateModeFromJson(
            args.defaultArgumentAsString, CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun applyBarcodeTrackingModeSettings(args: JSONArray, callbackContext: CallbackContext) {
        barcodeTrackingModule.applyModeSettings(
            args.defaultArgumentAsString, CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun updateSparkScanView(args: JSONArray, callbackContext: CallbackContext) {
        val viewJson = args.defaultArgumentAsString
        sparkScanModule.updateView(viewJson, CordovaResult(callbackContext))
    }

    @PluginMethod
    fun createSparkScanView(args: JSONArray, callbackContext: CallbackContext) {
        val container = webView.view ?: return callbackContext.error(
            "No container set for SparkScanView"
        )
        val viewJson = args.defaultArgumentAsString
        mainThread.runOnMainThread {
            sparkScanModule.addViewToContainer(container, viewJson, CordovaResult(callbackContext))
            sparkScanModule.sparkScanView?.bringToFront()
        }
    }

    @PluginMethod
    fun disposeSparkScanView(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        mainThread.runOnMainThread {
            sparkScanModule.disposeView()
        }
        callbackContext.success()
    }

    @PluginMethod
    fun showSparkScanView(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        mainThread.runOnMainThread {
            sparkScanModule.sparkScanView?.visibility = View.VISIBLE
        }
        callbackContext.success()
    }

    @PluginMethod
    fun hideSparkScanView(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        mainThread.runOnMainThread {
            sparkScanModule.sparkScanView?.visibility = View.GONE
        }
        callbackContext.success()
    }

    @PluginMethod
    fun emitSparkScanViewFeedback(args: JSONArray, callbackContext: CallbackContext) {
        sparkScanModule.emitFeedback(
            args.defaultArgumentAsString,
            CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun registerSparkScanViewListenerEvents(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        sparkScanModule.addSparkScanViewUiListener()
        eventEmitter.registerCallback(
            FrameworksSparkScanViewUiListener.EVENT_BARCODE_COUNT_BUTTON_TAP,
            callbackContext
        )

        eventEmitter.registerCallback(
            FrameworksSparkScanViewUiListener.EVENT_FAST_FIND_BUTTON_TAP,
            callbackContext
        )

        callbackContext.successAndKeepCallback()
    }

    @PluginMethod
    fun unregisterSparkScanViewListenerEvents(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        sparkScanModule.removeSparkScanViewUiListener()

        eventEmitter.unregisterCallback(
            FrameworksSparkScanViewUiListener.EVENT_BARCODE_COUNT_BUTTON_TAP
        )

        eventEmitter.unregisterCallback(
            FrameworksSparkScanViewUiListener.EVENT_FAST_FIND_BUTTON_TAP
        )
        callbackContext.success()
    }

    @PluginMethod
    fun stopSparkScanViewScanning(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        sparkScanModule.onPause()
        callbackContext.success()
    }

    @PluginMethod
    fun startSparkScanViewScanning(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        sparkScanModule.startScanning(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun pauseSparkScanViewScanning(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        sparkScanModule.pauseScanning()
        callbackContext.success()
    }

    @PluginMethod
    fun prepareSparkScanViewScanning(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        sparkScanModule.onResume(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun resetSparkScanSession(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        sparkScanModule.resetSession()
        callbackContext.success()
    }

    @PluginMethod
    fun updateSparkScanMode(args: JSONArray, callbackContext: CallbackContext) {
        val modeJson = args.defaultArgumentAsString
        sparkScanModule.updateMode(modeJson, CordovaResult(callbackContext))
    }

    @PluginMethod
    fun registerSparkScanListenerForEvents(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        sparkScanModule.addSparkScanListener()

        eventEmitter.registerCallback(
            FrameworksSparkScanListener.ON_BARCODE_SCANNED_EVENT_NAME,
            callbackContext
        )

        eventEmitter.registerCallback(
            FrameworksSparkScanListener.ON_SESSION_UPDATED_EVENT_NAME,
            callbackContext
        )

        callbackContext.successAndKeepCallback()
    }

    @PluginMethod
    fun unregisterSparkScanListenerForEvents(
        @Suppress("UNUSED_PARAMETER") args: JSONArray,
        callbackContext: CallbackContext
    ) {
        sparkScanModule.removeSparkScanListener()

        eventEmitter.unregisterCallback(
            FrameworksSparkScanListener.ON_BARCODE_SCANNED_EVENT_NAME
        )

        eventEmitter.unregisterCallback(
            FrameworksSparkScanListener.ON_SESSION_UPDATED_EVENT_NAME
        )

        callbackContext.success()
    }

    @PluginMethod
    fun finishSparkScanDidUpdateSessionCallback(args: JSONArray, callbackContext: CallbackContext) {
        sparkScanModule.finishDidUpdateSessionCallback(args.optBoolean("enabled", false))
        callbackContext.success()
    }

    @PluginMethod
    fun finishSparkScanDidScanCallback(args: JSONArray, callbackContext: CallbackContext) {
        sparkScanModule.finishDidScanCallback(args.optBoolean("enabled", false))
        callbackContext.success()
    }

    @PluginMethod
    fun setSparkScanModeEnabledState(args: JSONArray, callbackContext: CallbackContext) {
        sparkScanModule.setModeEnabled(args.optBoolean("enabled", false))
        callbackContext.success()
    }

    @PluginMethod
    fun addSparkScanFeedbackDelegate(args: JSONArray, callbackContext: CallbackContext) {
        eventEmitter.registerCallback(
            FrameworksSparkScanFeedbackDelegate.ON_GET_FEEDBACK_FOR_BARCODE,
            callbackContext
        )
        sparkScanModule.addFeedbackDelegate(CordovaResultKeepCallback(callbackContext))
    }

    @PluginMethod
    fun removeSparkScanFeedbackDelegate(args: JSONArray, callbackContext: CallbackContext) {
        eventEmitter.unregisterCallback(
            FrameworksSparkScanFeedbackDelegate.ON_GET_FEEDBACK_FOR_BARCODE,
        )
        sparkScanModule.removeFeedbackDelegate(CordovaResult(callbackContext))
    }

    @PluginMethod
    fun submitSparkScanFeedbackForBarcode(args: JSONArray, callbackContext: CallbackContext) {
        val feedbackJson = args.optString(0, null)
        sparkScanModule.submitFeedbackForBarcode(
            feedbackJson,
            CordovaResult(callbackContext)
        )
    }

    @PluginMethod
    fun showToast(args: JSONArray, callbackContext: CallbackContext) {
        sparkScanModule.showToast(
            args.defaultArgumentAsString,
            CordovaResult(callbackContext)
        )
    }

    // Barcode Count - Start

    @PluginMethod
    fun updateMode(args: JSONArray, callbackContext: CallbackContext) {
        barcodeCountModule.updateBarcodeCount(
            args.defaultArgumentAsString,
        )
        callbackContext.success()
    }

    @PluginMethod
    fun resetBarcodeCount(args: JSONArray, callbackContext: CallbackContext) {
        barcodeCountModule.resetBarcodeCount()
        callbackContext.success()
    }

    @PluginMethod
    fun registerBarcodeCountListener(args: JSONArray, callbackContext: CallbackContext) {
        eventEmitter.registerCallback(
            FrameworksBarcodeCountListener.ON_BARCODE_SCANNED_EVENT_NAME,
            callbackContext
        )

        barcodeCountModule.addBarcodeCountListener()
        callbackContext.successAndKeepCallback()
    }

    @PluginMethod
    fun unregisterBarcodeCountListener(args: JSONArray, callbackContext: CallbackContext) {
        eventEmitter.unregisterCallback(
            FrameworksBarcodeCountListener.ON_BARCODE_SCANNED_EVENT_NAME
        )

        barcodeCountModule.removeBarcodeCountListener()
        callbackContext.success()
    }

    @PluginMethod
    fun setBarcodeCountModeEnabledState(args: JSONArray, callbackContext: CallbackContext) {
        barcodeCountModule.setModeEnabled(args.optBoolean(0, true))
        callbackContext.success()
    }

    @PluginMethod
    fun finishBarcodeCountListenerOnScan(args: JSONArray, callbackContext: CallbackContext) {
        barcodeCountModule.finishOnScan(true)
        callbackContext.success()
    }

    @PluginMethod
    fun startScanningPhase(args: JSONArray, callbackContext: CallbackContext) {
        barcodeCountModule.startScanningPhase()
        callbackContext.success()
    }

    @PluginMethod
    fun endScanningPhase(args: JSONArray, callbackContext: CallbackContext) {
        barcodeCountModule.endScanningPhase()
        callbackContext.success()
    }

    @PluginMethod
    fun setBarcodeCountCaptureList(args: JSONArray, callbackContext: CallbackContext) {
        val barcodes = JSONArray(args.defaultArgumentAsString)
        barcodeCountModule.setBarcodeCountCaptureList(barcodes)
        callbackContext.success()
    }

    @PluginMethod
    fun getSpatialMap(args: JSONArray, callbackContext: CallbackContext) {
        val map = barcodeCountModule.getSpatialMap()
        callbackContext.success(map?.toJson())
    }

    @PluginMethod
    fun getSpatialMapWithHints(args: JSONArray, callbackContext: CallbackContext) {
        val hints = args.getJSONObject(0)
        val expectedNumberOfRows = hints.getInt("expectedNumberOfRows")
        val expectedNumberOfColumns = hints.getInt("expectedNumberOfColumns")
        val map = barcodeCountModule.getSpatialMap(expectedNumberOfRows, expectedNumberOfColumns)
        callbackContext.success(map?.toJson())
    }

    @PluginMethod
    fun resetBarcodeCountSession(args: JSONArray, callbackContext: CallbackContext) {
        barcodeCountModule.resetBarcodeCountSession(null)
        callbackContext.success()
    }

    @PluginMethod
    fun updateBarcodeCountView(args: JSONArray, callbackContext: CallbackContext) {
        barcodeCountModule.updateBarcodeCountView(args.defaultArgumentAsString)
        callbackContext.success()
    }

    @PluginMethod
    fun createBarcodeCountView(args: JSONArray, callbackContext: CallbackContext) {
        val viewJson = args.defaultArgumentAsString
        val barcodeCountView = barcodeCountModule.getViewFromJson(viewJson)
        if (barcodeCountView == null) {
            callbackContext.error("Unable to create the BarcodeCountView from the given json=$viewJson")
            return
        }

        barcodeCountViewHandler.attachBarcodeCountView(
            barcodeCountView,
            cordova.activity
        )
        barcodeCountViewHandler.render()
        callbackContext.success()
    }

    @PluginMethod
    fun registerBarcodeCountViewUiListener(args: JSONArray, callbackContext: CallbackContext) {
        eventEmitter.registerCallback(
            FrameworksBarcodeCountViewUiListener.ON_EXIT_BUTTON_TAPPED_EVENT_NAME,
            callbackContext
        )
        eventEmitter.registerCallback(
            FrameworksBarcodeCountViewUiListener.ON_LIST_BUTTON_TAPPED_EVENT_NAME,
            callbackContext
        )
        eventEmitter.registerCallback(
            FrameworksBarcodeCountViewUiListener.ON_SINGLE_SCAN_BUTTON_TAPPED_EVENT_NAME,
            callbackContext
        )
        barcodeCountModule.addBarcodeCountViewUiListener()
        callbackContext.successAndKeepCallback()
    }

    @PluginMethod
    fun unregisterBarcodeCountViewUiListener(args: JSONArray, callbackContext: CallbackContext) {
        eventEmitter.unregisterCallback(
            FrameworksBarcodeCountViewUiListener.ON_EXIT_BUTTON_TAPPED_EVENT_NAME,
        )
        eventEmitter.unregisterCallback(
            FrameworksBarcodeCountViewUiListener.ON_LIST_BUTTON_TAPPED_EVENT_NAME,
        )
        eventEmitter.unregisterCallback(
            FrameworksBarcodeCountViewUiListener.ON_SINGLE_SCAN_BUTTON_TAPPED_EVENT_NAME,
        )
        barcodeCountModule.removeBarcodeCountViewUiListener()
        callbackContext.success()
    }

    @PluginMethod
    fun registerBarcodeCountViewListener(args: JSONArray, callbackContext: CallbackContext) {
        eventEmitter.registerCallback(
            FrameworksBarcodeCountViewListener.BRUSH_FOR_RECOGNIZED_BARCODE_EVENT,
            callbackContext
        )
        eventEmitter.registerCallback(
            FrameworksBarcodeCountViewListener.BRUSH_FOR_RECOGNIZED_BARCODE_NOT_IN_LIST_EVENT,
            callbackContext
        )
        eventEmitter.registerCallback(
            FrameworksBarcodeCountViewListener.BRUSH_FOR_UNRECOGNIZED_BARCODE,
            callbackContext
        )
        eventEmitter.registerCallback(
            FrameworksBarcodeCountViewListener.DID_TAP_FILTERED_BARCODE,
            callbackContext
        )
        eventEmitter.registerCallback(
            FrameworksBarcodeCountViewListener.DID_COMPLETE_CAPTURE_LIST,
            callbackContext
        )
        eventEmitter.registerCallback(
            FrameworksBarcodeCountViewListener.DID_TAP_RECOGNIZED_BARCODE,
            callbackContext
        )
        eventEmitter.registerCallback(
            FrameworksBarcodeCountViewListener.DID_TAP_RECOGNIZED_BARCODE_NOT_IN_LIST,
            callbackContext
        )
        eventEmitter.registerCallback(
            FrameworksBarcodeCountViewListener.DID_TAP_UNRECOGNIZED_BARCODE,
            callbackContext
        )
        barcodeCountModule.addBarcodeCountViewListener()
        callbackContext.successAndKeepCallback()
    }

    @PluginMethod
    fun unregisterBarcodeCountViewListener(args: JSONArray, callbackContext: CallbackContext) {
        eventEmitter.unregisterCallback(
            FrameworksBarcodeCountViewListener.BRUSH_FOR_RECOGNIZED_BARCODE_EVENT,
        )
        eventEmitter.unregisterCallback(
            FrameworksBarcodeCountViewListener.BRUSH_FOR_RECOGNIZED_BARCODE_NOT_IN_LIST_EVENT,
        )
        eventEmitter.unregisterCallback(
            FrameworksBarcodeCountViewListener.BRUSH_FOR_UNRECOGNIZED_BARCODE,
        )
        eventEmitter.unregisterCallback(
            FrameworksBarcodeCountViewListener.DID_TAP_FILTERED_BARCODE,
        )
        eventEmitter.unregisterCallback(
            FrameworksBarcodeCountViewListener.DID_COMPLETE_CAPTURE_LIST,
        )
        eventEmitter.unregisterCallback(
            FrameworksBarcodeCountViewListener.DID_TAP_RECOGNIZED_BARCODE,
        )
        eventEmitter.unregisterCallback(
            FrameworksBarcodeCountViewListener.DID_TAP_RECOGNIZED_BARCODE_NOT_IN_LIST,
        )
        eventEmitter.unregisterCallback(
            FrameworksBarcodeCountViewListener.DID_TAP_UNRECOGNIZED_BARCODE,
        )
        barcodeCountModule.removeBarcodeCountViewListener()
        callbackContext.success()
    }

    @PluginMethod
    fun clearBarcodeCountViewHighlights(args: JSONArray, callbackContext: CallbackContext) {
        barcodeCountModule.clearHighlights()
        callbackContext.success()
    }

    @PluginMethod
    fun setBarcodeCountViewPositionAndSize(args: JSONArray, callbackContext: CallbackContext) {
        val positionJson = args.getJSONObject(0) ?: return callbackContext.error(
            "No position was given for setting the view"
        )
        barcodeCountViewHandler.setResizeAndMoveInfo(ResizeAndMoveInfo(positionJson))
        callbackContext.success()
    }

    @PluginMethod
    fun showBarcodeCountView(args: JSONArray, callbackContext: CallbackContext) {
        barcodeCountViewHandler.setVisible()
        callbackContext.success()
    }

    @PluginMethod
    fun hideBarcodeCountView(args: JSONArray, callbackContext: CallbackContext) {
        barcodeCountViewHandler.setInvisible()
        callbackContext.success()
    }

    @PluginMethod
    fun finishBarcodeCountViewListenerBrushForRecognizedBarcode(args: JSONArray, callbackContext: CallbackContext) {
        val payload = args.getJSONObject(0)
        val brushJson = payload.getOrNull("brush")
        val brush = if (brushJson.isNullOrBlank()) null else BrushDeserializer.fromJson(brushJson)
        val trackedBarcodeId = payload.optInt("trackedBarcodeID", -1)
        barcodeCountModule.finishBrushForRecognizedBarcodeEvent(brush, trackedBarcodeId)
        callbackContext.success()
    }

    @PluginMethod
    fun finishBarcodeCountViewListenerBrushForRecognizedBarcodeNotInList(args: JSONArray, callbackContext: CallbackContext) {
        val payload = args.getJSONObject(0)
        val brushJson = payload.getOrNull("brush")
        val brush = if (brushJson.isNullOrBlank()) null else BrushDeserializer.fromJson(brushJson)
        val trackedBarcodeId = payload.optInt("trackedBarcodeID", -1)
        barcodeCountModule.finishBrushForRecognizedBarcodeNotInListEvent(brush, trackedBarcodeId)
        callbackContext.success()
    }

    @PluginMethod
    fun finishBarcodeCountViewListenerOnBrushForUnrecognizedBarcode(args: JSONArray, callbackContext: CallbackContext) {
        val payload = args.getJSONObject(0)
        val brushJson = payload.getOrNull("brush")
        val brush = if (brushJson.isNullOrBlank()) null else BrushDeserializer.fromJson(brushJson)
        val trackedBarcodeId = payload.optInt("trackedBarcodeID", -1)
        barcodeCountModule.finishBrushForUnrecognizedBarcodeEvent(brush, trackedBarcodeId)
        callbackContext.success()
    }

    // Barcode Count - End
}

