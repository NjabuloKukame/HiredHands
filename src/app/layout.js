import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "./contexts/AuthContext";
import ClientLayout from "./components/ClientLayout/ClientLayout";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hired Hands",
  description:
    "Hired Hands is a premium service marketplace connecting customers with trusted, vetted professionals. Book high-quality services with confidence.",
  keywords: [
    "Hired Hands",
    "service marketplace",
    "hire professionals",
    "trusted service providers",
    "on-demand services",
    "premium service marketplace",
    "vetted professionals",
    "hire skilled workers",
    "professional services platform",
    "online service booking",
    "digital service marketplace",
    "verified experts",
    "reliable services",
    "smart hiring platform",
    "tech-enabled services"
  ],
  icons: {
    icon: "/hired-hands-logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}