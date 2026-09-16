import type { Metadata, Viewport } from "next";
import { Anek_Latin, Castoro, Castoro_Titling, Tiro_Kannada } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

const titling = Castoro_Titling({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-castoro-titling",
  display: "swap",
});

const castoro = Castoro({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-castoro",
  display: "swap",
});

const anek = Anek_Latin({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-anek",
  display: "swap",
});

const tiroKannada = Tiro_Kannada({
  weight: "400",
  subsets: ["kannada"],
  variable: "--font-tiro-kannada",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kalaverse — Culture on Their Terms",
    template: "%s | Kalaverse",
  },
  description:
    "The digital ownership and consent layer for cultural tourism. Discover Karnataka through the people who preserve it, with their consent, context and control.",
};

export const viewport: Viewport = {
  themeColor: "#110d0b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${titling.variable} ${castoro.variable} ${anek.variable} ${tiroKannada.variable}`}
    >
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
