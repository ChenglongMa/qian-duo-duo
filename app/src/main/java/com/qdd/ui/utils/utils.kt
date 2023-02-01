package com.qdd.ui.utils

import android.content.Context
import android.util.TypedValue
import androidx.annotation.DimenRes
import kotlin.math.roundToInt

fun Context.dpToPx(@DimenRes dpDimen: Int): Int =
    TypedValue.applyDimension(
        TypedValue.COMPLEX_UNIT_DIP,
        60f,
//        resources.getDimension(dpDimen),
        resources.displayMetrics
    ).roundToInt();