package com.qdd.ui.utils

import android.graphics.Rect
import android.view.View
import android.view.ViewTreeObserver

class GlobalLayoutListener(private val container: View, private val adjustedView: View) :
    ViewTreeObserver.OnGlobalLayoutListener {

    private var isKeyboardOpen: Boolean = false

    override fun onGlobalLayout() {
        val r = Rect()
        container.getWindowVisibleDisplayFrame(r)
        val screenHeight = container.rootView.height
        val keyboardHeight = screenHeight - r.bottom

        if (keyboardHeight > screenHeight / 4) { // 0.25 ratio is perhaps enough to determine keypad height.
            if (!isKeyboardOpen) {
                isKeyboardOpen = true
                adjustedView.setPadding(0, 0, 0, keyboardHeight)
            }
        } else {
            if (isKeyboardOpen) {
                isKeyboardOpen = false
                adjustedView.setPadding(0, 0, 0, 0)
            }
        }
    }
}