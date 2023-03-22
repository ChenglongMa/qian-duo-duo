package com.qdd.ui.utils

import android.widget.Filter
import java.util.*

class SearchFilter<T>(
    private val data: List<T>,
    private val process: (item: T, query: CharSequence) -> T?,
    private val publishResults: (filteredList: List<T>) -> Unit
) : Filter() {
    private var filteredList: List<T> = mutableListOf()

    override fun performFiltering(charSequence: CharSequence?): FilterResults {
        val query = charSequence.toString().lowercase(Locale.getDefault())
        filteredList = if (query.isEmpty()) {
            data.toMutableList() // 如果查询为空，则返回原始列表
        } else {
            val list = mutableListOf<T>()
            for (item in data) {
                process(item, query)?.let {
                    list.add(it)
                }
            }
            list // 如果查询不为空，则返回筛选后的列表
        }
        return FilterResults().apply {
            values = filteredList
            count = filteredList.size
        }
    }

    @Suppress("UNCHECKED_CAST")
    override fun publishResults(charSequence: CharSequence?, filterResults: FilterResults?) {
        filteredList = filterResults?.values as? MutableList<T> ?: mutableListOf()
        publishResults(filteredList)
    }
}