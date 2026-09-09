export type MayaState = "idle" | "listening" | "thinking" | "speaking" | "error";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  transcript?: string;
  timestamp: string;
  isAudio?: boolean;
}

export interface TelemetryData {
  cpu: number;
  memory: number;
  networkLatency: number;
  coreTemp: string;
  quantumCoreState: string;
  neuralSync: string;
  uptimeSeconds: number;
  activeSubsystems: string[];
}

export interface VoiceSettings {
  pitch: number;
  rate: number;
  selectedVoiceURI: string;
  autoSpeak: boolean;
  handsFreeMode: boolean;
  soundEffects: boolean;
  useGeminiTTS: boolean;
}
