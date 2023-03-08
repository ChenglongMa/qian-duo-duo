package com.qdd.ui.addone

import android.graphics.Rect
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.ViewTreeObserver
import androidx.fragment.app.activityViewModels
import androidx.recyclerview.widget.DividerItemDecoration
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.qdd.databinding.BottomSheetProjectBinding
import com.qdd.model.Project
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class ProjectListDialog : BottomSheetDialogFragment(), ViewTreeObserver.OnGlobalLayoutListener {
    companion object {
        const val TAG = "ProjectListDialog"
    }

    private lateinit var binding: BottomSheetProjectBinding
    private var isKeyboardOpen = false

    private val viewModel: AddOneViewModel by activityViewModels()
    private val adapter: ProjectItemAdapter by lazy {
        ProjectItemAdapter(viewModel = viewModel) {
            viewModel.projectName.value = it.name
            this.dismiss()
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {

        binding = BottomSheetProjectBinding.inflate(inflater, container, false)
        binding.projectList.apply {
            adapter = this@ProjectListDialog.adapter
            addItemDecoration(DividerItemDecoration(context, DividerItemDecoration.VERTICAL))
//            setOnTouchListener { view: View?, event: MotionEvent? ->
//                view?.parent?.requestDisallowInterceptTouchEvent(true)
//                view?.onTouchEvent(event)
//                true
//            }
        }
        binding.isNoProject.visibility =
            if (viewModel.projectName.value.isNullOrBlank()) View.VISIBLE else View.INVISIBLE
        binding.noProjectCard.setOnClickListener {
            viewModel.projectName.value = null
            this.dismiss()
        }
        viewModel.allProjects.observe(viewLifecycleOwner) {
            adapter.initializeList(it as MutableList<Project>)
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
        observer.addOnGlobalLayoutListener(this)
        return binding.root

    }

    override fun onGlobalLayout() {
        val r = Rect()
        binding.container.getWindowVisibleDisplayFrame(r)
        val screenHeight = binding.container.rootView.height
        val keyboardHeight = screenHeight - r.bottom

        if (keyboardHeight > screenHeight / 4) { // 0.25 ratio is perhaps enough to determine keypad height.
            if (!isKeyboardOpen) {
                isKeyboardOpen = true
                binding.projectList.setPadding(0, 0, 0, keyboardHeight)
            }
        } else {
            if (isKeyboardOpen) {
                isKeyboardOpen = false
                binding.projectList.setPadding(0, 0, 0, 0)
            }
        }
    }
}