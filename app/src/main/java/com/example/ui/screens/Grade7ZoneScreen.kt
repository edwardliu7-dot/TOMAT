package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.PlayerViewModel
import com.example.ui.theme.*

@Composable
fun Grade7ZoneScreen(
    viewModel: PlayerViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToSubmarine: () -> Unit,
    onNavigateToLabKimia: () -> Unit,
    onNavigateToArsitek: () -> Unit
) {
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
                text = "Zona Penjelajah Pemula",
                color = Color.White,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold
            )
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Pilih Misi (Kelas 7)",
                color = Grade7Text,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.align(Alignment.Start)
            )
            Spacer(modifier = Modifier.height(16.dp))

            MissionCard(
                chapter = "Bab 1: Bilangan Bulat",
                title = "Kapal Selam Palung Mariana",
                description = "Atur kedalaman kapal menggunakan perhitungan +/- untuk menghindari ranjau.",
                onClick = onNavigateToSubmarine,
                accentColor = Grade7Text
            )

            Spacer(modifier = Modifier.height(16.dp))

            MissionCard(
                chapter = "Bab 2: Bilangan Rasional",
                title = "Laboratorium Kimia Penemu",
                description = "Racik persentase dan pecahan cairan ke dalam kuali.",
                onClick = onNavigateToLabKimia,
                accentColor = Grade7Text
            )

            Spacer(modifier = Modifier.height(16.dp))

            MissionCard(
                chapter = "Bab 3: Rasio",
                title = "Ekspedisi Arsitek Kota",
                description = "Hitung skala peta untuk membangun desa bawah air.",
                onClick = onNavigateToArsitek,
                accentColor = Grade7Text
            )
            
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}
