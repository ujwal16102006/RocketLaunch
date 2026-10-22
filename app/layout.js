import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#070910",
};

export const metadata = {
  title: "RocketLaunch — Explore Beyond the Countdown",
  description:
    "A cinematic space-mission discovery platform tracking upcoming orbital launches worldwide with live countdowns, aerospace telemetry, and AI mission intelligence.",
  keywords: ["Rocket Launch", "Spaceflight", "ISRO", "NASA", "SpaceX", "Countdown", "Aerospace Telemetry"],
  authors: [{ name: "RocketLaunch Aerospace Systems Team" }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#070910] text-[#F3F7FC] selection:bg-[#65F6FF]/30 selection:text-[#65F6FF]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#65F6FF] focus:text-[#070910] focus:font-bold focus:rounded-md focus:shadow-lg"
        >
          Skip to main content
        </a>
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
