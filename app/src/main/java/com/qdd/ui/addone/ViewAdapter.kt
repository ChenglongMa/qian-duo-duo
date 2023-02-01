package com.qdd.ui.addone

import android.util.Log
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.fragment.app.FragmentActivity
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.datepicker.MaterialDatePicker
import com.qdd.R
import com.qdd.databinding.PageAddOneBinding
import com.qdd.ui.utils.AppKeyboard


class ViewAdapter(private val activity: FragmentActivity, private val viewModel: AddOneViewModel) :
    RecyclerView.Adapter<ViewAdapter.ViewHolder>() {
    private val itemCount = 2

    inner class ViewHolder(var view: PageAddOneBinding) : RecyclerView.ViewHolder(view.root) {
        init {
            view.lifecycleOwner = activity
            // Keyboard
            val keyboard =
                AppKeyboard(
                    view.editableMoney,
                    view.keyboardView,
                    R.xml.keyboard,
                    activity
                )
            keyboard.setup()

            // Date picker
            val datePicker =
                MaterialDatePicker.Builder.datePicker()
                    .setSelection(MaterialDatePicker.todayInUtcMilliseconds())
                    .build()
            view.valDatetime.setOnClickListener {
                datePicker.show(activity.supportFragmentManager, "TAG[DatePicker]")
            }

            view.resetDate.setOnClickListener {
                viewModel.updateDateToToday()
            }

            view.button.setOnClickListener {
                Log.d("ViewAdapter", "comments: ${viewModel.comments.value}")
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder = ViewHolder(
        PageAddOneBinding.inflate(LayoutInflater.from(parent.context), parent, false)
    )

    override fun getItemCount(): Int = itemCount

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        viewModel.isIncome.value = position == 1 // 0: expense 1: income
        viewModel.updateDateToToday()
        holder.view.viewModel = viewModel
    }
}