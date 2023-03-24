package com.qdd.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import androidx.sqlite.db.SupportSQLiteDatabase
import com.qdd.BuildConfig
import com.qdd.model.Category
import com.qdd.model.Project
import com.qdd.model.Timeline
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.sql.Date

@Database(entities = [Timeline::class, Project::class, Category::class], version = 1)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun timelineDao(): TimelineDao
    abstract fun projectDao(): ProjectDao
    abstract fun categoryDao(): CategoryDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(
            context: Context,
            scope: CoroutineScope
        ): AppDatabase {
            // if the INSTANCE is not null, then return it,
            // if it is, then create the database
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "QDD.db"
                ).fallbackToDestructiveMigration()
                    .addCallback(TimelineDatabaseCallback(scope))
                    .build()
                INSTANCE = instance
                // return instance
                instance
            }
        }

        private class TimelineDatabaseCallback(
            private val scope: CoroutineScope
        ) : Callback() {
            /**
             * Override the onCreate method to populate the database.
             */
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                // If you want to keep the data through app restarts,
                // comment out the following line.
                if (BuildConfig.DEBUG) {
                    INSTANCE?.let { database ->
                        scope.launch(Dispatchers.IO) {
                            populateDatabase(database)
                        }
                    }
                }
            }
        }

        suspend fun populateDatabase(appDatabase: AppDatabase) {
            val projectDao = appDatabase.projectDao()
            projectDao.insert(Project(name = "项目1"), Project(name = "项目2"))

            val categoryDao = appDatabase.categoryDao()
            categoryDao.insert(
                Category(name = "原材料", isIncome = false),
                Category(name = "钢板", isIncome = false, parentName = "原材料"),
                Category(name = "交税", isIncome = false),
                Category(name = "个人所得税", isIncome = false, parentName = "交税"),
                Category(name = "商品税", isIncome = false, parentName = "交税"),

                Category(name = "预付款", isIncome = true),
                Category(name = "1月款", isIncome = true, parentName = "预付款"),
                Category(name = "尾款", isIncome = true),
            )

            val timelineDao = appDatabase.timelineDao()
            timelineDao.deleteAll()

            var timeline = Timeline(
                projectName = "项目1",
                categoryName = "原材料",
                comments = "备注：购买钢板等。",
                money = 120.00,
                date = Date(System.currentTimeMillis())
            )
            timelineDao.insert(timeline)
            timeline = Timeline(
                projectName = "项目2",
                categoryName = "预付款",
                comments = "收老王的预付款",
                money = 100_00.50,
                date = Date(System.currentTimeMillis())
            )
            timelineDao.insert(timeline)
        }
    }
}
