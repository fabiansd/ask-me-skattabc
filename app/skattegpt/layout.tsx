import Link from "next/link"
import EsHealth from "../components/esPingHealth"

export default function SearchLayout({
    children, // will be a page or nested layout
  }: {
    children: React.ReactNode
  }) {
    return (
      <section>
        <div className="relative p-10 mb-10 text-center">
          <Link href="/skattegpt">
            <div className="relative">
              <h1 className="text-4xl font-bold inline-block">SkatteGPT</h1>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                <EsHealth />
              </div>
            </div>
          </Link>
          <p className="mt-2 text-lg text-gray-700">En chatbot som kan alt om skatteABC</p>
        </div>
        {children}
      </section>
    )
  }