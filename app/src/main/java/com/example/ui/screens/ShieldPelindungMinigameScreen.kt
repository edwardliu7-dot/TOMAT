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
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.PlayerViewModel
import com.example.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.random.Random

@Composable
fun ShieldPelindungMinigameScreen(
    viewModel: PlayerViewModel,
    onNavigateBack: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    
    var isAreaMission by remember { mutableStateOf(true) } // true for Area (L), false for Circumference (K)
    var requestedValue by remember { mutableFloatStateOf(314f) } // target Area or Circumference
    var currentRadius by remember { mutableFloatStateOf(5f) }
    
    var showShieldAnimation by remember { mutableStateOf(false) }
    var feedbackMessage by remember { mutableStateOf("") }
    var feedbackColor by remember { mutableStateOf(Color.White) }

    fun generateNewShieldMission() {
        isAreaMission = Random.nextBoolean()
        if (isAreaMission) {
            // L = pi * r^2. Let's use nice integer radii: 5, 10, 15
            val r = listOf(5, 10, 15)[Random.nextInt(3)]
            requestedValue = (3.14f * r * r)
        } else {
            // K = 2 * pi * r. Let's use radii: 5, 10, 20
            val r = listOf(5, 10, 20)[Random.nextInt(3)]
            requestedValue = (2 * 3.14f * r)
        }
        currentRadius = 2f
        showShieldAnimation = false
        feedbackMessage = ""
    }

    LaunchedEffect(Unit) {
        generateNewShieldMission()
    }

    // Formula calculation
    val targetRadius = if (isAreaMission) {
        kotlin.math.sqrt(requestedValue / 3.14f)
    } else {
        requestedValue / (2 * 3.14f)
    }

    val animatedRadiusScale by animateFloatAsState(
        targetValue = currentRadius,
        animationSpec = tween(durationMillis = 300)
    )

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
                text = "Medan Gaya Pelindung",
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
            // Holographic objective
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(SurfaceDark)
                    .border(2.dp, Grade9Border, RoundedCornerShape(20.dp))
                    .padding(20.dp)
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                    Text("PERINTAH KOKPIT PERISAI", color = Grade9Text, fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = if (isAreaMission) "Konfigurasikan Perisai dengan LUAS (L):" else "Konfigurasikan Perisai dengan KELILING (K):",
                        color = Color.White.copy(alpha = 0.8f),
                        fontSize = 14.sp
                    )
                    Text(
                        text = "$requestedValue m" + if (isAreaMission) "²" else "",
                        color = PrimaryPurple,
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Black
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "(Gunakan π = 3.14)",
                        color = Color.White.copy(alpha = 0.5f),
                        fontSize = 12.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Ship with expanding circular shield on Canvas
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color.Black.copy(alpha = 0.3f))
                    .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(20.dp)),
                contentAlignment = Alignment.Center
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val center = Offset(size.width / 2, size.height / 2)
                    
                    // Reference grids
                    drawCircle(Color.White.copy(alpha = 0.05f), radius = 50f, center = center, style = Stroke(2f))
                    drawCircle(Color.White.copy(alpha = 0.05f), radius = 100f, center = center, style = Stroke(2f))
                    drawCircle(Color.White.copy(alpha = 0.05f), radius = 150f, center = center, style = Stroke(2f))

                    // Ship representation
                    drawCircle(
                        color = Grade9Text,
                        radius = 24f,
                        center = center
                    )
                    
                    // Circular Energy Shield
                    drawCircle(
                        color = PrimaryPurple.copy(alpha = 0.3f),
                        radius = animatedRadiusScale * 10f,
                        center = center
                    )
                    drawCircle(
                        color = PrimaryPurple,
                        radius = animatedRadiusScale * 10f,
                        center = center,
                        style = Stroke(4f)
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Slider controls
            Text(
                text = "Atur Radius Perisai (r):",
                color = Color.White,
                fontSize = 14.sp
            )
            Text(
                text = "${currentRadius.toInt()} meter",
                color = Grade9Text,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
            
            Slider(
                value = currentRadius,
                onValueChange = { if (!showShieldAnimation) currentRadius = it.toInt().toFloat() },
                valueRange = 1f..25f,
                steps = 23,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = {
                    showShieldAnimation = true
                    coroutineScope.launch {
                        delay(1200)
                        if (kotlin.math.abs(currentRadius - targetRadius) < 0.1f) {
                            feedbackMessage = "PERISAI SOLID! Meteor hancur berkeping-keping."
                            feedbackColor = Color.Green
                            viewModel.addCoins(60)
                            viewModel.addExp(120)
                        } else {
                            feedbackMessage = "PERISAI JEBOL! Radius tidak cocok dengan frekuensi."
                            feedbackColor = Color.Red
                        }
                    }
                },
                enabled = !showShieldAnimation,
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryPurple),
                modifier = Modifier.fillMaxWidth().height(56.dp)
            ) {
                Icon(Icons.Filled.Shield, contentDescription = "Shield", tint = Color.White)
                Spacer(modifier = Modifier.width(8.dp))
                Text("AKTIFKAN MEDAN GAYA PELINDUNG", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
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
                Button(onClick = { generateNewShieldMission() }) {
                    Text("Meteor Berikutnya")
                }
            }
        }
    }
}
