package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.PlayerViewModel
import com.example.ui.theme.*
import kotlin.random.Random

@Composable
fun LabKimiaMinigameScreen(
    viewModel: PlayerViewModel,
    onNavigateBack: () -> Unit
) {
    var targetValue by remember { mutableFloatStateOf(0.75f) }
    var targetLabel by remember { mutableStateOf("0.75 (atau 75% / 3/4)") }
    var currentSum by remember { mutableFloatStateOf(0f) }
    
    val bottles = listOf(
        Pair("1/4", 0.25f),
        Pair("1/2", 0.50f),
        Pair("3/4", 0.75f),
        Pair("0.1", 0.10f),
        Pair("0.25", 0.25f),
        Pair("10%", 0.10f),
        Pair("25%", 0.25f),
        Pair("50%", 0.50f)
    )

    var feedbackMessage by remember { mutableStateOf("") }
    var feedbackColor by remember { mutableStateOf(Color.White) }

    fun generateNewRecipe() {
        val targets = listOf(
            Pair(0.5f, "0.5 (atau 50% / 1/2)"),
            Pair(0.75f, "0.75 (atau 75% / 3/4)"),
            Pair(0.6f, "0.6 (atau 60% / 3/5)"),
            Pair(0.35f, "0.35 (atau 35% / 7/20)"),
            Pair(0.85f, "0.85 (atau 85%)")
        )
        val selected = targets[Random.nextInt(targets.size)]
        targetValue = selected.first
        targetLabel = selected.second
        currentSum = 0f
        feedbackMessage = ""
    }

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
                text = "Lab Kimia Penemu",
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
            // Target Recipe Display
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(SurfaceDark)
                    .border(1.dp, Grade7Border, RoundedCornerShape(20.dp))
                    .padding(20.dp)
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                    Text("RESEP KIMIA RAHASIA", color = Grade7Text, fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Campurkan cairan hingga mencapai:",
                        color = Color.White.copy(alpha = 0.8f),
                        fontSize = 14.sp
                    )
                    Text(
                        text = targetLabel,
                        color = PrimaryPurple,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Black
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Kuali / Translucent Beaker UI
            Box(
                modifier = Modifier
                    .size(160.dp, 240.dp)
                    .clip(RoundedCornerShape(topStart = 40.dp, topEnd = 40.dp, bottomStart = 24.dp, bottomEnd = 24.dp))
                    .background(Color.White.copy(alpha = 0.05f))
                    .border(3.dp, Color.White.copy(alpha = 0.2f), RoundedCornerShape(topStart = 40.dp, topEnd = 40.dp, bottomStart = 24.dp, bottomEnd = 24.dp)),
                contentAlignment = Alignment.BottomCenter
            ) {
                // Fluid fill level
                val fillPercentage = (currentSum / 1.0f).coerceIn(0f, 1f)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .fillMaxHeight(fillPercentage)
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(PrimaryPurple, PrimaryIndigo)
                            )
                        )
                )

                // Glass markings
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(vertical = 16.dp, horizontal = 8.dp),
                    verticalArrangement = Arrangement.SpaceBetween,
                    horizontalAlignment = Alignment.Start
                ) {
                    Text("1.0 (100%)", color = Color.White.copy(alpha = 0.3f), fontSize = 10.sp)
                    Text("0.75 (75%)", color = Color.White.copy(alpha = 0.3f), fontSize = 10.sp)
                    Text("0.5 (50%)", color = Color.White.copy(alpha = 0.3f), fontSize = 10.sp)
                    Text("0.25 (25%)", color = Color.White.copy(alpha = 0.3f), fontSize = 10.sp)
                }

                // Current indicator
                Text(
                    text = "${(currentSum * 100).toInt()}%",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 24.sp,
                    modifier = Modifier.align(Alignment.Center)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Bottles / Selection Grid
            Text(
                text = "Pilih cairan yang ingin dituangkan:",
                color = Color.White.copy(alpha = 0.8f),
                fontSize = 14.sp,
                modifier = Modifier.align(Alignment.Start)
            )
            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                bottles.take(4).forEach { bottle ->
                    BottleItem(label = bottle.first, modifier = Modifier.weight(1f)) {
                        currentSum += bottle.second
                        if (currentSum > 1.0f) currentSum = 1.0f
                    }
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                bottles.drop(4).forEach { bottle ->
                    BottleItem(label = bottle.first, modifier = Modifier.weight(1f)) {
                        currentSum += bottle.second
                        if (currentSum > 1.0f) currentSum = 1.0f
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Button(
                    onClick = { currentSum = 0f; feedbackMessage = "" },
                    colors = ButtonDefaults.buttonColors(containerColor = SurfaceDark),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Filled.Refresh, contentDescription = "Reset", tint = Color.White)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Reset", color = Color.White)
                }

                Button(
                    onClick = {
                        val diff = kotlin.math.abs(currentSum - targetValue)
                        if (diff < 0.01f) {
                            feedbackMessage = "Luar Biasa! Reaksi Berhasil Sempurna!"
                            feedbackColor = Color.Green
                            viewModel.addCoins(50)
                            viewModel.addExp(100)
                        } else {
                            feedbackMessage = "Campuran Gagal! Persentase tidak cocok."
                            feedbackColor = Color.Red
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo),
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Campurkan!", fontWeight = FontWeight.Bold)
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
                    Button(onClick = { generateNewRecipe() }) {
                        Text("Resep Berikutnya")
                    }
                }
            }
        }
    }
}

@Composable
fun BottleItem(
    label: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Box(
        modifier = modifier
            .height(70.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(SurfaceDark)
            .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(12.dp))
            .clickable(onClick = onClick)
            .padding(8.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(
                modifier = Modifier
                    .size(20.dp, 10.dp)
                    .background(Color.Gray, RoundedCornerShape(2.dp))
            )
            Spacer(modifier = Modifier.height(2.dp))
            Box(
                modifier = Modifier
                    .size(30.dp, 35.dp)
                    .background(PrimaryPurple.copy(alpha = 0.2f), RoundedCornerShape(4.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(text = label, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
