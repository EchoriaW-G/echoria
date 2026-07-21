import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type ProductType = "echo" | "gift" | "frame";

const PRODUCTS: Record<
  ProductType,
  {
    name: string;
    amount: number;
  }
> = {
  echo: {
    name: "Echo – personalizowana wiadomość audio",
    amount: 1900,
  },
  gift: {
    name: "Echo Gift – zawieszka z kodem QR",
    amount: 4900,
  },
  frame: {
    name: "Echo Frame – personalizowana ramka z kodem QR",
    amount: 8900,
  },
};

export async function POST(req: NextRequest) {
  try {
    const { messageId } = await req.json();

    if (!messageId) {
      return NextResponse.json(
        { error: "Brak identyfikatora zamówienia." },
        { status: 400 }
      );
    }

    const { data: message, error } = await supabase
      .from("messages")
      .select("product_type, sms_notification, discount_code, status")
      .eq("id", messageId)
      .single();

    if (error || !message) {
      return NextResponse.json(
        { error: "Nie znaleziono zamówienia." },
        { status: 404 }
      );
    }

    if (message.status === "paid") {
  const productType = message.product_type as ProductType;

  return NextResponse.json({
    url: `https://app.echoria.pl/payment-success?product_type=${productType}`,
  });
}

    const productType = message.product_type as ProductType;
    const product = PRODUCTS[productType];

    if (!product) {
      return NextResponse.json(
        { error: "Nieprawidłowy typ produktu." },
        { status: 400 }
      );
    }

    let amount = product.amount;
    let productName = product.name;

    const hasSms =
      productType === "echo" && message.sms_notification === true;

    if (hasSms) {
      amount += 199;
      productName += " + powiadomienie SMS";
    }

    const discountCode = message.discount_code
      ?.trim()
      .toUpperCase();

    if (discountCode === "PREMIERA") {
      amount = 0;
    }

    if (amount === 0) {
  const { error: updateError } = await supabase
    .from("messages")
    .update({ status: "paid" })
    .eq("id", messageId);

  if (updateError) {
    console.error("Supabase update error:", updateError);

    return NextResponse.json(
      { error: "Nie udało się zatwierdzić zamówienia." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    url: `https://app.echoria.pl/payment-success?product_type=${productType}`,
  });


      return NextResponse.json({
        url: "https://app.echoria.pl/payment-success",
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "pln",
            product_data: {
              name: productName,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],

      metadata: {
        messageId: String(messageId),
        productType,
      },

      success_url:
        "https://app.echoria.pl/payment-success?session_id={CHECKOUT_SESSION_ID}",

      cancel_url: "https://app.echoria.pl",
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe nie zwrócił adresu płatności." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe route error:", error);

    return NextResponse.json(
      { error: "Wystąpił błąd podczas tworzenia płatności." },
      { status: 500 }
    );
  }
}