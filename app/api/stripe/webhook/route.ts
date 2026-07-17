import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Brak STRIPE_WEBHOOK_SECRET.");

    return NextResponse.json(
      { error: "Webhook nie jest skonfigurowany." },
      { status: 500 }
    );
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error("Webhook signature failed:", error);

    return NextResponse.json(
      { error: "Webhook signature failed" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const messageId = session.metadata?.messageId;
    const type = session.metadata?.type;

    if (!messageId) {
      console.error("Brak messageId w metadata:", session.id);

      return NextResponse.json({ received: true });
    }

    if (session.payment_status !== "paid") {
      console.log(
        "Sesja zakończona bez potwierdzonej płatności:",
        session.id
      );

      return NextResponse.json({ received: true });
    }

    if (type === "download") {
      const { error } = await supabase
        .from("messages")
        .update({
          download_unlocked: true,
        })
        .eq("id", messageId);

      if (error) {
        console.error("Download unlock error:", error);

        return NextResponse.json(
          { error: "Nie udało się odblokować pobrania." },
          { status: 500 }
        );
      }
    } else {
      const { error } = await supabase
        .from("messages")
        .update({
          status: "paid",
        })
        .eq("id", messageId);

      if (error) {
        console.error("Payment status update error:", error);

        return NextResponse.json(
          { error: "Nie udało się zatwierdzić płatności." },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}