import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Desktop } from "@/components/Desktop";
import { Ticker } from "@/components/Ticker";
import { Taskbar } from "@/components/Taskbar";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.seoDescription,
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.seoDescription,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.seoDescription,
  },
};

export const viewport: Viewport = {
  themeColor: "#4ea8e8",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Loaded at runtime rather than through next/font, which self-hosts
            at build time and so needs outbound network from the builder.
            Fredoka is also rasterised into the 3D wordmarks at runtime, so it
            has to be a font the browser actually has. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Cabin:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Desktop />
        <Ticker />
        <main
          style={{
            paddingTop: "var(--ticker-h)",
            paddingBottom: "calc(var(--taskbar-h) + 26px)",
          }}
        >
          {children}
        </main>
        <Taskbar />
      </body>
    </html>
  );
}
