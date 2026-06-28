import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getRamenShopDetail } from '@/lib/api/ramen-shops';
import ShopDetailClient from './ShopDetailClient';
import type { Shop } from '@/app/types';

interface Props {
  params: Promise<{ id: string }>;
}

const SITE_URL = 'https://www.raota.net';
const DEFAULT_SHOP_IMAGE = '/header-shoplist.jpg';

const getCachedRamenShopDetail = cache((shopId: number) => getRamenShopDetail(shopId));

const compactText = (value?: string | null) => (value || '').replace(/\s+/g, ' ').trim();

const toAbsoluteUrl = (url?: string | null) => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  return `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const truncateText = (value: string, maxLength: number) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
};

const isKnownValue = (value?: string | null) => {
  const normalized = compactText(value);
  return Boolean(normalized && normalized !== '정보 없음' && normalized !== '주소 정보 없음' && normalized !== '위치 정보 없음');
};

const getShopTitle = (shop: Shop) =>
  compactText([shop.name, shop.branch_name].filter(Boolean).join(' '));

const getPrimaryArea = (shop: Shop) => {
  const source = isKnownValue(shop.location) ? shop.location : shop.address;
  const [city, district] = compactText(source).split(/\s+/);
  return [city, district].filter(Boolean).join(' ');
};

const getPrimaryMenus = (shop: Shop, maxCount = 3) => {
  const signatureMenus = shop.menu_list.filter((menu) => menu.is_signature).map((menu) => menu.name);
  const regularMenus = shop.menu_list.map((menu) => menu.name);
  return Array.from(new Set([...signatureMenus, ...regularMenus]))
    .filter(Boolean)
    .slice(0, maxCount);
};

const getSeoTitle = (shop: Shop) => {
  const title = getShopTitle(shop);
  const area = getPrimaryArea(shop);
  const type = compactText(shop.type).split(',')[0]?.trim();
  const suffix = [area, type].filter(Boolean).join(' ');
  const baseTitle = suffix ? `${title} ${suffix} 메뉴·영업시간·후기` : `${title} 메뉴·영업시간·후기`;

  return truncateText(baseTitle, 58);
};

const getShopDescription = (shop: Shop) => {
  const location = isKnownValue(shop.location) ? shop.location : shop.address || '국내';
  const primaryMenus = getPrimaryMenus(shop).join(', ');
  const menuText = primaryMenus ? `대표 메뉴 ${primaryMenus}, ` : '대표 메뉴와 ';
  const shopDescription = compactText(shop.description);

  return truncateText(
    compactText(
      `${location} 라멘 맛집 ${shop.name}. ${shop.type} 일본라멘, ${menuText}후기, 영업정보를 라오타(RAOTA) 라멘 지도에서 확인해보세요. ${shopDescription}`,
    ),
    155,
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

const getPriceRange = (shop: Shop) => {
  const prices = shop.menu_list
    .map((menu) => menu.price)
    .filter((price) => Number.isFinite(price) && price > 0);

  if (prices.length === 0) return undefined;

  const minPrice = Math.min(...prices).toLocaleString('ko-KR');
  const maxPrice = Math.max(...prices).toLocaleString('ko-KR');
  return minPrice === maxPrice ? `${minPrice}원` : `${minPrice}원-${maxPrice}원`;
};

const getOpeningHours = (shop: Shop) => {
  const { open_time: opens, close_time: closes } = shop.business_hours;
  if (!isKnownValue(opens) || !isKnownValue(closes)) return undefined;

  return [
    {
      '@type': 'OpeningHoursSpecification',
      opens,
      closes,
    },
  ];
};

const buildShopJsonLd = (shop: Shop, shopId: number) => {
  const pageUrl = `${SITE_URL}/shop/${shopId}`;
  const title = getShopTitle(shop);
  const menuItems = shop.menu_list.slice(0, 10).map((menu) => ({
    '@type': 'MenuItem',
    name: menu.name,
    image: toAbsoluteUrl(menu.image_url),
    offers:
      menu.price > 0
        ? {
            '@type': 'Offer',
            price: menu.price,
            priceCurrency: 'KRW',
          }
        : undefined,
  }));
  const image = toAbsoluteUrl(shop.imageUrl) || toAbsoluteUrl(DEFAULT_SHOP_IMAGE);
  const description = getShopDescription(shop);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Restaurant',
        '@id': `${pageUrl}#restaurant`,
        name: title,
        url: pageUrl,
        mainEntityOfPage: pageUrl,
        image,
        description,
        servesCuisine: ['Ramen', 'Japanese'],
        priceRange: getPriceRange(shop),
        address: {
          '@type': 'PostalAddress',
          streetAddress: isKnownValue(shop.address) ? shop.address : shop.location,
          addressLocality: getPrimaryArea(shop) || shop.location,
          addressCountry: 'KR',
        },
        openingHoursSpecification: getOpeningHours(shop),
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
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${title} 메뉴·영업시간·후기`,
        description,
        inLanguage: 'ko-KR',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${SITE_URL}#website`,
          name: '라오타 RAOTA',
          url: SITE_URL,
        },
        about: {
          '@id': `${pageUrl}#restaurant`,
        },
        breadcrumb: {
          '@id': `${pageUrl}#breadcrumb`,
        },
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

  if (!Number.isFinite(shopId)) {
    return {
      title: '가게 정보를 찾을 수 없습니다',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  try {
    // memberId는 0이나 임시값으로 보내 메타데이터만 추출 (비로그인 크롤러 기준)
    const shop = await getCachedRamenShopDetail(shopId);

    const title = getSeoTitle(shop);
    const shopTitle = getShopTitle(shop);
    const description = getShopDescription(shop);
    const image = toAbsoluteUrl(shop.imageUrl) || DEFAULT_SHOP_IMAGE;

    return {
      title,
      description,
      keywords: getShopKeywords(shop),
      alternates: {
        canonical: `/shop/${shopId}`,
      },
      openGraph: {
        title: `${shopTitle} | 라오타 RAOTA 라멘 지도`,
        description,
        url: `/shop/${shopId}`,
        type: 'website',
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: `${shopTitle} 라멘 맛집`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${shopTitle} | 라오타 RAOTA`,
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

  if (!Number.isFinite(shopId)) {
    notFound();
  }

  let shop: Shop;
  try {
    shop = await getCachedRamenShopDetail(shopId);
  } catch {
    notFound();
  }

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
