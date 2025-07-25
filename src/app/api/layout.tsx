// Dette gjør ALLE API routes dynamiske
export const dynamic = 'force-dynamic'

export default function ApiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}