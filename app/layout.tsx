import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <head>
        <link
          rel="stylesheet"
          href="https://geowidget.inpost.pl/inpost-geowidget.css"
        />
      </head>

      <body className={`${inter.variable} ${cormorant.variable}`}>
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject = t;

              var ttq = w[t] = w[t] || [];

              ttq.methods = [
                "page",
                "track",
                "identify",
                "instances",
                "debug",
                "on",
                "off",
                "once",
                "ready",
                "alias",
                "group",
                "enableCookie",
                "disableCookie",
                "holdConsent",
                "revokeConsent",
                "grantConsent"
              ];

              ttq.setAndDefer = function (t, e) {
                t[e] = function () {
                  t.push(
                    [e].concat(
                      Array.prototype.slice.call(arguments, 0)
                    )
                  );
                };
              };

              for (var i = 0; i < ttq.methods.length; i++) {
                ttq.setAndDefer(ttq, ttq.methods[i]);
              }

              ttq.instance = function (t) {
                for (
                  var e = ttq._i[t] || [],
                    n = 0;
                  n < ttq.methods.length;
                  n++
                ) {
                  ttq.setAndDefer(e, ttq.methods[n]);
                }

                return e;
              };

              ttq.load = function (e, n) {
                var r =
                  "https://analytics.tiktok.com/i18n/pixel/events.js";

                ttq._i = ttq._i || {};
                ttq._i[e] = [];
                ttq._i[e]._u = r;
                ttq._t = ttq._t || {};
                ttq._t[e] = +new Date();
                ttq._o = ttq._o || {};
                ttq._o[e] = n || {};

                var script = document.createElement("script");

                script.type = "text/javascript";
                script.async = true;
                script.src = r + "?sdkid=" + e + "&lib=" + t;

                var firstScript =
                  document.getElementsByTagName("script")[0];

                firstScript.parentNode.insertBefore(
                  script,
                  firstScript
                );
              };

              ttq.load("D91642BC77U2B9GAGSTG");
              ttq.page();
            }(window, document, "ttq");
          `}
        </Script>

        <Script
          src="https://geowidget.inpost.pl/inpost-geowidget.js"
          strategy="afterInteractive"
        />

        {children}
      </body>
    </html>
  );
}