package com.qdd.ui.utils

import android.graphics.Canvas
import android.util.Log
import androidx.recyclerview.widget.ItemTouchHelper
import androidx.recyclerview.widget.RecyclerView
import androidx.recyclerview.widget.RecyclerView.ViewHolder
import com.qdd.ui.timeline.TimelineAdapter
import kotlin.properties.Delegates

// refer to https://github.com/BeauteousJade/SlideDeleteDemo
class ItemTouchCallback(
    private val adapter: TimelineAdapter,
    private val defaultScrollX: Int
) : ItemTouchHelper.Callback() {

    private var initXWhenInactive by Delegates.notNull<Float>()
    private var currentScrollXWhenInactive by Delegates.notNull<Int>()
    private var firstInactive: Boolean = false
    private var currentScrollX by Delegates.notNull<Int>()

    //    private var prevViewHolder: ViewHolder? = null
    private val TAG = "ItemTouchCallback"

    override fun getMovementFlags(
        recyclerView: RecyclerView,
        viewHolder: ViewHolder
    ): Int {
        val dragFlags = ItemTouchHelper.UP or ItemTouchHelper.DOWN
        val swipeFlags = ItemTouchHelper.LEFT or ItemTouchHelper.RIGHT
        return makeMovementFlags(dragFlags, swipeFlags)
    }

    override fun onMove(
        recyclerView: RecyclerView,
        viewHolder: ViewHolder,
        target: ViewHolder
    ): Boolean {
        return adapter.onItemMove(viewHolder.bindingAdapterPosition, target.bindingAdapterPosition)
    }

    override fun onSwiped(viewHolder: ViewHolder, direction: Int) {
        Log.d(TAG, "onSwiped: ${viewHolder.bindingAdapterPosition}")
        adapter.notifyItemChanged(viewHolder.bindingAdapterPosition)
    }

    override fun getSwipeThreshold(viewHolder: ViewHolder): Float =
        Int.MAX_VALUE.toFloat()

    override fun getSwipeEscapeVelocity(defaultValue: Float): Float =
        Int.MAX_VALUE.toFloat()

    override fun onChildDraw(
        c: Canvas,
        recyclerView: RecyclerView,
        viewHolder: ViewHolder,
        dX: Float,
        dY: Float,
        actionState: Int,
        isCurrentlyActive: Boolean
    ) {
        // ???????????????????????????ItemView?????????????????????
        if (dX == 0f) {
            currentScrollX = viewHolder.itemView.scrollX
            firstInactive = true
        }
        if (isCurrentlyActive) { // ????????????
            // ???????????????????????????
            viewHolder.itemView.scrollTo(currentScrollX + -dX.toInt(), 0)
        } else { // ????????????
            if (firstInactive) {
                firstInactive = false
                currentScrollXWhenInactive = viewHolder.itemView.scrollX
                initXWhenInactive = dX
            }
            if (viewHolder.itemView.scrollX >= defaultScrollX) {
                // ?????????????????????ItemView??????????????????????????????????????????????????????????????????????????????????????????
                viewHolder.itemView.scrollTo(
                    (currentScrollX + -dX.toInt()).coerceAtLeast(defaultScrollX), 0
                )
                adapter.resetXPosition(viewHolder.itemView)
//                prevViewHolder = viewHolder
                adapter.prevItemView = viewHolder
            } else {
                // ????????????????????????????????????????????????????????????????????????????????????????????????dx????????????ItemView?????????????????????
                viewHolder.itemView.scrollTo(
                    (currentScrollXWhenInactive * dX / initXWhenInactive).toInt(),
                    0
                )
            }
        }
    }

    override fun clearView(recyclerView: RecyclerView, viewHolder: ViewHolder) {
        super.clearView(recyclerView, viewHolder)
        val scrollX = viewHolder.itemView.scrollX
        if (scrollX > defaultScrollX) {
            viewHolder.itemView.scrollTo(defaultScrollX, 0)
        } else if (scrollX < 0) {
            viewHolder.itemView.scrollTo(0, 0)
        }
//        itemTouchStatus.onSaveItemStatus(viewHolder)
    }

    interface ItemTouchStatus {
        fun onItemMove(fromPosition: Int, toPosition: Int): Boolean
        fun onItemRemove(position: Int): Boolean

        fun onSaveItemStatus(viewHolder: ViewHolder)
        fun onItemDismiss(position: Int)
    }
}