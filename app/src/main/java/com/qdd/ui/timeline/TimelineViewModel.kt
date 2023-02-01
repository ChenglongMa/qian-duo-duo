package com.qdd.ui.timeline

import androidx.lifecycle.LiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.asLiveData
import androidx.lifecycle.viewModelScope
import com.qdd.model.Timeline
import com.qdd.model.TimelineWithX
import com.qdd.repository.TimelineRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class TimelineViewModel @Inject constructor(private val repository: TimelineRepository) :
    ViewModel() {
    val allTimelines: LiveData<List<TimelineWithX>> = repository.allTimelineWithXs.asLiveData()
    fun insert(vararg timeline: Timeline) = viewModelScope.launch {
        repository.insert(*timeline)
    }

    fun delete(timeline: TimelineWithX) = viewModelScope.launch((Dispatchers.IO)) {
        repository.delete(timeline.timeline)
    }

}