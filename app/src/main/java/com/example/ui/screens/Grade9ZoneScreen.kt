package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.PlayerViewModel
import com.example.ui.theme.*

@Composable
fun Grade9ZoneScreen(
    viewModel: PlayerViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToKargo: () -> Unit,
    onNavigateToWormhole: () -> Unit,
    onNavigateToHologram: () -> Unit,
    onNavigateToShield: () -> Unit
) {
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
                text = "Zona Komandan Antariksa",
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
                text = "Pilih Misi (Kelas 9)",
                color = Grade9Text,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.align(Alignment.Start)
            )
            Spacer(modifier = Modifier.height(16.dp))

            MissionCard(
                chapter = "Bab 1: Operasi Aljabar",
                title = "Sortir Kargo & Negosiasi Alien",
                description = "Sederhanakan variabel aljabar dari barang bawaan pesawat.",
                onClick = onNavigateToKargo,
                accentColor = Grade9Text
            )

            Spacer(modifier = Modifier.height(16.dp))

            MissionCard(
                chapter = "Bab 2: Pangkat & Akar",
                title = "Generator Lubang Cacing",
                description = "Masukkan inti energi ke mesin dengan menyederhanakan bentuk akar.",
                onClick = onNavigateToWormhole,
                accentColor = Grade9Text
            )

            Spacer(modifier = Modifier.height(16.dp))

            MissionCard(
                chapter = "Bab 3: Kesebangunan",
                title = "Cetak Biru Hologram",
                description = "Bangun suku cadang proporsional dari cetak biru rasio.",
                onClick = onNavigateToHologram,
                accentColor = Grade9Text
            )

            Spacer(modifier = Modifier.height(16.dp))

            MissionCard(
                chapter = "Bab 4: Lingkaran",
                title = "Medan Gaya (Shield)",
                description = "Atur radius perisai energi menggunakan Luas/Keliling untuk menahan meteor.",
                onClick = onNavigateToShield,
                accentColor = Grade9Text
            )
            
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}
