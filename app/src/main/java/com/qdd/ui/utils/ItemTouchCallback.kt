package com.qdd.ui.utils

import android.graphics.Canvas
import androidx.recyclerview.widget.ItemTouchHelper
import androidx.recyclerview.widget.RecyclerView
import kotlin.properties.Delegates

// refer to https://github.com/BeauteousJade/SlideDeleteDemo
class ItemTouchCallback(
    private val itemTouchStatus: ItemTouchStatus,
    private val defaultScrollX: Int
) : ItemTouchHelper.Callback() {

    private var initXWhenInactive by Delegates.notNull<Float>()
    private var currentScrollXWhenInactive by Delegates.notNull<Int>()
    private var firstInactive: Boolean = false
    private var currentScrollX by Delegates.notNull<Int>()

    override fun getMovementFlags(
        recyclerView: RecyclerView,
        viewHolder: RecyclerView.ViewHolder
    ): Int {
        val dragFlags = ItemTouchHelper.UP or ItemTouchHelper.DOWN
        val swipeFlags = ItemTouchHelper.LEFT or ItemTouchHelper.RIGHT
        return makeMovementFlags(dragFlags, swipeFlags)
    }

    override fun onMove(
        recyclerView: RecyclerView,
        viewHolder: RecyclerView.ViewHolder,
        target: RecyclerView.ViewHolder
    ): Boolean = true

    override fun onSwiped(viewHolder: RecyclerView.ViewHolder, direction: Int) {
        // Do nothing
    }

    override fun getSwipeThreshold(viewHolder: RecyclerView.ViewHolder): Float =
        Int.MAX_VALUE.toFloat()

    override fun getSwipeEscapeVelocity(defaultValue: Float): Float =
        Int.MAX_VALUE.toFloat()

    override fun onChildDraw(
        c: Canvas,
        recyclerView: RecyclerView,
        viewHolder: RecyclerView.ViewHolder,
        dX: Float,
        dY: Float,
        actionState: Int,
        isCurrentlyActive: Boolean
    ) {
        // 首次滑动时，记录下ItemView当前滑动的距离
        if (dX == 0f) {
            currentScrollX = viewHolder.itemView.scrollX
            firstInactive = true
        }
        if (isCurrentlyActive) { // 手指滑动
            // 基于当前的距离滑动
            viewHolder.itemView.scrollTo(currentScrollX + -dX.toInt(), 0)
        } else { // 动画滑动
            if (firstInactive) {
                firstInactive = false
                currentScrollXWhenInactive = viewHolder.itemView.scrollX
                initXWhenInactive = dX
            }
            if (viewHolder.itemView.scrollX >= defaultScrollX) {
                // 当手指松开时，ItemView的滑动距离大于给定阈值，那么最终就停留在阈值，显示删除按钮。
                viewHolder.itemView.scrollTo(
                    (currentScrollX + -dX.toInt()).coerceAtLeast(defaultScrollX), 0
                )
            } else {
                // 这里只能做距离的比例缩放，因为回到最初位置必须得从当前位置开始，dx不一定与ItemView的滑动距离相等
                viewHolder.itemView.scrollTo(
                    (currentScrollXWhenInactive * dX / initXWhenInactive).toInt(),
                    0
                )
            }
        }
    }

    override fun clearView(recyclerView: RecyclerView, viewHolder: RecyclerView.ViewHolder) {
        super.clearView(recyclerView, viewHolder)
        if (viewHolder.itemView.scrollX > defaultScrollX) {
            viewHolder.itemView.scrollTo(defaultScrollX, 0)
        } else if (viewHolder.itemView.scrollX < 0) {
            viewHolder.itemView.scrollTo(0, 0)
        }
        itemTouchStatus.onSaveItemStatus(viewHolder)
    }

    interface ItemTouchStatus {
        fun onItemRemove(position: Int): Boolean

        fun onSaveItemStatus(viewHolder: RecyclerView.ViewHolder)
    }
}