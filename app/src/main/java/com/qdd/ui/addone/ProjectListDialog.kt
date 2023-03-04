package com.qdd.ui.addone

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.DividerItemDecoration
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.qdd.databinding.BottomSheetProjectBinding
import com.qdd.model.Project
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class ProjectListDialog(private val onSelected: (Project) -> Unit) : BottomSheetDialogFragment() {
    companion object {
        const val TAG = "ProjectListDialog"
    }

    private lateinit var binding: BottomSheetProjectBinding
    private val viewModel: AddOneViewModel by viewModels()
    private val adapter: ProjectItemAdapter by lazy {
        ProjectItemAdapter(viewModel = viewModel) {
            onSelected(it)
            this.dismiss()
            Log.d(TAG, "Dialog: dismiss.")
        }
    }

    //    @SuppressLint("ClickableViewAccessibility")
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
        viewModel.allProjects.observe(viewLifecycleOwner) {
            adapter.submitList(it as MutableList<Project>)
        }
        binding.btnDismiss.setOnClickListener {
            dismiss()
        }
        return binding.root

    }
}