package com.qdd.repository

import androidx.annotation.WorkerThread
import com.qdd.dao.TimelineDao
import com.qdd.model.Timeline
import kotlinx.coroutines.flow.Flow

class TimelineRepository(private val dao: TimelineDao) {
    // Room executes all queries on a separate thread.
    // Observed Flow will notify the observer when the data has changed.
    val allTimelines: Flow<List<Timeline>> = dao.getTimelines()

    // By default Room runs suspend queries off the main thread, therefore, we don't need to
    // implement anything else to ensure we're not doing long running database work
    // off the main thread.
//    @Suppress("RedundantSuspendModifier")
    @WorkerThread
    suspend fun insert(timeline: Timeline) {
        dao.insert(timeline)
    }
}