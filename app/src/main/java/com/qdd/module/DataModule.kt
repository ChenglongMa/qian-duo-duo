package com.qdd.module

import com.qdd.repository.DefaultTimelineRepository
import com.qdd.repository.TimelineRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
interface DataModule {
    @Singleton
    @Binds
    fun bindsTimelineRepository(timelineRepository: DefaultTimelineRepository): TimelineRepository
}