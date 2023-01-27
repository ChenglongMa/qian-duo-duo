package com.qdd.ui.timeline

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.qdd.databinding.TimelineItemBinding
import com.qdd.model.Timeline

class TimelineAdapter(private val onClick: (Timeline) -> Unit) :
    ListAdapter<Timeline, TimelineAdapter.ViewHolder>(TimelineDiffCallback) {
    inner class ViewHolder(var view: TimelineItemBinding, private val onClick: (Timeline) -> Unit) :
        RecyclerView.ViewHolder(view.root) {
        private var currentTimeline: Timeline? = null

        init {
            view.root.setOnClickListener {
                currentTimeline?.let(onClick)
            }
        }

        fun bind(timeline: Timeline) {
            currentTimeline = timeline
            view.timeline = timeline
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        return ViewHolder(
            TimelineItemBinding.inflate(
                LayoutInflater.from(parent.context),
                parent,
                false
            ), onClick
        )
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }
}

object TimelineDiffCallback : DiffUtil.ItemCallback<Timeline>() {
    override fun areItemsTheSame(oldItem: Timeline, newItem: Timeline): Boolean =
        oldItem.id == newItem.id

    override fun areContentsTheSame(oldItem: Timeline, newItem: Timeline): Boolean =
        oldItem.id == newItem.id

}

class TimelineAdapter2(private val dataset: List<Timeline>) :
    RecyclerView.Adapter<TimelineAdapter2.ViewHolder>() {
    inner class ViewHolder(var view: TimelineItemBinding) : RecyclerView.ViewHolder(view.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        return ViewHolder(
            TimelineItemBinding.inflate(
                LayoutInflater.from(parent.context),
                parent,
                false
            )
        )
    }

    override fun getItemCount(): Int = dataset.size

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.view.timeline = dataset[position]
    }

}