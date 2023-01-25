package com.qdd.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.qdd.model.Timeline
import kotlinx.coroutines.flow.Flow

@Dao
interface TimelineDao {
    @Query("SELECT * FROM timeline ORDER BY date ASC")
    fun getTimelines(): Flow<List<Timeline>>

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insert(timeline: Timeline)

    @Query("DELETE FROM timeline")
    suspend fun deleteAll()
}