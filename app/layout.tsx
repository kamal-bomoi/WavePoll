import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "../styles.css";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";
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
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <Providers>
          {children}
          <footer className="wave-footer">
            <a
              href="https://github.com/kamalyusuf/WavePoll"
              target="_blank"
              rel="noreferrer"
              aria-label="WavePoll GitHub repository"
              title="WavePoll GitHub repository"
            >
              <IconBrandGithub size={20} stroke={1.8} />
            </a>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
