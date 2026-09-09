import React, { useRef, useEffect } from "react";
import { Message, MayaState } from "../types";
import { Volume2, Copy, Check, Terminal, User, Sparkles, Mic } from "lucide-react";

interface Props {
  messages: Message[];
  mayaState: MayaState;
  liveTranscript: string;
  onReplayAudio: (text: string) => void;
  onSelectPrompt: (prompt: string) => void;
}

export const DialogueTerminal: React.FC<Props> = ({
  messages,
  mayaState,
  liveTranscript,
  onReplayAudio,
  onSelectPrompt,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, liveTranscript, mayaState]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      id="dialogue-terminal"
      className="flex-1 flex flex-col bg-slate-950/70 border border-cyan-500/25 rounded-2xl overflow-hidden backdrop-blur-lg relative"
    >
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-300 font-semibold">
            MAYA NEURAL INTERFACE // DIALOGUE LOG
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-cyan-400/80">VOICE: HINDI_FEMALE</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm scroll-smooth custom-scrollbar"
      >
        {messages.length === 0 && !liveTranscript && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-slate-400">
            <div className="w-14 h-14 rounded-full bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center glow-cyan-sm">
              <Sparkles className="w-7 h-7 text-cyan-300" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-lg font-bold text-cyan-200 hud-font">
                नमस्ते बॉस! मैं माया हूँ।
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                आपकी फ्रेंडली और हाई-नॉलेज डेस्कटॉप AI असिस्टेंट। आप मुझसे विज्ञान, कोडिंग, ब्रह्मांड, गणित, इतिहास या दैनिक कार्यों के बारे में सीधे बोलकर पूछ सकते हैं।
              </p>
            </div>

            {/* Quick suggested prompt pills */}
            <div className="pt-2 flex flex-wrap gap-2 justify-center max-w-lg">
              {[
                "नमस्ते माया, आपका परिचय दो",
                "क्वांटम कंप्यूटिंग क्या है?",
                "पायथन में API कैसे कॉल करें?",
                "आज का मौसम और प्रेरणादायक विचार",
                "ब्लैक होल कैसे बनता है?",
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectPrompt(suggestion)}
                  className="text-xs px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-colors cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isMaya = msg.role === "assistant";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMaya ? "items-start" : "items-end"} space-y-1`}
            >
              {/* Message Header Badge */}
              <div className="flex items-center gap-2 px-1 text-[11px] font-mono text-cyan-400/80">
                {isMaya ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="font-bold text-cyan-300">माया (MAYA)</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-slate-300">YOU (बॉस)</span>
                    <User className="w-3 h-3 text-slate-400" />
                  </>
                )}
                <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                {msg.isAudio && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-400 font-mono">
                    <Mic className="w-2.5 h-2.5" /> AUDIO
                  </span>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative max-w-[85%] rounded-2xl px-4 py-3 border text-sm leading-relaxed transition-all shadow-md ${
                  isMaya
                    ? "bg-slate-900/90 border-cyan-500/30 text-slate-100 rounded-tl-sm shadow-[0_0_15px_rgba(0,240,255,0.07)]"
                    : "bg-cyan-950/70 border-cyan-500/40 text-cyan-50 rounded-tr-sm"
                }`}
              >
                <div className="whitespace-pre-wrap selection:bg-cyan-500/30 selection:text-white font-normal">
                  {msg.content}
                </div>

                {/* Floating Utility Actions for Maya Messages */}
                {isMaya && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-cyan-500/10 text-xs text-cyan-400/70">
                    <button
                      id={`replay-btn-${msg.id}`}
                      onClick={() => onReplayAudio(msg.content)}
                      title="आवाज़ दोबारा सुनें (Replay voice)"
                      className="flex items-center gap-1 hover:text-cyan-300 transition-colors cursor-pointer text-[11px] font-mono"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>REPLAY HINDI VOICE</span>
                    </button>
                    <button
                      id={`copy-btn-${msg.id}`}
                      onClick={() => handleCopy(msg.id, msg.content)}
                      title="टेक्स्ट कॉपी करें (Copy text)"
                      className="flex items-center gap-1 hover:text-cyan-300 transition-colors cursor-pointer text-[11px] font-mono ml-auto"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>COPY</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Spoken Transcription Ticker */}
        {liveTranscript && (
          <div className="flex flex-col items-end space-y-1 animate-pulse">
            <div className="flex items-center gap-1 px-1 text-[11px] font-mono text-amber-400">
              <Mic className="w-3 h-3 text-amber-400" />
              <span>LIVE SPEECH RECOGNITION (HINDI/ENG)...</span>
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-2.5 bg-amber-950/40 border border-amber-500/40 text-amber-200 text-sm italic">
              "{liveTranscript}"
            </div>
          </div>
        )}

        {/* Thinking Indicator */}
        {mayaState === "thinking" && (
          <div className="flex items-start space-y-1">
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-900/80 border border-purple-500/40 text-purple-200 text-xs font-mono">
              <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
              <span>माया विचार और विश्लेषण कर रही है... (Processing Neural Response)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
