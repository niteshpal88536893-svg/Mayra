import React from "react";
import { Atom, Code, Sparkles, Compass, Shield, BookOpen, Clock } from "lucide-react";

interface Props {
  onTriggerPrompt: (prompt: string) => void;
}

export const KnowledgeShortcuts: React.FC<Props> = ({ onTriggerPrompt }) => {
  const protocols = [
    {
      icon: Atom,
      title: "क्वांटम और स्पेस",
      subtitle: "Quantum & Deep Space",
      query: "माया, मुझे क्वांटम उलझाव (Quantum Entanglement) और ब्लैक होल के बारे में विस्तार से समझाओ।",
      color: "border-cyan-500/30 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-500/10",
    },
    {
      icon: Code,
      title: "कोडिंग और सिस्टम",
      subtitle: "Code & Architecture",
      query: "माया, आधुनिक फुल-स्टैक डेवलपमेंट और माइक्रो-सर्विसेज के सर्वश्रेष्ठ नियम क्या हैं?",
      color: "border-emerald-500/30 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-500/10",
    },
    {
      icon: BookOpen,
      title: "दर्शन और ज्ञान",
      subtitle: "Wisdom & Strategy",
      query: "माया, चाणक्य नीति और आधुनिक लीडरशिप के मुख्य सूत्र हिंदी में बताओ।",
      color: "border-amber-500/30 text-amber-300 hover:border-amber-400 hover:bg-amber-500/10",
    },
    {
      icon: Compass,
      title: "दैनिक ब्रीफिंग",
      subtitle: "Daily Briefing Protocol",
      query: "माया, मुझे आज का पूरा दैनिक ब्रीफिंग दो — दिन की शुरुआत के लिए मोटिवेशन और विचार।",
      color: "border-purple-500/30 text-purple-300 hover:border-purple-400 hover:bg-purple-500/10",
    },
    {
      icon: Clock,
      title: "फोकस टाइमर",
      subtitle: "Pomodoro Protocol",
      query: "माया, 25 मिनट के पोमोडोरो फोकस सेशन के लिए मुझे गाइड करो।",
      color: "border-blue-500/30 text-blue-300 hover:border-blue-400 hover:bg-blue-500/10",
    },
  ];

  return (
    <div id="knowledge-shortcuts-section" className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-mono text-cyan-400/80 px-1">
        <span className="flex items-center gap-1.5 font-semibold tracking-wider uppercase">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          MAYA HIGH-KNOWLEDGE PROTOCOLS
        </span>
        <span className="text-[10px] text-slate-400">SELECT TO EXECUTE</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {protocols.map((p, idx) => {
          const Icon = p.icon;
          return (
            <button
              key={idx}
              id={`protocol-btn-${idx}`}
              onClick={() => onTriggerPrompt(p.query)}
              className={`flex flex-col items-start p-2.5 rounded-xl bg-slate-900/60 border backdrop-blur-md transition-all text-left group cursor-pointer ${p.color}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold font-sans tracking-wide">
                  {p.title}
                </span>
              </div>
              <span className="text-[10px] font-mono opacity-60 truncate w-full">
                {p.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
