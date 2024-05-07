/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2024- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.barcode.handlers

import android.app.Activity
import android.graphics.Color
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import com.scandit.datacapture.barcode.count.ui.view.BarcodeCountView
import com.scandit.datacapture.cordova.core.data.ResizeAndMoveInfo
import com.scandit.datacapture.cordova.core.utils.pxFromDp
import com.scandit.datacapture.cordova.core.utils.removeFromParent
import com.scandit.datacapture.frameworks.core.utils.DefaultMainThread
import com.scandit.datacapture.frameworks.core.utils.MainThread
import java.lang.ref.WeakReference

class BarcodeCountViewHandler(
    private val mainThread: MainThread = DefaultMainThread.getInstance()
) {
    private var latestInfo: ResizeAndMoveInfo = ResizeAndMoveInfo(0, 0, 600, 600, false)
    private var isVisible: Boolean = true
    private var barcodeCountViewReference: WeakReference<BarcodeCountView?> = WeakReference(null)
    private var webViewReference: WeakReference<View>? = null
    private var activityRef: WeakReference<AppCompatActivity>? = null

    private val barcodeCountView: BarcodeCountView?
        get() = barcodeCountViewReference.get()

    private val webView: View?
        get() = webViewReference?.get()

    fun attachBarcodeCountView(barcodeCountView: BarcodeCountView, activity: Activity) {
        if (this.barcodeCountView != barcodeCountView) {
            disposeCurrentView()
            addBarcodeCountView(barcodeCountView, activity)
        }
    }

    fun attachWebView(webView: View, activity: AppCompatActivity) {
        if (this.webView != webView) {
            webViewReference = WeakReference(webView)
            activityRef = WeakReference(activity)
            mainThread.runOnMainThread {
                webView.bringToFront()
                webView.setBackgroundColor(Color.TRANSPARENT)
            }
        }
    }

    fun setVisible() {
        isVisible = true
        render()
    }

    fun setInvisible() {
        isVisible = false
        render()
    }

    fun setResizeAndMoveInfo(info: ResizeAndMoveInfo) {
        latestInfo = info
        render()
    }

    fun disposeCurrent() {
        mainThread.runOnMainThread {
            disposeCurrentView()
            disposeCurrentWebView()
        }
    }

    private fun disposeCurrentView() {
        val view = barcodeCountView ?: return
        removeBarcodeFindViewContainer(view)
    }

    private fun disposeCurrentWebView() {
        webViewReference = null
    }

    private fun addBarcodeCountView(
        barcodeCountView: BarcodeCountView,
        activity: Activity
    ) {
        barcodeCountViewReference = WeakReference(barcodeCountView)

        mainThread.runOnMainThread {
            activity.addContentView(
                barcodeCountView,
                ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
            )
            render()
        }
    }

    private fun removeBarcodeFindViewContainer(barcodeCountView: BarcodeCountView) {
        barcodeCountViewReference = WeakReference(null)
        removeView(barcodeCountView) {
            barcodeCountView.listener = null
            barcodeCountView.uiListener = null
        }
    }

    private fun removeView(view: View, uiBlock: (() -> Unit)? = null) {
        mainThread.runOnMainThread {
            view.removeFromParent()
            uiBlock?.invoke()
        }
    }

    // Update the view visibility, position and size.
    fun render() {
        val view = barcodeCountView ?: return
        renderNoAnimate(view)
    }

    private fun renderNoAnimate(barcodeCountView: BarcodeCountView) {
        barcodeCountView.post {
            barcodeCountView.visibility = if (isVisible) View.VISIBLE else View.GONE
            barcodeCountView.x = latestInfo.left.pxFromDp()
            barcodeCountView.y = latestInfo.top.pxFromDp()
            barcodeCountView.layoutParams.apply {
                width = latestInfo.width.pxFromDp().toInt()
                height = latestInfo.height.pxFromDp().toInt()
            }
            if (latestInfo.shouldBeUnderWebView) {
                webView?.bringToFront()
            } else {
                barcodeCountView.bringToFront()
            }
            barcodeCountView.requestLayout()
        }
    }
}
