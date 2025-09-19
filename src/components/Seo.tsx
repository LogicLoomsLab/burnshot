// src/components/Seo.tsx
import Head from "next/head";

type SeoProps = {
  title: string;
  description: string;
  url: string;
  image?: string;
};

export default function Seo({ title, description, url, image }: SeoProps) {
  const defaultImage = image || "/burnshot-og.png"; // put an image in public/ folder

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={defaultImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={defaultImage} />
    </Head>
  );
}