import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ParcelTime — 2030 Spatial Logistics & Parcel Management',
  description:
    'A futuristic residential parcel reception and scheduled-delivery intelligence platform for modern gated communities.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0D0101] text-[#FFFAFA] antialiased min-h-screen relative overflow-x-hidden selection:bg-primary/30 selection:text-white">
        {/* Subtle Background Grid Texture across whole screen (6-8% opacity) */}
        <div className="fixed inset-0 bg-grid-texture opacity-80 pointer-events-none z-0" />

        {/* Soft Radial Ambient Corner Glows (Orange, Purple, Blue) */}
        <div className="fixed -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#FF5D00]/[0.07] blur-[140px] pointer-events-none z-0" />
        <div className="fixed -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#9333EA]/[0.06] blur-[140px] pointer-events-none z-0" />
        <div className="fixed -bottom-40 right-1/4 w-[700px] h-[700px] rounded-full bg-[#3B82F6]/[0.05] blur-[160px] pointer-events-none z-0" />

        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}

