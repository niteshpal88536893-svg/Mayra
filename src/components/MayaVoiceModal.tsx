import React from "react";
import { VoiceSettings } from "../types";
import { VoiceOption } from "../utils/audioSpeech";
import { X, Volume2, Sliders, Bell, Sparkles, CheckCircle2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onUpdateSettings: (newSettings: Partial<VoiceSettings>) => void;
  availableVoices: VoiceOption[];
  onTestVoice: () => void;
}

export const MayaVoiceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  availableVoices,
  onTestVoice,
}) => {
  if (!isOpen) return null;

  const hindiVoices = availableVoices.filter((v) => v.isHindi);
  const otherVoices = availableVoices.filter((v) => !v.isHindi);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="maya-voice-settings-modal"
        className="w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.2)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/20 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold font-mono tracking-wider text-cyan-200 uppercase">
              MAYA VOICE & NEURAL CONFIGURATION
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar font-sans text-sm">
          {/* Voice Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-mono text-cyan-300 uppercase tracking-wider">
              चयनित वॉयस इंजन (Selected Hindi Voice)
            </label>
            <select
              id="voice-select-dropdown"
              value={settings.selectedVoiceURI}
              onChange={(e) => onUpdateSettings({ selectedVoiceURI: e.target.value })}
              className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-3 py-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-400"
            >
              <option value="">Maya Auto-Detect (Best Hindi Female Voice)</option>
              {hindiVoices.length > 0 && (
                <optgroup label="--- हिन्दी वॉयस (Hindi Voices) ---">
                  {hindiVoices.map((v) => (
                    <option key={v.uri} value={v.uri}>
                      {v.name} ({v.lang}) {v.isFemale ? "✨ Female" : ""}
                    </option>
                  ))}
                </optgroup>
              )}
              {otherVoices.length > 0 && (
                <optgroup label="--- अन्य वॉयस (Other Available Voices) ---">
                  {otherVoices.slice(0, 15).map((v) => (
                    <option key={v.uri} value={v.uri}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <p className="text-[11px] text-slate-400">
              *माया आपके सिस्टम में इंस्टॉल सबसे उपयुक्त फीमेल हिन्दी वॉयस को प्राथमिकता देती है।
            </p>
          </div>

          {/* Voice Pitch Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-cyan-300">
              <span>वॉयस पिच (PITCH / फीमेल टोन)</span>
              <span className="text-cyan-400 font-bold">{settings.pitch.toFixed(2)}x</span>
            </div>
            <input
              id="pitch-slider"
              type="range"
              min="0.8"
              max="1.5"
              step="0.05"
              value={settings.pitch}
              onChange={(e) => onUpdateSettings({ pitch: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>गंभीर (0.8x)</span>
              <span className="text-cyan-300">डिफ़ॉल्ट फीमेल (1.15x)</span>
              <span>हाई पिच (1.5x)</span>
            </div>
          </div>

          {/* Voice Rate Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-cyan-300">
              <span>बोलने की गति (SPEECH RATE)</span>
              <span className="text-cyan-400 font-bold">{settings.rate.toFixed(2)}x</span>
            </div>
            <input
              id="rate-slider"
              type="range"
              min="0.7"
              max="1.4"
              step="0.05"
              value={settings.rate}
              onChange={(e) => onUpdateSettings({ rate: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>धीमी (0.7x)</span>
              <span className="text-cyan-300">सामान्य (1.0x)</span>
              <span>तेज़ (1.4x)</span>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="pt-2 border-t border-cyan-500/20 space-y-3">
            {/* Auto speak */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-cyan-500/20 cursor-pointer hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    ऑटो वॉयस रिस्पॉन्स (Auto-Speak Responses)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    माया हर उत्तर को सीधे फीमेल हिन्दी आवाज़ में बोलेगी
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSpeak}
                onChange={(e) => onUpdateSettings({ autoSpeak: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </label>

            {/* Sound Effects */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-cyan-500/20 cursor-pointer hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    JARVIS HUD साउंड इफेक्ट्स (Procedural Sci-Fi Audio)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    बटन क्लिक, लिसनिंग और प्रोसेसिंग पर आधुनिक बीप्स
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={(e) => onUpdateSettings({ soundEffects: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-cyan-500/20 bg-slate-950/80">
          <button
            id="test-voice-btn"
            type="button"
            onClick={onTestVoice}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono font-bold transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>TEST MAYA VOICE</span>
          </button>
          <button
            id="save-voice-btn"
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-xs font-mono font-bold transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>SAVE CONFIG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
