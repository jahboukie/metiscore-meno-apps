// packages/apps/partner-support/src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./components/auth-provider"; // Import AuthProvider
import { AuthButton } from "./components/auth-button";   // Import AuthButton
import { PrivacyButton } from "./components/privacy-button"; // Import PrivacyButton

export const metadata: Metadata = {
  title: "Metiscore Partner Support",
  description: "Supporting your partner's wellness journey.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50">
        <AuthProvider>
           <nav className="bg-white shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-slate-800 mr-8">
                    Partner Support
                  </span>
                  <div className="hidden md:flex items-center space-x-6">
                    <a href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                      Dashboard
                    </a>
                    <a href="/learn" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                      Learn
                    </a>
                    <a href="/learn/faq" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                      FAQ
                    </a>
                    <a href="/learn/support-guide" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                      Support Guide
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <PrivacyButton />
                  <AuthButton />
                </div>
              </div>
            </div>
          </nav>
          <main>
             <div className="max-w-4xl mx-auto py-8 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
