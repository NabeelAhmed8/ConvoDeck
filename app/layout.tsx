import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastContainer } from "@/components/ui/ToastContainer";

export const metadata: Metadata = {
  title: "ConvoDeck | WhatsApp CRM & Visual Sales Pipeline",
  description:
    "Unified multi-agent WhatsApp inbox and visual sales pipeline for high-performing sales teams, agencies, and businesses.",
  keywords: [
    "WhatsApp CRM",
    "Multi-agent WhatsApp",
    "Sales Pipeline",
    "Sales Pipeline CRM",
    "Meta Cloud API",
    "Shared WhatsApp Inbox",
  ],
  authors: [{ name: "ConvoDeck Team" }],
  applicationName: "ConvoDeck",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="bg-[#f3f6fa]"
      data-scroll-behavior="smooth"
    >
      <body
        className="antialiased min-h-dvh bg-[#f3f6fa] text-slate-900 m-0 p-0"
        suppressHydrationWarning
      >
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
