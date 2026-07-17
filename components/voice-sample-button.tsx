"use client";

import { useEffect, useState } from "react";

export function VoiceSampleButton({
  name,
  text,
  compact = false,
}: {
  name: string;
  text: string;
  compact?: boolean;
}) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function playSample() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-TW";
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    setPlaying(true);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <button
      className={`voice-button ${compact ? "voice-button-compact" : ""}`}
      type="button"
      onClick={playSample}
      aria-label={`播放${name}的示範語音`}
    >
      <span className={playing ? "voice-icon is-playing" : "voice-icon"} aria-hidden>
        {playing ? "Ⅱ" : "▶"}
      </span>
      <span className="waveform" aria-hidden><i /><i /><i /><i /><i /></span>
      <span>{playing ? "播放中" : compact ? "聽聲音" : "30 秒語音介紹"}</span>
    </button>
  );
}
