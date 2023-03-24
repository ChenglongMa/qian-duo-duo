package com.qdd.ui.addone

import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.FragmentActivity
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.bottomsheet.BottomSheetBehavior
import com.google.android.material.datepicker.MaterialDatePicker
import com.qdd.R
import com.qdd.databinding.PageAddOneBinding
import com.qdd.ui.utils.AppKeyboard

class AddOneViewAdapter(
    private val activity: FragmentActivity,
    private val viewModel: AddOneViewModel
) :
    RecyclerView.Adapter<AddOneViewAdapter.ViewHolder>() {
    companion object {
        const val ITEM_COUNT = 2
    }


    inner class ViewHolder(var binding: PageAddOneBinding) : RecyclerView.ViewHolder(binding.root) {

        init {
            binding.lifecycleOwner = activity
            val keyboardBottomBehavior: BottomSheetBehavior<View> =
                BottomSheetBehavior.from(binding.keyboardBottomSheet)
            // Keyboard
            val keyboard =
                AppKeyboard(
                    binding.editableMoney,
                    binding.keyboardView,
                    R.xml.keyboard,
                    activity,
                    keyboardBottomBehavior
                )
            keyboard.setup()
//            val keyboardDialog = KeyboardDialog(binding.editableMoney)
//            binding.editableMoney.apply {
//                onFocusChangeListener = View.OnFocusChangeListener { _: View, hasFocus: Boolean ->
//                    if (hasFocus) {
//                        keyboardDialog.show(activity.supportFragmentManager, "TAG[Keyboard]")
//                    } else {
//                        keyboardDialog.dismiss()
//                    }
//                }
//                setOnClickListener {
//                    keyboardDialog.show(activity.supportFragmentManager, "TAG[Keyboard]")
//                }
//            }


            // Date picker
            val datePicker =
                MaterialDatePicker.Builder.datePicker()
                    .setSelection(MaterialDatePicker.todayInUtcMilliseconds())
                    .build()
            binding.valDatetime.setOnClickListener {
                datePicker.show(activity.supportFragmentManager, "TAG[DatePicker]")
            }

            binding.resetDate.setOnClickListener {
                viewModel.updateDateToToday()
            }

            binding.clearComments.setOnClickListener {
                viewModel.comments.value = ""
            }

            binding.button.setOnClickListener {
                Log.d("ViewAdapter", "comments: ${viewModel.comments.value}")
            }
            binding.rowProject.setOnClickListener {
                keyboard.hideKeyboard()
                ProjectListDialog().show(activity.supportFragmentManager, "TAG[ProjectListDialog]")
            }
            binding.rowCategory.setOnClickListener {
                keyboard.hideKeyboard()
                CategoryListDialog().show(
                    activity.supportFragmentManager,
                    "TAG[CategoryListDialog]"
                )
            }
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder = ViewHolder(
        PageAddOneBinding.inflate(LayoutInflater.from(parent.context), parent, false)
    )

    override fun getItemCount(): Int = ITEM_COUNT

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        viewModel.isIncome.value = position == 1 // 0: expense 1: income
        viewModel.updateDateToToday()
        holder.binding.viewModel = viewModel
    }
}