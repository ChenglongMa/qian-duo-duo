package com.qdd.ui.addone

import android.os.Bundle
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.google.android.material.tabs.TabLayoutMediator
import com.qdd.R
import com.qdd.databinding.ActivityAddOneBinding
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class AddOneActivity : AppCompatActivity() {
    private lateinit var binding: ActivityAddOneBinding
    private val viewModel: AddOneViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        binding = ActivityAddOneBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Tab layout and View pager
        val tabTitle = arrayOf(getString(R.string.expense), getString(R.string.income))
        val viewPager = binding.pager
        viewPager.adapter = ViewAdapter(this@AddOneActivity, viewModel)
        val tabLayout = binding.tabLayout
        TabLayoutMediator(tabLayout, viewPager) { tab, position ->
            tab.text = tabTitle[position]
        }.attach()
    }
}