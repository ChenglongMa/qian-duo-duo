package com.qdd.ui.timeline

import androidx.lifecycle.LiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.asLiveData
import androidx.lifecycle.viewModelScope
import com.qdd.model.Timeline
import com.qdd.repository.TimelineRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class TimelineViewModel @Inject constructor(private val repository: TimelineRepository) : ViewModel() {
    val allTimelines: LiveData<List<Timeline>> = repository.allTimelines.asLiveData()
    fun insert(timeline: Timeline) = viewModelScope.launch {
        repository.insert(timeline)
    }

}