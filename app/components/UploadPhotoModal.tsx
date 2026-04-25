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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <div>
            <h2 className="text-lg font-bold text-stone-900">사진 올리기</h2>
            <p className="text-xs text-stone-500 font-mono mt-0.5">{shopName}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors p-1 hover:bg-stone-200 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">메뉴 선택 <span className="text-red-500">*</span></label>
            <div className="relative">
              <select
                value={selectedMenu}
                onChange={(e) => setSelectedMenu(e.target.value)}
                className="w-full appearance-none bg-stone-50 border border-stone-200 text-stone-700 py-3 px-4 pr-8 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium text-base"
              >
                <option value="" disabled>어떤 메뉴를 드셨나요?</option>
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

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">사진 업로드 <span className="text-red-500">*</span></label>
            <div className="relative aspect-video rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 hover:bg-stone-100 hover:border-stone-400 transition-all group cursor-pointer overflow-hidden">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {previewUrl ? (
                <div className="absolute inset-0">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-bold flex items-center">
                      <Camera className="w-4 h-4 mr-2" /> 사진 변경하기
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 group-hover:text-stone-500">
                  <div className="p-3 bg-stone-200 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium">여기를 클릭하여 사진 선택</span>
                  <span className="text-xs mt-1">또는 파일을 드래그하세요</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">한줄평 (선택)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="맛은 어떠셨나요?"
              className="w-full bg-stone-50 border border-stone-200 text-stone-700 py-3 px-4 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all font-medium text-sm placeholder:text-stone-400"
              maxLength={100}
            />
            <div className="text-right mt-1">
              <span className="text-xs text-stone-400 font-mono">{description.length}/100</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !selectedMenu || !selectedFile}
            className={`w-full py-4 rounded-lg font-bold text-white shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] ${isSubmitting || !selectedMenu || !selectedFile
                ? 'bg-stone-300 cursor-not-allowed shadow-none'
                : 'bg-red-600 hover:bg-red-700 hover:shadow-xl'
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
