"use client";

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 antialiased">
      <div className="max-w-2xl w-full flex flex-col items-center text-center gap-8">

        <img
          src="/logo2.png"
          alt="Echoria"
          className="w-52 md:w-72 h-auto opacity-90"
        />

        <div className="flex flex-col gap-5">
          <h1 className="text-5xl md:text-7xl font-serif font-light leading-tight tracking-wide">
            Echo ruszyło w drogę!
          </h1>

          <p className="text-gray-400 text-lg md:text-xl leading-relaxed font-light">
            Odbiorca otrzyma je w wybranym przez Ciebie momencie.
          </p>
        </div>

        <button
          onClick={() => (window.location.href = "/")}
          className="mt-4 px-10 py-4 bg-white text-black rounded-2xl font-medium tracking-wide hover:opacity-90 transition"
        >
          Nagraj kolejną wiadomość
        </button>

      </div>
    </main>
  );
}