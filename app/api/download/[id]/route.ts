import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: message } = await supabase
    .from("messages")
    .select("audio_url, download_unlocked")
    .eq("id", id)
    .single();

  if (!message || !message.download_unlocked) {
    return new NextResponse("Forbidden", {
      status: 403,
    });
  }

  const fileResponse = await fetch(message.audio_url);

  const fileBuffer = await fileResponse.arrayBuffer();

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "audio/mp4",
      "Content-Disposition":
        'attachment; filename="echo.mp4"',
    },
  });
}