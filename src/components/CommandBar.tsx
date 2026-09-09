import React, { useState } from "react";
import { Mic, MicOff, Send, Settings2, Trash2, VolumeX, Sparkles } from "lucide-react";
import { MayaState } from "../types";

interface Props {
  mayaState: MayaState;
  onSendText: (text: string) => void;
  onToggleMic: () => void;
  onStopSpeaking: () => void;
  onOpenSettings: () => void;
  onClearHistory: () => void;
  isHandsFree: boolean;
  onToggleHandsFree: () => void;
}

export const CommandBar: React.FC<Props> = ({
  mayaState,
  onSendText,
  onToggleMic,
  onStopSpeaking,
  onOpenSettings,
  onClearHistory,
  isHandsFree,
  onToggleHandsFree,
}) => {
  const [inputVal, setInputVal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || mayaState === "thinking") return;
    onSendText(inputVal.trim());
    setInputVal("");
  };

  const isListening = mayaState === "listening";
  const isSpeaking = mayaState === "speaking";

  return (
    <div id="command-bar-wrapper" className="w-full bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-2.5 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Main Mic / Speak Button */}
        <button
          id="mic-command-btn"
          type="button"
          onClick={onToggleMic}
          title={isListening ? "Listening... Click to stop" : "Speak to Maya (Hindi / English)"}
          className={`relative p-3 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
            isListening
              ? "bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse"
              : "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/30 hover:border-cyan-300"
          }`}
        >
          {isListening ? (
            <Mic className="w-5 h-5 text-slate-950" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
          {isListening && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          )}
        </button>

        {/* Text Input Field */}
        <div className="relative flex-1">
          <input
            id="user-command-input"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={
              isListening
                ? "सुन रही हूँ... आप बोल सकते हैं..."
                : "माया से कुछ भी पूछें... (बोलें या लिखें)... e.g. क्वांटम कंप्यूटर क्या है?"
            }
            disabled={mayaState === "thinking"}
            className="w-full bg-slate-900/90 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400/70 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans transition-all disabled:opacity-50"
          />
          {inputVal.trim() && (
            <button
              id="submit-command-btn"
              type="submit"
              disabled={mayaState === "thinking"}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Stop Speaking / Mute Button */}
        {isSpeaking && (
          <button
            id="stop-speaking-btn"
            type="button"
            onClick={onStopSpeaking}
            title="माया की आवाज़ रोकें (Stop speech)"
            className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition-colors cursor-pointer"
          >
            <VolumeX className="w-4 h-4" />
          </button>
        )}

        {/* Hands-free mode toggle */}
        <button
          id="hands-free-toggle-btn"
          type="button"
          onClick={onToggleHandsFree}
          title={isHandsFree ? "Hands-Free Mode ON (Continuous listening)" : "Hands-Free Mode OFF"}
          className={`px-3 py-2.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
            isHandsFree
              ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
              : "bg-slate-900 border-slate-700 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">HANDS-FREE</span>
        </button>

        {/* Settings button */}
        <button
          id="open-settings-btn"
          type="button"
          onClick={onOpenSettings}
          title="माया वॉयस सेटिंग्स (Voice & Neural Settings)"
          className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-cyan-400 hover:text-cyan-200 hover:border-cyan-400 transition-colors cursor-pointer"
        >
          <Settings2 className="w-4 h-4" />
        </button>

        {/* Clear History */}
        <button
          id="clear-history-btn"
          type="button"
          onClick={onClearHistory}
          title="बातचीत साफ़ करें (Clear dialogue)"
          className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/40 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
