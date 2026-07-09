package com.example.ui.screens

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Send
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
fun PemanahBalistaMinigameScreen(
    viewModel: PlayerViewModel,
    onNavigateBack: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    
    var targetX by remember { mutableIntStateOf(4) }
    var targetY by remember { mutableIntStateOf(8) }
    var currentM by remember { mutableFloatStateOf(1f) }
    
    var showAnimation by remember { mutableStateOf(false) }
    var animationProgress by remember { mutableFloatStateOf(0f) }
    
    var feedbackMessage by remember { mutableStateOf("") }
    var feedbackColor by remember { mutableStateOf(Color.White) }

    fun generateNewTarget() {
        val candidates = listOf(
            Pair(2, 4),   // m = 2
            Pair(3, 9),   // m = 3
            Pair(4, 4),   // m = 1
            Pair(5, 10),  // m = 2
            Pair(3, 6),   // m = 2
            Pair(4, -8),  // m = -2
            Pair(5, -5)   // m = -1
        )
        val selected = candidates[Random.nextInt(candidates.size)]
        targetX = selected.first
        targetY = selected.second
        currentM = 0f
        showAnimation = false
        animationProgress = 0f
        feedbackMessage = ""
    }

    LaunchedEffect(Unit) {
        generateNewTarget()
    }

    val targetM = targetY.toFloat() / targetX.toFloat()

    val animatedArrowProgress by animateFloatAsState(
        targetValue = if (showAnimation) 1f else 0f,
        animationSpec = tween(durationMillis = 1500)
    )

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
                text = "Pemanah Balista",
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
            // Objective Header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(SurfaceDark)
                    .border(1.dp, Grade8Border, RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                    Text("MISI GRADASI (GRADIENT) GARIS LURUS", color = Grade8Text, fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Target berada di koordinat ($targetX, $targetY)",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Persamaan Lintasan: y = mx",
                        color = Color.White.copy(alpha = 0.7f),
                        fontSize = 14.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Graph Canvas representing Cartesian plane
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color.Black.copy(alpha = 0.3f))
                    .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(20.dp))
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val w = size.width
                    val h = size.height
                    val originX = w / 2
                    val originY = h / 2
                    
                    // Draw grid axes
                    drawLine(Color.White.copy(alpha = 0.2f), Offset(0f, originY), Offset(w, originY), 2f)
                    drawLine(Color.White.copy(alpha = 0.2f), Offset(originX, 0f), Offset(originX, h), 2f)
                    
                    // Draw ticks
                    val unit = w / 24f // scale factor
                    
                    // Draw target
                    val targetCanvasX = originX + targetX * unit
                    val targetCanvasY = originY - targetY * unit // invert y for Cartesian
                    
                    drawCircle(
                        color = Color.Red,
                        radius = 16f,
                        center = Offset(targetCanvasX, targetCanvasY)
                    )
                    drawCircle(
                        color = Color.White,
                        radius = 8f,
                        center = Offset(targetCanvasX, targetCanvasY)
                    )
                    
                    // Firing trajectory line
                    val arrowX = originX + (targetX * unit) * animatedArrowProgress
                    val arrowY = originY - (targetX * currentM * unit) * animatedArrowProgress
                    
                    if (animatedArrowProgress > 0f) {
                        drawLine(
                            color = Grade8Text,
                            start = Offset(originX, originY),
                            end = Offset(arrowX, arrowY),
                            strokeWidth = 4f
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Slider to control gradient m
            Text(
                text = "Atur Nilai Gradien (m):",
                color = Color.White,
                fontSize = 14.sp
            )
            Text(
                text = "m = ${String.format("%.1f", currentM)}",
                color = Grade8Text,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
            
            Slider(
                value = currentM,
                onValueChange = { if (!showAnimation) currentM = it },
                valueRange = -5f..5f,
                steps = 19, // step size 0.5
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = {
                    showAnimation = true
                    coroutineScope.launch {
                        delay(1600)
                        if (kotlin.math.abs(currentM - targetM) < 0.1f) {
                            feedbackMessage = "TETAP SASARAN! Musuh berhasil ditumbangkan."
                            feedbackColor = Color.Green
                            viewModel.addCoins(60)
                            viewModel.addExp(120)
                        } else {
                            feedbackMessage = "MELENSET! Bidikan panah melenceng."
                            feedbackColor = Color.Red
                        }
                    }
                },
                enabled = !showAnimation,
                colors = ButtonDefaults.buttonColors(containerColor = Grade8Text),
                modifier = Modifier.fillMaxWidth().height(56.dp)
            ) {
                Icon(Icons.Filled.Send, contentDescription = "Tembak", tint = Color.Black)
                Spacer(modifier = Modifier.width(8.dp))
                Text("LEPASKAN ANAK PANAH!", color = Color.Black, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }

            if (feedbackMessage.isNotEmpty()) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = feedbackMessage,
                    color = feedbackColor,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))
                Button(onClick = { generateNewTarget() }) {
                    Text("Target Berikutnya")
                }
            }
        }
    }
}
