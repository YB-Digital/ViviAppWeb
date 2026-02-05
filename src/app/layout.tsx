import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/components/providers/user-provider";

export const metadata: Metadata = {
  title: "VIVI - Beauty • Aesthetics • Academy",
  description: "VIVI Beauty & Aesthetics Academy - Learn the art of beauty",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white min-h-screen">
       <UserProvider>
         {children}
       </UserProvider>
      </body>
    </html>
  );
}
