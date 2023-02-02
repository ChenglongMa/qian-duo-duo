package com.qdd.ui.utils

import android.app.Activity
import android.view.View
import androidx.annotation.StringRes
import com.google.android.material.snackbar.BaseTransientBottomBar
import com.google.android.material.snackbar.Snackbar
import com.qdd.R

fun Activity.showSnackbar(
    @StringRes resId: Int,
    @BaseTransientBottomBar.Duration duration: Int = Snackbar.LENGTH_LONG,
    anchorView: View? = null,
    @StringRes actionText: Int = R.string.undo,
    actionFunc: (() -> Unit)? = null
) {
    val bar = Snackbar
        .make(findViewById(android.R.id.content), resId, duration)
        .setAnchorView(anchorView)
    actionFunc?.let { bar.setAction(actionText) { it() } }
    bar.show()
}