import { useState, useEffect, useRef, useCallback } from "react";
import { ArcReactorVisualizer } from "./components/ArcReactorVisualizer";
import { TelemetryHUD } from "./components/TelemetryHUD";
import { DialogueTerminal } from "./components/DialogueTerminal";
import { CommandBar } from "./components/CommandBar";
import { KnowledgeShortcuts } from "./components/KnowledgeShortcuts";
import { MayaVoiceModal } from "./components/MayaVoiceModal";
import { Message, MayaState, TelemetryData, VoiceSettings } from "./types";
import { speechManager, VoiceOption } from "./utils/audioSpeech";
import { soundEffects } from "./utils/soundEffects";
import { Sparkles, Shield, Cpu, Volume2, Info } from "lucide-react";

export default function App() {
  const [mayaState, setMayaState] = useState<MayaState>("idle");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      role: "assistant",
      content:
        "नमस्ते बॉस! मैं माया (MAYA) हूँ — आपकी पर्सनल JARVIS स्टाइल डेस्कटॉप AI असिस्टेंट। मैं आपकी आवाज़ सुनने, सवालों के जवाब देने और किसी भी उच्च-ज्ञान विषय पर सहायता के लिए पूरी तरह तैयार हूँ। बोलिए, मैं क्या मदद करूँ?",
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
    },
  ]);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    pitch: 1.15, // Friendly female pitch
    rate: 1.0,
    selectedVoiceURI: "",
    autoSpeak: true,
    handsFreeMode: false,
    soundEffects: true,
    useGeminiTTS: false,
  });

  const isHandsFreeRef = useRef<boolean>(voiceSettings.handsFreeMode);
  isHandsFreeRef.current = voiceSettings.handsFreeMode;

  const audioAnimRef = useRef<number | null>(null);
  const isListeningRef = useRef<boolean>(false);

  // Load voices on mount
  useEffect(() => {
    speechManager.getAvailableVoices().then((voices) => {
      setAvailableVoices(voices);
      // Auto select best Hindi female voice
      const hindiFemale = voices.find((v) => v.isHindi && v.isFemale) || voices.find((v) => v.isHindi);
      if (hindiFemale && !voiceSettings.selectedVoiceURI) {
        setVoiceSettings((prev) => ({ ...prev, selectedVoiceURI: hindiFemale.uri }));
      }
    });

    // Fetch initial telemetry and poll every 4s
    const fetchTelemetry = async () => {
      try {
        const res = await fetch("/api/maya/system-telemetry");
        if (res.ok) {
          const data = await res.json();
          setTelemetry(data);
        }
      } catch {
        // Fallback mock
        setTelemetry({
          cpu: 22,
          memory: 45,
          networkLatency: 12,
          coreTemp: "39.4",
          quantumCoreState: "OPTIMAL",
          neuralSync: "99.8%",
          uptimeSeconds: 120,
          activeSubsystems: ["Audio Matrix", "Hindi Neural Synthesis", "Desktop Sensors"],
        });
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 4000);

    return () => {
      clearInterval(interval);
      speechManager.stopSpeaking();
      speechManager.stopListening();
    };
  }, []);

  // Speak Maya's response in Hindi female voice
  const speakMayaResponse = useCallback((text: string) => {
    if (!voiceSettings.autoSpeak) return;

    setMayaState("speaking");

    speechManager.speak(text, {
      pitch: voiceSettings.pitch,
      rate: voiceSettings.rate,
      voiceURI: voiceSettings.selectedVoiceURI,
      onStart: () => {
        setMayaState("speaking");
      },
      onEnd: () => {
        setMayaState("idle");
        // If hands-free mode is on, auto restart listening
        if (isHandsFreeRef.current) {
          setTimeout(() => {
            startListeningSequence();
          }, 800);
        }
      },
      onError: () => {
        setMayaState("idle");
      },
    });
  }, [voiceSettings]);

  // Send text to backend
  const handleSendText = async (text: string, isFromAudio = false) => {
    const userMsgId = "msg-" + Date.now();
    const userMessage: Message = {
      id: userMsgId,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      isAudio: isFromAudio,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMayaState("thinking");
    if (voiceSettings.soundEffects) {
      soundEffects.playChime();
    }

    try {
      const res = await fetch("/api/maya/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const reply = data.reply || data.fallbackReply || "नमस्ते बॉस! मैं तैयार हूँ।";

      const mayaMsg: Message = {
        id: "maya-" + Date.now(),
        role: "assistant",
        content: reply,
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      };

      setMessages((prev) => [...prev, mayaMsg]);

      if (voiceSettings.soundEffects) {
        soundEffects.playProcessDone();
      }

      speakMayaResponse(reply);
    } catch (err) {
      console.error("Chat error:", err);
      setMayaState("error");
      if (voiceSettings.soundEffects) {
        soundEffects.playError();
      }

      const fallbackText = "माफ़ कीजियेगा बॉस! सर्वर से कनेक्ट करने में व्यवधान आया। कृपया पुनः प्रयास करें।";
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content: fallbackText,
          timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        },
      ]);
      speakMayaResponse(fallbackText);
    }
  };

  // Start speech recognition and audio recording
  const startListeningSequence = async () => {
    if (isListeningRef.current || mayaState === "thinking") return;

    speechManager.stopSpeaking();
    isListeningRef.current = true;
    setMayaState("listening");
    setLiveTranscript("");

    if (voiceSettings.soundEffects) {
      soundEffects.playListeningStart();
    }

    // Connect microphone analyser for visualizer
    await speechManager.startMicrophoneAnalyser();
    await speechManager.startAudioRecording();

    // Pulse audio level on screen
    let simulatedVol = 0;
    const updateLevel = () => {
      simulatedVol = 20 + Math.random() * 60;
      setAudioLevel(simulatedVol);
      if (isListeningRef.current) {
        audioAnimRef.current = requestAnimationFrame(updateLevel);
      }
    };
    audioAnimRef.current = requestAnimationFrame(updateLevel);

    let recognizedText = "";

    const started = speechManager.startListening({
      onResult: (transcript, isFinal) => {
        setLiveTranscript(transcript);
        recognizedText = transcript;
        if (isFinal && transcript.trim()) {
          stopListeningSequence(transcript.trim());
        }
      },
      onError: (err) => {
        console.warn("Speech recognition notice:", err);
        // If error or no speech, finish gracefully
        setTimeout(() => {
          if (isListeningRef.current && !recognizedText) {
            stopListeningSequence();
          }
        }, 3000);
      },
      onEnd: () => {
        if (isListeningRef.current) {
          stopListeningSequence(recognizedText);
        }
      },
    });

    if (!started) {
      // Fallback if browser SpeechRecognition not supported: record audio via MediaRecorder and send to Gemini audio query
      console.log("Using direct audio recorder fallback");
    }
  };

  // Stop listening sequence
  const stopListeningSequence = async (finalTranscript?: string) => {
    if (!isListeningRef.current) return;
    isListeningRef.current = false;
    speechManager.stopListening();
    speechManager.stopMicrophoneAnalyser();
    if (audioAnimRef.current) {
      cancelAnimationFrame(audioAnimRef.current);
    }
    setAudioLevel(0);

    const recordedAudio = await speechManager.stopAudioRecording();
    const queryText = finalTranscript || liveTranscript;

    setLiveTranscript("");

    if (queryText && queryText.trim()) {
      handleSendText(queryText.trim(), true);
    } else if (recordedAudio && recordedAudio.base64) {
      // Fallback: send base64 audio directly to Gemini
      setMayaState("thinking");
      if (voiceSettings.soundEffects) {
        soundEffects.playChime();
      }

      try {
        const res = await fetch("/api/maya/audio-query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioBase64: recordedAudio.base64,
            mimeType: recordedAudio.mimeType,
            history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        const data = await res.json();
        const userSpoken = data.userTranscript || "आवाज़ इनपुट";
        const reply = data.reply || "जी बॉस, मैंने आपकी आवाज़ सुन ली है।";

        setMessages((prev) => [
          ...prev,
          {
            id: "usr-" + Date.now(),
            role: "user",
            content: userSpoken,
            timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
            isAudio: true,
          },
          {
            id: "maya-" + Date.now(),
            role: "assistant",
            content: reply,
            timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
          },
        ]);

        if (voiceSettings.soundEffects) {
          soundEffects.playProcessDone();
        }

        speakMayaResponse(reply);
      } catch (err) {
        console.error("Audio query error:", err);
        setMayaState("idle");
      }
    } else {
      setMayaState("idle");
    }
  };

  // Toggle mic on/off
  const handleToggleMic = () => {
    if (mayaState === "listening") {
      stopListeningSequence();
    } else {
      startListeningSequence();
    }
  };

  // Stop speaking
  const handleStopSpeaking = () => {
    speechManager.stopSpeaking();
    setMayaState("idle");
  };

  // Clear conversation history
  const handleClearHistory = () => {
    speechManager.stopSpeaking();
    setMessages([
      {
        id: "cleared-" + Date.now(),
        role: "assistant",
        content: "बातचीत का इतिहास साफ़ कर दिया गया है। बताइए बॉस, अब क्या चर्चा करें?",
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      },
    ]);
  };

  // Test Maya's voice
  const handleTestVoice = () => {
    const testPhrase = "नमस्ते बॉस! मैं माया हूँ। मेरी फीमेल हिन्दी वॉयस पूरी तरह तैयार और सक्रिय है।";
    speakMayaResponse(testPhrase);
  };

  // Selected voice display name
  const currentVoiceName =
    availableVoices.find((v) => v.uri === voiceSettings.selectedVoiceURI)?.name ||
    "Hindi Neural (Female Maya)";

  return (
    <div
      id="maya-desktop-container"
      className="min-h-screen w-full bg-[#050811] text-slate-100 hud-grid hud-scanline flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200"
    >
      {/* Top Futuristic JARVIS Header */}
      <header
        id="desktop-header-hud"
        className="w-full bg-slate-950/80 border-b border-cyan-500/30 px-4 py-3 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-400 flex items-center justify-center glow-cyan-sm">
            <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-wider text-cyan-200 hud-font">
                MAYA <span className="text-cyan-400 font-normal">//</span> JARVIS DESKTOP AI
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                MARK-V
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-sans flex items-center gap-2">
              <span className="text-amber-400 font-medium">फीमेल हिन्दी वॉयस</span>
              <span>•</span>
              <span className="text-emerald-400 font-mono">AUDIO-TO-AUDIO FREE API</span>
            </div>
          </div>
        </div>

        {/* Header HUD Status Modules */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/20">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300">SECURITY:</span>
            <span className="text-emerald-400 font-bold">OPTIMAL</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/20">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300">MODEL:</span>
            <span className="text-cyan-300 font-bold">GEMINI 3.8 FLASH</span>
          </div>

          <button
            id="header-voice-btn"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 transition-colors cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">वॉयस सेटिंग्स</span>
          </button>
        </div>
      </header>

      {/* Main Desktop Dashboard Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 flex flex-col gap-4">
        {/* Telemetry Sensor Dashboard */}
        <TelemetryHUD
          telemetry={telemetry}
          voiceName={currentVoiceName}
          isHandsFree={voiceSettings.handsFreeMode}
        />

        {/* Central HUD Grid: Left Side Arc Reactor + Quick Protocols, Right Side Dialogue Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-stretch">
          {/* Left Column: Holographic ARC Reactor & Assistant Status */}
          <div className="lg:col-span-5 flex flex-col items-center justify-between bg-slate-950/60 border border-cyan-500/20 rounded-2xl p-4 backdrop-blur-md space-y-4">
            {/* Holographic Arc Reactor */}
            <div className="w-full flex flex-col items-center justify-center my-auto py-2">
              <ArcReactorVisualizer
                state={mayaState}
                onActivate={handleToggleMic}
                audioLevel={audioLevel}
              />

              {/* Instructions Pill */}
              <div className="mt-3 text-center">
                <p className="text-xs text-cyan-300/90 font-sans font-medium flex items-center justify-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  कोर पर टैप करें या नीचे माइक बटन दबाकर बोलें
                </p>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  माया स्वाभाविक फीमेल हिन्दी में जवाब देगी और आपकी आवाज़ समझेगी
                </p>
              </div>
            </div>

            {/* Quick Knowledge Protocol Grid */}
            <KnowledgeShortcuts onTriggerPrompt={(p) => handleSendText(p)} />
          </div>

          {/* Right Column: Dialogue Interface & Spoken Terminal */}
          <div className="lg:col-span-7 flex flex-col min-h-[460px] space-y-3">
            <DialogueTerminal
              messages={messages}
              mayaState={mayaState}
              liveTranscript={liveTranscript}
              onReplayAudio={(text) => speakMayaResponse(text)}
              onSelectPrompt={(prompt) => handleSendText(prompt)}
            />

            {/* Command Input & Audio Controls */}
            <CommandBar
              mayaState={mayaState}
              onSendText={(text) => handleSendText(text)}
              onToggleMic={handleToggleMic}
              onStopSpeaking={handleStopSpeaking}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onClearHistory={handleClearHistory}
              isHandsFree={voiceSettings.handsFreeMode}
              onToggleHandsFree={() => {
                setVoiceSettings((prev) => {
                  const next = !prev.handsFreeMode;
                  if (next) {
                    startListeningSequence();
                  } else {
                    speechManager.stopListening();
                  }
                  return { ...prev, handsFreeMode: next };
                });
              }}
            />
          </div>
        </div>
      </main>

      {/* Voice Configuration Modal */}
      <MayaVoiceModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={voiceSettings}
        onUpdateSettings={(updated) => setVoiceSettings((prev) => ({ ...prev, ...updated }))}
        availableVoices={availableVoices}
        onTestVoice={handleTestVoice}
      />
    </div>
  );
}
