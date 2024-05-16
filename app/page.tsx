

export default function Home() {

    return (
        <div className="relative p-10 mb-10 text-center">
              <h1 className="text-4xl font-bold inline-block">Velkommen til Skatt-GPT!</h1>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
              </div>
          <p className="mt-10 px-40 text-lg">Dette er en chatbot som bruker se nyeste Ai modellene fra openAI og leser fra nyeste versjon av skatte-ABC som publiseres årlig av Skatteetaten. Se offesielle Skatte-ABC her.</p>
          <p className="mt-10 px-40 text-lg">Du kan spørre om alt mulig som er relatert til skatt, chatboten takler både spesifikke og åpne spørsmpl. God fornøyelse!</p>
        </div>
    );
}