import React, { useState, useEffect } from "react";
import { TelemetryData } from "../types";
import { Cpu, HardDrive, Wifi, Activity, Clock, ShieldCheck, Zap } from "lucide-react";

interface Props {
  telemetry: TelemetryData | null;
  voiceName?: string;
  isHandsFree?: boolean;
}

export const TelemetryHUD: React.FC<Props> = ({
  telemetry,
  voiceName = "Hindi Neural (Female)",
  isHandsFree = false,
}) => {
  const [time, setTime] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setDateStr(
        now.toLocaleDateString("hi-IN", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const cpuVal = telemetry?.cpu ?? 24;
  const memVal = telemetry?.memory ?? 48;
  const latency = telemetry?.networkLatency ?? 14;
  const temp = telemetry?.coreTemp ?? "40.2";

  return (
    <div
      id="telemetry-hud-panel"
      className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full"
    >
      {/* Clock & System Date */}
      <div className="bg-slate-900/60 border border-cyan-500/20 rounded-xl p-3 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
        <div className="flex items-center justify-between text-xs text-cyan-400/70 font-mono mb-1">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> DESKTOP CHRONO
          </span>
          <span className="text-[10px] text-emerald-400">ONLINE</span>
        </div>
        <div className="text-xl font-bold font-mono tracking-wider text-cyan-200 glow-text-cyan">
          {time || "--:--:--"}
        </div>
        <div className="text-xs text-slate-400 font-sans mt-0.5 truncate">
          {dateStr}
        </div>
      </div>

      {/* CPU & Neural Compute */}
      <div className="bg-slate-900/60 border border-cyan-500/20 rounded-xl p-3 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
        <div className="flex items-center justify-between text-xs text-cyan-400/70 font-mono mb-1">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" /> COGNITIVE CORE
          </span>
          <span className="text-xs font-mono font-bold text-cyan-300">{cpuVal}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden my-2">
          <div
            className="bg-cyan-400 h-full transition-all duration-700"
            style={{ width: `${cpuVal}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>TEMP: {temp}°C</span>
          <span className="text-emerald-400">SYNC: 99.8%</span>
        </div>
      </div>

      {/* Memory & Quantum Matrix */}
      <div className="bg-slate-900/60 border border-cyan-500/20 rounded-xl p-3 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
        <div className="flex items-center justify-between text-xs text-cyan-400/70 font-mono mb-1">
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" /> MEMORY MATRIX
          </span>
          <span className="text-xs font-mono font-bold text-cyan-300">{memVal}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden my-2">
          <div
            className="bg-emerald-400 h-full transition-all duration-700"
            style={{ width: `${memVal}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>PING: {latency}ms</span>
          <span className="text-cyan-400">BUFFER: OK</span>
        </div>
      </div>

      {/* Voice & Maya Engine Status */}
      <div className="bg-slate-900/60 border border-cyan-500/20 rounded-xl p-3 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
        <div className="flex items-center justify-between text-xs text-cyan-400/70 font-mono mb-1">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> MAYA HINDI CORE
          </span>
          {isHandsFree ? (
            <span className="text-[10px] text-amber-400 font-mono px-1 rounded bg-amber-500/20">
              HANDS-FREE
            </span>
          ) : (
            <span className="text-[10px] text-cyan-400 font-mono">PUSH-TO-TALK</span>
          )}
        </div>
        <div className="text-xs font-semibold text-cyan-200 truncate mt-0.5" title={voiceName}>
          {voiceName}
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 mt-1">
          <ShieldCheck className="w-3 h-3" /> JARVIS PROTOCOL ACTIVE
        </div>
      </div>
    </div>
  );
};
