package com.qdd.ui.timeline

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.qdd.databinding.TimelineItemBinding
import com.qdd.model.TimelineWithX
import com.qdd.ui.utils.ItemTouchCallback

class TimelineAdapter(
    private val onClick: (TimelineWithX) -> Unit,
    private val onDeleteClick: (TimelineWithX) -> Unit
) :
    ListAdapter<TimelineWithX, TimelineAdapter.ViewHolder>(TimelineDiffCallback),
    ItemTouchCallback.ItemTouchStatus {

    private val TAG = "TimelineAdapter"
    public var prevItemView: RecyclerView.ViewHolder? = null

    inner class ViewHolder(
        var view: TimelineItemBinding,
        private val onClick: (TimelineWithX) -> Unit
    ) :
        RecyclerView.ViewHolder(view.root) {
        private var currentTimeline: TimelineWithX? = null

        init {
            view.materialCardView.setOnClickListener {
                currentTimeline?.let(onClick)
            }
            view.btnDelete.setOnClickListener { currentTimeline?.let(onDeleteClick) }
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

    // TODO: purpose?
    override fun onItemRemove(position: Int): Boolean = false

    override fun onSaveItemStatus(viewHolder: RecyclerView.ViewHolder) {
        // Do nothing
    }

    fun resetXPosition(view: View?) {
        if (view != prevItemView?.itemView) {
            prevItemView?.itemView?.scrollTo(0, 0)
            prevItemView = null
        }
    }
}

object TimelineDiffCallback : DiffUtil.ItemCallback<TimelineWithX>() {
    override fun areItemsTheSame(oldItem: TimelineWithX, newItem: TimelineWithX): Boolean =
        oldItem.timeline.id == newItem.timeline.id

    override fun areContentsTheSame(oldItem: TimelineWithX, newItem: TimelineWithX): Boolean =
        oldItem.timeline.id == newItem.timeline.id

}

