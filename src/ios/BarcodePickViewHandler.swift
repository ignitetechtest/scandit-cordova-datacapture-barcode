/*
 * This file is part of the Scandit Data Capture SDK
 *
 * Copyright (C) 2023- Scandit AG. All rights reserved.
 */

import ScanditBarcodeCapture
import WebKit

class BarcodePickViewHandler {
    let webView: WKWebView

    var barcodePickView: BarcodePickView? {
        willSet {
            barcodePickView?.removeFromSuperview()
        }
        didSet {
            guard let barcodePickView = barcodePickView else { return }
            barcodePickView.translatesAutoresizingMaskIntoConstraints = false
            webView.addSubview(barcodePickView)
            resetConstraints()
            update()
        }
    }

    private var top: NSLayoutConstraint?
    private var left: NSLayoutConstraint?
    private var width: NSLayoutConstraint?
    private var height: NSLayoutConstraint?

    private var position = CGPoint.zero
    private var size = CGSize.zero
    private var shouldBeUnderWebView = false

    private var constraints: [NSLayoutConstraint] {
        return [top, left, width, height].compactMap({ $0 })
    }

    init(relativeTo webView: WKWebView) {
        self.webView = webView
    }

    /// Update the constraints that set the position and size of the capture view,
    /// based on a JSON passed in as the argument to a Cordova command.
    ///
    /// If the view does not exist yet, the position and size are stored and will be applied to the view
    /// when it's created (and the constraints object is updated with the new view).
    ///
    /// - Parameter positionAndSizeJSON: The JSON passed to the Cordova command
    func updatePositionAndSize(fromJSON positionAndSizeJSON: ViewPositionAndSizeJSON) {
        position = positionAndSizeJSON.position
        size = positionAndSizeJSON.size
        shouldBeUnderWebView = positionAndSizeJSON.shouldBeUnderWebView
        update()
    }

    private func update() {
        updateConstraints()
        updatePosition()
    }

    private func activate() {
        NSLayoutConstraint.activate(constraints)
    }

    private func resetConstraints() {
        top = nil
        left = nil
        width = nil
        height = nil
    }

    private func updateConstraints() {
        guard let barcodePickView = barcodePickView else {
            return
        }

        let topConstant = position.y + webView.adjustedContentInset.top
        let leftConstant = position.x + webView.adjustedContentInset.left

        if let top = top {
            top.constant = topConstant
        } else {
            top = barcodePickView.topAnchor.constraint(equalTo: webView.topAnchor, constant: topConstant)
            top?.isActive = true
        }

        if let left = left {
            left.constant = leftConstant
        } else {
            left = barcodePickView.leadingAnchor.constraint(equalTo: webView.leadingAnchor, constant: leftConstant)
            left?.isActive = true
        }

        if let width = width {
            width.constant = size.width
        } else {
            width = barcodePickView.widthAnchor.constraint(equalToConstant: size.width)
            width?.isActive = true
        }

        if let height = height {
            height.constant = size.height
        } else {
            height = barcodePickView.heightAnchor.constraint(equalToConstant: size.height)
            height?.isActive = true
        }

        barcodePickView.superview?.layoutIfNeeded()
    }

    private func updatePosition() {
        guard let barcodePickView = barcodePickView else {
            return
        }

        if shouldBeUnderWebView {
            barcodePickView.superview?.sendSubviewToBack(barcodePickView)
        } else {
            barcodePickView.superview?.bringSubviewToFront(barcodePickView)
        }
    }
}

