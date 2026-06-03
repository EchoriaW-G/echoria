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
    const now = new Date().toISOString();

    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("status", "paid")
      .lte("delivery_date", now);

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
        from: "Echoria <kontakt@echoria.pl>",
        to: message.recipient_email,

        subject: message.sender_name
          ? `${message.sender_name} przesyła Ci Echo 💌`
          : "Masz wiadomość od Echoria",

        html: `
          <div
            style="
              background:#000000;
              padding:40px 16px;
              text-align:center;
              font-family:Arial,sans-serif;
            "
          >
            <div
              style="
                max-width:640px;
                margin:0 auto;
              "
            >

              <img
                src="https://app.echoria.pl/logo2.png"
                alt="Echoria"
                style="
                  width:180px;
                  max-width:80%;
                  display:block;
                  margin:0 auto 30px auto;
                "
              />

              <h1
                style="
                  margin:0 0 20px 0;
                  color:#ffffff;
                  font-family:Georgia,serif;
                  font-size:34px;
                  font-weight:300;
                  line-height:1.15;
                "
              >
                ${
                  message.sender_name
                    ? `${message.sender_name} przesyła Ci Echo`
                    : "Masz wiadomość"
                }
              </h1>

              <p
                style="
                  color:#8f95ab;
                  font-size:18px;
                  line-height:1.7;
                  margin:0 auto 30px auto;
                "
              >
                Ta wiadomość czekała właśnie na ten moment.
              </p>

              ${
                message.dedication
                  ? `
                    <div
                      style="
                        background:#050505;
                        border:1px solid rgba(255,255,255,.08);
                        border-radius:24px;
                        padding:24px;
                        margin:24px 0;
                      "
                    >
                      <p
                        style="
                          margin:0;
                          color:#e5e7eb;
                          font-size:24px;
                          line-height:1.5;
                          font-style:italic;
                          font-family:Georgia,serif;
                        "
                      >
                        "${message.dedication}"
                      </p>
                    </div>
                  `
                  : ""
              }

              <a
                href="https://app.echoria.pl/message/${message.id}"
                style="
                  display:block;
                  width:100%;
                  max-width:320px;
                  box-sizing:border-box;
                  margin:30px auto 0 auto;
                  padding:18px 24px;
                  background:#ffffff;
                  color:#000000;
                  text-decoration:none;
                  border-radius:18px;
                  font-size:18px;
                  font-weight:600;
                "
              >
                Otwórz wiadomość
              </a>

              <p
                style="
                  margin-top:40px;
                  color:#6b7280;
                  font-size:13px;
                "
              >
                Dostarczone przez Echoria
              </p>

            </div>
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