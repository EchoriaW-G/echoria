type AdminQrPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function AdminQrPage({
  params,
}: AdminQrPageProps) {
  const { token } = await params;

  const qrUrl = `/api/qr/${token}`;
  const messageUrl = `/m/${token}`;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <img
          src="/logo2.png"
          alt="Echoria"
          className="w-[220px] mx-auto mb-8"
        />

        <h1 className="text-3xl md:text-4xl mb-3">
          Kod QR wiadomości
        </h1>

        <p className="text-gray-400 mb-10">
          Token: {token}
        </p>

        <div className="bg-white rounded-3xl p-6 md:p-10 mb-8">
          <img
            src={qrUrl}
            alt="Kod QR"
            className="w-full max-w-[420px] mx-auto"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={qrUrl}
            download={`echoria-${token}.svg`}
            className="
              bg-white
              text-black
              px-8
              py-4
              rounded-2xl
              font-medium
              hover:opacity-90
              transition
            "
          >
            Pobierz SVG
          </a>

          <a
            href={messageUrl}
            target="_blank"
            rel="noreferrer"
            className="
              border
              border-white/20
              px-8
              py-4
              rounded-2xl
              font-medium
              hover:bg-white/5
              transition
            "
          >
            Otwórz wiadomość
          </a>
        </div>
      </div>
    </main>
  );
}