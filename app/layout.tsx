import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { DataProvider } from "@/context/DataContext";
import { DetailsModal } from "@/components/DetailsModal";

export const metadata: Metadata = {
  title: "Balanomicón - Enter the Gungeon Wiki",
  description: "Interactive encyclopedia for Enter the Gungeon",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <DataProvider>
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
          <DetailsModal />
        </DataProvider>
        <Analytics />
      </body>
    </html>
  )
}
