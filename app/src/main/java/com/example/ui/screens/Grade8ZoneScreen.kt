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
fun Grade8ZoneScreen(
    viewModel: PlayerViewModel,
    onNavigateBack: () -> Unit,
    onNavigateToJembatan: () -> Unit,
    onNavigateToPabrikSenjata: () -> Unit,
    onNavigateToPemanah: () -> Unit,
    onNavigateToPasarBarter: () -> Unit
) {
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
                text = "Zona Ksatria Geometri",
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
                text = "Pilih Misi (Kelas 8)",
                color = Grade8Text,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.align(Alignment.Start)
            )
            Spacer(modifier = Modifier.height(16.dp))

            MissionCard(
                chapter = "Bab 1: Pola Bilangan",
                title = "Jembatan Batu Ajaib",
                description = "Melompat di atas batu yang membentuk barisan deret angka.",
                onClick = onNavigateToJembatan,
                accentColor = Grade8Text
            )

            Spacer(modifier = Modifier.height(16.dp))

            MissionCard(
                chapter = "Bab 2: Relasi & Fungsi",
                title = "Pabrik Senjata Pandai Besi",
                description = "Masukkan nilai Domain (x) ke mesin fungsi f(x) untuk menghasilkan senjata.",
                onClick = onNavigateToPabrikSenjata,
                accentColor = Grade8Text
            )

            Spacer(modifier = Modifier.height(16.dp))

            MissionCard(
                chapter = "Bab 3: Persamaan Garis Lurus",
                title = "Pemanah Balista",
                description = "Atur tuas gradien (m) agar panah meluncur lurus mengenai target.",
                onClick = onNavigateToPemanah,
                accentColor = Grade8Text
            )

            Spacer(modifier = Modifier.height(16.dp))

            MissionCard(
                chapter = "Bab 4: SPLDV",
                title = "Pasar Barter Ksatria",
                description = "Cari nilai x (pedang) dan y (perisai) dari paket belanja pedagang.",
                onClick = onNavigateToPasarBarter,
                accentColor = Grade8Text
            )
            
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}
