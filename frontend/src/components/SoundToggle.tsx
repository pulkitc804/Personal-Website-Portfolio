"use client";

import { useEffect, useState } from "react";
import { isMuted, subscribe, toggleMuted, pop } from "@/lib/sound";

export default function SoundToggle() {
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    setMuted(isMuted());
    return subscribe(setMuted);
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        toggleMuted();
        if (isMuted() === false) pop(0.6);
      }}
      aria-pressed={!muted}
      aria-label={muted ? "Turn match sound on" : "Turn match sound off"}
      title={muted ? "Sound: off" : "Sound: on"}
      className="pressable inline-flex items-center gap-1.5 rounded-full border border-chalk/25 px-3 py-1.5 text-xs font-medium text-chalk/80 transition-colors hover:border-chalk/60"
    >
      <span aria-hidden className="text-sm leading-none">
        {muted ? "○" : "◉"}
      </span>
      <span className="font-mono tracking-wide">{muted ? "POP off" : "POP on"}</span>
    </button>
  );
}
