package com.qdd.ui.addone

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.activityViewModels
import androidx.recyclerview.widget.DividerItemDecoration
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.qdd.databinding.BottomSheetCategoryBinding
import com.qdd.model.CategoryWithChildren
import com.qdd.ui.utils.GlobalLayoutListener
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class CategoryListDialog : BottomSheetDialogFragment() {
    companion object {
        const val TAG = "CategoryListDialog"
    }

    private lateinit var binding: BottomSheetCategoryBinding

    private val viewModel: AddOneViewModel by activityViewModels()
    private val adapter: CategoryWithChildrenItemAdapter by lazy {
        CategoryWithChildrenItemAdapter(viewModel = viewModel) {
            viewModel.categoryName.value = it.category.name // TODO: change this
            this.dismiss()
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {

        binding = BottomSheetCategoryBinding.inflate(inflater, container, false)
        binding.categoryList.apply {
            adapter = this@CategoryListDialog.adapter
            addItemDecoration(DividerItemDecoration(context, DividerItemDecoration.VERTICAL))
//            setOnTouchListener { view: View?, event: MotionEvent? ->
//                view?.parent?.requestDisallowInterceptTouchEvent(true)
//                view?.onTouchEvent(event)
//                true
//            }
        }
//        binding.isNoCategory.visibility =
//            if (viewModel.projectName.value.isNullOrBlank()) View.VISIBLE else View.INVISIBLE
//        binding.noCategoryCard.setOnClickListener {
//            viewModel.projectName.value = null
//            this.dismiss()
//        }
        viewModel.allCategoriesWithChildren.observe(viewLifecycleOwner) {
            adapter.initializeList(it as MutableList<CategoryWithChildren>)
        }
        binding.btnDismiss.setOnClickListener {
            dismiss()
        }
        binding.txtSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(p0: CharSequence?, p1: Int, p2: Int, p3: Int) {
                // Do nothing
            }

            override fun onTextChanged(query: CharSequence?, p1: Int, p2: Int, p3: Int) {
                adapter.filter.filter(query)
            }

            override fun afterTextChanged(p0: Editable?) {
                // Do nothing
            }

        })

        val observer = binding.container.viewTreeObserver
        observer.addOnGlobalLayoutListener(
            GlobalLayoutListener(
                binding.container,
                binding.categoryList
            )
        )
        return binding.root

    }
}