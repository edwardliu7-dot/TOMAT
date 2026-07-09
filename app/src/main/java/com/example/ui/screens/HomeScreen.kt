package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Diamond
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Leaderboard
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Token
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.PlayerViewModel
import com.example.ui.theme.*

@Composable
fun PlayerStatsHeader(viewModel: PlayerViewModel) {
    val state by viewModel.uiState.collectAsState()

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(WindowInsets.statusBars.asPaddingValues())
            .padding(top = 16.dp, start = 24.dp, end = 24.dp, bottom = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Brush.topRightInLinear(listOf(PrimaryPurple, PrimaryIndigo)))
                    .border(2.dp, Color.White.copy(alpha = 0.2f), RoundedCornerShape(16.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = state.name.take(1).uppercase(),
                    color = Color.White,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = "Elite Explorer",
                    color = TextSecondary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    letterSpacing = 1.sp
                )
                Text(
                    text = state.name,
                    color = TextPrimary,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        Column(horizontalAlignment = Alignment.End) {
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(16.dp))
                    .background(SurfaceDark)
                    .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(16.dp))
                    .padding(horizontal = 12.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Filled.Token, contentDescription = "Coins", tint = GoldCoin, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "${state.coins}",
                    color = GoldCoin,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(6.dp))
                    .background(PrimaryIndigo.copy(alpha = 0.2f))
                    .padding(horizontal = 8.dp, vertical = 2.dp)
            ) {
                Text(
                    text = "LEVEL ${state.level}",
                    color = PrimaryIndigo,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
            }
        }
    }
}

fun Brush.Companion.topRightInLinear(colors: List<Color>): Brush {
    return linearGradient(
        colors = colors,
        start = androidx.compose.ui.geometry.Offset(Float.POSITIVE_INFINITY, 0f),
        end = androidx.compose.ui.geometry.Offset(0f, Float.POSITIVE_INFINITY)
    )
}

@Composable
fun HomeScreen(
    viewModel: PlayerViewModel,
    onNavigateToGrade7: () -> Unit,
    onNavigateToGrade8: () -> Unit,
    onNavigateToGrade9: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
    ) {
        PlayerStatsHeader(viewModel)

        Column(
            modifier = Modifier
                .weight(1f)
                .padding(16.dp)
        ) {
            Text(
                text = "PILIH ZONA BELAJAR",
                color = TextSecondary,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 2.sp,
                modifier = Modifier.padding(horizontal = 8.dp)
            )
            Spacer(modifier = Modifier.height(16.dp))

            ZoneCardGeometric(
                modifier = Modifier.weight(1f),
                title = "KELAS 7",
                subtitle = "Penjelajah Pemula",
                stats = "3 BAB • 12 TUGAS",
                actionText = "MULAI MISI",
                bgGradient = Brush.linearGradient(listOf(Grade7GradientStart, Grade7GradientEnd)),
                borderColor = Grade7Border,
                textColor = Grade7Text,
                iconColor = Grade7Icon,
                onClick = onNavigateToGrade7
            )

            Spacer(modifier = Modifier.height(16.dp))

            ZoneCardGeometric(
                modifier = Modifier.weight(1f),
                title = "KELAS 8",
                subtitle = "Ksatria Geometri",
                stats = "4 BAB • 16 TUGAS",
                actionText = "MASUKI GERBANG",
                bgGradient = Brush.linearGradient(listOf(Grade8GradientStart, Grade8GradientEnd)),
                borderColor = Grade8Border,
                textColor = Grade8Text,
                iconColor = Grade8Icon,
                onClick = onNavigateToGrade8
            )

            Spacer(modifier = Modifier.height(16.dp))

            ZoneCardGeometric(
                modifier = Modifier.weight(1f),
                title = "KELAS 9",
                subtitle = "Komandan Antariksa",
                stats = "4 BAB • 20 TUGAS",
                actionText = "LUNCURKAN",
                bgGradient = Brush.linearGradient(listOf(Grade9Bg, Grade9Bg)),
                borderColor = Grade9Border,
                textColor = Grade9Text,
                iconColor = Grade9Icon,
                onClick = onNavigateToGrade9
            )
        }

        // Bottom Navigation
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(SurfaceVariantDark)
                .border(1.dp, Color.White.copy(alpha = 0.05f))
                .padding(WindowInsets.navigationBars.asPaddingValues())
                .padding(vertical = 12.dp, horizontal = 32.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            BottomNavItem(Icons.Filled.Home, "Home", PrimaryIndigo, true)
            BottomNavItem(Icons.Filled.Leaderboard, "Leader", TextSecondary, false)
            BottomNavItem(Icons.Filled.Person, "Profil", TextSecondary, false)
        }
    }
}

@Composable
fun BottomNavItem(icon: ImageVector, label: String, color: Color, selected: Boolean) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.padding(4.dp)
    ) {
        Icon(icon, contentDescription = label, tint = color, modifier = Modifier.size(24.dp))
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = label.uppercase(),
            color = color,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.5.sp
        )
    }
}

@Composable
fun ZoneCardGeometric(
    modifier: Modifier = Modifier,
    title: String,
    subtitle: String,
    stats: String,
    actionText: String,
    bgGradient: Brush,
    borderColor: Color,
    textColor: Color,
    iconColor: Color,
    onClick: () -> Unit
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(bgGradient)
            .border(2.dp, borderColor, RoundedCornerShape(24.dp))
            .clickable(onClick = onClick)
    ) {
        // Icon overlay top right
        Icon(
            Icons.Filled.Explore,
            contentDescription = null,
            tint = iconColor.copy(alpha = 0.4f),
            modifier = Modifier
                .size(96.dp)
                .align(Alignment.TopEnd)
                .padding(16.dp)
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    text = title,
                    color = Color.White,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Black,
                    fontStyle = FontStyle.Italic,
                    letterSpacing = (-1).sp
                )
                Text(
                    text = subtitle.uppercase(),
                    color = textColor,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    Box(modifier = Modifier.height(4.dp).width(32.dp).background(textColor, RoundedCornerShape(2.dp)))
                    Box(modifier = Modifier.height(4.dp).width(8.dp).background(textColor.copy(alpha = 0.3f), RoundedCornerShape(2.dp)))
                    Box(modifier = Modifier.height(4.dp).width(8.dp).background(textColor.copy(alpha = 0.3f), RoundedCornerShape(2.dp)))
                }
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom
            ) {
                Text(
                    text = stats,
                    color = Color.White.copy(alpha = 0.6f),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium
                )
                Box(
                    modifier = Modifier
                        .background(Color.White.copy(alpha = 0.1f), RoundedCornerShape(16.dp))
                        .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(16.dp))
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = actionText,
                        color = Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
