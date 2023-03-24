package com.qdd.ui.utils

import androidx.recyclerview.widget.DiffUtil

class DiffCallback<T : Any>(private val isSameFunc: ((oldItem: T, newItem: T) -> Boolean)) :
    DiffUtil.ItemCallback<T>() {
    override fun areItemsTheSame(oldItem: T, newItem: T): Boolean =
        isSameFunc(oldItem, newItem)

    override fun areContentsTheSame(oldItem: T, newItem: T): Boolean =
        isSameFunc(oldItem, newItem)

}