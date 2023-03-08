package com.qdd.ui.addone

import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.FragmentActivity
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.bottomsheet.BottomSheetBehavior
import com.google.android.material.datepicker.MaterialDatePicker
import com.qdd.R
import com.qdd.databinding.PageAddOneBinding
import com.qdd.databinding.ProjectItemBinding
import com.qdd.model.Project
import com.qdd.ui.utils.AppKeyboard


class AddOneViewAdapter(
    private val activity: FragmentActivity,
    private val viewModel: AddOneViewModel
) :
    RecyclerView.Adapter<AddOneViewAdapter.ViewHolder>() {
    companion object {
        const val ITEM_COUNT = 2
    }


    inner class ViewHolder(var view: PageAddOneBinding) : RecyclerView.ViewHolder(view.root) {

        init {
            view.lifecycleOwner = activity
            val keyboardBottomBehavior: BottomSheetBehavior<View> =
                BottomSheetBehavior.from(view.keyboardBottomSheet)
            // Keyboard
            val keyboard =
                AppKeyboard(
                    view.editableMoney,
                    view.keyboardView,
                    R.xml.keyboard,
                    activity,
                    keyboardBottomBehavior
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

            view.clearComments.setOnClickListener {
                viewModel.comments.value = ""
            }

            view.button.setOnClickListener {
                Log.d("ViewAdapter", "comments: ${viewModel.comments.value}")
            }
            view.rowProject.setOnClickListener {
                keyboard.hideKeyboard()
                ProjectListDialog().show(activity.supportFragmentManager, "TAG[ProjectListDialog]")
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
        holder.view.viewModel = viewModel
    }
}


class ProjectItemAdapter(val viewModel: AddOneViewModel, private val onClick: (Project) -> Unit) :
    ListAdapter<Project, ProjectItemAdapter.ViewHolder>(ProjectDiffCallback) {
    companion object {
        const val TAG = "ProjectItemAdapter"
    }

    inner class ViewHolder(
        val binding: ProjectItemBinding,
        private val onClick: (Project) -> Unit
    ) :
        RecyclerView.ViewHolder(binding.root) {
        private var currentProject: Project? = null

        init {
            binding.projectCard.setOnClickListener {
                currentProject?.let {
                    onClick(it)
                }
                Log.d(TAG, "ProjectItemOnClick: clicked ${currentProject?.name}")
            }
        }

        fun bind(project: Project) {
            currentProject = project
            binding.project = project
            binding.isSelected.visibility =
                if (project.name == viewModel.projectName.value) View.VISIBLE else View.INVISIBLE
            Log.d(TAG, "ProjectItem: bind project ${project.name} ${viewModel.projectName.value}")
        }
    }

    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int
    ): ProjectItemAdapter.ViewHolder = ViewHolder(
        ProjectItemBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        ), onClick
    )

    override fun onBindViewHolder(holder: ProjectItemAdapter.ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }
}

object ProjectDiffCallback : DiffUtil.ItemCallback<Project>() {
    override fun areItemsTheSame(oldItem: Project, newItem: Project): Boolean =
        oldItem.name == newItem.name

    override fun areContentsTheSame(oldItem: Project, newItem: Project): Boolean =
        oldItem.name == newItem.name

}
