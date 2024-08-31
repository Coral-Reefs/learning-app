import { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chatterbox",
  description: "A realtime chat app",
};

export const MetadataComponent = () => (
  <head>
    <title>{metadata.title?.toString()}</title>
    <meta name="description" content={metadata.description!} />
    {/* Add other meta tags as needed */}
  </head>
);
