import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "IRiS - Intelligent Real Estate Imaging System",
  description: "Profesjonell boligfotografering for moderne meglere",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="no">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
