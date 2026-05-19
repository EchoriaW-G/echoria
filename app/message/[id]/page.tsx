import { createClient } from "@supabase/supabase-js";

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

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </main>
    );
  }

  if (!message) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Message not found
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center flex flex-col gap-6">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
          ECHORIA
        </p>

        <h1 className="text-4xl font-bold">
          Masz wiadomość 💌
        </h1>

        {message.dedication && (
          <div className="bg-white/5 rounded-2xl p-6">
            <p className="italic">"{message.dedication}"</p>
          </div>
        )}

        <audio controls src={message.audio_url} className="w-full" />
      </div>
    </main>
  );
}