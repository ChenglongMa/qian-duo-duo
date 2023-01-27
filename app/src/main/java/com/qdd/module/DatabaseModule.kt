package com.qdd.module

import android.content.Context
import androidx.room.Room
import com.qdd.data.AppDatabase
import com.qdd.data.CategoryDao
import com.qdd.data.ProjectDao
import com.qdd.data.TimelineDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
class DatabaseModule {

    @Singleton
    @Provides
    fun provideAppDatabase(@ApplicationContext context: Context): AppDatabase =
        AppDatabase.getDatabase(context, CoroutineScope(SupervisorJob()))
//        Room.databaseBuilder(context, AppDatabase::class.java, "QDD.db")
//            .fallbackToDestructiveMigration() // TODO: remove it
//            .build()

    @Provides
    fun provideTimelineDao(appDatabase: AppDatabase): TimelineDao = appDatabase.timelineDao()

    @Provides
    fun provideProjectDao(appDatabase: AppDatabase): ProjectDao = appDatabase.projectDao()

    @Provides
    fun provideCategoryDao(appDatabase: AppDatabase): CategoryDao = appDatabase.categoryDao()
}