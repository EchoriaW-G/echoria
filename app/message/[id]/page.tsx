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
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center flex flex-col gap-6">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
          ECHORIA
        </p>

        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Masz wiadomość 💌
        </h1>

        {message.dedication && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-gray-300 italic text-lg">
              “{message.dedication}”
            </p>
          </div>
        )}

        <audio controls src={message.audio_url} className="w-full" />

        <p className="text-gray-500 text-sm">
          Dostarczone przez Echoria
        </p>
      </div>
    </main>
  );
}