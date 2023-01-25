package com.qdd.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity
data class Project(
    @PrimaryKey(autoGenerate = true)
    val id: Int,
    val name: String
)
