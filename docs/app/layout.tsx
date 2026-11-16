import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import { CodeGroups } from "@/components/code-groups";
import { Provider } from "@/components/provider";
import { appName, ogImage, siteDescription, siteUrl } from "@/lib/shared";
import "./global.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-inter" });
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${appName}: accessible code tabs for rehype`,
    template: `%s | ${appName}`,
  },
  description: siteDescription,
  applicationName: appName,
  authors: [{ name: "Sohab Sk", url: "https://github.com/ITZSHOAIB" }],
  keywords: [
    "rehype",
    "rehype plugin",
    "code tabs",
    "code group",
    "markdown",
    "mdx",
    "astro",
    "satteri",
    "fumadocs",
    "accessibility",
  ],
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: appName,
    url: "/",
    title: appName,
    description: siteDescription,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description: siteDescription,
    images: [ogImage.url],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffaf5" },
    { media: "(prefers-color-scheme: dark)", color: "#120d0b" },
  ],
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        {/* Loads the rehype-code-group client and stylesheet for every page. */}
        <CodeGroups />
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
