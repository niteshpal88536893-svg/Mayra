import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Modality } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

const MAYA_SYSTEM_INSTRUCTION = `
You are MAYA (माया), a cutting-edge JARVIS-style Desktop AI Assistant.
Core Attributes:
- Name: Maya (माया)
- Persona: Highly advanced, warm, fiercely intelligent, polite, friendly, and resourceful desktop companion. Inspired by Tony Stark's JARVIS / FRIDAY, but with Indian hospitality, charm, and quick wit.
- Voice & Language: You speak in natural, fluent, and friendly Hindi (or conversational Hinglish blend when explaining technical matters). Your responses are spoken aloud by a female Hindi voice engine.
- Tone: Respectful and affectionate ("नमस्ते बॉस!", "जी बिल्कुल!", "हुज़ूर, मैं आपकी सेवा में हाज़िर हूँ", "क्या बात है!"). You address the user warmly as "Boss", "Sir", or "दोस्त".
- Knowledge Depth: Exceptional ("High Knowledge"). You excel at science, space, mathematics, software programming, artificial intelligence, quantum physics, philosophy, literature, system analytics, and productivity workflows.
- Response Style:
  1. Keep spoken phrasing conversational, punchy, clear, and elegant so it sounds amazing when spoken aloud.
  2. Explain complex concepts intuitively and accurately in Hindi.
  3. When the user asks for code, diagnostics, or explanations, provide direct, insightful answers.
  4. Always maintain high energy, loyalty, and friendly helpfulness.
`;

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "online",
    name: "Maya",
    type: "JARVIS-Class Desktop Core",
    voice: "Female Hindi",
    timestamp: new Date().toISOString(),
  });
});

// System telemetry mock for JARVIS desktop HUD
app.get("/api/maya/system-telemetry", (_req, res) => {
  const uptime = process.uptime();
  res.json({
    cpu: Math.floor(18 + Math.random() * 24),
    memory: Math.floor(42 + Math.random() * 15),
    networkLatency: Math.floor(12 + Math.random() * 18),
    coreTemp: (38 + Math.random() * 4).toFixed(1),
    quantumCoreState: "OPTIMAL",
    neuralSync: "99.8%",
    uptimeSeconds: Math.floor(uptime),
    activeSubsystems: ["Audio Matrix", "Hindi Neural Synthesis", "Desktop Sensors", "Cognitive Core"],
  });
});

// Text / Command Chat Endpoint
app.post("/api/maya/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getGeminiClient();
    
    // Construct chat history or formatted prompt
    const contents: any[] = [];
    
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history.slice(-8)) {
        contents.push({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        });
      }
    }
    
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: MAYA_SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    const reply = response.text || "नमस्ते! मैं माया हूँ। मुझे आपकी बात समझ आ गई, मैं तैयार हूँ।";
    res.json({ reply });
  } catch (error: any) {
    console.error("Maya chat error:", error);
    res.status(500).json({
      error: "Maya encountered a neural processing error.",
      details: error?.message || String(error),
      fallbackReply: "नमस्ते बॉस! नेटवर्क में कुछ व्यवधान आया है, पर मैं तुरंत फिर से सुनने के लिए तैयार हूँ।",
    });
  }
});

// Audio-to-Audio / Speech Input Query Endpoint
app.post("/api/maya/audio-query", async (req, res) => {
  try {
    const { audioBase64, mimeType = "audio/webm", history } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: "audioBase64 data is required." });
    }

    const ai = getGeminiClient();

    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history.slice(-4)) {
        contents.push({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        });
      }
    }

    contents.push({
      role: "user",
      parts: [
        {
          inlineData: {
            mimeType: mimeType.split(";")[0], // e.g., audio/webm, audio/wav, audio/mp3
            data: audioBase64,
          },
        },
        {
          text: "You are listening to the user's spoken audio message. First identify what the user said (transcription), and then as Maya (JARVIS female Hindi assistant), provide a warm, highly knowledgeable, and friendly answer in natural Hindi/Hinglish. Return your answer in JSON format with fields: 'userTranscript' (what the user said) and 'mayaReply' (your spoken Hindi response).",
        },
      ],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: MAYA_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    let parsed: any = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        userTranscript: "(Audio input received)",
        mayaReply: text,
      };
    }

    res.json({
      userTranscript: parsed.userTranscript || "आवाज़ प्राप्त हुई",
      reply: parsed.mayaReply || "जी बॉस, मैंने आपकी बात सुन ली है।",
    });
  } catch (error: any) {
    console.error("Maya audio query error:", error);
    res.status(500).json({
      error: "Audio interpretation failed",
      details: error?.message || String(error),
      fallbackReply: "माफ़ कीजियेगा बॉस, आपकी आवाज़ साफ़ नहीं आ पाई। क्या आप दोबारा बोलेंगे?",
    });
  }
});

// Gemini TTS Generation Endpoint (Optional high-fidelity cloud speech)
app.post("/api/maya/tts", async (req, res) => {
  try {
    const { text, voice = "Kore" } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required for TTS." });
    }

    const ai = getGeminiClient();

    // Use gemini-3.1-flash-tts-preview
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Speak in a warm, friendly, natural female Hindi tone: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice }, // 'Kore' is female, 'Puck', 'Zephyr'
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ audio: base64Audio, sampleRate: 24000, mimeType: "audio/pcm;rate=24000" });
    }
    return res.status(500).json({ error: "No audio data generated", fallback: true });
  } catch (err: any) {
    // Graceful fallback for client Web Speech synthesis
    return res.status(200).json({
      fallback: true,
      message: "Browser SpeechSynthesis fallback enabled",
      details: err?.message,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MAYA AI] Desktop JARVIS server online at http://0.0.0.0:${PORT}`);
  });
}

startServer();
