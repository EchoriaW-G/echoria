"use client";

import { useRef, useState } from "react";

export default function AudioPlayer({
  src,
}: {
  src: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setPlaying(!playing);
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8">
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => setPlaying(false)}
      />

      <button
        onClick={togglePlay}
        className="
          w-20
          h-20
          rounded-full
          border
          border-white/20
          flex
          items-center
          justify-center
          mx-auto
          hover:bg-white/5
          transition
        "
      >
        {playing ? (
          <span className="text-3xl">❚❚</span>
        ) : (
          <span className="text-3xl ml-1">▶</span>
        )}
      </button>

      <p className="mt-6 text-gray-400 text-sm tracking-widest uppercase">
        Odtwórz wiadomość
      </p>
    </div>
  );
}