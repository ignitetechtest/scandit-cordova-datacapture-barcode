/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2023- Scandit AG. All rights reserved.
 */

package com.scandit.datacapture.cordova.barcode.handlers

import android.app.Activity
import android.graphics.Color
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import com.scandit.datacapture.barcode.pick.ui.BarcodePickView
import com.scandit.datacapture.cordova.core.data.ResizeAndMoveInfo
import com.scandit.datacapture.cordova.core.utils.pxFromDp
import com.scandit.datacapture.cordova.core.utils.removeFromParent
import com.scandit.datacapture.frameworks.core.utils.DefaultMainThread
import com.scandit.datacapture.frameworks.core.utils.MainThread
import java.lang.ref.WeakReference

class BarcodePickViewHandler(
    private val mainThread: MainThread = DefaultMainThread.getInstance()
) {
    private var latestInfo: ResizeAndMoveInfo = ResizeAndMoveInfo(0, 0, 600, 600, false)
    private var isVisible: Boolean = true
    private var barcodePickViewContainerReference: WeakReference<FrameLayout>? = null
    private var webViewReference: WeakReference<View>? = null
    private var activityRef: WeakReference<AppCompatActivity>? = null

    val barcodePickViewContainer: FrameLayout?
        get() = barcodePickViewContainerReference?.get()

    private val webView: View?
        get() = webViewReference?.get()

    fun prepareContainer(): FrameLayout {
        return FrameLayout(
            this.activityRef?.get()
                ?: error("Plugin not initialized")
        )
    }

    fun addBarcodePickViewContainer(container: FrameLayout) {
        if (this.barcodePickViewContainer != container) {
            disposeCurrentView()
            mainThread.runOnMainThread {
                addContainer(
                    container,
                    activityRef?.get()
                        ?: error("Plugin not initialized")
                )
            }
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
        val view = barcodePickViewContainer ?: return
        removeBarcodePickViewContainer(view)
    }

    private fun disposeCurrentWebView() {
        webViewReference = null
    }

    private fun addContainer(
        barcodePickViewContainer: FrameLayout,
        activity: Activity
    ) {
        barcodePickViewContainerReference = WeakReference(barcodePickViewContainer)

        mainThread.runOnMainThread {
            activity.addContentView(
                barcodePickViewContainer,
                ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
            )
            render()
        }
    }

    private fun removeBarcodePickViewContainer(barcodePickViewContainer: FrameLayout) {
        barcodePickViewContainerReference = null
        removeView(barcodePickViewContainer) {
            if (barcodePickViewContainer.childCount > 0) {
                val pickView = barcodePickViewContainer.getChildAt(0) as? BarcodePickView
                pickView?.listener = null
                pickView?.uiListener = null
            }
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
        val view = barcodePickViewContainer ?: return
        renderNoAnimate(view)
    }

    private fun renderNoAnimate(barcodePickViewContainer: FrameLayout) {
        barcodePickViewContainer.post {
            barcodePickViewContainer.visibility = if (isVisible) View.VISIBLE else View.GONE
            barcodePickViewContainer.x = latestInfo.left.pxFromDp()
            barcodePickViewContainer.y = latestInfo.top.pxFromDp()
            barcodePickViewContainer.layoutParams.apply {
                width = ViewGroup.LayoutParams.MATCH_PARENT
                height = ViewGroup.LayoutParams.MATCH_PARENT
            }
            if (latestInfo.shouldBeUnderWebView) {
                webView?.bringToFront()
                (webView?.parent as View).translationZ = 1F
            } else {
                barcodePickViewContainer.bringToFront()
                (webView?.parent as View).translationZ = -1F
            }
            barcodePickViewContainer.requestLayout()
        }
    }
}
