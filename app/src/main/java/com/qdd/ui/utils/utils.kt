package com.qdd.ui.utils

import android.app.Activity
import android.content.Context
import android.view.View
import androidx.annotation.StringRes
import androidx.appcompat.app.AlertDialog
import com.google.android.material.snackbar.BaseTransientBottomBar
import com.google.android.material.snackbar.Snackbar
import com.qdd.R

fun Activity.showSnackbar(
    @StringRes resId: Int,
    @BaseTransientBottomBar.Duration duration: Int = Snackbar.LENGTH_LONG,
    anchorView: View? = null,
    @StringRes actionText: Int = R.string.undo,
    actionFn: (() -> Unit)? = null
) {
    val bar = Snackbar
        .make(findViewById(android.R.id.content), resId, duration)
        .setAnchorView(anchorView)
    actionFn?.let { bar.setAction(actionText) { it() } }
    bar.show()
}

fun Context.createDeleteDialog(deleteFn: () -> Unit) =
    AlertDialog.Builder(this)
        .setTitle(R.string.to_delete_dialog_title)
        .setPositiveButton(R.string.yes) { _, _ ->
            deleteFn()
        }
        .setNegativeButton(R.string.no, null).create()