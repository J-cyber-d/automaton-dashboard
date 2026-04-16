'use client';

import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { ConnectionStatus } from "@/components/common/ConnectionStatus";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// Client wrapper for document title hook
function DocumentTitleWrapper() {
  useDocumentTitle();
  return null;
}

function RootLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WebSocketProvider>
      <DocumentTitleWrapper />
      <div className="flex min-h-screen">
        {/* Sidebar - fixed width on desktop, hidden on mobile */}
        <AppSidebar />
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 md:ml-0">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
      <ConnectionStatus />
    </WebSocketProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className={`${inter.variable} ${jetbrainsMono.variable} min-h-full font-sans`}>
        <RootLayoutContent>{children}</RootLayoutContent>
      </body>
    </html>
  );
}
