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
        from: "kontakt@echoria.pl",
        to: message.recipient_email,

        subject: message.sender_name
          ? `${message.sender_name} przesyła Ci Echo`
          : "Masz wiadomość od Echoria",

        html: `
          <div
            style="
              background:#000000;
              padding:60px 20px;
              text-align:center;
              font-family:Arial,sans-serif;
            "
          >
            <div
              style="
                max-width:700px;
                margin:0 auto;
              "
            >

              <img
                src="https://app.echoria.pl/logo2.png"
                alt="Echoria"
                style="
                  width:260px;
                  max-width:80%;
                  display:block;
                  margin:0 auto 50px auto;
                "
              />

              <h1
                style="
                  margin:0 0 24px 0;
                  color:#ffffff;
                  font-family:Georgia,serif;
                  font-size:64px;
                  font-weight:300;
                  line-height:1.1;
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
                  font-size:22px;
                  line-height:1.8;
                  margin:0 auto 50px auto;
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
                        border-radius:28px;
                        padding:36px;
                        margin:40px 0;
                      "
                    >
                      <p
                        style="
                          margin:0;
                          color:#e5e7eb;
                          font-size:32px;
                          line-height:1.6;
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
                  display:inline-block;
                  margin-top:20px;
                  padding:20px 42px;
                  background:#ffffff;
                  color:#000000;
                  text-decoration:none;
                  border-radius:18px;
                  font-size:20px;
                  font-weight:600;
                "
              >
                Otwórz wiadomość
              </a>

              <p
                style="
                  margin-top:60px;
                  color:#6b7280;
                  font-size:14px;
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