import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SEOMetadata } from '../../types';

interface SEOProps {
  metadata?: SEOMetadata;
  defaultMetadata?: SEOMetadata;
}

const SEO: React.FC<SEOProps> = ({ metadata, defaultMetadata }) => {
  const seo = {
    title: metadata?.title || defaultMetadata?.title || 'Tayfa - Luxury Fashion',
    description: metadata?.description || defaultMetadata?.description || 'Discover luxury fashion trends.',
    keywords: metadata?.keywords || defaultMetadata?.keywords || 'fashion, luxury',
    canonicalUrl: metadata?.canonicalUrl || defaultMetadata?.canonicalUrl || '',
    ogImage: metadata?.ogImage || defaultMetadata?.ogImage || '',
    robots: metadata?.robots || defaultMetadata?.robots || 'index, follow',
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      <meta name="robots" content={seo.robots} />
      {seo.canonicalUrl && <link rel="canonical" href={seo.canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      {seo.ogImage && <meta property="og:image" content={seo.ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      {seo.ogImage && <meta name="twitter:image" content={seo.ogImage} />}

      {/* Structured Data */}
      {metadata?.structuredData && (
        <script type="application/ld+json">
          {metadata.structuredData}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
