package com.qdd.model

import android.graphics.Bitmap
import androidx.room.*
import java.sql.Date

@Entity
    (
    foreignKeys = [
        ForeignKey(
            entity = Project::class,
            childColumns = ["projectName"],
            parentColumns = ["name"]
        ),
        ForeignKey(
            entity = Category::class,
            childColumns = ["categoryName"],
            parentColumns = ["name"]
        )
    ]
)
data class Timeline(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    @ColumnInfo(index = true)
    val projectName: String,
    @ColumnInfo(index = true)
    val categoryName: String,
    @ColumnInfo(index = true)
    val date: Date,
    val comments: String? = null,
    val money: Double, //TODO: negative value is not allowed
) {
    @Ignore
    val attachment: Bitmap? = null
}

data class TimelineWithX(
    @Embedded
    val timeline: Timeline,
    @Relation(parentColumn = "projectName", entityColumn = "name")
    val project: Project,
    @Relation(parentColumn = "categoryName", entityColumn = "name")
    val category: Category
)