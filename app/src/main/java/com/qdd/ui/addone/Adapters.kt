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
import com.qdd.R
import com.qdd.databinding.CategoryItemBinding
import com.qdd.databinding.PageAddOneBinding
import com.qdd.databinding.ProjectItemBinding
import com.qdd.databinding.SubCategoryItemBinding
import com.qdd.model.Category
import com.qdd.model.CategoryWithChildren
import com.qdd.model.Project
import com.qdd.ui.utils.AppKeyboard
import com.qdd.ui.utils.SearchFilter


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

// ================================================================================================
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

    override fun getFilter(): Filter = SearchFilter(
        data,
        process = { item, query ->
            if (item.name.contains(query, ignoreCase = true)) item else null
        },
        publishResults = { submitList(it) })
}

object ProjectDiffCallback : DiffUtil.ItemCallback<Project>() {
    override fun areItemsTheSame(oldItem: Project, newItem: Project): Boolean =
        oldItem.name == newItem.name

    override fun areContentsTheSame(oldItem: Project, newItem: Project): Boolean =
        oldItem.name == newItem.name

}

// ================================================================================================
class CategoryWithChildrenItemAdapter(
    val viewModel: AddOneViewModel,
    private val onClick: (CategoryWithChildren) -> Unit
) :
    ListAdapter<CategoryWithChildren, CategoryWithChildrenItemAdapter.ViewHolder>(
        CategoryWithChildrenDiffCallback
    ),
    Filterable {
    companion object {
        const val TAG = "CategoryWithChildrenItemAdapter"
    }


    private lateinit var data: MutableList<CategoryWithChildren>
    private lateinit var filteredList: MutableList<CategoryWithChildren>
    fun initializeList(data: MutableList<CategoryWithChildren>) {
        this.data = data
        this.filteredList = data
        this.submitList(data)
    }

    inner class ViewHolder(
        val binding: CategoryItemBinding,
        private val onClick: (CategoryWithChildren) -> Unit
    ) :
        RecyclerView.ViewHolder(binding.root) {
        private var currentCategory: CategoryWithChildren? = null
        private val adapter: CategoryItemAdapter by lazy {
            CategoryItemAdapter(viewModel = viewModel) {
                viewModel.projectName.value = it.name// TODO: change this
            }
        }

        init {
            binding.categoryCard.setOnClickListener {
                currentCategory?.let {
                    onClick(it)
                }
                Log.d(TAG, "CategoryItemOnClick: clicked ${currentCategory?.category?.name}")
            }

            binding.subCategoryList.adapter = adapter
        }

        fun bind(category: CategoryWithChildren) {
            currentCategory = category
            binding.category = category
            adapter.submitList(category.categories)
//            binding.isSelected.visibility =
//                if (category.name == viewModel.categoryName.value) View.VISIBLE else View.INVISIBLE
            Log.d(
                TAG,
                "CategoryItem: bind category ${category.category.name} ${viewModel.categoryName.value}"
            )
        }
    }

    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int
    ): CategoryWithChildrenItemAdapter.ViewHolder = ViewHolder(
        CategoryItemBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        ), onClick
    )

    override fun onBindViewHolder(
        holder: CategoryWithChildrenItemAdapter.ViewHolder,
        position: Int
    ) {
        holder.bind(getItem(position))
    }

    override fun getFilter(): Filter = SearchFilter(data, process = { item, query ->

        // If parent category contains query
        if (item.category.name.contains(query, ignoreCase = true))
            item
        else {
            // If children categories contains query
            val filteredList = item.categories.filter { it.name.contains(query, ignoreCase = true) }
            if (filteredList.isNotEmpty()) {
                CategoryWithChildren(item.category, filteredList)
            }
            // Otherwise return empty
            null
        }

    }, publishResults = { submitList(it) })
}

object CategoryWithChildrenDiffCallback : DiffUtil.ItemCallback<CategoryWithChildren>() {
    override fun areItemsTheSame(
        oldItem: CategoryWithChildren,
        newItem: CategoryWithChildren
    ): Boolean =
        oldItem.category.name == newItem.category.name

    override fun areContentsTheSame(
        oldItem: CategoryWithChildren,
        newItem: CategoryWithChildren
    ): Boolean =
        oldItem.category.name == newItem.category.name

}

// ================================================================================================
class CategoryItemAdapter(val viewModel: AddOneViewModel, private val onClick: (Category) -> Unit) :
    ListAdapter<Category, CategoryItemAdapter.ViewHolder>(CategoryDiffCallback) {
    companion object {
        const val TAG = "CategoryItemAdapter"
    }
//
//    private lateinit var data: MutableList<Category>
//    private lateinit var filteredList: MutableList<Category>
//    fun initializeList(data: MutableList<Category>) {
//        this.data = data
//        this.filteredList = data
//        this.submitList(data)
//    }

    inner class ViewHolder(
        val binding: SubCategoryItemBinding,
        private val onClick: (Category) -> Unit
    ) :
        RecyclerView.ViewHolder(binding.root) {
        private var currentCategory: Category? = null

        init {
            binding.subCategoryCard.setOnClickListener {
                currentCategory?.let {
                    onClick(it)
                }
                Log.d(TAG, "CategoryItemOnClick: clicked ${currentCategory?.name}")
            }
        }

        fun bind(category: Category) {
            currentCategory = category
            binding.category = category
            Log.d(
                TAG,
                "CategoryItem: bind category ${category.name} ${viewModel.categoryName.value}"
            )
        }
    }

    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int
    ): CategoryItemAdapter.ViewHolder = ViewHolder(
        SubCategoryItemBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        ), onClick
    )

    override fun onBindViewHolder(holder: CategoryItemAdapter.ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }
}

object CategoryDiffCallback : DiffUtil.ItemCallback<Category>() {
    override fun areItemsTheSame(oldItem: Category, newItem: Category): Boolean =
        oldItem.name == newItem.name

    override fun areContentsTheSame(oldItem: Category, newItem: Category): Boolean =
        oldItem.name == newItem.name

}

