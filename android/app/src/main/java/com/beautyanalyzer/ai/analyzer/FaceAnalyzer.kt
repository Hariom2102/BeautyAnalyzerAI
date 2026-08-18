package com.beautyanalyzer.ai.analyzer

import android.graphics.Bitmap
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.face.Face
import com.google.mlkit.vision.face.FaceDetection
import com.google.mlkit.vision.face.FaceDetectorOptions
import com.google.mlkit.vision.face.FaceLandmark
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCancellableCoroutine
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min

data class AnalysisData(
    val beautyScore: Int,
    val symmetryScore: Int,
    val smileScore: Int,
    val confidenceScore: Int,
    val pitchAngle: Float,
    val yawAngle: Float,
    val rollAngle: Float,
    val suggestions: List<String>
)

class FaceAnalyzer {

    private val options = FaceDetectorOptions.Builder()
        .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_ACCURATE)
        .setLandmarkMode(FaceDetectorOptions.LANDMARK_MODE_ALL)
        .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
        .setContourMode(FaceDetectorOptions.CONTOUR_MODE_ALL)
        .build()

    private val detector = FaceDetection.getClient(options)

    suspend fun analyzeBitmap(bitmap: Bitmap): AnalysisData? = suspendCancellableCoroutine { continuation ->
        val image = InputImage.fromBitmap(bitmap, 0)
        detector.process(image)
            .addOnSuccessListener { faces ->
                if (faces.isEmpty()) {
                    continuation.resume(null)
                    return@addOnSuccessListener
                }

                val face = faces.first()
                val analysis = computeMetrics(face)
                continuation.resume(analysis)
            }
            .addOnFailureListener {
                continuation.resume(null)
            }
    }

    private fun computeMetrics(face: Face): AnalysisData {
        val leftEye = face.getLandmark(FaceLandmark.LEFT_EYE)?.position
        val rightEye = face.getLandmark(FaceLandmark.RIGHT_EYE)?.position
        val nose = face.getLandmark(FaceLandmark.NOSE_BASE)?.position
        val leftCheek = face.getLandmark(FaceLandmark.LEFT_CHEEK)?.position
        val rightCheek = face.getLandmark(FaceLandmark.RIGHT_CHEEK)?.position

        var symmetryScore = 88
        if (leftEye != null && rightEye != null && nose != null) {
            val distLeft = abs(leftEye.x - nose.x)
            val distRight = abs(rightEye.x - nose.x)
            val ratio = 1f - (abs(distLeft - distRight) / max(distLeft, distRight))
            symmetryScore = (ratio * 100).toInt().coerceIn(75, 99)
        }

        val smileProb = face.smilingProbability ?: 0.6f
        val smileScore = (smileProb * 100).toInt().coerceIn(40, 100)

        val roll = face.headEulerAngleZ
        val pitch = face.headEulerAngleX
        val yaw = face.headEulerAngleY

        val confidence = 96

        // Fictional score formula for entertainment purposes only
        val rawBeauty = (symmetryScore * 0.45) + (smileScore * 0.25) + 28
        val beautyScore = rawBeauty.toInt().coerceIn(80, 99)

        val suggestions = mutableListOf<String>()
        if (smileScore < 60) {
            suggestions.add("A bright smile boosts perceived facial harmony by up to 15%.")
        } else {
            suggestions.add("Radiant smile detected! Excellent expression.")
        }
        if (symmetryScore > 90) {
            suggestions.add("High facial symmetry detected. Center-parted hairstyles suit you great.")
        } else {
            suggestions.add("Layered hairstyles add subtle dynamic balance to your features.")
        }
        suggestions.add("Soft ambient lighting recommended for front portraits.")

        return AnalysisData(
            beautyScore = beautyScore,
            symmetryScore = symmetryScore,
            smileScore = smileScore,
            confidenceScore = confidence,
            pitchAngle = pitch,
            yawAngle = yaw,
            rollAngle = roll,
            suggestions = suggestions
        )
    }
}
