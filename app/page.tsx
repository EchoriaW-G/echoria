"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabase";

type Step = "record" | "product" | "details";
type ProductType = "echo" | "gift" | "frame";
type ShippingMethod = "locker" | "courier";
type InPostPoint = {
  name: string;
  location_description?: string;
  address: {
    line1: string;
    line2: string;
  };
};

type InPostWidgetApi = {
  addPointSelectedCallback: (
    callback: (point: InPostPoint) => void
  ) => void;
};

const productCopy: Record<
  ProductType,
  { name: string; price: string; description: string; badge?: string }
> = {
  echo: {
    name: "Echo",
    price: "19 zł",
    description: "Personalizowana wiadomość głosowa dostarczona online w wybranym terminie.",
  },
  gift: {
    name: "Echo Gift",
    price: "49 zł",
    description: "Elegancka zawieszka prezentowa z kodem QR, kryjącym Twoją wiadomość audio.",
    badge: "NOWOŚĆ",
  },
  frame: {
    name: "Echo Frame",
    price: "89 zł",
    description: "Personalizowana ramka z kodem QR, pozwalająca zachować najpiękniejsze słowa na lata.",
  },
};
const shippingPrices = {
  locker: 14.99,
  courier: 16.99,
};

const productPrices = {
  echo: 19,
  gift: 49,
  frame: 89,
};
export default function Home() {
  const [step, setStep] = useState<Step>("record");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  const [productType, setProductType] = useState<ProductType>("echo");

  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [dedication, setDedication] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [smsNotification, setSmsNotification] = useState(false);

  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");

  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingPostcode, setShippingPostcode] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingMethod, setShippingMethod] =
  useState<ShippingMethod>("locker");

const [shippingLocker, setShippingLocker] = useState("");
const [shippingLockerAddress, setShippingLockerAddress] = useState("");
const [shippingLockerDescription, setShippingLockerDescription] =
  useState("");

const inpostContainerRef = useRef<HTMLDivElement | null>(null);

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptDigitalService, setAcceptDigitalService] = useState(false);
  const [confirmRecipientConsent, setConfirmRecipientConsent] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef("audio/webm");
  const [frameColor, setFrameColor] = useState<"black" | "wood">("black");

  const isPhysicalProduct = productType !== "echo";
  const shippingPrice = isPhysicalProduct
  ? shippingPrices[shippingMethod]
  : 0;

const totalPrice =
  productPrices[productType] + shippingPrice;
  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const isValidPhone = (phone: string) =>
    /^\+?[0-9]{9,15}$/.test(phone.replace(/\s/g, ""));

  const hasValidCommonDetails =
    senderName.trim() !== "" &&
    isValidEmail(senderEmail) &&
    recipientName.trim() !== "";

  const hasValidEchoDetails =
    productType !== "echo" ||
    (isValidEmail(recipientEmail) &&
      deliveryDate !== "" &&
      deliveryTime !== "" &&
      (!smsNotification || isValidPhone(recipientPhone)));

  const hasValidShippingDetails =
  !isPhysicalProduct ||
  (
    shippingName.trim() !== "" &&
    isValidPhone(shippingPhone) &&
    (
      shippingMethod === "locker"
        ? shippingLocker.trim() !== ""
        : (
            shippingAddress.trim() !== "" &&
            shippingPostcode.trim() !== "" &&
            shippingCity.trim() !== ""
          )
    )
  );

  const canProceedToPayment =
    hasValidCommonDetails &&
    hasValidEchoDetails &&
    hasValidShippingDetails &&
    acceptTerms &&
    acceptDigitalService &&
    confirmRecipientConsent &&
    !isSaving;

  const buildDeliveryTimestamp = () => {
    const [year, month, day] = deliveryDate.split("-").map(Number);
    const [hours, minutes] = deliveryTime.split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes, 0).toISOString();
  };

 useEffect(() => {
  (window as any).handleInPostPoint = (point: InPostPoint) => {
    setShippingLocker(point.name);

    setShippingLockerDescription(
      point.location_description || ""
    );

    setShippingLockerAddress(
      [point.address?.line1, point.address?.line2]
        .filter(Boolean)
        .join(", ")
    );
  };

  return () => {
    delete (window as any).handleInPostPoint;
  };
}, []);

useEffect(() => {
  if (
    step !== "details" ||
    productType === "echo" ||
    shippingMethod !== "locker"
  ) {
    return;
  }
{productType === "frame" && (
  <div className="space-y-3">
    <label className="block text-lg font-medium">
      Wybierz kolor ramki
    </label>

    <div className="grid grid-cols-2 gap-4">

      <button
        type="button"
        onClick={() => setFrameColor("black")}
        className={`rounded-2xl border p-4 transition ${
          frameColor === "black"
            ? "border-white bg-white text-black"
            : "border-zinc-700"
        }`}
      >
        Czarna
      </button>

      <button
        type="button"
        onClick={() => setFrameColor("wood")}
        className={`rounded-2xl border p-4 transition ${
          frameColor === "wood"
            ? "border-white bg-white text-black"
            : "border-zinc-700"
        }`}
      >
        Drewno
      </button>

    </div>
  </div>
)}

  const container = inpostContainerRef.current;

  if (!container) {
    return;
  }

  const token =
    process.env.NEXT_PUBLIC_INPOST_GEOWIDGET_TOKEN;

  if (!token) {
    return;
  }

  container.innerHTML = "";

  const widget = document.createElement("inpost-geowidget");

  widget.setAttribute("token", token);
  widget.setAttribute("language", "pl");
  widget.setAttribute("config", "parcelCollect");
  widget.setAttribute("onpoint", "handleInPostPoint");

  container.appendChild(widget);

  return () => {
    container.innerHTML = "";
  };
}, [step, productType, shippingMethod]);

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
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setIsUploading(true);
        stream.getTracks().forEach((track) => track.stop());

        try {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mimeTypeRef.current,
          });

          if (audioUrl) URL.revokeObjectURL(audioUrl);
          setAudioUrl(URL.createObjectURL(audioBlob));

          const extension = mimeTypeRef.current === "audio/mp4" ? "mp4" : "webm";
          const fileName = `recording-${Date.now()}.${extension}`;

          const { error } = await supabase.storage
            .from("audio")
            .upload(fileName, audioBlob, { contentType: mimeTypeRef.current });

          if (error) {
            alert(JSON.stringify(error));
            return;
          }

          const { data } = supabase.storage.from("audio").getPublicUrl(fileName);
          setUploadedAudioUrl(data.publicUrl);
        } catch (error) {
          alert(String(error));
        } finally {
          setIsUploading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      alert(String(error));
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const deleteRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setUploadedAudioUrl(null);
    setStep("record");
  };

  const chooseProduct = (product: ProductType) => {
    setProductType(product);

    if (product !== "echo") {
      setSmsNotification(false);
      setRecipientPhone("");
      setDeliveryDate("");
      setDeliveryTime("");
    }

    setStep("details");
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
      const messageResponse = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName,
          senderEmail,
          recipientName,
          recipientEmail: productType === "echo" ? recipientEmail : null,
          recipientPhone:
            productType === "echo" && smsNotification ? recipientPhone : null,
          smsNotification:
            productType === "echo" && smsNotification,
          discountCode,
          dedication,
          deliveryDate:
            productType === "echo"
              ? buildDeliveryTimestamp()
              : null,
          audioUrl: uploadedAudioUrl,
          productType,
          frameColor: productType === "frame" ? frameColor : null,
          shippingName: isPhysicalProduct ? shippingName : null,
          shippingPhone: isPhysicalProduct ? shippingPhone : null,
         shippingAddress: isPhysicalProduct
  ? shippingMethod === "locker"
    ? `${shippingLocker} | ${shippingLockerAddress}`
    : shippingAddress
  : null,

shippingPostcode:
  isPhysicalProduct && shippingMethod === "courier"
    ? shippingPostcode
    : null,

shippingCity:
  isPhysicalProduct && shippingMethod === "courier"
    ? shippingCity
    : null,
          shippingMethod: isPhysicalProduct
  ? shippingMethod
  : null,

shippingPrice: isPhysicalProduct
  ? shippingMethod === "locker"
    ? 1499
    : 1699
  : 0,
        }),
      });

      const messageData = await messageResponse.json();

      if (!messageResponse.ok) {
        alert(messageData.error || "Nie udało się zapisać zamówienia.");
        return;
      }

      if (typeof window !== "undefined" && (window as any).ttq) {
        (window as any).ttq.track("InitiateCheckout");
      }

      const response = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  messageId: messageData.messageId,
  productType,
  smsNotification: productType === "echo" && smsNotification,

  shippingMethod: isPhysicalProduct
    ? shippingMethod
    : null,

  shippingPrice: isPhysicalProduct
    ? shippingPrice
    : 0,
}),
      });

      const stripeData = await response.json();

      if (stripeData.url) {
        window.location.href = stripeData.url;
        return;
      }

      alert(stripeData.error || "Błąd płatności.");
    } catch (error) {
      alert(String(error));
    } finally {
      setIsSaving(false);
    }
  };

  const Agreements = () => (
    <div className="flex flex-col gap-4 text-sm leading-relaxed text-gray-300">
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(event) => setAcceptTerms(event.target.checked)}
          className="mt-1"
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
          </a>
          .
        </span>
      </label>

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={acceptDigitalService}
          onChange={(event) => setAcceptDigitalService(event.target.checked)}
          className="mt-1"
        />
        <span>
          {productType === "echo"
            ? "Rozumiem, że realizacja usługi cyfrowej rozpoczyna się po zakupie."
            : "Rozumiem, że produkt jest wykonywany ręcznie na zamówienie, a jego wysyłka nastąpi po przygotowaniu zamówienia."}
        </span>
      </label>

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={confirmRecipientConsent}
          onChange={(event) =>
            setConfirmRecipientConsent(event.target.checked)
          }
          className="mt-1"
        />
        <span>
          Potwierdzam, że mam prawo podać dane odbiorcy wykorzystane do
          realizacji zamówienia.
        </span>
      </label>
    </div>
  );

  if (step === "product") {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white antialiased">
        <div className="mx-auto flex w-full max-w-md flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
              Krok 2 z 3
            </p>
            <h1 className="text-4xl font-light tracking-wide font-serif">
              Wybierz sposób wręczenia
            </h1>
            <p className="text-sm leading-relaxed text-gray-400">
              To samo osobiste nagranie możesz wysłać cyfrowo albo zamienić w
              gotowy do wręczenia prezent.
            </p>
          </div>

          {(Object.keys(productCopy) as ProductType[]).map((product) => {
            const copy = productCopy[product];
            return (
              <button
                key={product}
                type="button"
                onClick={() => chooseProduct(product)}
                className="relative w-full rounded-2xl border border-white/20 p-5 text-left transition hover:bg-white/5"
              >
                {copy.badge && (
                  <span className="absolute -top-3 right-4 rounded-full bg-white px-3 py-1 text-xs font-medium text-black">
                    {copy.badge}
                  </span>
                )}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-medium">{copy.name}</p>
                    <p className="mt-1 text-sm text-gray-400">
                      {copy.description}
                    </p>
                  </div>
                  <span className="whitespace-nowrap font-medium">
                    {copy.price}
                  </span>
                </div>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setStep("record")}
            className="text-sm text-gray-400"
          >
            Wróć do nagrania
          </button>
        </div>
      </main>
    );
  }

  if (step === "details") {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white antialiased">
        <div className="mx-auto flex w-full max-w-md flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
              Krok 3 z 3
            </p>
            <h1 className="text-4xl font-light tracking-wide font-serif">
              Szczegóły zamówienia
            </h1>
            <p className="text-sm text-gray-400">
              Wybrany produkt: {productCopy[productType].name} ·{" "}
              {productCopy[productType].price}
            </p>
          </div>

          <input
            type="text"
            placeholder="Twoje imię"
            value={senderName}
            onChange={(event) => setSenderName(event.target.value)}
            className="rounded-2xl bg-white p-4 text-black"
          />

          <input
            type="email"
            placeholder="Twój e-mail"
            value={senderEmail}
            onChange={(event) => setSenderEmail(event.target.value)}
            className="rounded-2xl bg-white p-4 text-black"
          />
          {senderEmail.length > 0 && !isValidEmail(senderEmail) && (
            <p className="text-sm text-red-400">
              Podaj poprawny adres e-mail nadawcy.
            </p>
          )}

          <input
            type="text"
            placeholder="Imię odbiorcy"
            value={recipientName}
            onChange={(event) => setRecipientName(event.target.value)}
            className="rounded-2xl bg-white p-4 text-black"
          />

          {productType === "echo" ? (
            <>
              <input
                type="email"
                placeholder="E-mail odbiorcy"
                value={recipientEmail}
                onChange={(event) => setRecipientEmail(event.target.value)}
                className="rounded-2xl bg-white p-4 text-black"
              />
              {recipientEmail.length > 0 && !isValidEmail(recipientEmail) && (
                <p className="text-sm text-red-400">
                  Podaj poprawny adres e-mail odbiorcy.
                </p>
              )}

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={smsNotification}
                  onChange={(event) => setSmsNotification(event.target.checked)}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm text-gray-300">
                    Powiadom odbiorcę SMS-em (+1,99 zł)
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    SMS zostanie wysłany w momencie dostarczenia Echo.
                  </p>
                </div>
              </label>

              {smsNotification && (
                <>
                  <input
                    type="tel"
                    placeholder="Numer telefonu odbiorcy"
                    value={recipientPhone}
                    onChange={(event) => setRecipientPhone(event.target.value)}
                    className="rounded-2xl bg-white p-4 text-black"
                  />
                  {recipientPhone.length > 0 &&
                    !isValidPhone(recipientPhone) && (
                      <p className="text-sm text-red-400">
                        Podaj poprawny numer telefonu.
                      </p>
                    )}
                </>
              )}

              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-300">Termin dostarczenia</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(event) => setDeliveryDate(event.target.value)}
                    className="rounded-2xl bg-white p-4 text-black"
                  />
                  <input
                    type="time"
                    value={deliveryTime}
                    onChange={(event) => setDeliveryTime(event.target.value)}
                    className="rounded-2xl bg-white p-4 text-black"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-4 rounded-2xl border border-white/10 p-4">
              <p className="text-sm font-medium text-gray-200">Metoda dostawy</p>
              <div className="flex flex-col gap-3 mb-2">

  <button
    type="button"
    onClick={() => setShippingMethod("locker")}
    className={`rounded-2xl border p-4 text-left transition ${
      shippingMethod === "locker"
        ? "border-white bg-white text-black"
        : "border-white/20"
    }`}
  >
    <div className="font-medium">
      Paczkomat InPost
    </div>

    <div className="text-sm opacity-70">
      14,99 zł
    </div>
  </button>

  <button
    type="button"
    onClick={() => setShippingMethod("courier")}
    className={`rounded-2xl border p-4 text-left transition ${
      shippingMethod === "courier"
        ? "border-white bg-white text-black"
        : "border-white/20"
    }`}
  >
    <div className="font-medium">
      Kurier
    </div>

    <div className="text-sm opacity-70">
      16,99 zł
    </div>
  </button>

</div>
              <input
                type="text"
                placeholder="Imię i nazwisko odbiorcy przesyłki"
                value={shippingName}
                onChange={(event) => setShippingName(event.target.value)}
                className="rounded-2xl bg-white p-4 text-black"
              />
              <input
                type="tel"
                placeholder="Numer telefonu do przesyłki"
                value={shippingPhone}
                onChange={(event) => setShippingPhone(event.target.value)}
                className="rounded-2xl bg-white p-4 text-black"
              />
              {shippingPhone.length > 0 && !isValidPhone(shippingPhone) && (
                <p className="text-sm text-red-400">
                  Podaj poprawny numer telefonu.
                </p>
              )}
              {shippingMethod === "locker" ? (
  <div className="flex flex-col gap-4">
  {shippingLocker && (
    <div className="rounded-2xl border border-white/20 bg-white/[0.04] p-4">
      <p className="text-sm uppercase tracking-widest text-gray-500">
        Wybrany Paczkomat
      </p>

      <p className="mt-2 text-lg font-medium text-white">
        {shippingLocker}
      </p>

      {shippingLockerDescription && (
        <p className="mt-1 text-sm text-gray-400">
          {shippingLockerDescription}
        </p>
      )}

      {shippingLockerAddress && (
        <p className="mt-1 text-sm text-gray-400">
          {shippingLockerAddress}
        </p>
      )}
    </div>
  )}

{process.env.NEXT_PUBLIC_INPOST_GEOWIDGET_TOKEN ? (
  <div
  ref={inpostContainerRef}
  className="overflow-hidden rounded-2xl bg-white"
/>
) : (
  <p className="rounded-2xl border border-red-400/30 p-4 text-sm text-red-300">
    Brakuje tokenu Geowidget InPost.
  </p>
)}
</div>
) : (
  <>
    <input
      type="text"
      placeholder="Ulica i numer domu / mieszkania"
      value={shippingAddress}
      onChange={(event) => setShippingAddress(event.target.value)}
      className="rounded-2xl bg-white p-4 text-black"
    />

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <input
        type="text"
        placeholder="Kod pocztowy"
        value={shippingPostcode}
        onChange={(event) => setShippingPostcode(event.target.value)}
        className="rounded-2xl bg-white p-4 text-black"
      />

      <input
        type="text"
        placeholder="Miejscowość"
        value={shippingCity}
        onChange={(event) => setShippingCity(event.target.value)}
        className="rounded-2xl bg-white p-4 text-black"
      />
    </div>
  </>
)}
            </div>
          )}

          <input
            type="text"
            placeholder="Kod rabatowy (opcjonalnie)"
            value={discountCode}
            onChange={(event) =>
              setDiscountCode(event.target.value.toUpperCase())
            }
            className="rounded-2xl bg-white p-4 text-black"
          />

          <div>
  <textarea
    placeholder={
      productType === "echo"
        ? "Dedykacja (opcjonalnie)"
        : "Krótka dedykacja (maks. 50 znaków)"
    }
    value={dedication}
    onChange={(event) => setDedication(event.target.value)}
    maxLength={productType === "echo" ? 500 : 50}
    className="min-h-[120px] w-full rounded-2xl bg-white p-4 text-black"
  />

  <p className="mt-2 text-right text-sm text-gray-400">
    {dedication.length}/{productType === "echo" ? 500 : 50}
  </p>
</div>

          <Agreements />

          <button
            type="button"
            onClick={saveMessage}
            disabled={!canProceedToPayment}
            className="rounded-2xl bg-white px-6 py-3 font-medium tracking-wide text-black transition hover:opacity-90 disabled:opacity-50"
          >
            {isSaving
  ? "Przekierowanie..."
  : `Zapłać ${totalPrice.toFixed(2)} zł`}
          </button>

          <button
            type="button"
            onClick={() => setStep("product")}
            className="text-sm text-gray-400"
          >
            Zmień produkt
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-white antialiased">
      <img src="/logo2.png" alt="Echoria" className="h-auto w-72 md:w-96" />
      <p className="max-w-xl text-center text-lg font-light leading-relaxed text-gray-400">
        Nagraj wiadomość, która wybrzmi we właściwym momencie.
      </p>

      {!isRecording && !audioUrl ? (
  <button
    type="button"
    onClick={startRecording}
    disabled={isUploading}
    className="rounded-2xl bg-white px-8 py-2 font-medium tracking-wide text-black transition hover:opacity-90 disabled:opacity-50"
  >
    Rozpocznij nagrywanie
  </button>
) : isRecording ? (
  <button
    type="button"
    onClick={stopRecording}
    className="rounded-2xl bg-white px-8 py-2 font-medium tracking-wide text-black transition hover:opacity-90"
  >
    Zatrzymaj nagrywanie
  </button>
) : null}

      {isUploading && (
        <p className="text-sm text-gray-400">Trwa przesyłanie nagrania...</p>
      )}

      {audioUrl && !isUploading && (
        <div className="flex flex-col items-center gap-4">
          <audio controls src={audioUrl} />
          <button
            type="button"
            onClick={() => setStep("product")}
            disabled={!uploadedAudioUrl}
            className="rounded-2xl bg-white px-8 py-3 font-medium tracking-wide text-black transition hover:opacity-90 disabled:opacity-50"
          >
            Wybierz produkt
          </button>
          <button
            type="button"
            onClick={deleteRecording}
            className="rounded-2xl border border-white/30 px-4 py-2 text-sm transition hover:bg-white/5"
          >
            Usuń nagranie
          </button>
        </div>
      )}
    </main>
  );
}