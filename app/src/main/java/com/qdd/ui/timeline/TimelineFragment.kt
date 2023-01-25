package com.qdd.ui.timeline

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.RecyclerView
import com.qdd.databinding.FragmentTimelineBinding
import com.qdd.databinding.TimelineItemBinding
import com.qdd.model.Timeline
import java.sql.Date

class TimelineFragment : Fragment() {
    private var _binding: FragmentTimelineBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentTimelineBinding.inflate(inflater, container, false)

        (activity as AppCompatActivity).setSupportActionBar(binding.toolbar)


        val timelines = arrayListOf(
            Timeline(1, 1, Date(12341234), "Default Category", "Paid bill", 1200_000.00, true),
            Timeline(2, 1, Date(12345673), "Category", "Paid bill 2", 1_000.00, true),
            Timeline(3, 1, Date(12343333), "Category2", "Salary", 100.00, false),
        )
        binding.timelineList.adapter = TimelineAdapter(timelines)

        return binding.root
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    internal class TimelineAdapter(private val dataset: List<Timeline>) :
        RecyclerView.Adapter<TimelineAdapter.ViewHolder>() {

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            return ViewHolder(
                TimelineItemBinding.inflate(
                    LayoutInflater.from(parent.context),
                    parent,
                    false
                )
            )
        }

        override fun getItemCount() = dataset.size


        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
//            holder.view.timeline = dataset[position]
            // TODO
            holder.view.txtProject.text = "测试用"
            holder.view.txtComments.text = dataset[position].comments
        }

        inner class ViewHolder(var view: TimelineItemBinding) : RecyclerView.ViewHolder(view.root)
    }
}