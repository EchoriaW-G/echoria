import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import AudioPlayer from "@/app/components/AudioPlayer";
import DownloadButton from "@/app/components/DownloadButton";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function MessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: message, error } = await supabase
    .from("messages")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !message) {
    notFound();
  }

  if (!["paid", "sent"].includes(message.status)) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-12">
      <div className="max-w-4xl w-full text-center">
        <img
          src="/logo2.png"
          alt="Echoria"
          className="w-[220px] md:w-[320px] mx-auto mb-4"
        />

        <p className="text-gray-400 text-center max-w-xl mx-auto text-lg leading-relaxed font-light mb-10">
          {message.sender_name
            ? `${message.sender_name} przesyła Ci ECHO`
            : "Twoje ECHO dotarło."}
          <br />
          Ta wiadomość czekała właśnie na ten moment.
        </p>

        {message.dedication && (
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 md:p-10">
              <p
                className="
                  font-[var(--font-cormorant)]
                  text-2xl
                  md:text-3xl
                  italic
                  text-gray-200
                "
              >
                „{message.dedication}”
              </p>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto mb-12">
          <AudioPlayer src={message.audio_url} />
        </div>

        <div className="max-w-xl mx-auto mt-10 text-center">
          <p
            className="
              font-[var(--font-cormorant)]
              text-3xl
              md:text-4xl
              text-white
              mb-3
            "
          >
            Zachowaj Echo
          </p>

          <p className="text-gray-400 leading-relaxed mb-6">
            Bo niektóre wiadomości warto zatrzymać na zawsze.
          </p>

          {message.download_unlocked ? (
            <a
              href={`/api/download/${message.id}`}
              className="
                inline-block
                bg-white
                text-black
                px-8
                py-3
                rounded-2xl
                font-medium
                hover:opacity-90
                transition
              "
            >
              Pobierz nagranie
            </a>
          ) : (
            <DownloadButton messageId={message.id} />
          )}
        </div>

        <div className="max-w-xl mx-auto mt-16 text-center border-t border-white/10 pt-10">
          <p
            className="
              font-[var(--font-cormorant)]
              text-3xl
              md:text-4xl
              text-white
              mb-3
            "
          >
            A komu Ty chcesz powiedzieć coś ważnego?
          </p>

          <p className="text-gray-400 leading-relaxed mb-8">
            Nagraj wiadomość i wybierz moment, w którym ma wybrzmieć.
          </p>

          <a
            href="/"
            className="
              inline-block
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
            Stwórz własne Echo
          </a>
        </div>
      </div>
    </main>
  );
}