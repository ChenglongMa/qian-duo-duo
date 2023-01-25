package com.qdd.dao

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import androidx.sqlite.db.SupportSQLiteDatabase
import com.qdd.model.Project
import com.qdd.model.Timeline
import kotlinx.coroutines.CoroutineScope

//TODO: https://developer.android.com/codelabs/android-room-with-a-view-kotlin?hl=zh-cn#8
@Database(entities = [Timeline::class, Project::class], version = 1)
@TypeConverters(Converters::class)
abstract class AppDatabase: RoomDatabase() {
    abstract fun timelineDao(): TimelineDao

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
                    "gs_database"
                )
                    // Wipes and rebuilds instead of migrating if no Migration object.
                    // Migration is not part of this codelab.
                    .fallbackToDestructiveMigration()
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

//                INSTANCE?.let { database ->
//                    scope.launch(Dispatchers.IO) {
//                        populateDatabase(database.timelineDao())
//                    }
//                }
            }
        }

        /**
         * Populate the database in a new coroutine.
         * If you want to start with more timelines, just add them.
         */
        suspend fun populateDatabase(timelineDao: TimelineDao) {
            // Start the app with a clean database every time.
            // Not needed if you only populate on creation.
            timelineDao.deleteAll()

//            var timeline = Timeline()
//            timelineDao.insert(timeline)
//            timeline = Timeline()
//            timelineDao.insert(timeline)
        }
    }
}
