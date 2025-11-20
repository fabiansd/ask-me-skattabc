import { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';

import Header from './src/components/navigation/header';
import SessionWrapper from './src/components/providers/SessionWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Optimalskatt',
  description: 'AI skatteagent som kan norske skattelover',
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
    <html lang="en" data-theme="dark">
      <body
        className={`${inter.className} min-h-screen flex flex-col`}
        style={{ overscrollBehavior: 'none' }}
      >
        <SessionWrapper>
          <Header />
          <main className="flex-grow">{children}</main>
        </SessionWrapper>
      </body>
    </html>
  );
}
