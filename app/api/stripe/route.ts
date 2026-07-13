import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { messageId } = await req.json();

    const { data: message, error } = await supabase
      .from("messages")
      .select("sms_notification, discount_code")
      .eq("id", messageId)
      .single();

    if (error || !message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    let amount = message.sms_notification
  ? 2099
  : 1900;

if (
  message.discount_code?.trim().toUpperCase() ===
  "PREMIERA"
) {
  amount = 0;
}
if (amount === 0) {
  await supabase
    .from("messages")
    .update({ status: "paid" })
    .eq("id", messageId);

  return NextResponse.json({
    url: "https://app.echoria.pl/payment-success",
  });
}

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "pln",
            product_data: {
              name: message.sms_notification
                ? "Echo + Powiadomienie SMS"
                : "Echo - Personalizowana Wiadomość Audio od Echorii",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],

      metadata: {
        messageId,
      },

      success_url: "https://app.echoria.pl/payment-success",
      cancel_url: "https://app.echoria.pl",
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Stripe error" },
      { status: 500 }
    );
  }
}