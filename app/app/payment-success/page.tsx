export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center flex flex-col gap-6">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
          ECHORIA
        </p>

        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Twoja wiadomość została zapisana 💌
        </h1>

        <p className="text-lg text-gray-300">
          Odbiorca otrzyma ją w wybranym przez Ciebie terminie.
        </p>

        <a
          href="/"
          className="inline-block mt-4 bg-white text-black px-6 py-4 rounded-2xl font-semibold hover:opacity-90 transition"
        >
          Wyślij kolejną wiadomość
        </a>
      </div>
    </main>
  );
}