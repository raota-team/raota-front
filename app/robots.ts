import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/mypage', '/register', '/auth/'], // 개인정보나 인증 관련 페이지는 제외
    },
    sitemap: 'https://www.raota.net/sitemap.xml',
  };
}
