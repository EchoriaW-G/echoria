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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #000; color: #fff; text-align: center;">
            <p style="letter-spacing: 0.3em; font-size: 12px; color: #888;">
              ECHORIA
            </p>

            <h1 style="font-size: 36px; margin: 20px 0;">
              Masz wiadomość 💌
            </h1>

            ${
              message.dedication
                ? `
              <div style="background: rgba(255,255,255,0.06); padding: 24px; border-radius: 16px; margin: 24px 0;">
                <p style="font-style: italic; color: #ddd; font-size: 18px;">
                  "${message.dedication}"
                </p>
              </div>
            `
                : ""
            }

            <a
              href="https://echoria.vercel.app/message/${message.id}"
              style="
                display:inline-block;
                margin-top:24px;
                padding:16px 28px;
                background:#fff;
                color:#000;
                text-decoration:none;
                border-radius:12px;
                font-weight:bold;
              "
            >
              Otwórz wiadomość
            </a>

            <p style="margin-top:40px; font-size:12px; color:#666;">
              Dostarczone przez Echoria
            </p>
          </div>
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