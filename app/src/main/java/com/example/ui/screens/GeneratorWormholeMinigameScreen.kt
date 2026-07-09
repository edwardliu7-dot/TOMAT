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
fun GeneratorWormholeMinigameScreen(
    viewModel: PlayerViewModel,
    onNavigateBack: () -> Unit
) {
    var surdExpression by remember { mutableStateOf("√18") }
    var simplifiedForm by remember { mutableStateOf("3√2") }
    var optionsList by remember { mutableStateOf(listOf("3√2", "2√3", "9√2", "2√9")) }
    
    var feedbackMessage by remember { mutableStateOf("") }
    var feedbackColor by remember { mutableStateOf(Color.White) }

    fun generateNewSurd() {
        val surds = listOf(
            Triple("√50", "5√2", listOf("5√2", "2√5", "25√2", "5√5")),
            Triple("√27", "3√3", listOf("3√3", "9√3", "3√9", "2√3")),
            Triple("√75", "5√3", listOf("5√3", "3√5", "25√3", "15√5")),
            Triple("√32", "4√2", listOf("4√2", "2√4", "16√2", "2√8")),
            Triple("√12", "2√3", listOf("2√3", "3√2", "4√3", "2√6"))
        )
        val selected = surds[Random.nextInt(surds.size)]
        surdExpression = selected.first
        simplifiedForm = selected.second
        optionsList = selected.third.shuffled()
        feedbackMessage = ""
    }

    LaunchedEffect(Unit) {
        generateNewSurd()
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
                text = "Generator Lubang Cacing",
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
            // Sci-fi generator core
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(SurfaceDark)
                    .border(2.dp, Grade9Border, RoundedCornerShape(20.dp))
                    .padding(20.dp)
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                    Text("INTI ENERGI GENERATOR", color = Grade9Text, fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
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
                            text = surdExpression,
                            color = Color.White,
                            fontSize = 32.sp,
                            fontWeight = FontWeight.Black
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Sederhanakan bentuk akar di atas untuk menstabilkan wormhole!",
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
                        .border(1.dp, if (feedbackMessage.isNotEmpty() && option == simplifiedForm) Color.Green else Grade9Border, RoundedCornerShape(16.dp))
                        .clickable(enabled = feedbackMessage.isEmpty()) {
                            if (option == simplifiedForm) {
                                feedbackMessage = "STABIL! Inti energi generator terisi penuh."
                                feedbackColor = Color.Green
                                viewModel.addCoins(50)
                                viewModel.addExp(100)
                            } else {
                                feedbackMessage = "MALFUNGSI! Kebocoran radiasi lubang cacing!"
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
                    onClick = { generateNewSurd() },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo)
                ) {
                    Text("Akar Berikutnya")
                }
            }
        }
    }
}
