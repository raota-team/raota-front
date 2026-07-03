'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Camera, Check, ChevronDown, Upload, X } from 'lucide-react';
import { getUploadTicket, uploadFileToStorage } from '@/lib/api/files';
import { getRamenShopMenus, getRamenShops } from '@/lib/api/ramen-shops';
import { isRamenLogFallbackImage } from '@/lib/constants/images';

export type RamenLogFormData = {
  shopName: string;
  shopId?: number;
  menuName: string;
  ramenType: string;
  visitedAt: string;
  imageUrl: string;
  imageName: string;
  note: string;
  tasteNotes: TasteNotes;
  revisit: '자주 감' | '가끔 생각남' | '한번이면 충분';
  isPublic: boolean;
};

export type TasteNoteKey = 'broth' | 'noodle' | 'seasoning' | 'topping';
export type TasteNotes = Record<TasteNoteKey, string[]>;

interface RamenLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (data: RamenLogFormData) => void | Promise<void>;
  initialShop?: {
    id: number;
    name: string;
    branchName?: string;
    type?: string;
    menus?: string[];
  };
  initialLog?: RamenLogFormData;
}

const ramenTypes = ['돈코츠', '쇼유', '시오', '미소', '츠케멘', '탄탄멘', '마제소바', '아부라소바', '기타'];
const revisitOptions: RamenLogFormData['revisit'][] = ['자주 감', '가끔 생각남', '한번이면 충분'];
const heicImagePattern = /\.(heic|heif)$/i;
const tasteFields: Array<{ key: TasteNoteKey; label: string; options: string[] }> = [
  { key: 'broth', label: '국물', options: ['진해요', '깔끔해요', '감칠맛 좋아요', '기름져요', '어패류 향'] },
  { key: 'noodle', label: '면', options: ['탄력 있어요', '단단해요', '부드러워요', '국물이 잘 배어요', '양 많아요'] },
  { key: 'seasoning', label: '간', options: ['딱 좋아요', '슴슴해요', '짭짤해요', '매콤해요', '밥 생각나요'] },
  { key: 'topping', label: '토핑', options: ['차슈 좋아요', '계란 좋아요', '멘마 좋아요', '파 향 좋아요', '구성 알차요'] },
];

const getTodayDateInputValue = () => {
  const now = new Date();
  const offsetDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
};

const toDateInputValue = (value?: string) => {
  if (!value) return getTodayDateInputValue();
  return value.slice(0, 10);
};

const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('이미지 압축에 실패했습니다.'));
              return;
            }

            resolve(
              new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.webp', {
                type: 'image/webp',
                lastModified: Date.now(),
              }),
            );
          },
          'image/webp',
          0.8,
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const isHeicImage = (file: File) =>
  heicImagePattern.test(file.name) || ['image/heic', 'image/heif'].includes(file.type);

const convertHeicToJpeg = async (file: File): Promise<File> => {
  const { heicTo, isHeic } = await import('heic-to/csp');

  if (!await isHeic(file)) {
    throw new Error('선택한 파일이 HEIC/HEIF 이미지로 인식되지 않습니다.');
  }

  const blob = await heicTo({
    blob: file,
    type: 'image/jpeg',
    quality: 0.9,
  });

  return new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.jpg', {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
};

export default function RamenLogModal({ isOpen, onClose, onCreate, initialShop, initialLog }: RamenLogModalProps) {
  const [shopName, setShopName] = useState('');
  const [menuName, setMenuName] = useState('');
  const [ramenType, setRamenType] = useState(ramenTypes[0]);
  const [visitedAt, setVisitedAt] = useState(getTodayDateInputValue);
  const [revisit, setRevisit] = useState<RamenLogFormData['revisit']>('자주 감');
  const [note, setNote] = useState('');
  const [tasteNotes, setTasteNotes] = useState<TasteNotes>({
    broth: [],
    noodle: [],
    seasoning: [],
    topping: [],
  });
  const [isTasteDetailsOpen, setIsTasteDetailsOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  // Shop name search API states
  const [shopQuery, setShopQuery] = useState('');
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Menu dropdown states
  const [availableMenus, setAvailableMenus] = useState<string[]>([]);
  const [isCustomMenu, setIsCustomMenu] = useState(false);
  const [isLoadingMenus, setIsLoadingMenus] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const [isConvertingImage, setIsConvertingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollThumb, setScrollThumb] = useState({ height: 0, top: 0, visible: false });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const initialShopName = initialLog?.shopName || (initialShop
      ? `${initialShop.name}${initialShop.branchName ? ` ${initialShop.branchName}` : ''}`
      : '');
    const initialMenus = initialShop?.menus?.filter(Boolean) || [];
    const initialMenuOptions = initialMenus.length > 0
      ? [...initialMenus, '직접 입력']
      : initialShop || initialLog
        ? ['직접 입력']
        : [];

    setShopName(initialShopName);
    setMenuName(initialLog?.menuName || initialMenus[0] || '');
    setRamenType(initialLog?.ramenType || ramenTypes.find((type) => initialShop?.type?.includes(type)) || (initialShop ? '기타' : ramenTypes[0]));
    setVisitedAt(toDateInputValue(initialLog?.visitedAt));
    setRevisit(initialLog?.revisit || '자주 감');
    setNote(initialLog?.note || '');
    setTasteNotes(initialLog?.tasteNotes || { broth: [], noodle: [], seasoning: [], topping: [] });
    setIsTasteDetailsOpen(Boolean(
      initialLog?.note ||
      Object.values(initialLog?.tasteNotes || {}).some((notes) => (notes?.length ?? 0) > 0),
    ));
    setIsPublic(initialLog?.isPublic ?? true);

    setShopQuery(initialShopName);
    setSelectedShopId(initialLog?.shopId || initialShop?.id || null);
    setSearchResults([]);
    setIsSearching(false);
    setShowDropdown(false);

    setAvailableMenus(initialMenuOptions);
    setIsCustomMenu(Boolean(initialLog || (initialShop && initialMenus.length === 0)));
    setIsLoadingMenus(false);

    setSelectedFile(null);
    setPreviewUrl(initialLog?.imageUrl || null);
    setIsImageRemoved(false);
    setIsConvertingImage(false);
    setIsSubmitting(false);
    setIsScrolling(false);
    setScrollThumb({ height: 0, top: 0, visible: false });
  }, [isOpen, initialLog, initialShop]);

  // Debounced API search effect
  useEffect(() => {
    if (!shopQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await getRamenShops({ keyword: shopQuery, size: 5 });
        setSearchResults(res.shops);
      } catch (error) {
        console.error('Failed to search shops:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [shopQuery]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const hasRequiredImage = Boolean(
    selectedFile ||
    (initialLog?.imageUrl && !isImageRemoved && !isRamenLogFallbackImage(initialLog.imageUrl)),
  );
  const displayPreviewUrl = previewUrl && !isImageRemoved && !isRamenLogFallbackImage(previewUrl)
    ? previewUrl
    : null;

  const canSubmit = Boolean(
    selectedShopId &&
    menuName.trim() &&
    ramenType &&
    visitedAt &&
    revisit &&
    note.trim() &&
    hasRequiredImage &&
    !isConvertingImage,
  );

  const getValidationMessage = () => {
    if (!selectedShopId) return '라멘 가게를 선택해주세요.';
    if (!menuName.trim()) return '먹은 메뉴를 입력해주세요.';
    if (!ramenType) return '라멘 종류를 선택해주세요.';
    if (!visitedAt) return '방문일을 선택해주세요.';
    if (!revisit) return '재방문 의사를 선택해주세요.';
    if (isConvertingImage) return '사진 변환이 끝난 뒤 저장해주세요.';
    if (!note.trim()) return '기억해둘 점을 입력해주세요.';
    if (!hasRequiredImage) return '사진을 추가해주세요.';
    return null;
  };

  const readPreview = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string' && reader.result.startsWith('data:image/')) {
        setPreviewUrl(reader.result);
        return;
      }

      setSelectedFile(null);
      setPreviewUrl(null);
      alert('이미지 파일을 읽지 못했습니다. 다른 사진을 선택해주세요.');
    };
    reader.onerror = () => {
      setSelectedFile(null);
      setPreviewUrl(null);
      alert('이미지 파일을 읽지 못했습니다. 다른 사진을 선택해주세요.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPreviewUrl(null);
    setSelectedFile(null);
    setIsImageRemoved(false);

    try {
      setIsConvertingImage(isHeicImage(file));
      const previewableFile = isHeicImage(file) ? await convertHeicToJpeg(file) : file;
      setSelectedFile(previewableFile);
      readPreview(previewableFile);
    } catch (error) {
      console.error('HEIC image conversion failed:', error);
      event.currentTarget.value = '';
      alert('아이폰 HEIC 사진을 변환하지 못했습니다. 사진 앱에서 JPG로 공유하거나 다른 사진을 선택해주세요.');
    } finally {
      setIsConvertingImage(false);
    }
  };

  const handlePreviewError = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    alert('선택한 이미지를 미리보기로 표시할 수 없습니다. JPG, PNG, WebP 이미지로 다시 선택해주세요.');
  };

  const applyMenuOptions = (menuNames: string[]) => {
    const uniqueMenuNames = Array.from(new Set(menuNames.map((name) => name.trim()).filter(Boolean)));

    if (uniqueMenuNames.length > 0) {
      setAvailableMenus([...uniqueMenuNames, '직접 입력']);
      setMenuName(uniqueMenuNames[0]);
      setIsCustomMenu(false);
      return;
    }

    setAvailableMenus(['직접 입력']);
    setMenuName('');
    setIsCustomMenu(true);
  };

  const handleSelectShop = async (shop: any) => {
    const fullName = shop.name + (shop.branch_name ? ` ${shop.branch_name}` : '');
    setShopQuery(fullName);
    setShopName(fullName);
    setSelectedShopId(shop.id);
    setShowDropdown(false);

    const matchedType = ramenTypes.find((type) => shop.type?.includes(type)) || '기타';
    setRamenType(matchedType);
    setAvailableMenus([]);
    setMenuName('');
    setIsCustomMenu(false);
    setIsLoadingMenus(true);

    try {
      const result = await getRamenShopMenus(shop.id);
      applyMenuOptions(result.menuNames);
    } catch (error) {
      console.error('Failed to fetch ramen shop menus:', error);
      applyMenuOptions([]);
    } finally {
      setIsLoadingMenus(false);
    }
  };

  const handleRemoveImage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsConvertingImage(false);
    setIsImageRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleTasteNote = (key: TasteNoteKey, note: string) => {
    setTasteNotes((current) => {
      const currentNotes = current[key];
      const nextNotes = currentNotes.includes(note)
        ? currentNotes.filter((item) => item !== note)
        : [...currentNotes, note];

      return { ...current, [key]: nextNotes };
    });
  };

  const handleScroll = (event: React.UIEvent<HTMLFormElement>) => {
    const target = event.currentTarget;
    const scrollableDistance = target.scrollHeight - target.clientHeight;

    if (scrollableDistance <= 0) {
      setScrollThumb({ height: 0, top: 0, visible: false });
      return;
    }

    const verticalInset = 8;
    const trackHeight = target.clientHeight - verticalInset * 2;
    const thumbHeight = Math.max(32, Math.round((target.clientHeight / target.scrollHeight) * trackHeight));
    const thumbTravel = Math.max(0, trackHeight - thumbHeight);
    const thumbTop = verticalInset + Math.round((target.scrollTop / scrollableDistance) * thumbTravel);

    setIsScrolling(true);
    setScrollThumb({ height: thumbHeight, top: thumbTop, visible: true });

    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      setIsScrolling(false);
      setScrollThumb((current) => ({ ...current, visible: false }));
    }, 900);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationMessage = getValidationMessage();
    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = initialLog?.imageUrl || '';
      let imageName = initialLog?.imageName || '';

      if (selectedFile) {
        const compressedFile = await compressImage(selectedFile);
        const ticket = await getUploadTicket({
          type: 'PROOF',
          extension: 'webp',
          contentType: 'image/webp',
        });
        imageUrl = await uploadFileToStorage(ticket, compressedFile);
        imageName = compressedFile.name;
      }

      await onCreate?.({
        shopName: shopName.trim(),
        shopId: selectedShopId!,
        menuName: menuName.trim(),
        ramenType,
        visitedAt,
        imageUrl,
        imageName,
        note: note.trim(),
        tasteNotes,
        revisit,
        isPublic,
      });
      onClose();
    } catch (error: any) {
      console.error('Ramen log upload failed:', error);
      alert(error.message || '라멘로그 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-[#25282b]/60" onClick={onClose} />

      <div className="relative max-h-[90dvh] w-full max-w-5xl overflow-hidden rounded-t-md border border-stone-200 bg-white animate-scale-in sm:max-h-[92vh] sm:rounded-sm">
        <div className="flex items-center justify-between border-b border-stone-100 bg-white px-4 py-3 sm:px-5 sm:py-4 md:px-6">
          <div>
            <h2 className="text-base font-black text-stone-900 sm:text-lg">{initialLog ? '라멘로그 수정' : '라멘로그 쓰기'}</h2>
            <p className="mt-0.5 text-[11px] font-medium text-stone-500 sm:text-xs">
              메뉴, 재방문 의사와 기억해둘 점을 남겨주세요.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 transition-colors hover:border-[#e60000] hover:text-[#e60000]"
            aria-label="라멘로그 모달 닫기"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        <div className="relative">
          <form
            onSubmit={handleSubmit}
            onScroll={handleScroll}
            className="grid max-h-[calc(90dvh-3.75rem)] overflow-y-auto [scrollbar-color:transparent_transparent] [scrollbar-width:none] sm:max-h-[calc(92vh-4.5rem)] md:grid-cols-[minmax(18rem,0.85fr)_minmax(0,1.15fr)] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0"
          >
            <section className="border-b border-stone-200 bg-stone-50 p-4 sm:p-5 md:border-b-0 md:border-r md:p-6">
              <div>
                <div className="mb-2 flex items-center gap-2 sm:mb-3">
                  <span className="text-[10px] font-black uppercase text-[#e60000]">필수</span>
                  <label className="text-xs font-bold uppercase text-stone-500">
                    사진 추가
                  </label>
                </div>
                <label className="group relative block aspect-[16/9] cursor-pointer overflow-hidden rounded-sm border border-dashed border-stone-300 bg-white transition-colors hover:border-[#e60000] sm:aspect-[4/3] md:aspect-[3/2]">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isConvertingImage}
                    className="sr-only"
                  />
                  {displayPreviewUrl ? (
                    <div className="absolute inset-0">
                      <img
                        src={displayPreviewUrl}
                        alt="라멘로그 미리보기"
                        className="h-full w-full object-cover"
                        onError={handlePreviewError}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-[#25282b]/75 text-white transition-colors hover:bg-[#e60000] focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label="선택한 사진 제거"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute inset-0 flex items-center justify-center bg-[#25282b]/60 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex items-center rounded-sm border border-white/30 bg-[#25282b] px-4 py-2 text-sm font-bold text-white">
                          <Camera className="mr-2 h-4 w-4" /> 사진 변경하기
                        </div>
                      </div>
                    </div>
                  ) : isConvertingImage ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-stone-500">
                      <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-[#e60000]" />
                      <span className="text-xs font-bold sm:text-sm">아이폰 사진 변환 중</span>
                      <span className="mt-1 text-xs leading-5">잠시 후 미리보기가 표시됩니다.</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-stone-400 group-hover:text-stone-500">
                      <div className="mb-2 rounded-sm border border-stone-200 bg-stone-100 p-2.5 transition-colors group-hover:border-[#e60000] group-hover:text-[#e60000] sm:mb-3 sm:p-3">
                        <Upload className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <span className="text-xs font-bold sm:text-sm">사진을 추가해주세요</span>
                      <span className="mt-1 text-xs leading-5">사진이 있어야 라멘로그를 저장할 수 있어요.</span>
                    </div>
                  )}
                </label>
              </div>
            </section>

            <div className="space-y-5 p-4 sm:space-y-6 sm:p-5 md:space-y-4 md:p-5">
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-[#e60000]">필수</span>
                  <span className="text-xs font-bold uppercase text-stone-500">한 그릇 기록</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(16rem,0.7fr)]">
                  <div className="relative">
                    <label className="mb-2 block text-xs font-bold uppercase text-stone-500">가게 이름 <span className="text-[#e60000]">*</span></label>
                    <input
                      type="text"
                      value={shopQuery}
                      onChange={(event) => {
                        setShopQuery(event.target.value);
                        setShopName(event.target.value);
                        setSelectedShopId(null);
                        setRamenType('기타');
                        setAvailableMenus([]);
                        setIsCustomMenu(false);
                        setMenuName('');
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      onBlur={() => {
                        setTimeout(() => setShowDropdown(false), 200);
                      }}
                      placeholder="예: 멘야 하루"
                      className="w-full border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 outline-none transition-colors placeholder:text-stone-400 focus:border-[#e60000]"
                    />
                    {showDropdown && shopQuery.trim() !== '' && (
                      <div className="absolute left-0 right-0 z-30 mt-1 max-h-60 overflow-y-auto border border-stone-200 bg-white shadow-lg rounded-sm">
                        {isSearching ? (
                          <div className="p-3 text-xs text-stone-400">검색 중...</div>
                        ) : searchResults.length > 0 ? (
                          searchResults.map((shop) => (
                            <button
                              key={shop.id}
                              type="button"
                              onClick={() => { void handleSelectShop(shop); }}
                              className="flex w-full flex-col px-4 py-2.5 text-left text-sm transition-colors hover:bg-stone-50"
                            >
                              <span className="font-bold text-stone-800">
                                {shop.name} {shop.branch_name && <span className="text-xs font-medium text-stone-400">({shop.branch_name})</span>}
                              </span>
                              <span className="text-xs text-stone-400 mt-0.5">{shop.location || shop.address}</span>
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-xs text-stone-400">검색 결과가 없습니다. 직접 입력할 수 있습니다.</div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="ramen-log-visited-at" className="mb-2 block text-xs font-bold uppercase text-stone-500">
                      방문일 <span className="text-[#e60000]">*</span>
                    </label>
                    <input
                      id="ramen-log-visited-at"
                      type="date"
                      value={visitedAt}
                      max={getTodayDateInputValue()}
                      onChange={(event) => setVisitedAt(event.target.value)}
                      className="w-full border border-stone-200 bg-white px-3 py-3 text-sm font-bold text-stone-700 outline-none transition-colors focus:border-[#e60000]"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-stone-500">먹은 메뉴 <span className="text-[#e60000]">*</span></label>
                    <div className="space-y-2">
                      <MenuSelect
                        value={isCustomMenu ? '직접 입력' : menuName}
                        options={availableMenus}
                        onChange={(val) => {
                          if (val === '직접 입력') {
                            setIsCustomMenu(true);
                            setMenuName('');
                          } else {
                            setIsCustomMenu(false);
                            setMenuName(val);
                          }
                        }}
                        disabled={!shopName.trim() || isLoadingMenus}
                        disabledLabel={isLoadingMenus ? '메뉴 불러오는 중' : undefined}
                      />
                      {isCustomMenu && shopName.trim() && (
                        <input
                          type="text"
                          value={menuName}
                          onChange={(event) => setMenuName(event.target.value)}
                          placeholder="직접 먹은 메뉴 이름을 입력하세요"
                          className="w-full border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 outline-none transition-colors placeholder:text-stone-400 focus:border-[#e60000]"
                        />
                      )}
                    </div>
                  </div>



                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-stone-500">재방문 의사</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {revisitOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setRevisit(option)}
                          className={`min-h-11 min-w-0 whitespace-nowrap rounded-sm border px-1 text-[10px] font-black leading-tight transition-colors sm:px-1.5 sm:text-[11px] md:px-2 md:text-xs ${revisit === option
                              ? 'border-[#e60000] bg-[#e60000] text-white'
                              : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
                            }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <label htmlFor="ramen-log-note" className="mb-2 block text-xs font-bold uppercase text-stone-500">
                  기억해둘 점 <span className="text-[#e60000]">*</span>
                </label>
                <textarea
                  id="ramen-log-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value.slice(0, 200))}
                  placeholder="예: 카라이 변경이 잘 어울렸고 다음엔 면을 단단하게 부탁하기"
                  className="min-h-24 w-full resize-none border border-stone-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-stone-700 outline-none transition-colors placeholder:text-stone-400 focus:border-[#e60000] md:min-h-20"
                  maxLength={200}
                  rows={3}
                  required
                />
                <div className="mt-1 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-medium text-stone-400">나중에 다시 떠올릴 한 줄이면 충분해요.</span>
                  <span className="font-mono text-xs text-stone-400">{note.length}/200</span>
                </div>
              </section>

              <details
                className="group overflow-hidden rounded-sm border border-stone-200 bg-stone-50"
                open={isTasteDetailsOpen}
                onToggle={(event) => setIsTasteDetailsOpen(event.currentTarget.open)}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 md:py-3">
                  <span>
                    <span className="block text-sm font-black text-[#25282b]">맛을 더 남길까요?</span>
                    <span className="mt-0.5 block text-[11px] font-medium text-stone-400">
                      기존 국물·면·간·토핑 기록을 선택해서 남길 수 있어요.
                    </span>
                  </span>
                  <span className="text-xl font-light text-stone-400 transition-transform group-open:rotate-45">+</span>
                </summary>

                <div className="space-y-5 border-t border-stone-200 bg-white p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {tasteFields.map((field) => (
                      <div key={field.key} className="rounded-sm border border-stone-200 bg-stone-50 p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-sm font-black text-[#25282b]">{field.label}</span>
                          <span className="text-[10px] font-black text-stone-400">{tasteNotes[field.key].length}개</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {field.options.map((option) => {
                            const isSelected = tasteNotes[field.key].includes(option);
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => toggleTasteNote(field.key, option)}
                                className={`rounded-full border px-3 py-1.5 text-xs font-black transition-colors ${isSelected
                                    ? 'border-[#e60000] bg-white text-[#e60000]'
                                    : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
                                  }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </details>

              <section className="border-t border-stone-200 pt-5 md:pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500">내 기록 공개하기</label>
                    <p className="mt-0.5 text-[11px] font-medium text-stone-400">비공개로 설정하면 피드에 노출되지 않고 나만 볼 수 있습니다.</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="relative h-6 w-11 rounded-full bg-stone-200 transition-colors peer-checked:bg-[#e60000] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5"></div>
                  </label>
                </div>
              </section>

              <button
                type="submit"
                disabled={isSubmitting || !canSubmit}
                className={`flex w-full items-center justify-center gap-2 rounded-sm py-4 font-bold text-white transition-opacity active:opacity-90 ${isSubmitting || !canSubmit ? 'cursor-not-allowed bg-stone-300' : 'bg-[#e60000] hover:opacity-90'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>저장 중...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    <span>{initialLog ? '수정 내용 저장하기' : '라멘로그 저장하기'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute right-0.5 top-0 w-1.5 rounded-full bg-stone-400/75 transition-opacity duration-200 ${isScrolling && scrollThumb.visible ? 'opacity-100' : 'opacity-0'
              }`}
            style={{
              height: scrollThumb.height,
              transform: `translateY(${scrollThumb.top}px)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function MenuSelect({
  value,
  options,
  onChange,
  disabled = false,
  disabledLabel = "가게를 먼저 선택해주세요",
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  disabledLabel?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (nextValue: string) => {
    if (disabled) return;
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="group relative rounded-sm transition-all w-full"
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
        className={`w-full rounded-sm border bg-white px-3 py-2.5 pr-10 text-left text-sm font-bold text-[#25282b] outline-none transition-colors md:px-4 md:py-3 md:pr-11 ${disabled
            ? "cursor-not-allowed border-stone-200 bg-stone-50 text-stone-400"
            : isOpen
              ? "border-[#e60000] bg-white"
              : "border-stone-200 hover:border-[#e60000]"
        }`}
      >
        <span className="block truncate whitespace-nowrap pr-2">
          {disabled ? disabledLabel : value || "메뉴를 선택해주세요"}
        </span>
      </button>
      <ChevronDown
        className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-all md:right-4 ${disabled
            ? "text-stone-300"
            : isOpen
              ? "rotate-180 text-[#e60000]"
              : "text-stone-400 group-hover:text-[#e60000]"
          }`}
      />
      {isOpen && !disabled && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-sm border border-stone-200 bg-white p-2 shadow-none"
        >
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => {
              const isSelected = option === value;
              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option)}
                  className={`flex w-full items-center justify-between rounded-sm px-3 py-2.5 text-left text-sm font-bold transition-colors md:px-4 md:py-3 ${isSelected
                      ? "bg-[#e60000] text-white"
                      : "text-stone-700 hover:bg-stone-50 hover:text-[#25282b]"
                    }`}
                >
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
