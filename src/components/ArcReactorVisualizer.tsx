import React, { useEffect, useRef } from "react";
import { MayaState } from "../types";
import { Mic, Volume2, Sparkles, AlertTriangle } from "lucide-react";

interface Props {
  state: MayaState;
  onActivate: () => void;
  audioLevel?: number; // 0 to 100
}

export const ArcReactorVisualizer: React.FC<Props> = ({
  state,
  onActivate,
  audioLevel = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic audio waveform simulation or mic feed
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 105;

      const bars = 48;
      const step = (Math.PI * 2) / bars;

      // Color scheme based on state
      let strokeColor = "rgba(0, 240, 255, 0.7)";
      let glowColor = "#00f0ff";
      let baseHeight = 6;

      if (state === "listening") {
        strokeColor = "rgba(245, 158, 11, 0.9)";
        glowColor = "#f59e0b";
        baseHeight = 12 + (audioLevel / 100) * 28;
      } else if (state === "speaking") {
        strokeColor = "rgba(0, 240, 255, 0.95)";
        glowColor = "#00f0ff";
        baseHeight = 14 + Math.sin(phase * 3) * 10;
      } else if (state === "thinking") {
        strokeColor = "rgba(168, 85, 247, 0.9)";
        glowColor = "#a855f7";
        baseHeight = 8 + Math.cos(phase * 4) * 6;
      }

      ctx.save();
      ctx.shadowBlur = state === "idle" ? 8 : 16;
      ctx.shadowColor = glowColor;

      for (let i = 0; i < bars; i++) {
        const angle = i * step + phase * (state === "thinking" ? 0.08 : 0.02);
        const dynamicFactor =
          state === "speaking" || state === "listening"
            ? Math.abs(Math.sin(i * 0.4 + phase * 4)) * baseHeight
            : baseHeight;

        const x1 = centerX + Math.cos(angle) * (radius - dynamicFactor / 2);
        const y1 = centerY + Math.sin(angle) * (radius - dynamicFactor / 2);
        const x2 = centerX + Math.cos(angle) * (radius + dynamicFactor);
        const y2 = centerY + Math.sin(angle) * (radius + dynamicFactor);

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      ctx.restore();
      phase += 0.04;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, audioLevel]);

  // Color mappings
  const getGlowBorder = () => {
    switch (state) {
      case "listening":
        return "border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.5)]";
      case "thinking":
        return "border-purple-400 shadow-[0_0_35px_rgba(168,85,247,0.5)]";
      case "speaking":
        return "border-cyan-300 shadow-[0_0_40px_rgba(0,240,255,0.6)]";
      case "error":
        return "border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.5)]";
      default:
        return "border-cyan-500/50 shadow-[0_0_25px_rgba(0,240,255,0.25)]";
    }
  };

  const getStateLabel = () => {
    switch (state) {
      case "listening":
        return "सुन रही हूँ... (Listening)";
      case "thinking":
        return "विश्लेषण जारी है... (Neural Processing)";
      case "speaking":
        return "माया बोल रही है... (Speaking)";
      case "error":
        return "चेतावनी (Alert)";
      default:
        return "हाज़िर हूँ (Ready & Online)";
    }
  };

  return (
    <div id="arc-reactor-container" className="relative flex flex-col items-center justify-center p-4">
      {/* HUD Radial background decorations */}
      <div className="absolute w-[360px] h-[360px] rounded-full border border-cyan-500/10 pointer-events-none animate-pulse" />
      <div className="absolute w-[320px] h-[320px] rounded-full border border-cyan-500/15 pointer-events-none animate-spin-slow" />
      <div className="absolute w-[290px] h-[290px] rounded-full border border-dashed border-cyan-400/25 pointer-events-none animate-spin-reverse" />

      {/* Ticks and degree markers */}
      <svg className="absolute w-[340px] h-[340px] pointer-events-none" viewBox="0 0 340 340">
        <circle cx="170" cy="170" r="162" fill="none" stroke="rgba(0, 240, 255, 0.15)" strokeWidth="1" strokeDasharray="3 7" />
        <circle cx="170" cy="170" r="138" fill="none" stroke="rgba(0, 240, 255, 0.1)" strokeWidth="1" />
      </svg>

      {/* Central Interactive ARC Reactor Core */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Canvas for dynamic audio waveform frequency bars */}
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="absolute inset-0 m-auto pointer-events-none z-10"
        />

        {/* Core Click Button */}
        <button
          id="maya-core-trigger-btn"
          onClick={onActivate}
          title="Click to speak with Maya"
          className={`relative z-20 w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-300 backdrop-blur-md bg-slate-950/80 border-2 cursor-pointer group ${getGlowBorder()}`}
        >
          {/* Internal rotating reactor details */}
          <div className="absolute inset-2 rounded-full border border-cyan-500/30 animate-spin-slow pointer-events-none" />
          <div className="absolute inset-4 rounded-full border border-dashed border-cyan-400/20 animate-spin-reverse pointer-events-none" />

          {/* Core Symbol / Icon */}
          <div className="relative z-30 flex flex-col items-center text-center">
            {state === "listening" ? (
              <Mic className="w-8 h-8 text-amber-400 animate-pulse" />
            ) : state === "thinking" ? (
              <Sparkles className="w-8 h-8 text-purple-400 animate-spin" />
            ) : state === "speaking" ? (
              <Volume2 className="w-8 h-8 text-cyan-300 animate-bounce" />
            ) : state === "error" ? (
              <AlertTriangle className="w-8 h-8 text-red-400" />
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold tracking-widest text-cyan-300 hud-font group-hover:scale-110 transition-transform">
                  माया
                </span>
                <span className="text-[10px] uppercase tracking-widest text-cyan-400/80 font-mono mt-0.5">
                  MAYA CORE
                </span>
              </div>
            )}

            <span className="text-[9px] font-mono tracking-widest text-cyan-200/70 mt-1 uppercase">
              {state === "idle" ? "TAP TO TALK" : state.toUpperCase()}
            </span>
          </div>
        </button>
      </div>

      {/* State Status HUD Badge */}
      <div className="mt-3 flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-xs font-mono backdrop-blur-md">
        <span
          className={`w-2 h-2 rounded-full ${
            state === "listening"
              ? "bg-amber-400 animate-ping"
              : state === "speaking"
              ? "bg-cyan-400 animate-pulse"
              : state === "thinking"
              ? "bg-purple-400 animate-ping"
              : "bg-emerald-400"
          }`}
        />
        <span className="text-cyan-300 tracking-wide font-semibold">
          {getStateLabel()}
        </span>
      </div>
    </div>
  );
};
