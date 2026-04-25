import { Metadata } from 'next';
import { getRamenShopDetail } from '@/lib/api/ramen-shops';
import ShopDetailClient from './ShopDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const shopId = Number(id);

  try {
    // memberId는 0이나 임시값으로 보내 메타데이터만 추출 (비로그인 크롤러 기준)
    const shop = await getRamenShopDetail(shopId);

    const title = `${shop.name} ${shop.branch_name || ''}`;
    const description = `${shop.location} 라멘 맛집 | ${shop.type} 전문 | ${shop.description.substring(0, 100)}`;

    return {
      title,
      description,
      openGraph: {
        title: `${title} - RAOTA 라멘 지도`,
        description,
        images: shop.imageUrl ? [shop.imageUrl] : ['/header-shoplist.jpg'],
      },
    };
  } catch (error) {
    return {
      title: '가게 정보를 찾을 수 없습니다',
    };
  }
}

export default async function Page({ params }: Props) {
  return <ShopDetailClient params={params} />;
}
