package com.example.ui

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

data class PlayerState(
    val name: String = "SiswaHebat",
    val coins: Int = 150,
    val level: Int = 5,
    val exp: Int = 250,
    val maxExp: Int = 500
)

class PlayerViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(PlayerState())
    val uiState: StateFlow<PlayerState> = _uiState.asStateFlow()

    fun addCoins(amount: Int) {
        _uiState.update { it.copy(coins = it.coins + amount) }
    }

    fun addExp(amount: Int) {
        _uiState.update { state ->
            val newExp = state.exp + amount
            if (newExp >= state.maxExp) {
                state.copy(
                    level = state.level + 1,
                    exp = newExp - state.maxExp,
                    maxExp = (state.maxExp * 1.5).toInt()
                )
            } else {
                state.copy(exp = newExp)
            }
        }
    }
}
