package com.qdd.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Transaction
import com.qdd.model.Category
import com.qdd.model.CategoryWithChildren
import kotlinx.coroutines.flow.Flow

@Dao
interface CategoryDao {
    @Query("SELECT * FROM category WHERE name = :name")
    suspend fun getCategoryByName(name: String): Category?

    @Query("SELECT * FROM category WHERE parentName is null")
    fun getParentCategories(): Flow<List<Category>>

    @Query("SELECT * FROM category WHERE archived = 0 ORDER BY name")
    fun getCategories(): Flow<List<Category>>

    @Transaction
    @Query("SELECT * FROM category WHERE archived = 0 AND isIncome = :isIncome AND parentName is null ORDER BY name")
    fun getCategoriesWithChildren(isIncome: Boolean): Flow<List<CategoryWithChildren>>

    @Insert
    suspend fun insert(vararg category: Category): List<Long>
}