import { useState, useEffect } from 'react';
import axios from 'axios';
import { GlobalSEOSettings, PageSEO, SEOMetadata } from '../types';

export const useSEO = (pagePath?: string) => {
  const [globalSettings, setGlobalSettings] = useState<GlobalSEOSettings | null>(null);
  const [pageMetadata, setPageMetadata] = useState<SEOMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSEO = async () => {
      try {
        const globalRes = await axios.get('/api/seo/global');
        setGlobalSettings(globalRes.data);

        if (pagePath) {
          const pagesRes = await axios.get('/api/seo/pages');
          const pages = Array.isArray(pagesRes.data) ? pagesRes.data : [];
          const page = pages.find((p: PageSEO) => p.pagePath === pagePath);
          if (page) {
            setPageMetadata(page);
          }
        }
      } catch (error) {
        console.error('Error fetching SEO settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSEO();
  }, [pagePath]);

  return { globalSettings, pageMetadata, isLoading };
};
