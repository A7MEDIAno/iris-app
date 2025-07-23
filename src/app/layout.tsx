import type { Metadata } from "next"

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
      <body>{children}</body>
    </html>
  )
}