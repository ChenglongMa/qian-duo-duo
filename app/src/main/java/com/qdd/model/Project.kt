package com.qdd.model

import androidx.room.Embedded
import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.Relation

@Entity//(indices = [Index(value = ["name"], unique = true)])
data class Project(
    @PrimaryKey(autoGenerate = false)
    val name: String,
    val archived: Boolean = false,
)

data class ProjectWithTimelines(
    @Embedded
    val project: Project,
    @Relation(parentColumn = "name", entityColumn = "projectName")
    val timelines: List<Timeline>,
)