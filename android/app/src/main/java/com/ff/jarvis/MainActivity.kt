package com.ff.jarvis

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import okhttp3.Call
import okhttp3.Callback
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.util.Locale
import java.util.concurrent.TimeUnit

private const val PREFS = "jarvis_prefs"
private const val KEY_URL = "server_url"
private const val KEY_TOKEN = "api_token"
private const val DEFAULT_URL = "https://ff-mcp-memory.onrender.com/voice/command"
private const val RECORD_AUDIO_REQUEST = 1001

class MainActivity : AppCompatActivity() {

    private lateinit var serverUrlInput: EditText
    private lateinit var apiTokenInput: EditText
    private lateinit var talkButton: Button
    private lateinit var statusText: TextView

    private lateinit var speechRecognizer: SpeechRecognizer
    private lateinit var tts: TextToSpeech
    // The server (and the AI backend it calls) can be a cold-starting free
    // host, so give the round trip a lot more than OkHttp's 10s default.
    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(100, TimeUnit.SECONDS)
        .writeTimeout(20, TimeUnit.SECONDS)
        .build()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        serverUrlInput = findViewById(R.id.serverUrlInput)
        apiTokenInput = findViewById(R.id.apiTokenInput)
        talkButton = findViewById(R.id.talkButton)
        statusText = findViewById(R.id.statusText)

        val prefs = getSharedPreferences(PREFS, MODE_PRIVATE)
        serverUrlInput.setText(prefs.getString(KEY_URL, DEFAULT_URL))
        apiTokenInput.setText(prefs.getString(KEY_TOKEN, ""))

        tts = TextToSpeech(this) { status ->
            if (status == TextToSpeech.SUCCESS) {
                tts.language = Locale.getDefault()
            }
        }

        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)
        speechRecognizer.setRecognitionListener(object : RecognitionListener {
            override fun onResults(results: Bundle) {
                val matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                val text = matches?.firstOrNull()
                if (text.isNullOrBlank()) {
                    statusText.text = "Didn't catch that — try again."
                    return
                }
                statusText.text = "You said: $text"
                sendToServer(text)
            }

            override fun onError(error: Int) {
                statusText.text = "Speech error ($error) — try again."
            }

            override fun onReadyForSpeech(params: Bundle?) {
                statusText.text = "Listening..."
            }

            override fun onBeginningOfSpeech() {}
            override fun onRmsChanged(rmsdB: Float) {}
            override fun onBufferReceived(buffer: ByteArray?) {}
            override fun onEndOfSpeech() {}
            override fun onPartialResults(partialResults: Bundle?) {}
            override fun onEvent(eventType: Int, params: Bundle?) {}
        })

        talkButton.setOnClickListener {
            savePrefs(prefs)
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED
            ) {
                ActivityCompat.requestPermissions(
                    this, arrayOf(Manifest.permission.RECORD_AUDIO), RECORD_AUDIO_REQUEST
                )
                return@setOnClickListener
            }
            startListening()
        }
    }

    private fun savePrefs(prefs: android.content.SharedPreferences) {
        prefs.edit()
            .putString(KEY_URL, serverUrlInput.text.toString())
            .putString(KEY_TOKEN, apiTokenInput.text.toString())
            .apply()
    }

    override fun onRequestPermissionsResult(
        requestCode: Int, permissions: Array<out String>, grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == RECORD_AUDIO_REQUEST &&
            grantResults.firstOrNull() == PackageManager.PERMISSION_GRANTED
        ) {
            startListening()
        } else {
            statusText.text = "Microphone permission is required."
        }
    }

    private fun startListening() {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
        }
        speechRecognizer.startListening(intent)
    }

    private fun sendToServer(text: String) {
        val url = serverUrlInput.text.toString().trim()
        val token = apiTokenInput.text.toString().trim()
        val json = JSONObject().put("text", text).toString()
        val request = Request.Builder()
            .url(url)
            .header("X-Api-Token", token)
            .post(json.toRequestBody("application/json".toMediaType()))
            .build()

        runOnUiThread { statusText.text = "Thinking... (can take up to a minute if the server was idle)" }

        httpClient.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread { statusText.text = "Request failed: ${e.message}" }
            }

            override fun onResponse(call: Call, response: okhttp3.Response) {
                val bodyString = response.body?.string()
                if (!response.isSuccessful || bodyString == null) {
                    runOnUiThread { statusText.text = "Server error: ${response.code}" }
                    return
                }
                val reply = try {
                    JSONObject(bodyString).optString("reply", "(no reply)")
                } catch (e: Exception) {
                    "Couldn't parse server response."
                }
                runOnUiThread {
                    statusText.text = reply
                    tts.speak(reply, TextToSpeech.QUEUE_FLUSH, null, "jarvis-reply")
                }
            }
        })
    }

    override fun onDestroy() {
        speechRecognizer.destroy()
        tts.shutdown()
        super.onDestroy()
    }
}
