package com.qdd.data

import androidx.room.TypeConverter
import java.sql.Date
import java.util.*

class Converters {
    @TypeConverter
    fun timestamp2Date(value: Long): Date = Date(value)

    @TypeConverter
    fun date2Timestamp(date: Date): Long = date.time
    @TypeConverter
    fun calendar2Timestamp(calendar: Calendar): Long = calendar.timeInMillis

    @TypeConverter
    fun timestamp2Calendar(value: Long): Calendar =
        Calendar.getInstance().apply { timeInMillis = value }
}