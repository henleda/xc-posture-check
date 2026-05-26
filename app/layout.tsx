import type { Metadata } from "next";
import { PostHogProvider } from "@/components/posthog-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "XC Posture Check",
  description:
    "Map your external attack surface across every cloud and edge provider. Surface protection gaps. Co-branded reports for F5 field sellers.",
  metadataBase: new URL("https://f5evolution.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 antialiased">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
