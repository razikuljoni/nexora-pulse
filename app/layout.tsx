import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Nexora Pulse - IoT Device Intelligence & Automation Platform',
  description: 'Industrial-grade full-stack IoT platform for real-time telemetry streaming, digital twins, automation rules, and ESP32 fleet control.',
  openGraph: {
    title: 'Nexora Pulse - IoT Device Intelligence & Automation Platform',
    description: 'Industrial-grade full-stack IoT platform for real-time telemetry streaming, digital twins, automation rules, and ESP32 fleet control.',
    type: 'website',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
