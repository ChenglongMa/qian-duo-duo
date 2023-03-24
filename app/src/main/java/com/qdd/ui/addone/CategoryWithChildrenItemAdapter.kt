package com.qdd.ui.addone

import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Filter
import android.widget.Filterable
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.qdd.databinding.CategoryItemBinding
import com.qdd.model.Category
import com.qdd.model.CategoryWithChildren
import com.qdd.ui.utils.DiffCallback
import com.qdd.ui.utils.SearchFilter

// ================================================================================================
class CategoryWithChildrenItemAdapter(
    val viewModel: AddOneViewModel,
    private val onClick: (Category) -> Unit
) :
    ListAdapter<CategoryWithChildren, CategoryWithChildrenItemAdapter.ViewHolder>(
        DiffCallback<CategoryWithChildren> { oldItem, newItem ->
            oldItem.category.name == newItem.category.name
        }
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
        private val onClick: (Category) -> Unit
    ) :
        RecyclerView.ViewHolder(binding.root) {
        private var currentCategory: CategoryWithChildren? = null
        private val adapter: CategoryItemAdapter by lazy {
            CategoryItemAdapter(viewModel = viewModel) {
                onClick(it)
            }
        }

        init {
            binding.categoryCard.setOnClickListener {
                binding.btnExpand.isChecked = !binding.btnExpand.isChecked
            }

            binding.subCategoryList.adapter = adapter

            binding.btnExpand.setOnCheckedChangeListener { _, checked ->
                val direction = if (checked) 0F else -1F
                binding.subCategoryList.animate()
                    .translationY(direction * binding.subCategoryList.height)
                    .alpha(if (checked) 1F else 0F)
                    .setUpdateListener { _ ->
                        binding.subCategoryList.visibility =
                            if (checked) View.VISIBLE else View.GONE
                    }
            }
        }

        fun bind(category: CategoryWithChildren) {
            currentCategory = category
            binding.category = category
            val categoryName = viewModel.subCategoryName
            binding.categoryCard.isChecked = category.category.name == categoryName
            val parentCategoryName = viewModel.parentCategoryName
            Log.d(TAG, "checked: ${binding.btnExpand.isChecked}")
            binding.btnExpand.isChecked =
                parentCategoryName.isNullOrBlank() || category.category.name == parentCategoryName
            Log.d(TAG, "after checked: ${binding.btnExpand.isChecked}")

            adapter.submitList(category.categories)
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