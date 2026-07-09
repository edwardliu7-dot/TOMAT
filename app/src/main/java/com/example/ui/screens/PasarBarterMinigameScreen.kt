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
fun PasarBarterMinigameScreen(
    viewModel: PlayerViewModel,
    onNavigateBack: () -> Unit
) {
    var priceX by remember { mutableIntStateOf(5) } // Sword cost
    var priceY by remember { mutableIntStateOf(10) } // Shield cost
    
    // Equations of form: ax + by = sum1, cx + dy = sum2
    var eqA by remember { mutableStateOf("2 Pedang + 1 Perisai = 20 Koin") }
    var eqB by remember { mutableStateOf("1 Pedang + 1 Perisai = 15 Koin") }
    
    var selectedX by remember { mutableStateOf("") }
    var selectedY by remember { mutableStateOf("") }
    
    var feedbackMessage by remember { mutableStateOf("") }
    var feedbackColor by remember { mutableStateOf(Color.White) }

    fun generateNewEquations() {
        // Simple distinct solutions
        val combinations = listOf(
            Pair(4, 8),
            Pair(5, 10),
            Pair(6, 12),
            Pair(5, 8),
            Pair(8, 12)
        )
        val selected = combinations[Random.nextInt(combinations.size)]
        priceX = selected.first
        priceY = selected.second
        
        eqA = "2 Pedang + 1 Perisai = ${2 * priceX + priceY} Koin"
        eqB = "1 Pedang + 1 Perisai = ${priceX + priceY} Koin"
        
        selectedX = ""
        selectedY = ""
        feedbackMessage = ""
    }

    LaunchedEffect(Unit) {
        generateNewEquations()
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
                text = "Pasar Barter Ksatria",
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
            // Secret scroll document
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(SurfaceDark)
                    .border(2.dp, Grade8Border, RoundedCornerShape(20.dp))
                    .padding(20.dp)
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                    Text("FAKTUR BARTER RAHASIA", color = Grade8Text, fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color.White.copy(alpha = 0.05f))
                            .padding(12.dp)
                    ) {
                        Column {
                            Text("📦 Paket Perunggu:", color = Grade8Text, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text(eqA, color = Color.White, fontSize = 16.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color.White.copy(alpha = 0.05f))
                            .padding(12.dp)
                    ) {
                        Column {
                            Text("📦 Paket Perak:", color = Grade8Text, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text(eqB, color = Color.White, fontSize = 16.sp)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Selection section
            Text("Pecahkan kode barang:", color = Color.White, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(16.dp))

            // Guess for Sword (x)
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("🗡️ Harga 1 Pedang (x):", color = Color.White, fontSize = 14.sp)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    val guesses = listOf(priceX, priceX + 2, priceX - 1).shuffled()
                    guesses.forEach { guess ->
                        Box(
                            modifier = Modifier
                                .size(50.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (selectedX == guess.toString()) Grade8Text else SurfaceDark)
                                .border(1.dp, Grade8Border, RoundedCornerShape(10.dp))
                                .clickable { selectedX = guess.toString() },
                            contentAlignment = Alignment.Center
                        ) {
                            Text("$guess", color = if (selectedX == guess.toString()) Color.Black else Color.White, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Guess for Shield (y)
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("🛡️ Harga 1 Perisai (y):", color = Color.White, fontSize = 14.sp)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    val guesses = listOf(priceY, priceY + 4, priceY - 2).shuffled()
                    guesses.forEach { guess ->
                        Box(
                            modifier = Modifier
                                .size(50.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (selectedY == guess.toString()) Grade8Text else SurfaceDark)
                                .border(1.dp, Grade8Border, RoundedCornerShape(10.dp))
                                .clickable { selectedY = guess.toString() },
                            contentAlignment = Alignment.Center
                        ) {
                            Text("$guess", color = if (selectedY == guess.toString()) Color.Black else Color.White, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            Button(
                onClick = {
                    if (selectedX == priceX.toString() && selectedY == priceY.toString()) {
                        feedbackMessage = "BERHASIL! Barter berhasil, Anda hemat koin."
                        feedbackColor = Color.Green
                        viewModel.addCoins(60)
                        viewModel.addExp(120)
                    } else {
                        feedbackMessage = "GAGAL! Pedagang menyadari hitungan Anda salah."
                        feedbackColor = Color.Red
                    }
                },
                enabled = selectedX.isNotEmpty() && selectedY.isNotEmpty() && feedbackMessage.isEmpty(),
                colors = ButtonDefaults.buttonColors(containerColor = Grade8Text),
                modifier = Modifier.fillMaxWidth().height(56.dp)
            ) {
                Text("PROPOSAL BARTER", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 16.sp)
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
                Button(onClick = { generateNewEquations() }) {
                    Text("Transaksi Berikutnya")
                }
            }
        }
    }
}
