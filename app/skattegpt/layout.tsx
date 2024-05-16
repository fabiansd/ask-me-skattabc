import Link from "next/link"
import EsHealth from "../components/esPingHealth"

export default function SearchLayout({
    children, // will be a page or nested layout
  }: {
    children: React.ReactNode
  }) {
    return (
      <section>
        {children}
      </section>
    )
  }