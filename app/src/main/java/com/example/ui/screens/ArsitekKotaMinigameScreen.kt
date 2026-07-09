package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Business
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
fun ArsitekKotaMinigameScreen(
    viewModel: PlayerViewModel,
    onNavigateBack: () -> Unit
) {
    var mapDistance by remember { mutableIntStateOf(5) }
    var scale by remember { mutableIntStateOf(2000) }
    var currentAnswerInput by remember { mutableStateOf("") }
    
    var feedbackMessage by remember { mutableStateOf("") }
    var feedbackColor by remember { mutableStateOf(Color.White) }

    fun generateNewBlueprint() {
        val distances = listOf(3, 4, 5, 8, 10, 12)
        val scales = listOf(1000, 2000, 5000, 10000)
        mapDistance = distances[Random.nextInt(distances.size)]
        scale = scales[Random.nextInt(scales.size)]
        currentAnswerInput = ""
        feedbackMessage = ""
    }

    val correctAnswer = (mapDistance * scale) / 100 // convert cm to meters

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Grade7GradientStart)
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
                text = "Ekspedisi Arsitek Kota",
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
            // Split screen top: 2D Parchment map
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
                    .clip(RoundedCornerShape(24.dp))
                    .background(Color(0xFFEED9B3)) // Parchment color
                    .border(3.dp, Color(0xFFC49A45), RoundedCornerShape(24.dp))
                    .padding(16.dp)
            ) {
                Column(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.SpaceBetween) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("PETA TOPOGRAFI", color = Color(0xFF5C4017), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        Text("SKALA 1 : $scale", color = Color(0xFF5C4017), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    // A simulated map drawing
                    Box(modifier = Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Filled.Business, contentDescription = "Pos Jaga A", tint = Color(0xFF8B5A2B), modifier = Modifier.size(32.dp))
                            Spacer(modifier = Modifier.width(16.dp))
                            Box(
                                modifier = Modifier
                                    .width(80.dp)
                                    .height(2.dp)
                                    .background(Color(0xFF8B5A2B))
                            )
                            Spacer(modifier = Modifier.width(16.dp))
                            Icon(Icons.Filled.Business, contentDescription = "Tambang Batu", tint = Color(0xFF8B5A2B), modifier = Modifier.size(32.dp))
                        }
                    }

                    Text(
                        text = "Jarak di peta = $mapDistance cm",
                        color = Color(0xFF5C4017),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.align(Alignment.CenterHorizontally)
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Task question
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(SurfaceDark)
                    .padding(16.dp)
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Tentukan jarak sebenarnya dalam Satuan METER!",
                        color = Color.White,
                        fontSize = 14.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = if (currentAnswerInput.isEmpty()) "?" else "$currentAnswerInput m",
                        color = Grade7Text,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Black
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Custom vintage keypad
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                val keys = listOf(
                    listOf("1", "2", "3"),
                    listOf("4", "5", "6"),
                    listOf("7", "8", "9"),
                    listOf("C", "0", "SAHKAN")
                )

                keys.forEach { row ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        row.forEach { key ->
                            KeypadButton(
                                label = key,
                                modifier = Modifier.weight(if (key == "SAHKAN") 1.5f else 1f)
                            ) {
                                when (key) {
                                    "C" -> currentAnswerInput = ""
                                    "SAHKAN" -> {
                                        val typed = currentAnswerInput.toIntOrNull()
                                        if (typed == correctAnswer) {
                                            feedbackMessage = "SAH! Jarak sebenarnya adalah $correctAnswer meter."
                                            feedbackColor = Color.Green
                                            viewModel.addCoins(60)
                                            viewModel.addExp(120)
                                        } else {
                                            feedbackMessage = "SALAH! Hitung kembali dengan teliti."
                                            feedbackColor = Color.Red
                                        }
                                    }
                                    else -> {
                                        if (currentAnswerInput.length < 5) {
                                            currentAnswerInput += key
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (feedbackMessage.isNotEmpty()) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = feedbackMessage,
                    color = feedbackColor,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
                if (feedbackColor == Color.Green) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(onClick = { generateNewBlueprint() }) {
                        Text("Misi Berikutnya")
                    }
                }
            }
        }
    }
}

@Composable
fun KeypadButton(
    label: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Box(
        modifier = modifier
            .height(56.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(if (label == "SAHKAN") PrimaryIndigo else SurfaceDark)
            .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(12.dp))
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            color = if (label == "SAHKAN") Color.White else TextPrimary,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold
        )
    }
}
