import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "react-medium-image-zoom/dist/styles.css";
import "../styles.css";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Providers } from "./providers";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "WavePoll"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      {...mantineHtmlProps}
      suppressHydrationWarning
      className={manrope.className}
    >
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
