import { Space_Grotesk, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const sansFont = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
});

const monoFont = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'AI Clip Generator',
  description: 'Turn long-form video into the clips worth posting.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${sansFont.variable} ${monoFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
