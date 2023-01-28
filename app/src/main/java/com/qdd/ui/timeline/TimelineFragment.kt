package com.qdd.ui.timeline

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.DividerItemDecoration
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.qdd.databinding.FragmentTimelineBinding
import com.qdd.model.Category
import com.qdd.model.Project
import com.qdd.model.Timeline
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import java.sql.Date


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
        val adapter = TimelineAdapter{timeline -> adapterOnClick(timeline) }

        binding.timelineList.apply {
            addItemDecoration(DividerItemDecoration(context, DividerItemDecoration.VERTICAL))
            this.adapter = adapter
        }
        viewModel.allTimelines.observe(viewLifecycleOwner) {
            adapter.submitList(it as MutableList<Timeline>)
        }
        var timeline = Timeline(
            project = Project(name = "项目1"),
            category = Category("原材料->钢材"),
            comments = "备注：购买钢板等。",
            money = 120.00,
            isPayment = true,
            date = Date(System.currentTimeMillis())
        )
//        viewModel.insert(timeline)
        timeline = Timeline(
            project = Project(name = "项目2"),
            category = Category("预付款"),
            comments = "备注：收老王",
            money = 100_00.50,
            isPayment = false,
            date = Date(System.currentTimeMillis())
        )
//        viewModel.insert(timeline)

        binding.fabAddOne.setOnClickListener {
            val timeline = Timeline(
                project = Project(name = "项目1"),
                category = Category("原材料->钢材"),
                comments = "备注：购买钢板等。",
                money = 120.00,
                isPayment = true,
                date = Date(System.currentTimeMillis())
            )
        viewModel.insert(timeline)
//            addOneOnClick()
        }
        return binding.root
    }

    private fun addOneOnClick() {
        TODO("Not yet implemented")
    }

    private fun adapterOnClick(timeline: Timeline) {
        TODO("Not yet implemented, open details fragment")
    }
}