import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { messageId } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "pln",
            product_data: {
              name: "Echo - Personalizowana Wiadomość Audio od Echorii",
            },
            unit_amount: 3900,
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