package com.qdd.ui.timeline

import android.os.Bundle
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.DividerItemDecoration
import androidx.recyclerview.widget.ItemTouchHelper
import com.google.android.material.snackbar.Snackbar
import com.qdd.R
import com.qdd.databinding.FragmentTimelineBinding
import com.qdd.model.TimelineWithX
import com.qdd.ui.utils.ItemTouchCallback
import com.qdd.ui.utils.createDeleteDialog
import com.qdd.ui.utils.showSnackbar
import dagger.hilt.android.AndroidEntryPoint


@AndroidEntryPoint
class TimelineFragment : Fragment(), View.OnTouchListener {
    private val adapter: TimelineAdapter by lazy {
        TimelineAdapter(onClick = { timeline -> adapterOnClick(timeline) },
            onDeleteClick = { timeline -> adapterOnDeleteClick(timeline) })
    }
//    private val adapter: TimelineAdapter =
//        TimelineAdapter(onClick = { timeline -> adapterOnClick(timeline) },
//            onDeleteClick = { timeline -> adapterOnDeleteClick(timeline) })


    private val viewModel: TimelineViewModel by viewModels()

    private lateinit var binding: FragmentTimelineBinding
    private lateinit var itemTouchHelper: ItemTouchHelper

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = FragmentTimelineBinding.inflate(inflater, container, false).apply {
            lifecycleOwner = this@TimelineFragment
        }

        (activity as AppCompatActivity).setSupportActionBar(binding.toolbar)

        itemTouchHelper = ItemTouchHelper(
            ItemTouchCallback(
                adapter,
                resources.getDimensionPixelSize(R.dimen.del_btn_width)
            )
        )
        binding.timelineList.apply {
            addItemDecoration(DividerItemDecoration(context, DividerItemDecoration.VERTICAL))
            adapter = this@TimelineFragment.adapter
            itemTouchHelper.attachToRecyclerView(this)
            setOnTouchListener(this@TimelineFragment)
        }

        viewModel.allTimelines.observe(viewLifecycleOwner) {
            adapter.submitList(it as MutableList<TimelineWithX>)
            binding.promptView.visibility = if (it.isEmpty()) View.VISIBLE else View.GONE
            binding.timelineList.visibility = if (it.isEmpty()) View.GONE else View.VISIBLE
        }

        binding.fabAddOne.apply {
            setOnClickListener {
                addOneOnClick()
            }
            setOnTouchListener(this@TimelineFragment)
        }
        val rootView = binding.root
        rootView.setOnTouchListener(this)
        return rootView
    }


    private fun addOneOnClick() {
        findNavController().navigate(TimelineFragmentDirections.actionNavTimelineToAddOneActivity())
    }

    private fun adapterOnClick(timeline: TimelineWithX) {
//        itemTouchHelper.attachToRecyclerView(null)
//        itemTouchHelper.attachToRecyclerView(binding.timelineList)
        Snackbar.make(
            requireActivity().findViewById(android.R.id.content),
            "Not yet implemented, open details fragment",
            Snackbar.LENGTH_LONG
        ).setAnchorView(binding.fabAddOne)
            .show()
    }

    private fun adapterOnDeleteClick(timeline: TimelineWithX) {
        requireContext().createDeleteDialog {
            viewModel.archive(timeline) // TODO: verify if deleted successfully
            requireActivity().showSnackbar(
                R.string.timeline_deleted,
                anchorView = requireActivity().findViewById(R.id.nav_view),
            ) { viewModel.unarchive(timeline) }
        }.show()
    }

    override fun onTouch(view: View?, event: MotionEvent?): Boolean {
        when (event?.action) {
            MotionEvent.ACTION_UP -> {
                view?.performClick()
                adapter.resetXPosition(view)
            }
            else -> {}
        }

        return view?.onTouchEvent(event) ?: true
    }
}