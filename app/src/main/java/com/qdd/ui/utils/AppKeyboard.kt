package com.qdd.ui.utils

//import android.inputmethodservice.Keyboard
//import android.inputmethodservice.KeyboardView
import android.text.InputType
import android.view.View
import android.widget.EditText
import androidx.annotation.XmlRes
import com.qdd.R
import com.qdd.ui.widget.Keyboard
import com.qdd.ui.widget.KeyboardView


class AppKeyboard(
    private val editText: EditText,
    private val keyboardView: KeyboardView,
    @XmlRes layoutResId: Int = R.xml.keyboard
) :
    Keyboard(
        editText.context, layoutResId
    ), KeyboardView.OnKeyboardActionListener {

    fun setup() {
        keyboardView.apply {
            keyboard = this@AppKeyboard
            isPreviewEnabled = false
            setOnKeyboardActionListener(this@AppKeyboard)
            isEnabled = true
        }

        editText.apply {
            inputType = InputType.TYPE_NULL
            onFocusChangeListener = View.OnFocusChangeListener { _: View, hasFocus: Boolean ->
                if (hasFocus) {
                    showKeyboard()
                } else {
                    hideKeyboard()
                }
            }
            setOnClickListener { showKeyboard() }
        }
    }

    private fun showKeyboard() {
        keyboardView.visibility = View.VISIBLE
    }

    private fun hideKeyboard() {
        keyboardView.visibility = View.GONE
    }

    override fun onPress(primaryCode: Int) {
        // Do nothing
    }

    override fun onRelease(primaryCode: Int) {
        // Do nothing
    }

    override fun onKey(primaryCode: Int, keyCodes: IntArray?) {
        val txt = editText.text
        val start = editText.selectionStart
        when (primaryCode) {
            KEYCODE_DELETE -> if (txt != null && txt.isNotEmpty() && start > 0) {
                txt.delete(start - 1, start)
            }
            KEYCODE_CANCEL -> txt!!.clear()
            KEYCODE_DONE -> hideKeyboard()
            else -> txt!!.insert(start, primaryCode.toChar().toString())
        }
    }

    override fun onText(primaryCode: CharSequence?) {
        // Do nothing
    }

    override fun swipeLeft() {
        // Do nothing
    }

    override fun swipeRight() {
        // Do nothing
    }

    override fun swipeDown() {
        // Do nothing
    }

    override fun swipeUp() {
        // Do nothing
    }
}