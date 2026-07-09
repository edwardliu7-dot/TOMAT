package com.example.ui.screens

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.PlayerViewModel
import com.example.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.random.Random

@Composable
fun SubmarineMinigameScreen(
    viewModel: PlayerViewModel,
    onNavigateBack: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    
    var currentDepth by remember { mutableIntStateOf(0) }
    var actionValue by remember { mutableIntStateOf(0) }
    var isDiving by remember { mutableStateOf(false) } // true for dive, false for rise
    var targetDepth by remember { mutableIntStateOf(0) }
    
    var playerInputDepth by remember { mutableFloatStateOf(0f) }
    var showResult by remember { mutableStateOf(false) }
    var isCorrect by remember { mutableStateOf(false) }

    fun generateMission() {
        currentDepth = Random.nextInt(-80, -10)
        isDiving = Random.nextBoolean()
        actionValue = Random.nextInt(5, 30)
        
        targetDepth = if (isDiving) currentDepth - actionValue else currentDepth + actionValue
        // Ensure within bounds
        if (targetDepth > 0) targetDepth = 0
        if (targetDepth < -100) targetDepth = -100
        
        playerInputDepth = currentDepth.toFloat()
        showResult = false
    }

    LaunchedEffect(Unit) {
        generateMission()
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
                text = "Misi: Palung Mariana",
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
            // Dashboard Status
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(SurfaceDark)
                    .padding(16.dp)
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                    Text("Radar Sonar", color = Grade7Text, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Posisi Awal: $currentDepth meter",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    val actionText = if (isDiving) "Turun $actionValue meter" else "Naik $actionValue meter"
                    Text(
                        text = "Instruksi: $actionText",
                        color = PrimaryIndigo,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Submarine Visual
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(24.dp))
                    .background(Grade7GradientEnd.copy(alpha = 0.2f))
            ) {
                // Depth indicator
                val animatedY by animateFloatAsState(
                    targetValue = playerInputDepth,
                    animationSpec = tween(durationMillis = 1000)
                )
                
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val h = size.height
                    val w = size.width
                    
                    // Map depth 0..-100 to y 0..h
                    val yPos = (animatedY / -100f) * h
                    
                    drawLine(
                        color = Grade7Text.copy(alpha = 0.3f),
                        start = Offset(0f, yPos),
                        end = Offset(w, yPos),
                        strokeWidth = 4f
                    )
                    
                    drawCircle(
                        color = PrimaryIndigo,
                        radius = 20f,
                        center = Offset(w / 2, yPos)
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Controller
            Text(
                text = "Arahkan Kapal Selam:",
                color = Color.White,
                fontSize = 16.sp
            )
            Text(
                text = "${playerInputDepth.toInt()} m",
                color = Grade7Text,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
            
            Slider(
                value = playerInputDepth,
                onValueChange = { playerInputDepth = it },
                valueRange = -100f..0f,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = {
                    showResult = true
                    isCorrect = (playerInputDepth.toInt() == targetDepth)
                    
                    if (isCorrect) {
                        viewModel.addCoins(50)
                        viewModel.addExp(100)
                    }
                    
                    coroutineScope.launch {
                        delay(3000)
                        if (isCorrect) {
                            generateMission()
                        } else {
                            showResult = false
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Grade7Text),
                enabled = !showResult
            ) {
                Icon(Icons.Filled.Check, contentDescription = null, tint = Grade7GradientStart)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Eksekusi Mesin!", color = Grade7GradientStart, fontSize = 18.sp, fontWeight = FontWeight.Bold)
            }
            
            if (showResult) {
                Spacer(modifier = Modifier.height(16.dp))
                if (isCorrect) {
                    Text("Berhasil! Kapal Selam aman.", color = Grade9Text, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Text("+50 Koin | +100 EXP", color = GoldCoin, fontSize = 16.sp)
                } else {
                    Text("Gagal! Target yang benar adalah $targetDepth meter.", color = Color.Red, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
