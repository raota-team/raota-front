import { Metadata } from 'next';
import { getRamenShopDetail } from '@/lib/api/ramen-shops';
import ShopDetailClient from './ShopDetailClient';
import type { Shop } from '@/app/types';

interface Props {
  params: Promise<{ id: string }>;
}

const SITE_URL = 'https://www.raota.net';

const compactText = (value: string) => value.replace(/\s+/g, ' ').trim();

const getShopTitle = (shop: Shop) =>
  compactText([shop.name, shop.branch_name].filter(Boolean).join(' '));

const getShopDescription = (shop: Shop) => {
  const location = shop.location || shop.address || '국내';
  const shopDescription = compactText(shop.description).slice(0, 90);

  return compactText(
    `${location} 라멘 맛집 ${shop.name}. ${shop.type} 일본라멘, 대표 메뉴와 후기, 영업정보를 라오타(RAOTA) 라멘 지도에서 확인해보세요. ${shopDescription}`,
  );
};

const getShopKeywords = (shop: Shop) => {
  const menuNames = shop.menu_list.slice(0, 5).map((menu) => menu.name);
  return [
    '라오타',
    'RAOTA',
    'raota',
    '라멘',
    '라멘 맛집',
    '라멘 지도',
    '라멘 추천',
    '라멘 커뮤니티',
    '일본라멘',
    shop.name,
    shop.location,
    shop.address,
    shop.type,
    ...menuNames,
  ].filter(Boolean) as string[];
};

const buildShopJsonLd = (shop: Shop, shopId: number) => {
  const pageUrl = `${SITE_URL}/shop/${shopId}`;
  const title = getShopTitle(shop);
  const menuItems = shop.menu_list.slice(0, 10).map((menu) => ({
    '@type': 'MenuItem',
    name: menu.name,
    image: menu.image_url,
    offers: {
      '@type': 'Offer',
      price: menu.price,
      priceCurrency: 'KRW',
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Restaurant',
        '@id': `${pageUrl}#restaurant`,
        name: title,
        url: pageUrl,
        image: shop.imageUrl,
        description: getShopDescription(shop),
        servesCuisine: ['Ramen', 'Japanese'],
        address: {
          '@type': 'PostalAddress',
          streetAddress: shop.address || shop.location,
          addressLocality: shop.location,
          addressCountry: 'KR',
        },
        openingHoursSpecification:
          shop.business_hours.open_time !== '정보 없음' && shop.business_hours.close_time !== '정보 없음'
            ? [
                {
                  '@type': 'OpeningHoursSpecification',
                  opens: shop.business_hours.open_time,
                  closes: shop.business_hours.close_time,
                },
              ]
            : undefined,
        sameAs: shop.instagram_url ? [shop.instagram_url] : undefined,
        hasMenu:
          menuItems.length > 0
            ? {
                '@type': 'Menu',
                hasMenuItem: menuItems,
              }
            : undefined,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: '라오타',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: '라멘 맛집 지도',
            item: `${SITE_URL}/shops`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: title,
            item: pageUrl,
          },
        ],
      },
    ],
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const shopId = Number(id);

  try {
    // memberId는 0이나 임시값으로 보내 메타데이터만 추출 (비로그인 크롤러 기준)
    const shop = await getRamenShopDetail(shopId);

    const title = getShopTitle(shop);
    const description = getShopDescription(shop);
    const image = shop.imageUrl || '/header-shoplist.jpg';

    return {
      title,
      description,
      keywords: getShopKeywords(shop),
      alternates: {
        canonical: `/shop/${shopId}`,
      },
      openGraph: {
        title: `${title} | 라오타 RAOTA 라멘 지도`,
        description,
        url: `/shop/${shopId}`,
        type: 'article',
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: `${title} 라멘 맛집`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | 라오타 RAOTA`,
        description,
        images: [image],
      },
    };
  } catch (error) {
    return {
      title: '가게 정보를 찾을 수 없습니다',
    };
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const shopId = Number(id);
  const shop = await getRamenShopDetail(shopId);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildShopJsonLd(shop, shopId)) }}
      />
      <ShopDetailClient initialShop={shop} />
    </>
  );
}
