package com.qdd.ui.addone

import android.app.Activity
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.qdd.R
import com.qdd.databinding.PageAddOneBinding
import com.qdd.ui.utils.AppKeyboard


class ViewAdapter(private val activity: Activity, private val viewModel: AddOneViewModel) :
    RecyclerView.Adapter<ViewAdapter.ViewHolder>() {
    private val itemCount = 2

    inner class ViewHolder(var view: PageAddOneBinding) : RecyclerView.ViewHolder(view.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val holder = ViewHolder(
            PageAddOneBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        )
        // Keyboard
        val keyboard =
            AppKeyboard(
                holder.view.editableMoney,
                holder.view.keyboardView,
                R.xml.keyboard,
                activity
            )
        keyboard.setup()
        return holder
    }

    override fun getItemCount(): Int = itemCount

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        viewModel.isIncome.value = position == 1 // 0: expense 1: income
        holder.view.viewModel = viewModel
    }
}