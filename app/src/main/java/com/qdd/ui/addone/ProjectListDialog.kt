package com.qdd.ui.addone

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.activityViewModels
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.qdd.databinding.BottomSheetProjectBinding
import com.qdd.model.Project
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class ProjectListDialog : BottomSheetDialogFragment() {
    companion object {
        const val TAG = "ProjectListDialog"
    }

    private lateinit var binding: BottomSheetProjectBinding

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
            // TODO: add item decoration
//            addItemDecoration(DividerItemDecoration(context, DividerItemDecoration.VERTICAL))
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
            adapter.submitList(it as MutableList<Project>)
        }
        binding.btnDismiss.setOnClickListener {
            dismiss()
        }
        return binding.root

    }
}