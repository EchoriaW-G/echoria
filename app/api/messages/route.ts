import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

type ProductType = "echo" | "gift" | "frame";

type CreateMessageBody = {
  senderName: string;
  senderEmail: string;
  recipientName: string;
  recipientEmail?: string | null;
  recipientPhone?: string | null;
  smsNotification?: boolean;
  discountCode?: string | null;
  dedication?: string | null;
  deliveryDate?: string | null;
  audioUrl: string;
  productType: ProductType;
  shippingName?: string | null;
  shippingPhone?: string | null;
  shippingAddress?: string | null;
  shippingPostcode?: string | null;
  shippingCity?: string | null;
};

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

const isValidPhone = (phone: string) =>
  /^\+?[0-9]{9,15}$/.test(phone.replace(/\s/g, ""));

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateMessageBody;

    const {
      senderName,
      senderEmail,
      recipientName,
      recipientEmail,
      recipientPhone,
      smsNotification = false,
      discountCode,
      dedication,
      deliveryDate,
      audioUrl,
      productType,
      shippingName,
      shippingPhone,
      shippingAddress,
      shippingPostcode,
      shippingCity,
    } = body;

    if (!["echo", "gift", "frame"].includes(productType)) {
      return NextResponse.json(
        { error: "Nieprawidłowy typ produktu." },
        { status: 400 }
      );
    }

    if (
      !senderName?.trim() ||
      !senderEmail?.trim() ||
      !isValidEmail(senderEmail) ||
      !recipientName?.trim() ||
      !audioUrl?.trim()
    ) {
      return NextResponse.json(
        { error: "Brakuje wymaganych danych zamówienia." },
        { status: 400 }
      );
    }

    const isEcho = productType === "echo";
    const isPhysicalProduct = !isEcho;

    if (isEcho) {
      if (
        !recipientEmail?.trim() ||
        !isValidEmail(recipientEmail) ||
        !deliveryDate
      ) {
        return NextResponse.json(
          { error: "Uzupełnij e-mail odbiorcy i termin dostarczenia." },
          { status: 400 }
        );
      }

      if (
        smsNotification &&
        (!recipientPhone?.trim() || !isValidPhone(recipientPhone))
      ) {
        return NextResponse.json(
          { error: "Podaj poprawny numer telefonu odbiorcy." },
          { status: 400 }
        );
      }
    }

    if (isPhysicalProduct) {
      if (
        !shippingName?.trim() ||
        !shippingPhone?.trim() ||
        !isValidPhone(shippingPhone) ||
        !shippingAddress?.trim() ||
        !shippingPostcode?.trim() ||
        !shippingCity?.trim()
      ) {
        return NextResponse.json(
          { error: "Uzupełnij poprawnie wszystkie dane wysyłkowe." },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from("messages")
      .insert({
        sender_name: senderName.trim(),
        sender_email: senderEmail.trim().toLowerCase(),
        recipient_name: recipientName.trim(),

        recipient_email: isEcho
          ? recipientEmail!.trim().toLowerCase()
          : null,

        recipient_phone:
          isEcho && smsNotification ? recipientPhone!.trim() : null,

        sms_notification: isEcho && smsNotification,

        discount_code: discountCode?.trim().toUpperCase() || null,
        dedication: dedication?.trim() || null,

        delivery_date: isEcho ? deliveryDate : null,

        audio_url: audioUrl,
        status: "pending",
        product_type: productType,

        shipping_name: isPhysicalProduct ? shippingName!.trim() : null,
        shipping_phone: isPhysicalProduct ? shippingPhone!.trim() : null,
        shipping_address: isPhysicalProduct
          ? shippingAddress!.trim()
          : null,
        shipping_postcode: isPhysicalProduct
          ? shippingPostcode!.trim()
          : null,
        shipping_city: isPhysicalProduct ? shippingCity!.trim() : null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);

      return NextResponse.json(
        { error: "Nie udało się zapisać zamówienia." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        messageId: data.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create message error:", error);

    return NextResponse.json(
      { error: "Wystąpił błąd podczas zapisywania zamówienia." },
      { status: 500 }
    );
  }
}