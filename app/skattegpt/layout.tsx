import Link from "next/link"
import NavBar from "../components/navbar"

export default function SearchLayout({
    children, // will be a page or nested layout
  }: {
    children: React.ReactNode
  }) {
    return (
      <section>
        <div className="p-10 mb-10 text-center ">
          <Link href="/skattegpt">
            <h1 className="text-4xl font-bold">Velkommen til SkatteGPT</h1>
          </Link>
          <p className="mt-2 text-lg text-gray-700">En chatbot som kan alt om skatteABC</p>
        </div>
        {children}
      </section>
    )
  }