import { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';

import './globals.css';

import Header from './src/components/navigation/header';
import SessionWrapper from './src/components/providers/SessionWrapper';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Optimalskatt — AI-drevet skatterettslig assistanse',
  description:
    'En profesjonell skatteassistent som kjenner norsk skatterett. Få presise, kildebelagte svar på komplekse skattespørsmål.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nb"
      data-theme="optimalskatt"
      className={`${inter.variable} ${fraunces.variable}`}
    >
      <body className="min-h-[100dvh] flex flex-col bg-base-100 text-base-content antialiased">
        <a href="#main-content" className="skip-to-content">
          Hopp til innhold
        </a>
        <SessionWrapper>
          <Header />
          <main id="main-content" className="flex-grow flex flex-col">
            {children}
          </main>
        </SessionWrapper>
      </body>
    </html>
  );
}
