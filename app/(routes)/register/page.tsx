'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ChevronRight, Check, Loader2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { updateUserProfile } from '@/lib/api/user';
import { getUploadTicket, uploadFileToStorage } from '@/lib/api/files';
import { compressImage } from '@/lib/utils/image-optimization';

export default function RegisterPage() {
  const router = useRouter();
  const { completeRegistration, showToast } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    nickname: '',
    bio: '',
    agreeTerms: false,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('이미지 크기는 10MB 이하여야 합니다.', 'error');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nickname || !formData.agreeTerms) return;
    
    setIsLoading(true);

    try {
      let finalImageUrl = '';

      // 1. 이미지가 있다면 압축 후 업로드
      if (selectedFile) {
        const compressed = await compressImage(selectedFile);
        const ticket = await getUploadTicket({
          type: 'PROFILE',
          extension: 'webp',
          contentType: 'image/webp'
        });
        finalImageUrl = await uploadFileToStorage(ticket, compressed);
      }

      // 2. 백엔드 회원가입(프로필 설정) API 호출
      await updateUserProfile({
        nickname: formData.nickname,
        bio: formData.bio,
        profile_image_url: finalImageUrl,
        background_image_url: '',
      });

      // 3. 프론트엔드 로그인 상태 동기화 및 newMember 플래그 해제
      completeRegistration();
      
      // 4. 로그인 전 작성 중이던 작업이 있으면 해당 화면으로 복귀
      const returnTo = sessionStorage.getItem('raota_login_return_to');
      sessionStorage.removeItem('raota_login_return_to');
      router.push(returnTo?.startsWith('/') ? returnTo : '/');
      showToast('반갑습니다! 회원가입이 완료되었습니다.', 'success');
    } catch (error: any) {
      console.error('Registration failed:', error);
      showToast(error.message || '회원가입 처리 중 문제가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-lg">
        <div className="overflow-hidden rounded-sm border border-stone-200 bg-white">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-black tracking-tight text-[#25282b]">
                반가워요! <br/> 기본 정보를 알려주세요
              </h1>
              <p className="text-sm font-medium text-[#7e7e7e]">
                라오타에서 사용하실 닉네임과 프로필을 설정합니다.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center">
                  <div 
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-stone-100 transition-colors group-hover:border-[#e60000]">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="h-8 w-8 text-stone-400 transition-colors group-hover:text-[#e60000]" />
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-[#25282b] p-1.5 text-white">
                      <Camera className="w-3 h-3" />
                    </div>
                    {previewUrl && (
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute -right-1 -top-1 rounded-full border border-stone-200 bg-white p-1 text-stone-400 transition-colors hover:text-[#e60000]"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                  />
                  <span className="text-xs text-stone-400 mt-3 font-bold uppercase tracking-widest">프로필 이미지 등록</span>
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">닉네임</label>
                  <input
                    type="text"
                    required
                    placeholder="라멘을사랑하는사람"
                    className="w-full rounded-sm border border-stone-200 bg-white px-4 py-3.5 font-bold transition-colors focus:border-[#e60000] focus:outline-none"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  />
                  <p className="ml-1 mt-2 text-[11px] font-medium text-stone-400">한글, 영문, 숫자 조합 2~12자 이내</p>
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-400 uppercase tracking-widest mb-2">한줄 소개 (선택)</label>
                  <textarea
                    placeholder="라멘에 진심인 편입니다."
                    className="min-h-[100px] w-full resize-none rounded-sm border border-stone-200 bg-white px-4 py-3.5 text-sm transition-colors focus:border-[#e60000] focus:outline-none"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <label className="flex items-start space-x-3 cursor-pointer group">
                    <div className="relative flex items-center mt-0.5">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={formData.agreeTerms}
                        onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                      />
                      <div className="flex h-5 w-5 items-center justify-center rounded-sm border border-stone-300 transition-colors peer-checked:border-[#e60000] peer-checked:bg-[#e60000]">
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      </div>
                    </div>
                    <span className="text-sm text-stone-500 leading-tight">
                      <span className="text-stone-800 font-bold">이용약관 및 개인정보처리방침</span>에 동의합니다 (필수)
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!formData.nickname || !formData.agreeTerms || isLoading}
                  className="flex w-full items-center justify-center space-x-2 rounded-sm bg-[#e60000] py-4 text-sm font-black uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  ) : (
                    <>
                      <span>회원가입 완료</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
