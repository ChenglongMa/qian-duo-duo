package com.qdd.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.qdd.model.Project

@Dao
interface ProjectDao {
    @Query("SELECT * FROM project WHERE name = :name")
    suspend fun getProjectByName(name: String): Project?

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insert(vararg project: Project): List<Long>
}