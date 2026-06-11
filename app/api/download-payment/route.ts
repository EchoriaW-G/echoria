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
              name: "Zachowaj Echo na zawsze",
            },
            unit_amount: 599,
          },
          quantity: 1,
        },
      ],

      metadata: {
        messageId,
        type: "download",
      },

      success_url: `https://app.echoria.pl/message/${messageId}`,
      cancel_url: `https://app.echoria.pl/message/${messageId}`,
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