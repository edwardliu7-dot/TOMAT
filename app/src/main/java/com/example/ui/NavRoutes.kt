package com.example.ui

sealed class NavRoutes(val route: String) {
    object Home : NavRoutes("home")
    object Grade7Zone : NavRoutes("grade7")
    object Grade8Zone : NavRoutes("grade8")
    object Grade9Zone : NavRoutes("grade9")
    
    // Grade 7 Minigames
    object MinigameSubmarine : NavRoutes("minigame_submarine")
    object MinigameLabKimia : NavRoutes("minigame_lab_kimia")
    object MinigameArsitek : NavRoutes("minigame_arsitek")

    // Grade 8 Minigames
    object MinigameJembatan : NavRoutes("minigame_jembatan")
    object MinigamePabrikSenjata : NavRoutes("minigame_pabrik_senjata")
    object MinigamePemanah : NavRoutes("minigame_pemanah")
    object MinigamePasarBarter : NavRoutes("minigame_pasar_barter")

    // Grade 9 Minigames
    object MinigameKargo : NavRoutes("minigame_kargo")
    object MinigameWormhole : NavRoutes("minigame_wormhole")
    object MinigameHologram : NavRoutes("minigame_hologram")
    object MinigameShield : NavRoutes("minigame_shield")
}
