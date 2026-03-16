import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import SessionInitializer from "../components/common/SessionInitializer";
import ThemeWrapper from "../components/common/ThemeWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Testing Assistant | AI-Powered Testing Platform",
  description: "Automate your testing workflow with AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeWrapper>
          <div className="min-h-screen flex flex-col">
            <SessionInitializer>
              <main className="flex-1">{children}</main>
            </SessionInitializer>
          </div>
          <Toaster position="top-right" />
        </ThemeWrapper>
      </body>
    </html>
  );
}
