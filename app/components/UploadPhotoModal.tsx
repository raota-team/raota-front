'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Check, ChevronDown, Camera } from 'lucide-react';
import { getUploadTicket, uploadFileToStorage } from '@/lib/api/files';

interface MenuItem {
  id?: number;
  name: string;
  price?: number;
  is_signature?: boolean;
  image_url?: string;
}

interface UploadedPhotoData {
  menuName: string;
  imageUrl: string;
  imageName: string;
  description: string; // API 스펙에 맞춰 comment에서 description으로 변경
}

interface UploadPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
  menuList?: MenuItem[];
  onUpload?: (data: UploadedPhotoData) => Promise<void>;
}

/** 클라이언트 사이드 이미지 압축 함수 (WebP) */
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new (window as any).Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Canvas to Blob failed'));
            }
          },
          'image/webp',
          0.8
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const UploadPhotoModal: React.FC<UploadPhotoModalProps> = ({ isOpen, onClose, shopName, menuList, onUpload }) => {
  const [selectedMenu, setSelectedMenu] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedMenu('');
      setDescription('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMenu || !selectedFile) {
      alert('메뉴를 선택하고 사진을 업로드해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 0단계: 이미지 압축 (WebP)
      const compressedFile = await compressImage(selectedFile);

      // 1단계: 티켓 발급
      const ticket = await getUploadTicket({
        type: 'PROOF',
        extension: 'webp',
        contentType: 'image/webp'
      });

      // 2단계: 저장소 직접 업로드
      const finalImgUrl = await uploadFileToStorage(ticket, compressedFile);

      // 3단계 준비: 상위 컴포넌트로 데이터 전달
      if (onUpload) {
        await onUpload({
          menuName: selectedMenu,
          imageUrl: finalImgUrl,
          imageName: compressedFile.name,
          description,
        });
      }
      onClose();
    } catch (error: any) {
      console.error('Upload process failed:', error);
      alert(error.message || '사진 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>

      <div className="relative w-full max-w-md overflow-hidden rounded-sm border border-stone-200 bg-white animate-scale-in">
        <div className="flex items-center justify-between border-b border-stone-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-black text-stone-900">사진 올리기</h2>
            <p className="mt-0.5 text-xs font-medium text-stone-500">{shopName}</p>
          </div>
          <button onClick={onClose} className="rounded-full border border-stone-200 bg-white p-1 text-stone-400 transition-colors hover:border-[#e60000] hover:text-[#e60000]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e60000]">Step 1</span>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">사진 업로드 <span className="text-red-500">*</span></label>
            </div>
            <div className="group relative aspect-video cursor-pointer overflow-hidden rounded-sm border border-dashed border-stone-300 bg-white transition-colors hover:border-[#e60000] hover:bg-stone-50">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />
              {previewUrl ? (
                <div className="absolute inset-0">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-[#25282b]/55 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex items-center rounded-sm border border-white/30 bg-[#25282b] px-4 py-2 text-sm font-bold text-white">
                      <Camera className="w-4 h-4 mr-2" /> 사진 변경하기
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 group-hover:text-stone-500">
                  <div className="mb-3 rounded-sm border border-stone-200 bg-stone-100 p-3 transition-colors group-hover:border-[#e60000] group-hover:text-[#e60000]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium">먼저 사진을 선택해주세요</span>
                  <span className="text-xs mt-1">업로드 후 메뉴를 고를 수 있어요</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e60000]">Step 2</span>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">메뉴 선택 <span className="text-red-500">*</span></label>
            </div>
            <div className="relative">
              <select
                value={selectedMenu}
                onChange={(e) => setSelectedMenu(e.target.value)}
                disabled={!selectedFile}
                className="w-full appearance-none border border-stone-200 bg-white px-4 py-3 pr-8 text-base font-medium text-stone-700 outline-none transition-colors focus:border-[#e60000] disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-400"
              >
                <option value="" disabled>{selectedFile ? '어떤 메뉴를 드셨나요?' : '사진을 먼저 선택해주세요'}</option>
                {menuList?.map((menu) => (
                  <option key={menu.name} value={menu.name}>
                    {menu.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-4">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">한줄평 (선택)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="맛은 어떠셨나요?"
              className="w-full border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 outline-none transition-colors placeholder:text-stone-400 focus:border-[#e60000]"
              maxLength={100}
            />
            <div className="text-right mt-1">
              <span className="text-xs text-stone-400 font-mono">{description.length}/100</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !selectedMenu || !selectedFile}
            className={`flex w-full items-center justify-center space-x-2 rounded-sm py-4 font-bold text-white transition-opacity active:opacity-90 ${isSubmitting || !selectedMenu || !selectedFile
                ? 'cursor-not-allowed bg-stone-300'
                : 'bg-[#e60000] hover:opacity-90'
              }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>업로드 중...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>사진 올리기</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPhotoModal;
