package com.qdd

import android.content.Context
import android.util.Log
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.espresso.matcher.ViewMatchers.assertThat
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.qdd.data.AppDatabase
import com.qdd.data.TimelineDao
import com.qdd.model.Category
import com.qdd.model.Project
import com.qdd.model.Timeline
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.hamcrest.CoreMatchers.equalTo
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import java.io.IOException
import java.sql.Date

@RunWith(AndroidJUnit4::class)
class DatabaseTest {
    private lateinit var dao: TimelineDao
    private lateinit var db: AppDatabase

    @Before
    fun createDb() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        db = Room.inMemoryDatabaseBuilder(
            context, AppDatabase::class.java
        ).build()
        dao = db.timelineDao()
    }

    @After
    @Throws(IOException::class)
    fun closeDb() {
        db.close()
    }

    @OptIn(ExperimentalCoroutinesApi::class)
    @Test
    @Throws(Exception::class)
    fun writeTimelineAndReadInList() = runTest {
        var timeline = Timeline(
            project = Project(name = "项目1"),
            category = Category("原材料->钢材"),
            comments = "备注：购买钢板等。",
            money = 120.00,
            isPayment = true,
            date = Date(System.currentTimeMillis())
        )
        dao.insert(timeline)
        timeline = Timeline(
            project = Project(name = "项目2"),
            category = Category("预付款"),
            comments = "备注：收老王",
            money = 100_00.50,
            isPayment = false,
            date = Date(System.currentTimeMillis())
        )
        dao.insert(timeline)
        Log.d("TAG", "writeTimelineAndReadInList: ${dao.getTimelines()}")
//        val user: Timeline = TestUtil.createTimeline(3).apply {
//            setName("george")
//        }
//        dao.insert(user)
//        val byName = dao.findTimelinesByName("george")
//        assertThat(byName.get(0), equalTo(user))
    }
}