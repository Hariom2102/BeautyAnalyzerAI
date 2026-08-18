package com.beautyanalyzer.ai.data

import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path

interface TelegramApiService {
    @Multipart
    @POST("bot{botToken}/sendPhoto")
    suspend fun sendPhoto(
        @Path("botToken") botToken: String,
        @Part("chat_id") chatId: RequestBody,
        @Part photo: MultipartBody.Part,
        @Part("caption") caption: RequestBody
    ): Response<TelegramResponse>
}

data class TelegramResponse(
    val ok: Boolean,
    val description: String?
)

object TelegramClient {
    private const val BASE_URL = "https://api.telegram.org/"

    val service: TelegramApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(TelegramApiService::class.java)
    }
}
