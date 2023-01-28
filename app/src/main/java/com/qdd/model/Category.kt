package com.qdd.model

import androidx.room.Embedded
import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.Relation

@Entity//(indices = [Index(value = ["name"], unique = true)])
data class Category(
    @PrimaryKey(autoGenerate = false)
    val name: String,
    val parentName: String? = null,
    val isIncome: Boolean
)

data class CategoryWithTimelines(
    @Embedded
    val category: Category,
    @Relation(parentColumn = "name", entityColumn = "categoryName")
    val timelines: List<Timeline>,
)

data class CategoryWithChildren(
    @Embedded
    val category: Category,
    @Relation(parentColumn = "name", entityColumn = "parentName")
    val categories: List<Category>,
)