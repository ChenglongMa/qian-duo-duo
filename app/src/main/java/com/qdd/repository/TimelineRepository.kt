package com.qdd.repository

import androidx.annotation.WorkerThread
import com.qdd.data.CategoryDao
import com.qdd.data.ProjectDao
import com.qdd.data.TimelineDao
import com.qdd.model.Category
import com.qdd.model.Project
import com.qdd.model.Timeline
import com.qdd.model.TimelineWithX
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

interface TimelineRepository {
    val allTimelines: Flow<List<Timeline>>
    val allTimelineWithXs: Flow<List<TimelineWithX>>

    @WorkerThread
    suspend fun insert(vararg timeline: Timeline)

    @WorkerThread
    suspend fun insert(project: Project, category: Category, vararg timeline: Timeline)

    suspend fun insert(vararg timeline: TimelineWithX)
    suspend fun delete(timeline: Timeline)
    suspend fun archive(timeline: Timeline)
    suspend fun unarchive(timeline: Timeline)
}

class DefaultTimelineRepository @Inject constructor(
    private val timelineDao: TimelineDao,
    private val projectDao: ProjectDao,
    private val categoryDao: CategoryDao
) :
    TimelineRepository {
    // Room executes all queries on a separate thread.
    // Observed Flow will notify the observer when the data has changed.
    override val allTimelines: Flow<List<Timeline>> = timelineDao.getTimelines()
    override val allTimelineWithXs: Flow<List<TimelineWithX>> = timelineDao.getTimelinesWithX()

    // By default Room runs suspend queries off the main thread, therefore, we don't need to
    // implement anything else to ensure we're not doing long running database work
    // off the main thread.
//    @Suppress("RedundantSuspendModifier")
    override suspend fun insert(vararg timeline: Timeline) {
        timelineDao.insert(*timeline)
    }

    override suspend fun insert(project: Project, category: Category, vararg timeline: Timeline) {
        val projectInDb = projectDao.getProjectByName(project.name)
        if (projectInDb == null) {
            projectDao.insert(project)
        }
        val categoryInDb = categoryDao.getCategoryByName(category.name)
        if (categoryInDb == null) {
            categoryDao.insert(category)
        }
        insert(*timeline)
    }

    override suspend fun insert(vararg timeline: TimelineWithX) {
        timeline.forEach {
            insert(it.project, it.category, it.timeline)
        }
    }

    override suspend fun archive(timeline: Timeline) {
        timelineDao.archive(timeline.id)
    }

    override suspend fun unarchive(timeline: Timeline) {
        timelineDao.unarchive(timeline.id)
    }

    override suspend fun delete(timeline: Timeline) {
        timelineDao.delete(timeline)
    }
}