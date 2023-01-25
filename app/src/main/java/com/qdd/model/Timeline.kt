package com.qdd.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.sql.Date

@Entity
data class Timeline(
    @PrimaryKey(autoGenerate = true)
    val id: Int,
    val projectId: Int,
    val date: Date,
    val category: String,
    val comments: String?,
    val money: Double,
    val isPayment: Boolean
)