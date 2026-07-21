"use client";

import { useEffect, useState } from "react";

type ProductType = "echo" | "gift" | "frame";

const prices: Record<ProductType, number> = {
  echo: 19,
  gift: 49,
  frame: 89,
};

function isProductType(value: unknown): value is ProductType {
  return value === "echo" || value === "gift" || value === "frame";
}

function trackPurchase(productType: ProductType) {
  (window as any).ttq?.track("Purchase", {
    value: prices[productType],
    currency: "PLN",
    content_name: productType,
    content_id: productType,
    content_type: "product",
  });
}

export default function PaymentSuccessPage() {
  const [productType, setProductType] = useState<ProductType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const sessionId = searchParams.get("session_id");
    const productTypeFromUrl = searchParams.get("product_type");

    // Zamówienie darmowe albo wcześniej opłacone
    if (isProductType(productTypeFromUrl)) {
      setProductType(productTypeFromUrl);
      trackPurchase(productTypeFromUrl);
      setIsLoading(false);
      return;
    }

    // Brak session_id i brak product_type
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    const validSessionId: string = sessionId;

    async function loadSession() {
      try {
        const response = await fetch(
          `/api/stripe/session?session_id=${encodeURIComponent(
            validSessionId
          )}`,
          {
            cache: "no-store",
          }
        );

        const data: {
          productType?: unknown;
          error?: string;
        } = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Nie udało się pobrać sesji.");
        }

        if (!isProductType(data.productType)) {
          throw new Error("Nieznany lub brakujący typ produktu.");
        }

        setProductType(data.productType);
        trackPurchase(data.productType);
      } catch (error) {
        console.error("Błąd strony sukcesu:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <p className="text-gray-400">Potwierdzamy Twoją płatność…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 antialiased">
      <div className="max-w-2xl w-full flex flex-col items-center text-center gap-8">
        <img
          src="/logo2.png"
          alt="Echoria"
          className="w-52 md:w-72 h-auto opacity-90"
        />

        <div className="flex flex-col gap-5">
          <h1 className="text-4xl md:text-6xl font-serif font-light leading-tight tracking-wide">
            {productType === "echo" &&
              "Twoje Echo wyruszyło w drogę!"}

            {productType === "gift" &&
              "Twój Echo Gift właśnie powstaje."}

            {productType === "frame" &&
              "Twoja Echo Frame właśnie powstaje."}

            {!productType &&
              "Dziękujemy za Twoje zamówienie."}
          </h1>

          <p className="text-gray-400 text-lg md:text-xl leading-relaxed font-light">
            {productType === "echo" && (
              <>
                Już wkrótce dotrze do osoby, dla której je stworzyłeś.
                <br />
                Dziękujemy, że tworzysz z nami wspomnienia, które zostają na
                zawsze.
              </>
            )}

            {productType === "gift" && (
              <>
                Przygotowujemy zawieszkę z kodem QR połączoną z Twoją
                wiadomością.
                <br />
                Już wkrótce będzie gotowa, aby wyruszyć w drogę.
              </>
            )}

            {productType === "frame" && (
              <>
                Przygotowujemy personalizowaną ramkę z kodem QR połączoną z
                Twoją wiadomością.
                <br />
                Już wkrótce będzie gotowa, aby wyruszyć w drogę.
              </>
            )}

            {!productType && (
              <>
                Płatność została przyjęta.
                <br />
                Rozpoczynamy realizację Twojego zamówienia.
              </>
            )}
          </p>
        </div>

        <button
          onClick={() => {
            window.location.href = "/";
          }}
          className="px-8 py-2 bg-white text-black rounded-2xl font-medium tracking-wide hover:opacity-90 transition"
        >
          Nagraj kolejną wiadomość
        </button>
      </div>
    </main>
  );
}