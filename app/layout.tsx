import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CurrencyProvider } from "@/lib/currency";
import { ConsoleProvider } from "@/lib/console-context";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RELAY — Autonomous Voice Operations Platform | AI Telephony & Smart Routing",
    template: "%s | RELAY Voice Operations"
  },
  description: "RELAY is the enterprise autonomous voice operations platform powered by CALL-E. Intercept missed calls, automate outbound campaigns, and route customer conversations into verified outcomes with sub-14s latency and native multilingual AI.",
  keywords: [
    "autonomous voice operations",
    "AI phone answering system",
    "CALL-E voice agent",
    "enterprise telephony AI",
    "missed call revenue recovery",
    "multilingual voice AI",
    "inbound call overflow",
    "outbound batch dialing",
    "smart PBX switchboard",
    "multi-location customer operations"
  ],
  authors: [{ name: "RELAY Telephony Engineering" }],
  creator: "RELAY",
  publisher: "RELAY Voice Operations",
  metadataBase: new URL("https://relay.operations.ai"),
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://relay.operations.ai",
    siteName: "RELAY Voice Operations",
    title: "RELAY — Autonomous Voice Operations Platform | Every Call Reaches the Right Outcome",
    description: "Enterprise voice operations platform that intercepts, understands, and acts on customer calls at scale with zero hold time and multi-branch routing.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "RELAY — Autonomous Voice Operations Platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "RELAY — Autonomous Voice Operations Platform",
    description: "Every call reaches the right outcome. Zero hold times, multilingual voice AI, and automated batch dialing on CALL-E.",
    images: ["/logo.png"],
    creator: "@RelayVoiceOps"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico" }
    ],
    shortcut: "/favicon.png",
    apple: "/apple-touch-icon.png"
  }
};

import { JudgeTourModal } from "@/components/JudgeTourModal";
import { Preloader } from "@/components/Preloader";

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "RELAY Voice Operations",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, Cloud Telephony",
    "description": "Enterprise autonomous voice operations platform for inbound call overflow, multi-language conversational AI, and scheduled outreach campaigns on CALL-E.",
    "offers": {
      "@type": "Offer",
      "price": "299.00",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Sub-14s Zero-Latency SIP Intercept",
      "Multilingual Voice in Hindi, Nepali, Spanish, and English",
      "Excel Batch Dialing & Scheduled Recall Engine",
      "Structured CRM and Database Synchronization",
      "Role-Based Access Control and Department Routing",
      "Google Calendar Two-Way Sync with Zero-Leakage Privacy"
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#FAFAF8] dark:bg-[#081426] text-[#0B1930] dark:text-[#F8FAFC] antialiased selection:bg-[#1B9A9C]/20"
      >
        <ThemeProvider>
          <CurrencyProvider>
            <ConsoleProvider>
              <Preloader />
              {children}
              <JudgeTourModal />
            </ConsoleProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
