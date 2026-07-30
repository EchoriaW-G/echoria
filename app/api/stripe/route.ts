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
      .select(`
  product_type,
  sms_notification,
  discount_code,
  status,
  shipping_method,
  shipping_price
`)
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

    const hasSms =
  productType === "echo" && message.sms_notification === true;

const shippingPrice = Number(message.shipping_price ?? 0);

const shippingMethod =
  message.shipping_method as "locker" | "courier" | null;
let productAmount = product.amount;
let productName = product.name;

if (hasSms) {
  productAmount += 199;
  productName += " + powiadomienie SMS";
}

const discountCode =
  message.discount_code?.trim().toUpperCase();

if (discountCode === "PREMIERA") {
  productAmount = 0;
}

if (productAmount === 0) {
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
}

const lineItems = [
  {
    price_data: {
      currency: "pln" as const,
      product_data: {
        name: productName,
      },
      unit_amount: productAmount,
    },
    quantity: 1,
  },
];

if (shippingPrice > 0) {
  lineItems.push({
    price_data: {
      currency: "pln",
      product_data: {
        name:
          shippingMethod === "locker"
            ? "Dostawa – Paczkomat InPost"
            : "Dostawa – Kurier",
      },
      unit_amount: shippingPrice,
    },
    quantity: 1,
  });
}
    const session = await stripe.checkout.sessions.create({
  mode: "payment",

  payment_method_types: ["card"],

  line_items: lineItems,

 metadata: {
  messageId: String(messageId),
  productType,
  shippingMethod: shippingMethod ?? "",
  shippingPrice: String(shippingPrice),
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