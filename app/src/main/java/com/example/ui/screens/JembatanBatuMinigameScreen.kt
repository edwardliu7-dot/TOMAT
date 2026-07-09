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
fun JembatanBatuMinigameScreen(
    viewModel: PlayerViewModel,
    onNavigateBack: () -> Unit
) {
    var sequenceList by remember { mutableStateOf(listOf("2", "4", "6", "?", "10")) }
    var optionsList by remember { mutableStateOf(listOf("7", "8", "9", "12")) }
    var correctAnswer by remember { mutableStateOf("8") }
    
    var feedbackMessage by remember { mutableStateOf("") }
    var feedbackColor by remember { mutableStateOf(Color.White) }

    fun generateNewSequence() {
        val patterns = listOf(
            // Pattern 1: +3
            listOf(3, 6, 9, 12, 15),
            // Pattern 2: *2
            listOf(2, 4, 8, 16, 32),
            // Pattern 3: +5
            listOf(5, 10, 15, 20, 25),
            // Pattern 4: -4
            listOf(20, 16, 12, 8, 4),
            // Pattern 5: Squares
            listOf(1, 4, 9, 16, 25)
        )
        val selectedPattern = patterns[Random.nextInt(patterns.size)]
        val missingIndex = Random.nextInt(1, 4) // Keep first and last visible for easier understanding
        
        correctAnswer = selectedPattern[missingIndex].toString()
        
        val sequence = selectedPattern.mapIndexed { idx, value ->
            if (idx == missingIndex) "?" else value.toString()
        }
        sequenceList = sequence
        
        // Generate wrong options
        val wrongOptions = mutableSetOf<String>()
        while (wrongOptions.size < 3) {
            val offset = Random.nextInt(-10, 10)
            val wrongVal = (selectedPattern[missingIndex] + offset).toString()
            if (wrongVal != correctAnswer && wrongVal.toIntOrNull() != null && wrongVal.toInt() > 0) {
                wrongOptions.add(wrongVal)
            }
        }
        optionsList = (wrongOptions.toList() + correctAnswer).shuffled()
        feedbackMessage = ""
    }

    LaunchedEffect(Unit) {
        generateNewSequence()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Grade8GradientStart)
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
                text = "Jembatan Batu Ajaib",
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
            // Lava theme visual card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(SurfaceDark)
                    .border(2.dp, Grade8Border, RoundedCornerShape(20.dp))
                    .padding(20.dp)
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                    Text("MISI POLA BILANGAN", color = Grade8Text, fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Lompati batu dengan melengkapi deretan angka yang hilang!",
                        color = Color.White.copy(alpha = 0.8f),
                        fontSize = 14.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // The Bridge / Path visually
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceAround,
                verticalAlignment = Alignment.CenterVertically
            ) {
                sequenceList.forEach { value ->
                    StoneItem(
                        value = value,
                        isMissing = value == "?"
                    )
                }
            }

            Spacer(modifier = Modifier.height(48.dp))

            // Options Selection
            Text(
                text = "Pilih Batu Jawaban Anda:",
                color = Color.White,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                optionsList.forEach { option ->
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(64.dp)
                            .clip(RoundedCornerShape(16.dp))
                            .background(SurfaceDark)
                            .border(2.dp, if (feedbackMessage.isNotEmpty() && option == correctAnswer) Color.Green else Grade8Border, RoundedCornerShape(16.dp))
                            .clickable(enabled = feedbackMessage.isEmpty()) {
                                if (option == correctAnswer) {
                                    feedbackMessage = "Lompatan Berhasil! Ksatria selamat menyeberang."
                                    feedbackColor = Color.Green
                                    viewModel.addCoins(50)
                                    viewModel.addExp(100)
                                } else {
                                    feedbackMessage = "Terperosok! Batu itu palsu."
                                    feedbackColor = Color.Red
                                }
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = option,
                            color = Color.White,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
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
                    onClick = { generateNewSequence() },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo)
                ) {
                    Text("Jembatan Berikutnya")
                }
            }
        }
    }
}

@Composable
fun StoneItem(
    value: String,
    isMissing: Boolean
) {
    Box(
        modifier = Modifier
            .size(60.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(if (isMissing) Color.DarkGray else Grade8GradientEnd)
            .border(2.dp, if (isMissing) Grade8Text else Color.White.copy(alpha = 0.3f), RoundedCornerShape(12.dp)),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = value,
            color = if (isMissing) Grade8Text else Color.White,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold
        )
    }
}
