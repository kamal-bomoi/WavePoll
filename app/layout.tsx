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
  title: {
    default: "WavePoll - Realtime polls without signup",
    template: "%s | WavePoll"
  },
  description:
    "Create, share, and track realtime polls with no account required."
};

/**
 * Root layout component that configures the document HTML and wraps page content with global providers and analytics.
 *
 * Renders the top-level HTML structure (html/head/body), applies Mantine HTML props and the Manrope font class, includes color-scheme script, favicon, and viewport meta, and places the app content inside global Providers with Vercel Analytics.
 *
 * @param children - The page content to render inside the global providers
 * @returns The root HTML element containing the app's head and body
 */
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
