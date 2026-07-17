import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Brak session_id" },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const rawProductType = session.metadata?.productType;

    console.log("Stripe session metadata:", session.metadata);
    console.log("Product type:", rawProductType);

    return NextResponse.json(
      {
        productType: rawProductType ?? null,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Błąd pobierania sesji Stripe:", error);

    return NextResponse.json(
      { error: "Nie udało się pobrać sesji Stripe." },
      { status: 500 }
    );
  }
}