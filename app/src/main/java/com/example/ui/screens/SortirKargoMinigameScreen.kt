package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.PlayerViewModel
import com.example.ui.theme.*
import kotlin.random.Random

@Composable
fun SortirKargoMinigameScreen(
    viewModel: PlayerViewModel,
    onNavigateBack: () -> Unit
) {
    var rawExpression by remember { mutableStateOf("3a + 2b + 4a - b") }
    var simplifiedExpression by remember { mutableStateOf("7a + b") }
    var optionsList by remember { mutableStateOf(listOf("7a + b", "7a - b", "12ab", "3a + b")) }
    
    var feedbackMessage by remember { mutableStateOf("") }
    var feedbackColor by remember { mutableStateOf(Color.White) }

    fun generateNewExpression() {
        val expressions = listOf(
            Triple("2x + 5y + 3x - 2y", "5x + 3y", listOf("5x + 3y", "5x - 3y", "8x + y", "6x + 3y")),
            Triple("4a + 3b - 2a + 4b", "2a + 7b", listOf("2a + 7b", "6a + 7b", "2a - 7b", "8a + 12b")),
            Triple("5p - 2q + p + 6q", "6p + 4q", listOf("6p + 4q", "5p + 4q", "6p - 4q", "10pq")),
            Triple("7m + 4n - 3m - n", "4m + 3n", listOf("4m + 3n", "10m + 3n", "4m - 3n", "7m - 3n"))
        )
        val selected = expressions[Random.nextInt(expressions.size)]
        rawExpression = selected.first
        simplifiedExpression = selected.second
        optionsList = selected.third.shuffled()
        feedbackMessage = ""
    }

    LaunchedEffect(Unit) {
        generateNewExpression()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Grade9Bg)
            .padding(WindowInsets.statusBars.asPaddingValues())
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onNavigateBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
            }
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Sortir Kargo Pesawat",
                color = Color.White,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Sci-fi cargo cargo bay card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(SurfaceDark)
                    .border(2.dp, Grade9Border, RoundedCornerShape(20.dp))
                    .padding(20.dp)
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                    Text("LABEL VARIABEL ALGEBRA KARGO", color = Grade9Text, fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color.White.copy(alpha = 0.05f))
                            .padding(16.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = rawExpression,
                            color = Color.White,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Black
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Sederhanakan variabel di atas!",
                        color = Color.White.copy(alpha = 0.6f),
                        fontSize = 12.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Options selection
            optionsList.forEach { option ->
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(SurfaceDark)
                        .border(1.dp, if (feedbackMessage.isNotEmpty() && option == simplifiedExpression) Color.Green else Grade9Border, RoundedCornerShape(16.dp))
                        .clickable(enabled = feedbackMessage.isEmpty()) {
                            if (option == simplifiedExpression) {
                                feedbackMessage = "BERHASIL! Kargo tersortir sempurna."
                                feedbackColor = Color.Green
                                viewModel.addCoins(50)
                                viewModel.addExp(100)
                            } else {
                                feedbackMessage = "GAGAL! Terjadi malfungsi pintu pemisahan."
                                feedbackColor = Color.Red
                            }
                        }
                        .padding(20.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = option,
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            if (feedbackMessage.isNotEmpty()) {
                Spacer(modifier = Modifier.height(24.dp))
                Text(
                    text = feedbackMessage,
                    color = feedbackColor,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(12.dp))
                Button(
                    onClick = { generateNewExpression() },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo)
                ) {
                    Text("Kargo Berikutnya")
                }
            }
        }
    }
}
