"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [step, setStep] = useState<"record" | "details" | "delivery">("record");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);

  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [dedication, setDedication] = useState("");

  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptDigitalService, setAcceptDigitalService] = useState(false);
  const [confirmRecipientConsent, setConfirmRecipientConsent] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>("audio/webm");

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const canContinueToDelivery =
    recipientName.trim() !== "" &&
    recipientEmail.trim() !== "" &&
    isValidEmail(recipientEmail);

  const canProceedToPayment =
    deliveryDate !== "" &&
    deliveryTime !== "" &&
    acceptTerms &&
    acceptDigitalService &&
    confirmRecipientConsent &&
    !isSaving;

  const buildDeliveryTimestamp = () => {
    const [year, month, day] = deliveryDate.split("-").map(Number);
    const [hours, minutes] = deliveryTime.split(":").map(Number);

    const localDate = new Date(
      year,
      month - 1,
      day,
      hours,
      minutes,
      0
    );

    return localDate.toISOString();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "audio/webm";

      mimeTypeRef.current = mimeType;

      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsUploading(true);

        try {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mimeTypeRef.current,
          });

          const localPreviewUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(localPreviewUrl);

          const extension =
            mimeTypeRef.current === "audio/mp4" ? "mp4" : "webm";

          const fileName = `recording-${Date.now()}.${extension}`;

          const { error } = await supabase.storage
            .from("audio")
            .upload(fileName, audioBlob, {
              contentType: mimeTypeRef.current,
            });

          if (error) {
            alert(JSON.stringify(error));
            setIsUploading(false);
            return;
          }

          const { data } = supabase.storage
            .from("audio")
            .getPublicUrl(fileName);

          setUploadedAudioUrl(data.publicUrl);
        } catch (err) {
          alert(String(err));
        }

        setIsUploading(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert(String(err));
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    setUploadedAudioUrl(null);
    setStep("record");
  };

  const saveMessage = async () => {
    if (!uploadedAudioUrl) {
      alert("Nagranie nie zostało przesłane.");
      return;
    }

    if (!canProceedToPayment) {
      alert("Uzupełnij wszystkie wymagane pola.");
      return;
    }

    setIsSaving(true);

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          recipient_name: recipientName,
          recipient_email: recipientEmail,
          dedication,
          delivery_date: buildDeliveryTimestamp(),
          audio_url: uploadedAudioUrl,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        alert(JSON.stringify(error));
        setIsSaving(false);
        return;
      }

      const response = await fetch("/api/stripe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId: data.id,
        }),
      });

      const stripeData = await response.json();

      if (stripeData.url) {
        window.location.href = stripeData.url;
        return;
      }

      alert("Błąd płatności.");
    } catch (err) {
      alert(String(err));
    }

    setIsSaving(false);
  };

  if (step === "delivery") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white px-6">
        <div className="w-full max-w-md flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Termin dostarczenia</h1>

          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="p-4 rounded-xl bg-white text-black"
          />

          <input
            type="time"
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
            className="p-4 rounded-xl bg-white text-black"
          />

          <div className="flex flex-col gap-4 text-sm text-gray-300">
            <label className="flex gap-3 items-start">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <span>
                Akceptuję{" "}
                <a
                  href="https://echoria.pl/index.php/regulamin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Regulamin
                </a>{" "}
                oraz{" "}
                <a
                  href="https://echoria.pl/index.php/polityka-prywatnosci-2/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Politykę Prywatności
                </a>.
              </span>
            </label>

            <label className="flex gap-3 items-start">
              <input
                type="checkbox"
                checked={acceptDigitalService}
                onChange={(e) => setAcceptDigitalService(e.target.checked)}
              />
              <span>
                Rozumiem, że realizacja usługi cyfrowej rozpoczyna się po zakupie.
              </span>
            </label>

            <label className="flex gap-3 items-start">
              <input
                type="checkbox"
                checked={confirmRecipientConsent}
                onChange={(e) => setConfirmRecipientConsent(e.target.checked)}
              />
              <span>
                Potwierdzam, że mam prawo podać adres e-mail odbiorcy.
              </span>
            </label>
          </div>

          <button
            onClick={saveMessage}
            disabled={!canProceedToPayment}
            className="px-6 py-4 bg-white text-black rounded-xl font-semibold disabled:opacity-50"
          >
            {isSaving ? "Przekierowanie..." : "Przejdź do płatności"}
          </button>

          <button
            onClick={() => setStep("details")}
            className="text-gray-400"
          >
            Wróć
          </button>
        </div>
      </main>
    );
  }

  if (step === "details") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white px-6">
        <div className="w-full max-w-md flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Szczegóły odbiorcy</h1>

          <input
            type="text"
            placeholder="Imię odbiorcy"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="p-4 rounded-xl bg-white text-black"
          />

          <input
            type="email"
            placeholder="Adres e-mail odbiorcy"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="p-4 rounded-xl bg-white text-black"
          />

          <textarea
            placeholder="Dodaj dedykację (opcjonalnie)..."
            value={dedication}
            onChange={(e) => setDedication(e.target.value)}
            className="p-4 rounded-xl bg-white text-black min-h-[120px]"
          />

          {!isValidEmail(recipientEmail) && recipientEmail.length > 0 && (
            <p className="text-red-400 text-sm">
              Podaj poprawny adres e-mail.
            </p>
          )}

          <button
            onClick={() => setStep("delivery")}
            disabled={!canContinueToDelivery}
            className="px-6 py-4 bg-white text-black rounded-xl font-semibold disabled:opacity-50"
          >
            Dalej
          </button>

          <button
            onClick={() => setStep("record")}
            className="text-gray-400"
          >
            Wróć
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-3 bg-black text-white px-6">
      <img
  src="/logo2.png"
  alt="Echoria"
  className="w-72 h-auto md:w-96"
/>

      <p className="text-gray-400 text-center max-w-md">
        Nagraj wiadomość, która wybrzmi we właściwym momencie.
      </p>

      {!isRecording ? (
        <button
          onClick={startRecording}
          disabled={isUploading}
          className="px-6 py-3 bg-white text-black rounded-xl font-semibold disabled:opacity-50"
        >
          Rozpocznij nagrywanie
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="px-6 py-3 bg-red-500 rounded-xl font-semibold"
        >
          Zatrzymaj nagrywanie
        </button>
      )}

      {isUploading && <p>Trwa przesyłanie nagrania...</p>}

      {audioUrl && !isUploading && (
        <div className="flex flex-col items-center gap-4">
          <audio controls src={audioUrl} />

          <button
            onClick={() => setStep("details")}
            className="px-6 py-3 bg-white text-black rounded-xl font-semibold"
          >
            Dalej
          </button>

          <button
            onClick={deleteRecording}
            className="px-4 py-2 border border-white rounded-xl"
          >
            Usuń nagranie
          </button>
        </div>
      )}
    </main>
  );
}