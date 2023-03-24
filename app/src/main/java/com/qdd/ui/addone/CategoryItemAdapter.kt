package com.qdd.ui.addone

import android.util.Log
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.qdd.databinding.SubCategoryItemBinding
import com.qdd.model.Category
import com.qdd.ui.utils.DiffCallback

class CategoryItemAdapter(val viewModel: AddOneViewModel, private val onClick: (Category) -> Unit) :
    ListAdapter<Category, CategoryItemAdapter.ViewHolder>(
        DiffCallback<Category> { oldItem, newItem ->
            oldItem.name == newItem.name
        }
    ) {
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
                    binding.subCategoryCard.isChecked = true
                    onClick(it)
                }
                Log.d(TAG, "CategoryItemOnClick: clicked ${currentCategory?.name}")
            }
        }

        fun bind(category: Category) {
            currentCategory = category
            binding.category = category
            val categoryName = viewModel.subCategoryName
            binding.subCategoryCard.isChecked = category.name == categoryName

            Log.d(
                TAG,
                "CategoryItem: bind category ${category.name} ${viewModel.subCategoryName}"
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