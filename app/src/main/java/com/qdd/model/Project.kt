package com.qdd.model

import androidx.room.*

//@Fts4
//@Entity(indices = [Index(value = ["name"], unique = true)])
//data class Project(
//    @ColumnInfo(index = true) val name: String,
//    @PrimaryKey(autoGenerate = true) val id: Long = 0
//)


@Entity
data class Project(
    @PrimaryKey(autoGenerate = false) val name: String
)