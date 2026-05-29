export const metadata: Metadata = {
  metadataBase: new URL("https://app.echoria.pl"),

  title: "Echoria",
  description: "Nagrywaj wiadomości, które wybrzmią we właściwym momencie.",

  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },

  openGraph: {
    title: "Echoria",
    description:
      "Nagrywaj wiadomości, które wybrzmią we właściwym momencie.",
    url: "https://app.echoria.pl",
    siteName: "Echoria",
    images: [
      {
        url: "https://app.echoria.pl/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Echoria",
      },
    ],
    locale: "pl_PL",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Echoria",
    description:
      "Nagrywaj wiadomości, które wybrzmią we właściwym momencie.",
    images: ["https://app.echoria.pl/opengraph-image.png"],
  },
};