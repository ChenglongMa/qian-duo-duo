package com.qdd.ui.addone

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.qdd.databinding.PageAddOneBinding

class ViewAdapter(private val viewModel: AddOneViewModel) :
    RecyclerView.Adapter<ViewAdapter.ViewHolder>() {
    private val itemCount = 2

    inner class ViewHolder(var view: PageAddOneBinding) : RecyclerView.ViewHolder(view.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder = ViewHolder(
        PageAddOneBinding.inflate(LayoutInflater.from(parent.context), parent, false)
    )

    override fun getItemCount(): Int = itemCount

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        viewModel.isIncome.value = position == 1 // 0: expense 1: income
        holder.view.viewModel = viewModel
    }
}