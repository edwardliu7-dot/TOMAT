package com.example.ui.screens

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
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
fun PabrikSenjataMinigameScreen(
    viewModel: PlayerViewModel,
    onNavigateBack: () -> Unit
) {
    var domainX by remember { mutableIntStateOf(4) }
    var functionString by remember { mutableStateOf("f(x) = 2x + 3") }
    var formulaType by remember { mutableIntStateOf(0) } // 0: 2x+3, 1: 3x-1, 2: 5x-2, 3: x^2 + 1
    
    var currentGuess by remember { mutableStateOf("") }
    var feedbackMessage by remember { mutableStateOf("") }
    var feedbackColor by remember { mutableStateOf(Color.White) }

    fun generateNewFormula() {
        formulaType = Random.nextInt(4)
        domainX = Random.nextInt(2, 8)
        functionString = when (formulaType) {
            0 -> "f(x) = 2x + 3"
            1 -> "f(x) = 3x - 1"
            2 -> "f(x) = 5x - 2"
            3 -> "f(x) = x² + 1"
            else -> "f(x) = x + 5"
        }
        currentGuess = ""
        feedbackMessage = ""
    }

    val correctAnswer = when (formulaType) {
        0 -> 2 * domainX + 3
        1 -> 3 * domainX - 1
        2 -> 5 * domainX - 2
        3 -> domainX * domainX + 1
        else -> domainX + 5
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
                text = "Pabrik Senjata Pandai Besi",
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
            // Function forge panel
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(SurfaceDark)
                    .border(2.dp, Grade8Border, RoundedCornerShape(20.dp))
                    .padding(20.dp)
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                    Text("MESIN FORMULA FUNGSI f(x)", color = Grade8Text, fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Rumus: $functionString",
                        color = Color.White,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Black
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Input Domain (x) = $domainX",
                        color = Grade8Text,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Blacksmith weapon animation representation
            Box(
                modifier = Modifier
                    .size(140.dp)
                    .clip(RoundedCornerShape(70.dp))
                    .background(Color.White.copy(alpha = 0.05f))
                    .border(2.dp, Grade8Text, RoundedCornerShape(70.dp)),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("🔨", fontSize = 48.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("PROSES FORGING", color = Color.White.copy(alpha = 0.6f), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Input keypad or number buttons
            Text(
                text = "Berapakah nilai Range f($domainX) yang akan ditempa?",
                color = Color.White,
                fontSize = 14.sp
            )
            Spacer(modifier = Modifier.height(8.dp))

            // Quick choices
            val wrong1 = correctAnswer + Random.nextInt(2, 6)
            val wrong2 = (correctAnswer - Random.nextInt(1, 4)).coerceAtLeast(1)
            val wrong3 = correctAnswer + Random.nextInt(6, 12)
            
            val options = remember(correctAnswer) {
                listOf(correctAnswer, wrong1, wrong2, wrong3).shuffled()
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
                            .border(1.dp, Grade8Border, RoundedCornerShape(12.dp))
                            .clickable(enabled = feedbackMessage.isEmpty()) {
                                if (opt == correctAnswer) {
                                    feedbackMessage = "Pedang Terbentuk! Kekuatan Senjata: $correctAnswer."
                                    feedbackColor = Color.Green
                                    viewModel.addCoins(50)
                                    viewModel.addExp(100)
                                } else {
                                    feedbackMessage = "Tempaan Hancur! Besi terlalu rapuh."
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
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(12.dp))
                Button(
                    onClick = { generateNewFormula() },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo)
                ) {
                    Text("Dapatkan Besi Baru")
                }
            }
        }
    }
}
