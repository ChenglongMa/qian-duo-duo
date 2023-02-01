package com.qdd.ui.timeline

import android.os.Bundle
import android.view.LayoutInflater
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
import dagger.hilt.android.AndroidEntryPoint


@AndroidEntryPoint
class TimelineFragment : Fragment() {
    private val viewModel: TimelineViewModel by viewModels()

    private lateinit var binding: FragmentTimelineBinding

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = FragmentTimelineBinding.inflate(inflater, container, false).apply {
            lifecycleOwner = this@TimelineFragment
        }

        (activity as AppCompatActivity).setSupportActionBar(binding.toolbar)
        val adapter = TimelineAdapter { timeline -> adapterOnClick(timeline) }

        val itemTouchHelper =
            ItemTouchHelper(
                ItemTouchCallback(
                    adapter, resources.getDimensionPixelSize(R.dimen.del_btn_width)
                )
            )
        binding.timelineList.apply {
            addItemDecoration(DividerItemDecoration(context, DividerItemDecoration.VERTICAL))
            this.adapter = adapter
            itemTouchHelper.attachToRecyclerView(this)
        }

        viewModel.allTimelines.observe(viewLifecycleOwner) {
            adapter.submitList(it as MutableList<TimelineWithX>)
        }

        binding.fabAddOne.setOnClickListener {
            addOneOnClick()
        }
        return binding.root
    }

    private fun addOneOnClick() {
        findNavController().navigate(TimelineFragmentDirections.actionNavTimelineToAddOneActivity())
    }

    private fun adapterOnClick(timeline: TimelineWithX) {
        Snackbar.make(
            binding.timelineList,
            "Not yet implemented, open details fragment",
            Snackbar.LENGTH_LONG
        ).show()
    }
}