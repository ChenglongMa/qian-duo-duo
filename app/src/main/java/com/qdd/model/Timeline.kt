package com.qdd.model

import android.graphics.Bitmap
import android.text.format.DateFormat
import androidx.room.*
import java.sql.Date

@Entity
//    (
//    foreignKeys = [
//        ForeignKey(entity = Project::class, childColumns = ["projectId"], parentColumns = ["id"]),
//        ForeignKey(entity = Category::class, childColumns = ["categoryId"], parentColumns = ["id"])
//    ]
//)
data class Timeline(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    @Embedded(prefix = "project_")
    val project: Project,
    @Embedded("category_")
    val category: Category,
//    val projectId: Long,

    val date: Date,
//    val categoryId: Long,
    val comments: String?,
    val money: Double,
    val isPayment: Boolean,
) {
    @Ignore
    val attachment: Bitmap? = null

}