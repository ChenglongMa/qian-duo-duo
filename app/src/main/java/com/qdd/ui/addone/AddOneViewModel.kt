package com.qdd.ui.addone

import androidx.lifecycle.*
import com.qdd.model.Category
import com.qdd.model.Project
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
    val subCategoryName: String?
        get() = categoryName.value?.split(" > ")?.last()
    val parentCategoryName: String?
        get() = categoryName.value?.split(" > ")?.first()
    val date: MutableLiveData<Date> = MutableLiveData(Date(System.currentTimeMillis()))
    val money: MutableLiveData<Double> = MutableLiveData()
    val comments: MutableLiveData<String> = MutableLiveData()
    val isIncome: MutableLiveData<Boolean> = MutableLiveData()

    val allProjects: LiveData<List<Project>> = repository.allProjects.asLiveData()
    val allCategories: LiveData<List<Category>> = repository.allCategories.asLiveData()

    val allCategoriesWithChildren =
        repository.getAllCategoriesWithChildren(isIncome.value == true).asLiveData()

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
