package com.qdd.ui.timeline

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.qdd.databinding.TimelineItemBinding
import com.qdd.model.TimelineWithX

class TimelineAdapter(private val onClick: (TimelineWithX) -> Unit) :
    ListAdapter<TimelineWithX, TimelineAdapter.ViewHolder>(TimelineDiffCallback) {
    inner class ViewHolder(
        var view: TimelineItemBinding,
        private val onClick: (TimelineWithX) -> Unit
    ) :
        RecyclerView.ViewHolder(view.root) {
        private var currentTimeline: TimelineWithX? = null

        init {
            view.root.setOnClickListener {
                currentTimeline?.let(onClick)
            }
        }

        fun bind(timeline: TimelineWithX) {
            currentTimeline = timeline
            view.timeline = timeline
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder =
        ViewHolder(
            TimelineItemBinding.inflate(
                LayoutInflater.from(parent.context),
                parent,
                false
            ), onClick
        )


    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }
}

object TimelineDiffCallback : DiffUtil.ItemCallback<TimelineWithX>() {
    override fun areItemsTheSame(oldItem: TimelineWithX, newItem: TimelineWithX): Boolean =
        oldItem.timeline.id == newItem.timeline.id

    override fun areContentsTheSame(oldItem: TimelineWithX, newItem: TimelineWithX): Boolean =
        oldItem.timeline.id == newItem.timeline.id

}

class TimelineAdapter2(private val dataset: List<TimelineWithX>) :
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