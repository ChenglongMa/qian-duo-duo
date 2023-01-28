package com.qdd

import android.content.Context
import android.database.sqlite.SQLiteConstraintException
import android.util.Log
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.qdd.data.AppDatabase
import com.qdd.data.CategoryDao
import com.qdd.data.ProjectDao
import com.qdd.data.TimelineDao
import com.qdd.model.Project
import com.qdd.model.Timeline
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import java.io.IOException
import java.sql.Date

@RunWith(AndroidJUnit4::class)
class DatabaseTest {
    private lateinit var timelineDao: TimelineDao
    private lateinit var projectDao: ProjectDao
    private lateinit var categoryDao: CategoryDao
    private lateinit var db: AppDatabase
    private val TAG = "DatabaseTest"

    @Before
    fun createDb() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        db = Room.inMemoryDatabaseBuilder(
            context, AppDatabase::class.java
        ).build()
        timelineDao = db.timelineDao()
        projectDao = db.projectDao()
        categoryDao = db.categoryDao()
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

//        val user: Timeline = TestUtil.createTimeline(3).apply {
//            setName("george")
//        }
//        dao.insert(user)
//        val byName = dao.findTimelinesByName("george")
//        assertThat(byName.get(0), equalTo(user))
    }

    @OptIn(ExperimentalCoroutinesApi::class)
    @Test
    fun insertProject() = runTest {
        val projectName = "TEST PROJECT"
        var projectDb = projectDao.getProjectByName(projectName)
        assert(projectDb == null)
        var res = projectDao.insert(Project(name = projectName))
        Log.d(TAG, "insertProject: insert result $res")
        res = projectDao.insert(Project(name = projectName))
        Log.d(TAG, "insertProject: insert result2 $res")
        projectDb = projectDao.getProjectByName(projectName)
        Log.d(TAG, "insertProject: query result $projectDb")
        projectDb?.name?.equals(projectName)?.let { assert(it) }
    }
    @OptIn(ExperimentalCoroutinesApi::class)
    @Test(expected = SQLiteConstraintException::class)
    fun insertTimelineWithInvalidProject()= runTest {
        timelineDao.insert(
            Timeline(
                projectName = "INVALID PROJECT",
                categoryName = "INVALID CATEGORY",
                money = 100.00,
                date = Date(System.currentTimeMillis())
            )
        )
    }
}