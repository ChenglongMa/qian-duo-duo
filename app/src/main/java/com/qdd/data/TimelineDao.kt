package com.qdd.data

import androidx.room.*
import com.qdd.model.Timeline
//import com.qdd.model.TimelineWithProject
import kotlinx.coroutines.flow.Flow

@Dao
interface TimelineDao {
    @Query("SELECT * FROM timeline ORDER BY date DESC")
    fun getTimelines(): Flow<List<Timeline>>

//    @Transaction
//    @Query("SELECT * FROM timeline")
//    fun getTimelinesWithProject(): List<TimelineWithProject>

    @Insert
    suspend fun insert(vararg timelines: Timeline)

    @Query("DELETE FROM timeline")
    suspend fun deleteAll()

    @Update
    fun update(vararg timelines: Timeline)
    @Delete
    fun delete(vararg timelines: Timeline)
}