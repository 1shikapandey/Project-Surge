import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import { StartupSplashOverlay } from '@/components/StartupSplashOverlay';

export const metadata: Metadata = {
  title: 'SURGE | Urban Flood Intelligence',
  description: 'Real-time street-level flood depth prediction, drainage network simulation, and flood-safe routing for Indian metros.',
  keywords: ['Urban Flooding', 'Flood Nowcasting', 'Drainage Network', 'GIS Dashboard', 'Flood Routing', 'Flood Safety'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            // SURGE ships a single mid-tone ("Mist") theme. Any previously saved
            // light/dark/auto preference is ignored so returning visitors never get
            // a stale dark class.
            __html: `
              try {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
                document.documentElement.setAttribute('data-theme', 'light');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className="bg-slate-50 text-slate-900 antialiased min-h-screen font-sans text-base transition-colors duration-200"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <LanguageProvider>
            <StartupSplashOverlay />
            {children}
            <ChatbotWidget />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
