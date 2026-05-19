import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const today = new Date().toISOString().split("T")[0];

    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("status", "paid")
      .lte("delivery_date", today);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({
        message: "Brak wiadomości do wysłania",
      });
    }

    for (const message of messages) {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: message.recipient_email,
        subject: "Masz wiadomość od Echoria 💌",
        html: `
          <h1>Masz nową wiadomość 💌</h1>
          <p>${message.dedication || ""}</p>
          <p>Odtwórz wiadomość:</p>
          <a href="${message.audio_url}">Odtwórz audio</a>
        `,
      });

      await supabase
        .from("messages")
        .update({ status: "sent" })
        .eq("id", message.id);
    }

    return NextResponse.json({
      success: true,
      sent: messages.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}