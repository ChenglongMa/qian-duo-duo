package com.qdd

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.qdd.repository.TimelineRepository
import com.qdd.ui.timeline.TimelineViewModel
import tech.hailio.data.repository.*
import tech.hailio.viewmodel.authentication.AuthViewModel
import tech.hailio.viewmodel.dashboard.DashboardViewModel
import tech.hailio.viewmodel.dashboard.RewardsViewModel
import tech.hailio.viewmodel.player.PlayerViewModel
import tech.hailio.viewmodel.profile.SettingsViewModel
import tech.hailio.viewmodel.shared.MainViewModel
import tech.hailio.viewmodel.shared.UploaderViewModel

/**
 * ViewModel provider factory to instantiate ViewModel.
 * Required given ViewModel has a non-empty constructor
 */
class ViewModelFactory : ViewModelProvider.Factory {

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        return when {
            modelClass.isAssignableFrom(TimelineViewModel::class.java) -> TimelineViewModel(
                repository = TimelineRepository(/* BUG */)
            ) as T
            else -> throw IllegalArgumentException("Unknown ViewModel class")
        }
    }
}