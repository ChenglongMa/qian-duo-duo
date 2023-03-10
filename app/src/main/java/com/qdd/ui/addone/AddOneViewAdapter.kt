package com.qdd.ui.addone

import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Filter
import android.widget.Filterable
import androidx.fragment.app.FragmentActivity
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.bottomsheet.BottomSheetBehavior
import com.google.android.material.datepicker.MaterialDatePicker
import com.qdd.databinding.PageAddOneBinding
import com.qdd.databinding.ProjectItemBinding
import com.qdd.model.Project
import java.util.*


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
//            // Keyboard
//            val keyboard =
//                AppKeyboard(
//                    binding.editableMoney,
//                    binding.keyboardView,
//                    R.xml.keyboard,
//                    activity,
//                    keyboardBottomBehavior
//                )
//            keyboard.setup()
            val keyboardDialog = KeyboardDialog(binding.editableMoney)
            binding.editableMoney.apply {
                onFocusChangeListener = View.OnFocusChangeListener { _: View, hasFocus: Boolean ->
                    if (hasFocus) {
                        keyboardDialog.show(activity.supportFragmentManager, "TAG[Keyboard]")
                    } else {
                        keyboardDialog.dismiss()
                    }
                }
                setOnClickListener {
                    keyboardDialog.show(activity.supportFragmentManager, "TAG[Keyboard]")
                }
            }


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
//                keyboard.hideKeyboard()
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
        holder.binding.viewModel = viewModel
    }
}


class ProjectItemAdapter(val viewModel: AddOneViewModel, private val onClick: (Project) -> Unit) :
    ListAdapter<Project, ProjectItemAdapter.ViewHolder>(ProjectDiffCallback), Filterable {
    companion object {
        const val TAG = "ProjectItemAdapter"
    }

    private lateinit var data: MutableList<Project>
    private lateinit var filteredList: MutableList<Project>
    fun initializeList(data: MutableList<Project>) {
        this.data = data
        this.filteredList = data
        this.submitList(data)
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

    override fun getFilter(): Filter = object : Filter() {
        override fun performFiltering(charSequence: CharSequence?): FilterResults {
            val query = charSequence.toString().lowercase(Locale.getDefault())
            filteredList = if (query.isEmpty()) {
                data.toMutableList() // ??????????????????????????????????????????
            } else {
                val list = mutableListOf<Project>()
                for (item in data) {
                    if (item.name.lowercase(Locale.getDefault()).contains(query)) {
                        list.add(item)
                    }
                }
                list // ???????????????????????????????????????????????????
            }
            return FilterResults().apply {
                values = filteredList
                count = filteredList.size
            }
        }

        @Suppress("UNCHECKED_CAST")
        override fun publishResults(charSequence: CharSequence?, filterResults: FilterResults?) {
            filteredList = filterResults?.values as? MutableList<Project> ?: mutableListOf()
            submitList(filteredList)
        }
    }
}

object ProjectDiffCallback : DiffUtil.ItemCallback<Project>() {
    override fun areItemsTheSame(oldItem: Project, newItem: Project): Boolean =
        oldItem.name == newItem.name

    override fun areContentsTheSame(oldItem: Project, newItem: Project): Boolean =
        oldItem.name == newItem.name

}
