package com.beautyanalyzer.ai.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFFE056FD),
    secondary = Color(0xFF686DE0),
    tertiary = Color(0xFF22D3EE),
    background = Color(0xFF0D0F17),
    surface = Color(0xFF1E2235),
    onPrimary = Color.White,
    onBackground = Color(0xFFF3F4F6),
    onSurface = Color(0xFFF3F4F6)
)

private val LightColorScheme = lightColorScheme(
    primary = Color(0xFFA855F7),
    secondary = Color(0xFF4F46E5),
    tertiary = Color(0xFF06B6D4),
    background = Color(0xFFF8FAFC),
    surface = Color(0xFFFFFFFF),
    onPrimary = Color.White,
    onBackground = Color(0xFF0F172A),
    onSurface = Color(0xFF0F172A)
)

@Composable
fun BeautyAnalyzerTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colors = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colors,
        content = content
    )
}
