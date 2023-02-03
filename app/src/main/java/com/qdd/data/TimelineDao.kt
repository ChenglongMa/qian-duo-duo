package com.qdd.data

//import com.qdd.model.TimelineWithProject
import androidx.room.*
import com.qdd.model.Timeline
import com.qdd.model.TimelineWithX
import kotlinx.coroutines.flow.Flow

@Dao
interface TimelineDao {
    @Query("SELECT * FROM timeline WHERE archived = 0 ORDER BY date DESC")
    fun getTimelines(): Flow<List<Timeline>>

    @Transaction
    @Query("SELECT * FROM timeline WHERE archived = 0 ORDER BY date DESC")
    fun getTimelinesWithX(): Flow<List<TimelineWithX>>

    @Insert
    suspend fun insert(vararg timelines: Timeline)

    @Query("DELETE FROM timeline")
    suspend fun deleteAll()

    @Query("UPDATE timeline SET archived = 1 WHERE id = :id")
    suspend fun archive(id: Long)

    @Query("UPDATE timeline SET archived = 0 WHERE id = :id")
    suspend fun unarchive(id: Long)

    @Update
    fun update(vararg timelines: Timeline)

    @Delete
    fun delete(vararg timelines: Timeline)
}