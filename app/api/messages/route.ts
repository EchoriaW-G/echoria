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
type ShippingMethod = "locker" | "courier";


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
  frameColor?: "black" | "wood" | null;
  frameVariant?: "dedication" | "photo" | null;
framePhotoPath?: string | null;

  shippingName?: string | null;
  shippingPhone?: string | null;
  shippingAddress?: string | null;
  shippingPostcode?: string | null;
  shippingCity?: string | null;
  shippingMethod?: ShippingMethod | null;
  shippingPrice?: number;
};

const isValidEmail = (email: string) =>
  /\S+@\S+\.\S+/.test(email);

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
      frameColor,
      frameVariant,
framePhotoPath,
      shippingPhone,
      shippingAddress,
      shippingPostcode,
      shippingCity,
      shippingMethod,
      shippingPrice,
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
          {
            error:
              "Uzupełnij e-mail odbiorcy i termin dostarczenia.",
          },
          { status: 400 }
        );
      }

      if (
        smsNotification &&
        (!recipientPhone?.trim() ||
          !isValidPhone(recipientPhone))
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
        !isValidPhone(shippingPhone)
      ) {
        return NextResponse.json(
          { error: "Uzupełnij dane odbiorcy." },
          { status: 400 }
        );
      }

      if (
        shippingMethod !== "locker" &&
        shippingMethod !== "courier"
      ) {
        return NextResponse.json(
          { error: "Wybierz metodę dostawy." },
          { status: 400 }
        );
      }

      if (shippingMethod === "locker") {
        if (!shippingAddress?.trim()) {
          return NextResponse.json(
            { error: "Wybierz paczkomat." },
            { status: 400 }
          );
        }
      }

      if (shippingMethod === "courier") {
        if (
          !shippingAddress?.trim() ||
          !shippingPostcode?.trim() ||
          !shippingCity?.trim()
        ) {
          return NextResponse.json(
            { error: "Uzupełnij adres dostawy." },
            { status: 400 }
          );
        }
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
          isEcho && smsNotification
            ? recipientPhone!.trim()
            : null,

        sms_notification: isEcho && smsNotification,

        discount_code:
          discountCode?.trim().toUpperCase() || null,

        dedication: dedication?.trim() || null,

        delivery_date: isEcho ? deliveryDate : null,

        audio_url: audioUrl,
        status: "pending",
        product_type: productType,
        frame_color:
  productType === "frame"
    ? frameColor ?? "black"
    : null,
frame_variant:
  productType === "frame"
    ? frameVariant
    : null,

frame_photo_path:
  productType === "frame" &&
  frameVariant === "photo"
    ? framePhotoPath
    : null,
        shipping_name: isPhysicalProduct
          ? shippingName?.trim() || null
          : null,

        shipping_phone: isPhysicalProduct
          ? shippingPhone?.trim() || null
          : null,

        shipping_address: isPhysicalProduct
          ? shippingAddress?.trim() || null
          : null,

        shipping_postcode:
          isPhysicalProduct &&
          shippingMethod === "courier"
            ? shippingPostcode?.trim() || null
            : null,

        shipping_city:
          isPhysicalProduct &&
          shippingMethod === "courier"
            ? shippingCity?.trim() || null
            : null,

        shipping_method: isPhysicalProduct
          ? shippingMethod
          : null,

        shipping_price: isPhysicalProduct
          ? shippingPrice ?? 0
          : 0,
      })
      .select("id, public_token")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);

      return NextResponse.json(
        {
          error: "Nie udało się zapisać zamówienia.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        messageId: data.id,
        publicToken: data.public_token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create message error:", error);

    return NextResponse.json(
      {
        error: "Wystąpił błąd podczas zapisywania zamówienia.",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}