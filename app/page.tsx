"use client";

import { useRef, useState } from "react";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/mp4",
      });

      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const deleteRecording = () => {
    setAudioUrl(null);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-black text-white">
      <h1 className="text-4xl font-bold">ECHORIA</h1>

      {!isRecording ? (
        <button
          onClick={startRecording}
          className="px-6 py-3 bg-white text-black rounded-xl font-semibold"
        >
          Start Recording
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="px-6 py-3 bg-red-500 rounded-xl font-semibold"
        >
          Stop Recording
        </button>
      )}

      {audioUrl && (
        <div className="flex flex-col items-center gap-4">
          <audio controls src={audioUrl} />
          <button
            onClick={deleteRecording}
            className="px-4 py-2 border border-white rounded-xl"
          >
            Delete Recording
          </button>
        </div>
      )}
    </main>
  );
}