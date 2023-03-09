package com.qdd.ui.addone

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.qdd.R
import com.qdd.databinding.BottomSheetKeyboardBinding
import com.qdd.ui.utils.AppKeyboard

class KeyboardDialog(private val editText: EditText) : BottomSheetDialogFragment() {
    companion object {
        const val TAG = "KeyboardDialog"
    }

    private lateinit var binding: BottomSheetKeyboardBinding
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = BottomSheetKeyboardBinding.inflate(inflater, container, false)

        val keyboard = AppKeyboard(
            editText,
            binding.keyboardView,
            R.xml.keyboard,
            requireActivity(),
        ) { dismiss() }
        keyboard.setup()

        return binding.root
    }

    override fun getTheme(): Int = R.style.KeyboardBottomSheet_Modal
}