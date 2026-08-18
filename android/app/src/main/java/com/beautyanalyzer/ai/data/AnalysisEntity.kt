package com.beautyanalyzer.ai.data

import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.RoomDatabase

@Entity(tableName = "analysis_history")
data class AnalysisEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val timestamp: Long = System.currentTimeMillis(),
    val imagePath: String,
    val beautyScore: Int,
    val symmetryScore: Int,
    val smileScore: Int,
    val confidenceScore: Int,
    val pitchAngle: Float,
    val yawAngle: Float,
    val rollAngle: Float,
    val suggestionsJson: String
)

@Dao
interface AnalysisDao {
    @Query("SELECT * FROM analysis_history ORDER BY timestamp DESC")
    suspend fun getAllHistory(): List<AnalysisEntity>

    @Insert
    suspend fun insertAnalysis(entity: AnalysisEntity): Long

    @Query("DELETE FROM analysis_history WHERE id = :id")
    suspend fun deleteById(id: Long)

    @Query("DELETE FROM analysis_history")
    suspend fun clearAll()
}

@Database(entities = [AnalysisEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun analysisDao(): AnalysisDao
}
