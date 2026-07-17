"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type ProductType = "echo" | "gift" | "frame";

const prices: Record<ProductType, number> = {
  echo: 19,
  gift: 49,
  frame: 89,
};

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [productType, setProductType] = useState<ProductType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    async function loadSession() {
      try {
        const response = await fetch(
          `/api/stripe/session?session_id=${encodeURIComponent(sessionId!)}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        console.log("Dane sesji Stripe:", data);

        if (!response.ok) {
          throw new Error(data.error ?? "Nie udało się pobrać sesji.");
        }

        const receivedProductType = data.productType;

        if (
          receivedProductType === "echo" ||
          receivedProductType === "gift" ||
          receivedProductType === "frame"
        ) {
          setProductType(receivedProductType);

          (window as any).ttq?.track("Purchase", {
            value: prices[receivedProductType],
            currency: "PLN",
            content_name: receivedProductType,
          });
        } else {
          console.error(
            "Nieznany lub brakujący productType:",
            receivedProductType
          );
        }
      } catch (error) {
        console.error("Błąd strony sukcesu:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, [sessionId]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <p className="text-gray-400">Potwierdzamy Twoją płatność…</p>
      </main>
    );
  }

  const isPhysicalProduct =
    productType === "gift" || productType === "frame";

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
            {productType === "echo" && "Twoje Echo wyruszyło w drogę!"}

            {isPhysicalProduct && "Każde Echo ma swoją historię."}

            {!productType && "Każde Echo ma swoją historię."}
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

            {isPhysicalProduct && (
              <>
                Twoje właśnie powstaje.
                <br />
                Już wkrótce będzie gotowe, by wyruszyć w drogę.
              </>
            )}

            {!productType && (
              <>
                Twoje właśnie powstaje.
                <br />
                Już wkrótce będzie gotowe, by wyruszyć w drogę.
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