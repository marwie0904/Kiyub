import type { Metadata, Viewport } from "next";
import { Noticia_Text, Merriweather } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import { ThemeProvider } from "./providers/theme-provider";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { Toaster } from "sonner";

const noticiaText = Noticia_Text({
  subsets: ["latin"],
  weight: ["400", "700"]
});

export const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-merriweather"
});

export const metadata: Metadata = {
  title: "aipanghighesthonors",
  description: "AI-powered chat interface",
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${noticiaText.className} ${merriweather.variable}`}>
        <PostHogProvider>
          <ThemeProvider defaultTheme="system" storageKey="chat-app-theme">
            <ConvexClientProvider>{children}</ConvexClientProvider>
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
