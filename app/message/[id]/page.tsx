import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import AudioPlayer from "@/app/components/AudioPlayer";

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

        <div className="flex flex-col items-center gap-6">
  <p className="text-gray-500 text-sm tracking-wider">
    Dostarczone przez Echoria
  </p>

  <a
    href="https://app.echoria.pl"
    className="
      inline-block
      px-8
      py-3
      bg-white
      text-black
      rounded-2xl
      font-medium
      tracking-wide
      hover:opacity-90
      transition
    "
  >
    Stwórz własne ECHO
  </a>
</div>
      </div>
    </main>
  );
}