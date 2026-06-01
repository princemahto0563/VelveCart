export default function robots() {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://velvetcart.store';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/account', '/checkout', '/api/'],
      },
      {
        userAgent: 'Pinterestbot',
        allow: '/',
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
