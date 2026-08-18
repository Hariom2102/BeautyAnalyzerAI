package com.beautyanalyzer.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.beautyanalyzer.ai.ui.theme.BeautyAnalyzerTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            var darkTheme by remember { mutableStateOf(true) }

            BeautyAnalyzerTheme(darkTheme = darkTheme) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainScreen(
                        isDark = darkTheme,
                        onToggleTheme = { darkTheme = !darkTheme }
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(isDark: Boolean, onToggleTheme: () -> Unit) {
    var currentTab by remember { mutableStateOf("analyzer") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Beauty Analyzer AI") },
                actions = {
                    IconButton(onClick = onToggleTheme) {
                        Text(if (isDark) "☀️" else "🌙")
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = currentTab == "analyzer",
                    onClick = { currentTab = "analyzer" },
                    label = { Text("Analyzer") },
                    icon = { Text("📷") }
                )
                NavigationBarItem(
                    selected = currentTab == "history",
                    onClick = { currentTab = "history" },
                    label = { Text("History") },
                    icon = { Text("📜") }
                )
                NavigationBarItem(
                    selected = currentTab == "settings",
                    onClick = { currentTab = "settings" },
                    label = { Text("Settings") },
                    icon = { Text("⚙️") }
                )
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            when (currentTab) {
                "analyzer" -> AnalyzerView()
                "history" -> HistoryView()
                "settings" -> SettingsView()
            }
        }
    }
}

@Composable
fun AnalyzerView() {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
        modifier = Modifier.fillMaxSize()
    ) {
        Card(modifier = Modifier.padding(16.dp)) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Entertainment Disclaimer",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "This fictional Beauty Score (0-100%) is generated for fun and entertainment purposes only. It is not scientifically valid.",
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(onClick = { /* Open CameraX / Gallery */ }) {
            Text("Capture Selfie or Select Photo")
        }
    }
}

@Composable
fun HistoryView() {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("No analysis history saved yet.")
    }
}

@Composable
fun SettingsView() {
    Column(modifier = Modifier.fillMaxSize()) {
        Text("Settings & Privacy Policy", style = MaterialTheme.typography.titleLarge)
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = { /* Clear DB */ }) {
            Text("Clear All Saved Data")
        }
    }
}
