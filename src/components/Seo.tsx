// src/components/Seo.tsx
import Head from "next/head";

interface SeoProps {
  title: string;
  description: string;
  url: string;
  image?: string; // We will default to a branded OG image
}

export default function Seo({ 
  title, 
  description, 
  url, 
  image = "https://burnshot.app/social-preview.jpg" 
}: SeoProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Canonical Tag: Forces Google to only index burnshot.app */}
      <link rel="canonical" href={url.split('?')[0]} />

      {/* Open Graph (WhatsApp, iMessage, LinkedIn, Discord) */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Theme Color for mobile browsers */}
      <meta name="theme-color" content="#ff3b3b" />
    </Head>
  );
}