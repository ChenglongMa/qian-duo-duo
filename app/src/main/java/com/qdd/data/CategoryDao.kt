package com.qdd.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import com.qdd.model.Category

@Dao
interface CategoryDao {
    @Query("SELECT * FROM category WHERE name = :name")
    suspend fun getCategoryByName(name: String): Category?

    @Insert
    suspend fun insert(vararg category: Category): List<Long>
}