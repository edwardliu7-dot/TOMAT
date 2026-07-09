package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.ui.NavRoutes
import com.example.ui.PlayerViewModel
import com.example.ui.screens.HomeScreen
import com.example.ui.screens.Grade7ZoneScreen
import com.example.ui.screens.Grade8ZoneScreen
import com.example.ui.screens.Grade9ZoneScreen
import com.example.ui.screens.SubmarineMinigameScreen
import com.example.ui.screens.LabKimiaMinigameScreen
import com.example.ui.screens.ArsitekKotaMinigameScreen
import com.example.ui.screens.JembatanBatuMinigameScreen
import com.example.ui.screens.PabrikSenjataMinigameScreen
import com.example.ui.screens.PemanahBalistaMinigameScreen
import com.example.ui.screens.PasarBarterMinigameScreen
import com.example.ui.screens.SortirKargoMinigameScreen
import com.example.ui.screens.GeneratorWormholeMinigameScreen
import com.example.ui.screens.HologramBlueprintMinigameScreen
import com.example.ui.screens.ShieldPelindungMinigameScreen
import com.example.ui.theme.BackgroundDark
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {
    private val playerViewModel: PlayerViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = BackgroundDark
                ) {
                    val navController = rememberNavController()

                    NavHost(
                        navController = navController,
                        startDestination = NavRoutes.Home.route
                    ) {
                        composable(NavRoutes.Home.route) {
                            HomeScreen(
                                viewModel = playerViewModel,
                                onNavigateToGrade7 = { navController.navigate(NavRoutes.Grade7Zone.route) },
                                onNavigateToGrade8 = { navController.navigate(NavRoutes.Grade8Zone.route) },
                                onNavigateToGrade9 = { navController.navigate(NavRoutes.Grade9Zone.route) }
                            )
                        }
                        
                        // Grade 7 Zone
                        composable(NavRoutes.Grade7Zone.route) {
                            Grade7ZoneScreen(
                                viewModel = playerViewModel,
                                onNavigateBack = { navController.popBackStack() },
                                onNavigateToSubmarine = { navController.navigate(NavRoutes.MinigameSubmarine.route) },
                                onNavigateToLabKimia = { navController.navigate(NavRoutes.MinigameLabKimia.route) },
                                onNavigateToArsitek = { navController.navigate(NavRoutes.MinigameArsitek.route) }
                            )
                        }
                        composable(NavRoutes.MinigameSubmarine.route) {
                            SubmarineMinigameScreen(
                                viewModel = playerViewModel,
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }
                        composable(NavRoutes.MinigameLabKimia.route) {
                            LabKimiaMinigameScreen(
                                viewModel = playerViewModel,
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }
                        composable(NavRoutes.MinigameArsitek.route) {
                            ArsitekKotaMinigameScreen(
                                viewModel = playerViewModel,
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }

                        // Grade 8 Zone
                        composable(NavRoutes.Grade8Zone.route) {
                            Grade8ZoneScreen(
                                viewModel = playerViewModel,
                                onNavigateBack = { navController.popBackStack() },
                                onNavigateToJembatan = { navController.navigate(NavRoutes.MinigameJembatan.route) },
                                onNavigateToPabrikSenjata = { navController.navigate(NavRoutes.MinigamePabrikSenjata.route) },
                                onNavigateToPemanah = { navController.navigate(NavRoutes.MinigamePemanah.route) },
                                onNavigateToPasarBarter = { navController.navigate(NavRoutes.MinigamePasarBarter.route) }
                            )
                        }
                        composable(NavRoutes.MinigameJembatan.route) {
                            JembatanBatuMinigameScreen(
                                viewModel = playerViewModel,
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }
                        composable(NavRoutes.MinigamePabrikSenjata.route) {
                            PabrikSenjataMinigameScreen(
                                viewModel = playerViewModel,
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }
                        composable(NavRoutes.MinigamePemanah.route) {
                            PemanahBalistaMinigameScreen(
                                viewModel = playerViewModel,
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }
                        composable(NavRoutes.MinigamePasarBarter.route) {
                            PasarBarterMinigameScreen(
                                viewModel = playerViewModel,
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }

                        // Grade 9 Zone
                        composable(NavRoutes.Grade9Zone.route) {
                            Grade9ZoneScreen(
                                viewModel = playerViewModel,
                                onNavigateBack = { navController.popBackStack() },
                                onNavigateToKargo = { navController.navigate(NavRoutes.MinigameKargo.route) },
                                onNavigateToWormhole = { navController.navigate(NavRoutes.MinigameWormhole.route) },
                                onNavigateToHologram = { navController.navigate(NavRoutes.MinigameHologram.route) },
                                onNavigateToShield = { navController.navigate(NavRoutes.MinigameShield.route) }
                            )
                        }
                        composable(NavRoutes.MinigameKargo.route) {
                            SortirKargoMinigameScreen(
                                viewModel = playerViewModel,
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }
                        composable(NavRoutes.MinigameWormhole.route) {
                            GeneratorWormholeMinigameScreen(
                                viewModel = playerViewModel,
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }
                        composable(NavRoutes.MinigameHologram.route) {
                            HologramBlueprintMinigameScreen(
                                viewModel = playerViewModel,
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }
                        composable(NavRoutes.MinigameShield.route) {
                            ShieldPelindungMinigameScreen(
                                viewModel = playerViewModel,
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }
                    }
                }
            }
        }
    }
}
