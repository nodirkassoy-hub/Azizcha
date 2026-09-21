import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { dictionaries } from "@/content";
import { I18nProvider } from "@/lib/i18n";
import { OrderProvider } from "@/lib/order-context";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

/** Self-hosted Inter (Latin + Cyrillic). */
const inter = localFont({
  src: [
    { path: "./fonts/inter-latin-wght-normal.woff2", weight: "200 900", style: "normal" },
    { path: "./fonts/inter-cyrillic-wght-normal.woff2", weight: "200 900", style: "normal" },
  ],
  display: "swap",
  variable: "--font-sans",
  fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"],
});

/** Self-hosted Space Grotesk for display headings. */
const spaceGrotesk = localFont({
  src: [{ path: "./fonts/space-grotesk-latin-wght-normal.woff2", weight: "300 700", style: "normal" }],
  display: "swap",
  variable: "--font-display",
  fallback: ["var(--font-sans)", "system-ui", "sans-serif"],
});

const t = dictionaries.uz;

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  applicationName: "IZO PLUS",
  keywords: ["penaplast", "EPS", "izolyatsiya", "izoplast", "IZO PLUS"],
  openGraph: {
    title: t.meta.title,
    description: t.meta.description,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#040A14" },
    { media: "(prefers-color-scheme: light)", color: "#EEF4FB" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" data-theme="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <ThemeProvider>
          <I18nProvider>
            <OrderProvider>{children}</OrderProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
