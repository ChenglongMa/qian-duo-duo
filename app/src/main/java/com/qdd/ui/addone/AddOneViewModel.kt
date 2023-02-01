package com.qdd.ui.addone

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.qdd.model.Timeline
import com.qdd.model.TimelineWithX
import com.qdd.repository.TimelineRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import java.sql.Date
import javax.inject.Inject

@HiltViewModel
class AddOneViewModel @Inject constructor(private val repository: TimelineRepository) :
    ViewModel() {
    var projectName: MutableLiveData<String> = MutableLiveData()
    var categoryName: MutableLiveData<String> = MutableLiveData()
    val date: MutableLiveData<Date> = MutableLiveData(Date(System.currentTimeMillis()))
    val money: MutableLiveData<Double> = MutableLiveData()
    val comments: MutableLiveData<String> = MutableLiveData()
    val isIncome: MutableLiveData<Boolean> = MutableLiveData()

    fun insert(vararg timeline: Timeline) = viewModelScope.launch {
        repository.insert(*timeline)
    }

    fun insert(timeline: TimelineWithX) = viewModelScope.launch {
        repository.insert(timeline)
    }

    fun updateDateToToday() {
        date.value = Date(System.currentTimeMillis())
    }
}
