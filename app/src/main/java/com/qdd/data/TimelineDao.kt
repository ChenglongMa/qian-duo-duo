package com.qdd.data

import androidx.room.*
import com.qdd.model.Category
import com.qdd.model.Project
import com.qdd.model.Timeline
import com.qdd.model.TimelineWithX
//import com.qdd.model.TimelineWithProject
import kotlinx.coroutines.flow.Flow

@Dao
interface TimelineDao {
    @Query("SELECT * FROM timeline ORDER BY date DESC")
    fun getTimelines(): Flow<List<Timeline>>

    @Transaction
    @Query("SELECT * FROM timeline ORDER BY date DESC")
    fun getTimelinesWithX(): Flow<List<TimelineWithX>>

    @Insert
    suspend fun insert(vararg timelines: Timeline)

    @Query("DELETE FROM timeline")
    suspend fun deleteAll()

    @Update
    fun update(vararg timelines: Timeline)

    @Delete
    fun delete(vararg timelines: Timeline)
}