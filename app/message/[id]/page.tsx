import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

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
          className="w-[220px] md:w-[320px] mx-auto mb-10"
        />

        <p
          className="
            text-[#8f95ab]
            text-base
            md:text-lg
            font-light
            tracking-wide
            mb-12
          "
        >
          Twoje ECHO dotarło. Ta wiadomość czekała właśnie na ten moment.
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
          <audio
            controls
            src={message.audio_url}
            className="w-full"
          />
        </div>

        <p className="text-gray-500 text-sm tracking-wider">
          Dostarczone przez Echoria
        </p>
      </div>
    </main>
  );
}