package com.qdd.model

import androidx.room.*

@Entity//(indices = [Index(value = ["name"], unique = true)])
data class Category(
    @PrimaryKey(autoGenerate = false)
    val name: String,
    val parentName: String? = null,
    val isPayment: Boolean
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