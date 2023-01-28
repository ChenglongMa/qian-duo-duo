package com.qdd.model

import androidx.room.*

@Entity//(indices = [Index(value = ["name"], unique = true)])
data class Project(
    @PrimaryKey(autoGenerate = false)
    val name: String,
)

data class ProjectWithTimelines(
    @Embedded
    val project: Project,
    @Relation(parentColumn = "name", entityColumn = "projectName")
    val timelines: List<Timeline>,
)