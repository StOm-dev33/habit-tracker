'use client';

import './globals.css';
import ServiceWorkerRegistrar from '@/components/shared/ServiceWorkerRegistrar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <title>Habit Tracker</title>
        <meta name="description" content="Track your daily habits and build streaks" />
      </head>
      <body>
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
