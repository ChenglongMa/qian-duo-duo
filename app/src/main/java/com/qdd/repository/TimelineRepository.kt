package com.qdd.repository

import androidx.annotation.WorkerThread
import com.qdd.data.TimelineDao
import com.qdd.model.Timeline
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

interface TimelineRepository {
    val allTimelines: Flow<List<Timeline>>

    @WorkerThread
    suspend fun insert(timeline: Timeline)
}

class DefaultTimelineRepository @Inject constructor(private val dao: TimelineDao) :
    TimelineRepository {
    // Room executes all queries on a separate thread.
    // Observed Flow will notify the observer when the data has changed.
    override val allTimelines: Flow<List<Timeline>> = dao.getTimelines()

    // By default Room runs suspend queries off the main thread, therefore, we don't need to
    // implement anything else to ensure we're not doing long running database work
    // off the main thread.
//    @Suppress("RedundantSuspendModifier")
    override suspend fun insert(timeline: Timeline) {
        dao.insert(timeline)
    }
}