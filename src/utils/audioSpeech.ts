/**
 * Audio and Speech manager for Maya AI Assistant
 * Provides Hindi female voice synthesis, Speech-to-Text, and Audio Recording.
 */

export interface VoiceOption {
  name: string;
  lang: string;
  uri: string;
  isHindi: boolean;
  isFemale: boolean;
}

export class SpeechManager {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private recognition: any = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.synth = window.speechSynthesis || null;
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = "hi-IN";
      }
    }
  }

  /**
   * Returns available voices, prioritizing Hindi and female voices
   */
  getAvailableVoices(): Promise<VoiceOption[]> {
    return new Promise((resolve) => {
      if (!this.synth) {
        return resolve([]);
      }

      const checkVoices = () => {
        const voices = this.synth!.getVoices();
        if (voices.length === 0) {
          return false;
        }

        const formatted: VoiceOption[] = voices.map((v) => {
          const lowerName = v.name.toLowerCase();
          const isHindi = v.lang.startsWith("hi") || lowerName.includes("hindi") || lowerName.includes("हिन्दी");
          const isFemale =
            lowerName.includes("female") ||
            lowerName.includes("swara") ||
            lowerName.includes("kalpana") ||
            lowerName.includes("zira") ||
            lowerName.includes("google हिन्दी") ||
            lowerName.includes("lekha");
          return {
            name: v.name,
            lang: v.lang,
            uri: v.voiceURI,
            isHindi,
            isFemale,
          };
        });

        // Sort: Hindi female first, then other Hindi, then Indian voices, then others
        formatted.sort((a, b) => {
          if (a.isHindi && !b.isHindi) return -1;
          if (!a.isHindi && b.isHindi) return 1;
          if (a.isFemale && !b.isFemale) return -1;
          if (!a.isFemale && b.isFemale) return 1;
          return 0;
        });

        resolve(formatted);
        return true;
      };

      if (!checkVoices()) {
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => {
            checkVoices();
          };
        }
        // Fallback timeout in case event doesn't fire
        setTimeout(() => checkVoices(), 400);
      }
    });
  }

  /**
   * Speak response in Maya's female Hindi voice
   */
  speak(
    text: string,
    options: {
      pitch?: number;
      rate?: number;
      voiceURI?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
      onBoundary?: (charIndex: number) => void;
    } = {}
  ): void {
    if (!this.synth) return;

    this.stopSpeaking();

    // Clean text of markdown characters or system symbols for smoother speech
    const cleanText = text
      .replace(/[*#_`~>[\]]/g, "")
      .replace(/https?:\/\/\S+/g, "link")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "hi-IN";
    utterance.pitch = options.pitch ?? 1.15; // Slightly elevated pitch for friendly female tone
    utterance.rate = options.rate ?? 1.0;

    const voices = this.synth.getVoices();
    let selectedVoice: SpeechSynthesisVoice | undefined;

    if (options.voiceURI) {
      selectedVoice = voices.find((v) => v.voiceURI === options.voiceURI);
    }

    if (!selectedVoice) {
      // Best match: Hindi female voice
      selectedVoice =
        voices.find(
          (v) =>
            v.lang.startsWith("hi") &&
            (v.name.toLowerCase().includes("female") ||
              v.name.toLowerCase().includes("swara") ||
              v.name.toLowerCase().includes("kalpana") ||
              v.name.toLowerCase().includes("google हिन्दी"))
        ) ||
        voices.find((v) => v.lang.startsWith("hi")) ||
        voices.find((v) => v.lang.includes("IN") && v.name.toLowerCase().includes("female")) ||
        voices.find((v) => v.name.toLowerCase().includes("female")) ||
        voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang || "hi-IN";
    }

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      options.onError?.(e);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }

  /**
   * Start Speech Recognition (STT)
   */
  startListening(callbacks: {
    onResult: (transcript: string, isFinal: boolean) => void;
    onError: (err: any) => void;
    onEnd: () => void;
  }): boolean {
    if (!this.recognition) {
      return false;
    }

    try {
      this.recognition.abort();
    } catch {
      // ignore
    }

    this.recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      callbacks.onResult(final || interim, Boolean(final));
    };

    this.recognition.onerror = (event: any) => {
      callbacks.onError(event);
    };

    this.recognition.onend = () => {
      callbacks.onEnd();
    };

    try {
      this.recognition.start();
      return true;
    } catch (e) {
      callbacks.onError(e);
      return false;
    }
  }

  stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
  }

  /**
   * Setup Web Audio microphone analyser for real-time waveform visualizer
   */
  async startMicrophoneAnalyser(onFrame?: (dataArray: Uint8Array) => void): Promise<AnalyserNode | null> {
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === "suspended") {
        await this.audioCtx.resume();
      }

      if (!this.micStream) {
        this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      const source = this.audioCtx.createMediaStreamSource(this.micStream);
      source.connect(this.analyser);

      return this.analyser;
    } catch (err) {
      console.warn("Microphone analyser error:", err);
      return null;
    }
  }

  stopMicrophoneAnalyser(): void {
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    this.analyser = null;
  }

  /**
   * Direct audio recording for Gemini Audio-to-Audio processing
   */
  async startAudioRecording(): Promise<boolean> {
    try {
      this.audioChunks = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(100);
      return true;
    } catch (e) {
      console.warn("Recording start failed:", e);
      return false;
    }
  }

  stopAudioRecording(): Promise<{ base64: string; mimeType: string; blob: Blob } | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") {
        return resolve(null);
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = (reader.result as string).split(",")[1];
          resolve({
            base64: base64Data,
            mimeType: "audio/webm",
            blob,
          });
        };
        reader.readAsDataURL(blob);
      };

      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    });
  }
}

export const speechManager = new SpeechManager();
