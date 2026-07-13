"use client";

import { useEffect } from "react";

export default function PaymentSuccessPage() {

  useEffect(() => {
  (window as any).ttq?.track("Purchase", {
    value: 39,
    currency: "PLN",
  });
}, []);

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
            Echo wyruszyło w drogę!
          </h1>

          <p className="text-gray-400 text-lg md:text-xl leading-relaxed font-light">
            Odbiorca otrzyma je w wybranym przez Ciebie momencie.
<br>Dziękujemy. Stałeś się częścią naszej misji.</br>
          </p>
        </div>

        <button
          onClick={() => (window.location.href = "/")}
          className="px-8 py-2 bg-white text-black rounded-2xl font-medium tracking-wide hover:opacity-90 transition"
        >
          Nagraj kolejną wiadomość
        </button>

      </div>
    </main>
  );
}