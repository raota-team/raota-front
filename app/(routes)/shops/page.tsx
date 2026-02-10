'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ShopCard from '../../components/ShopCard';

export default function ShopsListPage() {
  const { shops, getTotalVotes } = useApp();
  const [activeRegion, setActiveRegion] = useState('All');
  const [activeType, setActiveType] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  const regions = ['All', '서울', '부산', '인천', '제주'];
  const types = ['All', '돈코츠', '쇼유', '미소', '시오', '츠케멘', '탄탄멘'];

  const filteredShops = shops
    .filter(shop => {
      const matchesRegion = activeRegion === 'All' || shop.location.includes(activeRegion);
      const matchesType = activeType === 'All' || shop.type?.includes(activeType);
      const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.location?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRegion && matchesType && (searchQuery === '' || matchesSearch);
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'ko');
      } else if (sortBy === 'popular') {
        return getTotalVotes(b) - getTotalVotes(a);
      }
      return 0;
    });

  return (
    <div className="min-h-[60vh]">
      {/* Page Header */}
      <div className="mb-8 relative rounded-2xl overflow-hidden shadow-lg h-48 md:h-80">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: "url('/header-shoplist.jpg')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30"></div>
        <div className="relative z-10 px-6 h-full flex flex-col justify-center items-center text-center text-white">
          <div className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-wider uppercase bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
            Ramen Shop List
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-stone-300 drop-shadow-sm">
            라멘 가게 리스트
          </h1>
          <p className="text-stone-300 max-w-lg mx-auto font-medium">
            전국의 인기 라멘 맛집을 탐색하고 나만의 인생 라멘을 찾아보세요
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-3 md:p-4 mb-3">
        <input
          type="text"
          placeholder="가게 이름 또는 주소로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all text-sm"
        />
      </div>

      {/* Collapsible Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-stone-200 mb-6">
        <div
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          className="p-3 md:p-4 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors"
        >
          <h3 className="text-sm font-bold text-stone-700">보기 옵션</h3>
          <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${isFilterExpanded ? 'rotate-180' : ''}`} />
        </div>

        {isFilterExpanded && (
          <div className="px-3 pb-3 md:px-4 md:pb-4 space-y-3 border-t border-stone-100">
            {/* Region Filter */}
            <div className="pt-3">
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">지역</label>
              <div className="flex flex-wrap gap-2">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => setActiveRegion(region)}
                    className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${activeRegion === region
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                  >
                    {region === 'All' ? '전체' : region}
                  </button>
                ))}
              </div>
            </div>

            {/* Ramen Type Filter */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">라멘 종류</label>
              <div className="flex flex-wrap gap-2">
                {types.map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveType(type)}
                    className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${activeType === type
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                  >
                    {type === 'All' ? '전체' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">정렬</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSortBy('default')}
                  className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all ${sortBy === 'default' ? 'bg-red-600 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                >
                  기본순
                </button>
                <button
                  onClick={() => setSortBy('name')}
                  className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all ${sortBy === 'name' ? 'bg-red-600 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                >
                  이름순
                </button>
                <button
                  onClick={() => setSortBy('popular')}
                  className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all ${sortBy === 'popular' ? 'bg-red-600 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                >
                  인기순
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-stone-600">
          <span className="font-bold text-red-600">{filteredShops.length}</span>개의 가게
        </p>
        <Link href="/" className="text-sm text-stone-400 hover:text-stone-600 transition-colors">
          ← 홈으로 돌아가기
        </Link>
      </div>

      {/* Shop Grid */}
      {filteredShops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map(shop => (
            <ShopCard key={shop.id} shop={shop} getTotalVotes={getTotalVotes} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🍜</div>
          <h3 className="text-xl font-bold text-stone-700 mb-2">검색 결과가 없습니다</h3>
          <p className="text-stone-500">다른 검색어나 지역을 선택해보세요</p>
        </div>
      )}
    </div>
  );
}
