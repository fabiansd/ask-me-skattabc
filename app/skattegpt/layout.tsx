import Link from "next/link"
import NavBar from "../components/navbar"
import EsHealth from "../components/esPingHealth"

export default function SearchLayout({
    children, // will be a page or nested layout
  }: {
    children: React.ReactNode
  }) {
    return (
      <section>
        <div className="p-10 mb-10 text-center ">
          <Link href="/skattegpt">
            <div className="flex justify-between items-center px-4">
              <div className="flex-grow text-center">
                <h1 className="text-4xl font-bold inline-block">Velkommen til SkatteGPT</h1>
              </div>
              <EsHealth/>
            </div>
          </Link>
          <p className="mt-2 text-lg text-gray-700">En chatbot som kan alt om skatteABC</p>
        </div>
        {children}
      </section>
    )
  }