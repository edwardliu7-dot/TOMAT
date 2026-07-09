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
fun HologramBlueprintMinigameScreen(
    viewModel: PlayerViewModel,
    onNavigateBack: () -> Unit
) {
    var originalW by remember { mutableIntStateOf(4) }
    var originalH by remember { mutableIntStateOf(6) }
    var scaledW by remember { mutableIntStateOf(12) }
    
    var feedbackMessage by remember { mutableStateOf("") }
    var feedbackColor by remember { mutableStateOf(Color.White) }

    fun generateNewBlueprint() {
        val blueprints = listOf(
            Triple(2, 3, 6),   // ratio 1:3 -> scaledH = 9
            Triple(4, 5, 8),   // ratio 1:2 -> scaledH = 10
            Triple(3, 4, 12),  // ratio 1:4 -> scaledH = 16
            Triple(5, 8, 15),  // ratio 1:3 -> scaledH = 24
            Triple(6, 10, 18)  // ratio 1:3 -> scaledH = 30
        )
        val selected = blueprints[Random.nextInt(blueprints.size)]
        originalW = selected.first
        originalH = selected.second
        scaledW = selected.third
        feedbackMessage = ""
    }

    val scaledH = (scaledW * originalH) / originalW

    LaunchedEffect(Unit) {
        generateNewBlueprint()
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
                text = "Cetak Biru Hologram",
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
            // Hologram Blueprint Panel
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(SurfaceDark)
                    .border(2.dp, Grade9Border, RoundedCornerShape(20.dp))
                    .padding(20.dp)
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                    Text("CETAK BIRU HOLOGRAFIK PROPORSIONAL", color = Grade9Text, fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        // Original
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("📐 Bagian Asli", color = Color.White.copy(alpha = 0.6f), fontSize = 12.sp)
                            Spacer(modifier = Modifier.height(4.dp))
                            Box(
                                modifier = Modifier
                                    .size(80.dp, 100.dp)
                                    .border(2.dp, Grade9Text, RoundedCornerShape(8.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("$originalW x $originalH", color = Color.White, fontWeight = FontWeight.Bold)
                            }
                        }

                        // Scaled
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("⚡ Hologram Skala", color = Color.White.copy(alpha = 0.6f), fontSize = 12.sp)
                            Spacer(modifier = Modifier.height(4.dp))
                            Box(
                                modifier = Modifier
                                    .size(80.dp, 100.dp)
                                    .border(2.dp, PrimaryPurple, RoundedCornerShape(8.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("$scaledW x ?", color = Color.White, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Objective
            Text(
                text = "Berapakah nilai tinggi (?) yang proporsional (sebangun)?",
                color = Color.White,
                fontSize = 14.sp
            )
            Spacer(modifier = Modifier.height(16.dp))

            // Options Selection
            val wrong1 = scaledH + 4
            val wrong2 = scaledH - 2
            val wrong3 = scaledH * 2
            val options = remember(scaledH) {
                listOf(scaledH, wrong1, wrong2, wrong3).shuffled()
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                options.forEach { opt ->
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(60.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(SurfaceDark)
                            .border(1.dp, if (feedbackMessage.isNotEmpty() && opt == scaledH) Color.Green else Grade9Border, RoundedCornerShape(12.dp))
                            .clickable(enabled = feedbackMessage.isEmpty()) {
                                if (opt == scaledH) {
                                    feedbackMessage = "SAH! Dimensi sangat akurat, bagian terpasang mulus."
                                    feedbackColor = Color.Green
                                    viewModel.addCoins(50)
                                    viewModel.addExp(100)
                                } else {
                                    feedbackMessage = "SALAH! Dimensi tidak proporsional, bagian meledak!"
                                    feedbackColor = Color.Red
                                }
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "$opt",
                            color = Color.White,
                            fontSize = 18.sp,
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
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(12.dp))
                Button(
                    onClick = { generateNewBlueprint() },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo)
                ) {
                    Text("Cetak Biru Berikutnya")
                }
            }
        }
    }
}
